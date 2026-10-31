import React, { useState } from 'react';
import { Camera, Calendar, X, ZoomIn } from 'lucide-react';
import { GalleryItem } from '../types';
import { formatDateToReadable } from '../utils/imageHelper';

interface GallerySectionProps {
  items: GalleryItem[];
  isPreview?: boolean;
  onViewAll?: () => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  items,
  isPreview = false,
  onViewAll,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  const displayList = isPreview ? items.slice(0, 4) : items;

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between pb-3 mb-6 border-b border-stone-200">
        <div>
          <h3 className="text-xl font-bold font-display text-stone-900 tracking-tight flex items-center gap-2">
            <Camera className="w-6 h-6 text-amber-600" />
            Dining Hall Gallery & Moments
          </h3>
          <p className="text-xs text-stone-500">
            A glimpse into our daily kitchens, special meal festivals, dining halls, and culinary activities.
          </p>
        </div>

        {isPreview && onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline inline-flex items-center gap-1"
          >
            <span>View All ({items.length})</span>
            <span aria-hidden="true">→</span>
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-200 p-8 text-center bg-stone-50 text-stone-500 text-xs">
          No gallery moments published yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayList.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedPhoto(item)}
              className="group cursor-pointer relative rounded-2xl overflow-hidden aspect-4/3 bg-stone-100 border border-stone-200/90 shadow-xs hover:shadow-lg transition-all duration-300"
            >
              <img
                src={item.image}
                alt={item.caption || 'Dining hall moment'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 text-white">
                <p className="text-xs font-medium line-clamp-2 leading-snug">
                  {item.caption}
                </p>
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/20 text-[10px] text-stone-300">
                  <span>{formatDateToReadable(item.date)}</span>
                  <ZoomIn className="w-3.5 h-3.5 text-amber-300" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-3xl w-full bg-stone-900 rounded-3xl overflow-hidden border border-stone-800 text-white shadow-2xl">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors"
              aria-label="Close photo"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full max-h-[65vh] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={selectedPhoto.image}
                alt={selectedPhoto.caption}
                referrerPolicy="no-referrer"
                className="w-full h-auto max-h-[65vh] object-contain"
              />
            </div>

            <div className="p-5 bg-stone-900">
              <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDateToReadable(selectedPhoto.date)}</span>
              </div>
              <p className="text-sm text-stone-200 leading-relaxed">
                {selectedPhoto.caption || 'DHKC Dining Hall memory'}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
