import React, { useState, useEffect } from 'react';
import {
  Shield,
  X,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Calendar,
  Sparkles,
  UtensilsCrossed,
  Camera,
  Users,
  AlertTriangle,
  Image as ImageIcon,
  MessageSquare,
  History,
  Save,
  Check,
  Award,
  Clock,
  KeyRound,
  RotateCcw,
  GraduationCap,
  Trophy,
  ChefHat,
  Layers,
  HeartHandshake,
  Search,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  Bell,
  Coins,
  QrCode,
  FileImage
} from 'lucide-react';
import {
  Announcement,
  DiningHallInfo,
  FoodItem,
  GalleryItem,
  MealCategory,
  MealCategoryConfig,
  MEAL_CATEGORIES,
  TeamMember,
  Student,
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
  MainClassType
} from '../../types';
import { storage } from '../../services/storage';
import { api } from '../../services/api';
import { getTodayDateString, HERO_IMAGE } from '../../data/initialData';
import { readFileAsDataUrl, formatDateToReadable } from '../../utils/imageHelper';

function formatTime12h(timeStr: string): string {
  if (!timeStr) return '';
  if (/am|pm/i.test(timeStr)) return timeStr;
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10) || 0;
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  const hDisplay = String(h).padStart(2, '0');
  const mDisplay = String(m).padStart(2, '0');
  return `${hDisplay}:${mDisplay} ${ampm}`;
}

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
  onSelectStudent?: (student: Student) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  initialTab = 'overview',
  onSelectStudent,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState(initialTab);
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Data states
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [diningInfo, setDiningInfo] = useState<DiningHallInfo>(storage.getDiningHallInfo());
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(storage.getTeamMembers());
  const [announcements, setAnnouncements] = useState<Announcement[]>(storage.getAnnouncements());
  const [gallery, setGallery] = useState<GalleryItem[]>(storage.getGallery());
  const [comments, setComments] = useState(storage.getAllComments());
  const [banners, setBanners] = useState<PromotionalBanner[]>(storage.getAllBanners());
  const [students, setStudents] = useState<Student[]>(storage.getAllStudents());
  const [mealConfigs, setMealConfigs] = useState<MealCategoryConfig[]>(storage.getMealCategories());
  const [plates, setPlates] = useState<PlateCount>(storage.getPlateCount());
  const [glasses, setGlasses] = useState<GlassCount>(storage.getGlassCount());
  const [tableEquipment, setTableEquipment] = useState<TableEquipmentItem[]>(storage.getTableEquipment());
  const [reminders, setReminders] = useState<DiningReminder[]>(storage.getReminders());
  const [donationSettings, setDonationSettings] = useState<DonationSettings>(storage.getDonationSettings());
  const [milestoneSettings, setMilestoneSettings] = useState<MilestoneSettings>(storage.getMilestoneSettings());
  const [winnerSettings, setWinnerSettings] = useState<WinnerOfWeekSettings>(storage.getWinnerSettings());
  const [teachers, setTeachers] = useState<TeacherUser[]>(storage.getTeachers());
  const [cooks, setCooks] = useState<CookUser[]>(storage.getCooks());
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newCookPassword, setNewCookPassword] = useState('');
  const [newTeacherPin, setNewTeacherPin] = useState('');
  const [securityAlertEmailInput, setSecurityAlertEmailInput] = useState<string>(storage.getSecurityAlertEmail());
  const [securityAlertsList, setSecurityAlertsList] = useState<any[]>(storage.getSecurityAlerts());

  // Dedicated Today's Food 5 Shifts State
  const [todayMealsForm, setTodayMealsForm] = useState<
    Array<{
      id: MealCategory;
      name: string;
      foodName: string;
      startTime: string;
      endTime: string;
    }>
  >([]);

  // Modals & sub-form states
  const [editingFood, setEditingFood] = useState<Partial<FoodItem> | null>(null);
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Partial<PromotionalBanner> | null>(null);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Partial<Student> | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [editingTeacher, setEditingTeacher] = useState<Partial<TeacherUser> | null>(null);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingCook, setEditingCook] = useState<Partial<CookUser> | null>(null);
  const [isCookModalOpen, setIsCookModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Partial<TableEquipmentItem> | null>(null);
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [newReminderText, setNewReminderText] = useState('');
  const [newReminderPriority, setNewReminderPriority] = useState<'normal' | 'high'>('normal');

  const refreshAll = () => {
    setFoodItems(storage.getFoodItemsByDate(selectedDate));
    setDiningInfo(storage.getDiningHallInfo());
    setTeamMembers(storage.getTeamMembers());
    setAnnouncements(storage.getAnnouncements());
    setGallery(storage.getGallery());
    setComments(storage.getAllComments());
    setBanners(storage.getAllBanners());
    setStudents(storage.getAllStudents());
    const cats = storage.getMealCategories();
    setMealConfigs(cats);
    setPlates(storage.getPlateCount());
    setGlasses(storage.getGlassCount());
    setTableEquipment(storage.getTableEquipment());
    setReminders(storage.getReminders());
    setDonationSettings(storage.getDonationSettings());
    setMilestoneSettings(storage.getMilestoneSettings());
    setWinnerSettings(storage.getWinnerSettings());
    setTeachers(storage.getTeachers());
    setCooks(storage.getCooks());

    // Populate Today's Food form for all 5 shifts
    const today = getTodayDateString();
    const todayFood = storage.getFoodItemsByDate(today);
    const initializedForm = cats.map((cat) => {
      const items = todayFood.filter((i) => i.mealCategory === cat.id);
      const currentFood = items.length > 0 ? items.map((i) => i.foodName).join(', ') : '';
      return {
        id: cat.id,
        name: cat.name,
        foodName: currentFood,
        startTime: cat.startTime || '07:00',
        endTime: cat.endTime || '08:00',
      };
    });
    setTodayMealsForm(initializedForm);
  };

  useEffect(() => {
    refreshAll();
    api.syncWithServer().then(() => {
      setStudents(storage.getAllStudents());
    }).catch(() => {});
  }, [selectedDate]);

  useEffect(() => {
    if (initialTab) {
      setActiveAdminTab(initialTab);
    }
  }, [initialTab]);

  const showNotification = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  if (!isOpen) return null;

  // ---------------- FOOD CRUD ----------------
  const handleOpenAddFood = (category: MealCategory = 'lunch', date = selectedDate) => {
    const catConfig = mealConfigs.find((m) => m.id === category);
    setEditingFood({
      date,
      mealCategory: category,
      foodName: '',
      time: catConfig?.defaultTime || '12:30 PM - 02:30 PM',
      description: '',
      speciality: '',
      sponsoredBy: '',
      image: '',
    });
    setIsFoodModalOpen(true);
  };

  const handleOpenEditFood = (food: FoodItem) => {
    setEditingFood({ ...food });
    setIsFoodModalOpen(true);
  };

  const handleSaveFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFood?.foodName?.trim() || !editingFood?.date || !editingFood?.mealCategory) {
      alert('Please fill in food name, date, and category.');
      return;
    }

    if (editingFood.id) {
      storage.updateFoodItem(editingFood.id, editingFood);
      showNotification(`Updated "${editingFood.foodName}" successfully!`);
    } else {
      storage.addFoodItem(
        editingFood as Omit<FoodItem, 'id' | 'likes' | 'commentCount' | 'createdAt'>
      );
      showNotification(`Added "${editingFood.foodName}" to schedule!`);
    }

    setIsFoodModalOpen(false);
    setEditingFood(null);
    refreshAll();
  };

  const handleDeleteFood = (id: string, name: string) => {
    storage.deleteFoodItem(id);
    showNotification(`Deleted "${name}".`);
    refreshAll();
  };

  // ---------------- BANNER CRUD ----------------
  const handleOpenAddBanner = () => {
    setEditingBanner({
      title: '',
      description: '',
      buttonText: 'View Details',
      linkUrl: 'menu',
      startDate: getTodayDateString(),
      endDate: getTodayDateString(),
      published: true,
      image: '',
    });
    setIsBannerModalOpen(true);
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner?.title?.trim()) {
      alert('Please enter a banner title.');
      return;
    }

    if (editingBanner.id) {
      storage.updateBanner(editingBanner.id, editingBanner);
      showNotification('Promotional banner updated!');
    } else {
      storage.addBanner({
        title: editingBanner.title.trim(),
        description: editingBanner.description || '',
        buttonText: editingBanner.buttonText || '',
        linkUrl: editingBanner.linkUrl || '',
        startDate: editingBanner.startDate || getTodayDateString(),
        endDate: editingBanner.endDate || getTodayDateString(),
        published: editingBanner.published ?? true,
        image: editingBanner.image || '',
      });
      showNotification('New promotional banner created!');
    }

    setIsBannerModalOpen(false);
    setEditingBanner(null);
    refreshAll();
  };

  const handleDeleteBanner = (id: string) => {
    storage.deleteBanner(id);
    showNotification('Banner deleted.');
    refreshAll();
  };

  // ---------------- STUDENT PHOTO MANAGEMENT ----------------
  const handleUploadStudentPhoto = async (studentId: string, file: File) => {
    try {
      const dataUrl = await readFileAsDataUrl(file);
      storage.updateStudentPhoto(studentId, dataUrl);
      showNotification('Student photo updated successfully!');
      refreshAll();
    } catch {
      alert('Failed to upload student photo.');
    }
  };

  const handleDeleteStudentPhoto = (studentId: string) => {
    storage.updateStudentPhoto(studentId, undefined);
    showNotification('Student photo removed.');
    refreshAll();
  };

  // ---------------- HERO IMAGE ----------------
  const handleHeroImageUpload = async (file: File) => {
    try {
      const dataUrl = await readFileAsDataUrl(file);
      storage.updateHeroImage(dataUrl);
      setDiningInfo((prev) => ({ ...prev, backgroundImage: dataUrl }));
      showNotification('Dining Hall hero background image updated!');
    } catch {
      alert('Failed to process image.');
    }
  };

  const handleResetHeroImage = () => {
    if (confirm('Reset hero image to default dining hall photograph?')) {
      storage.resetHeroImage();
      refreshAll();
      showNotification('Hero image reset to default.');
    }
  };

  // ---------------- APP LOGO & BRANDING ----------------
  const handleAppLogoUpload = async (file: File) => {
    try {
      const dataUrl = await readFileAsDataUrl(file);
      storage.updateAppLogo(dataUrl);
      setDiningInfo((prev) => ({ ...prev, appLogo: dataUrl }));
      showNotification('App Logo updated successfully across the entire app!');
    } catch {
      alert('Failed to process logo image.');
    }
  };

  const handleResetAppLogo = () => {
    if (confirm('Reset App Logo to the official default DHKC emblem?')) {
      storage.resetAppLogo();
      refreshAll();
      showNotification('App Logo reset to official default.');
    }
  };

  const handleUpdateAppName = (e: React.FormEvent) => {
    e.preventDefault();
    storage.setDiningHallInfo(diningInfo);
    showNotification('App brand name and details updated successfully!');
  };

  // ---------------- WEEKLY CYCLE & COINS RESET ----------------
  const handleResetWeeklyCycle = () => {
    if (
      confirm(
        'Are you sure you want to start a new Weekly Cycle? This will reset all students weekly coin counters to 0, but ALL lifetime coins will be permanently preserved.'
      )
    ) {
      storage.resetWeeklyCycle();
      refreshAll();
      showNotification('Weekly cycle reset! New weekly competition started.');
    }
  };

  const handleResetAllCoins = () => {
    if (
      confirm(
        'Are you sure you want to make ALL student points, total coins, and weekly coins ZERO across the entire institution? This will reset both Total Coins and Weekly Coins to 0 for all students.'
      )
    ) {
      storage.resetAllStudentsCoinsToZero();
      refreshAll();
      showNotification('All student points, total coins, and weekly coins have been reset to 0!');
    }
  };

  // ---------------- REMINDERS ----------------
  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderText.trim()) return;
    storage.addReminder({
      text: newReminderText.trim(),
      priority: newReminderPriority,
      active: true,
    });
    setNewReminderText('');
    refreshAll();
    showNotification('Dining reminder added.');
  };

  const handleDeleteReminder = (id: string) => {
    storage.deleteReminder(id);
    refreshAll();
    showNotification('Reminder deleted.');
  };

  // ---------------- EQUIPMENT SAVE ----------------
  const handleSaveEquipmentCounts = (e: React.FormEvent) => {
    e.preventDefault();
    storage.updatePlateCount(plates);
    storage.updateGlassCount(glasses);
    showNotification('Plate and glass counts updated successfully!');
  };

  // ---------------- DONATE SETTINGS SAVE ----------------
  const handleSaveDonationSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storage.setDonationSettings(donationSettings);
    showNotification('Donation QR and instructions saved!');
  };

  const handleUploadDonationQR = async (file: File) => {
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setDonationSettings((prev) => ({ ...prev, qrImage: dataUrl }));
      storage.setDonationSettings({ ...donationSettings, qrImage: dataUrl });
      showNotification('Donation QR Code uploaded!');
    } catch {
      alert('Failed to process QR image.');
    }
  };

  const handleDeleteDonationQR = () => {
    if (confirm('Delete current donation QR code?')) {
      setDonationSettings((prev) => ({ ...prev, qrImage: '' }));
      storage.setDonationSettings({ ...donationSettings, qrImage: '' });
      showNotification('QR Code deleted.');
    }
  };

  // ---------------- PASSWORD ----------------
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPassword.trim() || newAdminPassword.length < 4) {
      alert('Password must be at least 4 characters.');
      return;
    }
    storage.setAdminPassword(newAdminPassword.trim());
    setNewAdminPassword('');
    showNotification('Admin password updated successfully!');
  };

  const handleChangeCookPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCookPassword.trim() || newCookPassword.length < 3) {
      alert('Cook password must be at least 3 characters.');
      return;
    }
    const currentCooks = storage.getCooks();
    const updated = currentCooks.map((c) => ({ ...c, password: newCookPassword.trim() }));
    storage.setCooks(updated);
    setCooks(updated);
    setNewCookPassword('');
    showNotification("Cook's password updated successfully!");
  };

  const handleChangeTeacherPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherPin.trim() || newTeacherPin.length < 2) {
      alert('Teacher PIN must be at least 2 characters.');
      return;
    }
    const currentTeachers = storage.getTeachers();
    const updated = currentTeachers.map((t) => ({ ...t, pin: newTeacherPin.trim() }));
    storage.setTeachers(updated);
    setTeachers(updated);
    setNewTeacherPin('');
    showNotification("Teachers' PIN / Password updated successfully!");
  };

  const handleSaveSecurityEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = securityAlertEmailInput.trim().toLowerCase();
    if (!clean || !clean.includes('@') || !clean.includes('.')) {
      alert('Please enter a valid notification email address.');
      return;
    }
    await api.setSecurityAlertEmail(clean);
    storage.setSecurityAlertEmail(clean);
    setSecurityAlertEmailInput(clean);
    setSecurityAlertsList(storage.getSecurityAlerts());
    showNotification(`Security notification recipient email updated to "${clean}"!`);
  };

  // ---------------- TODAY'S FOOD 5 SHIFTS MANAGEMENT ----------------
  const handleUpdateTodayMealField = (
    catId: MealCategory,
    field: 'foodName' | 'startTime' | 'endTime',
    val: string
  ) => {
    setTodayMealsForm((prev) =>
      prev.map((item) => (item.id === catId ? { ...item, [field]: val } : item))
    );
  };

  const handleSaveSingleTodayMeal = (catId: MealCategory) => {
    const row = todayMealsForm.find((r) => r.id === catId);
    if (!row) return;

    const today = getTodayDateString();
    const timeRange = `${formatTime12h(row.startTime)} - ${formatTime12h(row.endTime)}`;

    // 1. Update meal category timings in storage
    storage.updateMealCategoryTiming(catId, {
      startTime: row.startTime,
      endTime: row.endTime,
      defaultTime: timeRange
    });

    // 2. Update food items for today
    const existingItems = storage.getFoodItemsByDate(today).filter((i) => i.mealCategory === catId);

    if (row.foodName.trim().length > 0) {
      if (existingItems.length > 0) {
        storage.updateFoodItem(existingItems[0].id, {
          foodName: row.foodName.trim(),
          time: timeRange
        });
        for (let k = 1; k < existingItems.length; k++) {
          storage.deleteFoodItem(existingItems[k].id);
        }
      } else {
        storage.addFoodItem({
          date: today,
          mealCategory: catId,
          foodName: row.foodName.trim(),
          time: timeRange,
          addedBy: 'admin'
        });
      }
    } else {
      existingItems.forEach((i) => storage.deleteFoodItem(i.id));
    }

    refreshAll();
    showNotification(`Saved "${row.name}" food & timings successfully!`);
  };

  const handleSaveAllTodayMeals = () => {
    const today = getTodayDateString();

    todayMealsForm.forEach((row) => {
      const timeRange = `${formatTime12h(row.startTime)} - ${formatTime12h(row.endTime)}`;

      storage.updateMealCategoryTiming(row.id, {
        startTime: row.startTime,
        endTime: row.endTime,
        defaultTime: timeRange
      });

      const existingItems = storage.getFoodItemsByDate(today).filter((i) => i.mealCategory === row.id);

      if (row.foodName.trim().length > 0) {
        if (existingItems.length > 0) {
          storage.updateFoodItem(existingItems[0].id, {
            foodName: row.foodName.trim(),
            time: timeRange
          });
          for (let k = 1; k < existingItems.length; k++) {
            storage.deleteFoodItem(existingItems[k].id);
          }
        } else {
          storage.addFoodItem({
            date: today,
            mealCategory: row.id,
            foodName: row.foodName.trim(),
            time: timeRange,
            addedBy: 'admin'
          });
        }
      } else {
        existingItems.forEach((i) => storage.deleteFoodItem(i.id));
      }
    });

    refreshAll();
    showNotification("All 5 Today's Food shifts & timings updated successfully!");
  };

  const handleClearTodayMeal = (catId: MealCategory) => {
    const row = todayMealsForm.find((r) => r.id === catId);
    if (!row) return;

    const today = getTodayDateString();
    const existingItems = storage.getFoodItemsByDate(today).filter((i) => i.mealCategory === catId);
    existingItems.forEach((i) => storage.deleteFoodItem(i.id));

    setTodayMealsForm((prev) =>
      prev.map((item) => (item.id === catId ? { ...item, foodName: '' } : item))
    );

    refreshAll();
    showNotification(`Cleared dish for ${row.name}.`);
  };

  // Tab Definitions
  const navTabs = [
    { id: 'overview', label: 'Dashboard Overview', icon: Shield },
    { id: 'update_today', label: "Today's Food", icon: Sparkles, badge: 'Live' },
    { id: 'manage_menu', label: 'Date-wise Menu', icon: UtensilsCrossed },
    { id: 'meal_timings', label: 'Meal Timings', icon: Clock },
    { id: 'promotional_banners', label: 'Manage Banners', icon: Megaphone },
    { id: 'dining_hero_image', label: 'Hero Image', icon: ImageIcon },
    { id: 'app_logo', label: 'App Logo', icon: FileImage, badge: 'New' },
    { id: 'manage_students', label: 'Manage Students', icon: GraduationCap },
    { id: 'student_photos', label: 'Student Photos', icon: Camera },
    { id: 'rewards_300', label: '300 Coin Reward', icon: Award },
    { id: 'winner_of_week', label: 'Winner of the Week', icon: Trophy },
    { id: 'teachers_mentors', label: 'Teachers / Mentors', icon: Users },
    { id: 'cook_accounts', label: 'Cook Accounts', icon: ChefHat },
    { id: 'equipment_tracking', label: 'Plate & Glass Tracking', icon: Layers },
    { id: 'dining_reminders', label: 'Dining Reminders', icon: Bell },
    { id: 'urgent_specials', label: 'Urgent & Specials', icon: AlertTriangle },
    { id: 'incharge_assistant', label: 'Incharge & Assistant', icon: Users },
    { id: 'our_team', label: 'Manage Our Team', icon: Users },
    { id: 'manage_gallery', label: 'Manage Gallery', icon: Camera },
    { id: 'donate_qr', label: 'Donate / QR Management', icon: HeartHandshake },
    { id: 'manage_comments', label: 'Moderate Comments', icon: MessageSquare },
    { id: 'app_settings', label: 'App Settings & Security', icon: KeyRound },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-stone-900 text-stone-100 overflow-hidden animate-in fade-in duration-150">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-4 right-4 z-60 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top">
          <Check className="w-4 h-4" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Top Bar */}
      <header className="h-16 px-4 sm:px-6 bg-stone-950 border-b border-stone-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold font-display text-white tracking-tight flex items-center gap-2">
              DHKC CANTEEN · ADMIN PANEL
            </h1>
            <p className="text-[11px] text-stone-400">
              Master Institutional Dining Hall & Student Reward Administration
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-10 h-10 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
          aria-label="Exit admin panel"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Sub Navigation Bar */}
      <div className="bg-stone-900 border-b border-stone-800 px-4 py-2 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-amber-950 text-amber-300 font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-900/50">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* TAB: OVERVIEW */}
          {activeAdminTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
                  <div className="text-[11px] font-semibold text-stone-400">Total Registered Students</div>
                  <div className="text-2xl font-black font-display text-white mt-1">{students.length}</div>
                  <div className="text-[10px] text-amber-400 mt-0.5">Classes S1-SS1</div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
                  <div className="text-[11px] font-semibold text-stone-400">Total Coins in Circulation</div>
                  <div className="text-2xl font-black font-display text-amber-400 mt-1">
                    {students.reduce((acc, s) => acc + (s.totalCoins || 0), 0)}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">Lifetime awards</div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
                  <div className="text-[11px] font-semibold text-stone-400">Available Plates / Glasses</div>
                  <div className="text-2xl font-black font-display text-white mt-1">
                    {plates.available} / {glasses.available}
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">Ready for service</div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
                  <div className="text-[11px] font-semibold text-stone-400">Active Banners / Notices</div>
                  <div className="text-2xl font-black font-display text-white mt-1">
                    {banners.filter((b) => b.published).length} / {announcements.filter((a) => a.active).length}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">Published currently</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-3">
                <h3 className="text-sm font-bold font-display uppercase tracking-wider text-amber-400">
                  Institutional Quick Controls
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    onClick={() => setActiveAdminTab('update_today')}
                    className="p-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-left"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400 mb-1" />
                    <div className="text-xs font-bold">Update Today's Food</div>
                    <div className="text-[10px] text-stone-500">Add or edit dishes</div>
                  </button>

                  <button
                    onClick={() => setActiveAdminTab('promotional_banners')}
                    className="p-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-left"
                  >
                    <Megaphone className="w-4 h-4 text-amber-400 mb-1" />
                    <div className="text-xs font-bold">Create Promo Banner</div>
                    <div className="text-[10px] text-stone-500">Event announcements</div>
                  </button>

                  <button
                    onClick={() => setActiveAdminTab('winner_of_week')}
                    className="p-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-left"
                  >
                    <Trophy className="w-4 h-4 text-amber-400 mb-1" />
                    <div className="text-xs font-bold">Winner of Week</div>
                    <div className="text-[10px] text-stone-500">Leaderboard & cycle</div>
                  </button>

                  <button
                    onClick={() => setActiveAdminTab('donate_qr')}
                    className="p-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-left"
                  >
                    <HeartHandshake className="w-4 h-4 text-rose-400 mb-1" />
                    <div className="text-xs font-bold">Donation QR</div>
                    <div className="text-[10px] text-stone-500">Upload or replace QR</div>
                  </button>

                  <button
                    onClick={() => setActiveAdminTab('app_logo')}
                    className="p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-left group"
                  >
                    <FileImage className="w-4 h-4 text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
                    <div className="text-xs font-bold text-amber-300">Update App Logo</div>
                    <div className="text-[10px] text-stone-400">Change branding emblem</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: TODAY'S FOOD & QUICK UPDATE */}
          {activeAdminTab === 'update_today' && (
            <div className="space-y-6">
              {/* Header with Save All button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800">
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-display text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    Today's Food & Serving Timings
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Enter the food name and set the start & end serving times for each of the 5 daily shifts ({getTodayDateString()}).
                  </p>
                </div>

                <button
                  onClick={handleSaveAllTodayMeals}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save All 5 Shifts</span>
                </button>
              </div>

              {/* Exactly 5 meal categories simple editor */}
              <div className="space-y-4">
                {todayMealsForm.map((row) => (
                  <div
                    key={row.id}
                    className="p-4 sm:p-5 rounded-2xl bg-stone-950 border border-stone-800/90 shadow-md space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold shrink-0">
                          <UtensilsCrossed className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white tracking-wide">
                            {row.name}
                          </h4>
                          <p className="text-[11px] font-mono text-stone-400">
                            Current Window: {formatTime12h(row.startTime)} - {formatTime12h(row.endTime)}
                          </p>
                        </div>
                      </div>

                      {row.foodName && (
                        <button
                          onClick={() => handleClearTodayMeal(row.id)}
                          className="text-[11px] text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                          title="Clear dish for this shift"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Clear Food</span>
                        </button>
                      )}
                    </div>

                    {/* Inputs: Food Name (Text) + Start Time + End Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                      {/* Food Item Name text field */}
                      <div className="sm:col-span-6">
                        <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider block mb-1">
                          Food Item Name *
                        </label>
                        <input
                          type="text"
                          value={row.foodName}
                          onChange={(e) => handleUpdateTodayMealField(row.id, 'foodName', e.target.value)}
                          placeholder={`Enter food name (e.g. ${
                            row.id === 'morning_tea'
                              ? 'Tea & Biscuits'
                              : row.id === 'breakfast'
                              ? 'Paratha & Egg'
                              : row.id === 'lunch'
                              ? 'Rice & Dal'
                              : row.id === 'evening_tea'
                              ? 'Tea & Snacks'
                              : 'Rice & Curry'
                          })`}
                          className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                        />
                      </div>

                      {/* Start Time (Time input) */}
                      <div className="sm:col-span-3">
                        <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider block mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={row.startTime}
                          onChange={(e) => handleUpdateTodayMealField(row.id, 'startTime', e.target.value)}
                          className="w-full px-3 py-2.5 bg-stone-900 border border-stone-700/80 rounded-xl text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* End Time (Time input) */}
                      <div className="sm:col-span-3">
                        <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider block mb-1">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={row.endTime}
                          onChange={(e) => handleUpdateTodayMealField(row.id, 'endTime', e.target.value)}
                          className="w-full px-3 py-2.5 bg-stone-900 border border-stone-700/80 rounded-xl text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Row save button */}
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleSaveSingleTodayMeal(row.id)}
                        className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save {row.name}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Save All Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSaveAllTodayMeals}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save All 5 Shifts & Timings</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: MANAGE MENU (Date-wise) */}
          {activeAdminTab === 'manage_menu' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
                <div>
                  <h3 className="text-base font-bold font-display text-white">Date-wise Menu Scheduler</h3>
                  <p className="text-xs text-stone-400">
                    Schedule unlimited menu items for past, current, or upcoming dates.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-1.5 bg-stone-950 border border-stone-700 rounded-xl text-xs font-mono text-white"
                  />
                  <button
                    onClick={() => handleOpenAddFood('lunch', selectedDate)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>

              {/* Items for selected date */}
              <div className="space-y-4">
                {mealConfigs.map((cat) => {
                  const items = storage.getFoodItemsByDate(selectedDate).filter((i) => i.mealCategory === cat.id);
                  return (
                    <div key={cat.id} className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-800">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                          {cat.name} ({items.length})
                        </span>
                        <button
                          onClick={() => handleOpenAddFood(cat.id, selectedDate)}
                          className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Plus className="w-3 h-3" /> Add item to {cat.name}
                        </button>
                      </div>

                      {items.length === 0 ? (
                        <p className="text-xs text-stone-500 italic py-2">No items scheduled for this shift.</p>
                      ) : (
                        <div className="space-y-2">
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between"
                            >
                              <div>
                                <h5 className="text-xs font-bold text-white">{item.foodName}</h5>
                                <p className="text-[11px] text-stone-400">{item.time} · {item.description}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleOpenEditFood(item)}
                                  className="p-1.5 rounded-lg text-stone-400 hover:text-white"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteFood(item.id, item.foodName)}
                                  className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/30"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: MEAL TIMINGS */}
          {activeAdminTab === 'meal_timings' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold font-display text-white">Meal Timings Configuration</h3>
                <p className="text-xs text-stone-400">
                  Configure default times, start times, and end times for all 5 daily meal shifts.
                </p>
              </div>

              <div className="space-y-3">
                {mealConfigs.map((cat) => (
                  <div key={cat.id} className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-amber-400">{cat.name}</h4>
                      <span className="text-xs font-mono text-stone-400">{cat.defaultTime}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="text-[11px] font-semibold text-stone-400 block mb-1">
                          Display Label
                        </label>
                        <input
                          type="text"
                          value={cat.defaultTime}
                          onChange={(e) => {
                            storage.updateMealCategoryTiming(cat.id, { defaultTime: e.target.value });
                            refreshAll();
                          }}
                          className="w-full px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-xl text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-stone-400 block mb-1">
                          Start Time (24h HH:mm)
                        </label>
                        <input
                          type="text"
                          value={cat.startTime}
                          onChange={(e) => {
                            storage.updateMealCategoryTiming(cat.id, { startTime: e.target.value });
                            refreshAll();
                          }}
                          className="w-full px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-xl text-xs text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-stone-400 block mb-1">
                          End Time (24h HH:mm)
                        </label>
                        <input
                          type="text"
                          value={cat.endTime}
                          onChange={(e) => {
                            storage.updateMealCategoryTiming(cat.id, { endTime: e.target.value });
                            refreshAll();
                          }}
                          className="w-full px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-xl text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: PROMOTIONAL BANNERS */}
          {activeAdminTab === 'promotional_banners' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div>
                  <h3 className="text-base font-bold font-display text-white">
                    Manage Promotional Banners
                  </h3>
                  <p className="text-xs text-stone-400">
                    Temporary rectangular banners for special programs, events, campaigns & competitions.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddBanner}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Banner</span>
                </button>
              </div>

              {banners.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-stone-950 border border-stone-800 text-stone-500 text-xs">
                  No promotional banners created yet. Create one to highlight temporary dining events.
                </div>
              ) : (
                <div className="space-y-3">
                  {banners.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              b.published
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-stone-800 text-stone-400'
                            }`}
                          >
                            {b.published ? 'Published' : 'Draft / Unpublished'}
                          </span>
                          <span className="text-xs text-stone-400">
                            Valid: {b.startDate} to {b.endDate}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{b.title}</h4>
                        <p className="text-xs text-stone-400">{b.description}</p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => {
                            storage.updateBanner(b.id, { published: !b.published });
                            refreshAll();
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            b.published
                              ? 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                        >
                          {b.published ? 'Unpublish' : 'Publish'}
                        </button>

                        <button
                          onClick={() => {
                            setEditingBanner(b);
                            setIsBannerModalOpen(true);
                          }}
                          className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteBanner(b.id)}
                          className="p-2 rounded-xl text-rose-400 hover:bg-rose-950/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: HERO IMAGE */}
          {activeAdminTab === 'dining_hero_image' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold font-display text-white">
                  Change Dining Hall Hero Image
                </h3>
                <p className="text-xs text-stone-400">
                  Replace or reset the large photograph appearing at the top of the Dining Hall portal.
                </p>
              </div>

              {/* Current Hero Preview */}
              <div className="rounded-3xl overflow-hidden border border-stone-800 bg-stone-950 shadow-xl relative aspect-video max-h-72">
                <img
                  src={diningInfo.backgroundImage}
                  alt="Current Hero"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 text-xs font-semibold text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-md">
                  Current Hero Image Preview
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <label className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider cursor-pointer inline-flex items-center gap-2 shadow-md">
                  <Upload className="w-4 h-4" />
                  <span>Upload & Replace Hero Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleHeroImageUpload(file);
                    }}
                  />
                </label>

                <button
                  onClick={handleResetHeroImage}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset to Default Photograph</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: APP LOGO & BRANDING */}
          {activeAdminTab === 'app_logo' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                    Brand Management
                  </span>
                </div>
                <h3 className="text-base font-bold font-display text-white mt-1">
                  Change / Update App Logo
                </h3>
                <p className="text-xs text-stone-400">
                  Update the official emblem appearing in the top navigation header, install screen, mobile home screen icon, and team portal.
                </p>
              </div>

              {/* Logo Preview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Round Header Preview */}
                <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-3">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-bold block">
                    Header & Navigation Preview
                  </span>
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#0b1220] border border-[#1b2b48]">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500/80 shadow-md shadow-amber-500/25 shrink-0 bg-[#0b1220] flex items-center justify-center p-0.5">
                      <img
                        src={diningInfo.appLogo || '/logo.png'}
                        alt="Current Logo"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/logo.png';
                        }}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-white font-display">
                        {diningInfo.appName || 'DHKC CANTEEN'}
                      </div>
                      <div className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">
                        LIVE DINING BOARD
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Displayed in the fixed top bar and mobile navigation.
                  </p>
                </div>

                {/* Mobile / PWA App Icon Preview */}
                <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-3">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-bold block">
                    Mobile App Icon Preview
                  </span>
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#0b1220] border border-[#1b2b48]">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-500/60 shadow-lg shadow-amber-500/20 shrink-0 bg-[#0b1220]">
                      <img
                        src={diningInfo.appLogo || '/logo.png'}
                        alt="App Icon"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/logo.png';
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">Home Screen Icon</div>
                      <div className="text-[10px] text-emerald-400 mt-0.5">192x192 / 512x512 PWA</div>
                      <div className="text-[10px] text-stone-400 mt-0.5">DHKC Canteen App</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Displayed when installed on Android & iOS home screens.
                  </p>
                </div>
              </div>

              {/* Upload & Actions */}
              <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Update Logo File
                </h4>
                <p className="text-xs text-stone-400">
                  Upload a new PNG, JPG, or SVG image (square 1:1 aspect ratio recommended for best display).
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 font-bold text-xs uppercase tracking-wider cursor-pointer inline-flex items-center gap-2 shadow-md transition-transform">
                    <Upload className="w-4 h-4" />
                    <span>Upload New App Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleAppLogoUpload(file);
                      }}
                    />
                  </label>

                  <button
                    onClick={handleResetAppLogo}
                    className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset to Default Logo</span>
                  </button>
                </div>
              </div>

              {/* App Brand Name Form */}
              <form onSubmit={handleUpdateAppName} className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    App Branding Name & Code
                  </h4>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Customize the institutional header name and hall subtitle.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">
                      App Title (Header Text)
                    </label>
                    <input
                      type="text"
                      value={diningInfo.appName || 'DHKC CANTEEN'}
                      onChange={(e) => setDiningInfo({ ...diningInfo, appName: e.target.value })}
                      placeholder="e.g. DHKC CANTEEN"
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">
                      Hall Name
                    </label>
                    <input
                      type="text"
                      value={diningInfo.hallName || ''}
                      onChange={(e) => setDiningInfo({ ...diningInfo, hallName: e.target.value })}
                      placeholder="e.g. DHKC Central Dining Hall"
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md"
                >
                  Save Branding Name
                </button>
              </form>
            </div>
          )}

          {/* TAB: MANAGE STUDENTS */}
          {activeAdminTab === 'manage_students' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
                <div>
                  <h3 className="text-base font-bold font-display text-white">Manage Students Directory</h3>
                  <p className="text-xs text-stone-400">
                    Official 168 registered institutional students (S1-SS1).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleResetAllCoins}
                    className="px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs"
                    title="Make all student points, total coins, and weekly coins zero"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All Coins to 0</span>
                  </button>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Search name, roll, adm..."
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-950 border border-stone-800 rounded-xl text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Students Table */}
              <div className="rounded-2xl border border-stone-800 bg-stone-950 overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-900 text-stone-400 uppercase font-semibold text-[10px] sticky top-0">
                      <tr>
                        <th className="p-3">Roll</th>
                        <th className="p-3">Adm</th>
                        <th className="p-3">Name</th>
                        <th className="p-3">Class</th>
                        <th className="p-3">Total Coins</th>
                        <th className="p-3">Weekly Coins</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60">
                      {storage.searchStudents(studentSearch).map((st) => (
                        <tr key={st.id} className="hover:bg-stone-900/60">
                          <td className="p-3 font-mono font-bold text-amber-400">{st.rollNo}</td>
                          <td className="p-3 font-mono text-stone-400">{st.admissionNo}</td>
                          <td className="p-3 font-bold text-white">{st.name}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                              {st.mainClass}
                              {st.section ? `-${st.section}` : ''}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-amber-400">{st.totalCoins}</td>
                          <td className="p-3 font-mono font-bold text-emerald-400">+{st.weeklyCoins}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => onSelectStudent && onSelectStudent(st)}
                              className="text-xs text-amber-400 hover:underline font-semibold"
                            >
                              Profile
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: STUDENT PHOTOS */}
          {activeAdminTab === 'student_photos' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
                <div>
                  <h3 className="text-base font-bold font-display text-white">Manage Student Photos</h3>
                  <p className="text-xs text-stone-400">
                    Upload, replace, preview, or remove profile photos for students.
                  </p>
                </div>

                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Filter student..."
                  className="px-3 py-1.5 text-xs bg-stone-950 border border-stone-800 rounded-xl text-white w-full sm:w-60"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {storage.searchStudents(studentSearch).slice(0, 30).map((st) => (
                  <div key={st.id} className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 flex items-center gap-3">
                    {/* Photo / Avatar */}
                    <div className="w-12 h-12 rounded-xl bg-stone-900 border border-stone-700 overflow-hidden flex items-center justify-center shrink-0">
                      {st.photo ? (
                        <img src={st.photo} alt={st.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-xs text-amber-400">{st.name.slice(0, 2)}</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate">{st.name}</h4>
                      <p className="text-[10px] text-stone-400 font-mono">
                        Roll: {st.rollNo} · Adm: {st.admissionNo} · {st.mainClass}{st.section ? `-${st.section}` : ''}
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <label className="text-[10px] font-bold text-amber-400 hover:underline cursor-pointer">
                          Upload Photo
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadStudentPhoto(st.id, file);
                            }}
                          />
                        </label>

                        {st.photo && (
                          <button
                            onClick={() => handleDeleteStudentPhoto(st.id)}
                            className="text-[10px] font-bold text-rose-400 hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: 300 COIN REWARD SETTINGS */}
          {activeAdminTab === 'rewards_300' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold font-display text-white">
                  300 Coin Reward Milestone Settings
                </h3>
                <p className="text-xs text-stone-400">
                  Configure milestone threshold, congratulations message, and reward description.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-4 max-w-xl">
                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-1">
                    Milestone Target Coins
                  </label>
                  <input
                    type="number"
                    value={milestoneSettings.targetCoins}
                    onChange={(e) =>
                      setMilestoneSettings({
                        ...milestoneSettings,
                        targetCoins: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs font-mono text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-1">
                    Achievement Title
                  </label>
                  <input
                    type="text"
                    value={milestoneSettings.title}
                    onChange={(e) =>
                      setMilestoneSettings({ ...milestoneSettings, title: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-1">
                    Celebration Message
                  </label>
                  <textarea
                    rows={2}
                    value={milestoneSettings.message}
                    onChange={(e) =>
                      setMilestoneSettings({ ...milestoneSettings, message: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-1">
                    Reward Description
                  </label>
                  <textarea
                    rows={2}
                    value={milestoneSettings.rewardDescription}
                    onChange={(e) =>
                      setMilestoneSettings({
                        ...milestoneSettings,
                        rewardDescription: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-1">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    value={milestoneSettings.badgeText}
                    onChange={(e) =>
                      setMilestoneSettings({ ...milestoneSettings, badgeText: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-white"
                  />
                </div>

                <button
                  onClick={() => {
                    storage.setMilestoneSettings(milestoneSettings);
                    showNotification('300 Coin milestone settings saved!');
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider"
                >
                  Save Milestone Settings
                </button>
              </div>
            </div>
          )}

          {/* TAB: WINNER OF THE WEEK */}
          {activeAdminTab === 'winner_of_week' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
                <div>
                  <h3 className="text-base font-bold font-display text-white">
                    🏆 Winner of the Week Management
                  </h3>
                  <p className="text-xs text-stone-400">
                    Rankings calculated solely from coins earned in the current week cycle.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleResetAllCoins}
                    className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-rose-900/40 text-stone-300 hover:text-rose-200 border border-stone-700 hover:border-rose-500 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                    title="Reset all total coins and weekly coins to zero"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                    <span>Reset All Coins to 0</span>
                  </button>

                  <button
                    onClick={handleResetWeeklyCycle}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Start New Weekly Cycle</span>
                  </button>
                </div>
              </div>

              {/* Current Calculated Winner */}
              <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Current Weekly Leader
                  </span>
                  <span className="text-xs font-mono text-stone-400">
                    Cycle: {winnerSettings.weekStartDate} to {winnerSettings.weekEndDate}
                  </span>
                </div>

                {storage.getWinnerOfTheWeek().student ? (
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-300 font-black text-xl flex items-center justify-center">
                      👑
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">
                        {storage.getWinnerOfTheWeek().student?.name}
                      </h4>
                      <p className="text-xs text-stone-300 font-mono">
                        Class {storage.getWinnerOfTheWeek().student?.mainClass} · Roll #{storage.getWinnerOfTheWeek().student?.rollNo} · Adm #{storage.getWinnerOfTheWeek().student?.admissionNo}
                      </p>
                      <div className="text-xs font-bold text-amber-400 mt-1">
                        +{storage.getWinnerOfTheWeek().student?.weeklyCoins} Coins earned this week
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 italic">No coins recorded yet for current week.</p>
                )}
              </div>

              {/* Top 10 Weekly Leaderboard Table */}
              <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300">
                  Current Top 10 Students This Week
                </h4>
                <div className="space-y-1.5">
                  {storage.getWeeklyLeaderboard(10).map((st, i) => (
                    <div
                      key={st.id}
                      className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 font-bold text-center text-amber-400">#{i + 1}</span>
                        <div>
                          <div className="font-bold text-white">{st.name}</div>
                          <div className="text-[10px] text-stone-400">Class {st.mainClass} · Roll {st.rollNo}</div>
                        </div>
                      </div>
                      <div className="text-right font-mono font-bold text-emerald-400">
                        +{st.weeklyCoins} coins
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: TEACHERS & MENTORS */}
          {activeAdminTab === 'teachers_mentors' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div>
                  <h3 className="text-base font-bold font-display text-white">
                    Manage Teachers & Mentors
                  </h3>
                  <p className="text-xs text-stone-400">
                    Authorize teachers to submit remarks and award student coins with secure PINs.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingTeacher({ name: '', pin: '', subject: '', active: true });
                    setIsTeacherModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Teacher</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {teachers.map((tch) => (
                  <div
                    key={tch.id}
                    className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{tch.name}</h4>
                      <p className="text-[11px] text-stone-400">
                        Designation: {tch.subject || 'Faculty Mentor'} · PIN: <span className="font-mono text-amber-400">{tch.pin}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          storage.updateTeacher(tch.id, { active: !tch.active });
                          refreshAll();
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          tch.active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-stone-800 text-stone-500'
                        }`}
                      >
                        {tch.active ? 'Active' : 'Disabled'}
                      </button>

                      <button
                        onClick={() => {
                          storage.deleteTeacher(tch.id);
                          refreshAll();
                          showNotification('Teacher removed.');
                        }}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: COOK ACCOUNTS */}
          {activeAdminTab === 'cook_accounts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div>
                  <h3 className="text-base font-bold font-display text-white">
                    Manage Kitchen Cook Accounts
                  </h3>
                  <p className="text-xs text-stone-400">
                    Set authorization passwords for kitchen chefs to update dishes and inventory.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingCook({ name: '', password: '', role: 'Chef', active: true });
                    setIsCookModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Cook</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {cooks.map((ck) => (
                  <div
                    key={ck.id}
                    className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{ck.name}</h4>
                      <p className="text-[11px] text-stone-400">
                        Role: {ck.role} · Password: <span className="font-mono text-amber-400">{ck.password}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          storage.deleteCook(ck.id);
                          refreshAll();
                          showNotification('Cook removed.');
                        }}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: EQUIPMENT TRACKING */}
          {activeAdminTab === 'equipment_tracking' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold font-display text-white">
                  Plate, Glass & Table Equipment Tracking
                </h3>
                <p className="text-xs text-stone-400">
                  Update inventory counts and table water dispensers.
                </p>
              </div>

              <form onSubmit={handleSaveEquipmentCounts} className="space-y-4 max-w-xl">
                {/* Plates */}
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Plate Tracking
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="text-[11px] text-stone-400 block mb-1">Total</label>
                      <input
                        type="number"
                        value={plates.total}
                        onChange={(e) => setPlates({ ...plates, total: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-stone-900 border border-stone-700 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-400 block mb-1">Available</label>
                      <input
                        type="number"
                        value={plates.available}
                        onChange={(e) => setPlates({ ...plates, available: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-stone-900 border border-stone-700 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-400 block mb-1">Issued</label>
                      <input
                        type="number"
                        value={plates.issued}
                        onChange={(e) => setPlates({ ...plates, issued: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-stone-900 border border-stone-700 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-400 block mb-1">Missing</label>
                      <input
                        type="number"
                        value={plates.missing}
                        onChange={(e) => setPlates({ ...plates, missing: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-stone-900 border border-stone-700 rounded-lg text-xs font-mono text-rose-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Glasses */}
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Glass Tracking
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="text-[11px] text-stone-400 block mb-1">Total</label>
                      <input
                        type="number"
                        value={glasses.total}
                        onChange={(e) => setGlasses({ ...glasses, total: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-stone-900 border border-stone-700 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-400 block mb-1">Available</label>
                      <input
                        type="number"
                        value={glasses.available}
                        onChange={(e) => setGlasses({ ...glasses, available: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-stone-900 border border-stone-700 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-400 block mb-1">Issued</label>
                      <input
                        type="number"
                        value={glasses.issued}
                        onChange={(e) => setGlasses({ ...glasses, issued: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-stone-900 border border-stone-700 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-400 block mb-1">Missing</label>
                      <input
                        type="number"
                        value={glasses.missing}
                        onChange={(e) => setGlasses({ ...glasses, missing: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-stone-900 border border-stone-700 rounded-lg text-xs font-mono text-rose-400"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider"
                >
                  Save Equipment Counts
                </button>
              </form>
            </div>
          )}

          {/* TAB: DINING REMINDERS */}
          {activeAdminTab === 'dining_reminders' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold font-display text-white">
                  Dining Hall Etiquette Reminders
                </h3>
                <p className="text-xs text-stone-400">
                  Manage student reminders like returning plates, avoiding food waste, and queue silence.
                </p>
              </div>

              {/* Add form */}
              <form onSubmit={handleAddReminder} className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                <input
                  type="text"
                  required
                  value={newReminderText}
                  onChange={(e) => setNewReminderText(e.target.value)}
                  placeholder="e.g. Please return drinking glasses to designated racks..."
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-white"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <label className="text-stone-400">Priority:</label>
                    <select
                      value={newReminderPriority}
                      onChange={(e) => setNewReminderPriority(e.target.value as any)}
                      className="px-2 py-1 bg-stone-900 border border-stone-700 rounded-lg text-xs text-white"
                    >
                      <option value="normal">Normal</option>
                      <option value="high">High (Highlighted)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs"
                  >
                    Add Reminder
                  </button>
                </div>
              </form>

              {/* List */}
              <div className="space-y-2">
                {reminders.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="text-stone-200">{r.text}</p>
                      <span className="text-[10px] text-amber-400 uppercase font-mono">
                        Priority: {r.priority}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteReminder(r.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/30 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: DONATE & QR */}
          {activeAdminTab === 'donate_qr' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold font-display text-white">
                  Donate / QR Management
                </h3>
                <p className="text-xs text-stone-400">
                  Upload official UPI QR code, configure title, description, and instructions.
                </p>
              </div>

              <form onSubmit={handleSaveDonationSettings} className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-4 max-w-xl">
                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-1">Donation Title</label>
                  <input
                    type="text"
                    value={donationSettings.title}
                    onChange={(e) => setDonationSettings({ ...donationSettings, title: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-1">UPI ID</label>
                  <input
                    type="text"
                    value={donationSettings.upiId || ''}
                    onChange={(e) => setDonationSettings({ ...donationSettings, upiId: e.target.value })}
                    placeholder="canteen.welfare@dhkc"
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs font-mono text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={donationSettings.description}
                    onChange={(e) => setDonationSettings({ ...donationSettings, description: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-1">Instructions</label>
                  <textarea
                    rows={2}
                    value={donationSettings.instructions}
                    onChange={(e) => setDonationSettings({ ...donationSettings, instructions: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-white"
                  />
                </div>

                {/* QR Image Preview & Upload */}
                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-2">QR Code Image</label>
                  <div className="flex items-center gap-3">
                    {donationSettings.qrImage ? (
                      <div className="w-24 h-24 bg-white p-1 rounded-xl overflow-hidden border border-stone-700 shrink-0">
                        <img src={donationSettings.qrImage} alt="QR" className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-stone-900 rounded-xl border border-dashed border-stone-700 flex items-center justify-center text-stone-500 text-xs shrink-0">
                        No QR
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload / Replace QR</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadDonationQR(file);
                          }}
                        />
                      </label>

                      {donationSettings.qrImage && (
                        <button
                          type="button"
                          onClick={handleDeleteDonationQR}
                          className="block text-xs text-rose-400 hover:underline"
                        >
                          Delete QR Image
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider"
                >
                  Save Donation Settings
                </button>
              </form>
            </div>
          )}

          {/* TAB: URGENT & SPECIALS */}
          {activeAdminTab === 'urgent_specials' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div>
                  <h3 className="text-base font-bold font-display text-white">Urgent Notices & Specials</h3>
                  <p className="text-xs text-stone-400">Broadcast important announcements across the portal.</p>
                </div>
              </div>

              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div key={ann.id} className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400">{ann.title}</span>
                      <button
                        onClick={() => {
                          storage.deleteAnnouncement(ann.id);
                          refreshAll();
                          showNotification('Announcement deleted.');
                        }}
                        className="text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-stone-300">{ann.message}</p>
                    <p className="text-[10px] text-stone-500 font-mono">Date: {ann.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: INCHARGE & ASSISTANT */}
          {activeAdminTab === 'incharge_assistant' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold font-display text-white">Dining Hall Officers</h3>
                <p className="text-xs text-stone-400">Update incharge and assistant information and contact details.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Incharge */}
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Chief Incharge</h4>
                  <div>
                    <label className="text-[11px] text-stone-400 block mb-1">Name</label>
                    <input
                      type="text"
                      value={diningInfo.incharge.name}
                      onChange={(e) =>
                        setDiningInfo({
                          ...diningInfo,
                          incharge: { ...diningInfo.incharge, name: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-400 block mb-1">Position</label>
                    <input
                      type="text"
                      value={diningInfo.incharge.position}
                      onChange={(e) =>
                        setDiningInfo({
                          ...diningInfo,
                          incharge: { ...diningInfo.incharge, position: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-400 block mb-1">Contact</label>
                    <input
                      type="text"
                      value={diningInfo.incharge.contact || ''}
                      onChange={(e) =>
                        setDiningInfo({
                          ...diningInfo,
                          incharge: { ...diningInfo.incharge, contact: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                {/* Assistant */}
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Assistant Supervisor</h4>
                  <div>
                    <label className="text-[11px] text-stone-400 block mb-1">Name</label>
                    <input
                      type="text"
                      value={diningInfo.assistant.name}
                      onChange={(e) =>
                        setDiningInfo({
                          ...diningInfo,
                          assistant: { ...diningInfo.assistant, name: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-400 block mb-1">Position</label>
                    <input
                      type="text"
                      value={diningInfo.assistant.position}
                      onChange={(e) =>
                        setDiningInfo({
                          ...diningInfo,
                          assistant: { ...diningInfo.assistant, position: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-400 block mb-1">Contact</label>
                    <input
                      type="text"
                      value={diningInfo.assistant.contact || ''}
                      onChange={(e) =>
                        setDiningInfo({
                          ...diningInfo,
                          assistant: { ...diningInfo.assistant, contact: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  storage.setDiningHallInfo(diningInfo);
                  showNotification('Officer details updated!');
                }}
                className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider"
              >
                Save Officers Information
              </button>
            </div>
          )}

          {/* TAB: OUR TEAM */}
          {activeAdminTab === 'our_team' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div>
                  <h3 className="text-base font-bold font-display text-white">Manage Kitchen Team</h3>
                  <p className="text-xs text-stone-400">Unlimited cooks and kitchen staff profiles.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teamMembers.map((m) => (
                  <div key={m.id} className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-white">{m.name}</h4>
                      <p className="text-[11px] text-amber-400">{m.position}</p>
                      <p className="text-[10px] text-stone-500 line-clamp-1">{m.description}</p>
                    </div>

                    <button
                      onClick={() => {
                        storage.deleteTeamMember(m.id);
                        refreshAll();
                        showNotification('Team member removed.');
                      }}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: MANAGE GALLERY */}
          {activeAdminTab === 'manage_gallery' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div>
                  <h3 className="text-base font-bold font-display text-white">Manage Gallery</h3>
                  <p className="text-xs text-stone-400">Upload dining hall photographs, food memories, and events.</p>
                </div>

                <label className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider cursor-pointer flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await readFileAsDataUrl(file);
                        storage.addGalleryItem({
                          image: url,
                          caption: 'Dining Hall moment',
                          date: getTodayDateString(),
                          category: 'Dining Hall',
                        });
                        refreshAll();
                        showNotification('Photo added to gallery!');
                      }
                    }}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {gallery.map((g) => (
                  <div key={g.id} className="rounded-2xl bg-stone-950 border border-stone-800 overflow-hidden group relative">
                    <img src={g.image} alt="" className="w-full h-32 object-cover" />
                    <div className="p-2.5 text-xs text-stone-300 truncate">{g.caption}</div>
                    <button
                      onClick={() => {
                        storage.deleteGalleryItem(g.id);
                        refreshAll();
                        showNotification('Photo deleted.');
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-rose-400 hover:text-rose-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: MODERATE COMMENTS */}
          {activeAdminTab === 'manage_comments' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold font-display text-white">Moderate User Comments</h3>
                <p className="text-xs text-stone-400">Review and delete inappropriate or spam remarks.</p>
              </div>

              <div className="space-y-2">
                {comments.length === 0 ? (
                  <p className="text-xs text-stone-500 italic py-4">No comments found.</p>
                ) : (
                  comments.map((c) => (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{c.userName}</span>
                          <span className="text-[10px] text-stone-500 font-normal">{c.timestamp}</span>
                        </div>
                        <p className="text-stone-300 mt-0.5">"{c.comment}"</p>
                      </div>

                      <button
                        onClick={() => {
                          storage.deleteComment(c.id);
                          refreshAll();
                          showNotification('Comment deleted.');
                        }}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB: APP SETTINGS & SECURITY */}
          {activeAdminTab === 'app_settings' && (
            <div className="space-y-6 max-w-lg">
              <div>
                <h3 className="text-base font-bold font-display text-white">App Settings & Security</h3>
                <p className="text-xs text-stone-400">Manage credentials for Master Admin, Cook staff, and Teachers.</p>
              </div>

              {/* 1. Master Admin Password */}
              <form onSubmit={handleChangePassword} className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <Shield className="w-4 h-4" />
                  <span>Master Admin Password</span>
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">
                    New Master Admin Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="Enter at least 4 characters..."
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Update Admin Password
                </button>
              </form>

              {/* 2. Cook's Password */}
              <form onSubmit={handleChangeCookPassword} className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <ChefHat className="w-4 h-4" />
                  <span>Cook Staff Login Password</span>
                </div>
                <p className="text-[11px] text-stone-400">
                  Update the password used by kitchen cooks to log in and manage the daily meal items.
                </p>
                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">
                    New Cook Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newCookPassword}
                    onChange={(e) => setNewCookPassword(e.target.value)}
                    placeholder="Enter new cook password (min 3 chars)..."
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Update Cook's Password
                </button>
              </form>

              {/* 3. Teacher Password Setting */}
              <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                  <Users className="w-4 h-4" />
                  <span>Student Remarks (Teacher Form) Password</span>
                </div>
                <p className="text-[11px] text-stone-400">
                  Universal authorized faculty password protection is active.
                </p>
                <div className="p-3 bg-stone-900 border border-amber-500/30 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-bold">Portal Access Protection</span>
                    <span className="font-mono text-sm font-bold text-amber-400 tracking-widest">••••••••••••</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                    Active & Enforced
                  </span>
                </div>
                <p className="text-[10px] text-stone-500">
                  Security Rule: Every remark is strictly logged with your Name, Position, and Email ID.
                </p>
              </div>

              {/* 4. App Branding & Logo Shortcut */}
              <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <FileImage className="w-4 h-4" />
                    <span>App Logo & Visual Identity</span>
                  </div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                    BRANDING
                  </span>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-stone-900 border border-stone-800">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-500/60 bg-[#0b1220] shrink-0 p-0.5 flex items-center justify-center">
                    <img
                      src={diningInfo.appLogo || '/logo.png'}
                      alt="Logo"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/logo.png';
                      }}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {diningInfo.appName || 'DHKC CANTEEN'}
                    </p>
                    <p className="text-[10px] text-stone-400">
                      Header, Install modal & App icon
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveAdminTab('app_logo')}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors shrink-0"
                  >
                    Change Logo
                  </button>
                </div>
              </div>

              {/* 5. Security Alerts & Notification Email Dispatch (dhiuhc@gmail.com) */}
              <form onSubmit={handleSaveSecurityEmail} className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                    <Shield className="w-4 h-4" />
                    <span>Security Alert Dispatch Email</span>
                  </div>
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded font-mono font-bold">
                    EMAIL NOTIFICATIONS
                  </span>
                </div>

                <p className="text-xs text-stone-400 leading-relaxed">
                  Automatic security notifications are dispatched to this email whenever a teacher signs in, marks are uploaded or deducted, or an instructor customizes their portal password.
                </p>

                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">
                    Alert Recipient Email (Editable) *
                  </label>
                  <input
                    type="email"
                    required
                    value={securityAlertEmailInput}
                    onChange={(e) => setSecurityAlertEmailInput(e.target.value)}
                    placeholder="dhiuhc@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-[10px] text-stone-500 block mt-1">
                    Default institutional recipient: <strong className="text-stone-300">dhiuhc@gmail.com</strong>
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md shadow-rose-600/20"
                >
                  Save Notification Email
                </button>

                {/* Recent alerts preview */}
                {securityAlertsList.length > 0 && (
                  <div className="pt-2 border-t border-stone-800 space-y-2">
                    <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                      Recent Activity Alerts ({securityAlertsList.length})
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                      {securityAlertsList.slice(0, 5).map((alt: any) => (
                        <div key={alt.id} className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-[11px]">
                          <div className="flex items-center justify-between text-stone-300 font-bold">
                            <span className="text-amber-400">{alt.title}</span>
                            <span className="text-stone-500 font-mono text-[9px]">{alt.timestamp}</span>
                          </div>
                          <p className="text-stone-400 text-[10px] mt-0.5">{alt.details}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Food Add/Edit */}
      {isFoodModalOpen && editingFood && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-stone-950/80 backdrop-blur-xs">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-5 max-h-[90vh] overflow-y-auto text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-800">
              <h3 className="text-sm font-bold font-display">
                {editingFood.id ? 'Edit Food Dish' : 'Add Food to Schedule'}
              </h3>
              <button
                onClick={() => setIsFoodModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-800 flex items-center justify-center text-stone-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFood} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Date</label>
                <input
                  type="date"
                  value={editingFood.date}
                  onChange={(e) => setEditingFood({ ...editingFood, date: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Meal Period</label>
                <select
                  value={editingFood.mealCategory}
                  onChange={(e) => setEditingFood({ ...editingFood, mealCategory: e.target.value as any })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs"
                >
                  {mealConfigs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Food Name *</label>
                <input
                  type="text"
                  required
                  value={editingFood.foodName || ''}
                  onChange={(e) => setEditingFood({ ...editingFood, foodName: e.target.value })}
                  placeholder="e.g. Hyderabadi Dum Biryani"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Timing</label>
                <input
                  type="text"
                  value={editingFood.time || ''}
                  onChange={(e) => setEditingFood({ ...editingFood, time: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingFood.description || ''}
                  onChange={(e) => setEditingFood({ ...editingFood, description: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Speciality (Optional)</label>
                <input
                  type="text"
                  value={editingFood.speciality || ''}
                  onChange={(e) => setEditingFood({ ...editingFood, speciality: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Sponsored By (Optional)</label>
                <input
                  type="text"
                  value={editingFood.sponsoredBy || ''}
                  onChange={(e) => setEditingFood({ ...editingFood, sponsoredBy: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Food Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = await readFileAsDataUrl(file);
                      setEditingFood({ ...editingFood, image: url });
                    }
                  }}
                  className="text-xs text-stone-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFoodModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-stone-800 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Banner Add/Edit */}
      {isBannerModalOpen && editingBanner && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-stone-950/80 backdrop-blur-xs">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-5 max-h-[90vh] overflow-y-auto text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-800">
              <h3 className="text-sm font-bold font-display">
                {editingBanner.id ? 'Edit Promotional Banner' : 'Create Promotional Banner'}
              </h3>
              <button
                onClick={() => setIsBannerModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-800 flex items-center justify-center text-stone-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  value={editingBanner.title || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  placeholder="e.g. Special Institutional Grand Feast"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={editingBanner.description || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, description: e.target.value })}
                  placeholder="Temporary details about the event or program..."
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={editingBanner.startDate || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, startDate: e.target.value })}
                    className="w-full px-2 py-1.5 bg-stone-950 border border-stone-700 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={editingBanner.endDate || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, endDate: e.target.value })}
                    className="w-full px-2 py-1.5 bg-stone-950 border border-stone-700 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-1">Button Text</label>
                  <input
                    type="text"
                    value={editingBanner.buttonText || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, buttonText: e.target.value })}
                    placeholder="e.g. View Special Menu"
                    className="w-full px-3 py-1.5 bg-stone-950 border border-stone-700 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-1">Publish State</label>
                  <select
                    value={editingBanner.published ? 'true' : 'false'}
                    onChange={(e) => setEditingBanner({ ...editingBanner, published: e.target.value === 'true' })}
                    className="w-full px-3 py-1.5 bg-stone-950 border border-stone-700 rounded-xl text-xs"
                  >
                    <option value="true">Published (Visible)</option>
                    <option value="false">Unpublished (Hidden)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Optional Banner Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = await readFileAsDataUrl(file);
                      setEditingBanner({ ...editingBanner, image: url });
                    }
                  }}
                  className="text-xs text-stone-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-stone-800 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Teacher Add */}
      {isTeacherModalOpen && editingTeacher && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-stone-950/80 backdrop-blur-xs">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-sm w-full p-5 text-white shadow-2xl">
            <h3 className="text-sm font-bold font-display mb-1 text-white">Add Authorized Teacher / Faculty</h3>
            <p className="text-[11px] text-stone-400 mb-3">
              Faculty evaluation access is protected by universal institutional password.
            </p>
            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] font-bold text-stone-300 block mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={editingTeacher.name || ''}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-300 block mb-1">Position / Designation *</label>
                <input
                  type="text"
                  placeholder="Enter position / designation"
                  value={editingTeacher.subject || editingTeacher.position || ''}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, subject: e.target.value, position: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-300 block mb-1">Email ID *</label>
                <input
                  type="email"
                  placeholder="Enter email ID"
                  value={editingTeacher.email || ''}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, email: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-300 block mb-1">Portal Password Protection</label>
                <input
                  type="password"
                  value="••••••••••••"
                  readOnly
                  className="w-full px-3 py-2 bg-stone-950/80 border border-stone-800 rounded-xl text-xs font-mono font-bold text-stone-400 cursor-not-allowed"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsTeacherModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-stone-800 text-xs text-stone-300 hover:bg-stone-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (editingTeacher.name?.trim()) {
                      const pos = editingTeacher.position || editingTeacher.subject || 'Faculty Mentor';
                      const em = editingTeacher.email || 'faculty@dhkc.edu';
                      storage.addTeacher({
                        name: editingTeacher.name.trim(),
                        pin: 'teacher@dhkc',
                        subject: pos,
                        position: pos,
                        email: em,
                        active: true,
                      });
                      setIsTeacherModalOpen(false);
                      refreshAll();
                      showNotification('Teacher profile created successfully!');
                    }
                  }}
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold cursor-pointer"
                >
                  Save Teacher
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Cook Add */}
      {isCookModalOpen && editingCook && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-stone-950/80 backdrop-blur-xs">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-sm w-full p-5 text-white shadow-2xl">
            <h3 className="text-sm font-bold font-display mb-3">Add Kitchen Cook Account</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Cook Name..."
                value={editingCook.name || ''}
                onChange={(e) => setEditingCook({ ...editingCook, name: e.target.value })}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs"
              />
              <input
                type="text"
                placeholder="Kitchen Password..."
                value={editingCook.password || ''}
                onChange={(e) => setEditingCook({ ...editingCook, password: e.target.value })}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs font-mono"
              />
              <input
                type="text"
                placeholder="Role (e.g. Master Cook)..."
                value={editingCook.role || ''}
                onChange={(e) => setEditingCook({ ...editingCook, role: e.target.value })}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsCookModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-stone-800 text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (editingCook.name && editingCook.password) {
                      storage.addCook({
                        name: editingCook.name,
                        password: editingCook.password,
                        role: editingCook.role || 'Cook',
                        active: true,
                      });
                      setIsCookModalOpen(false);
                      refreshAll();
                      showNotification('Cook account added!');
                    }
                  }}
                  className="px-4 py-1.5 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold"
                >
                  Save Cook
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
