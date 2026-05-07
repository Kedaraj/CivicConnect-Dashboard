import { MapPin, AlertCircle, Navigation, Maximize2, Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface LiveMapProps {
  onClick?: () => void;
}

export function LiveMap({ onClick }: LiveMapProps = {}) {
  const gridSize = 4;
  const incidents = [
    { x: 1, y: 0, type: 'high', color: '#FF4444' },
    { x: 2, y: 1, type: 'medium', color: '#FF8844' },
    { x: 1, y: 2, type: 'low', color: '#666666' }
  ];

  const getCellColor = (x: number, y: number) => {
    const colors = [
      '#F5F5F0', '#EAE8E0', '#E0DED0', '#F8F6EC',
      '#F0EEE4', '#E8E6DC', '#F3F1E7', '#EBE9DF',
      '#E3E1D7', '#F6F4EA', '#EEE  CDD', '#E6E4DA',
      '#F1EFE5', '#E9E7DD', '#E1DFD5', '#F4F2E8'
    ];
    return colors[(x + y * gridSize) % colors.length];
  };

  return (
    <div className="relative rounded-2xl overflow-hidden bg-white border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-black">Live Traffic Map</h3>
        <button
          onClick={onClick}
          className="text-sm text-black font-medium flex items-center gap-1 hover:text-blue-600 transition-colors"
        >
          Full Map
          <span className="text-lg">→</span>
        </button>
      </div>

      {/* Map Grid */}
      <div className="relative aspect-square rounded-xl overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-[3px] bg-white p-[3px]">
          {[...Array(gridSize * gridSize)].map((_, i) => {
            const x = i % gridSize;
            const y = Math.floor(i / gridSize);
            const incident = incidents.find(inc => inc.x === x && inc.y === y);

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="relative rounded-lg overflow-hidden"
                style={{ backgroundColor: getCellColor(x, y) }}
              >
                {/* Grid cell */}
                <div className="absolute inset-0 opacity-20">
                  <svg className="w-full h-full">
                    <line x1="0" y1="50%" x2="100%" y2="50%" stroke="white" strokeWidth="2" />
                    <line x1="50%" y1="0" x2="50%" y2="100%" stroke="white" strokeWidth="2" />
                  </svg>
                </div>

                {/* Incident marker */}
                {incident && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.02, type: 'spring' }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <motion.div
                      className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-lg"
                      style={{ backgroundColor: incident.color }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {incident.type === 'high' && (
                        <AlertCircle className="w-4 h-4 text-white" />
                      )}
                      {incident.type === 'medium' && (
                        <div className="w-3 h-3 rounded-full bg-white" />
                      )}
                      {incident.type === 'low' && (
                        <MapPin className="w-4 h-4 text-white" />
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Add API Key Notice */}
        <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-gray-200 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center flex-shrink-0">
            <MapPin className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs text-gray-500">Add API key for live map</span>
        </div>

        {/* Live indicator */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-sm border border-gray-200">
          <motion.div
            className="w-1.5 h-1.5 bg-red-500 rounded-full"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-xs font-medium text-black">LIVE</span>
        </div>
      </div>
    </div>
  );
}
