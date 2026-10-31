import React, { useState, useEffect } from 'react';
import {
  Award,
  Sparkles,
  Search,
  CheckCircle2,
  Lock,
  LogOut,
  UserCheck,
  Calendar,
  Coins,
  ChevronRight,
  ArrowLeft,
  Upload,
  AlertCircle,
  GraduationCap,
  ShieldCheck,
  Check,
  Clock,
  RotateCcw,
  Mail,
  Briefcase,
  User,
  MinusCircle,
  PlusCircle,
  AlertTriangle
} from 'lucide-react';
import { Student, MainClassType, StudentAchievement } from '../../types';
import { api, TeacherSessionInfo } from '../../services/api';
import { storage } from '../../services/storage';
import { getTodayDateString } from '../../data/initialData';
import { readFileAsDataUrl } from '../../utils/imageHelper';

interface TeacherPortalProps {
  onBackToCanteen: () => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({ onBackToCanteen }) => {
  // Mandatory Faculty Login Credentials (Only "teacher@dhkc" allowed)
  const [teacherNameInput, setTeacherNameInput] = useState('');
  const [teacherPositionInput, setTeacherPositionInput] = useState('');
  const [teacherEmailInput, setTeacherEmailInput] = useState('');
  const [teacherPasswordInput, setTeacherPasswordInput] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [currentTeacher, setCurrentTeacher] = useState<TeacherSessionInfo | null>(api.getTeacherInfo());

  // Roster & Selection states
  const [selectedClass, setSelectedClass] = useState<MainClassType>('S1');
  const [selectedSection, setSelectedSection] = useState<'S1A' | 'S1B'>('S1A');
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Selected Student for Remark Awarding / Deduction
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);

  // Form states: supports Award (+) and Minus Penalty (-) with strict 5 marks limit at once
  const [actionType, setActionType] = useState<'award' | 'deduct'>('award');
  const [title, setTitle] = useState('');
  const [remark, setRemark] = useState('');
  const [marksInput, setMarksInput] = useState<string>('5');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [photoProof, setPhotoProof] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [successReceipt, setSuccessReceipt] = useState<{
    studentName: string;
    studentClass: string;
    actionType: 'award' | 'deduct';
    coins: number;
    newTotal: number;
    title: string;
    timestamp: string;
  } | null>(null);

  // Local history of remarks awarded/deducted in this session
  const [sessionAwardedList, setSessionAwardedList] = useState<Array<{
    studentName: string;
    coins: number;
    title: string;
    time: string;
  }>>([]);

