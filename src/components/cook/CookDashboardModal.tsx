import React, { useState, useEffect } from 'react';
import {
  X,
  ChefHat,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Calendar,
  Clock,
  Sparkles,
  UtensilsCrossed,
  Layers,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Coffee,
  Salad,
  CupSoda,
  Moon
} from 'lucide-react';
import { FoodItem, MealCategory, MEAL_CATEGORIES, PlateCount, GlassCount } from '../../types';
import { storage } from '../../services/storage';
import { getTodayDateString } from '../../data/initialData';
import { readFileAsDataUrl } from '../../utils/imageHelper';

interface CookDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CookDashboardModal: React.FC<CookDashboardModalProps> = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(storage.isCookLoggedIn());
  const [loggedInCook, setLoggedInCook] = useState(storage.getLoggedInCook());

  // Cook's work state
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [activeTab, setActiveTab] = useState<'menu' | 'inventory'>('menu');

  // Add / Edit Food state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Partial<FoodItem> | null>(null);

  // Equipment tracking by cook
  const [plates, setPlates] = useState<PlateCount>(storage.getPlateCount());
  const [glasses, setGlasses] = useState<GlassCount>(storage.getGlassCount());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = () => {
    setIsLoggedIn(storage.isCookLoggedIn());
    setLoggedInCook(storage.getLoggedInCook());
    setFoodItems(storage.getFoodItemsByDate(selectedDate));
    setPlates(storage.getPlateCount());
    setGlasses(storage.getGlassCount());
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, selectedDate]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const verified = storage.verifyCookPassword(password);
    if (verified) {
      setIsLoggedIn(true);
      setLoggedInCook(verified);
      setPassword('');
      loadData();
    } else {
      setAuthError('Invalid cook password. Please contact dining hall administration.');
    }
  };

  const handleLogout = () => {
    storage.cookLogout();
    setIsLoggedIn(false);
    setLoggedInCook(null);
  };

  const handleOpenAddFood = (catId?: MealCategory) => {
    const defaultCat = catId || 'lunch';
    const catConfig = MEAL_CATEGORIES.find((c) => c.id === defaultCat);
    setEditingFood({
      date: selectedDate,
      mealCategory: defaultCat,
      foodName: '',
      image: '',
      time: catConfig ? catConfig.defaultTime : '12:30 PM - 02:30 PM',
      description: '',
      speciality: '',
      sponsoredBy: '',
    });
    setIsFormOpen(true);
  };

  const handleOpenEditFood = (food: FoodItem) => {
    setEditingFood({ ...food });
    setIsFormOpen(true);
  };

  const handleDeleteFood = (id: string) => {
    storage.deleteFoodItem(id);
    loadData();
    showToast('Food item removed from schedule.');
  };

  const handleSaveFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFood || !editingFood.foodName?.trim()) return;

    if (editingFood.id) {
      storage.updateFoodItem(editingFood.id, {
        foodName: editingFood.foodName.trim(),
        mealCategory: editingFood.mealCategory,
        time: editingFood.time,
        description: editingFood.description,
        speciality: editingFood.speciality,
        sponsoredBy: editingFood.sponsoredBy,
        image: editingFood.image,
      });
      showToast('Meal item updated successfully.');
    } else {
      storage.addFoodItem({
        date: selectedDate,
        mealCategory: editingFood.mealCategory || 'lunch',
        foodName: editingFood.foodName.trim(),
        time: editingFood.time || '12:30 PM - 02:30 PM',
        description: editingFood.description || '',
        speciality: editingFood.speciality || '',
        sponsoredBy: editingFood.sponsoredBy || '',
        image: editingFood.image || '',
        addedBy: 'cook',
      });
      showToast('Prepared meal added to counter schedule.');
    }

    setIsFormOpen(false);
    setEditingFood(null);
    loadData();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingFood) {
      const dataUrl = await readFileAsDataUrl(file);
      setEditingFood({ ...editingFood, image: dataUrl });
    }
  };

  const handleSaveEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    storage.updatePlateCount({
      ...plates,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      updatedBy: loggedInCook?.name || 'Cook Staff'
    });
    storage.updateGlassCount({
      ...glasses,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      updatedBy: loggedInCook?.name || 'Cook Staff'
    });
    showToast('Plate & glass counts updated.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200/90 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950 text-white shrink-0 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-display text-white leading-tight">
                  Cook's Portal
                </h2>
                {isLoggedIn && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Kitchen Session
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400">
                Update what was prepared today, upload dishes, and record plate/glass counts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                title="Log out from Cook portal"
                className="px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-rose-300 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white text-xs font-semibold py-2 px-4 text-center animate-in fade-in duration-150">
            {toastMessage}
          </div>
        )}

        {/* Cook Login Gate */}
        {!isLoggedIn ? (
          <div className="p-8 overflow-y-auto flex-1 flex flex-col items-center justify-center max-w-sm mx-auto text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4 border border-amber-500/20">
              <ChefHat className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold font-display text-stone-900">
              Authorized Cook Access
            </h3>
            <p className="text-xs text-stone-500 mt-1 mb-5">
              Please enter the kitchen authorization password to manage today's food updates and equipment.
            </p>

            <form onSubmit={handleLogin} className="w-full space-y-3">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Cook Password..."
                autoFocus
                className="w-full text-center text-sm py-2.5 px-4 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900"
              />

              {authError && (
                <p className="text-xs text-rose-600 font-medium flex items-center gap-1 justify-center">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {authError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all"
              >
                Access Kitchen Dashboard
              </button>
            </form>
          </div>
        ) : (
          /* Cook Dashboard */
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Sub-nav tabs */}
            <div className="p-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('menu')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'menu'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  Today's Prepared Meals
                </button>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'inventory'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  Plates & Glasses Tracking
                </button>
              </div>

              {activeTab === 'menu' && (
                <button
                  onClick={() => handleOpenAddFood()}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Food</span>
                </button>
              )}
            </div>

            {/* Content for active tab */}
            <div className="p-4 sm:p-5 flex-1 overflow-y-auto">
              {activeTab === 'menu' ? (
                <div className="space-y-6">
                  {/* Date picker */}
                  <div className="flex items-center justify-between bg-stone-100/60 p-2.5 rounded-2xl border border-stone-200">
                    <span className="text-xs font-bold text-stone-700">Date to Update:</span>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-3 py-1 text-xs bg-white border border-stone-300 rounded-lg font-mono text-stone-800"
                    />
                  </div>

                  {/* 5 Categories for selected date */}
                  {MEAL_CATEGORIES.map((cat) => {
                    const catItems = foodItems.filter((i) => i.mealCategory === cat.id);
                    return (
                      <div key={cat.id} className="border border-stone-200 rounded-2xl p-3.5 bg-stone-50/50">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-200">
                          <div>
                            <h4 className="text-xs font-bold font-display text-stone-900 uppercase tracking-wider">
                              {cat.name}
                            </h4>
                            <p className="text-[11px] text-stone-500">{cat.defaultTime}</p>
                          </div>
                          <button
                            onClick={() => handleOpenAddFood(cat.id)}
                            className="text-[11px] font-bold text-amber-700 hover:underline flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add item
                          </button>
                        </div>

                        {catItems.length === 0 ? (
                          <p className="text-xs text-stone-400 italic py-2">
                            No dishes recorded for {cat.name} yet.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {catItems.map((food) => (
                              <div
                                key={food.id}
                                className="p-2.5 rounded-xl bg-white border border-stone-200 flex items-center justify-between gap-3 shadow-2xs"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {food.image ? (
                                    <img
                                      src={food.image}
                                      alt=""
                                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center shrink-0 text-stone-400">
                                      <UtensilsCrossed className="w-4 h-4" />
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <h5 className="text-xs font-bold text-stone-900 truncate">
                                      {food.foodName}
                                    </h5>
                                    {food.description && (
                                      <p className="text-[11px] text-stone-500 truncate">
                                        {food.description}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => handleOpenEditFood(food)}
                                    className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteFood(food.id)}
                                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                                    title="Delete"
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
              ) : (
                /* Plates & Glasses Tracking */
                <form onSubmit={handleSaveEquipment} className="space-y-5">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-stone-700">
                    Update total counts at the start and end of shifts to track issued, available, and missing dining ware.
                  </div>

                  {/* Plates */}
                  <div className="p-4 rounded-2xl border border-stone-200 bg-white space-y-3">
                    <h4 className="text-xs font-bold font-display uppercase tracking-wider text-stone-900">
                      🍽️ Plate Tracking
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div>
                        <label className="text-[11px] font-bold text-stone-600">Total Plates</label>
                        <input
                          type="number"
                          value={plates.total}
                          onChange={(e) => setPlates({ ...plates, total: Number(e.target.value) })}
                          className="w-full mt-1 px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-stone-600">Issued</label>
                        <input
                          type="number"
                          value={plates.issued}
                          onChange={(e) => setPlates({ ...plates, issued: Number(e.target.value) })}
                          className="w-full mt-1 px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-stone-600">Available</label>
                        <input
                          type="number"
                          value={plates.available}
                          onChange={(e) => setPlates({ ...plates, available: Number(e.target.value) })}
                          className="w-full mt-1 px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-stone-600">Missing</label>
                        <input
                          type="number"
                          value={plates.missing}
                          onChange={(e) => setPlates({ ...plates, missing: Number(e.target.value) })}
                          className="w-full mt-1 px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg font-mono text-rose-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Glasses */}
                  <div className="p-4 rounded-2xl border border-stone-200 bg-white space-y-3">
                    <h4 className="text-xs font-bold font-display uppercase tracking-wider text-stone-900">
                      🥤 Glass Tracking
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div>
                        <label className="text-[11px] font-bold text-stone-600">Total Glasses</label>
                        <input
                          type="number"
                          value={glasses.total}
                          onChange={(e) => setGlasses({ ...glasses, total: Number(e.target.value) })}
                          className="w-full mt-1 px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-stone-600">Issued</label>
                        <input
                          type="number"
                          value={glasses.issued}
                          onChange={(e) => setGlasses({ ...glasses, issued: Number(e.target.value) })}
                          className="w-full mt-1 px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-stone-600">Available</label>
                        <input
                          type="number"
                          value={glasses.available}
                          onChange={(e) => setGlasses({ ...glasses, available: Number(e.target.value) })}
                          className="w-full mt-1 px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-stone-600">Missing</label>
                        <input
                          type="number"
                          value={glasses.missing}
                          onChange={(e) => setGlasses({ ...glasses, missing: Number(e.target.value) })}
                          className="w-full mt-1 px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg font-mono text-rose-600"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 font-bold text-xs uppercase tracking-wider text-stone-950 transition-all shadow-xs"
                  >
                    Save Inventory Numbers
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Modal for adding/editing food dish by cook */}
        {isFormOpen && editingFood && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-stone-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-md w-full p-5 max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-200">
                <h3 className="text-sm font-bold font-display text-stone-900">
                  {editingFood.id ? 'Edit Prepared Dish' : 'Record New Prepared Dish'}
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveFood} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Meal Period *</label>
                  <select
                    value={editingFood.mealCategory}
                    onChange={(e) => {
                      const cat = e.target.value as MealCategory;
                      const cfg = MEAL_CATEGORIES.find((c) => c.id === cat);
                      setEditingFood({
                        ...editingFood,
                        mealCategory: cat,
                        time: cfg ? cfg.defaultTime : editingFood.time,
                      });
                    }}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl"
                  >
                    {MEAL_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.defaultTime})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Food Name *</label>
                  <input
                    type="text"
                    required
                    value={editingFood.foodName || ''}
                    onChange={(e) => setEditingFood({ ...editingFood, foodName: e.target.value })}
                    placeholder="e.g. Desi Aloo Gobhi Parathas with Curd"
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Serving Time</label>
                  <input
                    type="text"
                    value={editingFood.time || ''}
                    onChange={(e) => setEditingFood({ ...editingFood, time: e.target.value })}
                    placeholder="07:45 AM - 09:30 AM"
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={editingFood.description || ''}
                    onChange={(e) => setEditingFood({ ...editingFood, description: e.target.value })}
                    placeholder="Freshly roasted on tawa with homemade pickle..."
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Speciality (Optional)</label>
                  <input
                    type="text"
                    value={editingFood.speciality || ''}
                    onChange={(e) => setEditingFood({ ...editingFood, speciality: e.target.value })}
                    placeholder="Cooked with pure cow ghee & saffron"
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Sponsored By (Optional)</label>
                  <input
                    type="text"
                    value={editingFood.sponsoredBy || ''}
                    onChange={(e) => setEditingFood({ ...editingFood, sponsoredBy: e.target.value })}
                    placeholder="e.g. Alumni Batch 2018 or Faculty Club"
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Food Image</label>
                  <div className="flex items-center gap-3">
                    <label className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                    {editingFood.image && (
                      <span className="text-xs text-emerald-600 font-semibold">Image loaded</span>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 font-bold text-xs uppercase tracking-wider text-stone-950"
                  >
                    Save Dish
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
