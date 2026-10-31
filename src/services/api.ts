import { Student, StudentAchievement, MainClassType } from '../types';
import { storage } from './storage';

const API_BASE = '/api';

export interface TeacherProfile {
  id: string;
  name: string;
  position: string;
  email: string;
  subject?: string;
}

export type TeacherSessionInfo = TeacherProfile;

export interface TeacherLoginCredentials {
  name: string;
  position: string;
  email: string;
  password: string;
}

export interface SubmitRemarkParams {
  studentId: string;
  coins: number;
  title: string;
  remark: string;
  date?: string;
  image?: string;
  idempotencyKey?: string;
}

class ApiService {
  private token: string | null = null;
  private currentTeacher: TeacherProfile | null = null;

  constructor() {
    this.token = sessionStorage.getItem('dhkc_server_teacher_token');
    const savedProfile = sessionStorage.getItem('dhkc_server_teacher_profile');
    if (savedProfile) {
      try {
        this.currentTeacher = JSON.parse(savedProfile);
      } catch {
        this.currentTeacher = null;
      }
    }
  }

  public getStoredToken(): string | null {
    return this.token;
  }

  public getTeacherInfo(): TeacherProfile | null {
    return this.currentTeacher;
  }

  public getCurrentTeacher(): TeacherProfile | null {
    return this.currentTeacher;
  }

  public async verifyTeacherSession(): Promise<TeacherProfile | null> {
    if (!this.token) {
      return this.currentTeacher;
    }
    try {
      const res = await fetch(`${API_BASE}/auth/teacher-me`, {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.teacher) {
          this.currentTeacher = data.teacher;
          sessionStorage.setItem('dhkc_server_teacher_profile', JSON.stringify(data.teacher));
          return data.teacher;
        }
      }
    } catch (err) {
      console.warn('[API] verifyTeacherSession failed:', err);
    }
    return this.currentTeacher;
  }

  public async loginTeacher(credentials: TeacherLoginCredentials | string): Promise<{ success: boolean; teacher?: TeacherProfile; error?: string }> {
    return this.teacherLogin(credentials);
  }

  public async logoutTeacher(): Promise<void> {
    return this.teacherLogout();
  }

