import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo, useCallback } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
  minDuration?: number;
}

// Cyberpunk city buildings silhouette
function CityBuildings() {
  const buildings = useMemo(() => [
    { x: 0, w: 60, h: 280, delay: 0 },
    { x: 55, w: 40, h: 320, delay: 0.1 },
    { x: 90, w: 70, h: 400, delay: 0.15 },
    { x: 155, w: 50, h: 350, delay: 0.2 },
    { x: 200, w: 80, h: 450, delay: 0.25 },
    { x: 275, w: 45, h: 380, delay: 0.3 },
    { x: 315, w: 65, h: 500, delay: 0.35 },
    { x: 375, w: 55, h: 420, delay: 0.4 },
    { x: 425, w: 90, h: 550, delay: 0.45 },
    { x: 510, w: 50, h: 380, delay: 0.5 },
    { x: 555, w: 75, h: 480, delay: 0.55 },
    { x: 625, w: 60, h: 350, delay: 0.6 },
    { x: 680, w: 85, h: 520, delay: 0.65 },
    { x: 760, w: 55, h: 400, delay: 0.7 },
    { x: 810, w: 70, h: 460, delay: 0.75 },
    { x: 875, w: 45, h: 320, delay: 0.8 },
    { x: 915, w: 80, h: 440, delay: 0.85 },
    { x: 990, w: 60, h: 380, delay: 0.9 },
  ], []);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[60vh] overflow-hidden">
      <svg className="absolute bottom-0 w-full h-full" preserveAspectRatio="xMidYMax slice" viewBox="0 0 1050 550">
        <defs>
          <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--neon-purple))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="windowGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--neon-cyan))" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(var(--neon-cyan))" stopOpacity="0.3" />
          </linearGradient>
          <filter id="neonGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {buildings.map((b, i) => (
          <motion.g key={i}
            initial={{ y: 600, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: b.delay + 1, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <rect
              x={b.x}
              y={550 - b.h}
              width={b.w}
              height={b.h}
              fill="url(#buildingGradient)"
              stroke="hsl(var(--neon-cyan))"
              strokeWidth="0.5"
              strokeOpacity="0.3"
            />
            {/* Windows */}
            {Array.from({ length: Math.floor(b.h / 25) }).map((_, wi) => (
              Array.from({ length: Math.floor(b.w / 15) }).map((_, wj) => (
                <motion.rect
                  key={`${wi}-${wj}`}
                  x={b.x + 5 + wj * 15}
                  y={550 - b.h + 10 + wi * 25}
                  width="8"
                  height="12"
                  fill={Math.random() > 0.4 ? "url(#windowGlow)" : "hsl(var(--muted))"}
                  opacity={Math.random() * 0.5 + 0.3}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: Math.random() > 0.3 ? [0.3, 1, 0.3] : 0.2 }}
                  transition={{ 
                    delay: b.delay + 1.5 + Math.random() * 0.5,
                    duration: 2 + Math.random() * 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
              ))
            ))}
          </motion.g>
        ))}
      </svg>
    </div>
  );
}

