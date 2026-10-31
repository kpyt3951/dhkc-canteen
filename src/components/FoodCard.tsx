import React, { useState } from 'react';
import { Heart, MessageSquare, Clock, Award, Sparkles, Utensils, Edit2, Trash2 } from 'lucide-react';
import { FoodItem } from '../types';
import { storage } from '../services/storage';

interface FoodCardProps {
  food: FoodItem;
  onOpenComments: (food: FoodItem) => void;
  isAdmin?: boolean;
  onEditFood?: (food: FoodItem) => void;
  onDeleteFood?: (food: FoodItem) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  food,
  onOpenComments,
  isAdmin = false,
  onEditFood,
  onDeleteFood,
}) => {
  const [liked, setLiked] = useState(() => storage.isFoodLiked(food.id));
  const [likeCount, setLikeCount] = useState(food.likes || 0);
  const [imageError, setImageError] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = storage.toggleLike(food.id);
    setLiked(result.liked);
    setLikeCount(result.newCount);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteFood) {
      onDeleteFood(food);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditFood) {
      onEditFood(food);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-stone-200/90 hover:border-amber-400/60 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden relative">
      {/* Admin Action Badge directly on card top-right if Admin is logged in */}
      {isAdmin && (
        <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 bg-stone-900/95 backdrop-blur-md p-1.5 rounded-xl shadow-xl border border-white/20">
          {onEditFood && (
            <button
              onClick={handleEdit}
              title="Customize / Edit this food item"
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          )}
          {onDeleteFood && (
            <button
              onClick={handleDelete}
              title="Delete this food item from Today's Food"
              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete</span>
            </button>
          )}
        </div>
      )}

      {/* Food Image Container */}
      {food.image && !imageError ? (
        <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-stone-100">
          <img
            src={food.image}
            alt={food.foodName}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />

          {/* Time floating badge on image */}
          <div className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-medium border border-white/10">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{food.time}</span>
          </div>
        </div>
      ) : (
        <div className="p-4 pb-0 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1.5 text-stone-600 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{food.time}</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400">
            <Utensils className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Food Title */}
          <h4 className="text-base font-bold font-display text-stone-900 tracking-tight leading-snug group-hover:text-amber-800 transition-colors mb-1.5">
            {food.foodName}
          </h4>

          {/* Description */}
          {food.description && (
            <p className="text-xs text-stone-600 leading-relaxed mb-2.5 line-clamp-2">
              {food.description}
            </p>
          )}

          {/* Specialities note */}
          {food.speciality && (
            <div className="mb-2.5 text-[11px] text-amber-900/90 bg-amber-50/70 border border-amber-200/60 rounded-lg px-2.5 py-1.5 flex items-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span className="font-medium">{food.speciality}</span>
            </div>
          )}

          {/* Sponsored By info (ONLY shown if present) */}
          {food.sponsoredBy && food.sponsoredBy.trim().length > 0 && (
            <div className="mb-3 text-[11px] bg-emerald-50 border border-emerald-200/80 text-emerald-900 rounded-xl px-2.5 py-1.5 flex items-start gap-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-emerald-800">Sponsored By: </span>
                <span className="font-medium text-emerald-950">{food.sponsoredBy}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer: Likes and Comments buttons (Min 40px hitboxes) */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`min-h-[38px] px-3 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all active:scale-95 ${
                liked
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200/60'
              }`}
              aria-label={`Like ${food.foodName}`}
            >
              <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}`} />
              <span className="font-mono tabular-nums">{likeCount}</span>
            </button>

            {/* Comment Button */}
            <button
              onClick={() => onOpenComments(food)}
              className="min-h-[38px] px-3 rounded-xl flex items-center gap-1.5 text-xs font-semibold bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200/60 transition-all active:scale-95"
              aria-label={`Comments for ${food.foodName}`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
              <span className="font-mono tabular-nums">{food.commentCount || 0}</span>
              <span className="text-[11px] text-stone-500 font-normal hidden sm:inline">Notes</span>
            </button>
          </div>

          <button
            onClick={() => onOpenComments(food)}
            className="text-[11px] font-medium text-amber-700 hover:text-amber-800 px-2 py-1 rounded hover:bg-amber-50 transition-colors"
          >
            Feedback
          </button>
        </div>
      </div>
    </div>
  );
};
