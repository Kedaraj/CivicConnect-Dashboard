import { useState, useEffect, useRef } from 'react';
import { Bell, User, BarChart3, TrendingUp, AlertTriangle, Car, Activity, Home, Map, FileText, MapPin, Navigation, X, CheckCircle, Shield, Users, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { io as socketIO } from 'socket.io-client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../../../../api';
import { ProfilePage } from './ProfilePage';
import { IncidentPopup } from './IncidentPopup';

function playAlert() { try { const c=new(window.AudioContext||(window as any).webkitAudioContext)(); const t=(f:number,s:number,d:number)=>{const o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=f;o.type='sine';g.gain.setValueAtTime(0.25,c.currentTime+s);g.gain.exponentialRampToValueAtTime(0.01,c.currentTime+s+d);o.start(c.currentTime+s);o.stop(c.currentTime+s+d);}; t(800,0,0.15);t(1000,0.15,0.15);t(800,0.3,0.15);t(1000,0.45,0.3); } catch{} }

function CityMap({incidents,onSelect}:{incidents:any[];onSelect:(i:any)=>void}){
  const ref=useRef<HTMLDivElement>(null); const m=useRef<L.Map|null>(null);
  useEffect(()=>{
    if(!ref.current)return; if(m.current){m.current.remove();m.current=null;}
    const map=L.map(ref.current,{zoomControl:false,attributionControl:false}).setView([15.85,74.50],13);
    m.current=map; L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18}).addTo(map);
    const zones=[{lat:15.8497,lng:74.4977,l:'RPD Cross',c:'#EF4444'},{lat:15.8440,lng:74.5040,l:'College Rd',c:'#F97316'},{lat:15.8525,lng:74.5085,l:'Bogarves',c:'#FBBF24'},{lat:15.8520,lng:74.5020,l:'Rani Channamma',c:'#EF4444'},{lat:15.8380,lng:74.4950,l:'Angol',c:'#22C55E'}];
    zones.forEach(z=>{L.circle([z.lat,z.lng],{radius:180,color:z.c,fillColor:z.c,fillOpacity:0.12,weight:2}).addTo(map).bindPopup(`<b>🚦 ${z.l}</b>`);});
    const pc:Record<string,string>={high:'#EF4444',medium:'#F97316',low:'#22C55E'}; const pts:[number,number][]=[];
    const te:Record<string,string>={accident:'🚗',traffic_jam:'🚦',pothole:'🕳️',road_damage:'🛣️',waterlogging:'🌊',illegal_parking:'🅿️'};
    incidents.forEach(inc=>{if(!inc.location?.lat)return; const s=inc.status==='resolved'||inc.status==='closed'; const c=s?'#6B7280':(pc[inc.priority]||'#F97316'); const e=s?'✅':(te[inc.type]||'📋');
      const ic=L.divIcon({className:'',html:`<div style="width:28px;height:28px;border-radius:50%;background:${c};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:12px;cursor:pointer">${e}</div>`,iconSize:[28,28],iconAnchor:[14,14]});
      L.marker([inc.location.lat,inc.location.lng],{icon:ic}).addTo(map).on('click',()=>onSelect(inc)).bindPopup(`<b>${inc.title||inc.type}</b><br/><small>${inc.location.address||''}</small>`);
      pts.push([inc.location.lat,inc.location.lng]);});
    if(pts.length>0)map.fitBounds(pts,{padding:[30,30],maxZoom:14});
    setTimeout(()=>map.invalidateSize(),100);
    return()=>{m.current?.remove();m.current=null;};
  },[incidents]);
  return <div ref={ref} className="w-full rounded-2xl overflow-hidden border border-gray-200" style={{height:280}}/>;
}

