import { useState } from 'react';
import { Image, Video, Mic, X } from 'lucide-react';

interface Evidence {
  url: string;
  type: 'photo' | 'video' | 'voice';
}

export function EvidenceViewer({ evidence }: { evidence?: Evidence[] }) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (!evidence || evidence.length === 0) return null;

  return (
    <>
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">📎 Evidence ({evidence.length})</p>
        <div className="flex gap-2 flex-wrap">
          {evidence.map((e, i) => (
            <div key={i} className="relative">
              {e.type === 'photo' ? (
                <img
                  src={e.url}
                  alt={`Evidence ${i + 1}`}
                  className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200 cursor-pointer hover:border-blue-400 transition-all hover:scale-105"
                  onClick={() => setLightbox(e.url)}
                />
              ) : e.type === 'video' ? (
                <div className="relative">
                  <video
                    src={e.url}
                    className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200 cursor-pointer"
                    onClick={() => setLightbox(e.url)}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-8 h-8 bg-black/60 rounded-full flex items-center justify-center">
                      <Video className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl bg-purple-50 border-2 border-purple-200 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-100 transition-all"
                  onClick={() => {
                    const audio = new Audio(e.url);
                    audio.play();
                  }}>
                  <Mic className="w-5 h-5 text-purple-500" />
                  <span className="text-[9px] text-purple-400 mt-1 font-bold">Play</span>
                </div>
              )}
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-white border border-gray-200 rounded-full flex items-center justify-center text-[8px]">
                {e.type === 'photo' ? '📸' : e.type === 'video' ? '🎥' : '🎤'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox for full view */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center z-10">
            <X className="w-5 h-5" />
          </button>
          {lightbox.startsWith('data:video') || lightbox.includes('.mp4') || lightbox.includes('.webm') ? (
            <video src={lightbox} controls autoPlay className="max-w-full max-h-[80vh] rounded-2xl" onClick={e => e.stopPropagation()} />
          ) : (
            <img src={lightbox} alt="Evidence" className="max-w-full max-h-[80vh] rounded-2xl object-contain" onClick={e => e.stopPropagation()} />
          )}
        </div>
      )}
    </>
  );
}