// Flying cars/vehicles in the sky
function FlyingVehicles() {
  const vehicles = useMemo(() => 
    Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      y: 15 + Math.random() * 35,
      speed: 4 + Math.random() * 6,
      delay: Math.random() * 3,
      size: 20 + Math.random() * 30,
      direction: Math.random() > 0.5 ? 1 : -1,
      color: ['var(--neon-cyan)', 'var(--neon-pink)', 'var(--neon-purple)'][Math.floor(Math.random() * 3)],
    })), []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {vehicles.map((v) => (
        <motion.div
          key={v.id}
          initial={{ 
            x: v.direction === 1 ? '-10%' : '110%',
            y: `${v.y}%`,
          }}
          animate={{ 
            x: v.direction === 1 ? '110%' : '-10%',
          }}
          transition={{
            duration: v.speed,
            repeat: Infinity,
            delay: v.delay + 2,
            ease: "linear"
          }}
          className="absolute"
          style={{ filter: `drop-shadow(0 0 10px hsl(${v.color}))` }}
        >
          <div 
            className="rounded-full"
            style={{
              width: v.size,
              height: v.size / 3,
              background: `linear-gradient(90deg, transparent, hsl(${v.color}), transparent)`,
            }}
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2"
            style={{
              left: v.direction === 1 ? -v.size : v.size,
              width: v.size * 2,
              height: 2,
              background: `linear-gradient(${v.direction === 1 ? '90deg' : '270deg'}, hsl(${v.color}), transparent)`,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

// Digital rain with Japanese characters
function DigitalRain() {
  const columns = useMemo(() => 
    Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: (i / 30) * 100,
      chars: '01アイウエオカキクケコサシスセソ<>{}[]'.split(''),
      speed: 4 + Math.random() * 6,
      delay: Math.random() * 3,
      opacity: 0.1 + Math.random() * 0.2,
    })), []
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      {columns.map((col) => (
        <motion.div
          key={col.id}
          initial={{ y: '-100%' }}
          animate={{ y: '100vh' }}
          transition={{
            duration: col.speed,
            repeat: Infinity,
            delay: col.delay,
            ease: "linear"
          }}
          className="absolute font-mono text-xs flex flex-col gap-1"
          style={{ 
            left: `${col.x}%`,
            opacity: col.opacity,
            color: 'hsl(var(--neon-cyan))',
            textShadow: '0 0 8px hsl(var(--neon-cyan))',
          }}
        >
          {col.chars.map((char, i) => (
            <span key={i} style={{ opacity: 1 - i * 0.05 }}>{char}</span>
          ))}
        </motion.div>
      ))}
    </div>
  );
}

// Scanning line effect
function ScanLines() {
  return (
    <>
      <motion.div
        initial={{ top: '-10%' }}
        animate={{ top: '110%' }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-[2px] pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, hsl(var(--neon-cyan) / 0.8), transparent)',
          boxShadow: '0 0 20px 5px hsl(var(--neon-cyan) / 0.5)',
        }}
      />
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--neon-cyan) / 0.1) 2px, hsl(var(--neon-cyan) / 0.1) 4px)',
        }}
      />
    </>
  );
}

// Holographic grid floor
function HolographicGrid() {
  return (
    <motion.div
      initial={{ opacity: 0, rotateX: 0 }}
      animate={{ opacity: 1, rotateX: 60 }}
      transition={{ delay: 0.5, duration: 1 }}
      className="absolute bottom-0 left-0 right-0 h-[40vh]"
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
      }}
    >
      <motion.div
        animate={{ backgroundPosition: ['0px 0px', '0px 50px'] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(90deg, hsl(var(--neon-cyan) / 0.1) 1px, transparent 1px),
            linear-gradient(0deg, hsl(var(--neon-cyan) / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: 'rotateX(60deg)',
          transformOrigin: 'bottom',
          maskImage: 'linear-gradient(to top, white 50%, transparent 100%)',
        }}
      />
    </motion.div>
  );
}

// Neon sign flicker effect
function NeonSign({ text, className = '' }: { text: string; className?: string }) {
  return (
    <motion.div
      animate={{
        textShadow: [
          '0 0 10px hsl(var(--neon-pink)), 0 0 20px hsl(var(--neon-pink)), 0 0 30px hsl(var(--neon-pink))',
          '0 0 5px hsl(var(--neon-pink)), 0 0 10px hsl(var(--neon-pink))',
          '0 0 10px hsl(var(--neon-pink)), 0 0 20px hsl(var(--neon-pink)), 0 0 40px hsl(var(--neon-pink)), 0 0 80px hsl(var(--neon-pink))',
          '0 0 10px hsl(var(--neon-pink)), 0 0 20px hsl(var(--neon-pink)), 0 0 30px hsl(var(--neon-pink))',
        ],
        opacity: [1, 0.8, 1, 0.9, 1],
      }}
      transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
      className={`text-[hsl(var(--neon-pink))] ${className}`}
    >
      {text}
    </motion.div>
  );
}

// Glitch text effect
function GlitchText({ text, className = '' }: { text: string; className?: string }) {
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 200);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <span className="relative z-10">{text}</span>
      {glitching && (
        <>
          <span 
            className="absolute top-0 left-0 text-[hsl(var(--neon-cyan))] opacity-80"
            style={{ transform: 'translate(-2px, -1px)', clipPath: 'inset(20% 0 40% 0)' }}
          >
            {text}
          </span>
          <span 
            className="absolute top-0 left-0 text-[hsl(var(--neon-pink))] opacity-80"
            style={{ transform: 'translate(2px, 1px)', clipPath: 'inset(60% 0 10% 0)' }}
          >
            {text}
          </span>
        </>
      )}
    </div>
  );
}

