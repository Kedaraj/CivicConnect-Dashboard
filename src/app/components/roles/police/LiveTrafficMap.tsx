import { MapPin, AlertCircle, AlertTriangle, Car, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { api } from '../../../../api';

export function LiveTrafficMap() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    // Fetch real incidents
    api.getIncidents({ limit: '5' }).then(setIncidents).catch(() => {});
    // Fetch real alerts
    api.getAlerts({ active: 'true' }).then(setAlerts).catch(() => {});
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      api.getIncidents({ limit: '5' }).then(setIncidents).catch(() => {});
      api.getAlerts({ active: 'true' }).then(setAlerts).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const priorityConfig: Record<string, {bg:string; text:string; dot:string}> = {
    high: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
    medium: { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-400' },
    low: { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' },
  };

  const typeEmoji: Record<string, string> = {
    accident: '🚗💥', traffic_jam: '🚦', road_damage: '🛣️', pothole: '🕳️',
    illegal_parking: '🅿️', waterlogging: '🌊', broken_signal: '⚡'
  };

  return (
    <div className="space-y-4">
      {/* Live Incidents Card */}
      <div className="rounded-2xl overflow-hidden bg-white border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-black">Live Incidents</h3>
            <motion.div
              className="w-2 h-2 bg-red-500 rounded-full"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
          <span className="text-xs font-bold bg-red-50 text-red-500 px-2 py-1 rounded-lg">
            {incidents.filter(i => i.status === 'open').length} Active
          </span>
        </div>

        {incidents.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm">Loading incidents...</div>
        ) : (
          <div className="space-y-2">
            {incidents.slice(0, 5).map((inc, i) => {
              const config = priorityConfig[inc.priority] || priorityConfig.medium;
              return (
                <motion.div
                  key={inc._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`${config.bg} rounded-xl p-3 flex items-center gap-3`}
                >
                  <div className="text-xl">{typeEmoji[inc.type] || '📍'}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-black truncate">{inc.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 truncate">{inc.location?.address || 'Unknown'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${config.bg} ${config.text}`}>
                      {inc.priority}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                      inc.status === 'open' ? 'bg-red-100 text-red-600' :
                      inc.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {inc.status?.replace('_', ' ')}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Alerts Card */}
      <div className="rounded-2xl overflow-hidden bg-white border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-black">🔔 Active Alerts</h3>
          <span className="text-xs font-bold bg-orange-50 text-orange-500 px-2 py-1 rounded-lg">
            {alerts.length} Alerts
          </span>
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-4 text-gray-400 text-sm">No active alerts</div>
        ) : (
          <div className="space-y-2">
            {alerts.slice(0, 4).map((alert, i) => (
              <motion.div
                key={alert._id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-xl p-3 flex items-center gap-3 border ${
                  alert.severity === 'high' ? 'bg-red-50 border-red-100' :
                  alert.severity === 'medium' ? 'bg-orange-50 border-orange-100' :
                  'bg-gray-50 border-gray-100'
                }`}
              >
                <AlertTriangle className={`w-5 h-5 shrink-0 ${
                  alert.severity === 'high' ? 'text-red-500' :
                  alert.severity === 'medium' ? 'text-orange-500' :
                  'text-gray-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-black truncate">{alert.title}</p>
                  <p className="text-xs text-gray-500 truncate">{alert.location?.area || alert.description}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                  alert.severity === 'high' ? 'bg-red-100 text-red-600' :
                  alert.severity === 'medium' ? 'bg-orange-100 text-orange-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {alert.severity}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
