import { AlertTriangle, MapPin, Clock, User, Phone, CheckCircle, Filter, Plus, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { IncidentModal } from './IncidentModal';
import { toast } from 'sonner';

export function IncidentsPage() {
  const [filter, setFilter] = useState('All');
  const [selectedIncident, setSelectedIncident] = useState<number | null>(null);
  const [incidents, setIncidents] = useState([
    { id: 1, type: 'Accident', location: 'RPD Cross, Tilakwadi', time: '5 min ago', priority: 'high', status: 'active', officer: null, lat: 15.8497, lng: 74.4977, description: 'Two-wheeler collision near RPD circle. One injured.' },
    { id: 2, type: 'Traffic Jam', location: 'College Road, KLE Circle', time: '12 min ago', priority: 'medium', status: 'active', officer: 'Unit 23', lat: 15.8440, lng: 74.5040, description: 'Heavy congestion due to college hours. Signal malfunctioning.' },
    { id: 3, type: 'Signal Failure', location: 'Bogarves Circle, Shahapur', time: '20 min ago', priority: 'low', status: 'assigned', officer: 'Unit 15', lat: 15.8525, lng: 74.5085, description: 'Traffic signal not working at Bogarves junction.' },
    { id: 4, type: 'VIP Movement', location: 'Rani Channamma Circle', time: '2 min ago', priority: 'high', status: 'active', officer: null, lat: 15.8520, lng: 74.5020, description: 'VIP convoy passing through Rani Channamma circle. Route diversion required.' },
    { id: 5, type: 'Illegal Parking', location: 'Kirloskar Road, Nehru Nagar', time: '45 min ago', priority: 'low', status: 'pending', officer: null, lat: 15.8560, lng: 74.5000, description: 'Vehicles parked on no-parking zone near Kirloskar Road.' },
    { id: 6, type: 'Road Damage', location: 'Angol Main Road, Angol', time: '1 hr ago', priority: 'medium', status: 'active', officer: null, lat: 15.8380, lng: 74.4950, description: 'Large pothole on Angol main road causing traffic slowdown.' },
    { id: 7, type: 'Accident', location: 'Khanapur Road, Hindwadi', time: '8 min ago', priority: 'high', status: 'active', officer: null, lat: 15.8600, lng: 74.4900, description: 'Auto-rickshaw overturned near Hindwadi bus stop.' },
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return { bg: '#FFE5E5', text: '#FF4444' };
      case 'medium': return { bg: '#FFF5E5', text: '#FFA500' };
      case 'low': return { bg: '#E5E5FF', text: '#6B6BFF' };
      default: return { bg: '#F5F5F5', text: '#666666' };
    }
  };

  const handleAssignOfficer = (incidentId: number, unitId: string) => {
    setIncidents(prev => prev.map(inc =>
      inc.id === incidentId ? { ...inc, officer: unitId, status: 'assigned' } : inc
    ));
    toast.success(`${unitId} assigned successfully`);
  };

  const handleResolveIncident = (incidentId: number) => {
    setIncidents(prev => prev.filter(inc => inc.id !== incidentId));
    toast.success('Incident marked as resolved');
  };

  const handleCall = (location: string) => {
    toast.success(`Calling dispatch for ${location}...`);
  };

  const filteredIncidents = incidents.filter(inc => {
    if (filter === 'All') return true;
    if (filter === 'Active') return inc.status === 'active';
    if (filter === 'Assigned') return inc.status === 'assigned';
    if (filter === 'Pending') return inc.status === 'pending';
    return true;
  });

  const selectedIncidentData = incidents.find(inc => inc.id === selectedIncident);

  return (
    <>
      <div className="pb-24 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-black flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              Live Incidents
            </h2>
            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Filter className="w-5 h-5 text-black" />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {['All', 'Active', 'Assigned', 'Pending'].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap font-medium transition-colors ${
                  filter === filterOption
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
              >
                {filterOption}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="p-4 grid grid-cols-3 gap-3">
          <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-red-500">{incidents.filter(i => i.status === 'active').length}</div>
            <div className="text-xs text-gray-500 mt-1">Active</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{incidents.filter(i => i.status === 'assigned').length}</div>
            <div className="text-xs text-gray-500 mt-1">Assigned</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-orange-500">{incidents.filter(i => i.status === 'pending').length}</div>
            <div className="text-xs text-gray-500 mt-1">Pending</div>
          </div>
        </div>

        {/* Incidents List */}
        <div className="px-4 space-y-3">
          <AnimatePresence>
            {filteredIncidents.map((incident, i) => {
              const colors = getPriorityColor(incident.priority);
              return (
                <motion.div
                  key={incident.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                  onClick={() => setSelectedIncident(incident.id)}
                >
                  {/* Priority Strip */}
                  <div className="h-1" style={{ backgroundColor: colors.text }} />

                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-black font-semibold">{incident.type}</h3>
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ backgroundColor: colors.bg, color: colors.text }}
                          >
                            {incident.priority.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{incident.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{incident.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Officer Assignment */}
                    {incident.officer && (
                      <div className="flex items-center gap-2 mb-3 p-2 bg-blue-50 rounded-lg">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-600">Assigned to: {incident.officer}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="grid grid-cols-3 gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedIncident(incident.id)}
                        className="flex items-center justify-center gap-2 py-2 bg-blue-50 rounded-lg text-blue-600 text-sm font-medium hover:bg-blue-100 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Assign</span>
                      </button>
                      <button
                        onClick={() => handleCall(incident.location)}
                        className="flex items-center justify-center gap-2 py-2 bg-green-50 rounded-lg text-green-600 text-sm font-medium hover:bg-green-100 transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Call</span>
                      </button>
                      <button
                        onClick={() => handleResolveIncident(incident.id)}
                        className="flex items-center justify-center gap-2 py-2 bg-emerald-50 rounded-lg text-emerald-600 text-sm font-medium hover:bg-emerald-100 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Resolve</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredIncidents.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">No {filter.toLowerCase()} incidents</div>
              <div className="text-gray-400 text-sm">All clear in this category</div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-28 right-6 w-14 h-14 rounded-full bg-black shadow-lg flex items-center justify-center"
        onClick={() => toast.info('New incident report form')}
      >
        <Plus className="w-6 h-6 text-white" />
      </motion.button>

      {/* Incident Modal */}
      <AnimatePresence>
        {selectedIncident && selectedIncidentData && (
          <IncidentModal
            incident={selectedIncidentData}
            onClose={() => setSelectedIncident(null)}
            onAssign={(unitId) => handleAssignOfficer(selectedIncident, unitId)}
            onResolve={() => handleResolveIncident(selectedIncident)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
