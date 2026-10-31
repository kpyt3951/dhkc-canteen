import React, { useState, useEffect } from 'react';
import {
  Users,
  ChefHat,
  Camera,
  Plus,
  Trash2,
  X,
  Upload,
  Calendar,
  ZoomIn,
  Shield,
  Sparkles,
  CheckCircle2,
  Tag,
  HeartHandshake
} from 'lucide-react';
import { TeamMember, GalleryItem } from '../types';
import { storage } from '../services/storage';
import { readFileAsDataUrl, formatDateToReadable } from '../utils/imageHelper';
import { getTodayDateString } from '../data/initialData';

interface OurTeamViewProps {
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  onOpenDonate?: () => void;
}

export const OurTeamView: React.FC<OurTeamViewProps> = ({
  isAdmin,
  onOpenAdminLogin,
  onOpenDonate
}) => {
  const [subTab, setSubTab] = useState<'team' | 'gallery'>('team');
  const [team, setTeam] = useState<TeamMember[]>(storage.getTeamMembers());
  const [gallery, setGallery] = useState<GalleryItem[]>(storage.getGallery());

  // Lightbox modal state
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryItem | null>(null);

  // Category filter for gallery
  const [selectedGalleryCategory, setSelectedGalleryCategory] = useState<string>('All');

  // Add Team Member Modal State
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamPosition, setNewTeamPosition] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [newTeamImage, setNewTeamImage] = useState('');

  // Add Gallery Photo Modal State
  const [isAddGalleryModalOpen, setIsAddGalleryModalOpen] = useState(false);
  const [newGalleryCaption, setNewGalleryCaption] = useState('');
  const [newGalleryCategory, setNewGalleryCategory] = useState<'Dining Hall' | 'Food' | 'Events' | 'Team'>('Dining Hall');
  const [newGalleryImage, setNewGalleryImage] = useState('');

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [appLogo, setAppLogo] = useState(storage.getAppLogo());

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const loadData = () => {
    setTeam(storage.getTeamMembers());
    setGallery(storage.getGallery());
    setAppLogo(storage.getAppLogo());
  };

  useEffect(() => {
    loadData();
    const unsub = storage.subscribe(loadData);
    return unsub;
  }, []);

  // Handle Add Team Member
  const handleCreateTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !newTeamPosition.trim()) {
      alert('Please provide at least a name and position.');
      return;
    }

    storage.addTeamMember({
      name: newTeamName.trim(),
      position: newTeamPosition.trim(),
      description: newTeamDescription.trim(),
      image: newTeamImage || undefined
    });

    setNewTeamName('');
    setNewTeamPosition('');
    setNewTeamDescription('');
    setNewTeamImage('');
    setIsAddTeamModalOpen(false);
    loadData();
    showToast(`Added ${newTeamName} to the team!`);
  };

  // Handle Delete Team Member
  const handleDeleteTeamMember = (id: string, name: string) => {
    if (confirm(`Remove "${name}" from Kitchen Team?`)) {
      storage.deleteTeamMember(id);
      loadData();
      showToast(`Removed "${name}" from team.`);
    }
  };

  // Handle Add Gallery Photo
  const handleCreateGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryImage) {
      alert('Please upload an image.');
      return;
    }

    storage.addGalleryItem({
      image: newGalleryImage,
      caption: newGalleryCaption.trim() || 'DHKC Dining Hall moment',
      date: getTodayDateString(),
      category: newGalleryCategory
    });

    setNewGalleryCaption('');
    setNewGalleryImage('');
    setIsAddGalleryModalOpen(false);
    loadData();
    showToast('Photo uploaded to Gallery successfully!');
  };

  // Handle Delete Gallery Photo
  const handleDeleteGalleryItem = (id: string) => {
    if (confirm('Delete this photo from gallery?')) {
      storage.deleteGalleryItem(id);
      if (lightboxPhoto?.id === id) setLightboxPhoto(null);
      loadData();
      showToast('Photo deleted from gallery.');
    }
  };

  // Filter gallery items
  const galleryCategories = ['All', 'Dining Hall', 'Food', 'Events', 'Team'];
  const filteredGallery = gallery.filter((item) => {
    if (selectedGalleryCategory === 'All') return true;
    return item.category === selectedGalleryCategory;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-18 right-4 z-50 bg-[#10192d] text-amber-300 border border-amber-500/40 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Container */}
      <div className="bg-[#10192d] border border-[#1b2b48] rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-5 h-5 rounded-full overflow-hidden border border-amber-500/60 bg-[#0b1220] shrink-0">
                <img
                  src={appLogo || '/logo.png'}
                  alt="Logo"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/logo.png';
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-400">
                DHKC CANTEEN
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
              Our Team & Gallery
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Meet our master chefs, pantry staff, and kitchen crew, or browse photographs of our dining hall and food spreads.
            </p>
          </div>

          {/* Sub-tab Switcher: Our Team vs GALLERY vs Donate Us */}
          <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-center">
            <div className="flex items-center p-1 rounded-xl bg-[#080d1a] border border-[#1b2b48]">
              <button
                onClick={() => setSubTab('team')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  subTab === 'team'
                    ? 'bg-amber-500 text-stone-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ChefHat className="w-4 h-4" />
                <span>Our Team ({team.length})</span>
              </button>

              <button
                onClick={() => setSubTab('gallery')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  subTab === 'gallery'
                    ? 'bg-amber-500 text-stone-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>GALLERY ({gallery.length})</span>
              </button>
            </div>

            {onOpenDonate && (
              <button
                onClick={onOpenDonate}
                className="px-3.5 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 hover:text-rose-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                title="Support DHKC Dining Hall & Welfare Fund"
              >
                <HeartHandshake className="w-4 h-4 text-rose-400" />
                <span>Donate Us</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===================== TAB 1: OUR TEAM ===================== */}
      {subTab === 'team' && (
        <div className="space-y-5">
          {/* Admin Control Bar for Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-amber-400" />
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Kitchen Team & Chefs
              </h2>
            </div>

            {isAdmin ? (
              <button
                onClick={() => setIsAddTeamModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Post Team Member</span>
              </button>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="text-xs text-slate-400 hover:text-amber-400 font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Login to Post</span>
              </button>
            )}
          </div>

          {/* Team Members Grid */}
          {team.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#10192d] border border-[#1b2b48] text-slate-400 text-xs">
              No kitchen team members added yet. Admin can post team members above.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {team.map((member) => (
                <div
                  key={member.id}
                  className="bg-[#10192d] border border-[#1b2b48] hover:border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-xl transition-all flex flex-col justify-between relative group"
                >
                  <div>
                    {/* Header with Photo & Name */}
                    <div className="flex items-start gap-3.5 mb-3.5">
                      <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700/80 overflow-hidden shrink-0 flex items-center justify-center">
                        {member.image ? (
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <ChefHat className="w-8 h-8 text-amber-400/80" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold text-white truncate">
                          {member.name}
                        </h3>
                        <span className="inline-block px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-semibold mt-1">
                          {member.position}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    {member.description && (
                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                        {member.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">DHKC Culinary Team</span>

                    {isAdmin ? (
                      <button
                        onClick={() => handleDeleteTeamMember(member.id, member.name)}
                        className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        title="Delete team member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    ) : (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 2: GALLERY ===================== */}
      {subTab === 'gallery' && (
        <div className="space-y-5">
          {/* Gallery Header & Upload Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-400" />
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Canteen Gallery & Photos
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Photographs of our dining hall, culinary kitchen, festival meals, and team memories.
              </p>
            </div>

            {isAdmin ? (
              <button
                onClick={() => setIsAddGalleryModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-500/20 self-start sm:self-auto cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Photo</span>
              </button>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="text-xs text-slate-400 hover:text-amber-400 font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Login to Upload</span>
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {galleryCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedGalleryCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  selectedGalleryCategory === cat
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                    : 'bg-[#10192d] text-slate-300 border border-[#1b2b48] hover:border-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          {filteredGallery.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#10192d] border border-[#1b2b48] text-slate-400 text-xs">
              No photos found in this category. Admin can upload canteen images above.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
              {filteredGallery.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setLightboxPhoto(item)}
                  className="group cursor-pointer relative rounded-2xl overflow-hidden aspect-4/3 bg-[#10192d] border border-[#1b2b48] hover:border-amber-500/40 shadow-lg transition-all duration-300"
                >
                  <img
                    src={item.image}
                    alt={item.caption || 'Canteen photo'}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 text-white">
                    <p className="text-xs font-semibold line-clamp-2 leading-snug">
                      {item.caption}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/20 text-[10px] text-slate-300 font-mono">
                      <span>{formatDateToReadable(item.date)}</span>
                      <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                  </div>

                  {/* Admin Direct Delete button overlay */}
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGalleryItem(item.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/75 text-rose-400 hover:text-white hover:bg-rose-600 transition-colors z-10 cursor-pointer"
                      title="Delete photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================== LIGHTBOX MODAL ===================== */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative max-w-3xl w-full bg-[#10192d] rounded-3xl overflow-hidden border border-[#1b2b48] text-white shadow-2xl">
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close photo"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full max-h-[65vh] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={lightboxPhoto.image}
                alt={lightboxPhoto.caption}
                className="w-full h-auto max-h-[65vh] object-contain"
              />
            </div>

            <div className="p-5 bg-[#10192d] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDateToReadable(lightboxPhoto.date)}</span>
                  {lightboxPhoto.category && (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                      {lightboxPhoto.category}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-slate-200">
                  {lightboxPhoto.caption || 'DHKC Canteen photo'}
                </p>
              </div>

              {isAdmin && (
                <button
                  onClick={() => handleDeleteGalleryItem(lightboxPhoto.id)}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold hover:bg-rose-500/30 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Photo</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: POST TEAM MEMBER ===================== */}
      {isAddTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#10192d] border border-[#1b2b48] rounded-3xl max-w-md w-full p-5 max-h-[90vh] overflow-y-auto text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1b2b48]">
              <h3 className="text-base font-bold font-display flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-amber-400" />
                <span>Post Kitchen Team Member</span>
              </h3>
              <button
                onClick={() => setIsAddTeamModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTeamMember} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. Chef Ahmed Khan"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Role / Position *
                </label>
                <input
                  type="text"
                  required
                  value={newTeamPosition}
                  onChange={(e) => setNewTeamPosition(e.target.value)}
                  placeholder="e.g. Head Chef & Biryani Specialist"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Culinary Specialty / Description
                </label>
                <textarea
                  rows={3}
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                  placeholder="Describe experience, special recipes, or responsibilities..."
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Profile Photo (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const dataUrl = await readFileAsDataUrl(file);
                      setNewTeamImage(dataUrl);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-stone-950 cursor-pointer"
                />
                {newTeamImage && (
                  <div className="mt-2 w-16 h-16 rounded-xl overflow-hidden border border-slate-700">
                    <img src={newTeamImage} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTeamModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Save Team Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: UPLOAD GALLERY PHOTO ===================== */}
      {isAddGalleryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#10192d] border border-[#1b2b48] rounded-3xl max-w-md w-full p-5 max-h-[90vh] overflow-y-auto text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1b2b48]">
              <h3 className="text-base font-bold font-display flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-400" />
                <span>Upload Canteen Gallery Photo</span>
              </h3>
              <button
                onClick={() => setIsAddGalleryModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGalleryItem} className="space-y-3.5">
              {/* Image Picker */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Choose Photo *
                </label>
                <input
                  type="file"
                  required
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const dataUrl = await readFileAsDataUrl(file);
                      setNewGalleryImage(dataUrl);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-stone-950 cursor-pointer"
                />
                {newGalleryImage && (
                  <div className="mt-2 w-full h-36 rounded-xl overflow-hidden border border-slate-700">
                    <img src={newGalleryImage} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Caption / Description
                </label>
                <input
                  type="text"
                  value={newGalleryCaption}
                  onChange={(e) => setNewGalleryCaption(e.target.value)}
                  placeholder="e.g. Special Dum Biryani lunch serving counter"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Category
                </label>
                <select
                  value={newGalleryCategory}
                  onChange={(e) => setNewGalleryCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="Dining Hall">Dining Hall</option>
                  <option value="Food">Food & Dishes</option>
                  <option value="Events">Special Events</option>
                  <option value="Team">Kitchen Team</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddGalleryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Upload Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
