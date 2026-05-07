import { AlertTriangle, Brain, Car, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export function QuickActions() {
  const actions = [
    { icon: AlertTriangle, label: 'Report Issue', color: '#FFE5E5', iconColor: '#FF4444' },
    { icon: Brain, label: 'AI Prediction', color: '#E5E5FF', iconColor: '#6B6BFF' },
    { icon: Car, label: 'Dispatch', color: '#E5FFE5', iconColor: '#44CC44' },
    { icon: Zap, label: 'Emergency', color: '#FFF5E5', iconColor: '#FFA500' }
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((action, i) => (
        <motion.button
          key={action.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => toast.info(action.label)}
          className="flex flex-col items-center"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2"
            style={{ backgroundColor: action.color }}
          >
            <action.icon className="w-6 h-6" style={{ color: action.iconColor }} />
          </div>
          <span className="text-xs text-black text-center">{action.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
