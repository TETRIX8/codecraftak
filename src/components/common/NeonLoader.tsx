import { motion } from 'framer-motion';

interface NeonLoaderProps {
  label?: string;
  fullscreen?: boolean;
}

/** Branded MOKSUHUB loading animation used across the whole app. */
export function NeonLoader({ label = 'ЗАГРУЗКА', fullscreen = true }: NeonLoaderProps) {
  return (
    <div
      className={
        fullscreen
          ? 'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/90 backdrop-blur-xl'
          : 'flex flex-col items-center justify-center py-16'
      }
    >
      {/* Animated grid backdrop */}
      {fullscreen && <div className="absolute inset-0 neon-grid opacity-30 pointer-events-none" />}

      <div className="relative w-28 h-28">
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: 'hsl(var(--neon-cyan))',
            borderRightColor: 'hsl(var(--neon-purple))',
            boxShadow: '0 0 25px hsl(var(--neon-cyan) / 0.5)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
        />
        {/* Inner ring */}
        <motion.div
          className="absolute inset-4 rounded-full border-2 border-transparent"
          style={{
            borderBottomColor: 'hsl(var(--neon-pink))',
            borderLeftColor: 'hsl(var(--neon-cyan))',
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
        />
        {/* Pulsing core */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="font-mono text-xs font-bold tracking-widest gradient-text">M//H</span>
        </motion.div>
      </div>

      {/* Wordmark */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 text-2xl font-extrabold tracking-tight"
      >
        <span className="text-foreground">MOKSU</span>
        <span className="gradient-text">HUB</span>
      </motion.div>

      {/* Progress shimmer */}
      <div className="mt-4 h-[2px] w-48 overflow-hidden rounded-full bg-border/60">
        <motion.div
          className="h-full w-1/3 rounded-full"
          style={{
            background:
              'linear-gradient(90deg, transparent, hsl(var(--neon-cyan)), hsl(var(--neon-pink)), transparent)',
          }}
          animate={{ x: ['-120%', '360%'] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.2, repeat: Infinity }}
        className="mt-3 font-mono text-[11px] tracking-[0.35em] text-[hsl(var(--neon-cyan))]"
      >
        {label}
      </motion.div>
    </div>
  );
}
