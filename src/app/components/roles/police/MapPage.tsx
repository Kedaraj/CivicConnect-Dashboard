import { Navigation, MapPin, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useState } from 'react';

export function MapPage() {
  const [incidents] = useState([
    { id: 1, type: 'Accident', location: 'Main St & 5th Ave', severity: 'high', lat: 40, lng: -74 },
    { id: 2, type: 'Traffic Jam', location: 'Highway 101', severity: 'medium', lat: 42, lng: -73 },
    { id: 3, type: 'Road Work', location: 'Oak Street', severity: 'low', lat: 38, lng: -75 }
  ]);

  return (
    <div className="h-full bg-white">
      {/* Map Container */}
      <div className="relative h-[60vh] bg-gray-100 border-b border-gray-200">
        {/* Grid Pattern */}
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 gap-1 p-2">
          {[...Array(36)].map((_, i) => {
            const intensity = Math.random();
            const color = intensity > 0.7 ? 'bg-red-200' : intensity > 0.4 ? 'bg-yellow-100' : 'bg-green-100';
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className={`${color} rounded`}
              />
            );
          })}
        </div>

        {/* Incident Markers */}
        {incidents.map((incident, i) => (
          <motion.div
            key={incident.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 + 0.5 }}
            className="absolute"
            style={{
              left: `${20 + i * 25}%`,
              top: `${30 + i * 15}%`
            }}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                incident.severity === 'high' ? 'bg-red-500' :
                incident.severity === 'medium' ? 'bg-orange-500' : 'bg-gray-400'
              }`}
            >
              <MapPin className="w-5 h-5 text-white" />
            </div>
          </motion.div>
        ))}

        {/* Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => toast.info('Centering on your location')}
            className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center"
          >
            <Navigation className="w-6 h-6 text-black" />
          </button>
          <button
            onClick={() => toast.info('Zoom in')}
            className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-xl font-bold"
          >
            +
          </button>
          <button
            onClick={() => toast.info('Zoom out')}
            className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-xl font-bold"
          >
            −
          </button>
        </div>

        {/* Search */}
        <div className="absolute top-4 left-4 right-20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search location..."
              className="w-full bg-white rounded-xl pl-10 pr-4 py-3 shadow-lg text-black placeholder-gray-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Incident List */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-black">Nearby Incidents</h3>
        {incidents.map((incident) => (
          <motion.div
            key={incident.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-50 rounded-xl p-4 border border-gray-200"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-black">{incident.type}</h4>
                <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{incident.location}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                incident.severity === 'high' ? 'bg-red-100 text-red-600' :
                incident.severity === 'medium' ? 'bg-orange-100 text-orange-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                {incident.severity.toUpperCase()}
              </span>
            </div>
            <button
              onClick={() => toast.success(`Navigating to ${incident.location}`)}
              className="w-full mt-3 py-2 bg-blue-600 text-white rounded-lg font-medium"
            >
              Navigate
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
