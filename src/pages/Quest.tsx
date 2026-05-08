import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CosmicBackground } from '@/components/common/CosmicBackground';
import { Lock, Star, Skull, Flame, Cross, Bone, Check, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// 10 graves/tombs with positions across a cursed graveyard
type GraveKind = 'tombstone' | 'cross' | 'mausoleum' | 'skull_pile' | 'crypt' | 'bone_altar' | 'death_tree' | 'grave_hand' | 'portal' | 'throne';

interface Grave {
  id: number;
  x: number;
  y: number;
  kind: GraveKind;
  size: number;
}

const GRAVES: Grave[] = [
  { id: 1,  x: 10, y: 20, kind: 'tombstone',   size: 1.0 },
  { id: 2,  x: 28, y: 15, kind: 'cross',       size: 1.1 },
  { id: 3,  x: 46, y: 22, kind: 'skull_pile',  size: 0.95 },
  { id: 4,  x: 64, y: 16, kind: 'bone_altar',  size: 1.05 },
  { id: 5,  x: 85, y: 30, kind: 'crypt',       size: 1.1 },
  { id: 6,  x: 76, y: 55, kind: 'death_tree',  size: 1.0 },
  { id: 7,  x: 56, y: 62, kind: 'grave_hand',  size: 0.9 },
  { id: 8,  x: 38, y: 68, kind: 'mausoleum',   size: 1.15 },
  { id: 9,  x: 20, y: 60, kind: 'portal',      size: 1.0 },
  { id: 10, x: 8,  y: 82, kind: 'throne',      size: 1.2 },
];

// SVG Icons for grave types
function TombstoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 22V10C6 6 8 4 12 4C16 4 18 6 18 10V22H6ZM10 12H14V14H10V12ZM10 16H14V18H10V16Z" />
    </svg>
  );
}

function CryptIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 22V8L12 2L22 8V22H2ZM10 12V20H14V12H10ZM4 10V20H8V10H4ZM16 10V20H20V10H16Z" />
    </svg>
  );
}

function GraveHandIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L10 8H8V6C8 5 7 4 6 4C5 4 4 5 4 6V14C4 18 7 22 12 22C17 22 20 18 20 14V8C20 7 19 6 18 6C17 6 16 7 16 8V10H14V4L12 2Z" />
    </svg>
  );
}

function DeathTreeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C12 2 8 6 8 10C8 12 10 14 10 14L8 16L6 14V22H10V18L12 20L14 18V22H18V14L16 16L14 14C14 14 16 12 16 10C16 6 12 2 12 2Z" />
    </svg>
  );
}

function PortalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" fillOpacity="0.3" />
      <circle cx="12" cy="12" r="6" fillOpacity="0.5" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function ThroneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 22V14H3V8L5 4H19L21 8V14H19V22H17V14H7V22H5ZM7 12H17V8H7V12ZM9 6V4H11V6H9ZM13 6V4H15V6H13Z" />
    </svg>
  );
}

const ICON_MAP: Record<GraveKind, any> = {
  tombstone: TombstoneIcon,
  cross: Cross,
  mausoleum: CryptIcon,
  skull_pile: Skull,
  crypt: CryptIcon,
  bone_altar: Bone,
  death_tree: DeathTreeIcon,
  grave_hand: GraveHandIcon,
  portal: PortalIcon,
  throne: ThroneIcon,
};

// Floating ghost particles
function GhostParticles() {
  const ghosts = useMemo(
    () => Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 10 + Math.random() * 20,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 5,
    })),
    []
  );
  return (
    <>
      {ghosts.map((g) => (
        <motion.div
          key={g.id}
          className="absolute pointer-events-none"
          style={{
            left: `${g.x}%`,
            top: `${g.y}%`,
            width: g.size,
            height: g.size * 1.5,
            background: 'radial-gradient(ellipse, rgba(180,255,180,0.3), transparent 70%)',
            filter: 'blur(4px)',
          }}
          animate={{
            y: [-20, -60, -20],
            x: [0, Math.random() * 40 - 20, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: g.duration,
            repeat: Infinity,
            delay: g.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </>
  );
}

// Fog effect
function FogLayer() {
  return (
    <>
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(20,30,20,0.9) 0%, transparent 40%)',
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(100,120,100,0.4), transparent)',
          filter: 'blur(20px)',
        }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Drifting fog patches */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{
            bottom: `${5 + i * 8}%`,
            width: 300 + i * 50,
            height: 60,
            background: 'radial-gradient(ellipse, rgba(80,100,80,0.5), transparent 70%)',
            filter: 'blur(30px)',
          }}
          initial={{ x: '-30%' }}
          animate={{ x: '130%' }}
          transition={{
            duration: 30 + i * 5,
            repeat: Infinity,
            delay: i * 3,
            ease: 'linear',
          }}
        />
      ))}
    </>
  );
}

