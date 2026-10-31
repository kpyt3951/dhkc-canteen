import React, { useState, useEffect } from 'react';
import { X, Utensils, Clock, Sparkles, Award, Upload, Trash2, Check } from 'lucide-react';
import { FoodItem, MealCategory, MEAL_CATEGORIES } from '../../types';
import { readFileAsDataUrl } from '../../utils/imageHelper';
import { getTodayDateString } from '../../data/initialData';

interface QuickFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodToEdit?: FoodItem | null;
  defaultCategory?: MealCategory;
  onSave: (foodData: Partial<FoodItem>) => void;
  onDelete?: (id: string, name: string) => void;
}

export const QuickFoodModal: React.FC<QuickFoodModalProps> = ({
  isOpen,
  onClose,
  foodToEdit,
  defaultCategory = 'lunch',
  onSave,
  onDelete,
}) => {
  const [mealCategory, setMealCategory] = useState<MealCategory>(defaultCategory);
  const [foodName, setFoodName] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [speciality, setSpeciality] = useState('');
  const [sponsoredBy, setSponsoredBy] = useState('');
  const [image, setImage] = useState('');
  const [date, setDate] = useState(getTodayDateString());

  useEffect(() => {
    if (foodToEdit) {
      setMealCategory(foodToEdit.mealCategory);
      setFoodName(foodToEdit.foodName || '');
      setTime(foodToEdit.time || '');
      setDescription(foodToEdit.description || '');
      setSpeciality(foodToEdit.speciality || '');
      setSponsoredBy(foodToEdit.sponsoredBy || '');
      setImage(foodToEdit.image || '');
      setDate(foodToEdit.date || getTodayDateString());
    } else {
      const cfg = MEAL_CATEGORIES.find((c) => c.id === defaultCategory);
      setMealCategory(defaultCategory);
      setFoodName('');
      setTime(cfg ? cfg.defaultTime : '12:30 PM - 02:30 PM');
      setDescription('');
      setSpeciality('');
      setSponsoredBy('');
      setImage('');
      setDate(getTodayDateString());
    }
  }, [foodToEdit, defaultCategory, isOpen]);

  if (!isOpen) return null;

  const handleCategoryChange = (cat: MealCategory) => {
    setMealCategory(cat);
    const cfg = MEAL_CATEGORIES.find((c) => c.id === cat);
    if (cfg && (!time || time === '12:30 PM - 02:30 PM')) {
      setTime(cfg.defaultTime);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const dataUrl = await readFileAsDataUrl(file);
      setImage(dataUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) return;

    onSave({
      id: foodToEdit?.id,
      date,
      mealCategory,
      foodName: foodName.trim(),
      time: time.trim() || '12:30 PM - 02:30 PM',
      description: description.trim(),
      speciality: speciality.trim(),
      sponsoredBy: sponsoredBy.trim(),
      image,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950 text-white shrink-0 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-white leading-tight">
                {foodToEdit ? 'Customize Today\'s Food Dish' : 'Add Dish to Today\'s Food'}
              </h2>
              <p className="text-xs text-stone-400">
                Admin Customization Panel · Updates live menu immediately
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Shift Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Select Meal Shift (1 of 5) *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {MEAL_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`p-2 rounded-xl text-xs font-bold text-left transition-all border ${
                    mealCategory === cat.id
                      ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <div className="truncate">{cat.name}</div>
                  <div className="text-[10px] opacity-75 font-normal truncate">{cat.defaultTime}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Food Title */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Food Dish Name *
            </label>
            <input
              type="text"
              required
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="e.g. Hyderabadi Dum Biryani with Zeera Raita"
              className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-medium"
            />
          </div>

          {/* Serving Time */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              Serving Shift Time
            </label>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="12:30 PM - 02:30 PM"
              className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-mono"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Description / Ingredients
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Aromatic long-grain basmati rice layered with slow-cooked herbs, fried onions and saffron..."
              className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900"
            />
          </div>

          {/* Speciality */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Speciality / Chef Highlight (Optional)
            </label>
            <input
              type="text"
              value={speciality}
              onChange={(e) => setSpeciality(e.target.value)}
              placeholder="e.g. Cooked under sealed charcoal dum for 4 hours"
              className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900"
            />
          </div>

          {/* Sponsored By */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              Sponsored By (Optional)
            </label>
            <input
              type="text"
              value={sponsoredBy}
              onChange={(e) => setSponsoredBy(e.target.value)}
              placeholder="e.g. Alumni Batch 2018 or Faculty Club"
              className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900"
            />
          </div>

          {/* Food Photo Upload */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Food Dish Image
            </label>
            <div className="flex items-center gap-3">
              {image ? (
                <div className="w-16 h-16 rounded-xl bg-stone-100 overflow-hidden border border-stone-300 shrink-0 relative">
                  <img src={image} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-rose-600 text-white"
                    title="Remove image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-stone-100 border border-dashed border-stone-300 flex items-center justify-center text-stone-400 shrink-0 text-xs">
                  No Photo
                </div>
              )}

              <div className="space-y-1">
                <label className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer inline-flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-stone-500" />
                  <span>{image ? 'Change Photo' : 'Upload Food Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
                <p className="text-[10px] text-stone-400">
                  Optional: JPG, PNG food photograph
                </p>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-between gap-2">
            {foodToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete "${foodToEdit.foodName}" from Today's Food?`)) {
                    onDelete(foodToEdit.id, foodToEdit.foodName);
                    onClose();
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-colors border border-rose-200"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Delete Dish</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                <Check className="w-4 h-4" />
                <span>Save Dish</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
