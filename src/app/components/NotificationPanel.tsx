import { X, AlertTriangle, Info, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const notifications = [
    { id: 1, type: 'alert', title: 'New Accident Reported', message: 'Main St & 5th Ave - High Priority', time: '2 min ago', read: false },
    { id: 2, type: 'info', title: 'Traffic Update', message: 'Highway 101 experiencing heavy traffic', time: '15 min ago', read: false },
    { id: 3, type: 'success', title: 'Incident Resolved', message: 'Park Avenue signal issue fixed', time: '1 hour ago', read: true },
    { id: 4, type: 'alert', title: 'VIP Movement Alert', message: 'Downtown area - prepare route clearance', time: '2 hours ago', read: true },
    { id: 5, type: 'info', title: 'Shift Reminder', message: 'Your shift ends in 30 minutes', time: '3 hours ago', read: true }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      default: return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'alert': return 'bg-red-50';
      case 'success': return 'bg-green-50';
      default: return 'bg-blue-50';
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25 }}
      className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 overflow-auto"
    >
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-black">Notifications</h2>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <X className="w-5 h-5 text-black" />
        </button>
      </div>

      {/* Notifications List */}
      <div className="p-4 space-y-3">
        {notifications.map((notif, i) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-xl p-4 border ${
              notif.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex gap-3">
              <div className={`w-10 h-10 rounded-full ${getBgColor(notif.type)} flex items-center justify-center flex-shrink-0`}>
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-black">{notif.title}</h3>
                  {!notif.read && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{notif.time}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Clear All */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full py-3 bg-gray-100 rounded-xl text-black font-medium">
          Mark All as Read
        </button>
      </div>
    </motion.div>
  );
}