// Lightning effect
function Lightning({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.8, 1, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.3)' }}
        />
      )}
    </AnimatePresence>
  );
}

// Skeleton walking animation
function WalkingSkeleton({ index }: { index: number }) {
  const startX = index % 2 === 0 ? -10 : 110;
  const endX = index % 2 === 0 ? 110 : -10;
  const y = 75 + (index % 3) * 8;
  
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ top: `${y}%` }}
      initial={{ x: `${startX}%` }}
      animate={{ x: `${endX}%` }}
      transition={{
        duration: 25 + index * 5,
        repeat: Infinity,
        delay: index * 8,
        ease: 'linear',
      }}
    >
      <motion.div
        animate={{ y: [0, -3, 0, -3, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="relative"
      >
        <Skull 
          className="w-6 h-6 text-gray-400" 
          style={{ 
            filter: 'drop-shadow(0 0 5px rgba(150,180,150,0.5))',
            transform: index % 2 === 0 ? 'scaleX(1)' : 'scaleX(-1)',
          }} 
        />
      </motion.div>
    </motion.div>
  );
}

// Flying bats
function FlyingBats() {
  const bats = useMemo(
    () => Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      startY: 10 + Math.random() * 40,
      duration: 8 + Math.random() * 6,
      delay: Math.random() * 10,
      size: 12 + Math.random() * 8,
    })),
    []
  );

  return (
    <>
      {bats.map((bat) => (
        <motion.div
          key={bat.id}
          className="absolute pointer-events-none text-gray-600"
          style={{ top: `${bat.startY}%` }}
          initial={{ x: '-5%' }}
          animate={{ 
            x: '105%',
            y: [0, -20, 10, -15, 0],
          }}
          transition={{
            duration: bat.duration,
            repeat: Infinity,
            delay: bat.delay,
            ease: 'linear',
          }}
        >
          <motion.span
            animate={{ scaleX: [1, 0.3, 1] }}
            transition={{ duration: 0.2, repeat: Infinity }}
            style={{ 
              fontSize: bat.size,
              display: 'block',
              filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.8))',
            }}
          >
            {'W'}
          </motion.span>
        </motion.div>
      ))}
    </>
  );
}

