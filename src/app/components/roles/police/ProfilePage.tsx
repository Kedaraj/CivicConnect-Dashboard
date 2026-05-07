import { User, Mail, Phone, MapPin, Shield, LogOut, Settings, Bell, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export function ProfilePage() {
  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-blue-600 to-blue-700 p-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Profile</h2>
          <button
            onClick={() => toast.info('Settings')}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
          >
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 -mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-black">Officer Smith</h3>
              <p className="text-sm text-gray-500">Traffic Police Department</p>
              <div className="flex items-center gap-1 mt-1">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-blue-600 font-medium">Badge #12345</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">officer.smith@traffic.gov</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">Downtown Precinct, City</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 pt-16 pb-6">
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Reports', value: '156' },
            { label: 'Cases', value: '89' },
            { label: 'Hours', value: '240' }
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
              <div className="text-2xl font-bold text-black">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          {[
            { icon: Settings, label: 'Account Settings', color: 'blue' },
            { icon: Bell, label: 'Notifications', color: 'purple' },
            { icon: Lock, label: 'Privacy & Security', color: 'green' },
            { icon: Shield, label: 'Badge Verification', color: 'orange' }
          ].map((item) => (
            <motion.button
              key={item.label}
              whileTap={{ scale: 0.98 }}
              onClick={() => toast.info(item.label)}
              className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-${item.color}-100 rounded-xl flex items-center justify-center`}>
                  <item.icon className={`w-5 h-5 text-${item.color}-600`} />
                </div>
                <span className="font-medium text-black">{item.label}</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            toast.success('Logged out successfully');
            window.location.reload();
          }}
          className="w-full mt-6 py-4 bg-red-50 text-red-600 rounded-xl font-semibold flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