// Particles floating up
function FloatingParticles() {
  const particles = useMemo(() => 
    Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      duration: 4 + Math.random() * 6,
      delay: Math.random() * 4,
      color: ['var(--neon-cyan)', 'var(--neon-pink)', 'var(--neon-purple)'][Math.floor(Math.random() * 3)],
    })), []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ 
            x: `${p.x}vw`, 
            y: '100vh',
            opacity: 0,
            scale: 0 
          }}
          animate={{ 
            y: '-10vh',
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear"
          }}
          className="absolute rounded-full"
          style={{ 
            width: p.size, 
            height: p.size,
            background: `hsl(${p.color})`,
            boxShadow: `0 0 ${p.size * 3}px hsl(${p.color})` 
          }}
        />
      ))}
    </div>
  );
}

// Main loading component
export function LoadingScreen({ onComplete, minDuration = 4000 }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'init' | 'scan' | 'connect' | 'enter'>('init');
  const [loadingText, setLoadingText] = useState('SYSTEM BOOT');

  const loadingStages = useMemo(() => [
    { text: 'SYSTEM BOOT', phase: 'init' as const },
    { text: 'NEURAL LINK', phase: 'init' as const },
    { text: 'SCANNING GRID', phase: 'scan' as const },
    { text: 'CITY SYNC', phase: 'connect' as const },
    { text: 'ENTERING NEON DISTRICT', phase: 'enter' as const },
    { text: 'WELCOME', phase: 'enter' as const },
  ], []);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / minDuration) * 100, 100);
      setProgress(newProgress);

      const stageIndex = Math.min(
        Math.floor(newProgress / (100 / loadingStages.length)),
        loadingStages.length - 1
      );
      setLoadingText(loadingStages[stageIndex].text);
      setPhase(loadingStages[stageIndex].phase);

      if (newProgress >= 100) {
        clearInterval(interval);
        setTimeout(onComplete, 800);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [minDuration, onComplete, loadingStages]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        scale: 1.2,
        filter: 'blur(20px) brightness(2)',
      }}
      transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
      className="fixed inset-0 z-[100] bg-[hsl(var(--background))] flex items-center justify-center overflow-hidden"
    >
      {/* Deep background gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 0%, hsl(var(--neon-purple) / 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 50%, hsl(var(--neon-cyan) / 0.1) 0%, transparent 40%),
            radial-gradient(ellipse at 20% 80%, hsl(var(--neon-pink) / 0.1) 0%, transparent 40%),
            hsl(var(--background))
          `,
        }}
      />

      {/* Effects layers */}
      <DigitalRain />
      <FloatingParticles />
      <ScanLines />
      
      <AnimatePresence>
        {phase === 'enter' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <HolographicGrid />
            <CityBuildings />
            <FlyingVehicles />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-4">
        {/* Animated logo hexagon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 100, 
            damping: 15,
            delay: 0.2 
          }}
          className="relative mb-8"
        >
          {/* Outer rotating ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-8"
          >
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <defs>
                <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--neon-cyan))" />
                  <stop offset="50%" stopColor="hsl(var(--neon-purple))" />
                  <stop offset="100%" stopColor="hsl(var(--neon-pink))" />
                </linearGradient>
              </defs>
              <circle 
                cx="100" cy="100" r="95" 
                fill="none" 
                stroke="url(#ringGradient)" 
                strokeWidth="1"
                strokeDasharray="20 10"
                opacity="0.6"
              />
            </svg>
          </motion.div>

          {/* Pulsing glow */}
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -inset-6 rounded-full blur-2xl"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--neon-cyan) / 0.5), hsl(var(--neon-purple) / 0.5), hsl(var(--neon-pink) / 0.5))',
            }}
          />
          
          {/* Hexagon container */}
          <div 
            className="relative w-32 h-32 flex items-center justify-center"
            style={{
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              background: 'linear-gradient(135deg, hsl(var(--card)), hsl(var(--background)))',
              boxShadow: 'inset 0 0 30px hsl(var(--neon-cyan) / 0.2)',
            }}
          >
            <motion.div
              animate={{ 
                textShadow: [
                  '0 0 20px hsl(var(--neon-cyan))',
                  '0 0 40px hsl(var(--neon-cyan)), 0 0 60px hsl(var(--neon-purple))',
                  '0 0 20px hsl(var(--neon-cyan))',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl font-bold text-[hsl(var(--neon-cyan))]"
            >
              {'</>'}
            </motion.div>
          </div>

          {/* Corner accents */}
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <motion.div
              key={angle}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: angle / 360 }}
              className="absolute w-2 h-2 rounded-full bg-[hsl(var(--neon-cyan))]"
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${angle}deg) translate(70px) rotate(-${angle}deg)`,
                boxShadow: '0 0 10px hsl(var(--neon-cyan))',
              }}
            />
          ))}
        </motion.div>

        {/* Title with glitch effect */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mb-2"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
            <GlitchText 
              text="CODE" 
              className="text-foreground inline-block"
            />
            <span className="bg-gradient-to-r from-[hsl(var(--neon-cyan))] via-[hsl(var(--neon-purple))] to-[hsl(var(--neon-pink))] bg-clip-text text-transparent">
              CRAFT
            </span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mb-10"
        >
          <NeonSign text="// NEON DISTRICT //" className="text-sm md:text-base font-mono tracking-[0.3em]" />
        </motion.div>

        {/* Progress container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="w-80 md:w-96 space-y-4"
        >
          {/* Progress bar with cyberpunk styling */}
          <div className="relative">
            {/* Background track */}
            <div 
              className="h-1 rounded-full overflow-hidden"
              style={{
                background: 'hsl(var(--muted))',
                boxShadow: 'inset 0 0 10px hsl(var(--background))',
              }}
            >
              {/* Progress fill */}
              <motion.div
                className="h-full rounded-full relative overflow-hidden"
                style={{ 
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, hsl(var(--neon-cyan)), hsl(var(--neon-purple)), hsl(var(--neon-pink)))',
                }}
              >
                {/* Shimmer */}
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                />
              </motion.div>
            </div>
            
            {/* Glow effect */}
            <motion.div
              className="absolute top-0 left-0 h-1 rounded-full blur-sm"
              style={{ 
                width: `${progress}%`,
                background: 'linear-gradient(90deg, hsl(var(--neon-cyan)), hsl(var(--neon-purple)), hsl(var(--neon-pink)))',
                opacity: 0.6
              }}
            />

            {/* End marker */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-[hsl(var(--neon-cyan))]"
              style={{ 
                left: `calc(${progress}% - 6px)`,
                boxShadow: '0 0 10px hsl(var(--neon-cyan))',
                background: progress >= 100 ? 'hsl(var(--neon-cyan))' : 'transparent',
              }}
            />
          </div>

          {/* Status display */}
          <div className="flex justify-between items-center font-mono text-xs">
            <motion.div 
              key={loadingText}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[hsl(var(--neon-cyan))] tracking-wider flex items-center gap-2"
            >
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                {'>'}
              </motion.span>
              {loadingText}
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                _
              </motion.span>
            </motion.div>
            <span 
              className="font-bold tracking-wider"
              style={{
                color: 'hsl(var(--neon-pink))',
                textShadow: '0 0 10px hsl(var(--neon-pink))',
              }}
            >
              {Math.round(progress)}%
            </span>
          </div>

          {/* System status indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="flex justify-center gap-6 text-[10px] font-mono text-muted-foreground"
          >
            {['NEURAL', 'GRID', 'SYNC'].map((label, i) => (
              <div key={label} className="flex items-center gap-1">
                <motion.div
                  animate={{
                    backgroundColor: progress > (i + 1) * 30 
                      ? 'hsl(var(--neon-cyan))' 
                      : 'hsl(var(--muted))',
                    boxShadow: progress > (i + 1) * 30 
                      ? '0 0 8px hsl(var(--neon-cyan))' 
                      : 'none',
                  }}
                  className="w-1.5 h-1.5 rounded-full"
                />
                <span className="tracking-wider">{label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Corner HUD elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute top-6 left-6 font-mono text-[10px] text-[hsl(var(--neon-cyan))] tracking-wider"
      >
        <div className="opacity-60">SYS://CODECRAFT</div>
        <div className="opacity-40">NODE_VER:2.0.26</div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="absolute top-6 right-6 font-mono text-[10px] text-[hsl(var(--neon-pink))] tracking-wider text-right"
      >
        <motion.div 
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="flex items-center gap-1 justify-end"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--neon-pink))]" 
            style={{ boxShadow: '0 0 6px hsl(var(--neon-pink))' }}
          />
          LIVE
        </motion.div>
        <div className="opacity-40">LAT:55.7558</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="absolute bottom-6 left-6 font-mono text-[10px] text-muted-foreground tracking-wider"
      >
        <div>PLATFORM:MOKSHUB</div>
        <div className="opacity-60">DISTRICT:NEON_CENTRAL</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="absolute bottom-6 right-6 font-mono text-[10px] text-muted-foreground tracking-wider text-right"
      >
        <motion.div
          animate={{ 
            content: ['2077', '2078', '2077'],
          }}
        >
          YEAR:2077
        </motion.div>
        <div className="opacity-60">SEC_LVL:ALPHA</div>
      </motion.div>
    </motion.div>
  );
}
