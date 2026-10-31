import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Student, StudentAchievement, TeacherUser, HistoryLog } from '../src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const STORE_FILE = path.join(DATA_DIR, 'dhkc_server_store.json');
const INITIAL_STUDENTS_FILE = path.join(DATA_DIR, 'initial_students.json');

const DEFAULT_TEACHERS: TeacherUser[] = [
  {
    id: 'tch-1',
    name: 'Prof. Tariq Mahmud',
    pin: 'teacher@dhkc',
    subject: 'Dining Hall Incharge',
    position: 'Dining Hall Incharge',
    email: 'tariq.mahmud@dhkc.edu',
    active: true
  },
  {
    id: 'tch-2',
    name: 'Mr. Bilal Hussain',
    pin: 'teacher@dhkc',
    subject: 'Dining Hall Assistant Supervisor',
    position: 'Dining Hall Assistant Supervisor',
    email: 'bilal.hussain@dhkc.edu',
    active: true
  },
  {
    id: 'tch-3',
    name: 'Maulana Shafiullah',
    pin: 'teacher@dhkc',
    subject: 'Student Discipline Mentor',
    position: 'Student Discipline Mentor',
    email: 'shafiullah@dhkc.edu',
    active: true
  }
];

export interface SecurityAlert {
  id: string;
  eventType: 'TEACHER_LOGIN' | 'MARKS_UPLOAD' | 'PASSWORD_CHANGE';
  title: string;
  details: string;
  teacherName?: string;
  teacherEmail?: string;
  recipientEmail: string;
  timestamp: string;
}

export interface ServerStoreData {
  version: string;
  lastUpdated: string;
  teachers: TeacherUser[];
  students: Student[];
  historyLogs: HistoryLog[];
  processedRemarksKeys: string[]; // Idempotency keys to prevent duplicate awards
  securityAlertEmail?: string;
  securityAlerts?: SecurityAlert[];
}

export class ServerDataStore {
  private data: ServerStoreData;

