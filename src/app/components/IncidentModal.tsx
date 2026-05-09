import { X, MapPin, Clock, User, Camera, MessageSquare, Navigation, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { EvidenceViewer } from './EvidenceViewer';

interface IncidentModalProps {
  incident: {
    id: number;
    type: string;
    location: string;
    time: string;
    priority: string;
    status: string;
    officer: string | null;
    lat?: number;
    lng?: number;
    description?: string;
    evidence?: {url: string; type: string}[];
  };
  onClose: () => void;
  onAssign: (unitId: string) => void;
  onResolve: () => void;
}

export function IncidentModal({ incident, onClose, onAssign, onResolve }: IncidentModalProps) {
  const [selectedUnit, setSelectedUnit] = useState('');
  const [notes, setNotes] = useState('');

  const availableUnits = [
    { id: 'Unit 23', officer: 'SI Patil', distance: '0.5 km' },
    { id: 'Unit 15', officer: 'ASI Kulkarni', distance: '1.2 km' },
    { id: 'Unit 42', officer: 'PSI Hiremath', distance: '2.1 km' }
  ];

  const handleAssign = () => {
    if (selectedUnit) {
      onAssign(selectedUnit);
      onClose();
    }
  };

  const handleResolve = () => {
    onResolve();
    onClose();
  };

  const openDirection = () => {
    if (incident.lat && incident.lng) {
      navigator.geolocation?.getCurrentPosition(
        (pos) => {
          const url = `https://www.google.com/maps/dir/?api=1&origin=${pos.coords.latitude},${pos.coords.longitude}&destination=${incident.lat},${incident.lng}&travelmode=driving`;
          window.open(url, '_blank');
        },
        () => {
          const url = `https://www.google.com/maps/dir/?api=1&destination=${incident.lat},${incident.lng}&travelmode=driving`;
          window.open(url, '_blank');
        }
      );
    }
  };

  const priorityConfig: Record<string, {bg:string, text:string, label:string}> = {
    high: { bg: '#FFE5E5', text: '#FF4444', label: '🔴 HIGH PRIORITY' },
    medium: { bg: '#FFF5E5', text: '#FFA500', label: '🟡 MEDIUM' },
    low: { bg: '#E5F5E5', text: '#22C55E', label: '🟢 LOW' },
  };
  const pConfig = priorityConfig[incident.priority] || priorityConfig.low;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-xl font-bold text-black">Incident Details</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Priority Banner */}
          <div className="rounded-2xl p-3 flex items-center justify-between" style={{ backgroundColor: pConfig.bg }}>
            <span className="text-sm font-bold" style={{ color: pConfig.text }}>{pConfig.label}</span>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/60" style={{ color: pConfig.text }}>{incident.status.toUpperCase()}</span>
          </div>

          {/* Incident Info */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <h3 className="font-bold text-black text-lg mb-2">{incident.type}</h3>
            {incident.description && (
              <p className="text-sm text-gray-600 mb-3">{incident.description}</p>
            )}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-red-500" />
                <span className="font-medium">{incident.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>{incident.time}</span>
              </div>
              {incident.lat && incident.lng && (
                <div className="flex items-center gap-2 text-gray-400">
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-xs">{incident.lat.toFixed(4)}, {incident.lng.toFixed(4)}</span>
                </div>
              )}
              {incident.officer && (
                <div className="flex items-center gap-2 text-blue-600">
                  <User className="w-4 h-4" />
                  <span>Assigned to: {incident.officer}</span>
                </div>
              )}
            </div>
          </div>

          {/* Evidence Section */}
          {incident.evidence && incident.evidence.length > 0 && (
            <div className="bg-gray-50 rounded-2xl p-4">
              <EvidenceViewer evidence={incident.evidence} />
            </div>
          )}

          {/* Get Direction Button */}
          {incident.lat && incident.lng && (
            <button
              onClick={openDirection}
              className="w-full py-3.5 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md"
            >
              <Navigation className="w-5 h-5" /> 🚗 Get Direction to Incident Spot
            </button>
          )}

          {/* Assign Unit */}
          {!incident.officer && (
            <div>
              <h4 className="font-semibold text-black mb-2">Assign Unit</h4>
              <div className="space-y-2">
                {availableUnits.map((unit) => (
                  <button
                    key={unit.id}
                    onClick={() => setSelectedUnit(unit.id)}
                    className={`w-full p-3 rounded-xl border-2 transition-colors ${
                      selectedUnit === unit.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <div className="font-semibold text-black">{unit.id}</div>
                        <div className="text-sm text-gray-500">{unit.officer}</div>
                      </div>
                      <div className="text-sm text-gray-500">{unit.distance}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <h4 className="font-semibold text-black mb-2">Add Notes</h4>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter incident notes..."
              className="w-full bg-gray-50 border-0 rounded-xl p-3 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              rows={3}
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-2 py-3 bg-gray-100 rounded-xl text-black font-medium">
              <Camera className="w-4 h-4" />
              View CCTV
            </button>
            <button className="flex items-center justify-center gap-2 py-3 bg-gray-100 rounded-xl text-black font-medium">
              <MessageSquare className="w-4 h-4" />
              Contact
            </button>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {!incident.officer && selectedUnit && (
              <button
                onClick={handleAssign}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold"
              >
                Assign {selectedUnit}
              </button>
            )}
            {incident.officer && (
              <button
                onClick={handleResolve}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold"
              >
                Mark as Resolved
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-100 text-black rounded-xl font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
