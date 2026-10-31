import crypto from 'crypto';
import type { TeacherUser } from '../src/types/index.ts';

export const OFFICIAL_TEACHER_PASSWORD = 'teacher@dhkc';

// Store customized teacher passwords by email
const customTeacherPasswords: Map<string, string> = new Map();
let globalCustomPassword: string | null = null;

export function getCustomTeacherPassword(email?: string): string | null {
  if (email && customTeacherPasswords.has(email.toLowerCase())) {
    return customTeacherPasswords.get(email.toLowerCase()) || null;
  }
  return globalCustomPassword;
}

export function setCustomTeacherPassword(email: string, newPass: string): { success: boolean; error?: string } {
  const cleanPass = (newPass || '').trim();
  if (cleanPass.length < 4) {
    return { success: false, error: 'New password must be at least 4 characters.' };
  }
  if (email) {
    customTeacherPasswords.set(email.toLowerCase().trim(), cleanPass);
  }
  globalCustomPassword = cleanPass;
  return { success: true };
}

export interface TeacherSession {
  token: string;
  teacherId: string;
  teacherName: string;
  position: string;
  email: string;
  subject?: string;
  createdAt: number;
  expiresAt: number;
}

// In-memory active session token cache (valid for 24 hours)
const activeSessions: Map<string, TeacherSession> = new Map();
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export function authenticateTeacher(params: {
  name?: string;
  position?: string;
  email?: string;
  password?: string;
}): {
  success: boolean;
  token?: string;
  teacher?: { id: string; name: string; position: string; email: string; subject?: string };
  error?: string;
} {
  const { name, position, email, password } = params || {};

  const cleanName = (name || '').trim();
  const cleanPosition = (position || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  // 1. Mandatory Name
  if (!cleanName) {
    return { success: false, error: 'Teacher Full Name is mandatory.' };
  }

  // 2. Mandatory Position / Designation
  if (!cleanPosition) {
    return { success: false, error: 'Teacher Position / Designation is mandatory.' };
  }

  // 3. Mandatory Email ID
  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return { success: false, error: 'A valid Teacher Email ID is mandatory.' };
  }

  // 4. Authorized Master Password "teacher@dhkc" OR Teacher's Customized Password
  const customPass = getCustomTeacherPassword(cleanEmail);
  const isValidPassword =
    cleanPassword === OFFICIAL_TEACHER_PASSWORD ||
    (customPass && cleanPassword === customPass);

  if (!isValidPassword) {
    return {
      success: false,
      error: 'Invalid password. Please enter the authorized faculty password or your customized password.'
    };
  }

  // Generate cryptographically secure random session token
  const token = `dhkc_tch_${crypto.randomBytes(24).toString('hex')}`;
  const teacherId = `tch-${Buffer.from(cleanEmail).toString('hex').slice(0, 10)}`;

  const session: TeacherSession = {
    token,
    teacherId,
    teacherName: cleanName,
    position: cleanPosition,
    email: cleanEmail,
    subject: cleanPosition,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL_MS
  };

  activeSessions.set(token, session);

  return {
    success: true,
    token,
    teacher: {
      id: teacherId,
      name: cleanName,
      position: cleanPosition,
      email: cleanEmail,
      subject: cleanPosition
    }
  };
}

export function authenticateTeacherByPin(pin: string): {
  success: boolean;
  token?: string;
  teacher?: { id: string; name: string; position: string; email: string; subject?: string };
  error?: string;
} {
  return authenticateTeacher({
    name: 'Faculty Mentor',
    position: 'Dining Hall Mentor',
    email: 'mentor@dhkc.edu',
    password: pin
  });
}

export function verifyTeacherToken(token: string): {
  valid: boolean;
  session?: TeacherSession;
  error?: string;
} {
  if (!token) {
    return { valid: false, error: 'Authorization token missing.' };
  }

  const session = activeSessions.get(token);
  if (!session) {
    return { valid: false, error: 'Session expired or invalid. Please sign in again.' };
  }

  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return { valid: false, error: 'Session expired. Please re-authenticate.' };
  }

  return { valid: true, session };
}

export function revokeTeacherToken(token: string): boolean {
  return activeSessions.delete(token);
}
