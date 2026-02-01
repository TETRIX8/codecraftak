import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
  minDuration?: number;
}

// Particle system for beautiful effects
function ParticleField() {
  const particles = useMemo(() => 
    Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 2,
    })), []
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ 
            x: `${p.x}vw`, 
            y: `${p.y}vh`,
            opacity: 0,
            scale: 0 
          }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            y: [`${p.y}vh`, `${p.y - 20}vh`]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut"
          }}
          className="absolute rounded-full bg-primary"
          style={{ 
            width: p.size, 
            height: p.size,
            boxShadow: `0 0 ${p.size * 2}px hsl(var(--primary))` 
          }}
        />
      ))}
    </div>
  );
}

// Matrix rain effect
function MatrixRain() {
  const columns = useMemo(() => 
    Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: (i / 20) * 100,
      chars: ['0', '1', '<', '>', '/', '{', '}', '(', ')', '=', '+', '-', '*', '&', '|'],
      speed: 2 + Math.random() * 3,
      delay: Math.random() * 2,
    })), []
  );

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
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
          className="absolute font-mono text-xs text-primary flex flex-col gap-2"
          style={{ left: `${col.x}%` }}
        >
          {col.chars.map((char, i) => (
            <span key={i} style={{ opacity: 1 - i * 0.06 }}>{char}</span>
          ))}
        </motion.div>
      ))}
    </div>
  );
}

// Hexagon grid pattern
function HexagonGrid() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.05 }}
      transition={{ duration: 1 }}
      className="absolute inset-0"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%2322d3ee' fill-opacity='1'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    />
  );
}

export function LoadingScreen({ onComplete, minDuration = 3000 }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Инициализация системы');

  const loadingStages = useMemo(() => [
    'Инициализация системы',
    'Загрузка модулей',
    'Подключение к серверу',
    'Синхронизация данных',
    'Подготовка интерфейса',
    'Почти готово...'
  ], []);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / minDuration) * 100, 100);
      setProgress(newProgress);

      // Update loading text based on progress
      const stageIndex = Math.min(
        Math.floor(newProgress / (100 / loadingStages.length)),
        loadingStages.length - 1
      );
      setLoadingText(loadingStages[stageIndex]);

      if (newProgress >= 100) {
        clearInterval(interval);
        setTimeout(onComplete, 500);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [minDuration, onComplete, loadingStages]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        scale: 1.1,
        filter: 'blur(10px)'
      }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-hidden"
    >
      {/* Background effects */}
      <HexagonGrid />
      <MatrixRain />
      <ParticleField />

      {/* Animated gradient background */}
      <motion.div
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, hsl(var(--accent) / 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 80%, hsl(var(--primary) / 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.15) 0%, transparent 50%)',
          ]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0"
      />

      {/* Rotating rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute w-[500px] h-[500px] rounded-full border border-primary/10"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute w-[400px] h-[400px] rounded-full border border-accent/10"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute w-[300px] h-[300px] rounded-full border border-primary/20"
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 150, 
            damping: 15,
            delay: 0.2 
          }}
          className="relative mb-10"
        >
          {/* Pulsing glow */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -inset-8 bg-gradient-to-r from-primary to-accent rounded-full blur-3xl"
          />
          
          {/* Rotating border */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-1 rounded-3xl"
            style={{
              background: 'conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))',
            }}
          />
          
          {/* Logo container */}
          <div className="relative w-36 h-36 rounded-3xl bg-background flex items-center justify-center">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                textShadow: [
                  '0 0 30px hsl(var(--primary))',
                  '0 0 60px hsl(var(--primary))',
                  '0 0 30px hsl(var(--primary))'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl font-bold gradient-text"
            >
              {'</>'}
            </motion.div>
          </div>
        </motion.div>

        {/* Animated title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mb-3"
        >
          <h1 className="text-6xl md:text-7xl font-bold tracking-tighter">
            <motion.span
              animate={{ 
                color: ['hsl(var(--foreground))', 'hsl(var(--primary))', 'hsl(var(--foreground))']
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Code
            </motion.span>
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                opacity: { delay: 0.8, duration: 0.3 },
                scale: { delay: 0.8, type: "spring" },
                rotate: { delay: 1.2, duration: 0.5, repeat: Infinity, repeatDelay: 2 }
              }}
              className="inline-block mx-3 text-warning"
            >
              ⚡
            </motion.span>
            <span className="gradient-text">Craft</span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-muted-foreground text-xl mb-8 font-medium"
        >
          MoksHub Platform
        </motion.p>

        {/* Progress container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="w-80 space-y-4"
        >
          {/* Progress bar */}
          <div className="relative">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full relative overflow-hidden"
                style={{ 
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))'
                }}
              >
                {/* Shimmer effect */}
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
              </motion.div>
            </div>
            
            {/* Glow under progress */}
            <motion.div
              className="absolute top-0 left-0 h-2 rounded-full blur-md"
              style={{ 
                width: `${progress}%`,
                background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))',
                opacity: 0.5
              }}
            />
          </div>

          {/* Progress info */}
          <div className="flex justify-between items-center text-sm">
            <motion.span 
              key={loadingText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-muted-foreground"
            >
              {loadingText}
            </motion.span>
            <span className="font-mono text-primary font-bold">
              {Math.round(progress)}%
            </span>
          </div>
        </motion.div>

        {/* Loading dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-8 flex gap-3"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
                backgroundColor: [
                  'hsl(var(--primary))',
                  'hsl(var(--accent))',
                  'hsl(var(--primary))'
                ]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.15
              }}
              className="w-2 h-2 rounded-full"
            />
          ))}
        </motion.div>
      </div>

      {/* Corner decorations */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute top-8 left-8 text-primary/30 font-mono text-sm"
      >
        {'// initializing...'}
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="absolute bottom-8 right-8 text-primary/30 font-mono text-sm"
      >
        v2.0.0
      </motion.div>
    </motion.div>
  );
}
