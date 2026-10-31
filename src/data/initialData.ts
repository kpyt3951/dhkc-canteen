import {
  DiningHallInfo,
  FoodItem,
  GalleryItem,
  TeamMember,
  Announcement,
  Comment,
  PromotionalBanner,
  PlateCount,
  GlassCount,
  TableEquipmentItem,
  DiningReminder,
  DonationSettings,
  MilestoneSettings,
  WinnerOfWeekSettings,
  TeacherUser,
  CookUser
} from '../types';
import { INITIAL_STUDENTS } from './initialStudents';

export { INITIAL_STUDENTS };

export const HERO_IMAGE = '/src/assets/images/hero_dining_hall_1791270412895.jpg';
export const BREAKFAST_IMAGE = '/src/assets/images/breakfast_spread_1791270443289.jpg';
export const LUNCH_IMAGE = '/src/assets/images/lunch_biryani_1791270459854.jpg';
export const EVENING_TEA_IMAGE = '/src/assets/images/evening_tea_snack_1791270479435.jpg';
export const HEAD_COOK_IMAGE = '/src/assets/images/head_cook_portrait_1791270495100.jpg';

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getOffsetDateString(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const INITIAL_DINING_HALL_INFO: DiningHallInfo = {
  appLogo: '/logo.png',
  appName: 'DHKC CANTEEN',
  hallName: 'DHKC Central Dining Hall',
  canteenCode: 'BLOCK-A • DHKC CAMPUS',
  generalContact: '+91 98765 43210',
  capacity: '450 Seating Capacity',
  backgroundImage: HERO_IMAGE,
  incharge: {
    name: 'Prof. Tariq Mahmud',
    position: 'Dining Hall Chief Incharge',
    photo: '',
    contact: 'incharge@dhkc.edu · Office: Hall Room 102',
    description: 'Oversees dietary standards, meal schedule adherence, student feedback, and overall dining hygiene across all 5 daily meal shifts.'
  },
  assistant: {
    name: 'Mr. Bilal Hussain',
    position: 'Dining Hall Assistant Supervisor',
    photo: '',
    contact: 'canteen.supervisor@dhkc.edu · Ph: Ext. 204',
    description: 'Coordinates daily kitchen logistics, pantry supplies, food serving queues, and kitchen team operations.'
  }
};

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'team-1',
    name: 'Chef Ahmed Khan',
    position: 'Head Chef & Master Cook',
    image: HEAD_COOK_IMAGE,
    description: 'Over 18 years of culinary excellence at DHKC. Renowned for authentic Dum Biryani, master gravies, and grand celebratory feasts.',
    orderIndex: 1
  },
  {
    id: 'team-2',
    name: 'Ustad Rajeshwar Rao',
    position: 'Senior Breakfast & Tandoor Specialist',
    image: '',
    description: 'Specializes in piping-hot stuffed parathas, crisp puris, tandoori rotis, and morning nutrition for students.',
    orderIndex: 2
  },
  {
    id: 'team-3',
    name: 'Mohammad Farooq',
    position: 'Curry & Dal Specialist',
    image: '',
    description: 'Expert in slow-simmered homestyle Dal Tadka, paneer delicacies, and fragrant vegetable kormas.',
    orderIndex: 3
  },
  {
    id: 'team-4',
    name: 'Suresh Kumar',
    position: 'Snacks & Confectionery Cook',
    image: '',
    description: 'Prepares evening crispy samosas, pakoras, seasonal halwa, and warm gulab jamuns with authentic taste.',
    orderIndex: 4
  },
  {
    id: 'team-5',
    name: 'Abdul Karim',
    position: 'Pantry & Prep Operations Lead',
    image: '',
    description: 'Ensures strict hygiene protocols, fresh daily produce selection, and quality spice blending.',
    orderIndex: 5
  },
  {
    id: 'team-6',
    name: 'Ram Prasad',
    position: 'Beverage & Karak Chai Master',
    image: '',
    description: 'Crafts the famous DHKC morning adrak chai and evening spiced masala tea cherished by faculty and students alike.',
    orderIndex: 6
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Special Hyderabadi Dum Biryani Feast for Today’s Lunch',
    message: 'Today’s lunch will feature our authentic Hyderabadi Dum Biryani served with spiced mint raita and fresh salad. Lunch counter will remain open until 2:30 PM.',
    image: LUNCH_IMAGE,
    date: getTodayDateString(),
    time: '12:30 PM - 02:30 PM',
    priority: 'special',
    active: true
  },
  {
    id: 'ann-2',
    title: 'Evening Tea Timings Update',
    message: 'Due to the campus seminar in the main auditorium, evening tea & hot snacks will start promptly at 4:45 PM today.',
    date: getTodayDateString(),
    time: '04:45 PM - 06:15 PM',
    priority: 'timing',
    active: true
  }
];

