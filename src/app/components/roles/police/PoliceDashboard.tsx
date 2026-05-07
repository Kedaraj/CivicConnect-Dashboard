import { useState, useEffect, useRef } from 'react';
import { Bell, User, Search, Scan, AlertTriangle, MapPin, Clock, Navigation, CheckCircle, Phone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { api } from '../../../../api';
import { io as socketIO } from 'socket.io-client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BottomNav } from './BottomNav';
import { AIInsights } from './AIInsights';
import { MapPage } from './MapPage';
import { AlertsPage } from './AlertsPage';
import { ReportPage } from './ReportPage';
import { ProfilePage } from './ProfilePage';

// ─── Incident Detail Modal ────────────────────────────────────────────────────
function IncidentDetailModal({ incident, onClose, onResolve }: { incident: any; onClose: () => void; onResolve: (id: string) => void }) {
  const isSolved = incident.status === 'resolved' || incident.status === 'closed';

  const openDirection = () => {
    const lat = incident.location?.lat;
    const lng = incident.location?.lng;
    if (lat && lng) {
      navigator.geolocation?.getCurrentPosition(
        (pos) => { window.open(`https://www.google.com/maps/dir/?api=1&origin=${pos.coords.latitude},${pos.coords.longitude}&destination=${lat},${lng}&travelmode=driving`, '_blank'); },
        () => { window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`, '_blank'); }
      );
    } else {
      toast.error('No GPS coordinates available');
    }
  };

  const priorityConfig: Record<string, {bg:string, text:string, label:string}> = {
    high:   { bg: '#FFE5E5', text: '#FF4444', label: '🔴 HIGH PRIORITY' },
    medium: { bg: '#FFF5E5', text: '#FFA500', label: '🟡 MEDIUM' },
    low:    { bg: '#E5F5E5', text: '#22C55E', label: '🟢 LOW' },
  };
  const pConfig = priorityConfig[incident.priority] || priorityConfig.medium;
  const typeIcon: Record<string,string> = { accident: '🚗', traffic_jam: '🚦', pothole: '🕳️', road_damage: '🛣️', waterlogging: '🌊', illegal_parking: '🅿️' };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-xl font-bold text-black">Incident Details</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Status Banner */}
          {isSolved ? (
            <div className="rounded-2xl p-4 bg-green-50 border border-green-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-green-700 font-bold text-sm">✅ CASE SOLVED</p>
                <p className="text-green-600 text-xs">Resolved {incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleString() : 'recently'}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-3 flex items-center justify-between" style={{ backgroundColor: pConfig.bg }}>
              <span className="text-sm font-bold" style={{ color: pConfig.text }}>{pConfig.label}</span>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/60" style={{ color: pConfig.text }}>
                {(incident.status || 'open').toUpperCase()}
              </span>
            </div>
          )}

          {/* Info */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{typeIcon[incident.type] || '📋'}</span>
              <h3 className="font-bold text-black text-lg">{incident.title || incident.type?.replace(/_/g, ' ')}</h3>
            </div>
            {incident.description && <p className="text-sm text-gray-600 mb-3">{incident.description}</p>}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-red-500" />
                <span className="font-medium">{incident.location?.address || incident.location?.area || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>{incident.createdAt ? new Date(incident.createdAt).toLocaleString() : 'Recently'}</span>
              </div>
              {incident.location?.lat && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Navigation className="w-4 h-4" />
                  <span className="text-xs">{incident.location.lat.toFixed(4)}, {incident.location.lng.toFixed(4)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Direction */}
          {incident.location?.lat && (
            <button onClick={openDirection}
              className="w-full py-3.5 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md">
              <Navigation className="w-5 h-5" /> 🚗 Get Direction to Spot
            </button>
          )}

          {/* Actions */}
          {!isSolved && (
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { onResolve(incident._id); onClose(); }}
                className="flex items-center justify-center gap-2 py-3 bg-emerald-50 rounded-xl text-emerald-600 font-medium text-sm">
                <CheckCircle className="w-4 h-4" /> Mark Solved
              </button>
              <button onClick={() => toast.info('Calling dispatch...')}
                className="flex items-center justify-center gap-2 py-3 bg-blue-50 rounded-xl text-blue-600 font-medium text-sm">
                <Phone className="w-4 h-4" /> Call Dispatch
              </button>
            </div>
          )}

          <button onClick={onClose} className="w-full py-3 bg-gray-100 text-black rounded-xl font-medium">Close</button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Leaflet Incident Map ─────────────────────────────────────────────────────
function IncidentMap({ incidents, onSelectIncident }: { incidents: any[]; onSelectIncident: (inc: any) => void }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }

    const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false });
    mapInstance.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);

    // Belagavi traffic hotspots
    const trafficZones = [
      { lat: 15.8497, lng: 74.4977, label: 'RPD Cross — High Traffic', color: '#EF4444' },
      { lat: 15.8440, lng: 74.5040, label: 'College Road — Congestion', color: '#F97316' },
      { lat: 15.8525, lng: 74.5085, label: 'Bogarves Circle — Moderate', color: '#FBBF24' },
      { lat: 15.8520, lng: 74.5020, label: 'Rani Channamma Circle — High', color: '#EF4444' },
      { lat: 15.8560, lng: 74.5000, label: 'Kirloskar Road — Moderate', color: '#FBBF24' },
      { lat: 15.8380, lng: 74.4950, label: 'Angol Main Road — Low', color: '#22C55E' },
      { lat: 15.8600, lng: 74.4900, label: 'Khanapur Road — Low', color: '#22C55E' },
    ];

    // Add traffic zones as circles
    trafficZones.forEach(z => {
      L.circle([z.lat, z.lng], { radius: 200, color: z.color, fillColor: z.color, fillOpacity: 0.15, weight: 2 }).addTo(map)
        .bindPopup(`<b>🚦 ${z.label}</b>`);
    });

    // Add incident markers
    const withCoords = incidents.filter(i => i.location?.lat && i.location?.lng);
    const typeIcon: Record<string,string> = { accident: '🚗', traffic_jam: '🚦', pothole: '🕳️', road_damage: '🛣️', waterlogging: '🌊', illegal_parking: '🅿️' };
    const priorityColor: Record<string,string> = { high: '#EF4444', medium: '#F97316', low: '#22C55E' };

    withCoords.forEach(inc => {
      const isSolved = inc.status === 'resolved' || inc.status === 'closed';
      const color = isSolved ? '#6B7280' : (priorityColor[inc.priority] || '#F97316');
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:32px;height:32px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer">${isSolved ? '✅' : (typeIcon[inc.type] || '📋')}</div>`,
        iconSize: [32, 32], iconAnchor: [16, 16],
      });
      const marker = L.marker([inc.location.lat, inc.location.lng], { icon }).addTo(map);
      marker.bindPopup(`<b>${inc.title || inc.type}</b><br/>${inc.location.address || ''}<br/><small>${isSolved ? '✅ Case Solved' : (inc.priority?.toUpperCase() || '')}</small>`);
      marker.on('click', () => onSelectIncident(inc));
    });

    // Fit bounds
    const allPoints = [...trafficZones.map(z => [z.lat, z.lng] as [number, number]), ...withCoords.map(i => [i.location.lat, i.location.lng] as [number, number])];
    if (allPoints.length > 0) {
      map.fitBounds(allPoints as L.LatLngBoundsExpression, { padding: [30, 30] });
    } else {
      map.setView([15.8500, 74.5000], 14); // Belagavi center
    }

    return () => { if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; } };
  }, [incidents]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-black flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-500" /> Incident Map
        </h3>
        <div className="flex items-center gap-1.5">
          <motion.div className="w-1.5 h-1.5 bg-green-500 rounded-full" animate={{ opacity: [1,0.3,1] }} transition={{ duration: 1.5, repeat: Infinity }} />
          <span className="text-xs font-medium text-green-600">LIVE</span>
        </div>
      </div>
      <div ref={mapRef} className="w-full rounded-2xl overflow-hidden border border-gray-200" style={{ height: 280 }} />
      <div className="flex items-center gap-4 mt-2 px-1">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow" /><span className="text-[10px] text-gray-500">High</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-orange-500 border-2 border-white shadow" /><span className="text-[10px] text-gray-500">Medium</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow" /><span className="text-[10px] text-gray-500">Low</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-gray-400 border-2 border-white shadow" /><span className="text-[10px] text-gray-500">Solved</span></div>
      </div>
    </div>
  );
}

