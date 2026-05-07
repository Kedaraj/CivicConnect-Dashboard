import { TrendingUp, Activity, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export function AIInsights() {
  const stats = [
    { label: 'Traffic Flow', value: '85%', icon: TrendingUp, color: '#44CC44', bgColor: '#E5FFE5' },
    { label: 'Active Incidents', value: '12', icon: Activity, color: '#FF4444', bgColor: '#FFE5E5' },
    { label: 'Response Time', value: '4.2m', icon: Clock, color: '#6B6BFF', bgColor: '#E5E5FF' }
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-black">AI Traffic Insights</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <motion.div
            className="w-1.5 h-1.5 bg-green-500 rounded-full"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-xs font-medium text-green-600">LIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl p-3"
            style={{ backgroundColor: stat.bgColor }}
          >
            <stat.icon className="w-5 h-5 mb-2" style={{ color: stat.color }} />
            <div className="text-xl font-bold text-black mb-1">{stat.value}</div>
            <div className="text-xs text-gray-600">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