export function AdminDashboard() {
  const [page, setPage] = useState('dashboard');
  const [incidents, setIncidents] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [alertData, setAlertData] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [filter, setFilter] = useState('all');
  const user = api.getUser();

  const authHeaders = () => ({'Content-Type':'application/json',...(localStorage.getItem('cc_token')?{Authorization:`Bearer ${localStorage.getItem('cc_token')}`}:{})});

  const fetchAll = async () => {
    setLoading(true);
    try { const d = await api.getIncidents(); setIncidents(Array.isArray(d)?d:d.incidents||d.data||[]); } catch { setIncidents([]); }
    try { const a = await api.getAlerts(); setAlerts(Array.isArray(a)?a:a.alerts||a.data||[]); } catch { setAlerts([]); }
    setLoading(false);
  };
  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    const s = socketIO('http://localhost:3001');
    s.on('connect', () => s.emit('join-role','admin'));
    s.on('incident-update', (d:any) => { if(d?.type==='new'&&d?.incident){ playAlert(); setAlertData(d.incident); setShowBanner(true); fetchAll(); toast.error(`🚨 ${d.incident.title||d.incident.type}\n📍 ${d.incident.location?.address||''}`,{duration:6000}); setTimeout(()=>setShowBanner(false),15000); } });
    return () => { s.disconnect(); };
  }, []);

  const resolve = async (id:string) => { try { await fetch(`http://localhost:3001/api/incidents/${id}`,{method:'PUT',headers:authHeaders(),body:JSON.stringify({status:'resolved'})}); toast.success('✅ Resolved!'); fetchAll(); } catch{toast.error('Failed');} };
  const deleteInc = async (id:string) => { try { await fetch(`http://localhost:3001/api/incidents/${id}`,{method:'DELETE',headers:authHeaders()}); toast.success('🗑️ Deleted'); fetchAll(); } catch{toast.error('Failed');} };

  const open=incidents.filter(i=>i.status==='open'||i.status==='active').length;
  const prog=incidents.filter(i=>i.status==='in_progress').length;
  const solved=incidents.filter(i=>i.status==='resolved'||i.status==='closed').length;
  const filtered = filter==='all'?incidents:incidents.filter(i=>filter==='open'?(i.status==='open'||i.status==='active'):filter==='resolved'?(i.status==='resolved'||i.status==='closed'):i.status===filter);

  const tabs=[{id:'dashboard',icon:Home,label:'Home'},{id:'incidents',icon:AlertTriangle,label:'Incidents'},{id:'map',icon:Map,label:'Map'},{id:'analytics',icon:BarChart3,label:'Analytics'},{id:'profile',icon:User,label:'Profile'}];

  const renderPage = () => {
    if(page==='profile') return <ProfilePage/>;
    if(page==='map') return (
      <div className="p-4 pt-14"><h2 className="text-2xl font-bold text-black mb-3">City Overview Map</h2>
        <CityMap incidents={incidents} onSelect={setSelected}/>
        <div className="flex gap-3 mt-2"><div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-red-500"/><span className="text-[10px] text-gray-500">High</span></div><div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-orange-500"/><span className="text-[10px] text-gray-500">Medium</span></div><div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-green-500"/><span className="text-[10px] text-gray-500">Low</span></div><div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-gray-400"/><span className="text-[10px] text-gray-500">Resolved</span></div></div>
      </div>
    );
    if(page==='incidents') return (
      <div className="p-4 pt-14">
        <h2 className="text-2xl font-bold text-black mb-1">All Incidents</h2>
        <p className="text-sm text-gray-500 mb-3">Manage & control all city incidents</p>
        <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
          {['all','open','in_progress','resolved'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${filter===f?'bg-black text-white':'bg-gray-100 text-gray-500'}`}>{f==='all'?`All (${incidents.length})`:f==='open'?`Open (${open})`:f==='in_progress'?`Progress (${prog})`:`Resolved (${solved})`}</button>
          ))}
        </div>
        {filtered.map((inc,i)=>{const s=inc.status==='resolved'||inc.status==='closed'; return(
          <motion.div key={inc._id||i} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}} onClick={()=>setSelected(inc)}
            className={`rounded-xl border p-3 mb-2 cursor-pointer hover:shadow-md ${s?'bg-green-50 border-green-200':'bg-white border-gray-200'}`}>
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm ${s?'bg-green-100':'bg-red-50'}`}>{s?'✅':inc.type==='accident'?'🚗':inc.type==='pothole'?'🕳️':'📋'}</div>
              <div className="flex-1 min-w-0"><h4 className={`font-semibold text-sm truncate ${s?'text-gray-400 line-through':'text-black'}`}>{inc.title||inc.type}</h4><p className="text-xs text-gray-500">{inc.location?.address?.split(',')[0]||'Unknown'} • {inc.createdAt?new Date(inc.createdAt).toLocaleDateString():''}</p></div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s?'bg-green-100 text-green-600':inc.priority==='high'?'bg-red-100 text-red-600':'bg-orange-100 text-orange-600'}`}>{s?'SOLVED':(inc.priority||'medium').toUpperCase()}</span>
            </div>
            {!s&&<div className="flex gap-2 mt-2" onClick={e=>e.stopPropagation()}>
              <button onClick={()=>resolve(inc._id)} className="flex-1 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold">✅ Resolve</button>
              <button onClick={()=>deleteInc(inc._id)} className="py-1.5 px-3 bg-red-50 text-red-500 rounded-lg text-xs font-medium"><Trash2 className="w-3 h-3"/></button>
            </div>}
          </motion.div>
        );})}
      </div>
    );
    if(page==='analytics') return (
      <div className="p-4 pt-14">
        <h2 className="text-2xl font-bold text-black mb-1">City Analytics</h2>
        <p className="text-sm text-gray-500 mb-4">AI-powered insights for Belagavi</p>
        <div className="space-y-3">
          {[{m:'Traffic Congestion',c:Math.round(open/(incidents.length||1)*100),p:Math.max(0,Math.round(open/(incidents.length||1)*100)-15),col:'red'},{m:'Incident Resolution',c:Math.round(solved/(incidents.length||1)*100),p:Math.min(100,Math.round(solved/(incidents.length||1)*100)+10),col:'green'},{m:'Response Efficiency',c:85,p:92,col:'blue'},{m:'Citizen Satisfaction',c:78,p:85,col:'purple'}].map(item=>(
            <div key={item.m} className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex justify-between mb-2"><span className="text-black text-sm font-semibold">{item.m}</span><div className="flex items-center gap-2"><span className={`text-sm text-${item.col}-600 font-bold`}>{item.c}%</span><span className="text-xs text-green-500">→ {item.p}%</span></div></div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden"><motion.div initial={{width:0}} animate={{width:`${item.c}%`}} className={`h-full bg-${item.col}-500 rounded-full`}/></div>
            </div>
          ))}
        </div>
        <h3 className="font-bold text-black mt-5 mb-2">Incident Breakdown</h3>
        <div className="grid grid-cols-2 gap-2">
          {['accident','pothole','traffic_jam','road_damage','waterlogging','illegal_parking'].map(t=>{const c=incidents.filter(i=>i.type===t).length; return(
            <div key={t} className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center justify-between"><span className="text-sm text-gray-600 capitalize">{t.replace(/_/g,' ')}</span><span className="text-sm font-bold text-black">{c}</span></div>
          );})}
        </div>
      </div>
    );
    // Home
    return (<>
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3"><div><div className="flex items-center gap-2"><Shield className="w-5 h-5 text-blue-600"/><h1 className="text-xl font-bold text-black">City Command Center</h1></div><p className="text-xs text-gray-400 mt-0.5">Belagavi Smart City • Admin Control</p></div>
          <div className="flex items-center gap-3"><button onClick={()=>setPage('incidents')} className="relative p-2"><Bell className="w-6 h-6 text-black"/>{open>0&&<span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{open}</span>}</button>
            <button onClick={()=>setPage('profile')} className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"><User className="w-6 h-6 text-gray-600"/></button></div></div>
        <div className="grid grid-cols-4 gap-2">
          {[{l:'Open',v:open,c:'bg-red-50 text-red-600'},{l:'Progress',v:prog,c:'bg-blue-50 text-blue-600'},{l:'Solved',v:solved,c:'bg-green-50 text-green-600'},{l:'Total',v:incidents.length,c:'bg-gray-50 text-black'}].map(s=>(
            <div key={s.l} className={`${s.c} rounded-xl p-2.5 text-center`}><div className="text-lg font-bold">{s.v}</div><div className="text-[10px] font-medium opacity-70">{s.l}</div></div>
          ))}
        </div>
      </div>
      <div className="p-4 space-y-4">
        {/* City Map */}
        <div><div className="flex justify-between items-center mb-2"><h3 className="font-bold text-black flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-500"/>City Map</h3><button onClick={()=>setPage('map')} className="text-xs font-bold text-black">Full Map →</button></div>
          <CityMap incidents={incidents} onSelect={setSelected}/></div>
        {/* Resources */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-gray-200 rounded-xl p-3"><h4 className="text-black font-semibold text-sm mb-2">Active Resources</h4>
            {[{l:'Police Units',v:'45/50',c:'text-blue-600'},{l:'Ambulances',v:'12/15',c:'text-red-600'},{l:'Construction',v:'8/10',c:'text-orange-600'}].map(r=>(
              <div key={r.l} className="flex justify-between text-sm py-1"><span className="text-gray-500">{r.l}</span><span className={`${r.c} font-bold`}>{r.v}</span></div>
            ))}</div>
          <div className="bg-white border border-gray-200 rounded-xl p-3"><h4 className="text-black font-semibold text-sm mb-2">City Health</h4>
            {[{l:'Air Quality',v:'Good',c:'text-green-600'},{l:'Noise Level',v:'Moderate',c:'text-yellow-600'},{l:'Traffic Flow',v:open>5?'Congested':'Normal',c:open>5?'text-red-600':'text-green-600'}].map(r=>(
              <div key={r.l} className="flex justify-between text-sm py-1"><span className="text-gray-500">{r.l}</span><span className={`${r.c} font-bold`}>{r.v}</span></div>
            ))}</div>
        </div>
        {/* Recent Incidents */}
        <div><div className="flex justify-between items-center mb-2"><h3 className="font-bold text-black flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500"/>Recent Incidents</h3><button onClick={()=>setPage('incidents')} className="text-xs font-bold text-red-500">View All →</button></div>
          {loading&&<div className="flex justify-center py-6"><div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"/></div>}
          {incidents.slice(0,5).map((inc,i)=>{const s=inc.status==='resolved'; return(
            <motion.div key={inc._id||i} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.04}} onClick={()=>setSelected(inc)}
              className="bg-white rounded-xl border border-gray-200 p-3 mb-2 cursor-pointer hover:shadow-md">
              <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${s?'bg-green-50':'bg-red-50'}`}>{s?'✅':inc.type==='accident'?'🚗':'📋'}</div>
                <div className="flex-1 min-w-0"><h4 className="font-semibold text-sm text-black truncate">{inc.title||inc.type}</h4><p className="text-xs text-gray-500">{inc.location?.address?.split(',')[0]||'Unknown'}</p></div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s?'bg-green-100 text-green-600':'bg-red-100 text-red-600'}`}>{s?'SOLVED':'OPEN'}</span></div>
            </motion.div>
          );})}
        </div>
        {/* AI Predictions */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-100">
          <h3 className="font-bold text-black flex items-center gap-2 mb-3"><BarChart3 className="w-4 h-4 text-blue-600"/>AI Predictions</h3>
          {[{t:'Peak congestion expected 5-7 PM at RPD Cross',c:'🔴'},{t:'Pothole reports trending up in Angol area',c:'🟡'},{t:`${solved} incidents resolved this week — ${Math.round(solved/(incidents.length||1)*100)}% rate`,c:'🟢'}].map((p,i)=>(
            <div key={i} className="flex items-center gap-2 py-1.5"><span>{p.c}</span><span className="text-sm text-gray-700">{p.t}</span></div>
          ))}
        </div>
      </div>
    </>);
  };

  return (
    <div className="relative h-full overflow-hidden bg-white">
      <div className="relative z-10 h-full overflow-y-auto pb-24">{renderPage()}</div>
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200"><div className="grid grid-cols-5 max-w-md mx-auto">
        {tabs.map(t=>{const a=page===t.id; return(<button key={t.id} onClick={()=>setPage(t.id)} className="relative p-4 flex flex-col items-center gap-1"><t.icon className={`w-6 h-6 ${a?'text-black':'text-gray-400'}`} fill={a?'black':'none'}/><span className={`text-xs ${a?'text-black font-medium':'text-gray-400'}`}>{t.label}</span>{a&&<motion.div layoutId="adm-nav" className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-black rounded-full" transition={{type:'spring',duration:0.6}}/>}</button>)})}
      </div></div>
      <AnimatePresence>{showBanner&&alertData&&(
        <motion.div initial={{y:-120}} animate={{y:0}} exit={{y:-120}} className="fixed top-0 left-0 right-0 z-[60] p-3 pt-12">
          <div className="bg-white rounded-2xl border-2 border-blue-400 p-4 shadow-2xl mx-2" style={{animation:'ap 1s ease-in-out infinite'}}>
            <style>{`@keyframes ap{0%,100%{border-color:#60a5fa;box-shadow:0 0 0 0 rgba(59,130,246,0.4)}50%{border-color:#3b82f6;box-shadow:0 0 20px 4px rgba(59,130,246,0.3)}}`}</style>
            <div className="flex items-start gap-3"><motion.div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0" animate={{scale:[1,1.1,1]}} transition={{duration:0.5,repeat:Infinity}}><Shield className="w-6 h-6 text-white"/></motion.div>
              <div className="flex-1 min-w-0"><p className="text-xs font-black text-blue-600 uppercase">🚨 New City Incident</p><p className="text-sm font-bold text-black truncate">{alertData.title||alertData.type}</p><p className="text-xs text-gray-500 truncate">{alertData.location?.address||'Unknown'}</p></div>
              <button onClick={()=>setShowBanner(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><X className="w-4 h-4"/></button></div>
            <div className="flex gap-2 mt-3"><button onClick={()=>{setSelected(alertData);setShowBanner(false)}} className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">View & Manage</button><button onClick={()=>setShowBanner(false)} className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-medium">Dismiss</button></div>
          </div>
        </motion.div>
      )}</AnimatePresence>
      <AnimatePresence>{selected&&<IncidentPopup incident={selected} onClose={()=>setSelected(null)} onResolve={resolve} onDelete={deleteInc}/>}</AnimatePresence>
    </div>
  );
}
