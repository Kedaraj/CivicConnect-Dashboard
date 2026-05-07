import { Home, Map, Bell, FileText, User } from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  const tabs = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'map', icon: Map, label: 'Map' },
    { id: 'incidents', icon: Bell, label: 'Alerts' },
    { id: 'complaints', icon: FileText, label: 'Report' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200">
      <div className="grid grid-cols-5 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = currentPage === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className="relative p-4 flex flex-col items-center gap-1"
            >
              <tab.icon
                className={`w-6 h-6 ${isActive ? 'text-black' : 'text-gray-400'}`}
                fill={isActive ? 'black' : 'none'}
              />
              <span className={`text-xs ${isActive ? 'text-black font-medium' : 'text-gray-400'}`}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-black rounded-full"
                  transition={{ type: 'spring', duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
