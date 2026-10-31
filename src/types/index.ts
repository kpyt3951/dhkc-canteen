export type MealCategory =
  | 'morning_tea'
  | 'breakfast'
  | 'lunch'
  | 'evening_tea'
  | 'dinner';

export interface MealCategoryConfig {
  id: MealCategory;
  name: string;
  defaultTime: string;
  startTime: string; // HH:mm format e.g. "06:30"
  endTime: string;   // HH:mm format e.g. "07:30"
  iconName: string;
  tagline: string;
}

export interface FoodItem {
  id: string;
  date: string; // YYYY-MM-DD
  mealCategory: MealCategory;
  foodName: string;
  image?: string;
  time: string;
  description?: string;
  speciality?: string;
  sponsoredBy?: string;
  likes: number;
  commentCount: number;
  orderIndex?: number;
  createdAt: string;
  addedBy?: string; // 'admin' | 'cook'
}

export interface Comment {
  id: string;
  foodId: string;
  userName: string;
  comment: string;
  timestamp: string;
}

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  image?: string;
  description?: string;
  orderIndex?: number;
}

export interface GalleryItem {
  id: string;
  image: string;
  caption: string;
  date: string;
  category?: 'Dining Hall' | 'Food' | 'Events' | 'Special Occasions' | 'Activities' | 'Team' | 'Memories';
}

export type AnnouncementPriority = 'high' | 'special' | 'timing' | 'general';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  image?: string;
  date: string;
  time?: string;
  priority: AnnouncementPriority;
  active: boolean;
}

export interface InchargeOfficer {
  name: string;
  position: string;
  photo?: string;
  contact?: string;
  description?: string;
}

export interface DiningHallInfo {
  appLogo?: string;
  appName?: string;
  backgroundImage: string;
  incharge: InchargeOfficer;
  assistant: InchargeOfficer;
  hallName: string;
  canteenCode?: string;
  generalContact?: string;
  capacity?: string;
}

export interface HistoryLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
}

// ==================== STUDENTS & REWARDS TYPES ====================

export type MainClassType = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'SS1';
export type SectionType = 'S1A' | 'S1B' | null;

export interface StudentAchievement {
  id: string;
  studentId: string;
  title: string;
  remark: string;
  coins: number;
  teacherName: string;
  teacherPosition?: string;
  teacherEmail?: string;
  date: string;
  image?: string;
  createdAt: string;
}

export interface Student {
  id: string;
  rollNo: number;
  admissionNo: number;
  name: string;
  mainClass: MainClassType;
  section?: 'S1A' | 'S1B' | ''; // S1 has S1A or S1B
  photo?: string;
  totalCoins: number;
  weeklyCoins: number;
  achievements: StudentAchievement[];
}

export interface MilestoneSettings {
  targetCoins: number;
  title: string;
  message: string;
  rewardDescription: string;
  badgeText: string;
}

export interface WinnerOfWeekSettings {
  enabled: boolean;
  overrideStudentId?: string;
  customMessage?: string;
  customPhoto?: string;
  weekStartDate: string;
  weekEndDate: string;
}

// ==================== PROMOTIONAL BANNER ====================

export interface PromotionalBanner {
  id: string;
  title: string;
  description: string;
  image?: string;
  buttonText?: string;
  linkUrl?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  published: boolean;
  orderIndex?: number;
  createdAt: string;
}

// ==================== EQUIPMENT & TRACKING ====================

export interface PlateCount {
  total: number;
  issued: number;
  available: number;
  missing: number;
  lastUpdated: string;
  updatedBy?: string;
}

export interface GlassCount {
  total: number;
  issued: number;
  available: number;
  missing: number;
  lastUpdated: string;
  updatedBy?: string;
}

export interface TableEquipmentItem {
  id: string;
  name: string;
  totalQuantity: number;
  availableQuantity: number;
  missingQuantity: number;
  status: 'Good' | 'Fair' | 'Needs Replenishment';
  notes?: string;
  lastUpdated: string;
}

// ==================== REMINDERS & DONATIONS ====================

export interface DiningReminder {
  id: string;
  text: string;
  priority: 'normal' | 'high';
  active: boolean;
  createdAt: string;
}

export interface DonationSettings {
  published: boolean;
  title: string;
  description: string;
  instructions: string;
  qrImage?: string;
  upiId?: string;
  accountName?: string;
}

// ==================== TEACHERS & COOKS ====================

export interface TeacherUser {
  id: string;
  name: string;
  pin: string;
  subject?: string;
  position?: string;
  email?: string;
  active: boolean;
}

export interface CookUser {
  id: string;
  name: string;
  password: string;
  role: string;
  active: boolean;
}

// ==================== MEAL CATEGORIES CONFIG ====================

export const MEAL_CATEGORIES: MealCategoryConfig[] = [
  {
    id: 'morning_tea',
    name: 'Morning Tea & Snacks',
    defaultTime: '06:30 AM - 07:30 AM',
    startTime: '06:30',
    endTime: '07:30',
    iconName: 'Coffee',
    tagline: 'Freshly brewed hot tea & morning light bites'
  },
  {
    id: 'breakfast',
    name: 'Breakfast',
    defaultTime: '07:45 AM - 09:30 AM',
    startTime: '07:45',
    endTime: '09:30',
    iconName: 'UtensilsCrossed',
    tagline: 'Wholesome nutritious start of the day'
  },
  {
    id: 'lunch',
    name: 'Lunch',
    defaultTime: '12:30 PM - 02:30 PM',
    startTime: '12:30',
    endTime: '14:30',
    iconName: 'Salad',
    tagline: 'Nutritious balanced dining hall feast'
  },
  {
    id: 'evening_tea',
    name: 'Evening Tea & Snacks',
    defaultTime: '05:00 PM - 06:15 PM',
    startTime: '17:00',
    endTime: '18:15',
    iconName: 'CupSoda',
    tagline: 'Crisp evening snacks & spiced karak chai'
  },
  {
    id: 'dinner',
    name: 'Dinner',
    defaultTime: '08:00 PM - 10:00 PM',
    startTime: '20:00',
    endTime: '22:00',
    iconName: 'Moon',
    tagline: 'Warm comforting dinner for the night'
  }
];

export interface CampusAdvertisement {
  title: string;
  posterImage: string;
  description?: string;
  active: boolean;
  dateAdded?: string;
}
