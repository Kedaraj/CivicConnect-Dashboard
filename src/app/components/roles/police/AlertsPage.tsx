import { AlertTriangle, Clock, MapPin, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { api } from '../../../../api';

export function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    api.getAlerts().then((data: any[]) => {
      setAlerts(data.map((a: any, i: number) => ({
        id: a._id || i,
        title: a.title,
        location: a.location?.area || a.location?.address || 'Unknown',
        time: new Date(a.createdAt).toLocaleString(),
        priority: a.severity === 'high' ? 'critical' : a.severity,
        read: !a.isActive
      })));
    }).catch(() => {
      // Fallback demo data if API unavailable
      setAlerts([
        { id: 1, title: 'Accident at RPD Cross, Tilakwadi', location: 'RPD Cross, Tilakwadi', time: '5 min ago', priority: 'critical', read: false },
        { id: 2, title: 'Traffic Congestion Alert', location: 'College Road, KLE Circle', time: '15 min ago', priority: 'high', read: false },
        { id: 3, title: 'Road Closure Notification', location: 'Rani Channamma Circle', time: '1 hour ago', priority: 'medium', read: true },
      ]);
    });
  }, []);

  const markAsRead = (id: number) => {
    setAlerts(alerts.map(alert =>
      alert.id === id ? { ...alert, read: true } : alert
    ));
    toast.success('Alert marked as read');
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-black">Alerts</h2>
            <p className="text-sm text-gray-500">{unreadCount} unread notifications</p>
          </div>
          <button
            onClick={() => {
              setAlerts(alerts.map(a => ({ ...a, read: true })));
              toast.success('All alerts marked as read');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium text-sm"
          >
            Mark All Read
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="p-4 space-y-3">
        {alerts.map((alert, i) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-xl p-4 border ${
              alert.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                alert.priority === 'critical' ? 'bg-red-100' :
                alert.priority === 'high' ? 'bg-orange-100' :
                alert.priority === 'medium' ? 'bg-yellow-100' : 'bg-gray-100'
              }`}>
                <AlertTriangle className={`w-5 h-5 ${
                  alert.priority === 'critical' ? 'text-red-600' :
                  alert.priority === 'high' ? 'text-orange-600' :
                  alert.priority === 'medium' ? 'text-yellow-600' : 'text-gray-600'
                }`} />
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-semibold text-black">{alert.title}</h4>
                  {!alert.read && (
                    <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                  )}
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>{alert.location}</span>
                </div>

                <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                  <Clock className="w-3 h-3" />
                  <span>{alert.time}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toast.info('Viewing alert details')}
                    className="flex-1 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium"
                  >
                    View Details
                  </button>
                  {!alert.read && (
                    <button
                      onClick={() => markAsRead(alert.id)}
                      className="px-4 py-2 bg-green-100 text-green-600 rounded-lg text-sm font-medium flex items-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
