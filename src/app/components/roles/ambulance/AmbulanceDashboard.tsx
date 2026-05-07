import { useState, useEffect, useRef } from 'react';
import { Bell, User, Siren, MapPin, Hospital, Clock, Zap, Home, Map, FileText, AlertTriangle, Navigation, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { io as socketIO } from 'socket.io-client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../../../../api';
import { ProfilePage } from './ProfilePage';
import { IncidentPopup } from './IncidentPopup';

const HOSPITALS = [
  { name: 'KLES Hospital, Nehru Nagar', lat: 15.8440, lng: 74.5040, beds: 12, dist: '1.2 km' },
  { name: 'Belagavi Institute of Medical Sciences', lat: 15.8650, lng: 74.5050, beds: 8, dist: '2.8 km' },
  { name: 'District Hospital Belagavi', lat: 15.8520, lng: 74.5020, beds: 15, dist: '1.5 km' },
  { name: 'Jeevan Sanjeevini Hospital', lat: 15.8380, lng: 74.4960, beds: 6, dist: '3.1 km' },
];

function playAlertSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const t = (f: number, s: number, d: number) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.connect(g); g.connect(ctx.destination); o.frequency.value = f; o.type = 'sine'; g.gain.setValueAtTime(0.3, ctx.currentTime + s); g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + s + d); o.start(ctx.currentTime + s); o.stop(ctx.currentTime + s + d); };
    t(880,0,0.15); t(660,0.15,0.15); t(880,0.3,0.15); t(660,0.45,0.15); t(880,0.6,0.15); t(660,0.75,0.15); t(1100,0.9,0.3);
  } catch {}
}

// ─── Incident Map ──────────────────────────────────────────
function AmbulanceMap({ incidents, onSelect }: { incidents: any[]; onSelect: (i: any) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    const map = L.map(ref.current, { zoomControl: false, attributionControl: false }).setView([15.85, 74.50], 13);
    mapRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);
    // Hospitals
    HOSPITALS.forEach(h => {
      const ic = L.divIcon({ className: '', html: '<div style="width:28px;height:28px;border-radius:50%;background:#3B82F6;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:13px">🏥</div>', iconSize: [28, 28], iconAnchor: [14, 14] });
      L.marker([h.lat, h.lng], { icon: ic }).addTo(map).bindPopup(`<b>🏥 ${h.name}</b><br/>${h.beds} beds`);
    });
    // Incidents
    const pColor: Record<string,string> = { high: '#EF4444', medium: '#F97316', low: '#22C55E' };
    const pts: [number, number][] = [];
    incidents.forEach(inc => {
      if (!inc.location?.lat) return;
      const solved = inc.status === 'resolved' || inc.status === 'closed';
      const c = solved ? '#6B7280' : (pColor[inc.priority] || '#F97316');
      const e = solved ? '✅' : (inc.type === 'accident' ? '🚗' : '🚨');
      const ic = L.divIcon({ className: '', html: `<div style="width:30px;height:30px;border-radius:50%;background:${c};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:13px;cursor:pointer">${e}</div>`, iconSize: [30, 30], iconAnchor: [15, 15] });
      L.marker([inc.location.lat, inc.location.lng], { icon: ic }).addTo(map).on('click', () => onSelect(inc))
        .bindPopup(`<b>${inc.title || inc.type}</b><br/><small>${inc.location.address || ''}</small>`);
      pts.push([inc.location.lat, inc.location.lng]);
    });
    if (pts.length > 0) map.fitBounds(pts, { padding: [30, 30], maxZoom: 14 });
    setTimeout(() => map.invalidateSize(), 100);
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, [incidents]);
  return <div ref={ref} className="w-full rounded-2xl overflow-hidden border border-gray-200" style={{ height: 260 }} />;
}

