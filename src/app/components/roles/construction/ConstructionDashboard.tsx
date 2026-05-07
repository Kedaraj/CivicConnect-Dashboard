import { useState, useEffect, useRef } from 'react';
import { Construction, Bell, User, MapPin, Users, Calendar, Home, Map, FileText, AlertTriangle, Navigation, X, CheckCircle, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { io as socketIO } from 'socket.io-client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../../../../api';
import { ProfilePage } from './ProfilePage';
import { IncidentPopup } from './IncidentPopup';

function playAlert() {
  try { const c = new (window.AudioContext || (window as any).webkitAudioContext)(); const t = (f:number,s:number,d:number) => { const o=c.createOscillator(),g=c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.value=f; o.type='triangle'; g.gain.setValueAtTime(0.25,c.currentTime+s); g.gain.exponentialRampToValueAtTime(0.01,c.currentTime+s+d); o.start(c.currentTime+s); o.stop(c.currentTime+s+d); }; t(600,0,0.2); t(800,0.2,0.2); t(600,0.4,0.2); t(800,0.6,0.3); } catch {}
}

function ZoneMap({ incidents, zones, onSelect }: { incidents: any[]; zones: any[]; onSelect: (i:any)=>void }) {
  const ref = useRef<HTMLDivElement>(null); const m = useRef<L.Map|null>(null);
  useEffect(() => {
    if (!ref.current) return; if (m.current) { m.current.remove(); m.current = null; }
    const map = L.map(ref.current, { zoomControl: false, attributionControl: false }).setView([15.85,74.50], 13);
    m.current = map; L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);
    const pc: Record<string,string> = { high:'#EF4444', medium:'#F97316', low:'#22C55E' };
    const pts: [number,number][] = [];
    // Construction zones
    zones.forEach(z => {
      if (!z.lat || !z.lng) return;
      const ic = L.divIcon({ className:'', html:'<div style="width:30px;height:30px;border-radius:50%;background:#F97316;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:14px">🚧</div>', iconSize:[30,30], iconAnchor:[15,15] });
      L.marker([z.lat,z.lng],{icon:ic}).addTo(map).bindPopup(`<b>🚧 ${z.name}</b><br/><small>${z.location||''}</small>`);
      L.circle([z.lat,z.lng],{radius:200,color:'#F97316',fillColor:'#F97316',fillOpacity:0.1,weight:2}).addTo(map);
      pts.push([z.lat,z.lng]);
    });
    // Incidents
    incidents.forEach(inc => {
      if (!inc.location?.lat) return;
      const s = inc.status==='resolved'||inc.status==='closed'; const c = s?'#6B7280':(pc[inc.priority]||'#F97316');
      const e = s?'✅':inc.type==='pothole'?'🕳️':inc.type==='road_damage'?'🛣️':'📋';
      const ic = L.divIcon({ className:'', html:`<div style="width:28px;height:28px;border-radius:50%;background:${c};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:12px;cursor:pointer">${e}</div>`, iconSize:[28,28], iconAnchor:[14,14] });
      L.marker([inc.location.lat,inc.location.lng],{icon:ic}).addTo(map).on('click',()=>onSelect(inc)).bindPopup(`<b>${inc.title||inc.type}</b><br/><small>${inc.location.address||''}</small>`);
      pts.push([inc.location.lat,inc.location.lng]);
    });
    if (pts.length>0) map.fitBounds(pts,{padding:[30,30],maxZoom:14});
    setTimeout(()=>map.invalidateSize(),100);
    return ()=>{ m.current?.remove(); m.current=null; };
  }, [incidents, zones]);
  return <div ref={ref} className="w-full rounded-2xl overflow-hidden border border-gray-200" style={{height:260}} />;
}

