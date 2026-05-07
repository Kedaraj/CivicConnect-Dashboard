import { Car, MapPin, Fuel, Clock, Navigation, User, Radio, Filter, Phone } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';

export function PatrolPage() {
  const [filter, setFilter] = useState('All');
  const [patrols, setPatrols] = useState([
    { id: 'Unit 23', officer: 'Officer Smith', location: 'Downtown', fuel: 75, status: 'active', speed: '35 mph' },
    { id: 'Unit 15', officer: 'Officer Johnson', location: 'Highway 101', fuel: 45, status: 'active', speed: '60 mph' },
    { id: 'Unit 42', officer: 'Officer Williams', location: 'Park Avenue', fuel: 90, status: 'patrol', speed: '25 mph' },
    { id: 'Unit 07', officer: 'Officer Davis', location: 'Central Station', fuel: 30, status: 'standby', speed: '0 mph' }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return { bg: '#E5FFE5', text: '#44CC44' };
      case 'patrol': return { bg: '#E5E5FF', text: '#6B6BFF' };
      case 'standby': return { bg: '#FFF5E5', text: '#FFA500' };
      default: return { bg: '#F5F5F5', text: '#666666' };
    }
  };

  const getFuelColor = (fuel: number) => {
    if (fuel > 50) return '#44CC44';
    if (fuel > 25) return '#FFA500';
    return '#FF4444';
  };

  const handleTrack = (unitId: string, location: string) => {
    toast.success(`Tracking ${unitId} at ${location}`);
  };

  const handleContact = (unitId: string, officer: string) => {
    toast.success(`Calling ${officer} (${unitId})...`);
  };

  const handleRefuel = (unitId: string) => {
    setPatrols(prev => prev.map(p =>
      p.id === unitId ? { ...p, fuel: 100 } : p
    ));
    toast.success(`Refuel request sent to ${unitId}`);
  };

  const filteredPatrols = patrols.filter(p => {
    if (filter === 'All') return true;
    if (filter === 'Active') return p.status === 'active';
    if (filter === 'Patrol') return p.status === 'patrol';
    if (filter === 'Standby') return p.status === 'standby';
    return true;
  });

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-black flex items-center gap-2">
            <Car className="w-6 h-6 text-cyan-600" />
            Patrol Management
          </h2>
          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <Filter className="w-5 h-5 text-black" />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto mb-3">
          {['All', 'Active', 'Patrol', 'Standby'].map((filterOption) => (
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
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white border border-gray-200 rounded-xl p-2 text-center">
            <div className="text-lg font-bold text-green-600">{patrols.filter(p => p.status === 'active').length}</div>
            <div className="text-xs text-gray-500">Active</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-2 text-center">
            <div className="text-lg font-bold text-blue-600">{patrols.filter(p => p.status === 'patrol').length}</div>
            <div className="text-xs text-gray-500">Patrol</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-2 text-center">
            <div className="text-lg font-bold text-orange-500">{patrols.filter(p => p.status === 'standby').length}</div>
            <div className="text-xs text-gray-500">Standby</div>
          </div>
        </div>
      </div>

      {/* Patrol Units List */}
      <div className="p-4 space-y-3">
        <h3 className="text-black font-semibold">Patrol Units</h3>
        {filteredPatrols.map((patrol, i) => {
          const statusColors = getStatusColor(patrol.status);
          const fuelColor = getFuelColor(patrol.fuel);
          return (
            <motion.div
              key={patrol.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border border-gray-200 rounded-2xl p-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center">
                    <Car className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <h4 className="text-black font-semibold">{patrol.id}</h4>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <User className="w-3 h-3" />
                      <span>{patrol.officer}</span>
                    </div>
                  </div>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: statusColors.bg, color: statusColors.text }}
                >
                  {patrol.status.toUpperCase()}
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-gray-50 rounded-lg p-2">
                  <MapPin className="w-4 h-4 text-blue-600 mb-1" />
                  <div className="text-xs text-gray-500">Location</div>
                  <div className="text-sm text-black font-medium truncate">{patrol.location}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <Fuel className="w-4 h-4 mb-1" style={{ color: fuelColor }} />
                  <div className="text-xs text-gray-500">Fuel</div>
                  <div className="flex items-center gap-1">
                    <div className="text-sm font-medium" style={{ color: fuelColor }}>{patrol.fuel}%</div>
                    {patrol.fuel < 50 && (
                      <button
                        onClick={() => handleRefuel(patrol.id)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Refuel
                      </button>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <Clock className="w-4 h-4 text-purple-600 mb-1" />
                  <div className="text-xs text-gray-500">Speed</div>
                  <div className="text-sm text-black font-medium">{patrol.speed}</div>
                </div>
              </div>

              {/* Low Fuel Warning */}
              {patrol.fuel < 30 && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <Fuel className="w-4 h-4" />
                    <span className="font-medium">Low fuel warning - Refuel recommended</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleTrack(patrol.id, patrol.location)}
                  className="flex items-center justify-center gap-2 py-2 bg-blue-50 rounded-lg text-blue-600 text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Track</span>
                </button>
                <button
                  onClick={() => handleContact(patrol.id, patrol.officer)}
                  className="flex items-center justify-center gap-2 py-2 bg-green-50 rounded-lg text-green-600 text-sm font-medium hover:bg-green-100 transition-colors"
                >
                  <Radio className="w-4 h-4" />
                  <span>Contact</span>
                </button>
                <button
                  onClick={() => toast.info(`Emergency alert sent to ${patrol.id}`)}
                  className="flex items-center justify-center gap-2 py-2 bg-red-50 rounded-lg text-red-600 text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>Alert</span>
                </button>
              </div>
            </motion.div>
          );
        })}

        {filteredPatrols.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No {filter.toLowerCase()} units</div>
            <div className="text-gray-400 text-sm">Try adjusting the filter</div>
          </div>
        )}
      </div>
    </div>
  );
}