export const INITIAL_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-1',
    image: HERO_IMAGE,
    caption: 'Main Dining Hall seating hall during lunch hours - spacious, air-cooled and pristine.',
    date: '2026-10-01',
    category: 'Dining Hall'
  },
  {
    id: 'gal-2',
    image: LUNCH_IMAGE,
    caption: 'Traditional fragrant Dum Biryani served during the Annual Institutional Feast.',
    date: '2026-09-28',
    category: 'Food'
  },
  {
    id: 'gal-3',
    image: BREAKFAST_IMAGE,
    caption: 'Fresh breakfast service with golden parathas and curd for students.',
    date: '2026-09-25',
    category: 'Food'
  },
  {
    id: 'gal-4',
    image: EVENING_TEA_IMAGE,
    caption: 'Crisp evening samosas and piping hot spiced chai at the central counter.',
    date: '2026-09-20',
    category: 'Food'
  },
  {
    id: 'gal-5',
    image: HEAD_COOK_IMAGE,
    caption: 'Chef Ahmed Khan preparing ingredients inside the commercial prep kitchen.',
    date: '2026-09-15',
    category: 'Team'
  }
];

// ==================== DYNAMIC PROMOTIONAL BANNERS ====================
export const INITIAL_PROMOTIONAL_BANNERS: PromotionalBanner[] = [
  {
    id: 'banner-1',
    title: 'Special Institutional Grand Feast & Cultural Dining Night',
    description: 'Special multi-course menu this Friday evening celebrating institutional student achievements and high coin earners.',
    image: LUNCH_IMAGE,
    buttonText: 'View Special Menu',
    linkUrl: 'menu',
    startDate: getOffsetDateString(-2),
    endDate: getOffsetDateString(5),
    published: true,
    orderIndex: 1,
    createdAt: new Date().toISOString()
  }
];

// ==================== EQUIPMENT & TRACKING ====================
export const INITIAL_PLATE_COUNT: PlateCount = {
  total: 550,
  issued: 380,
  available: 155,
  missing: 15,
  lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  updatedBy: 'Admin (Counter Staff)'
};

export const INITIAL_GLASS_COUNT: GlassCount = {
  total: 600,
  issued: 430,
  available: 152,
  missing: 18,
  lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  updatedBy: 'Admin (Counter Staff)'
};

export const INITIAL_TABLE_EQUIPMENT: TableEquipmentItem[] = [
  {
    id: 'eq-1',
    name: 'Stainless Steel Water Jugs (2.5L)',
    totalQuantity: 65,
    availableQuantity: 58,
    missingQuantity: 7,
    status: 'Good',
    notes: 'Placed across Tables 1-50 in central dining hall',
    lastUpdated: new Date().toLocaleDateString()
  },
  {
    id: 'eq-2',
    name: 'Water Filtration Cooler Dispensers',
    totalQuantity: 6,
    availableQuantity: 6,
    missingQuantity: 0,
    status: 'Good',
    notes: 'Reverse Osmosis cold water stations active at East & West bays',
    lastUpdated: new Date().toLocaleDateString()
  },
  {
    id: 'eq-3',
    name: 'Large Food Serving Trays',
    totalQuantity: 40,
    availableQuantity: 36,
    missingQuantity: 4,
    status: 'Fair',
    notes: 'Used at the buffet serving lines during lunch and dinner',
    lastUpdated: new Date().toLocaleDateString()
  },
  {
    id: 'eq-4',
    name: 'Stainless Steel Table Spoons & Cutlery',
    totalQuantity: 500,
    availableQuantity: 460,
    missingQuantity: 40,
    status: 'Good',
    notes: 'Sterilized in hot water washer after each meal period',
    lastUpdated: new Date().toLocaleDateString()
  }
];

