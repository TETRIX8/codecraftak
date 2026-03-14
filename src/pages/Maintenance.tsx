import { motion } from 'framer-motion';

export default function Maintenance() {
  // Convert Google Drive link to embeddable format
  const videoId = '115bP8b7RKSSW-YeQ_aD8FYwnFbvbB4kL';
  const videoUrl = `https://drive.google.com/file/d/${videoId}/preview`;

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-black">
      {/* Video Background using iframe for Google Drive */}
      <div className="absolute inset-0 w-full h-full">
        <iframe
          src={videoUrl}
          className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 scale-150 pointer-events-none"
          style={{
            border: 'none',
          }}
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </div>

      {/* Dark overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Glitch effect overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            opacity: [0, 0.03, 0, 0.05, 0],
            x: [0, -5, 5, -3, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatDelay: 3,
          }}
          className="absolute inset-0 bg-red-500"
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Animated text */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="text-center"
        >
          {/* Main title with glitch effect */}
          <motion.h1
            className="text-6xl sm:text-8xl md:text-9xl font-black text-white mb-8 tracking-tighter relative"
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
              animate={{
                x: [0, -3, 3, -1, 0],
                opacity: [1, 0.8, 1, 0.9, 1],
              }}
              transition={{
                duration: 0.3,
                repeat: Infinity,
                repeatDelay: 4,
              }}
              className="relative inline-block"
            >
              <span className="relative z-10">САЙТ УМЕР</span>
              {/* Glitch layers */}
              <motion.span
                className="absolute inset-0 text-red-500 z-0"
                animate={{
                  x: [0, 2, -2, 0],
                  opacity: [0, 0.7, 0.7, 0],
                }}
                transition={{
                  duration: 0.2,
                  repeat: Infinity,
                  repeatDelay: 5,
                }}
              >
                САЙТ УМЕР
              </motion.span>
              <motion.span
                className="absolute inset-0 text-cyan-500 z-0"
                animate={{
                  x: [0, -2, 2, 0],
                  opacity: [0, 0.7, 0.7, 0],
                }}
                transition={{
                  duration: 0.2,
                  repeat: Infinity,
                  repeatDelay: 5,
                  delay: 0.1,
                }}
              >
                САЙТ УМЕР
              </motion.span>
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <motion.p
              className="text-3xl sm:text-5xl md:text-6xl font-bold text-white/90"
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              А-К ОТДЫХАЕТ
            </motion.p>
          </motion.div>

          {/* Decorative elements */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-12 h-1 w-64 sm:w-96 mx-auto bg-gradient-to-r from-transparent via-red-500 to-transparent"
          />

          {/* Pulsing dot */}
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mt-8 w-4 h-4 mx-auto rounded-full bg-red-500 shadow-[0_0_20px_rgba(255,0,0,0.8)]"
          />
        </motion.div>

        {/* Scanlines effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)',
          }}
        />
      </div>

      {/* Corner decorations */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        className="absolute top-8 left-8 text-red-500 font-mono text-sm"
      >
        [OFFLINE]
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        className="absolute top-8 right-8 text-red-500 font-mono text-sm"
      >
        [SYSTEM HALT]
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        className="absolute bottom-8 left-8 text-white/30 font-mono text-xs"
      >
        MoksHub // CodeCraft
      </motion.div>
    </div>
  );
}
