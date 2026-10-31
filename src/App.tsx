/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MealSection } from './components/MealSection';
import { DateSelector } from './components/DateSelector';
import { CommentsModal } from './components/CommentsModal';
import { BottomNav } from './components/BottomNav';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { QuickFoodModal } from './components/admin/QuickFoodModal';
import { ClassesDirectoryModal } from './components/students/ClassesDirectoryModal';
import { StudentProfileModal } from './components/students/StudentProfileModal';
import { TeacherRemarksModal } from './components/students/TeacherRemarksModal';
import { CookDashboardModal } from './components/cook/CookDashboardModal';
import { DonateModal } from './components/DonateModal';
import { LiveDiningDashboard } from './components/LiveDiningDashboard';
import { OurTeamView } from './components/OurTeamView';
import { InstallModal } from './components/InstallModal';
import { TeacherPortal } from './components/teacher/TeacherPortal';
import { api } from './services/api';
import { storage } from './services/storage';
import { getTodayDateString } from './data/initialData';
import { formatDateToReadable } from './utils/imageHelper';
import { FoodItem, MealCategory, MEAL_CATEGORIES, Student } from './types';
import {
  UtensilsCrossed,
  Sparkles,
  Shield,
  Plus,
  Calendar,
  Clock,
  Check,
  Trash2,
  Edit2,
  AlertCircle,
  LogOut,
  HeartHandshake,
  Users
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'menu' | 'team'>('home');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(storage.isAdminLoggedIn());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dedicated Route Detection for /teacher
  const [isTeacherRoute, setIsTeacherRoute] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.startsWith('/teacher') || window.location.pathname.startsWith('/remarks');
    }
    return false;
  });

  useEffect(() => {
    const handlePopState = () => {
      setIsTeacherRoute(
        window.location.pathname.startsWith('/teacher') || window.location.pathname.startsWith('/remarks')
      );
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Safe background sync with server
  useEffect(() => {
    api.syncWithServer().catch(() => {});
  }, []);

  // Food Data states
  const [todayFoodItems, setTodayFoodItems] = useState<FoodItem[]>([]);
  const [dateWiseFoodItems, setDateWiseFoodItems] = useState<FoodItem[]>([]);
  const [mealConfigs, setMealConfigs] = useState(storage.getMealCategories());

  // Modals state
  const [isClassesModalOpen, setIsClassesModalOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [adminInitialTab, setAdminInitialTab] = useState<string>('update_today');
  const [isTeacherRemarksOpen, setIsTeacherRemarksOpen] = useState(false);
  const [isCookLoginOpen, setIsCookLoginOpen] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);
  const [selectedFoodForComments, setSelectedFoodForComments] = useState<FoodItem | null>(null);

  // Quick Food Edit / Add Modal state
  const [isQuickFoodModalOpen, setIsQuickFoodModalOpen] = useState(false);
  const [foodToEdit, setFoodToEdit] = useState<FoodItem | null>(null);
  const [quickAddDefaultCategory, setQuickAddDefaultCategory] = useState<MealCategory>('lunch');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync data whenever storage updates or date changes
  const loadData = () => {
    setIsAdminLoggedIn(storage.isAdminLoggedIn());
    setMealConfigs(storage.getMealCategories());
    const today = getTodayDateString();
    setTodayFoodItems(storage.getFoodItemsByDate(today));
    setDateWiseFoodItems(storage.getFoodItemsByDate(selectedDate));
  };

  // Admin Food Actions on Today's Food
  const handleOpenAddFoodForCategory = (catId: MealCategory) => {
    setFoodToEdit(null);
    setQuickAddDefaultCategory(catId);
    setIsQuickFoodModalOpen(true);
  };

  const handleEditFoodItem = (food: FoodItem) => {
    setFoodToEdit(food);
    setQuickAddDefaultCategory(food.mealCategory);
    setIsQuickFoodModalOpen(true);
  };

  const handleDeleteFoodItem = (food: FoodItem) => {
    if (window.confirm(`Are you sure you want to delete "${food.foodName}" from Today's Food?`)) {
      storage.deleteFoodItem(food.id);
      loadData();
      showToast(`Deleted "${food.foodName}" from Today's Food.`);
    }
  };

  const handleSaveQuickFood = (foodData: Partial<FoodItem>) => {
    if (foodData.id) {
      storage.updateFoodItem(foodData.id, foodData);
      showToast(`Updated "${foodData.foodName}" successfully!`);
    } else {
      storage.addFoodItem({
        date: getTodayDateString(),
        mealCategory: foodData.mealCategory || 'lunch',
        foodName: foodData.foodName || 'New Dish',
        time: foodData.time || '12:30 PM - 02:30 PM',
        description: foodData.description || '',
        speciality: foodData.speciality || '',
        sponsoredBy: foodData.sponsoredBy || '',
        image: foodData.image || '',
        addedBy: 'admin',
      });
      showToast(`Added "${foodData.foodName}" to Today's Food!`);
    }
    loadData();
  };

  if (isTeacherRoute) {
    return (
      <TeacherPortal
        onBackToCanteen={() => {
          if (typeof window !== 'undefined') {
            window.history.pushState({}, '', '/');
          }
          setIsTeacherRoute(false);
          loadData();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1220] text-slate-100 pb-20 selection:bg-amber-400/20 selection:text-amber-300 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 right-4 z-50 bg-[#10192d] text-amber-300 border border-amber-500/30 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header with strict 3-dot menu */}
      <Header
        activeTab={activeTab}
        setActiveTab={(t) => setActiveTab(t as any)}
        onOpenClasses={() => setIsClassesModalOpen(true)}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
        onOpenTeacherRemarks={() => setIsTeacherRemarksOpen(true)}
        onOpenTeacherPortal={() => {
          if (typeof window !== 'undefined') {
            window.history.pushState({}, '', '/teacher');
          }
          setIsTeacherRoute(true);
        }}
        onOpenCookLogin={() => setIsCookLoginOpen(true)}
        onOpenDonate={() => setIsDonateOpen(true)}
        onOpenInstall={() => setIsInstallOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-5 flex-1">
        {/* ===================== TAB 1: DARUL FALAH STYLE LIVE DINING BOARD ===================== */}
        {activeTab === 'home' && (
          <LiveDiningDashboard
            todayItems={todayFoodItems}
            mealConfigs={mealConfigs}
            onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
          />
        )}

        {/* ===================== TAB 2: CALENDAR DATE-WISE MENU ===================== */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="mb-2">
              <h1 className="text-2xl font-bold font-display text-white tracking-tight flex items-center gap-2">
                <UtensilsCrossed className="w-6 h-6 text-amber-400" />
                Date-wise Food Schedule
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Select any date to view historical or upcoming meal schedules across all 5 shifts.
              </p>
            </div>

            {/* Date Selector */}
            <DateSelector
              selectedDate={selectedDate}
              onSelectDate={(newDate) => setSelectedDate(newDate)}
            />

            {/* Food items for selected date across all 5 categories */}
            <div className="space-y-8">
              {mealConfigs.map((cat) => {
                const itemsForCat = dateWiseFoodItems.filter(
                  (item) => item.mealCategory === cat.id
                );
                return (
                  <MealSection
                    key={cat.id}
                    config={cat}
                    items={itemsForCat}
                    isAdmin={isAdminLoggedIn}
                    onOpenComments={(food) => setSelectedFoodForComments(food)}
                    onAddFoodForCategory={handleOpenAddFoodForCategory}
                    onEditFood={handleEditFoodItem}
                    onDeleteFood={handleDeleteFoodItem}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* ===================== TAB 3: OUR TEAM & GALLERY ===================== */}
        {activeTab === 'team' && (
          <OurTeamView
            isAdmin={isAdminLoggedIn}
            onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
            onOpenDonate={() => setIsDonateOpen(true)}
          />
        )}
      </main>

      {/* Institutional Clean Footer */}
      <footer className="mt-auto border-t border-[#1b2b48] bg-[#080d18] py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 space-y-1">
          <p className="font-bold text-slate-300">
            DHKC CANTEEN · Dining Hall Food Schedule
          </p>
          <p className="text-[11px] text-slate-500">
            5 Shifts: Morning Tea & Snacks · Breakfast · Lunch · Evening Tea & Snacks · Dinner
          </p>
        </div>
      </footer>

      {/* Bottom Nav: Quick switch between Today's Food, Date Calendar, Our Team & Donate Us */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0b1220]/95 backdrop-blur-md border-t border-[#1b2b48] shadow-2xl">
        <div className="max-w-lg mx-auto grid grid-cols-4 items-center h-16 px-2 sm:px-4">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
              activeTab === 'home' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className={`w-10 sm:w-12 h-7 flex items-center justify-center rounded-full transition-colors ${
                activeTab === 'home' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <span className="text-[10px] sm:text-[11px] mt-0.5 font-medium">Today's Food</span>
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
              activeTab === 'menu' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className={`w-10 sm:w-12 h-7 flex items-center justify-center rounded-full transition-colors ${
                activeTab === 'menu' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'
              }`}
            >
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-[10px] sm:text-[11px] mt-0.5 font-medium">Calendar</span>
          </button>

          <button
            onClick={() => setActiveTab('team')}
            className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
              activeTab === 'team' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className={`w-10 sm:w-12 h-7 flex items-center justify-center rounded-full transition-colors ${
                activeTab === 'team' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'
              }`}
            >
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[10px] sm:text-[11px] mt-0.5 font-medium">Our Team</span>
          </button>

          <button
            onClick={() => setIsDonateOpen(true)}
            className="flex flex-col items-center justify-center py-1 transition-all cursor-pointer text-rose-400 hover:text-rose-300 group"
          >
            <div className="w-10 sm:w-12 h-7 flex items-center justify-center rounded-full transition-colors bg-rose-500/15 text-rose-400 group-hover:bg-rose-500/25">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <span className="text-[10px] sm:text-[11px] mt-0.5 font-medium text-rose-400">Donate Us</span>
          </button>
        </div>
      </nav>

      {/* MODALS */}
      {/* 1. Quick Customize / Add Food Modal */}
      <QuickFoodModal
        isOpen={isQuickFoodModalOpen}
        onClose={() => setIsQuickFoodModalOpen(false)}
        foodToEdit={foodToEdit}
        defaultCategory={quickAddDefaultCategory}
        onSave={handleSaveQuickFood}
        onDelete={(id, name) => {
          storage.deleteFoodItem(id);
          loadData();
          showToast(`Deleted "${name}" from Today's Food.`);
        }}
      />

      {/* 2. Classes Directory Modal */}
      <ClassesDirectoryModal
        isOpen={isClassesModalOpen}
        onClose={() => setIsClassesModalOpen(false)}
        onSelectStudent={(st) => setSelectedStudentForProfile(st)}
      />

      {/* 3. Student Profile Modal */}
      <StudentProfileModal
        student={selectedStudentForProfile}
        onClose={() => setSelectedStudentForProfile(null)}
        isTeacherOrAdmin={isAdminLoggedIn}
      />

      {/* 4. Teacher Remarks Modal (Google Form style) */}
      <TeacherRemarksModal
        isOpen={isTeacherRemarksOpen}
        onClose={() => setIsTeacherRemarksOpen(false)}
      />

      {/* 5. Cook Dashboard Modal */}
      <CookDashboardModal
        isOpen={isCookLoginOpen}
        onClose={() => setIsCookLoginOpen(false)}
      />

      {/* 6. Donate Modal (QR) */}
      <DonateModal
        isOpen={isDonateOpen}
        onClose={() => setIsDonateOpen(false)}
      />

      {/* 7. Comments Drawer Modal */}
      <CommentsModal
        food={selectedFoodForComments}
        onClose={() => setSelectedFoodForComments(null)}
      />

      {/* 8. Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdminLoginOpen(false);
          setIsAdminLoggedIn(true);
          showToast('Welcome Admin! You can now customize or delete any food item.');
        }}
      />

      {/* 9. Master Admin Dashboard */}
      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        initialTab={adminInitialTab}
        onSelectStudent={(st) => setSelectedStudentForProfile(st)}
      />

      {/* 10. Install App Modal with English instructions */}
      <InstallModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
      />
    </div>
  );
}