// ==================== DINING HALL REMINDERS ====================
export const INITIAL_REMINDERS: DiningReminder[] = [
  {
    id: 'rem-1',
    text: 'Please return all used plates, bowls, and cutlery to the washing bay immediately after eating.',
    priority: 'high',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'rem-2',
    text: 'Do not waste food. Take only what you can eat — every grain is cooked with care.',
    priority: 'high',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'rem-3',
    text: 'Please return drinking glasses to the designated trolley racks to prevent breakage.',
    priority: 'normal',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'rem-4',
    text: 'Maintain strict queue discipline and silence in the serving lines.',
    priority: 'normal',
    active: true,
    createdAt: new Date().toISOString()
  }
];

// ==================== DONATION SETTINGS ====================
export const INITIAL_DONATION_SETTINGS: DonationSettings = {
  published: true,
  title: 'DHKC Canteen Dining Hall Welfare Fund',
  description: 'Voluntary contributions directly support subsidizing meals for deserving students, kitchen equipment modernization, and clean drinking water facilities.',
  instructions: 'Scan the official institutional QR code below using any UPI mobile app (Google Pay, PhonePe, Paytm, BHIM). Note your name and class in the transaction remarks.',
  qrImage: '',
  upiId: 'canteen.welfare@dhkc',
  accountName: 'DHKC Dining Welfare & Infrastructure Fund'
};

// ==================== MILESTONE & WINNER SETTINGS ====================
export const INITIAL_MILESTONE_SETTINGS: MilestoneSettings = {
  targetCoins: 300,
  title: '300 COINS DISTINCTION MILESTONE',
  message: 'Honoring exceptional institutional discipline, community assistance, and dining hall etiquette!',
  rewardDescription: 'Awarded Official Dining Hall Honor Badge, Certificate of Excellence, and Special Guest invitation to the Monthly Grand Banquet.',
  badgeText: '🎉 300 COINS ACHIEVER'
};

export const INITIAL_WINNER_SETTINGS: WinnerOfWeekSettings = {
  enabled: true,
  weekStartDate: getOffsetDateString(-3),
  weekEndDate: getOffsetDateString(4),
  customMessage: 'Top Dining Hall Contributor & Weekly Etiquette Ambassador'
};

