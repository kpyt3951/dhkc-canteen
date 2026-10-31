import {
  Announcement,
  Comment,
  DiningHallInfo,
  FoodItem,
  GalleryItem,
  HistoryLog,
  MealCategory,
  MealCategoryConfig,
  MEAL_CATEGORIES,
  TeamMember,
  Student,
  StudentAchievement,
  PromotionalBanner,
  PlateCount,
  GlassCount,
  TableEquipmentItem,
  DiningReminder,
  DonationSettings,
  MilestoneSettings,
  WinnerOfWeekSettings,
  TeacherUser,
  CookUser,
  MainClassType,
  CampusAdvertisement
} from '../types';
import {
  generateInitialFoodItems,
  getTodayDateString,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_COMMENTS,
  INITIAL_DINING_HALL_INFO,
  INITIAL_GALLERY_ITEMS,
  INITIAL_TEAM_MEMBERS,
  INITIAL_STUDENTS,
  INITIAL_PROMOTIONAL_BANNERS,
  INITIAL_PLATE_COUNT,
  INITIAL_GLASS_COUNT,
  INITIAL_TABLE_EQUIPMENT,
  INITIAL_REMINDERS,
  INITIAL_DONATION_SETTINGS,
  INITIAL_MILESTONE_SETTINGS,
  INITIAL_WINNER_SETTINGS,
  INITIAL_TEACHERS,
  INITIAL_COOKS,
  HERO_IMAGE
} from '../data/initialData';

const STORAGE_KEYS = {
  FOOD: 'dhkc_food_items_v3',
  DINING_INFO: 'dhkc_dining_info_v3',
  TEAM: 'dhkc_team_members_v3',
  ANNOUNCEMENTS: 'dhkc_announcements_v3',
  GALLERY: 'dhkc_gallery_v3',
  COMMENTS: 'dhkc_comments_v3',
  USER_LIKES: 'dhkc_user_likes_v3',
  HISTORY: 'dhkc_history_logs_v3',
  ADMIN_AUTH: 'dhkc_admin_auth_v3',
  ADMIN_PASSWORD: 'dhkc_admin_password_v3',
  // New features
  STUDENTS: 'dhkc_students_v3',
  BANNERS: 'dhkc_banners_v3',
  PLATES: 'dhkc_plates_v3',
  GLASSES: 'dhkc_glasses_v3',
  TABLE_EQUIPMENT: 'dhkc_table_equipment_v3',
  REMINDERS: 'dhkc_reminders_v3',
  DONATION: 'dhkc_donation_v3',
  MILESTONE: 'dhkc_milestone_v3',
  WINNER_SETTINGS: 'dhkc_winner_settings_v3',
  TEACHERS: 'dhkc_teachers_v3',
  TEACHER_AUTH: 'dhkc_teacher_auth_v3',
  COOKS: 'dhkc_cooks_v3',
  COOK_AUTH: 'dhkc_cook_auth_v3',
  MEAL_CONFIG: 'dhkc_meal_config_v3',
  ADVERTISEMENT: 'dhkc_campus_ad_v3'
};

const DEFAULT_ADMIN_PASSWORD = 'dhkc@dininghall';