// ─── Main Dashboard ────────────────────────────────────────
export function AmbulanceDashboard() {
  const [page, setPage] = useState('dashboard');
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [alertData, setAlertData] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const user = api.getUser();

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const d = await api.getIncidents();
      setIncidents(Array.isArray(d) ? d : d.incidents || d.data || []);
    } catch { setIncidents([]); }
    setLoading(false);
  };

  useEffect(() => { fetchIncidents(); }, []);

  // Socket.IO real-time alerts
  useEffect(() => {
    const socket = socketIO('http://localhost:3001');
    socket.on('connect', () => socket.emit('join-role', 'ambulance'));
    socket.on('incident-update', (data: any) => {
      if (data?.type === 'new' && data?.incident) {
        playAlertSound();
        setAlertData(data.incident);
        setShowBanner(true);
        fetchIncidents();
        toast.error(`🚨 NEW EMERGENCY: ${data.incident.title || data.incident.type}\n📍 ${data.incident.location?.address || 'Unknown'}`, { duration: 8000 });
        setTimeout(() => setShowBanner(false), 20000);
      }
    });
    return () => { socket.disconnect(); };
  }, []);

  const handleAccept = async (id: string) => {
    try {
      await fetch(`http://localhost:3001/api/incidents/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', ...(localStorage.getItem('cc_token') ? { Authorization: `Bearer ${localStorage.getItem('cc_token')}` } : {}) },
        body: JSON.stringify({ status: 'in_progress', assignedTo: user?._id }),
      });
      toast.success('🚑 Emergency accepted! Navigating...');
      setEmergencyMode(true);
      fetchIncidents();
    } catch { toast.error('Failed to accept'); }
  };

  const activeCount = incidents.filter(i => i.status === 'open' || i.status === 'active').length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const tabs = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'map', icon: Map, label: 'Map' },
    { id: 'alerts', icon: Bell, label: 'Alerts' },
    { id: 'report', icon: FileText, label: 'Report' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  const renderPage = () => {
    if (page === 'profile') return <ProfilePage />;
    if (page === 'map') return (
      <div className="p-4 pt-14">
        <h2 className="text-2xl font-bold text-black mb-3">Emergency Map</h2>
        <AmbulanceMap incidents={incidents} onSelect={setSelected} />
        <div className="flex gap-3 mt-2 px-1">
          <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /><span className="text-[10px] text-gray-500">Critical</span></div>
          <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-orange-500" /><span className="text-[10px] text-gray-500">Urgent</span></div>
          <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /><span className="text-[10px] text-gray-500">Hospital</span></div>
        </div>
      </div>
    );
    if (page === 'alerts') return (
      <div className="p-4 pt-14">
        <h2 className="text-2xl font-bold text-black mb-3">Emergency Alerts</h2>
        {incidents.filter(i => i.status !== 'resolved').map((inc, i) => (
          <motion.div key={inc._id || i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            onClick={() => setSelected(inc)} className="bg-white rounded-xl p-4 border border-gray-200 mb-3 cursor-pointer hover:shadow-md">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${inc.priority === 'high' ? 'bg-red-100' : 'bg-orange-100'}`}>
                <AlertTriangle className={`w-5 h-5 ${inc.priority === 'high' ? 'text-red-600' : 'text-orange-600'}`} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-black text-sm">{inc.title || inc.type}</h4>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{inc.location?.address?.split(',')[0] || 'Unknown'}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${inc.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>{(inc.priority || 'medium').toUpperCase()}</span>
            </div>
          </motion.div>
        ))}
      </div>
    );
    if (page === 'report') return (
      <div className="p-4 pt-14">
        <h2 className="text-2xl font-bold text-black mb-1">Trip Reports</h2>
        <p className="text-sm text-gray-500 mb-4">Recent emergency responses</p>
        {incidents.filter(i => i.status === 'resolved' || i.status === 'in_progress').map((inc, i) => (
          <div key={inc._id || i} className="bg-gray-50 rounded-xl p-3 mb-3 border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-sm text-black">{inc.title || inc.type}</h4>
                <p className="text-xs text-gray-500 mt-1">{inc.location?.address?.split(',')[0] || 'Unknown'}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${inc.status === 'resolved' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>{inc.status === 'resolved' ? '✅ DONE' : 'IN PROGRESS'}</span>
            </div>
          </div>
        ))}
        {incidents.filter(i => i.status === 'resolved' || i.status === 'in_progress').length === 0 && <p className="text-center text-gray-400 py-8 text-sm">No trip reports yet</p>}
      </div>
    );

    // Dashboard home
    return (
      <>
        <div className="sticky top-0 z-20 bg-white border-b border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-400 uppercase">{greeting}</p>
              <h1 className="text-2xl font-bold text-black">{user?.name || 'Ambulance Driver'}</h1>
              <div className="flex items-center gap-2 mt-1">
                <motion.div className={`w-2 h-2 rounded-full ${emergencyMode ? 'bg-red-500' : 'bg-green-500'}`} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                <span className={`text-xs font-medium ${emergencyMode ? 'text-red-600' : 'text-green-600'}`}>{emergencyMode ? '🚨 EMERGENCY MODE' : '✅ Available'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setPage('alerts')} className="relative p-2"><Bell className="w-6 h-6 text-black" />{activeCount > 0 && <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{activeCount}</span>}</button>
              <button onClick={() => setPage('profile')} className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"><User className="w-6 h-6 text-gray-600" /></button>
            </div>
          </div>
          <motion.button onClick={() => { setEmergencyMode(!emergencyMode); toast[emergencyMode ? 'info' : 'success'](emergencyMode ? 'Emergency mode off' : '🚨 Emergency Mode Activated!'); }}
            whileTap={{ scale: 0.98 }} className={`w-full py-3.5 rounded-2xl font-bold text-base flex items-center justify-center gap-2 ${emergencyMode ? 'bg-yellow-400 text-black' : 'bg-red-600 text-white'}`}>
            <Siren className="w-5 h-5" />{emergencyMode ? 'DEACTIVATE EMERGENCY' : 'ACTIVATE EMERGENCY MODE'}
          </motion.button>
        </div>

        <div className="p-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[{ l: 'Active', v: activeCount, c: 'bg-red-50 text-red-600' }, { l: 'In Progress', v: incidents.filter(i => i.status === 'in_progress').length, c: 'bg-blue-50 text-blue-600' }, { l: 'Resolved', v: incidents.filter(i => i.status === 'resolved').length, c: 'bg-green-50 text-green-600' }].map(s => (
              <div key={s.l} className={`${s.c} rounded-2xl p-3 text-center`}><div className="text-xl font-bold">{s.v}</div><div className="text-[10px] font-medium opacity-70">{s.l}</div></div>
            ))}
          </div>

          {/* Green Corridor */}
          <AnimatePresence>
            {emergencyMode && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-green-50 border border-green-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2"><Zap className="w-5 h-5 text-green-600" /><h3 className="text-black font-semibold">Green Corridor Active</h3><span className="ml-auto px-2 py-0.5 bg-green-600 rounded-full text-xs font-bold text-white">LIVE</span></div>
                {['🚦 Traffic signals synchronized', '🚔 Police stations notified', '✅ Route cleared', '🏥 Hospital alerted'].map((s, i) => <div key={i} className="text-sm text-green-700 py-0.5">{s}</div>)}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Map */}
          <div>
            <div className="flex justify-between items-center mb-2"><h3 className="font-bold text-black flex items-center gap-2"><MapPin className="w-4 h-4 text-red-500" />Emergency Map</h3><button onClick={() => setPage('map')} className="text-xs font-bold text-black">Full Map →</button></div>
            <AmbulanceMap incidents={incidents} onSelect={setSelected} />
          </div>

          {/* Emergency Requests */}
          <div>
            <div className="flex justify-between items-center mb-2"><h3 className="font-bold text-black flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500" />Emergency Requests</h3><span className="text-xs text-red-500 font-bold">{activeCount} active</span></div>
            {loading && <div className="flex justify-center py-6"><div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /></div>}
            {incidents.filter(i => i.status !== 'resolved' && i.status !== 'closed').slice(0, 6).map((inc, i) => (
              <motion.div key={inc._id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-3 cursor-pointer hover:shadow-md" onClick={() => setSelected(inc)}>
                <div className="h-1" style={{ backgroundColor: inc.priority === 'high' ? '#EF4444' : '#F97316' }} />
                <div className="p-3">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-base">{inc.type === 'accident' ? '🚗' : '🚨'}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-black text-sm truncate">{inc.title || inc.type}</h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{inc.location?.address?.split(',')[0] || 'Unknown'}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${inc.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>{(inc.priority || 'medium').toUpperCase()}</span>
                  </div>
                  <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                    <button onClick={() => { setSelected(inc); }} className="flex-1 py-2 bg-blue-50 rounded-lg text-blue-600 text-xs font-medium">Details</button>
                    <button onClick={() => handleAccept(inc._id)} className="flex-1 py-2 bg-red-500 text-white rounded-lg text-xs font-bold">🚑 Respond</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Nearby Hospitals */}
          <div>
            <h3 className="font-bold text-black flex items-center gap-2 mb-2"><Hospital className="w-4 h-4 text-blue-500" />Nearby Hospitals</h3>
            {HOSPITALS.map((h, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3 flex items-center justify-between mb-2 border border-gray-100">
                <div><div className="text-black font-medium text-sm">{h.name}</div><div className="text-xs text-gray-500 mt-0.5">{h.dist} • {h.beds} beds available</div></div>
                <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}&travelmode=driving`, '_blank')}
                  className="px-3 py-1.5 bg-blue-100 text-blue-600 rounded-lg text-xs font-bold flex items-center gap-1"><Navigation className="w-3 h-3" />Navigate</button>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="relative h-full overflow-hidden bg-white">
      <div className="relative z-10 h-full overflow-y-auto pb-24">{renderPage()}</div>
      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200">
        <div className="grid grid-cols-5 max-w-md mx-auto">
          {tabs.map(tab => { const active = page === tab.id; return (
            <button key={tab.id} onClick={() => setPage(tab.id)} className="relative p-4 flex flex-col items-center gap-1">
              <tab.icon className={`w-6 h-6 ${active ? 'text-black' : 'text-gray-400'}`} fill={active ? 'black' : 'none'} />
              <span className={`text-xs ${active ? 'text-black font-medium' : 'text-gray-400'}`}>{tab.label}</span>
              {active && <motion.div layoutId="amb-nav" className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-black rounded-full" transition={{ type: 'spring', duration: 0.6 }} />}
            </button>
          ); })}
        </div>
      </div>
      {/* Alert Banner */}
      <AnimatePresence>
        {showBanner && alertData && (
          <motion.div initial={{ y: -120 }} animate={{ y: 0 }} exit={{ y: -120 }} className="fixed top-0 left-0 right-0 z-[60] p-3 pt-12">
            <div className="bg-white rounded-2xl border-2 border-red-400 p-4 shadow-2xl mx-2" style={{ animation: 'alertPulse 1s ease-in-out infinite' }}>
              <style>{`@keyframes alertPulse { 0%,100% { border-color: #f87171; box-shadow: 0 0 0 0 rgba(239,68,68,0.4); } 50% { border-color: #ef4444; box-shadow: 0 0 20px 4px rgba(239,68,68,0.3); } }`}</style>
              <div className="flex items-start gap-3">
                <motion.div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center shrink-0" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>
                  <Siren className="w-6 h-6 text-white" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-red-500 uppercase tracking-wide">🚨 New Emergency</p>
                  <p className="text-sm font-bold text-black truncate">{alertData.title || alertData.type}</p>
                  <p className="text-xs text-gray-500 truncate">{alertData.location?.address || 'Unknown'}</p>
                </div>
                <button onClick={() => setShowBanner(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => { setSelected(alertData); setShowBanner(false); }} className="flex-1 py-2 bg-red-500 text-white rounded-xl text-xs font-bold">View & Respond</button>
                <button onClick={() => setShowBanner(false)} className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-medium">Dismiss</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Incident Detail */}
      <AnimatePresence>
        {selected && <IncidentPopup incident={selected} onClose={() => setSelected(null)} onAccept={handleAccept} />}
      </AnimatePresence>
    </div>
  );
}
