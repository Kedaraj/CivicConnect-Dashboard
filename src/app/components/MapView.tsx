import { MapPin, AlertCircle, Navigation, ZoomIn, ZoomOut, Layers, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

export function MapView({ onClose }: { onClose: () => void }) {
  const [zoom, setZoom] = useState(1);
  const [selectedIncident, setSelectedIncident] = useState<number | null>(null);

  const gridSize = 6;
  const incidents = [
    { id: 1, x: 1, y: 0, type: 'Accident', severity: 'high', color: '#FF4444', location: 'Main St & 5th Ave', time: '5 min ago', units: 2 },
    { id: 2, x: 3, y: 2, type: 'Traffic Jam', severity: 'medium', color: '#FF8844', location: 'Highway 101', time: '12 min ago', units: 1 },
    { id: 3, x: 1, y: 4, type: 'Signal Failure', severity: 'low', color: '#666666', location: 'Park Ave', time: '20 min ago', units: 0 },
    { id: 4, x: 4, y: 1, type: 'Construction', severity: 'medium', color: '#FFA500', location: 'Oak Street', time: '1 hour ago', units: 1 }
  ];

  const getCellColor = (x: number, y: number) => {
    const colors = [
      '#F5F5F0', '#EAE8E0', '#E0DED0', '#F8F6EC',
      '#F0EEE4', '#E8E6DC', '#F3F1E7', '#EBE9DF',
      '#E3E1D7', '#F6F4EA', '#EEECDD', '#E6E4DA',
      '#F1EFE5', '#E9E7DD', '#E1DFD5', '#F4F2E8',
      '#ECE8DE', '#E4E2D8', '#F7F5EB', '#EFEDe3',
      '#E7E5DB', '#F2F0E6', '#EAE8DE', '#E2E0D6',
      '#F5F3E9', '#EDE9DF', '#E5E3D9', '#F0EEE4',
      '#E8E6DC', '#E0DED4', '#F3F1E7', '#EBE7DD',
      '#E3E1D7', '#F6F4EA', '#EEEaE0', '#E6E4DA'
    ];
    return colors[(x + y * gridSize) % colors.length];
  };

  const handleIncidentClick = (id: number) => {
    setSelectedIncident(selectedIncident === id ? null : id);
  };

  const selectedData = incidents.find(i => i.id === selectedIncident);

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation className="w-6 h-6 text-black" />
          <h2 className="text-xl font-bold text-black">Full Traffic Map</h2>
        </div>
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <X className="w-6 h-6 text-black" />
        </button>
      </div>

      {/* Map Container */}
      <div className="p-4">
        <div className="relative rounded-2xl overflow-hidden bg-white border border-gray-200">
          {/* Map Grid */}
          <div
            className="relative w-full transition-transform duration-300"
            style={{
              aspectRatio: '1/1',
              transform: `scale(${zoom})`
            }}
          >
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 gap-[2px] bg-white p-[2px]">
              {[...Array(gridSize * gridSize)].map((_, i) => {
                const x = i % gridSize;
                const y = Math.floor(i / gridSize);
                const incident = incidents.find(inc => inc.x === x && inc.y === y);

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.01 }}
                    className="relative rounded-lg overflow-hidden cursor-pointer"
                    style={{ backgroundColor: getCellColor(x, y) }}
                    onClick={() => incident && handleIncidentClick(incident.id)}
                  >
                    {/* Grid lines */}
                    <div className="absolute inset-0 opacity-10">
                      <svg className="w-full h-full">
                        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="white" strokeWidth="1" />
                        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="white" strokeWidth="1" />
                      </svg>
                    </div>

                    {/* Incident marker */}
                    {incident && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: selectedIncident === incident.id ? 1.3 : 1 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <motion.div
                          className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-lg"
                          style={{ backgroundColor: incident.color }}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <AlertCircle className="w-5 h-5 text-white" />
                        </motion.div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button
              onClick={() => setZoom(Math.min(zoom + 0.2, 2))}
              className="w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-200 flex items-center justify-center"
            >
              <ZoomIn className="w-5 h-5 text-black" />
            </button>
            <button
              onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
              className="w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-200 flex items-center justify-center"
            >
              <ZoomOut className="w-5 h-5 text-black" />
            </button>
            <button className="w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-200 flex items-center justify-center">
              <Layers className="w-5 h-5 text-black" />
            </button>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-lg border border-gray-200 p-3">
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-black">High Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full" />
                <span className="text-black">Medium Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full" />
                <span className="text-black">Low Priority</span>
              </div>
            </div>
          </div>
        </div>

        {/* Incident Details */}
        <AnimatePresence>
          {selectedData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-4 bg-white border border-gray-200 rounded-2xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-black">{selectedData.type}</h3>
                  <p className="text-sm text-gray-500">{selectedData.location}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600">
                  {selectedData.severity.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span>⏱️ {selectedData.time}</span>
                <span>🚓 {selectedData.units} units assigned</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button className="py-2 bg-blue-600 text-white rounded-lg font-medium">
                  Dispatch Unit
                </button>
                <button className="py-2 bg-gray-100 text-black rounded-lg font-medium">
                  View Details
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