  constructor() {
    this.ensureDataDirectory();
    this.data = this.loadOrInitialize();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadOrInitialize(): ServerStoreData {
    if (fs.existsSync(STORE_FILE)) {
      try {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        const parsed: ServerStoreData = JSON.parse(raw);
        if (Array.isArray(parsed.students) && parsed.students.length > 0) {
          return parsed;
        }
      } catch (err) {
        console.warn('[ServerDataStore] Error reading existing store file, falling back to clean init:', err);
      }
    }

    // Load initial students from initial_students.json
    let fallbackStudents: Student[] = [];
    if (fs.existsSync(INITIAL_STUDENTS_FILE)) {
      try {
        fallbackStudents = JSON.parse(fs.readFileSync(INITIAL_STUDENTS_FILE, 'utf-8'));
      } catch (err) {
        console.warn('[ServerDataStore] Error reading initial_students.json:', err);
      }
    }

    // Initialize with official students and default teachers
    const initialData: ServerStoreData = {
      version: '3.0.0',
      lastUpdated: new Date().toISOString(),
      teachers: JSON.parse(JSON.stringify(DEFAULT_TEACHERS)),
      students: fallbackStudents,
      historyLogs: [
        {
          id: 'log-srv-init',
          action: 'Server Store Initialized',
          details: 'Official 168 DHKC students loaded into server-side central store.',
          timestamp: new Date().toLocaleString()
        }
      ],
      processedRemarksKeys: []
    };

    this.persist(initialData);
    return initialData;
  }

  private persist(dataToSave?: ServerStoreData) {
    try {
      this.ensureDataDirectory();
      const payload = dataToSave || this.data;
      payload.lastUpdated = new Date().toISOString();
      fs.writeFileSync(STORE_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (err) {
      console.error('[ServerDataStore] Failed to write store to disk:', err);
    }
  }

  // --- Student Methods ---
  public getAllStudents(): Student[] {
    return this.data.students;
  }

  public getStudentById(id: string): Student | undefined {
    return this.data.students.find((s) => s.id === id);
  }

  public getStudentsByClass(mainClass: string, section?: string): Student[] {
    return this.data.students
      .filter((s) => {
        if (s.mainClass !== mainClass) return false;
        if (mainClass === 'S1' && section) {
          return s.section === section;
        }
        return true;
      })
      .sort((a, b) => a.rollNo - b.rollNo);
  }

  // --- Teacher Methods ---
  public getAllTeachers(): TeacherUser[] {
    return this.data.teachers;
  }

  public getTeacherByPin(pin: string): TeacherUser | null {
    if (!pin) return null;
    const cleanPin = pin.trim();
    return this.data.teachers.find((t) => t.active && t.pin.trim() === cleanPin) || null;
  }

  public getTeacherById(id: string): TeacherUser | null {
    return this.data.teachers.find((t) => t.id === id) || null;
  }

  // --- Remarks & Coin Awarding (Idempotent & Atomic) ---
  public awardStudentRemark(params: {
    studentId: string;
    coins: number;
    title: string;
    remark: string;
    teacherName: string;
    teacherPosition?: string;
    teacherEmail?: string;
    teacherId?: string;
    date?: string;
    image?: string;
    idempotencyKey?: string;
  }): { success: boolean; student?: Student; achievement?: StudentAchievement; error?: string } {
    const { studentId, coins, title, remark, teacherName, teacherPosition, teacherEmail, date, image, idempotencyKey } = params;

    // 1. Check idempotency key to prevent accidental duplicate clicks
    if (idempotencyKey) {
      if (this.data.processedRemarksKeys.includes(idempotencyKey)) {
        const student = this.getStudentById(studentId);
        return {
          success: true,
          student,
          error: 'Duplicate submission detected: remark already recorded.'
        };
      }
    }

    // 2. Validate student existence
    const studentIdx = this.data.students.findIndex((s) => s.id === studentId);
    if (studentIdx === -1) {
      return { success: false, error: `Student with ID "${studentId}" not found.` };
    }

    // 3. Validate coin bounds (Unlimited marks allowed per teacher entry, supports positive and negative marks)
    const numCoins = Number(coins);
    let validCoins = 1;
    if (!isNaN(numCoins) && numCoins !== 0) {
      validCoins = Math.round(numCoins);
    } else {
      validCoins = 1;
    }

    const student = this.data.students[studentIdx];
    const newAchievement: StudentAchievement = {
      id: `ach-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      studentId: student.id,
      title: title.trim(),
      remark: remark.trim(),
      coins: validCoins,
      teacherName: teacherName.trim(),
      teacherPosition: teacherPosition ? teacherPosition.trim() : undefined,
      teacherEmail: teacherEmail ? teacherEmail.trim() : undefined,
      date: date || new Date().toISOString().split('T')[0],
      image: image || undefined,
      createdAt: new Date().toISOString()
    };

    // 4. Update student coin balances & achievements (totalCoins never drops below 0)
    student.totalCoins = Math.max(0, (student.totalCoins || 0) + validCoins);
    student.weeklyCoins = Math.max(0, (student.weeklyCoins || 0) + validCoins);
    student.achievements = [newAchievement, ...(student.achievements || [])];

    // 5. Mark idempotency key & log action
    if (idempotencyKey) {
      this.data.processedRemarksKeys.push(idempotencyKey);
      if (this.data.processedRemarksKeys.length > 500) {
        this.data.processedRemarksKeys.shift();
      }
    }

    const posTag = teacherPosition ? ` (${teacherPosition})` : '';
    const logAction = validCoins >= 0 ? 'Teacher Remark Awarded' : 'Disciplinary Deduction';
    const logPrefix = validCoins >= 0 ? `awarded +${validCoins}` : `deducted ${validCoins}`;
    const logEntry: HistoryLog = {
      id: `log-rmk-${Date.now()}`,
      action: logAction,
      details: `Teacher ${teacherName}${posTag} ${logPrefix} coins from ${student.name} (${student.mainClass}${student.section ? `-${student.section}` : ''}): "${title}"`,
      timestamp: new Date().toLocaleString()
    };
    this.data.historyLogs.unshift(logEntry);
    // 6. Automatically dispatch and log Security Alert to alert recipient email (dhiuhc@gmail.com)
    this.recordSecurityAlert({
      eventType: 'MARKS_UPLOAD',
      title: validCoins >= 0 ? `Marks Awarded (+${validCoins})` : `Marks Deducted (${validCoins})`,
      details: `Teacher ${teacherName}${posTag} (${teacherEmail || 'No email'}) ${logPrefix} marks for student ${student.name} (Adm #${student.admissionNo}, Class ${student.mainClass}${student.section ? `-${student.section}` : ''}): "${title}"`,
      teacherName,
      teacherEmail
    });

    // 7. Save atomically to disk
    this.persist();

    return { success: true, student, achievement: newAchievement };
  }

  // --- Security Alerts & Email Dispatch Management ---
  public getAlertRecipientEmail(): string {
    return this.data.securityAlertEmail || 'dhiuhc@gmail.com';
  }

  public setAlertRecipientEmail(email: string): boolean {
    const clean = (email || '').trim().toLowerCase();
    if (!clean || !clean.includes('@') || !clean.includes('.')) return false;
    this.data.securityAlertEmail = clean;
    this.persist();
    return true;
  }

  public getSecurityAlerts(): SecurityAlert[] {
    return this.data.securityAlerts || [];
  }

  public recordSecurityAlert(params: {
    eventType: 'TEACHER_LOGIN' | 'MARKS_UPLOAD' | 'PASSWORD_CHANGE';
    title: string;
    details: string;
    teacherName?: string;
    teacherEmail?: string;
  }): SecurityAlert {
    const recipient = this.getAlertRecipientEmail();
    const alert: SecurityAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventType: params.eventType,
      title: params.title,
      details: params.details,
      teacherName: params.teacherName,
      teacherEmail: params.teacherEmail,
      recipientEmail: recipient,
      timestamp: new Date().toLocaleString()
    };

    if (!this.data.securityAlerts) {
      this.data.securityAlerts = [];
    }
    this.data.securityAlerts.unshift(alert);
    this.data.securityAlerts = this.data.securityAlerts.slice(0, 100);

    // Console notification mimicking email dispatcher
    console.log(`[EMAIL ALERT DISPATCHED -> ${recipient}] [${alert.eventType}] ${alert.title}: ${alert.details}`);

    this.persist();
    return alert;
  }

  // --- Safe Browser Migration / Backup Ingestion ---
  public syncFromClientBackup(clientStudents: Student[]): { mergedCount: number; message: string } {
    if (!Array.isArray(clientStudents) || clientStudents.length === 0) {
      return { mergedCount: 0, message: 'No student data provided in backup.' };
    }

    let mergedCount = 0;
    clientStudents.forEach((clientSt) => {
      const idx = this.data.students.findIndex((s) => s.id === clientSt.id);
      if (idx !== -1) {
        const serverSt = this.data.students[idx];
        // Merge achievements without duplicates
        const existingAchIds = new Set((serverSt.achievements || []).map((a) => a.id));
        const newAchs = (clientSt.achievements || []).filter((a) => !existingAchIds.has(a.id));

        if (newAchs.length > 0 || clientSt.totalCoins > serverSt.totalCoins) {
          serverSt.achievements = [...newAchs, ...(serverSt.achievements || [])];
          serverSt.totalCoins = Math.max(serverSt.totalCoins, clientSt.totalCoins);
          serverSt.weeklyCoins = Math.max(serverSt.weeklyCoins, clientSt.weeklyCoins);
          if (clientSt.photo && !serverSt.photo) {
            serverSt.photo = clientSt.photo;
          }
          mergedCount++;
        }
      }
    });

    if (mergedCount > 0) {
      this.persist();
    }

    return { mergedCount, message: `Successfully synchronized ${mergedCount} student records.` };
  }

  public getHistoryLogs(): HistoryLog[] {
    return this.data.historyLogs;
  }
}

export const serverDataStore = new ServerDataStore();
