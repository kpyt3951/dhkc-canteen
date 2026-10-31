import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { serverDataStore } from './server/dataStore.ts';
import { authenticateTeacher, authenticateTeacherByPin, verifyTeacherToken, revokeTeacherToken, OFFICIAL_TEACHER_PASSWORD, setCustomTeacherPassword } from './server/auth.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function bootstrap() {
  const app = express();

  // Basic middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // CORS headers to permit standalone teacher web access & custom domain access
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Helper to extract bearer token
  const getBearerToken = (req: Request): string => {
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7).trim();
    }
    return '';
  };

  // ==================== REST API ENDPOINTS ====================

  // 1. Health check & store summary
  app.get('/api/health', (_req: Response | any, res: Response) => {
    const students = serverDataStore.getAllStudents();
    res.json({
      status: 'ok',
      service: 'DHKC CANTEEN & Student Remarks Central Backend',
      version: '3.0.0',
      totalStudents: students.length,
      timestamp: new Date().toISOString()
    });
  });

  // App Configuration (Returns standalone shared app URL without AI studio wrappers)
  app.get('/api/app-config', (_req: Request, res: Response) => {
    const rawAppUrl = process.env.APP_URL || '';
    const sharedAppUrl = rawAppUrl.replace('ais-dev-', 'ais-pre-') || 'https://ais-pre-we7bk24s6gh6ph5tnom2q3-388743997822.asia-southeast1.run.app';
    res.json({
      sharedAppUrl,
      devAppUrl: rawAppUrl,
      customDomain: 'www.dhkc-canteen.com',
      appletId: process.env.APPLET_ID || 'ff197c83-cd44-4ecc-8e5d-8ec7a4015bfb'
    });
  });

  // 2. Teacher Authentication (Master "teacher@dhkc" or customized password)
  app.post('/api/auth/teacher-login', (req: Request, res: Response) => {
    const { name, position, email, password, pin } = req.body || {};
    const pass = password !== undefined ? password : (pin || '');
    const result = authenticateTeacher({
      name: name || '',
      position: position || '',
      email: email || '',
      password: pass
    });
    if (!result.success) {
      res.status(401).json({ success: false, error: result.error });
      return;
    }

    // Automatically dispatch and log Security Alert to dhiuhc@gmail.com
    serverDataStore.recordSecurityAlert({
      eventType: 'TEACHER_LOGIN',
      title: 'Teacher Login Successful',
      details: `Teacher ${result.teacher?.name} (${result.teacher?.position}) signed in to Remarks Portal with email: ${result.teacher?.email}.`,
      teacherName: result.teacher?.name,
      teacherEmail: result.teacher?.email
    });

    res.json(result);
  });

  // 3. Customize / Change Teacher Password
  app.post('/api/auth/teacher-change-password', (req: Request, res: Response) => {
    const { email, name, position, currentPassword, newPassword } = req.body || {};
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanNewPass = (newPassword || '').trim();

    if (!cleanNewPass || cleanNewPass.length < 4) {
      res.status(400).json({ success: false, error: 'Password must be at least 4 characters long.' });
      return;
    }

    const setRes = setCustomTeacherPassword(cleanEmail, cleanNewPass);
    if (!setRes.success) {
      res.status(400).json({ success: false, error: setRes.error });
      return;
    }

    // Dispatch Security Alert to dhiuhc@gmail.com
    serverDataStore.recordSecurityAlert({
      eventType: 'PASSWORD_CHANGE',
      title: 'Teacher Customized Password',
      details: `Teacher ${name || 'Faculty'} (${cleanEmail}, ${position || 'Faculty'}) customized their portal password.`,
      teacherName: name,
      teacherEmail: cleanEmail
    });

    res.json({
      success: true,
      message: 'Password customized successfully! You can now log in using your new password.'
    });
  });

  // 4. Security Alerts Management (dhiuhc@gmail.com)
  app.get('/api/security/email', (_req: Request, res: Response) => {
    res.json({ email: serverDataStore.getAlertRecipientEmail() });
  });

  app.post('/api/security/email', (req: Request, res: Response) => {
    const { email } = req.body || {};
    const ok = serverDataStore.setAlertRecipientEmail(email);
    if (!ok) {
      res.status(400).json({ success: false, error: 'Invalid email address provided.' });
      return;
    }
    res.json({ success: true, email: serverDataStore.getAlertRecipientEmail() });
  });

  app.get('/api/security/alerts', (_req: Request, res: Response) => {
    res.json({
      recipientEmail: serverDataStore.getAlertRecipientEmail(),
      alerts: serverDataStore.getSecurityAlerts()
    });
  });

  // 5. Current Teacher Session Info
  app.get('/api/auth/teacher-me', (req: Request, res: Response) => {
    const token = getBearerToken(req);
    const verification = verifyTeacherToken(token);
    if (!verification.valid || !verification.session) {
      res.status(401).json({ success: false, error: verification.error });
      return;
    }
    res.json({
      success: true,
      teacher: {
        id: verification.session.teacherId,
        name: verification.session.teacherName,
        position: verification.session.position,
        email: verification.session.email,
        subject: verification.session.position
      }
    });
  });

  // 6. Teacher Logout
  app.post('/api/auth/teacher-logout', (req: Request, res: Response) => {
    const token = getBearerToken(req);
    if (token) {
      revokeTeacherToken(token);
    }
    res.json({ success: true, message: 'Logged out successfully.' });
  });

  // 5. Get Students Directory (with class, section, search filters)
  app.get('/api/students', (req: Request, res: Response) => {
    const { class: mainClass, section, search } = req.query as {
      class?: string;
      section?: string;
      search?: string;
    };

    let list = serverDataStore.getAllStudents();

    if (mainClass) {
      list = serverDataStore.getStudentsByClass(mainClass, section);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((s) => {
        return (
          s.name.toLowerCase().includes(q) ||
          String(s.admissionNo).includes(q) ||
          String(s.rollNo).includes(q) ||
          s.mainClass.toLowerCase().includes(q) ||
          (s.section && s.section.toLowerCase().includes(q))
        );
      });
    }

    // Return safe list (without heavy photos if requested light)
    res.json({
      success: true,
      total: list.length,
      students: list
    });
  });

  // 6. Get Single Student Details
  app.get('/api/students/:id', (req: Request, res: Response) => {
    const student = serverDataStore.getStudentById(req.params.id);
    if (!student) {
      res.status(404).json({ success: false, error: 'Student not found.' });
      return;
    }
    res.json({ success: true, student });
  });

  // 7. Submit Remark & Coins (Protected by Teacher Token)
  app.post('/api/remarks', (req: Request, res: Response) => {
    const token = getBearerToken(req);
    const verification = verifyTeacherToken(token);

    if (!verification.valid || !verification.session) {
      res.status(401).json({
        success: false,
        error: 'Teacher authentication required. Please sign in with your authorized PIN.'
      });
      return;
    }

    const { studentId, coins, title, remark, date, image, idempotencyKey } = req.body || {};

    if (!studentId) {
      res.status(400).json({
        success: false,
        error: 'studentId is a required field.'
      });
      return;
    }

    const parsedCoins = Number(coins);
    const validCoinsNum = !isNaN(parsedCoins) && parsedCoins !== 0 ? parsedCoins : 1;

    const safeTitle = (title && title.trim()) || (validCoinsNum >= 0 ? `Award (+${validCoinsNum})` : `Minus Penalty (${validCoinsNum})`);
    const safeRemark = (remark && remark.trim()) || (validCoinsNum >= 0 ? `Awarded ${validCoinsNum} marks by teacher` : `Deducted ${Math.abs(validCoinsNum)} marks penalty by teacher`);

    const result = serverDataStore.awardStudentRemark({
      studentId,
      coins: validCoinsNum,
      title: safeTitle,
      remark: safeRemark,
      teacherName: verification.session.teacherName,
      teacherPosition: verification.session.position,
      teacherEmail: verification.session.email,
      teacherId: verification.session.teacherId,
      date,
      image,
      idempotencyKey
    });

    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    res.json(result);
  });

  // 8. Sync endpoint: Client Backup Ingestion (Non-destructive)
  app.post('/api/sync/backup', (req: Request, res: Response) => {
    const { students } = req.body || {};
    if (Array.isArray(students)) {
      const result = serverDataStore.syncFromClientBackup(students);
      res.json({ success: true, ...result });
      return;
    }
    res.status(400).json({ success: false, error: 'Expected students array in body.' });
  });

  // 9. Sync endpoint: Pull full server state to client
  app.get('/api/sync/pull', (_req: Request, res: Response) => {
    res.json({
      success: true,
      students: serverDataStore.getAllStudents(),
      history: serverDataStore.getHistoryLogs()
    });
  });

  // ==================== VITE SPA & STATIC SERVING ====================
  if (!isProd) {
    // Development mode: Mount Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built dist folder
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Start HTTP server on Port 3000
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DHKC CANTEEN Server] Running at http://0.0.0.0:${PORT}`);
    console.log(`[DHKC CANTEEN Server] Teacher portal accessible at /teacher`);
  });
}

bootstrap().catch((err) => {
  console.error('[DHKC CANTEEN Server] Failed to start:', err);
  process.exit(1);
});
