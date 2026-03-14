import { motion } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function Maintenance() {
  const videoId = '115bP8b7RKSSW-YeQ_aD8FYwnFbvbB4kL';
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [showUnmute, setShowUnmute] = useState(true);

  // Try to autoplay muted first (browsers allow this), then offer unmute
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.play().catch(() => {});
    // Hide unmute hint after 8 seconds
    const timer = setTimeout(() => setShowUnmute(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !muted;
    video.muted = next;
    setMuted(next);
    if (!next) video.play().catch(() => {});
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-black" onClick={toggleMute}>
      {/* Video Background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src={`https://drive.google.com/uc?export=download&id=${videoId}`}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Unmute button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showUnmute || muted ? 1 : 0.4, y: 0 }}
        onClick={(e) => { e.stopPropagation(); toggleMute(); }}
        className="absolute bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all"
      >
        {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        {muted ? 'Включить звук' : 'Выключить звук'}
      </motion.button>

      {/* Glitch effect overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ opacity: [0, 0.03, 0, 0.05, 0], x: [0, -5, 5, -3, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
          className="absolute inset-0 bg-red-500"
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="text-center"
        >
          <motion.h1
            className="text-5xl sm:text-7xl md:text-9xl font-black text-white mb-6 sm:mb-8 tracking-tighter relative"
            animate={{
              textShadow: [
                '0 0 0px transparent',
                '0 0 40px rgba(255, 0, 0, 0.8), 0 0 80px rgba(255, 0, 0, 0.4)',
                '0 0 0px transparent',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.span
              animate={{ x: [0, -3, 3, -1, 0], opacity: [1, 0.8, 1, 0.9, 1] }}
              transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 4 }}
              className="relative inline-block"
            >
              <span className="relative z-10">САЙТ УМЕР</span>
              <motion.span
                className="absolute inset-0 text-red-500 z-0"
                animate={{ x: [0, 2, -2, 0], opacity: [0, 0.7, 0.7, 0] }}
                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 5 }}
              >
                САЙТ УМЕР
              </motion.span>
              <motion.span
                className="absolute inset-0 text-cyan-500 z-0"
                animate={{ x: [0, -2, 2, 0], opacity: [0, 0.7, 0.7, 0] }}
                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 5, delay: 0.1 }}
              >
                САЙТ УМЕР
              </motion.span>
            </motion.span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <motion.p
              className="text-2xl sm:text-4xl md:text-6xl font-bold text-white/90"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              А-К ОТДЫХАЕТ
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-8 sm:mt-12 h-1 w-48 sm:w-96 mx-auto bg-gradient-to-r from-transparent via-red-500 to-transparent"
          />

          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mt-6 sm:mt-8 w-4 h-4 mx-auto rounded-full bg-red-500 shadow-[0_0_20px_rgba(255,0,0,0.8)]"
          />
        </motion.div>

        {/* Scanlines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)',
          }}
        />
      </div>

      {/* Corners */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} className="absolute top-4 sm:top-8 left-4 sm:left-8 text-red-500 font-mono text-xs sm:text-sm">
        [OFFLINE]
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} className="absolute top-4 sm:top-8 right-4 sm:right-8 text-red-500 font-mono text-xs sm:text-sm">
        [SYSTEM HALT]
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 text-white/30 font-mono text-xs">
        MoksHub // CodeCraft
      </motion.div>
    </div>
  );
}
