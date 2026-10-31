import React, { useState, useEffect } from 'react';
import {
  X,
  Award,
  CheckCircle2,
  Lock,
  UserCheck,
  Calendar,
  Sparkles,
  Coins,
  ChevronRight,
  Upload,
  AlertCircle,
  User,
  Briefcase,
  Mail,
  MinusCircle,
  PlusCircle
} from 'lucide-react';
import { MainClassType, Student, TeacherUser } from '../../types';
import { storage } from '../../services/storage';
import { getTodayDateString } from '../../data/initialData';
import { readFileAsDataUrl } from '../../utils/imageHelper';

interface TeacherRemarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedStudent?: Student | null;
}

export const TeacherRemarksModal: React.FC<TeacherRemarksModalProps> = ({
  isOpen,
  onClose,
  preselectedStudent,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(preselectedStudent ? 3 : 1);
  const [teacherNameInput, setTeacherNameInput] = useState('');
  const [teacherPositionInput, setTeacherPositionInput] = useState('');
  const [teacherEmailInput, setTeacherEmailInput] = useState('');
  const [teacherPasswordInput, setTeacherPasswordInput] = useState('');
  const [loggedInTeacher, setLoggedInTeacher] = useState<TeacherUser | null>(storage.getLoggedInTeacher());
  const [authError, setAuthError] = useState('');

  // Form selections
  const [selectedMainClass, setSelectedMainClass] = useState<MainClassType>(
    preselectedStudent ? preselectedStudent.mainClass : 'S1'
  );
  const [selectedSection, setSelectedSection] = useState<'S1A' | 'S1B'>(
    preselectedStudent && preselectedStudent.section ? (preselectedStudent.section as any) : 'S1A'
  );
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    preselectedStudent ? preselectedStudent.id : ''
  );

  // Form state: supports Award (+) and Minus Penalty (-) with 5 marks maximum at once
  const [actionType, setActionType] = useState<'award' | 'deduct'>('award');
  const [title, setTitle] = useState('');
  const [remark, setRemark] = useState('');
  const [marksInput, setMarksInput] = useState<string>('5');
  const [date, setDate] = useState(getTodayDateString());
  const [teacherName, setTeacherName] = useState('');
  const [achievementPhoto, setAchievementPhoto] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [awardedDetails, setAwardedDetails] = useState<{ studentName: string; coins: number } | null>(null);

  useEffect(() => {
    const t = storage.getLoggedInTeacher();
    setLoggedInTeacher(t);
    if (t) {
      setTeacherName(t.name);
    }
  }, [isOpen]);

  useEffect(() => {
    if (preselectedStudent) {
      setSelectedMainClass(preselectedStudent.mainClass);
      if (preselectedStudent.section) {
        setSelectedSection(preselectedStudent.section as any);
      }
      setSelectedStudentId(preselectedStudent.id);
      setStep(3);
    }
  }, [preselectedStudent]);

  if (!isOpen) return null;

  // Handle Teacher Login (Only "teacher@dhkc" with mandatory name, position, email)
  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
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
      setAuthError('Teacher portal password is required.');
      return;
    }
    if (cleanPassword !== 'teacher@dhkc') {
      setAuthError('Incorrect password! Please enter the authorized password.');
      return;
    }

    const res = storage.verifyTeacherLogin({
      name: cleanName,
      position: cleanPosition,
      email: cleanEmail,
      password: cleanPassword
    });

    if (res.success && res.teacher) {
      setLoggedInTeacher(res.teacher);
      setTeacherName(res.teacher.name);
      setTeacherPasswordInput('');
    } else {
      setAuthError(res.error || 'Authentication failed.');
    }
  };

  // Get eligible students for Step 2
  const availableStudents =
    selectedMainClass === 'S1'
      ? storage.getStudentsByClass('S1', selectedSection)
      : storage.getStudentsByClass(selectedMainClass);

  const currentSelectedStudent = storage.getStudentById(selectedStudentId);

  // Handle Photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const dataUrl = await readFileAsDataUrl(file);
      setAchievementPhoto(dataUrl);
    }
  };

  // Handle final submission (Supports Award + and Minus Penalty - with no 5-mark cap)
  const handleSubmitAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    const numMarks = parseInt(marksInput, 10);
    if (isNaN(numMarks) || numMarks < 1) return;
    const effectiveCoins = actionType === 'award' ? numMarks : -numMarks;

    const tName = teacherName.trim() || loggedInTeacher?.name || teacherNameInput.trim() || 'Authorized Teacher';
    const tPosition = loggedInTeacher?.position || loggedInTeacher?.subject || teacherPositionInput.trim() || undefined;
    const tEmail = loggedInTeacher?.email || teacherEmailInput.trim() || undefined;

    const autoTitle = title.trim() || (actionType === 'award' ? `Conduct Award (+${numMarks} Marks)` : `Disciplinary Penalty (-${numMarks} Marks)`);
    const autoRemark = remark.trim() || (actionType === 'award' ? `Official conduct marks awarded (+${numMarks}) by ${tName}` : `Disciplinary penalty marks deducted (-${numMarks}) by ${tName}`);

    const ok = storage.awardStudentCoins(selectedStudentId, effectiveCoins, {
      title: autoTitle,
      remark: autoRemark,
      teacherName: tName,
      teacherPosition: tPosition,
      teacherEmail: tEmail,
      date,
      image: achievementPhoto || undefined,
    });

    if (ok) {
      const student = storage.getStudentById(selectedStudentId);
      setAwardedDetails({
        studentName: student?.name || 'Student',
        coins: effectiveCoins,
      });
      setIsSuccess(true);
    }
  };

  const handleResetForNext = () => {
    setIsSuccess(false);
    setTitle('');
    setRemark('');
    setMarksInput('5');
    setAchievementPhoto('');
    setStep(2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200/90 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header styled like an institutional evaluation form */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950 text-white shrink-0 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-bold font-display text-white leading-tight">
                  Students' Remarks & Rewards
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Teacher Portal
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Authorized Mentor Evaluation & Coin Award System
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Teacher Authentication Gate if not logged in */}
        {!loggedInTeacher && !storage.isAdminLoggedIn() ? (
          <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center max-w-sm mx-auto text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3 border border-amber-500/20 shadow-xs">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold font-display text-stone-900 leading-tight">
              Teacher / Mentor Login Required
            </h3>
            <p className="text-xs text-stone-500 mt-1 mb-4 leading-relaxed">
              To submit student remarks, please authenticate with your Name, Position, Email ID, and institutional password.
            </p>

            <form onSubmit={handleTeacherLogin} className="w-full space-y-3 text-left">
              {/* Teacher Full Name (MUST) */}
              <div>
                <label className="text-[11px] font-bold text-stone-700 flex items-center gap-1.5 mb-1">
                  <User className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Teacher Full Name <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={teacherNameInput}
                  onChange={(e) => setTeacherNameInput(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full text-xs py-2 px-3 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-medium"
                />
              </div>

              {/* Teacher Position / Designation (MUST) */}
              <div>
                <label className="text-[11px] font-bold text-stone-700 flex items-center gap-1.5 mb-1">
                  <Briefcase className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                  <span>Position / Designation <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={teacherPositionInput}
                  onChange={(e) => setTeacherPositionInput(e.target.value)}
                  placeholder="Enter position / designation"
                  className="w-full text-xs py-2 px-3 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-medium"
                />
              </div>

              {/* Teacher Email ID (MUST) */}
              <div>
                <label className="text-[11px] font-bold text-stone-700 flex items-center gap-1.5 mb-1">
                  <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Email ID <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="email"
                  required
                  value={teacherEmailInput}
                  onChange={(e) => setTeacherEmailInput(e.target.value)}
                  placeholder="Enter email ID"
                  className="w-full text-xs py-2 px-3 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-medium"
                />
              </div>

              {/* Strict Single Authorized Password: teacher@dhkc */}
              <div>
                <label className="text-[11px] font-bold text-stone-700 flex items-center gap-1.5 mb-1">
                  <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Authorized Password <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="password"
                  required
                  value={teacherPasswordInput}
                  onChange={(e) => setTeacherPasswordInput(e.target.value)}
                  placeholder="Enter password"
                  className="w-full text-xs py-2 px-3 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-mono font-bold tracking-wider"
                />
              </div>

              {authError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all mt-2 cursor-pointer shadow-md shadow-amber-500/20"
              >
                Authenticate Teacher & Continue
              </button>

              <p className="text-[10px] text-stone-500 text-center pt-1 font-medium">
                Security Rule: Every remark is strictly logged with your Name, Position, and Email ID.
              </p>
            </form>
          </div>
        ) : isSuccess ? (
          /* Success Screen */
          <div className="p-8 text-center overflow-y-auto flex-1 flex flex-col items-center justify-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold font-display text-stone-900">
                Coins & Remark Awarded Successfully!
              </h3>
              <p className="text-xs text-stone-600 max-w-sm mx-auto">
                <strong>+{awardedDetails?.coins} Coins</strong> have been credited to{' '}
                <strong>{awardedDetails?.studentName}</strong>. The 300 Coin progress and weekly
                leaderboard have been updated.
              </p>
            </div>

            <div className="pt-3 flex items-center gap-3">
              <button
                onClick={handleResetForNext}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs uppercase tracking-wider"
              >
                Award Another Student
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs"
              >
                Finish & Close
              </button>
            </div>
          </div>
        ) : (
          /* Multi-Step Form */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col justify-between">
            {/* Step indicator bar */}
            <div className="mb-5 flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                    step === 1 ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  1
                </span>
                <span className="text-xs font-semibold text-stone-800">Select Class</span>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400" />

                <span
                  className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                    step === 2 ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  2
                </span>
                <span className="text-xs font-semibold text-stone-800">Select Student</span>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400" />

                <span
                  className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                    step === 3 ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  3
                </span>
                <span className="text-xs font-semibold text-stone-800">Remarks Form</span>
              </div>

              {loggedInTeacher && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-lg border border-amber-300 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                    <span>{loggedInTeacher.name}</span>
                    <span className="text-stone-500 text-[10px] hidden sm:inline">
                      ({loggedInTeacher.position || loggedInTeacher.subject || 'Faculty'})
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      storage.teacherLogout();
                      setLoggedInTeacher(null);
                      setTeacherPasswordInput('');
                    }}
                    title="Sign in with a different faculty account"
                    className="text-[11px] text-stone-500 hover:text-rose-600 font-medium underline px-1 cursor-pointer"
                  >
                    Switch
                  </button>
                </div>
              )}
            </div>

            {/* STEP 1: SELECT CLASS */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                    Step 1: Choose Institutional Class
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['S1', 'S2', 'S3', 'S4', 'S5', 'SS1'] as MainClassType[]).map((cls) => (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => setSelectedMainClass(cls)}
                        className={`p-3 rounded-xl border text-sm font-bold transition-all text-center ${
                          selectedMainClass === cls
                            ? 'bg-amber-500/20 border-amber-500 text-amber-900 shadow-xs'
                            : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        Class {cls}
                      </button>
                    ))}
                  </div>
                </div>

                {/* S1 Sub-Section Choice */}
                {selectedMainClass === 'S1' && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                    <span className="text-xs font-bold text-amber-900 block">
                      Class S1 Sections (Select Section):
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedSection('S1A')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                          selectedSection === 'S1A'
                            ? 'bg-stone-900 text-white'
                            : 'bg-white border border-stone-200 text-stone-700'
                        }`}
                      >
                        Section S1A (35 students)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedSection('S1B')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                          selectedSection === 'S1B'
                            ? 'bg-stone-900 text-white'
                            : 'bg-white border border-stone-200 text-stone-700'
                        }`}
                      >
                        Section S1B (37 students)
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <span>Continue to Step 2</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: SELECT STUDENT */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-600">
                    Step 2: Choose Student in Class {selectedMainClass}
                    {selectedMainClass === 'S1' ? ` (${selectedSection})` : ''}
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-amber-700 hover:underline font-semibold"
                  >
                    Change Class
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-1.5 border border-stone-200 rounded-2xl p-2 bg-stone-50">
                  {availableStudents.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setSelectedStudentId(st.id);
                        setStep(3);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-all ${
                        selectedStudentId === st.id
                          ? 'bg-amber-500/20 border border-amber-500/40 text-stone-900 font-bold'
                          : 'bg-white hover:bg-stone-100 border border-stone-200/80 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-stone-100 font-mono text-xs font-bold text-stone-600 flex items-center justify-center shrink-0">
                          #{st.rollNo}
                        </span>
                        <div>
                          <div className="text-xs font-bold">{st.name}</div>
                          <div className="text-[10px] text-stone-500 font-mono">
                            Adm: {st.admissionNo} · Total: {st.totalCoins} coins
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400" />
                    </button>
                  ))}
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: ACHIEVEMENT & REMARKS FORM */}
            {step === 3 && currentSelectedStudent && (
              <form onSubmit={handleSubmitAchievement} className="space-y-4">
                {/* Selected Student Banner (auto-filled) */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 font-bold flex items-center justify-center shrink-0">
                      {currentSelectedStudent.photo ? (
                        <img
                          src={currentSelectedStudent.photo}
                          alt=""
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        currentSelectedStudent.name.slice(0, 2)
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900 leading-tight">
                        {currentSelectedStudent.name}
                      </h4>
                      <p className="text-xs text-stone-600 font-mono mt-0.5">
                        Roll: {currentSelectedStudent.rollNo} • Adm: {currentSelectedStudent.admissionNo} • Class: {currentSelectedStudent.mainClass}
                        {currentSelectedStudent.section ? ` (${currentSelectedStudent.section})` : ''}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs text-amber-800 underline font-semibold shrink-0"
                  >
                    Change
                  </button>
                </div>

                {/* Form Fields */}
                <div className="space-y-3">
                  {/* Select Action Type (Award or Minus Penalty) */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-stone-700">
                      Select Action Type (Award or Minus Penalty)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActionType('award');
                        }}
                        className={`p-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          actionType === 'award'
                            ? 'bg-amber-100 border-amber-500 text-amber-900 shadow-xs'
                            : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Award Marks (+)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActionType('deduct');
                        }}
                        className={`p-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          actionType === 'deduct'
                            ? 'bg-rose-100 border-rose-500 text-rose-900 shadow-xs'
                            : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        <MinusCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Minus Penalty (−)</span>
                      </button>
                    </div>
                  </div>

                  {/* Marks Text Bar (No maximum 5 marks limit) */}
                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-amber-600" />
                        <span>Marks to {actionType === 'award' ? 'Award' : 'Minus'} *</span>
                      </label>
                      <span
                        className={`font-mono text-xs font-extrabold px-2 py-0.5 rounded ${
                          actionType === 'award'
                            ? 'text-emerald-800 bg-emerald-100'
                            : 'text-rose-800 bg-rose-100'
                        }`}
                      >
                        {actionType === 'award' ? '+' : '−'}
                        {marksInput || 0} Marks
                      </span>
                    </div>

                    <div>
                      <input
                        type="number"
                        min="1"
                        required
                        value={marksInput}
                        onChange={(e) => setMarksInput(e.target.value)}
                        placeholder="Enter marks"
                        className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900"
                      />
                    </div>

                    {/* Math Preview (e.g. 200 - 2 = 198) */}
                    {(() => {
                      const m = parseInt(marksInput, 10);
                      const valid = !isNaN(m) && m >= 1;
                      const curr = currentSelectedStudent?.totalCoins || 0;
                      const nextTotal = actionType === 'award' ? curr + (valid ? m : 0) : Math.max(0, curr - (valid ? m : 0));
                      return (
                        <div className="p-2 rounded-xl bg-white border border-stone-200 text-[11px] flex items-center justify-between">
                          <span className="text-stone-500">
                            Calculation: <strong className="text-stone-800">{curr}</strong> {actionType === 'award' ? '+' : '−'} <strong className={actionType === 'award' ? 'text-emerald-700' : 'text-rose-700'}>{valid ? m : 0}</strong>
                          </span>
                          <span className="font-mono font-bold text-amber-800">
                            = {nextTotal} Marks
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Evaluator Name & Date */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Teacher / Mentor Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={teacherName}
                        onChange={(e) => setTeacherName(e.target.value)}
                        placeholder="Teacher Full Name"
                        className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-mono"
                      />
                    </div>
                  </div>

                  {/* Optional Photo Attachment */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Optional Photo Notice / Certificate
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer inline-flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-stone-500" />
                        <span>Choose Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoUpload}
                        />
                      </label>
                      {achievementPhoto && (
                        <span className="text-xs text-emerald-600 font-medium">Photo attached</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2 flex items-center justify-between border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={
                      parseInt(marksInput, 10) < 1 ||
                      isNaN(parseInt(marksInput, 10))
                    }
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer ${
                      parseInt(marksInput, 10) < 1 || isNaN(parseInt(marksInput, 10))
                        ? 'bg-stone-300 text-stone-500 cursor-not-allowed opacity-60'
                        : actionType === 'award'
                        ? 'bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-amber-500/20'
                        : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                    }`}
                  >
                    {actionType === 'award' ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Submit & Award +{marksInput || 0} Marks</span>
                      </>
                    ) : (
                      <>
                        <MinusCircle className="w-3.5 h-3.5" />
                        <span>Submit & Minus −{marksInput || 0} Marks</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
