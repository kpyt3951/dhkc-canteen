import React, { useState } from 'react';
import { AlertTriangle, Clock, Flame, Info, Sparkles, ChevronRight, X } from 'lucide-react';
import { Announcement } from '../types';

interface UrgentSpecialsProps {
  announcements: Announcement[];
}

export const UrgentSpecials: React.FC<UrgentSpecialsProps> = ({ announcements }) => {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  if (!announcements || announcements.length === 0) return null;

  const getPriorityBadge = (priority: Announcement['priority']) => {
    switch (priority) {
      case 'high':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-rose-500" />,
          label: 'Urgent Announcement',
          containerClass: 'bg-rose-50 border-rose-200 text-rose-900',
          badgeClass: 'bg-rose-100 text-rose-700',
        };
      case 'special':
        return {
          icon: <Sparkles className="w-4 h-4 text-amber-500" />,
          label: 'Special Meal Today',
          containerClass: 'bg-amber-50/80 border-amber-200 text-amber-950',
          badgeClass: 'bg-amber-100 text-amber-800',
        };
      case 'timing':
        return {
          icon: <Clock className="w-4 h-4 text-sky-500" />,
          label: 'Schedule Adjustment',
          containerClass: 'bg-sky-50 border-sky-200 text-sky-950',
          badgeClass: 'bg-sky-100 text-sky-800',
        };
      default:
        return {
          icon: <Info className="w-4 h-4 text-stone-500" />,
          label: 'Dining Notice',
          containerClass: 'bg-stone-100 border-stone-200 text-stone-900',
          badgeClass: 'bg-stone-200 text-stone-700',
        };
    }
  };

  return (
    <div className="mb-8 space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-amber-500" />
          Urgent & Special Updates
        </h3>
        <span className="text-xs text-stone-400 font-medium">
          {announcements.length} Active {announcements.length === 1 ? 'Notice' : 'Notices'}
        </span>
      </div>

      <div className="space-y-3">
        {announcements.map((ann) => {
          const config = getPriorityBadge(ann.priority);
          return (
            <div
              key={ann.id}
              onClick={() => setSelectedAnnouncement(ann)}
              className={`group cursor-pointer rounded-2xl p-4 border transition-all hover:shadow-md ${config.containerClass} flex flex-col sm:flex-row gap-3 sm:items-center justify-between`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-black/5 flex items-center justify-center shrink-0 mt-0.5">
                  {config.icon}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${config.badgeClass}`}>
                      {config.label}
                    </span>
                    {ann.time && (
                      <span className="text-xs text-stone-500 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" />
                        {ann.time}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors">
                    {ann.title}
                  </h4>
                  <p className="text-xs text-stone-600 line-clamp-2 mt-0.5 max-w-xl leading-relaxed">
                    {ann.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {ann.image && (
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-black/10 shrink-0 bg-stone-100">
                    <img
                      src={ann.image}
                      alt={ann.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="w-8 h-8 rounded-full bg-white/70 group-hover:bg-white flex items-center justify-center text-stone-400 group-hover:text-stone-700 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 relative text-stone-900">
            <button
              onClick={() => setSelectedAnnouncement(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {selectedAnnouncement.image && (
              <div className="w-full h-44 rounded-2xl overflow-hidden mb-4 bg-stone-100">
                <img
                  src={selectedAnnouncement.image}
                  alt={selectedAnnouncement.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {selectedAnnouncement.priority.toUpperCase()}
              </span>
              {selectedAnnouncement.time && (
                <span className="text-xs text-stone-500 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {selectedAnnouncement.time}
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold font-display text-stone-900 mb-2">
              {selectedAnnouncement.title}
            </h3>

            <p className="text-sm text-stone-600 leading-relaxed mb-6 whitespace-pre-line">
              {selectedAnnouncement.message}
            </p>

            <button
              onClick={() => setSelectedAnnouncement(null)}
              className="w-full h-11 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm flex items-center justify-center"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
