import { Bell, User, Search, Scan, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { LiveMap } from './LiveMap';
import { AIControlCenter } from './AIControlCenter';
import { MapView } from './MapView';
import { NotificationPanel } from './NotificationPanel';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [showFullMap, setShowFullMap] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  return (
    <>
      <div className="pb-24 bg-white min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs text-gray-400">9:41</div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-0.5 h-3 bg-black rounded-full" style={{ height: `${(i + 1) * 3}px` }} />
                ))}
              </div>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="black">
                <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
              </svg>
              <div className="px-1 border border-black rounded" style={{ width: '20px', height: '12px', position: 'relative' }}>
                <div className="absolute inset-y-0.5 left-0.5 right-0.5 bg-black rounded-sm" />
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-400 mb-1">GOOD MORNING</div>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-black">Kedaraj H</h1>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowNotifications(true)}
                  className="relative p-2"
                >
                  <Bell className="w-6 h-6 text-black" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>
                <button
                  onClick={() => onNavigate('profile')}
                  className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden"
                >
                  <User className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearch(true)}
                placeholder="Search traffic updates, alerts, locations."
                className="w-full bg-gray-50 border-0 rounded-2xl pl-12 pr-12 py-3 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-200 rounded-xl flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-black" />
                </button>
              ) : (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black rounded-xl flex items-center justify-center"
                >
                  <Scan className="w-4 h-4 text-white" />
                </button>
              )}
            </form>

            {/* Search Results */}
            <AnimatePresence>
              {showSearch && searchQuery && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white border border-gray-200 rounded-xl p-3 mb-3"
                >
                  <div className="text-sm text-gray-500 mb-2">Search Results</div>
                  <div className="space-y-2">
                    {['Main St & 5th Ave', 'Highway 101', 'Park Avenue'].filter(loc =>
                      loc.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((result, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSearchQuery(result);
                          setShowSearch(false);
                        }}
                        className="w-full text-left p-2 hover:bg-gray-50 rounded-lg text-black"
                      >
                        {result}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Live Map */}
          <LiveMap onClick={() => setShowFullMap(true)} />

          {/* AI Traffic Insights */}
          <AIControlCenter />
        </div>
      </div>

      {/* Full Map Modal */}
      <AnimatePresence>
        {showFullMap && <MapView onClose={() => setShowFullMap(false)} />}
      </AnimatePresence>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <NotificationPanel onClose={() => setShowNotifications(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
