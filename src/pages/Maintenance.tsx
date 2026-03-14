import { motion } from 'framer-motion';

export default function Maintenance() {
  const videoId = '115bP8b7RKSSW-YeQ_aD8FYwnFbvbB4kL';

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-black">
      {/* Video Background - Google Drive iframe */}
      <div className="absolute inset-[-100px] sm:inset-[-50px]">
        <iframe
          src={`https://drive.google.com/file/d/${videoId}/preview?autoplay=1`}
          className="w-full h-full border-none"
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          style={{ pointerEvents: 'none' }}
        />
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} className="absolute top-4 sm:top-8 left-4 sm:left-8 text-red-500 font-mono text-xs sm:text-sm z-20">
        [OFFLINE]
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} className="absolute top-4 sm:top-8 right-4 sm:right-8 text-red-500 font-mono text-xs sm:text-sm z-20">
        [SYSTEM HALT]
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 text-white/30 font-mono text-xs z-20">
        MoksHub // CodeCraft
      </motion.div>
    </div>
  );
}