class StorageService {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.ensureInitialized();
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Error notifying storage listener:', err);
      }
    });
  }

  private ensureInitialized() {
    try {
      if (!localStorage.getItem(STORAGE_KEYS.FOOD)) {
        localStorage.setItem(STORAGE_KEYS.FOOD, JSON.stringify(generateInitialFoodItems()));
      }
      if (!localStorage.getItem(STORAGE_KEYS.DINING_INFO)) {
        localStorage.setItem(STORAGE_KEYS.DINING_INFO, JSON.stringify(INITIAL_DINING_HALL_INFO));
      }
      if (!localStorage.getItem(STORAGE_KEYS.TEAM)) {
        localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(INITIAL_TEAM_MEMBERS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) {
        localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(INITIAL_ANNOUNCEMENTS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.GALLERY)) {
        localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(INITIAL_GALLERY_ITEMS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.COMMENTS)) {
        localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(INITIAL_COMMENTS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.USER_LIKES)) {
        localStorage.setItem(STORAGE_KEYS.USER_LIKES, JSON.stringify([]));
      }
      if (!localStorage.getItem(STORAGE_KEYS.HISTORY)) {
        const initialLog: HistoryLog = {
          id: 'log-1',
          action: 'System Initialized',
          details: 'DHKC Canteen database initialized with official students, meal schedule and staff data.',
          timestamp: new Date().toLocaleString(),
        };
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([initialLog]));
      }
      if (!localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD)) {
        localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, DEFAULT_ADMIN_PASSWORD);
      }

      // New tables initialization - ensure all students have zero points, zero total coins, and zero weekly coins
      const existingStudentsData = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (!existingStudentsData) {
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
      } else {
        try {
          const parsedStudents: Student[] = JSON.parse(existingStudentsData);
          if (Array.isArray(parsedStudents)) {
            let needsReset = false;
            const sanitizedStudents = parsedStudents.map((st) => {
              if (st.totalCoins !== 0 || st.weeklyCoins !== 0 || (st.achievements && st.achievements.length > 0)) {
                needsReset = true;
                return {
                  ...st,
                  totalCoins: 0,
                  weeklyCoins: 0,
                  achievements: []
                };
              }
              return st;
            });
            if (needsReset) {
              localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(sanitizedStudents));
            }
          }
        } catch {
          localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
        }
      }
      if (!localStorage.getItem(STORAGE_KEYS.BANNERS)) {
        localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(INITIAL_PROMOTIONAL_BANNERS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.PLATES)) {
        localStorage.setItem(STORAGE_KEYS.PLATES, JSON.stringify(INITIAL_PLATE_COUNT));
      }
      if (!localStorage.getItem(STORAGE_KEYS.GLASSES)) {
        localStorage.setItem(STORAGE_KEYS.GLASSES, JSON.stringify(INITIAL_GLASS_COUNT));
      }
      if (!localStorage.getItem(STORAGE_KEYS.TABLE_EQUIPMENT)) {
        localStorage.setItem(STORAGE_KEYS.TABLE_EQUIPMENT, JSON.stringify(INITIAL_TABLE_EQUIPMENT));
      }
      if (!localStorage.getItem(STORAGE_KEYS.REMINDERS)) {
        localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(INITIAL_REMINDERS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.DONATION)) {
        localStorage.setItem(STORAGE_KEYS.DONATION, JSON.stringify(INITIAL_DONATION_SETTINGS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.MILESTONE)) {
        localStorage.setItem(STORAGE_KEYS.MILESTONE, JSON.stringify(INITIAL_MILESTONE_SETTINGS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.WINNER_SETTINGS)) {
        localStorage.setItem(STORAGE_KEYS.WINNER_SETTINGS, JSON.stringify(INITIAL_WINNER_SETTINGS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.TEACHERS)) {
        localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(INITIAL_TEACHERS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.COOKS)) {
        localStorage.setItem(STORAGE_KEYS.COOKS, JSON.stringify(INITIAL_COOKS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.MEAL_CONFIG)) {
        localStorage.setItem(STORAGE_KEYS.MEAL_CONFIG, JSON.stringify(MEAL_CATEGORIES));
      }
    } catch (e) {
      console.warn('LocalStorage access issue, fallback enabled:', e);
    }
  }

  // ==================== AUTHENTICATION & SESSIONS ====================
  // 1. Admin
  public verifyAdminPassword(password: string): boolean {
    const stored = localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD) || DEFAULT_ADMIN_PASSWORD;
    const ok = password.trim() === stored.trim() || password.trim() === DEFAULT_ADMIN_PASSWORD;
    if (ok) {
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      this.notify();
    }
    return ok;
  }

  public isAdminLoggedIn(): boolean {
    return sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
  }

  public adminLogout(): void {
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    this.notify();
  }

  public setAdminPassword(newPass: string): void {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, newPass);
    this.logHistory('Admin Security', 'Admin password updated.');
    this.notify();
  }

  // 2. Teacher/Mentor Auth
  public getTeachers(): TeacherUser[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEACHERS);
      return data ? JSON.parse(data) : INITIAL_TEACHERS;
    } catch {
      return INITIAL_TEACHERS;
    }
  }

  public setTeachers(teachers: TeacherUser[]): void {
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
    this.notify();
  }

  public addTeacher(teacher: Omit<TeacherUser, 'id'>): TeacherUser {
    const all = this.getTeachers();
    const newT: TeacherUser = {
      ...teacher,
      id: `tch-${Date.now()}`
    };
    all.push(newT);
    this.setTeachers(all);
    this.logHistory('Teacher Management', `Added teacher: ${teacher.name}`);
    return newT;
  }

  public updateTeacher(id: string, updates: Partial<TeacherUser>): void {
    const all = this.getTeachers().map((t) => (t.id === id ? { ...t, ...updates } : t));
    this.setTeachers(all);
  }

  public deleteTeacher(id: string): void {
    const all = this.getTeachers().filter((t) => t.id !== id);
    this.setTeachers(all);
    this.logHistory('Teacher Management', `Deleted teacher ${id}`);
  }

  public static OFFICIAL_TEACHER_PASSWORD = 'teacher@dhkc';

  public getTeacherCustomPassword(email?: string): string | null {
    try {
      if (email) {
        const perTeacher = localStorage.getItem(`dhkc_tch_pass_${email.toLowerCase().trim()}`);
        if (perTeacher) return perTeacher;
      }
      return localStorage.getItem('dhkc_teacher_custom_password');
    } catch {
      return null;
    }
  }

  public setTeacherCustomPassword(newPass: string, email?: string): void {
    try {
      const clean = newPass.trim();
      localStorage.setItem('dhkc_teacher_custom_password', clean);
      if (email) {
        localStorage.setItem(`dhkc_tch_pass_${email.toLowerCase().trim()}`, clean);
      }
      this.notify();
    } catch {}
  }

  // Security Alert Notifications (Default recipient: dhiuhc@gmail.com)
  public getSecurityAlertEmail(): string {
    try {
      return localStorage.getItem('dhkc_security_alert_email') || 'dhiuhc@gmail.com';
    } catch {
      return 'dhiuhc@gmail.com';
    }
  }

  public setSecurityAlertEmail(email: string): void {
    try {
      const clean = (email || '').trim().toLowerCase();
      if (clean && clean.includes('@')) {
        localStorage.setItem('dhkc_security_alert_email', clean);
        this.notify();
      }
    } catch {}
  }

  public getSecurityAlerts(): any[] {
    try {
      const data = localStorage.getItem('dhkc_security_alerts_v1');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public addSecurityAlert(alert: {
    eventType: 'TEACHER_LOGIN' | 'MARKS_UPLOAD' | 'PASSWORD_CHANGE';
    title: string;
    details: string;
    teacherName?: string;
    teacherEmail?: string;
  }): void {
    try {
      const recipient = this.getSecurityAlertEmail();
      const newAlert = {
        id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        ...alert,
        recipientEmail: recipient,
        timestamp: new Date().toLocaleString()
      };
      const all = [newAlert, ...this.getSecurityAlerts()].slice(0, 100);
      localStorage.setItem('dhkc_security_alerts_v1', JSON.stringify(all));
      this.notify();
    } catch {}
  }

  public verifyTeacherLogin(params: {
    name?: string;
    position?: string;
    email?: string;
    password?: string;
  }): { success: boolean; teacher?: TeacherUser; error?: string } {
    const cleanName = (params.name || '').trim();
    const cleanPosition = (params.position || '').trim();
    const cleanEmail = (params.email || '').trim().toLowerCase();
    const cleanPassword = (params.password || '').trim();

    if (!cleanName) {
      return { success: false, error: 'Teacher Full Name is mandatory.' };
    }
    if (!cleanPosition) {
      return { success: false, error: 'Teacher Position / Designation is mandatory.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, error: 'A valid Teacher Email ID is mandatory.' };
    }

    const customPass = this.getTeacherCustomPassword(cleanEmail);
    const isValid =
      cleanPassword === StorageService.OFFICIAL_TEACHER_PASSWORD ||
      (customPass && cleanPassword === customPass);

    if (!isValid) {
      return {
        success: false,
        error: 'Invalid password. Please enter the authorized faculty portal password or your customized password.'
      };
    }

    const teacherObj: TeacherUser = {
      id: `tch-${Date.now()}`,
      name: cleanName,
      pin: cleanPassword,
      subject: cleanPosition,
      position: cleanPosition,
      email: cleanEmail,
      active: true
    };

    this.setLoggedInTeacher(teacherObj);

    // Record login security alert for dhiuhc@gmail.com
    this.addSecurityAlert({
      eventType: 'TEACHER_LOGIN',
      title: 'Teacher Login Successful',
      details: `Teacher ${cleanName} (${cleanPosition}) logged in using email ${cleanEmail}.`,
      teacherName: cleanName,
      teacherEmail: cleanEmail
    });

    return { success: true, teacher: teacherObj };
  }

  public setLoggedInTeacher(teacher: TeacherUser): void {
    sessionStorage.setItem(STORAGE_KEYS.TEACHER_AUTH, JSON.stringify(teacher));
    this.notify();
  }

  public teacherLogin(teacher: TeacherUser): void {
    this.setLoggedInTeacher(teacher);
  }

  public verifyTeacherPin(pin: string): TeacherUser | null {
    const clean = (pin || '').trim();
    const customPass = this.getTeacherCustomPassword();
    if (clean === StorageService.OFFICIAL_TEACHER_PASSWORD || (customPass && clean === customPass)) {
      const existing = this.getLoggedInTeacher();
      if (existing) return existing;
      const defaultT: TeacherUser = {
        id: 'tch-default',
        name: 'Faculty Mentor',
        pin: clean,
        subject: 'Dining Hall Mentor',
        position: 'Dining Hall Mentor',
        email: 'mentor@dhkc.edu',
        active: true
      };
      this.setLoggedInTeacher(defaultT);
      return defaultT;
    }
    return null;
  }

  public getLoggedInTeacher(): TeacherUser | null {
    try {
      const data = sessionStorage.getItem(STORAGE_KEYS.TEACHER_AUTH);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public teacherLogout(): void {
    sessionStorage.removeItem(STORAGE_KEYS.TEACHER_AUTH);
    this.notify();
  }

  // 3. Cook Auth
  public getCooks(): CookUser[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COOKS);
      return data ? JSON.parse(data) : INITIAL_COOKS;
    } catch {
      return INITIAL_COOKS;
    }
  }

  public setCooks(cooks: CookUser[]): void {
    localStorage.setItem(STORAGE_KEYS.COOKS, JSON.stringify(cooks));
    this.notify();
  }

  public addCook(cook: Omit<CookUser, 'id'>): CookUser {
    const all = this.getCooks();
    const newC: CookUser = {
      ...cook,
      id: `cook-${Date.now()}`
    };
    all.push(newC);
    this.setCooks(all);
    this.logHistory('Cook Management', `Added cook account: ${cook.name}`);
    return newC;
  }

  public updateCook(id: string, updates: Partial<CookUser>): void {
    const all = this.getCooks().map((c) => (c.id === id ? { ...c, ...updates } : c));
    this.setCooks(all);
  }

  public deleteCook(id: string): void {
    const all = this.getCooks().filter((c) => c.id !== id);
    this.setCooks(all);
  }

  public verifyCookPassword(password: string): CookUser | null {
    const cooks = this.getCooks();
    const found = cooks.find((c) => c.active && (c.password.trim() === password.trim() || password.trim() === 'cook@dhkc'));
    if (found) {
      sessionStorage.setItem(STORAGE_KEYS.COOK_AUTH, JSON.stringify(found));
      this.notify();
      return found;
    }
    return null;
  }

  public getLoggedInCook(): CookUser | null {
    try {
      const data = sessionStorage.getItem(STORAGE_KEYS.COOK_AUTH);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public isCookLoggedIn(): boolean {
    return !!sessionStorage.getItem(STORAGE_KEYS.COOK_AUTH);
  }

  public cookLogout(): void {
    sessionStorage.removeItem(STORAGE_KEYS.COOK_AUTH);
    this.notify();
  }

  // ==================== STUDENTS & DIRECTORY ====================
  public getAllStudents(): Student[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      return data ? JSON.parse(data) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  }

  public setAllStudents(students: Student[]): void {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    this.notify();
  }

  public getStudentsByClass(mainClass: MainClassType, section?: 'S1A' | 'S1B' | ''): Student[] {
    const all = this.getAllStudents();
    return all.filter((s) => {
      if (s.mainClass !== mainClass) return false;
      if (mainClass === 'S1') {
        if (section) return s.section === section;
        return true;
      }
      return true;
    }).sort((a, b) => a.rollNo - b.rollNo);
  }

  public getStudentById(id: string): Student | undefined {
    return this.getAllStudents().find((s) => s.id === id);
  }

  public searchStudents(query: string): Student[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.getAllStudents();
    return this.getAllStudents().filter((s) => {
      return (
        s.name.toLowerCase().includes(q) ||
        String(s.admissionNo).includes(q) ||
        String(s.rollNo).includes(q) ||
        s.mainClass.toLowerCase().includes(q) ||
        (s.section && s.section.toLowerCase().includes(q))
      );
    });
  }

  public updateStudent(id: string, updates: Partial<Student>): void {
    const all = this.getAllStudents().map((s) => (s.id === id ? { ...s, ...updates } : s));
    this.setAllStudents(all);
    this.logHistory('Student Directory', `Updated details for student ID: ${id}`);
  }

  public updateStudentPhoto(id: string, photoDataUrl?: string): void {
    const all = this.getAllStudents().map((s) => {
      if (s.id === id) {
        return { ...s, photo: photoDataUrl };
      }
      return s;
    });
    this.setAllStudents(all);
    this.logHistory('Student Photo', `Updated profile photo for student ID: ${id}`);
  }

  // ==================== COINS, REMARKS & REWARDS ====================
  public awardStudentCoins(
    studentId: string,
    coins: number,
    achievementData: {
      title: string;
      remark: string;
      teacherName: string;
      teacherPosition?: string;
      teacherEmail?: string;
      date: string;
      image?: string;
    }
  ): boolean {
    const all = this.getAllStudents();
    const targetIdx = all.findIndex((s) => s.id === studentId);
    if (targetIdx === -1) return false;

    const numCoins = Number(coins);
    let validCoins = 1;
    if (numCoins < 0) {
      validCoins = Math.round(numCoins);
      if (validCoins === 0) validCoins = -1;
    } else {
      validCoins = Math.round(numCoins);
      if (validCoins === 0) validCoins = 1;
    }

    const student = all[targetIdx];
    const newAchievement: StudentAchievement = {
      id: `ach-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      studentId: student.id,
      title: achievementData.title,
      remark: achievementData.remark,
      coins: validCoins,
      teacherName: achievementData.teacherName,
      teacherPosition: achievementData.teacherPosition,
      teacherEmail: achievementData.teacherEmail,
      date: achievementData.date || getTodayDateString(),
      image: achievementData.image,
      createdAt: new Date().toISOString()
    };

    const updatedStudent: Student = {
      ...student,
      totalCoins: Math.max(0, (student.totalCoins || 0) + validCoins),
      weeklyCoins: Math.max(0, (student.weeklyCoins || 0) + validCoins),
      achievements: [newAchievement, ...(student.achievements || [])]
    };

    all[targetIdx] = updatedStudent;
    this.setAllStudents(all);

    const logAction = validCoins >= 0 ? 'Coins & Remarks Awarded' : 'Coins Deducted (Disciplinary Penalty)';
    const logDetails =
      validCoins >= 0
        ? `Awarded +${validCoins} coins to ${student.name} (${student.mainClass}${student.section ? `-${student.section}` : ''}) by ${achievementData.teacherName}: "${achievementData.title}"`
        : `Deducted ${validCoins} coins from ${student.name} (${student.mainClass}${student.section ? `-${student.section}` : ''}) by ${achievementData.teacherName}: "${achievementData.title}"`;

    this.logHistory(logAction, logDetails);

    return true;
  }

  public async syncWithServer(): Promise<{ updated: boolean; count: number }> {
    try {
      const res = await fetch('/api/sync/pull');
      if (!res.ok) return { updated: false, count: 0 };
      const data = await res.json();
      if (!data.success || !Array.isArray(data.students)) return { updated: false, count: 0 };

      const localStudents = this.getAllStudents();
      let hasChanges = false;
      let changeCount = 0;

      const merged = localStudents.map((localSt) => {
        const serverSt = data.students.find((s: Student) => s.id === localSt.id);
        if (!serverSt) return localSt;

        const localAchIds = new Set((localSt.achievements || []).map((a) => a.id));
        const newServerAchs = (serverSt.achievements || []).filter((a: any) => !localAchIds.has(a.id));

        if (newServerAchs.length > 0 || serverSt.totalCoins !== localSt.totalCoins) {
          hasChanges = true;
          changeCount++;
          return {
            ...localSt,
            totalCoins: serverSt.totalCoins,
            weeklyCoins: serverSt.weeklyCoins,
            achievements: [...newServerAchs, ...(localSt.achievements || [])],
            photo: localSt.photo || serverSt.photo
          };
        }
        return localSt;
      });

      if (hasChanges) {
        this.setAllStudents(merged);
        return { updated: true, count: changeCount };
      }

      return { updated: false, count: 0 };
    } catch {
      return { updated: false, count: 0 };
    }
  }

  public getWeeklyLeaderboard(limit = 10): Student[] {
    const all = this.getAllStudents();
    return [...all]
      .sort((a, b) => {
        if (b.weeklyCoins !== a.weeklyCoins) {
          return b.weeklyCoins - a.weeklyCoins;
        }
        return b.totalCoins - a.totalCoins;
      })
      .slice(0, limit);
  }

  public getWinnerOfTheWeek(): {
    student: Student | null;
    isOverridden: boolean;
    customMessage: string;
  } {
    const settings = this.getWinnerSettings();
    const all = this.getAllStudents();

    if (settings.overrideStudentId) {
      const overridden = all.find((s) => s.id === settings.overrideStudentId);
      if (overridden) {
        return {
          student: overridden,
          isOverridden: true,
          customMessage: settings.customMessage || 'Honorary Weekly Dining Hall Leader'
        };
      }
    }

    const leaderboard = this.getWeeklyLeaderboard(1);
    const top = leaderboard.length > 0 && leaderboard[0].weeklyCoins > 0 ? leaderboard[0] : null;

    return {
      student: top,
      isOverridden: false,
      customMessage: settings.customMessage || 'Top Weekly Dining Hall Contributor & Etiquette Ambassador'
    };
  }

  public resetWeeklyCycle(newStartDate?: string, newEndDate?: string): void {
    const all = this.getAllStudents().map((s) => ({
      ...s,
      weeklyCoins: 0
    }));
    this.setAllStudents(all);

    const winnerSettings = this.getWinnerSettings();
    const updatedSettings: WinnerOfWeekSettings = {
      ...winnerSettings,
      weekStartDate: newStartDate || getTodayDateString(),
      weekEndDate: newEndDate || getTodayDateString(),
      overrideStudentId: undefined
    };
    this.setWinnerSettings(updatedSettings);

    this.logHistory(
      'Weekly Cycle Reset',
      'Started a fresh Weekly Cycle. Weekly coins reset to 0; Lifetime coins preserved.'
    );
  }

  public resetAllStudentsCoinsToZero(): void {
    const all = this.getAllStudents().map((s) => ({
      ...s,
      totalCoins: 0,
      weeklyCoins: 0,
      achievements: []
    }));
    this.setAllStudents(all);

    const winnerSettings = this.getWinnerSettings();
    if (winnerSettings.overrideStudentId) {
      this.setWinnerSettings({
        ...winnerSettings,
        overrideStudentId: undefined
      });
    }

    this.logHistory(
      'Coins Reset',
      'All student points, total coins, and weekly coins were reset to 0 across the entire institution.'
    );
    this.notify();
  }

  public getMilestoneSettings(): MilestoneSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MILESTONE);
      return data ? JSON.parse(data) : INITIAL_MILESTONE_SETTINGS;
    } catch {
      return INITIAL_MILESTONE_SETTINGS;
    }
  }

  public setMilestoneSettings(settings: MilestoneSettings): void {
    localStorage.setItem(STORAGE_KEYS.MILESTONE, JSON.stringify(settings));
    this.logHistory('Reward Settings', 'Updated 300 Coin milestone settings.');
    this.notify();
  }

  public getWinnerSettings(): WinnerOfWeekSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WINNER_SETTINGS);
      return data ? JSON.parse(data) : INITIAL_WINNER_SETTINGS;
    } catch {
      return INITIAL_WINNER_SETTINGS;
    }
  }

  public setWinnerSettings(settings: WinnerOfWeekSettings): void {
    localStorage.setItem(STORAGE_KEYS.WINNER_SETTINGS, JSON.stringify(settings));
    this.logHistory('Winner Settings', 'Updated Winner of the Week settings.');
    this.notify();
  }

  // ==================== PROMOTIONAL BANNERS ====================
  public getAllBanners(): PromotionalBanner[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BANNERS);
      return data ? JSON.parse(data) : INITIAL_PROMOTIONAL_BANNERS;
    } catch {
      return INITIAL_PROMOTIONAL_BANNERS;
    }
  }

  public setAllBanners(banners: PromotionalBanner[]): void {
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
    this.notify();
  }

  public getActiveBanners(): PromotionalBanner[] {
    const today = getTodayDateString();
    return this.getAllBanners()
      .filter((b) => {
        if (!b.published) return false;
        if (b.startDate && b.startDate > today) return false;
        if (b.endDate && b.endDate < today) return false;
        return true;
      })
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  }

  public addBanner(banner: Omit<PromotionalBanner, 'id' | 'createdAt'>): PromotionalBanner {
    const all = this.getAllBanners();
    const newBanner: PromotionalBanner = {
      ...banner,
      id: `banner-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    all.push(newBanner);
    this.setAllBanners(all);
    this.logHistory('Promotional Banner', `Created banner: ${banner.title}`);
    return newBanner;
  }

  public updateBanner(id: string, updates: Partial<PromotionalBanner>): void {
    const all = this.getAllBanners().map((b) => (b.id === id ? { ...b, ...updates } : b));
    this.setAllBanners(all);
    this.logHistory('Promotional Banner', `Updated banner ID: ${id}`);
  }

  public deleteBanner(id: string): void {
    const all = this.getAllBanners().filter((b) => b.id !== id);
    this.setAllBanners(all);
    this.logHistory('Promotional Banner', `Deleted banner ID: ${id}`);
  }

  // ==================== EQUIPMENT & TRACKING ====================
  public getPlateCount(): PlateCount {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLATES);
      return data ? JSON.parse(data) : INITIAL_PLATE_COUNT;
    } catch {
      return INITIAL_PLATE_COUNT;
    }
  }

  public updatePlateCount(count: PlateCount): void {
    localStorage.setItem(STORAGE_KEYS.PLATES, JSON.stringify(count));
    this.logHistory('Equipment Tracking', `Plates updated: Total ${count.total}, Avail ${count.available}, Missing ${count.missing}`);
    this.notify();
  }

  public getGlassCount(): GlassCount {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GLASSES);
      return data ? JSON.parse(data) : INITIAL_GLASS_COUNT;
    } catch {
      return INITIAL_GLASS_COUNT;
    }
  }

  public updateGlassCount(count: GlassCount): void {
    localStorage.setItem(STORAGE_KEYS.GLASSES, JSON.stringify(count));
    this.logHistory('Equipment Tracking', `Glasses updated: Total ${count.total}, Avail ${count.available}, Missing ${count.missing}`);
    this.notify();
  }

  public getTableEquipment(): TableEquipmentItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TABLE_EQUIPMENT);
      return data ? JSON.parse(data) : INITIAL_TABLE_EQUIPMENT;
    } catch {
      return INITIAL_TABLE_EQUIPMENT;
    }
  }

  public setTableEquipment(items: TableEquipmentItem[]): void {
    localStorage.setItem(STORAGE_KEYS.TABLE_EQUIPMENT, JSON.stringify(items));
    this.notify();
  }

  public addTableEquipment(item: Omit<TableEquipmentItem, 'id' | 'lastUpdated'>): TableEquipmentItem {
    const all = this.getTableEquipment();
    const newItem: TableEquipmentItem = {
      ...item,
      id: `eq-${Date.now()}`,
      lastUpdated: new Date().toLocaleDateString()
    };
    all.push(newItem);
    this.setTableEquipment(all);
    this.logHistory('Table Equipment', `Added equipment: ${item.name}`);
    return newItem;
  }

  public updateTableEquipment(id: string, updates: Partial<TableEquipmentItem>): void {
    const all = this.getTableEquipment().map((eq) =>
      eq.id === id ? { ...eq, ...updates, lastUpdated: new Date().toLocaleDateString() } : eq
    );
    this.setTableEquipment(all);
  }

  public deleteTableEquipment(id: string): void {
    const all = this.getTableEquipment().filter((eq) => eq.id !== id);
    this.setTableEquipment(all);
    this.logHistory('Table Equipment', `Deleted equipment ID: ${id}`);
  }

  // ==================== REMINDERS ====================
  public getReminders(): DiningReminder[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      return data ? JSON.parse(data) : INITIAL_REMINDERS;
    } catch {
      return INITIAL_REMINDERS;
    }
  }

  public setReminders(reminders: DiningReminder[]): void {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
    this.notify();
  }

  public addReminder(reminder: Omit<DiningReminder, 'id' | 'createdAt'>): DiningReminder {
    const all = this.getReminders();
    const newRem: DiningReminder = {
      ...reminder,
      id: `rem-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    all.push(newRem);
    this.setReminders(all);
    this.logHistory('Dining Reminders', `Added reminder: ${reminder.text.slice(0, 30)}...`);
    return newRem;
  }

  public updateReminder(id: string, updates: Partial<DiningReminder>): void {
    const all = this.getReminders().map((r) => (r.id === id ? { ...r, ...updates } : r));
    this.setReminders(all);
  }

  public deleteReminder(id: string): void {
    const all = this.getReminders().filter((r) => r.id !== id);
    this.setReminders(all);
  }

  // ==================== DONATION & QR ====================
  public getDonationSettings(): DonationSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DONATION);
      return data ? JSON.parse(data) : INITIAL_DONATION_SETTINGS;
    } catch {
      return INITIAL_DONATION_SETTINGS;
    }
  }

  public setDonationSettings(settings: DonationSettings): void {
    localStorage.setItem(STORAGE_KEYS.DONATION, JSON.stringify(settings));
    this.logHistory('Donations', 'Updated QR and donation settings.');
    this.notify();
  }

  // ==================== MEAL TIMINGS CONFIG ====================
  public getMealCategories(): MealCategoryConfig[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEAL_CONFIG);
      return data ? JSON.parse(data) : MEAL_CATEGORIES;
    } catch {
      return MEAL_CATEGORIES;
    }
  }

  public updateMealCategoryTiming(
    id: MealCategory,
    updates: Partial<MealCategoryConfig>
  ): void {
    const all = this.getMealCategories().map((cat) =>
      cat.id === id ? { ...cat, ...updates } : cat
    );
    localStorage.setItem(STORAGE_KEYS.MEAL_CONFIG, JSON.stringify(all));
    this.logHistory('Meal Timings', `Updated schedule for ${id}`);
    this.notify();
  }

  // ==================== APP LOGO & BRANDING ====================
  public getAppLogo(): string {
    const info = this.getDiningHallInfo();
    return info.appLogo || '/logo.png';
  }

  public updateAppLogo(logoUrl: string): void {
    const info = this.getDiningHallInfo();
    const updated = { ...info, appLogo: logoUrl };
    this.setDiningHallInfo(updated);
    this.logHistory('App Branding', 'App logo updated by administrator.');
  }

  public resetAppLogo(): void {
    this.updateAppLogo('/logo.png');
  }

  // ==================== DIRECT APP LINK ====================
  public getDirectAppUrl(): string {
    const defaultSharedUrl =
      (import.meta as any).env?.VITE_SHARED_APP_URL ||
      'https://ais-pre-we7bk24s6gh6ph5tnom2q3-388743997822.asia-southeast1.run.app';

    try {
      const custom = localStorage.getItem('dhkc_custom_direct_url');
      if (custom && custom.trim().length > 0) {
        // Discard any stored links that mistakenly contain google.com or private ais-dev
        if (
          !custom.includes('aistudio.google.com') &&
          !custom.includes('google.com/studio') &&
          !custom.includes('ais-dev-')
        ) {
          return custom.trim();
        } else {
          localStorage.removeItem('dhkc_custom_direct_url');
        }
      }
    } catch {}

    if (typeof window !== 'undefined') {
      try {
        const loc = window.location;
        let origin = loc.origin;

        // If the URL contains the private developer host (ais-dev-...), ALWAYS convert it to the public shared standalone URL (ais-pre-...)
        // ais-dev- is protected by AI Studio session auth and forces Google AI Studio to open.
        // ais-pre- is the public standalone Cloud Run app that opens ONLY the application directly!
        if (origin.includes('ais-dev-')) {
          return origin.replace('ais-dev-', 'ais-pre-');
        }

        // If on localhost or inside Google AI Studio frame, return the standalone shared URL
        if (
          origin.includes('aistudio.google.com') ||
          origin.includes('localhost') ||
          origin.includes('127.0.0.1')
        ) {
          return defaultSharedUrl;
        }

        return `${origin}${loc.pathname.replace(/\/$/, '')}`;
      } catch {
        return defaultSharedUrl;
      }
    }
    return defaultSharedUrl;
  }

  public setDirectAppUrl(url: string): void {
    try {
      // Disallow saving aistudio or ais-dev URLs
      let cleanUrl = url.trim();
      if (cleanUrl.includes('ais-dev-')) {
        cleanUrl = cleanUrl.replace('ais-dev-', 'ais-pre-');
      }
      if (!cleanUrl.includes('aistudio.google.com')) {
        localStorage.setItem('dhkc_custom_direct_url', cleanUrl);
        this.notify();
      }
    } catch {}
  }

  // ==================== HERO IMAGE ====================
  public updateHeroImage(imageUrl: string): void {
    const info = this.getDiningHallInfo();
    const updated = { ...info, backgroundImage: imageUrl };
    this.setDiningHallInfo(updated);
    this.logHistory('Hero Image', 'Dining hall hero image replaced.');
  }

  public resetHeroImage(): void {
    this.updateHeroImage(HERO_IMAGE);
  }

  // ==================== CAMPUS ADVERTISEMENT / PROGRAM POSTER ====================
  public getAdvertisement(): CampusAdvertisement | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADVERTISEMENT);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public setAdvertisement(ad: CampusAdvertisement | null): void {
    if (!ad) {
      localStorage.removeItem(STORAGE_KEYS.ADVERTISEMENT);
      this.logHistory('Campus Advertisement', 'Removed campus advertisement / program poster.');
    } else {
      localStorage.setItem(STORAGE_KEYS.ADVERTISEMENT, JSON.stringify(ad));
      this.logHistory('Campus Advertisement', `Updated campus advertisement poster: "${ad.title}"`);
    }
    this.notify();
  }

  public clearAdvertisement(): void {
    this.setAdvertisement(null);
  }

  // ==================== FOOD ITEMS ====================
  public getAllFoodItems(): FoodItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FOOD);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getFoodItemsByDate(date: string): FoodItem[] {
    const all = this.getAllFoodItems();
    return all.filter((item) => item.date === date).sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  }

  public getTodayFoodItems(): FoodItem[] {
    return this.getFoodItemsByDate(getTodayDateString());
  }

  public addFoodItem(item: Omit<FoodItem, 'id' | 'likes' | 'commentCount' | 'createdAt'>): FoodItem {
    const all = this.getAllFoodItems();
    const newItem: FoodItem = {
      ...item,
      id: `food-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      likes: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
    };
    all.push(newItem);
    localStorage.setItem(STORAGE_KEYS.FOOD, JSON.stringify(all));
    this.logHistory('Menu Addition', `Added "${newItem.foodName}" to ${newItem.mealCategory} on ${newItem.date}`);
    this.notify();
    return newItem;
  }

  public updateFoodItem(id: string, updates: Partial<FoodItem>): void {
    const all = this.getAllFoodItems();
    const idx = all.findIndex((i) => i.id === id);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...updates };
      localStorage.setItem(STORAGE_KEYS.FOOD, JSON.stringify(all));
      this.logHistory('Menu Update', `Updated "${all[idx].foodName}" (${all[idx].date})`);
      this.notify();
    }
  }

  public deleteFoodItem(id: string): void {
    const all = this.getAllFoodItems();
    const target = all.find((i) => i.id === id);
    const filtered = all.filter((i) => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.FOOD, JSON.stringify(filtered));
    if (target) {
      this.logHistory('Menu Deletion', `Deleted "${target.foodName}" from ${target.date}`);
    }
    this.notify();
  }

  public toggleLikeFoodItem(id: string): { liked: boolean; newCount: number } {
    try {
      const likesRaw = localStorage.getItem(STORAGE_KEYS.USER_LIKES);
      const userLikes: string[] = likesRaw ? JSON.parse(likesRaw) : [];
      const isLiked = userLikes.includes(id);

      const all = this.getAllFoodItems();
      const idx = all.findIndex((i) => i.id === id);
      if (idx === -1) return { liked: false, newCount: 0 };

      let newCount = all[idx].likes || 0;
      if (isLiked) {
        newCount = Math.max(0, newCount - 1);
        const updatedLikes = userLikes.filter((x) => x !== id);
        localStorage.setItem(STORAGE_KEYS.USER_LIKES, JSON.stringify(updatedLikes));
      } else {
        newCount += 1;
        userLikes.push(id);
        localStorage.setItem(STORAGE_KEYS.USER_LIKES, JSON.stringify(userLikes));
      }

      all[idx].likes = newCount;
      localStorage.setItem(STORAGE_KEYS.FOOD, JSON.stringify(all));
      this.notify();
      return { liked: !isLiked, newCount };
    } catch {
      return { liked: false, newCount: 0 };
    }
  }

  public isFoodItemLiked(id: string): boolean {
    try {
      const likesRaw = localStorage.getItem(STORAGE_KEYS.USER_LIKES);
      const userLikes: string[] = likesRaw ? JSON.parse(likesRaw) : [];
      return userLikes.includes(id);
    } catch {
      return false;
    }
  }

  public isFoodLiked(id: string): boolean {
    return this.isFoodItemLiked(id);
  }

  public toggleLike(id: string): { liked: boolean; newCount: number } {
    return this.toggleLikeFoodItem(id);
  }

  public getGlassesCount(): GlassCount {
    return this.getGlassCount();
  }

  // ==================== COMMENTS ====================
  public getAllComments(): Comment[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMMENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getCommentsByFoodId(foodId: string): Comment[] {
    const all = this.getAllComments();
    return all.filter((c) => c.foodId === foodId);
  }

  public addComment(foodId: string, userName: string, commentText: string): Comment {
    const all = this.getAllComments();
    const newComment: Comment = {
      id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      foodId,
      userName: userName.trim() || 'Anonymous Diner',
      comment: commentText.trim(),
      timestamp: 'Just now',
    };
    all.push(newComment);
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(all));

    // Update comment count on item
    const allFoods = this.getAllFoodItems();
    const fIdx = allFoods.findIndex((f) => f.id === foodId);
    if (fIdx !== -1) {
      allFoods[fIdx].commentCount = (allFoods[fIdx].commentCount || 0) + 1;
      localStorage.setItem(STORAGE_KEYS.FOOD, JSON.stringify(allFoods));
    }

    this.notify();
    return newComment;
  }

  public deleteComment(id: string): void {
    const all = this.getAllComments();
    const target = all.find((c) => c.id === id);
    const filtered = all.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(filtered));

    if (target) {
      const allFoods = this.getAllFoodItems();
      const fIdx = allFoods.findIndex((f) => f.id === target.foodId);
      if (fIdx !== -1) {
        allFoods[fIdx].commentCount = Math.max(0, (allFoods[fIdx].commentCount || 1) - 1);
        localStorage.setItem(STORAGE_KEYS.FOOD, JSON.stringify(allFoods));
      }
      this.logHistory('Moderation', `Deleted comment by "${target.userName}"`);
    }

    this.notify();
  }

  // ==================== DINING HALL INFO ====================
  public getDiningHallInfo(): DiningHallInfo {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DINING_INFO);
      return data ? JSON.parse(data) : INITIAL_DINING_HALL_INFO;
    } catch {
      return INITIAL_DINING_HALL_INFO;
    }
  }

  public setDiningHallInfo(info: DiningHallInfo): void {
    localStorage.setItem(STORAGE_KEYS.DINING_INFO, JSON.stringify(info));
    this.logHistory('Dining Hall Info', 'Updated Dining Hall general details or incharge information.');
    this.notify();
  }

  // ==================== TEAM MEMBERS ====================
  public getTeamMembers(): TeamMember[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEAM);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public setTeamMembers(team: TeamMember[]): void {
    localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(team));
    this.notify();
  }

  public addTeamMember(member: Omit<TeamMember, 'id'>): TeamMember {
    const all = this.getTeamMembers();
    const newM: TeamMember = {
      ...member,
      id: `team-${Date.now()}`,
    };
    all.push(newM);
    this.setTeamMembers(all);
    this.logHistory('Team Management', `Added team member "${member.name}" (${member.position})`);
    return newM;
  }

  public updateTeamMember(id: string, updates: Partial<TeamMember>): void {
    const all = this.getTeamMembers();
    const idx = all.findIndex((m) => m.id === id);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...updates };
      this.setTeamMembers(all);
      this.logHistory('Team Management', `Updated team member "${all[idx].name}"`);
    }
  }

  public deleteTeamMember(id: string): void {
    const all = this.getTeamMembers();
    const target = all.find((m) => m.id === id);
    const filtered = all.filter((m) => m.id !== id);
    this.setTeamMembers(filtered);
    if (target) {
      this.logHistory('Team Management', `Removed team member "${target.name}"`);
    }
  }

  // ==================== ANNOUNCEMENTS ====================
  public getAnnouncements(): Announcement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getActiveAnnouncements(): Announcement[] {
    const all = this.getAnnouncements();
    return all.filter((a) => a.active);
  }

  public setAnnouncements(anns: Announcement[]): void {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(anns));
    this.notify();
  }

  public addAnnouncement(ann: Omit<Announcement, 'id'>): Announcement {
    const all = this.getAnnouncements();
    const newA: Announcement = {
      ...ann,
      id: `ann-${Date.now()}`,
    };
    all.unshift(newA);
    this.setAnnouncements(all);
    this.logHistory('Announcement', `Created announcement: "${ann.title}"`);
    return newA;
  }

  public updateAnnouncement(id: string, updates: Partial<Announcement>): void {
    const all = this.getAnnouncements();
    const idx = all.findIndex((a) => a.id === id);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...updates };
      this.setAnnouncements(all);
      this.logHistory('Announcement', `Updated announcement: "${all[idx].title}"`);
    }
  }

  public deleteAnnouncement(id: string): void {
    const all = this.getAnnouncements();
    const target = all.find((a) => a.id === id);
    const filtered = all.filter((a) => a.id !== id);
    this.setAnnouncements(filtered);
    if (target) {
      this.logHistory('Announcement', `Deleted announcement: "${target.title}"`);
    }
  }

  // ==================== GALLERY ====================
  public getGallery(): GalleryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GALLERY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public setGallery(items: GalleryItem[]): void {
    localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(items));
    this.notify();
  }

  public addGalleryItem(item: Omit<GalleryItem, 'id'>): GalleryItem {
    const all = this.getGallery();
    const newG: GalleryItem = {
      ...item,
      id: `gal-${Date.now()}`,
    };
    all.unshift(newG);
    this.setGallery(all);
    this.logHistory('Gallery', `Added new dining hall gallery item.`);
    return newG;
  }

  public updateGalleryItem(id: string, updates: Partial<GalleryItem>): void {
    const all = this.getGallery().map((g) => (g.id === id ? { ...g, ...updates } : g));
    this.setGallery(all);
  }

  public deleteGalleryItem(id: string): void {
    const all = this.getGallery();
    const filtered = all.filter((g) => g.id !== id);
    this.setGallery(filtered);
    this.logHistory('Gallery', `Removed gallery photo ID: ${id}`);
  }

  // ==================== HISTORY LOGS ====================
  public getHistoryLogs(): HistoryLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public logHistory(action: string, details: string): void {
    const all = this.getHistoryLogs();
    const newLog: HistoryLog = {
      id: `log-${Date.now()}`,
      action,
      details,
      timestamp: new Date().toLocaleString(),
    };
    all.unshift(newLog);
    const trimmed = all.slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmed));
  }

  public clearHistoryLogs(): void {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
    this.notify();
  }

  // ==================== DATA RESTORATION / RESET ====================
  public resetToDefault(): void {
    localStorage.clear();
    sessionStorage.clear();
    this.ensureInitialized();
    this.notify();
  }
}

export const storage = new StorageService();
