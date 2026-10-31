import React, { useState, useEffect } from 'react';
import { X, Send, MessageSquare, User, Heart, Sparkles } from 'lucide-react';
import { Comment, FoodItem } from '../types';
import { storage } from '../services/storage';

interface CommentsModalProps {
  food: FoodItem | null;
  onClose: () => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({ food, onClose }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (food) {
      setComments(storage.getCommentsByFoodId(food.id));
    }
  }, [food]);

  if (!food) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    const newComment = storage.addComment(
      food.id,
      authorName.trim() || 'Dining Hall Member',
      commentText.trim()
    );

    setComments((prev) => [newComment, ...prev]);
    setCommentText('');
    setIsSubmitting(false);
  };

  const quickSuggestions = [
    'Delicious meal today! 👌',
    'Perfect spices and taste! 🍲',
    'Please schedule this more often! ⭐',
    'Fresh and wholesome! 🥗',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 text-stone-900 overflow-hidden animate-in slide-in-from-bottom duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Mobile Drag Indicator */}
        <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto my-2.5 sm:hidden" />

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-stone-900 tracking-tight leading-snug">
                {food.foodName}
              </h3>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span>{food.time}</span>
                <span>·</span>
                <span className="flex items-center gap-1 text-rose-600 font-semibold">
                  <Heart className="w-3 h-3 fill-rose-500" />
                  {food.likes} likes
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments Feed */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5 divide-y divide-stone-100">
          {comments.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-2.5">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-stone-700">No comments yet</p>
              <p className="text-xs text-stone-400 mt-1">
                Be the first to share your thoughts or feedback about today's preparation!
              </p>
            </div>
          ) : (
            comments.map((item) => (
              <div key={item.id} className="pt-3.5 first:pt-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-bold">
                      {item.userName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-stone-800">
                      {item.userName}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400 font-normal">
                    {item.timestamp}
                  </span>
                </div>
                <p className="text-xs text-stone-600 pl-8 leading-relaxed">
                  {item.comment}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-5 py-2 bg-stone-50 border-t border-stone-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Quick:
          </span>
          {quickSuggestions.map((sugg, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCommentText(sugg)}
              className="text-xs text-stone-600 hover:text-stone-900 bg-white border border-stone-200/80 px-2.5 py-1 rounded-full whitespace-nowrap active:scale-95 transition-all"
            >
              {sugg}
            </button>
          ))}
        </div>

        {/* Comment Input Form */}
        <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-stone-200 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Your Name / Dept (Optional)"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Write your feedback or comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
              className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={isSubmitting || !commentText.trim()}
              className="h-10 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Post comment"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
