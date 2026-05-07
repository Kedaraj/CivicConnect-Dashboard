import { Camera, MapPin, AlertTriangle, Car, Construction, Phone, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { api } from '../../../../api';

export function ReportPage() {
  const [incidentType, setIncidentType] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Live GPS
  const [liveLocation, setLiveLocation] = useState<{lat:number;lng:number;address:string}|null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        let address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const data = await res.json();
          if (data.display_name) address = data.display_name.split(",").slice(0, 3).join(",");
        } catch {}
        setLiveLocation({ lat, lng, address });
      }, () => {
        setLiveLocation({ lat: 15.8497, lng: 74.4977, address: "Belagavi, RPD Cross (GPS denied)" });
      }, { enableHighAccuracy: true });
    }
  }, []);

  const incidentTypes = [
    { id: 'accident', label: 'Accident', icon: Car, color: 'red' },
    { id: 'traffic_jam', label: 'Traffic Jam', icon: AlertTriangle, color: 'orange' },
    { id: 'road_damage', label: 'Road Damage', icon: Construction, color: 'yellow' },
    { id: 'pothole', label: 'Pothole', icon: Phone, color: 'amber' },
  ];

  const handleSubmit = async () => {
    if (!incidentType || !description) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const loc = liveLocation || { lat: 15.8497, lng: 74.4977, address: "Belagavi" };
      await api.createIncident({
        type: incidentType,
        title: `${incidentTypes.find(t => t.id === incidentType)?.label} — ${loc.address.split(",")[0]}`,
        description,
        location: { lat: loc.lat, lng: loc.lng, address: loc.address },
        priority: severity,
      });

      // Send appropriate alert
      if (incidentType === 'accident') {
        toast.success('🚨 Incident reported! Ambulance & Police alerted!');
      } else if (incidentType === 'traffic_jam') {
        toast.success('🚔 Incident reported! Traffic units notified!');
      } else {
        toast.success('✅ Incident reported successfully!');
      }

      setSubmitted(true);
    } catch (err: any) {
      toast.error('Failed to submit: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="h-full bg-white flex flex-col items-center justify-center px-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </motion.div>
        <h2 className="text-2xl font-bold text-black mb-2">Report Submitted!</h2>
        <p className="text-gray-500 text-center mb-6">Relevant authorities have been notified and will respond shortly.</p>
        <button onClick={() => { setSubmitted(false); setIncidentType(''); setDescription(''); }}
          className="w-full py-4 bg-black text-white rounded-2xl font-semibold">
          Submit Another Report
        </button>
      </div>
    );
  }

  return (
    <div className="h-full bg-white overflow-y-auto pb-24">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
        <h2 className="text-2xl font-bold text-black">Report Incident</h2>
        <p className="text-sm text-gray-500">Submit a new traffic incident report</p>
      </div>

      <div className="p-4 space-y-5">
        {/* Incident Type */}
        <div>
          <label className="block text-sm font-medium text-black mb-3">Incident Type *</label>
          <div className="grid grid-cols-2 gap-3">
            {incidentTypes.map((type) => (
              <motion.button key={type.id} whileTap={{ scale: 0.95 }}
                onClick={() => setIncidentType(type.id)}
                className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                  incidentType === type.id ? 'border-black bg-gray-50' : 'border-gray-200 bg-white'
                }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  type.color === 'red' ? 'bg-red-100' : type.color === 'orange' ? 'bg-orange-100' : type.color === 'amber' ? 'bg-amber-100' : 'bg-yellow-100'
                }`}>
                  <type.icon className={`w-5 h-5 ${
                    type.color === 'red' ? 'text-red-600' : type.color === 'orange' ? 'text-orange-600' : type.color === 'amber' ? 'text-amber-600' : 'text-yellow-600'
                  }`} />
                </div>
                <span className={`font-medium ${incidentType === type.id ? 'text-black' : 'text-gray-600'}`}>
                  {type.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Live Location */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">📍 Live Location</label>
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-green-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-black truncate">
                {liveLocation?.address || 'Detecting GPS location...'}
              </p>
              {liveLocation && (
                <p className="text-xs text-green-600">{liveLocation.lat.toFixed(4)}, {liveLocation.lng.toFixed(4)}</p>
              )}
            </div>
            <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-lg">Auto</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">Description *</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide details about the incident..."
            rows={4}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black resize-none"
          />
        </div>

        {/* Severity */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">Severity</label>
          <div className="grid grid-cols-3 gap-2">
            {[{id:'low',label:'Low',color:'bg-gray-100 text-gray-600'},{id:'medium',label:'Medium',color:'bg-orange-100 text-orange-600'},{id:'high',label:'High',color:'bg-red-100 text-red-600'}].map((s) => (
              <button key={s.id} onClick={() => setSeverity(s.id)}
                className={`py-2.5 rounded-xl font-medium text-sm transition-all ${severity === s.id ? 'bg-black text-white' : s.color}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">Add Evidence</label>
          <div className="grid grid-cols-3 gap-2">
            <label className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center gap-1 cursor-pointer hover:border-black transition-colors">
              <Camera className="w-6 h-6 text-gray-400" />
              <span className="text-xs text-gray-500">Photo</span>
              <input type="file" accept="image/*" className="hidden" />
            </label>
            <label className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center gap-1 cursor-pointer hover:border-black transition-colors">
              <span className="text-lg">🎥</span>
              <span className="text-xs text-gray-500">Video</span>
              <input type="file" accept="video/*" className="hidden" />
            </label>
            <button className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center gap-1 hover:border-black transition-colors">
              <span className="text-lg">🎤</span>
              <span className="text-xs text-gray-500">Voice</span>
            </button>
          </div>
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} disabled={loading}
          className="w-full py-4 bg-black text-white rounded-2xl font-semibold text-lg disabled:opacity-50 transition-all">
          {loading ? 'Submitting...' : '🚨 Submit Report'}
        </button>
      </div>
    </div>
  );
}