  // --- Teacher Login via Server (Single password "teacher@dhkc" & mandatory fields) ---
  public async teacherLogin(credentials: TeacherLoginCredentials | string): Promise<{ success: boolean; teacher?: TeacherProfile; error?: string }> {
    const payload = typeof credentials === 'string'
      ? { name: 'Faculty Mentor', position: 'Faculty Mentor', email: 'mentor@dhkc.edu', password: credentials }
      : credentials;

    try {
      const res = await fetch(`${API_BASE}/auth/teacher-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        this.token = data.token;
        this.currentTeacher = data.teacher;
        sessionStorage.setItem('dhkc_server_teacher_token', data.token);
        sessionStorage.setItem('dhkc_server_teacher_profile', JSON.stringify(data.teacher));
        storage.setLoggedInTeacher({
          id: data.teacher.id,
          name: data.teacher.name,
          position: data.teacher.position,
          email: data.teacher.email,
          subject: data.teacher.position,
          pin: 'teacher@dhkc',
          active: true
        });
        return { success: true, teacher: data.teacher };
      }

      return { success: false, error: data.error || 'Authentication failed. Please verify credentials.' };
    } catch (err: any) {
      console.warn('[API] Server login unreachable, checking local fallback:', err);
      // Safe fallback to client-side storage
      const localRes = storage.verifyTeacherLogin(payload);
      if (localRes.success && localRes.teacher) {
        this.currentTeacher = {
          id: localRes.teacher.id,
          name: localRes.teacher.name,
          position: localRes.teacher.position || 'Faculty',
          email: localRes.teacher.email || '',
          subject: localRes.teacher.position || 'Faculty'
        };
        return { success: true, teacher: this.currentTeacher };
      }
      return { success: false, error: localRes.error || 'Could not connect to authentication service.' };
    }
  }

  public async teacherLogout(): Promise<void> {
    if (this.token) {
      try {
        await fetch(`${API_BASE}/auth/teacher-logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`
          }
        });
      } catch {
        // ignore network error on logout
      }
    }
    this.token = null;
    this.currentTeacher = null;
    sessionStorage.removeItem('dhkc_server_teacher_token');
    sessionStorage.removeItem('dhkc_server_teacher_profile');
    storage.teacherLogout();
  }

  // --- Fetch Students from Server (with class and section filters) ---
  public async getStudents(filters?: { class?: string; section?: string; search?: string }): Promise<{
    success: boolean;
    total: number;
    students: Student[];
  }> {
    try {
      const params = new URLSearchParams();
      if (filters?.class) params.set('class', filters.class);
      if (filters?.section) params.set('section', filters.section);
      if (filters?.search) params.set('search', filters.search);

      const res = await fetch(`${API_BASE}/students?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.students)) {
          return { success: true, total: data.total ?? data.students.length, students: data.students };
        }
      }
    } catch (err) {
      console.warn('[API] Server getStudents unavailable, using local cache:', err);
    }

    // Local fallback
    let list: Student[] = [];
    if (filters?.class) {
      list = storage.getStudentsByClass(filters.class as MainClassType, filters.section as ('S1A' | 'S1B' | undefined));
    } else if (filters?.search) {
      list = storage.searchStudents(filters.search);
    } else {
      list = storage.getAllStudents();
    }
    return { success: true, total: list.length, students: list };
  }

  public async getStudentById(id: string): Promise<Student | null> {
    try {
      const res = await fetch(`${API_BASE}/students/${encodeURIComponent(id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.student) {
          return data.student;
        }
      }
    } catch {
      // fallback
    }
    return storage.getStudentById(id) || null;
  }

  // --- Submit Remark via Server ---
  public async submitRemark(params: SubmitRemarkParams): Promise<{
    success: boolean;
    student?: Student;
    achievement?: StudentAchievement;
    error?: string;
  }> {
    const idempotencyKey = params.idempotencyKey || `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    if (this.token) {
      try {
        const res = await fetch(`${API_BASE}/remarks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`
          },
          body: JSON.stringify({
            ...params,
            idempotencyKey
          })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          // Sync student record to local storage as well for instant offline access
          if (data.student) {
            storage.updateStudent(data.student.id, data.student);
          }
          return { success: true, student: data.student, achievement: data.achievement };
        }

        return { success: false, error: data.error || 'Server rejected remark submission.' };
      } catch (err: any) {
        console.warn('[API] Server submission failed, attempting offline award:', err);
      }
    }

    // Offline / Local storage award fallback
    const tName = this.currentTeacher?.name || 'Authorized Mentor';
    const ok = storage.awardStudentCoins(params.studentId, params.coins, {
      title: params.title,
      remark: params.remark,
      teacherName: tName,
      teacherPosition: this.currentTeacher?.position,
      teacherEmail: this.currentTeacher?.email,
      date: params.date || new Date().toISOString().split('T')[0],
      image: params.image
    });

    if (ok) {
      const st = storage.getStudentById(params.studentId);
      return { success: true, student: st, achievement: st?.achievements?.[0] };
    }

    return { success: false, error: 'Could not record remark. Please check student details.' };
  }

  // --- Two-Way Synchronization Bridge ---
  public async syncWithServer(): Promise<{ synced: boolean; count?: number }> {
    try {
      // 1. Pull server state
      const pullRes = await fetch(`${API_BASE}/sync/pull`);
      if (pullRes.ok) {
        const pullData = await pullRes.json();
        if (pullData.success && Array.isArray(pullData.students)) {
          const localStudents = storage.getAllStudents();
          // Merge server students into local storage without loss
          const mergedMap = new Map<string, Student>();
          localStudents.forEach((s) => mergedMap.set(s.id, s));

          pullData.students.forEach((srvSt: Student) => {
            const loc = mergedMap.get(srvSt.id);
            if (!loc) {
              mergedMap.set(srvSt.id, srvSt);
            } else {
              // Merge achievements
              const existingIds = new Set((loc.achievements || []).map((a) => a.id));
              const srvNew = (srvSt.achievements || []).filter((a) => !existingIds.has(a.id));
              const mergedAchievements = [...srvNew, ...(loc.achievements || [])];

              mergedMap.set(srvSt.id, {
                ...srvSt,
                totalCoins: Math.max(loc.totalCoins || 0, srvSt.totalCoins || 0),
                weeklyCoins: Math.max(loc.weeklyCoins || 0, srvSt.weeklyCoins || 0),
                achievements: mergedAchievements,
                photo: loc.photo || srvSt.photo
              });
            }
          });

          storage.setAllStudents(Array.from(mergedMap.values()));
        }
      }

      // 2. Push any client-only achievements to server backup
      const currentLoc = storage.getAllStudents();
      await fetch(`${API_BASE}/sync/backup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: currentLoc })
      });

      return { synced: true };
    } catch (err) {
      console.warn('[API] Sync with server skipped (offline or network error):', err);
      return { synced: false };
    }
  }

  public async getAppConfig(): Promise<{ sharedAppUrl: string; devAppUrl: string; appletId: string; customDomain?: string } | null> {
    try {
      const res = await fetch(`${API_BASE}/app-config`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[API] Failed to fetch app-config:', err);
    }
    return null;
  }

  public async changeTeacherPassword(params: {
    currentPassword?: string;
    newPassword: string;
    teacherEmail?: string;
    teacherName?: string;
  }): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/teacher-change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {})
        },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      if (data.success) {
        // Also save locally for offline access
        storage.setTeacherCustomPassword(params.newPassword, params.teacherEmail);
      }
      return data;
    } catch {
      // Fallback to local storage if offline
      storage.setTeacherCustomPassword(params.newPassword, params.teacherEmail);
      return { success: true, message: 'Password updated in local storage (offline mode).' };
    }
  }

  public async getSecurityAlertEmail(): Promise<string> {
    try {
      const res = await fetch(`${API_BASE}/security/email`);
      if (res.ok) {
        const data = await res.json();
        if (data.email) {
          storage.setSecurityAlertEmail(data.email);
          return data.email;
        }
      }
    } catch {}
    return storage.getSecurityAlertEmail();
  }

  public async setSecurityAlertEmail(email: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/security/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        storage.setSecurityAlertEmail(email);
        return true;
      }
    } catch {}
    storage.setSecurityAlertEmail(email);
    return true;
  }

  public async getSecurityAlerts(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/security/alerts`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.alerts)) return data.alerts;
      }
    } catch {}
    return storage.getSecurityAlerts();
  }
}

export const api = new ApiService();