export function ConstructionDashboard() {
  const [page, setPage] = useState('dashboard');
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [alertData, setAlertData] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showAddZone, setShowAddZone] = useState(false);
  const [zones, setZones] = useState<any[]>([
    { id:1, name:'Angol Road Repair', location:'Angol Main Road, Belagavi', lat:15.8380, lng:74.4950, status:'active', workers:12, progress:45, endDate:'2026-06-15' },
    { id:2, name:'KLE Circle Widening', location:'College Road, KLE', lat:15.8440, lng:74.5040, status:'active', workers:20, progress:70, endDate:'2026-05-30' },
  ]);
  const [newZone, setNewZone] = useState({ name:'', location:'', lat:'', lng:'' });
  const user = api.getUser();

  const fetch_ = async () => { setLoading(true); try { const d = await api.getIncidents(); const l = Array.isArray(d)?d:d.incidents||d.data||[]; setIncidents(l.filter((i:any)=>['pothole','road_damage','waterlogging','construction'].includes(i.type)||i.title?.toLowerCase().includes('road')||i.title?.toLowerCase().includes('pothole'))); } catch { setIncidents([]); } setLoading(false); };
  useEffect(() => { fetch_(); }, []);

  useEffect(() => {
    const s = socketIO('http://localhost:3001');
    s.on('connect', () => s.emit('join-role','construction'));
    s.on('incident-update', (d:any) => {
      if (d?.type==='new' && d?.incident) {
        const t = d.incident.type; if (['pothole','road_damage','waterlogging'].includes(t) || d.incident.title?.toLowerCase().includes('road') || d.incident.title?.toLowerCase().includes('pothole')) {
          playAlert(); setAlertData(d.incident); setShowBanner(true); fetch_();
          toast.error(`🚧 NEW REPORT: ${d.incident.title||t}\n📍 ${d.incident.location?.address||'Unknown'}`, {duration:8000});
          setTimeout(()=>setShowBanner(false),20000);
        }
      }
    });
    return () => { s.disconnect(); };
  }, []);

  const resolve = async (id:string) => {
    try { await fetch(`http://localhost:3001/api/incidents/${id}`, { method:'PUT', headers:{'Content-Type':'application/json',...(localStorage.getItem('cc_token')?{Authorization:`Bearer ${localStorage.getItem('cc_token')}`}:{})}, body:JSON.stringify({status:'resolved'}) }); toast.success('✅ Issue resolved!'); fetch_(); } catch { toast.error('Failed'); }
  };

  const addZone = () => {
    if (!newZone.name) { toast.error('Enter zone name'); return; }
    const lat = parseFloat(newZone.lat) || 15.85 + (Math.random()-0.5)*0.02;
    const lng = parseFloat(newZone.lng) || 74.50 + (Math.random()-0.5)*0.02;
    setZones([...zones, { id: Date.now(), name: newZone.name, location: newZone.location || 'Belagavi', lat, lng, status:'active', workers:0, progress:0, endDate:'TBD' }]);
    toast.success('🚧 Zone added & shared on map!');
    setNewZone({ name:'', location:'', lat:'', lng:'' }); setShowAddZone(false);
  };

  const active = incidents.filter(i=>i.status!=='resolved'&&i.status!=='closed').length;
  const tabs = [{ id:'dashboard', icon:Home, label:'Home' },{ id:'zones', icon:Construction, label:'Zones' },{ id:'map', icon:Map, label:'Map' },{ id:'report', icon:FileText, label:'Reports' },{ id:'profile', icon:User, label:'Profile' }];

  const renderPage = () => {
    if (page==='profile') return <ProfilePage />;
    if (page==='map') return (
      <div className="p-4 pt-14"><h2 className="text-2xl font-bold text-black mb-3">Construction Map</h2>
        <ZoneMap incidents={incidents} zones={zones} onSelect={setSelected} />
        <div className="flex gap-3 mt-2"><div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-orange-500"/><span className="text-[10px] text-gray-500">Zone</span></div><div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-red-500"/><span className="text-[10px] text-gray-500">High</span></div><div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-gray-400"/><span className="text-[10px] text-gray-500">Solved</span></div></div>
      </div>
    );
    if (page==='zones') return (
      <div className="p-4 pt-14"><div className="flex justify-between items-center mb-3"><h2 className="text-2xl font-bold text-black">Construction Zones</h2><button onClick={()=>setShowAddZone(true)} className="px-3 py-1.5 bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-1"><Plus className="w-3 h-3"/>Add Zone</button></div>
        {/* Reported Incidents needing construction */}
        <h3 className="font-bold text-black text-sm mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500"/>Reported Issues ({active})</h3>
        {incidents.filter(i=>i.status!=='resolved'&&i.status!=='closed').map((inc,i) => (
          <motion.div key={inc._id||i} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}} onClick={()=>setSelected(inc)}
            className="bg-white rounded-xl border border-gray-200 p-3 mb-2 cursor-pointer hover:shadow-md">
            <div className="flex items-start gap-3"><div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-sm">{inc.type==='pothole'?'🕳️':'🛣️'}</div>
              <div className="flex-1 min-w-0"><h4 className="font-semibold text-black text-sm truncate">{inc.title||inc.type}</h4><p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3"/>{inc.location?.address?.split(',')[0]||'Unknown'}</p></div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${inc.priority==='high'?'bg-red-100 text-red-600':'bg-orange-100 text-orange-600'}`}>{(inc.priority||'medium').toUpperCase()}</span>
            </div>
            <div className="flex gap-2 mt-2" onClick={e=>e.stopPropagation()}>
              <button onClick={()=>setSelected(inc)} className="flex-1 py-1.5 bg-blue-50 rounded-lg text-blue-600 text-xs font-medium">Details & Direction</button>
              <button onClick={()=>resolve(inc._id)} className="flex-1 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold">✅ Solved</button>
            </div>
          </motion.div>
        ))}
        {/* Active construction zones */}
        <h3 className="font-bold text-black text-sm mb-2 mt-4 flex items-center gap-2"><Construction className="w-4 h-4 text-orange-500"/>Active Zones ({zones.length})</h3>
        {zones.map(z=>(
          <div key={z.id} className="bg-orange-50 rounded-xl p-3 border border-orange-200 mb-2">
            <div className="flex justify-between items-start mb-2"><div><h4 className="font-semibold text-black text-sm">{z.name}</h4><p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3"/>{z.location}</p></div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-600">{z.status.toUpperCase()}</span></div>
            <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">Progress</span><span className="text-orange-600 font-bold">{z.progress}%</span></div>
            <div className="h-1.5 bg-orange-200 rounded-full overflow-hidden mb-2"><motion.div initial={{width:0}} animate={{width:`${z.progress}%`}} className="h-full bg-orange-500 rounded-full"/></div>
            <div className="flex gap-2"><button onClick={()=>{if(z.lat)window.open(`https://www.google.com/maps/dir/?api=1&destination=${z.lat},${z.lng}&travelmode=driving`,'_blank')}} className="flex-1 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1"><Navigation className="w-3 h-3"/>Direction</button>
              <button onClick={()=>{setZones(zones.map(zz=>zz.id===z.id?{...zz,progress:Math.min(zz.progress+10,100),status:zz.progress>=90?'completed':'active'}:zz)); toast.success('Progress updated!');}} className="flex-1 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium">Update</button></div>
          </div>
        ))}
      </div>
    );
    if (page==='report') return (
      <div className="p-4 pt-14"><h2 className="text-2xl font-bold text-black mb-1">Resolved Issues</h2><p className="text-sm text-gray-500 mb-4">Completed construction work</p>
        {incidents.filter(i=>i.status==='resolved'||i.status==='closed').map((inc,i)=>(
          <div key={inc._id||i} className="bg-green-50 rounded-xl p-3 mb-2 border border-green-200 flex justify-between items-center">
            <div><h4 className="font-semibold text-sm text-black">{inc.title||inc.type}</h4><p className="text-xs text-gray-500">{inc.location?.address?.split(',')[0]||'Unknown'}</p></div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-600">✅ SOLVED</span>
          </div>
        ))}
        {incidents.filter(i=>i.status==='resolved').length===0 && <p className="text-center text-gray-400 py-8 text-sm">No resolved issues yet</p>}
      </div>
    );
    // Home
    return (<>
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3"><div><h1 className="text-2xl font-bold text-black">Construction Control</h1><p className="text-xs text-gray-400">Infrastructure Management • Belagavi</p></div>
          <div className="flex items-center gap-3"><button onClick={()=>setPage('zones')} className="relative p-2"><Bell className="w-6 h-6 text-black"/>{active>0&&<span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{active}</span>}</button>
            <button onClick={()=>setPage('profile')} className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"><User className="w-6 h-6 text-gray-600"/></button></div></div>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[{l:'Active',v:active,c:'bg-red-50 text-red-600'},{l:'Zones',v:zones.length,c:'bg-orange-50 text-orange-600'},{l:'Solved',v:incidents.filter(i=>i.status==='resolved').length,c:'bg-green-50 text-green-600'},{l:'Total',v:incidents.length,c:'bg-gray-50 text-black'}].map(s=>(
            <div key={s.l} className={`${s.c} rounded-xl p-2 text-center`}><div className="text-lg font-bold">{s.v}</div><div className="text-[10px] font-medium opacity-70">{s.l}</div></div>
          ))}
        </div>
        <button onClick={()=>setShowAddZone(true)} className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2"><Plus className="w-5 h-5"/>Add Construction Zone</button>
      </div>
      <div className="p-4 space-y-4">
        <div><div className="flex justify-between items-center mb-2"><h3 className="font-bold text-black flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-500"/>Zone Map</h3><button onClick={()=>setPage('map')} className="text-xs font-bold text-black">Full Map →</button></div>
          <ZoneMap incidents={incidents} zones={zones} onSelect={setSelected}/></div>
        <div><div className="flex justify-between items-center mb-2"><h3 className="font-bold text-black flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500"/>Reported Issues</h3><button onClick={()=>setPage('zones')} className="text-xs font-bold text-red-500">{active} active →</button></div>
          {loading&&<div className="flex justify-center py-6"><div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"/></div>}
          {incidents.filter(i=>i.status!=='resolved'&&i.status!=='closed').slice(0,4).map((inc,i)=>(
            <motion.div key={inc._id||i} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}} onClick={()=>setSelected(inc)}
              className="bg-white rounded-xl border border-gray-200 p-3 mb-2 cursor-pointer hover:shadow-md">
              <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-sm">{inc.type==='pothole'?'🕳️':'🛣️'}</div>
                <div className="flex-1 min-w-0"><h4 className="font-semibold text-black text-sm truncate">{inc.title||inc.type}</h4><p className="text-xs text-gray-500">{inc.location?.address?.split(',')[0]||'Unknown'}</p></div></div>
            </motion.div>
          ))}
        </div>
        <div><h3 className="font-bold text-black flex items-center gap-2 mb-2"><Construction className="w-4 h-4 text-orange-500"/>Active Zones</h3>
          {zones.map(z=>(
            <div key={z.id} className="bg-orange-50 rounded-xl p-3 border border-orange-100 mb-2 flex items-center justify-between">
              <div><div className="text-sm font-semibold text-black">{z.name}</div><div className="text-xs text-gray-500">{z.location} • {z.progress}%</div></div>
              <button onClick={()=>setPage('zones')} className="px-3 py-1 bg-orange-500 text-white rounded-lg text-xs font-bold">View</button></div>
          ))}
        </div>
      </div>
    </>);
  };

  return (
    <div className="relative h-full overflow-hidden bg-white">
      <div className="relative z-10 h-full overflow-y-auto pb-24">{renderPage()}</div>
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200"><div className="grid grid-cols-5 max-w-md mx-auto">
        {tabs.map(t=>{const a=page===t.id; return(<button key={t.id} onClick={()=>setPage(t.id)} className="relative p-4 flex flex-col items-center gap-1"><t.icon className={`w-6 h-6 ${a?'text-black':'text-gray-400'}`} fill={a?'black':'none'}/><span className={`text-xs ${a?'text-black font-medium':'text-gray-400'}`}>{t.label}</span>{a&&<motion.div layoutId="con-nav" className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-black rounded-full" transition={{type:'spring',duration:0.6}}/>}</button>)})}
      </div></div>
      {/* Alert Banner */}
      <AnimatePresence>{showBanner&&alertData&&(
        <motion.div initial={{y:-120}} animate={{y:0}} exit={{y:-120}} className="fixed top-0 left-0 right-0 z-[60] p-3 pt-12">
          <div className="bg-white rounded-2xl border-2 border-orange-400 p-4 shadow-2xl mx-2" style={{animation:'alertPulse 1s ease-in-out infinite'}}>
            <style>{`@keyframes alertPulse{0%,100%{border-color:#fb923c;box-shadow:0 0 0 0 rgba(249,115,22,0.4)}50%{border-color:#f97316;box-shadow:0 0 20px 4px rgba(249,115,22,0.3)}}`}</style>
            <div className="flex items-start gap-3"><motion.div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center shrink-0" animate={{scale:[1,1.1,1]}} transition={{duration:0.5,repeat:Infinity}}><Construction className="w-6 h-6 text-white"/></motion.div>
              <div className="flex-1 min-w-0"><p className="text-xs font-black text-orange-500 uppercase">🚧 New Road Issue Reported</p><p className="text-sm font-bold text-black truncate">{alertData.title||alertData.type}</p><p className="text-xs text-gray-500 truncate">{alertData.location?.address||'Unknown'}</p></div>
              <button onClick={()=>setShowBanner(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><X className="w-4 h-4"/></button></div>
            <div className="flex gap-2 mt-3"><button onClick={()=>{setSelected(alertData);setShowBanner(false)}} className="flex-1 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold">View & Navigate</button><button onClick={()=>setShowBanner(false)} className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-medium">Dismiss</button></div>
          </div>
        </motion.div>
      )}</AnimatePresence>
      {/* Add Zone Modal */}
      <AnimatePresence>{showAddZone&&(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4">
          <motion.div initial={{y:200}} animate={{y:0}} exit={{y:200}} className="bg-white rounded-t-3xl w-full max-w-lg p-5">
            <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-bold">Add Construction Zone</h2><button onClick={()=>setShowAddZone(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><X className="w-4 h-4"/></button></div>
            <div className="space-y-3">
              <input value={newZone.name} onChange={e=>setNewZone({...newZone,name:e.target.value})} placeholder="Zone name *" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm"/>
              <input value={newZone.location} onChange={e=>setNewZone({...newZone,location:e.target.value})} placeholder="Location (e.g. Angol Road)" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm"/>
              <div className="grid grid-cols-2 gap-2">
                <input value={newZone.lat} onChange={e=>setNewZone({...newZone,lat:e.target.value})} placeholder="Latitude" className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm"/>
                <input value={newZone.lng} onChange={e=>setNewZone({...newZone,lng:e.target.value})} placeholder="Longitude" className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm"/>
              </div>
              <p className="text-xs text-gray-400">Leave lat/lng empty to auto-detect from GPS</p>
              <button onClick={addZone} className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold">🚧 Add & Share on Map</button>
            </div>
          </motion.div>
        </div>
      )}</AnimatePresence>
      <AnimatePresence>{selected&&<IncidentPopup incident={selected} onClose={()=>setSelected(null)} onResolve={resolve}/>}</AnimatePresence>
    </div>
  );
}
