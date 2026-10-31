import React from 'react';
import { Home, UtensilsCrossed, Camera, Users } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
    },
    {
      id: 'menu',
      label: "Today's Menu",
      icon: UtensilsCrossed,
    },
    {
      id: 'gallery',
      label: 'Gallery',
      icon: Camera,
    },
    {
      id: 'team',
      label: 'Our Team',
      icon: Users,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-4 items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] py-1 rounded-xl transition-all ${
                isActive
                  ? 'text-amber-700'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div
                className={`w-10 h-7 flex items-center justify-center rounded-full transition-colors ${
                  isActive ? 'bg-amber-100 text-amber-800' : 'text-stone-500'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>
              <span
                className={`text-[10px] tracking-tight font-medium mt-0.5 truncate max-w-[70px] ${
                  isActive ? 'font-bold text-amber-900' : 'text-stone-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