function GraveMarker({ grave, index, onClick, unlocked, completed }: {
  grave: Grave;
  index: number;
  onClick: (g: Grave) => void;
  unlocked: boolean;
  completed?: boolean;
}) {
  const Icon = ICON_MAP[grave.kind];
  const isThrone = grave.kind === 'throne';
  const isPortal = grave.kind === 'portal';

  return (
    <motion.button
      type="button"
      onClick={() => unlocked && onClick(grave)}
      className="absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none"
      style={{ left: `${grave.x}%`, top: `${grave.y}%` }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 + index * 0.1, type: 'spring', bounce: 0.3 }}
      whileHover={unlocked ? { scale: 1.1 } : {}}
      whileTap={unlocked ? { scale: 0.95 } : {}}
    >
      <motion.div
        animate={{ 
          y: [0, -4, 0],
        }}
        transition={{
          duration: 3 + index * 0.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ width: 100 * grave.size, height: 100 * grave.size }}
        className="relative"
      >
        {/* Eerie glow */}
        <motion.div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ 
            background: completed 
              ? 'radial-gradient(circle, rgba(100,255,100,0.4), transparent 70%)'
              : isThrone 
                ? 'radial-gradient(circle, rgba(255,50,50,0.4), transparent 70%)'
                : isPortal
                  ? 'radial-gradient(circle, rgba(150,50,255,0.5), transparent 70%)'
                  : 'radial-gradient(circle, rgba(100,150,100,0.3), transparent 70%)'
          }}
          animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Ground shadow */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 w-[80%] h-4 rounded-full bg-black/60 blur-md"
          style={{ bottom: 0 }}
          animate={{ scaleX: [1, 0.8, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Grave base */}
        <div className="relative w-full h-full flex flex-col items-center justify-end">
          {/* Ground mound */}
          <div
            className="absolute bottom-0 w-[90%] h-[30%] rounded-t-full"
            style={{
              background: 'linear-gradient(180deg, #2a3a2a, #1a251a)',
              boxShadow: 'inset 0 -5px 15px rgba(0,0,0,0.5)',
            }}
          />

          {/* Icon */}
          <div className="relative z-10 mb-4">
            <motion.div
              animate={isPortal ? { rotate: 360 } : {}}
              transition={isPortal ? { duration: 10, repeat: Infinity, ease: 'linear' } : {}}
            >
              <Icon
                className="w-10 h-10"
                style={{ 
                  color: completed 
                    ? '#6f6' 
                    : isThrone 
                      ? '#f44' 
                      : isPortal 
                        ? '#a5f' 
                        : '#8a8',
                  filter: `drop-shadow(0 0 10px ${completed ? 'rgba(100,255,100,0.8)' : isThrone ? 'rgba(255,50,50,0.8)' : 'rgba(100,150,100,0.6)'})`,
                }}
              />
            </motion.div>
          </div>

          {/* Number medallion */}
          <motion.div
            whileHover={unlocked ? { rotate: [0, -5, 5, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
            style={{
              background: unlocked
                ? 'radial-gradient(circle at 30% 30%, #4a5, #253)'
                : 'radial-gradient(circle at 30% 30%, #444, #222)',
              border: '2px solid #1a1a1a',
              boxShadow: unlocked
                ? '0 4px 15px rgba(50,100,50,0.6), inset 0 -2px 5px rgba(0,0,0,0.4)'
                : '0 4px 10px rgba(0,0,0,0.5)',
              color: unlocked ? '#afa' : '#666',
              fontFamily: 'serif',
            }}
          >
            {completed ? (
              <Check className="w-5 h-5" strokeWidth={3} />
            ) : unlocked ? (
              grave.id
            ) : (
              <Lock className="w-4 h-4" />
            )}
          </motion.div>

          {/* Fire for unlocked graves */}
          {unlocked && !completed && (
            <motion.div
              className="absolute -top-2 left-1/2 -translate-x-1/2"
              animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Flame className="w-4 h-4 text-orange-500" style={{ filter: 'drop-shadow(0 0 5px orange)' }} />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Tooltip */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-6 whitespace-nowrap text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur px-2 py-0.5 rounded border border-gray-700">
        Могила {grave.id}
      </div>
    </motion.button>
  );
}

function CursedPathLines() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="cursedPathGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4a5" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#385" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#4a5" stopOpacity="0.5" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {GRAVES.slice(0, -1).map((a, i) => {
        const b = GRAVES[i + 1];
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2 - 4;
        return (
          <motion.path
            key={a.id}
            d={`M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`}
            fill="none"
            stroke="url(#cursedPathGrad)"
            strokeWidth="0.3"
            strokeDasharray="2 2"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5 + i * 0.12, ease: 'easeOut' }}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
}

function ApocalypseIntro({ onDone }: { onDone: () => void }) {
  const [lightningFlash, setLightningFlash] = useState(false);

  useEffect(() => {
    // Lightning flashes
    const flashInterval = setInterval(() => {
      setLightningFlash(true);
      setTimeout(() => setLightningFlash(false), 200);
    }, 2000);

    const t = setTimeout(onDone, 3000);
    return () => {
      clearTimeout(t);
      clearInterval(flashInterval);
    };
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[60] overflow-hidden pointer-events-none"
      style={{
        background: 'radial-gradient(ellipse at center, #1a1a10, #0a0a05)',
      }}
    >
      <Lightning active={lightningFlash} />

      {/* Raining effect */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px bg-gradient-to-b from-transparent via-gray-500 to-transparent"
            style={{
              left: `${Math.random() * 100}%`,
              height: 30 + Math.random() * 50,
            }}
            initial={{ y: '-10%' }}
            animate={{ y: '110%' }}
            transition={{
              duration: 0.4 + Math.random() * 0.3,
              repeat: Infinity,
              delay: Math.random() * 0.5,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Rising skulls */}
      <div className="absolute inset-0 flex items-end justify-center gap-8 pb-20">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: 200, opacity: 0, rotate: -30 + Math.random() * 60 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            transition={{ duration: 1.5, delay: 0.5 + i * 0.2, type: 'spring', bounce: 0.3 }}
          >
            <Skull 
              className="w-12 h-12 text-gray-500" 
              style={{ filter: 'drop-shadow(0 0 10px rgba(100,150,100,0.5))' }}
            />
          </motion.div>
        ))}
      </div>

      {/* Main title */}
      <motion.div
        initial={{ scale: 3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 flex flex-col items-center justify-center"
      >
        <motion.div
          animate={{ 
            textShadow: [
              '0 0 20px #4a5, 0 0 40px #4a5, 0 0 60px #385',
              '0 0 40px #4a5, 0 0 80px #4a5, 0 0 120px #385',
              '0 0 20px #4a5, 0 0 40px #4a5, 0 0 60px #385',
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl md:text-8xl font-black tracking-wider"
          style={{
            color: '#5a6',
            fontFamily: 'serif',
            textShadow: '0 0 30px #4a5, 0 0 60px #4a5',
          }}
        >
          СУДНЫЙ ДЕНЬ
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-gray-500 mt-4 tracking-[0.3em] text-sm uppercase"
        >
          Ожидание неизбежного
        </motion.div>
      </motion.div>

      {/* Ground cracks */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-32"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <svg viewBox="0 0 100 20" className="w-full h-full" preserveAspectRatio="none">
          {[...Array(8)].map((_, i) => (
            <motion.path
              key={i}
              d={`M ${10 + i * 12} 20 L ${12 + i * 12} ${10 + Math.random() * 5} L ${14 + i * 12} 20`}
              fill="none"
              stroke="#3a3"
              strokeWidth="0.3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 1.5 + i * 0.1 }}
              style={{ filter: 'drop-shadow(0 0 3px #4a5)' }}
            />
          ))}
        </svg>
      </motion.div>
    </motion.div>
  );
}

function DeathTransition({ grave }: { grave: Grave }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[65] pointer-events-none overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at ${grave.x}% ${grave.y}%, rgba(50,80,50,0.3), rgba(10,15,10,0.95) 70%)`,
      }}
    >
      {/* Soul orb rising */}
      <motion.div
        initial={{ y: '60vh', x: '-50%', scale: 0.5, opacity: 0 }}
        animate={{ y: 0, x: '-50%', scale: 2, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.5, 0, 0.75, 0] }}
        className="absolute rounded-full"
        style={{
          left: `${grave.x}%`,
          top: `${grave.y}%`,
          width: 80,
          height: 80,
          background: 'radial-gradient(circle at 35% 35%, #8f8, #4a5 60%, #253)',
          boxShadow: '0 0 60px rgba(100,200,100,0.8), 0 0 120px rgba(100,200,100,0.5)',
        }}
      />

      {/* Ghostly wisps */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: '80vh', opacity: 0 }}
          animate={{ y: '-20vh', opacity: [0, 0.6, 0] }}
          transition={{ duration: 1.2, delay: 0.1 + i * 0.05, ease: 'easeOut' }}
          className="absolute w-2 h-20"
          style={{
            left: `${grave.x + (Math.random() - 0.5) * 30}%`,
            background: 'linear-gradient(180deg, transparent, rgba(100,200,100,0.5), transparent)',
            filter: 'blur(3px)',
          }}
        />
      ))}
    </motion.div>
  );
}

function GraveDialog({ grave, onClose }: { grave: Grave | null; onClose: (completed?: boolean) => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!grave) {
      setCode('');
      setError(false);
    }
  }, [grave]);

  const isFirst = grave?.id === 1;
  const QUEST1_URL = 'https://v0-akkonec.vercel.app/quest.html';
  const QUEST1_CODE = '2002';

  const submitCode = () => {
    if (code.trim() === QUEST1_CODE) {
      window.open(QUEST1_URL, '_blank', 'noopener,noreferrer');
      onClose(true);
    } else {
      setError(true);
    }
  };

  return (
    <AnimatePresence>
      {grave && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onClose()}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.8, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 30, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full p-8 rounded-2xl text-center overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #1a201a, #0d100d)',
              border: '1px solid #3a4a3a',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(100,150,100,0.2)',
            }}
          >
            {/* Creepy border glow */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, transparent 50%, rgba(100,150,100,0.1))',
              }}
            />

            {/* Skulls decoration */}
            <div className="absolute top-0 left-0 right-0 flex justify-between px-4 pt-2">
              <Skull className="w-5 h-5 text-gray-600" />
              <Skull className="w-5 h-5 text-gray-600" />
            </div>

            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 text-3xl font-black"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #4a5, #253)',
                color: '#afa',
                fontFamily: 'serif',
                boxShadow: '0 0 30px rgba(100,200,100,0.4), inset 0 -4px 8px rgba(0,0,0,0.4)',
                border: '2px solid #385',
              }}
            >
              {grave.id}
            </motion.div>

            <h2 className="text-3xl font-bold mb-2 text-green-400" style={{ fontFamily: 'serif' }}>
              Могила #{grave.id}
            </h2>

            {isFirst ? (
              <>
                <p className="text-gray-400 mb-4">
                  Найди ключ в царстве мёртвых и введи его, чтобы восстать из могилы.
                </p>
                <a
                  href={QUEST1_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 w-full justify-center px-6 py-3 rounded-xl font-semibold mb-4 border border-green-900 bg-green-950/50 hover:bg-green-900/50 transition text-green-300"
                >
                  <Skull className="w-4 h-4" />
                  Войти в царство мёртвых
                </a>
                <div className="mb-4">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => { setCode(e.target.value); setError(false); }}
                    onKeyDown={(e) => e.key === 'Enter' && submitCode()}
                    placeholder="Введите ключ"
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl bg-black/50 border border-green-900/50 text-center tracking-[0.3em] font-mono text-lg text-green-300 placeholder:text-gray-600 focus:outline-none focus:border-green-500/60 focus:bg-black/70 transition"
                    style={{ boxShadow: error ? '0 0 0 2px rgba(255,100,100,0.5)' : undefined }}
                  />
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm mt-2"
                    >
                      Неверный ключ. Души не пропустят.
                    </motion.p>
                  )}
                </div>
                <button
                  onClick={submitCode}
                  className="w-full px-8 py-3 rounded-xl font-bold tracking-wide text-black mb-3 transition hover:brightness-110"
                  style={{
                    background: 'linear-gradient(135deg, #5a6, #385)',
                    boxShadow: '0 8px 20px rgba(80,150,80,0.4)',
                  }}
                >
                  Восстать
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-400 mb-6">
                  Эта могила ожидает свою жертву. Скоро здесь будет испытание.
                </p>
                <div className="flex items-center justify-center gap-2 text-green-500 mb-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3 + i * 0.15, type: 'spring', bounce: 0.6 }}
                    >
                      <Star className="w-8 h-8 fill-green-500" />
                    </motion.div>
                  ))}
                </div>
              </>
            )}

            <button
              onClick={() => onClose()}
              className="px-8 py-3 rounded-xl font-bold tracking-wide text-green-300 border border-green-800 hover:bg-green-900/30 transition"
            >
              Закрыть
            </button>

            {/* Bottom bones decoration */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 pb-2">
              <Bone className="w-5 h-5 text-gray-600" />
              <Bone className="w-5 h-5 text-gray-600" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Quest() {
  const { user } = useAuth();
  const [intro, setIntro] = useState(true);
  const [selected, setSelected] = useState<Grave | null>(null);
  const [zooming, setZooming] = useState<Grave | null>(null);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [lightning, setLightning] = useState(false);

  // Random lightning effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setLightning(true);
        setTimeout(() => setLightning(false), 150);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Load progress
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('quest_progress')
        .select('island_id')
        .eq('user_id', user.id);
      if (data) setCompleted(new Set(data.map((r: any) => r.island_id)));
    })();
  }, [user]);

  const markCompleted = async (graveId: number) => {
    if (!user || completed.has(graveId)) return;
    const next = new Set(completed);
    next.add(graveId);
    setCompleted(next);
    await supabase
      .from('quest_progress')
      .insert({ user_id: user.id, island_id: graveId });
  };

  const handleGraveClick = (grave: Grave) => {
    setZooming(grave);
    setTimeout(() => {
      setZooming(null);
      setSelected(grave);
    }, 900);
  };

  const handleDialogClose = (didComplete?: boolean) => {
    if (didComplete && selected) markCompleted(selected.id);
    setSelected(null);
  };

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: '#0a0d0a' }}>
      <CosmicBackground />
      <Lightning active={lightning} />

      <AnimatePresence>{intro && <ApocalypseIntro onDone={() => setIntro(false)} />}</AnimatePresence>

      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: intro ? 2.8 : 0, duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-900/50 backdrop-blur-md bg-black/30 text-xs uppercase tracking-[0.2em] text-gray-400 mb-4">
            <Skull className="w-3.5 h-3.5 text-green-500" />
            Кладбище Душ
          </div>
          <h1
            className="text-5xl md:text-7xl font-black mb-3"
            style={{
              fontFamily: 'serif',
              color: '#5a6',
              textShadow: '0 0 30px rgba(100,200,100,0.5), 0 0 60px rgba(100,200,100,0.3)',
            }}
          >
            <motion.span
              animate={{ 
                textShadow: [
                  '0 0 30px rgba(100,200,100,0.5)',
                  '0 0 50px rgba(100,200,100,0.8)',
                  '0 0 30px rgba(100,200,100,0.5)',
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              СУДНЫЙ ДЕНЬ
            </motion.span>
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            10 проклятых могил ждут тебя. Пройди путь от первого надгробия до трона смерти — 
            и стань повелителем царства мёртвых.
          </p>
        </motion.div>

        {/* Graveyard map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: intro ? 3 : 0.2, duration: 0.8 }}
          className="relative mx-auto rounded-2xl border border-green-900/30 overflow-hidden"
          style={{
            aspectRatio: '16 / 10',
            maxWidth: 1200,
            background: 'linear-gradient(180deg, #0d120d 0%, #151a15 50%, #0a0d0a 100%)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.8), inset 0 0 100px rgba(0,0,0,0.5)',
          }}
        >
          {/* Moon */}
          <motion.div
            className="absolute top-8 right-12 w-20 h-20 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #ddd, #888 70%)',
              boxShadow: '0 0 60px rgba(200,200,200,0.3), 0 0 120px rgba(200,200,200,0.1)',
            }}
            animate={{ 
              boxShadow: [
                '0 0 60px rgba(200,200,200,0.3)',
                '0 0 80px rgba(200,200,200,0.5)',
                '0 0 60px rgba(200,200,200,0.3)',
              ]
            }}
            transition={{ duration: 5, repeat: Infinity }}
          />

          {/* Dead trees silhouettes */}
          {[15, 35, 70, 90].map((x, i) => (
            <div
              key={i}
              className="absolute bottom-0"
              style={{
                left: `${x}%`,
                width: 40,
                height: 80 + i * 20,
                background: '#111',
                clipPath: 'polygon(45% 100%, 40% 60%, 20% 50%, 40% 50%, 30% 30%, 45% 35%, 40% 10%, 50% 0%, 60% 10%, 55% 35%, 70% 30%, 60% 50%, 80% 50%, 60% 60%, 55% 100%)',
              }}
            />
          ))}

          <GhostParticles />
          <FogLayer />
          <FlyingBats />
          
          {/* Walking skeletons */}
          {Array.from({ length: 3 }).map((_, i) => (
            <WalkingSkeleton key={i} index={i} />
          ))}

          <CursedPathLines />

          {/* Graves */}
          {GRAVES.map((grave, i) => (
            <GraveMarker
              key={grave.id}
              grave={grave}
              index={i}
              onClick={handleGraveClick}
              unlocked
              completed={completed.has(grave.id)}
            />
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: intro ? 3.5 : 0.6 }}
          className="text-center text-xs text-gray-600 mt-6 tracking-wider uppercase"
        >
          <Zap className="w-3 h-3 inline mr-1" />
          Нажми на могилу, чтобы разбудить мёртвых
          <Zap className="w-3 h-3 inline ml-1" />
        </motion.p>
      </div>

      <AnimatePresence>
        {zooming && <DeathTransition grave={zooming} />}
      </AnimatePresence>

      <GraveDialog grave={selected} onClose={(done) => handleDialogClose(done)} />
      
      <div className="text-center pb-10 text-xs text-gray-600">
        Покорено могил: <span className="text-green-400 font-bold">{completed.size}</span> / {GRAVES.length}
      </div>
    </div>
  );
}
