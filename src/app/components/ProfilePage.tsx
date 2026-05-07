import { User, Award, MapPin, TrendingUp, Settings, Bell, Moon, Globe, LogOut, Shield, FileText, ChevronRight, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';

export function ProfilePage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('English');
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const handleToggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    toast.success(notificationsEnabled ? 'Notifications disabled' : 'Notifications enabled');
  };

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
    toast.info('Dark mode coming soon!');
  };

  const handleChangeLanguage = (lang: string) => {
    setLanguage(lang);
    setShowLanguageModal(false);
    toast.success(`Language changed to ${lang}`);
  };

  const handleViewReports = () => {
    toast.info('Opening reports dashboard...');
  };

  const handlePreferences = () => {
    toast.info('Opening preferences...');
  };

  const handleEditProfile = () => {
    toast.info('Edit profile functionality');
  };

  const handleLogout = () => {
    toast.success('Logging out...');
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <>
      <div className="pb-24 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-black">Profile & Settings</h2>
            <button
              onClick={handleEditProfile}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl font-medium"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-6 mb-6"
          >
            {/* Profile Header */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-white p-1">
                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-10 h-10 text-gray-600" />
                  </div>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center"
                >
                  <Shield className="w-3 h-3 text-white" />
                </motion.div>
              </div>
              <div className="flex-1">
                <h3 className="text-white text-xl font-bold">Officer John Smith</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Award className="w-4 h-4 text-yellow-300" />
                  <span className="text-yellow-300 font-medium">Inspector</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-white/80">
                  <MapPin className="w-3 h-3" />
                  <span>Central Command - District 5</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-white">156</div>
                <div className="text-xs text-white/80 mt-1">Cases Solved</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-white">98%</div>
                <div className="text-xs text-white/80 mt-1">Performance</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-white">45</div>
                <div className="text-xs text-white/80 mt-1">Active Days</div>
              </div>
            </div>
          </motion.div>

          {/* Duty Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-gray-200 rounded-2xl p-4 mb-6"
          >
            <h4 className="text-black font-semibold mb-3">Duty Information</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Status</span>
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-2 h-2 bg-green-500 rounded-full"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span className="text-green-600 font-medium">On Duty</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Shift</span>
                <span className="text-black font-medium">8:00 AM - 4:00 PM</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Badge Number</span>
                <span className="text-black font-medium">#47825</span>
              </div>
            </div>
          </motion.div>

          {/* Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-gray-200 rounded-2xl p-4 mb-6"
          >
            <h4 className="text-black font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Performance Analytics
            </h4>
            <div className="space-y-3">
              {[
                { label: 'Response Time', value: 85, color: '#44CC44' },
                { label: 'Case Resolution', value: 92, color: '#6B6BFF' },
                { label: 'Citizen Satisfaction', value: 88, color: '#AA66FF' }
              ].map((metric, i) => (
                <div key={metric.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-500">{metric.label}</span>
                    <span className="text-sm font-semibold" style={{ color: metric.color }}>{metric.value}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.value}%` }}
                      transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: metric.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Settings Menu */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <h4 className="text-black font-semibold mb-3">Settings</h4>

            {/* Notifications Toggle */}
            <button
              onClick={handleToggleNotifications}
              className="w-full bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-black font-medium">Notifications</span>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors ${notificationsEnabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <motion.div
                    animate={{ x: notificationsEnabled ? 24 : 0 }}
                    className="w-6 h-6 bg-white rounded-full shadow-sm"
                  />
                </div>
              </div>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={handleToggleDarkMode}
              className="w-full bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                    <Moon className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-black font-medium">Dark Mode</span>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-purple-500' : 'bg-gray-300'}`}>
                  <motion.div
                    animate={{ x: darkMode ? 24 : 0 }}
                    className="w-6 h-6 bg-white rounded-full shadow-sm"
                  />
                </div>
              </div>
            </button>

            {/* Language */}
            <button
              onClick={() => setShowLanguageModal(true)}
              className="w-full bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-cyan-600" />
                  </div>
                  <span className="text-black font-medium">Language</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">{language}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </button>

            {/* Reports */}
            <button
              onClick={handleViewReports}
              className="w-full bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-black font-medium">Reports</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>

            {/* Preferences */}
            <button
              onClick={handlePreferences}
              className="w-full bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="text-black font-medium">Preferences</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full bg-red-50 border border-red-200 rounded-xl p-4 hover:bg-red-100 transition-colors mt-4"
            >
              <div className="flex items-center justify-center gap-3">
                <LogOut className="w-5 h-5 text-red-600" />
                <span className="text-red-600 font-semibold">Logout</span>
              </div>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Language Modal */}
      <AnimatePresence>
        {showLanguageModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md"
            >
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-black">Select Language</h3>
              </div>
              <div className="p-4 space-y-2">
                {['English', 'Spanish', 'French', 'German', 'Chinese'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleChangeLanguage(lang)}
                    className={`w-full p-3 rounded-xl text-left transition-colors ${
                      language === lang
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'bg-white hover:bg-gray-50 text-black'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => setShowLanguageModal(false)}
                  className="w-full py-3 bg-gray-100 rounded-xl text-black font-medium"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
