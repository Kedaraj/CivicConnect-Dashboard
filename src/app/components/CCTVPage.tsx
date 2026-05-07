import { Camera, Maximize, Play, RotateCw, ZoomIn, Moon, AlertCircle, Grid3x3, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';

export function CCTVPage() {
  const [selectedCamera, setSelectedCamera] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isNightMode, setIsNightMode] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

  const cameras = [
    { id: 1, location: 'Main St & 5th Ave', status: 'active', alert: false },
    { id: 2, location: 'Highway 101 North', status: 'active', alert: true },
    { id: 3, location: 'Park Avenue', status: 'active', alert: false },
    { id: 4, location: 'Downtown Plaza', status: 'active', alert: false },
    { id: 5, location: 'Oak Street Bridge', status: 'offline', alert: false },
    { id: 6, location: 'Central Station', status: 'active', alert: true }
  ];

  const handleCameraSwitch = (index: number) => {
    setSelectedCamera(index);
    toast.success(`Switched to Camera ${cameras[index].id}`);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    toast.info(isPlaying ? 'Feed paused' : 'Feed playing');
  };

  const handleRefresh = () => {
    toast.success('Feed refreshed');
  };

  const handleZoom = () => {
    toast.info('Zoom controls activated');
  };

  const handleNightMode = () => {
    setIsNightMode(!isNightMode);
    toast.info(isNightMode ? 'Night mode disabled' : 'Night mode enabled');
  };

  const handleFullscreen = () => {
    toast.info('Entering fullscreen mode');
  };

  const handleGridView = () => {
    setShowGrid(!showGrid);
    toast.info(showGrid ? 'Single camera view' : 'Grid view activated');
  };

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-black flex items-center gap-2">
            <Camera className="w-6 h-6 text-purple-600" />
            CCTV Monitoring
          </h2>
          <button
            onClick={handleGridView}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <Grid3x3 className="w-5 h-5 text-black" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2 h-2 bg-green-500 rounded-full"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-sm text-green-600 font-medium">
            {cameras.filter(c => c.status === 'active').length} Cameras Online
          </span>
        </div>
      </div>

      {/* Main Camera Feed */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {!showGrid ? (
            <motion.div
              key="single"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className={`relative h-64 rounded-2xl overflow-hidden border border-gray-200 ${isNightMode ? 'bg-gray-900' : 'bg-gray-800'} mb-4`}>
                {/* Camera Feed Simulation */}
                <div className={`absolute inset-0 ${isNightMode ? 'bg-gradient-to-br from-gray-900 via-black to-gray-900' : 'bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900'}`}>
                  {/* Grid overlay */}
                  <svg className={`absolute inset-0 w-full h-full ${isNightMode ? 'opacity-20' : 'opacity-10'}`}>
                    <defs>
                      <pattern id="cam-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke={isNightMode ? '#00ff00' : 'white'} strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#cam-grid)" />
                  </svg>

                  {/* Scanning line */}
                  {isPlaying && (
                    <motion.div
                      className={`absolute inset-x-0 h-0.5 ${isNightMode ? 'bg-gradient-to-r from-transparent via-green-400 to-transparent' : 'bg-gradient-to-r from-transparent via-cyan-400 to-transparent'}`}
                      animate={{ y: [0, 256, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                  )}
                </div>

                {/* Camera Info Overlay */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-200">
                  <div className="text-black text-sm font-medium">{cameras[selectedCamera].location}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <span>CAM {cameras[selectedCamera].id}</span>
                    <span>•</span>
                    <span>1080p</span>
                    <span>•</span>
                    {isPlaying ? (
                      <motion.span
                        className="text-red-500 flex items-center gap-1"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                        REC
                      </motion.span>
                    ) : (
                      <span className="text-gray-500">PAUSED</span>
                    )}
                  </div>
                </div>

                {/* Timestamp */}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-200">
                  <div className="text-black text-sm font-mono">
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>

                {/* Alert Badge */}
                {cameras[selectedCamera].alert && (
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-2 bg-red-500 rounded-lg shadow-lg"
                  >
                    <AlertCircle className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-bold">AI Alert Detected</span>
                  </motion.div>
                )}

                {/* Controls */}
                <div className="absolute bottom-3 right-3 flex gap-2">
                  {[
                    { icon: isPlaying ? Pause : Play, action: handlePlayPause, label: 'Play/Pause' },
                    { icon: RotateCw, action: handleRefresh, label: 'Refresh' },
                    { icon: ZoomIn, action: handleZoom, label: 'Zoom' },
                    { icon: Moon, action: handleNightMode, label: 'Night Mode', active: isNightMode },
                    { icon: Maximize, action: handleFullscreen, label: 'Fullscreen' }
                  ].map((control, i) => (
                    <motion.button
                      key={i}
                      onClick={control.action}
                      whileTap={{ scale: 0.9 }}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-colors ${
                        control.active
                          ? 'bg-blue-600 border-blue-600'
                          : 'bg-white/95 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <control.icon className={`w-4 h-4 ${control.active ? 'text-white' : 'text-black'}`} />
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-3 mb-4"
            >
              {cameras.slice(0, 4).map((camera, i) => (
                <div
                  key={camera.id}
                  className="relative h-40 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-800 cursor-pointer"
                  onClick={() => {
                    handleCameraSwitch(i);
                    setShowGrid(false);
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />
                  <div className="absolute top-2 left-2 right-2 bg-white/95 backdrop-blur-sm rounded px-2 py-1 border border-gray-200">
                    <div className="text-black text-xs font-medium truncate">{camera.location}</div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs text-gray-500">CAM {camera.id}</span>
                      <span className={`flex items-center gap-1 text-xs ${camera.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${camera.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                        {camera.status}
                      </span>
                    </div>
                  </div>
                  {camera.alert && (
                    <div className="absolute bottom-2 left-2 right-2 bg-red-500 rounded px-2 py-1">
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-white" />
                        <span className="text-xs text-white font-bold">ALERT</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Camera Grid */}
        <h3 className="text-black font-semibold mb-3">All Cameras</h3>
        <div className="grid grid-cols-2 gap-3">
          {cameras.map((camera, i) => (
            <motion.button
              key={camera.id}
              onClick={() => handleCameraSwitch(i)}
              whileTap={{ scale: 0.98 }}
              className={`relative h-32 rounded-xl overflow-hidden border-2 transition-colors ${
                selectedCamera === i && !showGrid ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200'
              }`}
            >
              {/* Camera Preview */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />

              {/* Camera Info */}
              <div className="absolute top-2 left-2 right-2">
                <div className="bg-white/95 backdrop-blur-sm rounded px-2 py-1 border border-gray-200">
                  <div className="text-black text-xs font-medium truncate">{camera.location}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">CAM {camera.id}</span>
                    <span className={`flex items-center gap-1 text-xs ${
                      camera.status === 'active' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        camera.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      {camera.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Alert Badge */}
              {camera.alert && (
                <div className="absolute bottom-2 left-2 right-2 bg-red-500 rounded px-2 py-1">
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-white" />
                    <span className="text-xs text-white font-bold">AI ALERT</span>
                  </div>
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