// ─── Police Dashboard ─────────────────────────────────────────────────────────
export function PoliceDashboard() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [stats, setStats] = useState({ active: 0, assigned: 0, resolved: 0, total: 0 });
  const user = api.getUser();

  const fetchIncidents = async () => {
    setLoadingIncidents(true);
    try {
      const data = await api.getIncidents();
      const list = Array.isArray(data) ? data : data.incidents || data.data || [];
      setIncidents(list);
      setStats({
        active: list.filter((i: any) => i.status === 'open' || i.status === 'active').length,
        assigned: list.filter((i: any) => i.status === 'in_progress' || i.status === 'assigned').length,
        resolved: list.filter((i: any) => i.status === 'resolved' || i.status === 'closed').length,
        total: list.length,
      });
    } catch { setIncidents([]); }
    setLoadingIncidents(false);
  };

  const [newAlertData, setNewAlertData] = useState<any>(null);
  const [showAlertBanner, setShowAlertBanner] = useState(false);

  // Alert sound using Web Audio API
  const playAlertSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      // Siren-like alert: two alternating tones
      const playTone = (freq: number, start: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + dur);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur);
      };
      // 3 alternating high-low tones
      playTone(880, 0, 0.2); playTone(660, 0.2, 0.2);
      playTone(880, 0.4, 0.2); playTone(660, 0.6, 0.2);
      playTone(880, 0.8, 0.2); playTone(660, 1.0, 0.2);
      // Final attention tone
      playTone(1100, 1.2, 0.4);
    } catch {}
  };

  useEffect(() => { fetchIncidents(); }, []);

  // Socket.IO: real-time alerts
  useEffect(() => {
    const socket = socketIO('https://civicconnect-backend-nuz1.onrender.com');
    socket.on('connect', () => {
      socket.emit('join-role', 'police');
    });

    socket.on('incident-update', (data: any) => {
      if (data?.type === 'new' && data?.incident) {
        playAlertSound();
        setNewAlertData(data.incident);
        setShowAlertBanner(true);
        fetchIncidents(); // refresh list

        toast.error(
          `🚨 NEW INCIDENT: ${data.incident.title || data.incident.type}\n📍 ${data.incident.location?.address || 'Unknown location'}`,
          { duration: 8000 }
        );

        // Auto-hide banner after 15 seconds
        setTimeout(() => setShowAlertBanner(false), 15000);
      }
    });

    return () => { socket.disconnect(); };
  }, []);

  const handleResolve = async (id: string) => {
    try {
      const res = await fetch(`https://civicconnect-backend-nuz1.onrender.com/api/incidents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('cc_token') ? { Authorization: `Bearer ${localStorage.getItem('cc_token')}` } : {}),
        },
        body: JSON.stringify({ status: 'resolved' }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      toast.success('✅ Case Solved! Incident resolved.');
      fetchIncidents();
    } catch (e: any) {
      toast.error('Failed: ' + (e.message || 'Unknown error'));
    }
  };

  const getPriorityColor = (p: string) => {
    if (p === 'high') return { bg: '#FFE5E5', text: '#FF4444' };
    if (p === 'medium') return { bg: '#FFF5E5', text: '#FFA500' };
    return { bg: '#E5F5E5', text: '#22C55E' };
  };
  const typeIcon: Record<string,string> = { accident: '🚗', traffic_jam: '🚦', pothole: '🕳️', road_damage: '🛣️', waterlogging: '🌊', illegal_parking: '🅿️' };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const renderPage = () => {
    switch (currentPage) {
      case 'map': return <MapPage />;
      case 'alerts': return <AlertsPage />;
      case 'report': return <ReportPage />;
      case 'profile': return <ProfilePage />;
      default:
        return (
          <>
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-100 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs text-gray-400">9:41</div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-0.5 h-3 bg-black rounded-full" style={{ height: `${(i + 1) * 3}px` }} />
                    ))}
                  </div>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="black"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
                  <div className="px-1 border border-black rounded" style={{ width: '20px', height: '12px', position: 'relative' }}>
                    <div className="absolute inset-y-0.5 left-0.5 right-0.5 bg-black rounded-sm" />
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1 uppercase">{greeting}</div>
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-black">{user?.name || 'Officer'}</h1>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setCurrentPage('alerts')} className="relative p-2">
                      <Bell className="w-6 h-6 text-black" />
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </button>
                    <button onClick={() => setCurrentPage('profile')} className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search incidents, alerts..." className="w-full bg-gray-50 border-0 rounded-2xl pl-12 pr-12 py-3 text-black placeholder-gray-400 focus:outline-none focus:ring-0" />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black rounded-xl flex items-center justify-center">
                    <Scan className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-5">
              {/* Stats */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Total', value: stats.total, color: 'bg-gray-50 text-black' },
                  { label: 'Active', value: stats.active, color: 'bg-red-50 text-red-600' },
                  { label: 'Assigned', value: stats.assigned, color: 'bg-blue-50 text-blue-600' },
                  { label: 'Solved', value: stats.resolved, color: 'bg-green-50 text-green-600' },
                ].map(s => (
                  <div key={s.label} className={`${s.color} rounded-2xl p-3 text-center`}>
                    <div className="text-xl font-bold">{s.value}</div>
                    <div className="text-[10px] font-medium opacity-70">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Incident Map */}
              <IncidentMap incidents={incidents} onSelectIncident={setSelectedIncident} />

              {/* AI Insights */}
              <AIInsights />

              {/* Live Incidents */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-black flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" /> Live Incidents
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <motion.div className="w-1.5 h-1.5 bg-red-500 rounded-full" animate={{ opacity: [1,0.3,1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                    <span className="text-xs font-medium text-red-500">{stats.active} active</span>
                  </div>
                </div>

                {loadingIncidents && (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                <div className="space-y-3">
                  {incidents.slice(0, 10).map((inc, i) => {
                    const isSolved = inc.status === 'resolved' || inc.status === 'closed';
                    const colors = isSolved ? { bg: '#E5F5E5', text: '#22C55E' } : getPriorityColor(inc.priority || 'low');
                    return (
                      <motion.div key={inc._id || i}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        onClick={() => setSelectedIncident(inc)}
                        className="bg-white rounded-2xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]">
                        <div className="h-1" style={{ backgroundColor: colors.text }} />
                        <div className="p-4">
                          <div className="flex items-start gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg shrink-0">
                              {isSolved ? '✅' : (typeIcon[inc.type] || '📋')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <h4 className={`font-semibold text-sm truncate ${isSolved ? 'text-gray-400 line-through' : 'text-black'}`}>
                                  {inc.title || inc.type?.replace(/_/g, ' ')}
                                </h4>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0"
                                  style={{ backgroundColor: colors.bg, color: colors.text }}>
                                  {isSolved ? '✅ SOLVED' : (inc.priority || 'low').toUpperCase()}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{inc.location?.address?.split(',')[0] || 'Unknown'}</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{inc.createdAt ? new Date(inc.createdAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '?'}</span>
                              </div>
                            </div>
                          </div>
                          {!isSolved && (
                            <div className="flex items-center gap-2 mt-2" onClick={e => e.stopPropagation()}>
                              <button onClick={() => setSelectedIncident(inc)}
                                className="flex-1 py-2 bg-blue-50 rounded-lg text-blue-600 text-xs font-medium text-center">
                                View Details
                              </button>
                              <button onClick={() => handleResolve(inc._id)}
                                className="flex-1 py-2 bg-green-50 rounded-lg text-green-600 text-xs font-medium text-center flex items-center justify-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Solve Case
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="relative h-full overflow-hidden bg-white">
      <div className="relative z-10 h-full overflow-y-auto pb-24">{renderPage()}</div>
      <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />

      {/* Real-time Alert Banner */}
      <AnimatePresence>
        {showAlertBanner && newAlertData && (
          <motion.div
            initial={{ y: -120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -120, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 z-[60] p-3 pt-12"
          >
            <div
              className="bg-white rounded-2xl border-2 border-red-400 p-4 shadow-2xl mx-2"
              style={{ animation: 'alertPulse 1s ease-in-out infinite' }}
            >
              <style>{`@keyframes alertPulse { 0%,100% { border-color: #f87171; box-shadow: 0 0 0 0 rgba(239,68,68,0.4); } 50% { border-color: #ef4444; box-shadow: 0 0 20px 4px rgba(239,68,68,0.3); } }`}</style>
              <div className="flex items-start gap-3">
                <motion.div
                  className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center shrink-0"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <AlertTriangle className="w-6 h-6 text-white" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-red-500 uppercase tracking-wide mb-0.5">🚨 New Incident Reported</p>
                  <p className="text-sm font-bold text-black truncate">{newAlertData.title || newAlertData.type}</p>
                  <p className="text-xs text-gray-500 truncate">{newAlertData.location?.address || 'Unknown'}</p>
                  <p className="text-[10px] text-gray-400 mt-1">Priority: {(newAlertData.priority || 'medium').toUpperCase()}</p>
                </div>
                <button onClick={() => setShowAlertBanner(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => { setSelectedIncident(newAlertData); setShowAlertBanner(false); }}
                  className="flex-1 py-2 bg-red-500 text-white rounded-xl text-xs font-bold">
                  View Details
                </button>
                <button onClick={() => setShowAlertBanner(false)}
                  className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-medium">
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedIncident && (
          <IncidentDetailModal incident={selectedIncident} onClose={() => setSelectedIncident(null)} onResolve={handleResolve} />
        )}
      </AnimatePresence>
    </div>
  );
}