  // Customize Teacher Password state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [confirmPasswordVal, setConfirmPasswordVal] = useState('');
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordChangeMsg, setPasswordChangeMsg] = useState('');
  const [passwordChangeErr, setPasswordChangeErr] = useState('');

  const handleCustomizePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordVal.trim() || newPasswordVal.trim().length < 4) {
      setPasswordChangeErr('Password must be at least 4 characters long.');
      return;
    }
    if (newPasswordVal.trim() !== confirmPasswordVal.trim()) {
      setPasswordChangeErr('New password and confirmation do not match.');
      return;
    }

    setPasswordChangeLoading(true);
    setPasswordChangeErr('');
    setPasswordChangeMsg('');

    const res = await api.changeTeacherPassword({
      newPassword: newPasswordVal.trim(),
      teacherEmail: currentTeacher?.email,
      teacherName: currentTeacher?.name
    });

    setPasswordChangeLoading(false);

    if (res.success) {
      setPasswordChangeMsg('Password customized successfully! You can now use your new password for login.');
      setNewPasswordVal('');
      setConfirmPasswordVal('');
    } else {
      setPasswordChangeErr(res.error || 'Failed to update password.');
    }
  };

  // Verify existing token on mount
  useEffect(() => {
    api.verifyTeacherSession().then((teacher) => {
      setCurrentTeacher(teacher);
    });
  }, []);

  // Fetch students whenever class or section changes
  const loadStudents = async () => {
    setStudentsLoading(true);
    const params: { class: string; section?: string; search?: string } = {
      class: selectedClass
    };
    if (selectedClass === 'S1') {
      params.section = selectedSection;
    }
    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    const res = await api.getStudents(params);
    if (res.success && res.students.length > 0) {
      setStudents(res.students);
    } else {
      // Fallback to local storage if network is offline
      const local =
        selectedClass === 'S1'
          ? storage.getStudentsByClass('S1', selectedSection)
          : storage.getStudentsByClass(selectedClass);
      setStudents(local);
    }
    setStudentsLoading(false);
  };

  useEffect(() => {
    loadStudents();
  }, [selectedClass, selectedSection, searchQuery]);

  // Handle Login with mandatory Name, Position, Email and single password "teacher@dhkc"
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = teacherNameInput.trim();
    const cleanPosition = teacherPositionInput.trim();
    const cleanEmail = teacherEmailInput.trim().toLowerCase();
    const cleanPassword = teacherPasswordInput.trim();

    if (!cleanName) {
      setAuthError('Teacher Full Name is mandatory.');
      return;
    }
    if (!cleanPosition) {
      setAuthError('Teacher Position / Designation is mandatory.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setAuthError('Valid Teacher Email ID is mandatory.');
      return;
    }
    if (!cleanPassword) {
      setAuthError('Teacher Portal Password is required.');
      return;
    }
    if (cleanPassword !== 'teacher@dhkc') {
      setAuthError('Incorrect password! Please enter the authorized password.');
      return;
    }

    setAuthLoading(true);
    setAuthError('');
    const res = await api.loginTeacher({
      name: cleanName,
      position: cleanPosition,
      email: cleanEmail,
      password: cleanPassword
    });
    setAuthLoading(false);

    if (res.success && res.teacher) {
      setCurrentTeacher(res.teacher);
      setTeacherPasswordInput('');
      loadStudents();
    } else {
      setAuthError(res.error || 'Authentication failed. Please check credentials.');
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await api.logoutTeacher();
    setCurrentTeacher(null);
    setActiveStudent(null);
    setSuccessReceipt(null);
    setTeacherPasswordInput('');
  };

  // Handle Photo Proof File
  const handlePhotoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await readFileAsDataUrl(file);
        setPhotoProof(dataUrl);
      } catch {
        alert('Could not process photo file.');
      }
    }
  };

  // Handle Remark Submission (Allows teacher to enter any marks, supports Award + and Deduct -)
  const handleSubmitRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) return;

    const numMarks = parseInt(marksInput, 10);
    if (isNaN(numMarks) || numMarks === 0) {
      setSubmissionError('Please enter a valid number of marks in the marks text bar.');
      return;
    }

    const effectiveCoins = actionType === 'award' ? Math.abs(numMarks) : -Math.abs(numMarks);
    const observationTitle = title.trim() || (actionType === 'award' ? `Conduct Award (+${Math.abs(numMarks)} Marks)` : `Disciplinary Penalty (-${Math.abs(numMarks)} Marks)`);
    const observationRemark = remark.trim() || (actionType === 'award' ? 'Dining etiquette conduct award' : 'Disciplinary penalty recorded');

    setSubmitting(true);
    setSubmissionError('');

    // Generate unique idempotency key for this specific submission
    const idempotencyKey = `idemp-${activeStudent.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const res = await api.submitRemark({
      studentId: activeStudent.id,
      coins: effectiveCoins,
      title: observationTitle,
      remark: observationRemark,
      date,
      image: photoProof || undefined,
      idempotencyKey
    });

    setSubmitting(false);

    if (res.success) {
      // Also persist directly into local client storage immediately
      storage.awardStudentCoins(activeStudent.id, effectiveCoins, {
        title: observationTitle,
        remark: observationRemark,
        teacherName: currentTeacher?.name || 'Authorized Faculty',
        teacherPosition: currentTeacher?.position || currentTeacher?.subject,
        teacherEmail: currentTeacher?.email,
        date,
        image: photoProof || undefined
      });

      const updatedTotal = res.success && res.student ? res.student.totalCoins : Math.max(0, activeStudent.totalCoins + effectiveCoins);

      // Show Success Receipt
      setSuccessReceipt({
        studentName: activeStudent.name,
        studentClass: `${activeStudent.mainClass}${activeStudent.section ? `-${activeStudent.section}` : ''}`,
        actionType,
        coins: effectiveCoins,
        newTotal: updatedTotal,
        title: observationTitle,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

    // Update activeStudent balance in state so teacher can upload a 2nd remark of 5 marks immediately
    setActiveStudent((prev) => (prev ? { ...prev, totalCoins: updatedTotal } : null));

    // Append to session awarded list
    setSessionAwardedList((prev) => [
      {
        studentName: activeStudent.name,
        coins: effectiveCoins,
        title: title.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      ...prev
    ]);

    // Reset form fields
    setTitle('');
    setRemark('');
    setPhotoProof('');
    setMarksInput('5');

    // Trigger background sync with client storage so main app stays updated
    storage.syncWithServer();
    loadStudents();
    } else {
      setSubmissionError(res.error || 'Failed to submit remark. Please check server connection.');
    }
  };

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Universal Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0b1322]/95 backdrop-blur-md border-b border-[#182742] shadow-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Brand left */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToCanteen}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#101b30] hover:bg-[#162544] border border-[#1e3256] text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              title="Return to DHKC Canteen live dining board"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Canteen Board</span>
            </button>

            <div className="h-5 w-px bg-[#1e3256] hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-500/60 bg-[#0b1220] flex items-center justify-center p-0.5 shrink-0 shadow-sm">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-display font-extrabold text-sm sm:text-base text-white tracking-tight">
                    DHKC CANTEEN
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded uppercase">
                    TEACHER'S PORTAL
                  </span>
                </div>
                <p className="text-[10px] text-cyan-400 font-mono tracking-wider uppercase font-semibold mt-0.5">
                  STUDENT'S REMARKS & REWARD SYSTEM
                </p>
              </div>
            </div>
          </div>

          {/* Teacher Status Right */}
          {currentTeacher ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-white flex items-center justify-end gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{currentTeacher.name}</span>
                </div>
                <div className="text-[10px] text-amber-300 font-mono">
                  {currentTeacher.position || currentTeacher.subject || 'Faculty Mentor'} · <span className="text-slate-400">{currentTeacher.email}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Sign out from teacher portal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="text-xs text-amber-300/80 font-mono flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Faculty Login Required</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col">
        {!currentTeacher ? (
          /* ==================== VIEW 1: FACULTY AUTHENTICATION (MANDATORY FIELDS & TEACHER@DHKC) ==================== */
          <div className="flex-1 flex items-center justify-center py-6 sm:py-10">
            <div className="max-w-lg w-full bg-[#0d1627] border border-[#1b2b48] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight">
                  Student's Remarks Portal
                </h2>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Faculty portal authentication. Please enter your full name, position, official email ID, and password.
                </p>
              </div>

              {authError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {/* 1. Teacher Full Name (MUST) */}
                <div>
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>Teacher Full Name <span className="text-rose-400 font-bold">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={teacherNameInput}
                    onChange={(e) => setTeacherNameInput(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full px-4 py-2.5 bg-[#070d18] border border-[#223659] focus:border-amber-400 rounded-2xl text-sm font-semibold text-white focus:outline-none transition-colors"
                  />
                </div>

                {/* 2. Position / Designation (MUST) */}
                <div>
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Position / Designation <span className="text-rose-400 font-bold">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    value={teacherPositionInput}
                    onChange={(e) => setTeacherPositionInput(e.target.value)}
                    placeholder="Enter position / designation"
                    className="w-full px-4 py-2.5 bg-[#070d18] border border-[#223659] focus:border-amber-400 rounded-2xl text-sm font-semibold text-white focus:outline-none transition-colors"
                  />
                </div>

                {/* 3. Email ID (MUST) */}
                <div>
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Teacher Email ID <span className="text-rose-400 font-bold">*</span></span>
                  </label>
                  <input
                    type="email"
                    required
                    value={teacherEmailInput}
                    onChange={(e) => setTeacherEmailInput(e.target.value)}
                    placeholder="Enter email ID"
                    className="w-full px-4 py-2.5 bg-[#070d18] border border-[#223659] focus:border-amber-400 rounded-2xl text-sm font-semibold text-white focus:outline-none transition-colors"
                  />
                </div>

                {/* 4. Single Master Password: "teacher@dhkc" */}
                <div>
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Portal Password <span className="text-rose-400 font-bold">*</span></span>
                  </label>
                  <input
                    type="password"
                    required
                    value={teacherPasswordInput}
                    onChange={(e) => setTeacherPasswordInput(e.target.value)}
                    placeholder="Enter portal password"
                    className="w-full px-4 py-2.5 bg-[#070d18] border border-[#223659] focus:border-amber-400 rounded-2xl text-sm font-mono font-bold tracking-wider text-amber-300 focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {authLoading ? (
                    <span>Verifying Credentials...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Authenticate & Enter Portal</span>
                    </>
                  )}
                </button>
              </form>

              {/* Information Footnote */}
              <div className="pt-4 border-t border-[#182742] text-center space-y-1.5">
                <p className="text-xs text-slate-300 font-medium">
                  Security Rule: Every remark is strictly logged with your Name, Position, and Email ID.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ==================== VIEW 2: TEACHER WORKSPACE ==================== */
          <div className="space-y-6 flex-1 flex flex-col">
            {/* Success Receipt Banner */}
            {successReceipt && (
              <div
                className={`p-4 sm:p-5 rounded-3xl border shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-3 ${
                  successReceipt.coins >= 0
                    ? 'bg-gradient-to-r from-emerald-500/20 via-emerald-600/15 to-[#0d1627] border-emerald-500/40'
                    : 'bg-gradient-to-r from-rose-500/20 via-rose-600/15 to-[#0d1627] border-rose-500/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0 shadow-md ${
                      successReceipt.coins >= 0
                        ? 'bg-emerald-500 text-stone-950'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {successReceipt.coins >= 0 ? '✓' : '−'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-black uppercase tracking-wider ${
                          successReceipt.coins >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {successReceipt.coins >= 0
                          ? 'Observation Recorded & Marks Awarded'
                          : 'Disciplinary Penalty Recorded & Marks Deducted'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {successReceipt.timestamp}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                      {successReceipt.coins >= 0
                        ? `+${successReceipt.coins} Marks credited to ${successReceipt.studentName} (${successReceipt.studentClass})`
                        : `${successReceipt.coins} Marks deducted from ${successReceipt.studentName} (${successReceipt.studentClass})`}
                    </h3>
                    <p className="text-xs text-slate-300">
                      "{successReceipt.title}" · Updated Total Balance:{' '}
                      <strong className="text-amber-400 font-mono font-bold">
                        {successReceipt.newTotal} Marks
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setSuccessReceipt(null);
                      setTitle('');
                      setRemark('');
                      setMarksInput('5');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                  >
                    + Add Another Entry (Up to 5)
                  </button>
                  <button
                    onClick={() => {
                      setSuccessReceipt(null);
                      setActiveStudent(null);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#101b30] hover:bg-[#162544] text-slate-200 border border-[#1e3256] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Roster
                  </button>
                </div>
              </div>
            )}

            {/* If a student is currently selected for remark editing */}
            {activeStudent ? (
              <div className="bg-[#0d1627] border border-[#1b2b48] rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#182742]">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        setActiveStudent(null);
                        setSubmissionError('');
                      }}
                      className="p-2.5 rounded-xl bg-[#101b30] hover:bg-[#162544] text-slate-300 hover:text-white border border-[#1e3256] transition-colors"
                      title="Back to student roster"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold uppercase">
                          Class {activeStudent.mainClass} {activeStudent.section ? `· ${activeStudent.section}` : ''}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          Roll #{activeStudent.rollNo} · Adm #{activeStudent.admissionNo}
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-2xl font-black font-display text-white mt-0.5">
                        {activeStudent.name}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-[#080e1b] px-4 py-2.5 rounded-2xl border border-[#182742] self-start sm:self-auto">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Current Total Balance</span>
                      <span className="text-lg font-mono font-black text-amber-400">
                        {activeStudent.totalCoins} Coins
                      </span>
                    </div>
                    <div className="h-6 w-px bg-[#182742]" />
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Weekly Points</span>
                      <span className="text-lg font-mono font-black text-emerald-400">
                        +{activeStudent.weeklyCoins}
                      </span>
                    </div>
                  </div>
                </div>

                {submissionError && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{submissionError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitRemark} className="space-y-6">
                  {/* OPERATION MODE: AWARD (+) vs DEDUCT PENALTY (-) */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                      1. Select Action Type (Award or Minus Penalty)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setActionType('award');
                          setTitle('');
                        }}
                        className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2.5 text-xs font-bold transition-all cursor-pointer ${
                          actionType === 'award'
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400'
                            : 'bg-[#080e1b] border-[#182742] text-slate-400 hover:text-white hover:border-[#273d63]'
                        }`}
                      >
                        <PlusCircle className="w-4 h-4 text-emerald-400" />
                        <span>Award Marks (+) for Good Behavior</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActionType('deduct');
                          setTitle('');
                        }}
                        className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2.5 text-xs font-bold transition-all cursor-pointer ${
                          actionType === 'deduct'
                            ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-lg shadow-rose-500/10 ring-1 ring-rose-400'
                            : 'bg-[#080e1b] border-[#182742] text-slate-400 hover:text-white hover:border-[#273d63]'
                        }`}
                      >
                        <MinusCircle className="w-4 h-4 text-rose-400" />
                        <span>Minus Marks (−) for Wrong / Unnecessary Action</span>
                      </button>
                    </div>
                  </div>

                  {/* MARKS TEXT BAR SECTION (NO 5 LIMIT, SINGLE TEXT BAR) */}
                  <div className="p-5 rounded-2xl bg-[#080e1b] border border-[#182742] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        <span>Enter Marks ({actionType === 'award' ? 'Award +' : 'Minus −'}) *</span>
                      </label>
                      <span
                        className={`font-mono font-black text-sm px-2.5 py-0.5 rounded-lg ${
                          actionType === 'award'
                            ? 'text-emerald-300 bg-emerald-500/15 border border-emerald-500/30'
                            : 'text-rose-300 bg-rose-500/15 border border-rose-500/30'
                        }`}
                      >
                        {actionType === 'award' ? '+' : '−'}
                        {marksInput || 0} Marks
                      </span>
                    </div>

                    {/* Numerical text bar where teacher writes marks */}
                    <div>
                      <input
                        type="number"
                        min="1"
                        required
                        value={marksInput}
                        onChange={(e) => setMarksInput(e.target.value)}
                        placeholder="Enter marks amount (e.g. 2, 5, 10...)"
                        className="w-full px-4 py-3 bg-[#0c1424] border border-[#223659] rounded-2xl text-base font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* Real-time Math Preview (e.g. 200 - 2 = 198) */}
                    {(() => {
                      const m = parseInt(marksInput, 10);
                      const valid = !isNaN(m) && m >= 1;
                      const curr = activeStudent.totalCoins;
                      const nextTotal = actionType === 'award' ? curr + (valid ? m : 0) : Math.max(0, curr - (valid ? m : 0));
                      return (
                        <div className="p-3 rounded-xl bg-[#0b1220] border border-[#1b2b48] text-xs flex items-center justify-between">
                          <span className="text-slate-400">
                            Calculation: <strong className="text-white font-mono">{curr}</strong> {actionType === 'award' ? '+' : '−'} <strong className={actionType === 'award' ? 'text-emerald-400 font-mono' : 'text-rose-400 font-mono'}>{valid ? m : 0}</strong>
                          </span>
                          <span className="font-mono font-bold text-amber-300 text-sm">
                            = {nextTotal} Total Marks
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-[#182742] flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveStudent(null)}
                      className="px-4 py-2.5 rounded-xl bg-[#101b30] hover:bg-[#162544] text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={
                        submitting ||
                        parseInt(marksInput, 10) < 1 ||
                        isNaN(parseInt(marksInput, 10))
                      }
                      className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg active:scale-98 flex items-center gap-2 transition-all cursor-pointer ${
                        parseInt(marksInput, 10) < 1 || isNaN(parseInt(marksInput, 10))
                          ? 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
                          : actionType === 'award'
                          ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/25'
                          : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25'
                      }`}
                    >
                      {submitting ? (
                        <span>Processing Submission...</span>
                      ) : actionType === 'award' ? (
                        <>
                          <Award className="w-4 h-4" />
                          <span>Confirm Award (+{marksInput || 0} Marks)</span>
                        </>
                      ) : (
                        <>
                          <MinusCircle className="w-4 h-4" />
                          <span>Confirm Minus Penalty (−{marksInput || 0} Marks)</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Class & Student Selection Grid */
              <div className="space-y-6">
                {/* Class Filters Bar */}
                <div className="bg-[#0d1627] border border-[#1b2b48] rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black font-display uppercase tracking-wider text-white flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-amber-400" />
                        Select Institutional Class & Section
                      </h3>
                      <p className="text-xs text-slate-400">
                        Total 168 registered students in the central institutional database.
                      </p>
                    </div>

                    {/* Search box */}
                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search student by name, roll, adm..."
                        className="w-full pl-9 pr-3 py-2 bg-[#070d18] border border-[#223659] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Main Class Tabs */}
                  <div className="flex flex-wrap items-center gap-2">
                    {(['S1', 'S2', 'S3', 'S4', 'S5', 'SS1'] as MainClassType[]).map((cls) => (
                      <button
                        key={cls}
                        onClick={() => setSelectedClass(cls)}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                          selectedClass === cls
                            ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                            : 'bg-[#101b30] border border-[#1e3256] text-slate-300 hover:text-white hover:border-[#2a4574]'
                        }`}
                      >
                        Class {cls}
                      </button>
                    ))}
                  </div>

                  {/* S1 Sections Sub-filter */}
                  {selectedClass === 'S1' && (
                    <div className="pt-2 border-t border-[#182742] flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold uppercase text-slate-400 mr-1">
                        Section:
                      </span>
                      {(['S1A', 'S1B'] as const).map((sec) => (
                        <button
                          key={sec}
                          onClick={() => setSelectedSection(sec)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            selectedSection === sec
                              ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-300'
                              : 'bg-[#101b30] border border-[#1e3256] text-slate-400 hover:text-white'
                          }`}
                        >
                          Section {sec} ({sec === 'S1A' ? '35' : '37'} Students)
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Students Roster Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                    <span>
                      Showing <strong className="text-white font-mono">{students.length}</strong> Students in Class {selectedClass}
                      {selectedClass === 'S1' ? ` (${selectedSection})` : ''}
                    </span>
                    <span className="text-[11px] text-amber-400/80 font-mono">Click any student card to award remark</span>
                  </div>

                  {studentsLoading ? (
                    <div className="p-12 text-center text-xs text-slate-400">Loading student roster...</div>
                  ) : students.length === 0 ? (
                    <div className="p-12 text-center rounded-3xl bg-[#0d1627] border border-[#1b2b48] text-slate-400 text-xs">
                      No students found matching your search.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {students.map((st) => (
                        <div
                          key={st.id}
                          onClick={() => setActiveStudent(st)}
                          className="p-4 rounded-2xl bg-[#0d1627] hover:bg-[#111c34] border border-[#1b2b48] hover:border-amber-500/50 transition-all cursor-pointer group shadow-sm flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Photo / Initials */}
                            <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 overflow-hidden flex items-center justify-center shrink-0">
                              {st.photo ? (
                                <img src={st.photo} alt={st.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xs font-black font-display text-amber-300">
                                  {st.name.slice(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                                <span className="font-bold text-amber-400">Roll #{st.rollNo}</span>
                                <span>•</span>
                                <span>Adm #{st.admissionNo}</span>
                              </div>
                              <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                                {st.name}
                              </h4>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                <span className="text-amber-400 font-mono font-bold">
                                  {st.totalCoins} Coins
                                </span>
                                <span>•</span>
                                <span className="text-emerald-400 font-mono font-bold">
                                  +{st.weeklyCoins} this wk
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="px-2.5 py-1.5 rounded-xl bg-[#14223d] group-hover:bg-amber-500 group-hover:text-stone-950 text-slate-300 text-[11px] font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                          >
                            <span>Remarks / Points</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Session Awarded / Deducted History */}
                {sessionAwardedList.length > 0 && (
                  <div className="p-5 rounded-3xl bg-[#0d1627] border border-[#1b2b48] space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black font-display uppercase tracking-wider text-slate-300 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400" />
                        Remarks Processed In Current Session ({sessionAwardedList.length})
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        By {currentTeacher.name}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {sessionAwardedList.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-[#080e1b] border border-[#182742] flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={item.coins >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                              {item.coins >= 0 ? '✓' : '−'}
                            </span>
                            <div>
                              <span className="font-bold text-white">{item.studentName}</span>
                              <span className="text-[11px] text-slate-400 ml-2">"{item.title}"</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`font-mono font-bold ${
                                item.coins >= 0 ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {item.coins >= 0 ? `+${item.coins}` : `${item.coins}`} Marks
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Customize Password Option at the bottom */}
                <div className="pt-3 pb-1 border-t border-[#182742] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Institutional Faculty Security: After logging in with master password, you can set your own personalized password.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(true);
                      setPasswordChangeMsg('');
                      setPasswordChangeErr('');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#101b30] hover:bg-[#162544] border border-[#1e3256] text-amber-300 hover:text-amber-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Customize your password</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Customize Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0d1627] rounded-3xl max-w-md w-full p-6 border border-[#223659] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1b2b48] pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Customize your password</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="w-7 h-7 rounded-full bg-[#14223d] text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Set a personalized secure password for your teacher account (<strong>{currentTeacher?.email}</strong>). In future sessions, you can log in with this custom password.
            </p>

            {passwordChangeMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs">
                ✓ {passwordChangeMsg}
              </div>
            )}
            {passwordChangeErr && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{passwordChangeErr}</span>
              </div>
            )}

            <form onSubmit={handleCustomizePassword} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  New Custom Password *
                </label>
                <input
                  type="password"
                  required
                  value={newPasswordVal}
                  onChange={(e) => setNewPasswordVal(e.target.value)}
                  placeholder="Enter new custom password"
                  className="w-full px-3.5 py-2.5 bg-[#080e1b] border border-[#223659] rounded-xl text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPasswordVal}
                  onChange={(e) => setConfirmPasswordVal(e.target.value)}
                  placeholder="Re-enter new custom password"
                  className="w-full px-3.5 py-2.5 bg-[#080e1b] border border-[#223659] rounded-xl text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#182742]">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#101b30] text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={passwordChangeLoading}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  {passwordChangeLoading ? 'Saving...' : 'Save Custom Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-4 border-t border-[#182742] bg-[#070d18] text-center text-[11px] text-slate-500">
        DHKC Central Dining Hall & Student Remarks Portal · Connected to Institutional Server v3.0.0
      </footer>
    </div>
  );
};