// ==================== TEACHERS & COOKS ACCOUNTS ====================
export const INITIAL_TEACHERS: TeacherUser[] = [
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

export const INITIAL_COOKS: CookUser[] = [
  {
    id: 'cook-1',
    name: 'Chef Ahmed Khan',
    password: 'cook@dhkc',
    role: 'Head Chef',
    active: true
  },
  {
    id: 'cook-2',
    name: 'Ustad Rajeshwar Rao',
    password: 'cook@dhkc',
    role: 'Breakfast & Tandoor Lead',
    active: true
  }
];

// ==================== FOOD ITEMS GENERATION ====================
export function generateInitialFoodItems(): FoodItem[] {
  const today = getTodayDateString();
  const tomorrow = getOffsetDateString(1);
  const yesterday = getOffsetDateString(-1);

  return [
    // --- TODAY ---
    {
      id: `food-today-1`,
      date: today,
      mealCategory: 'morning_tea',
      foodName: 'Special Karak Adrak Chai & Rusks',
      image: EVENING_TEA_IMAGE,
      time: '06:30 AM - 07:30 AM',
      description: 'Slow-brewed rich milk tea infused with fresh crushed ginger and green cardamom.',
      speciality: 'Fresh milk brewed in traditional brass cauldrons',
      sponsoredBy: '',
      likes: 38,
      commentCount: 4,
      orderIndex: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: `food-today-2`,
      date: today,
      mealCategory: 'morning_tea',
      foodName: 'Warm Roasted Almond Suji Halwa',
      image: '',
      time: '06:30 AM - 07:30 AM',
      description: 'Grainy semolina dessert roasted in pure ghee and topped with slivered dry fruits.',
      speciality: 'Cooked with pure cow ghee & saffron strands',
      sponsoredBy: 'Faculty Staff Club (Welcome Term Kickoff)',
      likes: 52,
      commentCount: 6,
      orderIndex: 2,
      createdAt: new Date().toISOString()
    },
    {
      id: `food-today-3`,
      date: today,
      mealCategory: 'breakfast',
      foodName: 'Desi Aloo Gobhi Parathas with Fresh Curd',
      image: BREAKFAST_IMAGE,
      time: '07:45 AM - 09:30 AM',
      description: 'Golden tawa-roasted stuffed flatbreads served with chilled plain dahi and homemade mixed pickle.',
      speciality: 'Stuffed with spiced potatoes and cauliflower',
      sponsoredBy: '',
      likes: 94,
      commentCount: 11,
      orderIndex: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: `food-today-4`,
      date: today,
      mealCategory: 'breakfast',
      foodName: 'Farm Boiled Eggs & Sprouted Chana Salad',
      image: '',
      time: '07:45 AM - 09:30 AM',
      description: 'High-protein fitness combo with lemon-pepper tossed black gram sprouts and farm-fresh boiled eggs.',
      speciality: 'High protein option for athletes & sports boarders',
      sponsoredBy: '',
      likes: 41,
      commentCount: 2,
      orderIndex: 2,
      createdAt: new Date().toISOString()
    },
    {
      id: `food-today-5`,
      date: today,
      mealCategory: 'breakfast',
      foodName: 'Toasted Multigrain Bread & Seasonal Fruit Jam',
      image: '',
      time: '07:45 AM - 09:30 AM',
      description: 'Freshly toasted slices with butter cubes, organic strawberry jam, and honey.',
      speciality: 'Fresh bakery bread delivered every morning at 5:00 AM',
      sponsoredBy: '',
      likes: 27,
      commentCount: 1,
      orderIndex: 3,
      createdAt: new Date().toISOString()
    },
    {
      id: `food-today-6`,
      date: today,
      mealCategory: 'lunch',
      foodName: 'Hyderabadi Shahi Dum Biryani',
      image: LUNCH_IMAGE,
      time: '12:30 PM - 02:30 PM',
      description: 'Royal long-grain basmati rice layered with slow-cooked aromatic herbs, saffron, fried onions, and rich spices.',
      speciality: 'Slow cooked in sealed handis under charcoal dum for 4 hours',
      sponsoredBy: 'Alumni Association Batch 2018 (On the occasion of Annual Reunion)',
      likes: 184,
      commentCount: 23,
      orderIndex: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: `food-today-7`,
      date: today,
      mealCategory: 'lunch',
      foodName: 'Homestyle Moong Dal Tadka & Tawa Phulkas',
      image: '',
      time: '12:30 PM - 02:30 PM',
      description: 'Comforting yellow lentils tempered with cumin, roasted garlic, and ghee, served with soft hot rotis.',
      speciality: 'Freshly puffed phulkas straight from the tawa',
      sponsoredBy: '',
      likes: 67,
      commentCount: 5,
      orderIndex: 2,
      createdAt: new Date().toISOString()
    },
    {
      id: `food-today-8`,
      date: today,
      mealCategory: 'lunch',
      foodName: 'Chilled Cucumber Zeera Raita & Green Salad',
      image: '',
      time: '12:30 PM - 02:30 PM',
      description: 'Whisked probiotic yogurt with roasted cumin powder, crunchy cucumbers, and fresh sliced tomatoes.',
      speciality: 'Accompaniment to Biryani feast',
      sponsoredBy: '',
      likes: 49,
      commentCount: 3,
      orderIndex: 3,
      createdAt: new Date().toISOString()
    },
    {
      id: `food-today-9`,
      date: today,
      mealCategory: 'lunch',
      foodName: 'Chilled Sweet Rose Lassi',
      image: '',
      time: '12:30 PM - 02:30 PM',
      description: 'Creamy traditional sweet yogurt drink with a hint of roohafza rose syrup.',
      speciality: 'Refreshing midday cooler',
      sponsoredBy: 'Dining Welfare Committee',
      likes: 88,
      commentCount: 7,
      orderIndex: 4,
      createdAt: new Date().toISOString()
    },
    {
      id: `food-today-10`,
      date: today,
      mealCategory: 'evening_tea',
      foodName: 'Crispy Vegetable Samosas with Tangy Chutneys',
      image: EVENING_TEA_IMAGE,
      time: '04:45 PM - 06:15 PM',
      description: 'Flaky golden pastry filled with cumin-spiced potato and sweet peas, served with mint and tamarind dips.',
      speciality: 'Fried fresh in small batches every 15 minutes',
      sponsoredBy: '',
      likes: 120,
      commentCount: 14,
      orderIndex: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: `food-today-11`,
      date: today,
      mealCategory: 'evening_tea',
      foodName: 'Spiced Masala Milk Chai',
      image: '',
      time: '04:45 PM - 06:15 PM',
      description: 'Signature DHKC evening tea with cinnamon, cloves, ginger, and cardamom infusion.',
      speciality: 'Chef Ram Prasad’s proprietary spice recipe',
      sponsoredBy: '',
      likes: 76,
      commentCount: 4,
      orderIndex: 2,
      createdAt: new Date().toISOString()
    },
    {
      id: `food-today-12`,
      date: today,
      mealCategory: 'dinner',
      foodName: 'Paneer Butter Masala & Butter Naan',
      image: '',
      time: '08:00 PM - 10:00 PM',
      description: 'Soft cottage cheese cubes simmered in a velvety tomato-cashew butter gravy, served with hot clay-oven naans.',
      speciality: 'Fresh cottage cheese delivered directly from the local dairy',
      sponsoredBy: '',
      likes: 132,
      commentCount: 16,
      orderIndex: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: `food-today-13`,
      date: today,
      mealCategory: 'dinner',
      foodName: 'Steamed Fragrant Jeera Basmati Rice',
      image: '',
      time: '08:00 PM - 10:00 PM',
      description: 'Fluffy long grain rice tempered with shahi jeera and a spoon of desi ghee.',
      speciality: 'Light and easy to digest for bedtime',
      sponsoredBy: '',
      likes: 54,
      commentCount: 2,
      orderIndex: 2,
      createdAt: new Date().toISOString()
    },
    {
      id: `food-today-14`,
      date: today,
      mealCategory: 'dinner',
      foodName: 'Warm Shahi Gulab Jamun (2 Pcs)',
      image: '',
      time: '08:00 PM - 10:00 PM',
      description: 'Golden mawa dumplings soaked in cardamom and rose sugar syrup.',
      speciality: 'Served warm straight from the syrup cauldron',
      sponsoredBy: 'Hostel Union 2026',
      likes: 147,
      commentCount: 19,
      orderIndex: 3,
      createdAt: new Date().toISOString()
    },
    // Tomorrow
    {
      id: `food-tom-1`,
      date: tomorrow,
      mealCategory: 'morning_tea',
      foodName: 'Elaichi Chai & Crunchy Mathri',
      image: EVENING_TEA_IMAGE,
      time: '06:30 AM - 07:30 AM',
      description: 'Cardamom infused milk tea with spiced savory crackers.',
      likes: 15,
      commentCount: 0,
      orderIndex: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: `food-tom-2`,
      date: tomorrow,
      mealCategory: 'breakfast',
      foodName: 'Crispy Dosa with Sambhar & Coconut Chutney',
      image: BREAKFAST_IMAGE,
      time: '07:45 AM - 09:30 AM',
      description: 'Golden fermented rice-lentil crepes with piping hot vegetable sambhar and fresh grated coconut dip.',
      speciality: 'South Indian Chef recipe',
      likes: 82,
      commentCount: 5,
      orderIndex: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: `food-tom-3`,
      date: tomorrow,
      mealCategory: 'lunch',
      foodName: 'Rajma Masala with Steamed Basmati Rice & Boondi Raita',
      image: '',
      time: '12:30 PM - 02:30 PM',
      description: 'Slow-simmered Kashmiri red kidney beans in rich spiced tomato sauce over fluffy rice.',
      likes: 91,
      commentCount: 7,
      orderIndex: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: `food-tom-4`,
      date: tomorrow,
      mealCategory: 'evening_tea',
      foodName: 'Hot Onion Pakoras & Mint Chutney with Chai',
      image: EVENING_TEA_IMAGE,
      time: '05:00 PM - 06:15 PM',
      description: 'Crisp gram-flour fritters with thin sliced onions and green chillies.',
      likes: 64,
      commentCount: 3,
      orderIndex: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: `food-tom-5`,
      date: tomorrow,
      mealCategory: 'dinner',
      foodName: 'Mixed Seasonal Veg Curry, Dal Makhani & Rotis',
      image: '',
      time: '08:00 PM - 10:00 PM',
      description: 'Rich creamy black lentils slow-cooked overnight with fresh seasonal vegetables.',
      likes: 73,
      commentCount: 4,
      orderIndex: 1,
      createdAt: new Date().toISOString()
    },
    // Yesterday
    {
      id: `food-yest-1`,
      date: yesterday,
      mealCategory: 'breakfast',
      foodName: 'Chole Bhature & Sweet Lassi',
      image: BREAKFAST_IMAGE,
      time: '07:45 AM - 09:30 AM',
      description: 'Spiced chickpeas with fluffy deep-fried bhaturas and pickled green chillies.',
      likes: 110,
      commentCount: 12,
      orderIndex: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: `food-yest-2`,
      date: yesterday,
      mealCategory: 'lunch',
      foodName: 'Kadhi Pakora with Jeera Rice & Green Salad',
      image: '',
      time: '12:30 PM - 02:30 PM',
      description: 'Tangy yogurt curry with soft gram-flour dumplings tempered with fenugreek seeds.',
      likes: 85,
      commentCount: 8,
      orderIndex: 1,
      createdAt: new Date().toISOString()
    }
  ];
}

export const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'comm-1',
    foodId: 'food-today-6',
    userName: 'Zayan Khan (S4, Adm 238)',
    comment: 'The biryani was absolutely outstanding today! The saffron aroma and meat tenderness was top-tier.',
    timestamp: 'Today at 01:15 PM'
  },
  {
    id: 'comm-2',
    foodId: 'food-today-6',
    userName: 'Prof. Tariq Mahmud (Incharge)',
    comment: 'Kudos to Chef Ahmed Khan and team. Perfect balance of spices, not overly oily.',
    timestamp: 'Today at 01:30 PM'
  },
  {
    id: 'comm-3',
    foodId: 'food-today-6',
    userName: 'Suhail Saifi (S1A, Adm 473)',
    comment: 'The zeera raita paired with it was so refreshing. Great meal today!',
    timestamp: 'Today at 01:45 PM'
  },
  {
    id: 'comm-4',
    foodId: 'food-today-3',
    userName: 'Muhammed Imdad (S3, Adm 423)',
    comment: 'Hot aloo parathas on a chilly morning are pure comfort. Loved the homemade pickle.',
    timestamp: 'Today at 08:35 AM'
  },
  {
    id: 'comm-5',
    foodId: 'food-today-10',
    userName: 'Pukrimayum Gulbaj Ahmed (S2, Adm 452)',
    comment: 'Fresh batch of samosas right around 5 PM is the best routine after afternoon classes.',
    timestamp: 'Today at 05:20 PM'
  }
];
