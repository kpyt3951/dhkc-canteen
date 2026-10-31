import React from 'react';
import { FoodItem, MealCategoryConfig } from '../types';
import { FoodCard } from './FoodCard';
import { Coffee, UtensilsCrossed, Salad, CupSoda, Moon, Plus, Trash2 } from 'lucide-react';

interface MealSectionProps {
  config: MealCategoryConfig;
  items: FoodItem[];
  onOpenComments: (food: FoodItem) => void;
  isAdmin?: boolean;
  onAddFoodForCategory?: (category: MealCategoryConfig['id']) => void;
  onEditFood?: (food: FoodItem) => void;
  onDeleteFood?: (food: FoodItem) => void;
}

export const MealSection: React.FC<MealSectionProps> = ({
  config,
  items,
  onOpenComments,
  isAdmin = false,
  onAddFoodForCategory,
  onEditFood,
  onDeleteFood,
}) => {
  const getIcon = () => {
    switch (config.id) {
      case 'morning_tea':
        return <Coffee className="w-5 h-5 text-amber-600" />;
      case 'breakfast':
        return <UtensilsCrossed className="w-5 h-5 text-amber-600" />;
      case 'lunch':
        return <Salad className="w-5 h-5 text-emerald-600" />;
      case 'evening_tea':
        return <CupSoda className="w-5 h-5 text-orange-600" />;
      case 'dinner':
        return <Moon className="w-5 h-5 text-indigo-600" />;
      default:
        return <UtensilsCrossed className="w-5 h-5 text-amber-600" />;
    }
  };

  return (
    <section className="mb-10 scroll-mt-20">
      {/* Category Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-4 border-b border-stone-200/90 gap-2.5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-xs">
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold font-display text-stone-900 tracking-tight">
                {config.name}
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-mono tabular-nums">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <p className="text-xs text-stone-500 font-normal mt-0.5">
              {config.tagline} · <span className="font-semibold text-stone-800">{config.defaultTime}</span>
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {items.length > 0 && onDeleteFood && (
              <button
                onClick={() => {
                  if (window.confirm(`Delete all ${items.length} dishes from ${config.name}?`)) {
                    items.forEach((it) => onDeleteFood(it));
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1 transition-colors"
                title={`Delete all dishes in ${config.name}`}
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Delete All ({items.length})</span>
              </button>
            )}

            {onAddFoodForCategory && (
              <button
                onClick={() => onAddFoodForCategory(config.id)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Dish to {config.name}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Grid of Food Items */}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-200 p-8 text-center bg-stone-50/50">
          <p className="text-xs font-medium text-stone-500">
            No items scheduled yet for {config.name}.
          </p>
          {isAdmin && onAddFoodForCategory && (
            <button
              onClick={() => onAddFoodForCategory(config.id)}
              className="mt-2.5 text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add first item to {config.name}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              onOpenComments={onOpenComments}
              isAdmin={isAdmin}
              onEditFood={onEditFood}
              onDeleteFood={onDeleteFood}
            />
          ))}
        </div>
      )}
    </section>
  );
};
