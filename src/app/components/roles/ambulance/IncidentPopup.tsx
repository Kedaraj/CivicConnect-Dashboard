import { MapPin, Clock, Navigation, X, CheckCircle, Phone } from 'lucide-react';
import { motion } from 'motion/react';
import { EvidenceViewer } from '../EvidenceViewer';

export function IncidentPopup({ incident, onClose, onAccept }: { incident: any; onClose: () => void; onAccept: (id: string) => void }) {
  const isSolved = incident.status === 'resolved' || incident.status === 'closed';
  const openNav = () => {
    const loc = incident.location || {};
    const lat = loc.lat || loc.latitude || loc.coordinates?.[1] || 15.8497;
    const lng = loc.lng || loc.longitude || loc.coordinates?.[0] || 74.4977;
    navigator.geolocation?.getCurrentPosition(
      p => window.open(`https://www.google.com/maps/dir/?api=1&origin=${p.coords.latitude},${p.coords.longitude}&destination=${lat},${lng}&travelmode=driving`, '_blank'),
      () => window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`, '_blank')
    );
  };
  const pColor: Record<string, string> = { high: '#EF4444', medium: '#F97316', low: '#22C55E' };
  const color = isSolved ? '#6B7280' : (pColor[incident.priority] || '#F97316');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4">
      <motion.div initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }} className="bg-white rounded-t-3xl w-full max-w-lg max-h-[85vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center rounded-t-3xl">
          <h2 className="text-lg font-bold">Emergency Details</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4 space-y-3">
          {isSolved ? (
            <div className="rounded-xl p-3 bg-green-50 border border-green-200 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" /><span className="text-green-700 font-bold text-sm">✅ CASE RESOLVED</span>
            </div>
          ) : (
            <div className="rounded-xl p-3 flex justify-between" style={{ backgroundColor: color + '20' }}>
              <span className="text-sm font-bold" style={{ color }}>{incident.priority === 'high' ? '🔴 CRITICAL' : incident.priority === 'medium' ? '🟡 URGENT' : '🟢 LOW'}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/60" style={{ color }}>{(incident.status || 'open').toUpperCase()}</span>
            </div>
          )}
          <div className="bg-gray-50 rounded-xl p-3 space-y-2">
            <h3 className="font-bold text-black">{incident.title || incident.type}</h3>
            {incident.description && <p className="text-sm text-gray-600 whitespace-pre-line">{incident.description}</p>}
            <div className="flex items-center gap-2 text-sm text-gray-500"><MapPin className="w-4 h-4 text-red-500" />{incident.location?.address || 'Unknown'}</div>
            <div className="flex items-center gap-2 text-sm text-gray-500"><Clock className="w-4 h-4 text-blue-500" />{incident.createdAt ? new Date(incident.createdAt).toLocaleString() : 'Just now'}</div>
            {incident.reportedBy?.name && <p className="text-xs text-gray-400">Reported by: {incident.reportedBy.name}</p>}
          </div>

          {/* Evidence Section */}
          <EvidenceViewer evidence={incident.evidence} />

          <button onClick={openNav} className="w-full py-3 bg-green-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2">
            <Navigation className="w-5 h-5" /> 🚑 Navigate to Location
          </button>
          {!isSolved && (
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { onAccept(incident._id); onClose(); }} className="py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold">Accept & Respond</button>
              <button onClick={() => window.open('tel:112')} className="py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium flex items-center justify-center gap-1"><Phone className="w-4 h-4" />Call Control</button>
            </div>
          )}
          <button onClick={onClose} className="w-full py-2.5 bg-gray-100 text-black rounded-xl font-medium text-sm">Close</button>
        </div>
      </motion.div>
    </div>
  );
}
