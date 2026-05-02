import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CosmicBackground } from '@/components/common/CosmicBackground';
import { Sparkles, Lock, Star, Crown, Flame, Trees, Mountain, Waves, Gem, Castle, Palmtree, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// 10 islands with curated positions to mimic the reference flow (top row → bottom row, snake-like)
type IslandKind = 'forest' | 'palm' | 'beach' | 'jungle' | 'volcano' | 'mini' | 'falls' | 'crystal' | 'desert' | 'castle';

interface Island {
  id: number;
  x: number; // %
  y: number; // %
  kind: IslandKind;
  size: number; // relative
  hue: number;
}

const ISLANDS: Island[] = [
  { id: 1,  x: 8,  y: 18, kind: 'forest',  size: 1.05, hue: 145 },
  { id: 2,  x: 26, y: 14, kind: 'palm',    size: 1.0,  hue: 160 },
  { id: 3,  x: 44, y: 20, kind: 'beach',   size: 0.95, hue: 45  },
  { id: 4,  x: 62, y: 14, kind: 'jungle',  size: 1.1,  hue: 130 },
  { id: 5,  x: 86, y: 32, kind: 'volcano', size: 1.05, hue: 15  },
  { id: 6,  x: 78, y: 58, kind: 'mini',    size: 0.85, hue: 55  },
  { id: 7,  x: 58, y: 64, kind: 'falls',   size: 0.95, hue: 190 },
  { id: 8,  x: 40, y: 70, kind: 'crystal', size: 1.05, hue: 280 },
  { id: 9,  x: 22, y: 64, kind: 'desert',  size: 0.95, hue: 30  },
  { id: 10, x: 8,  y: 80, kind: 'castle',  size: 1.15, hue: 250 },
];

const ICON_MAP: Record<IslandKind, any> = {
  forest: Trees,
  palm: Palmtree,
  beach: Waves,
  jungle: Trees,
  volcano: Flame,
  mini: Mountain,
  falls: Waves,
  crystal: Gem,
  desert: Mountain,
  castle: Castle,
};

function FloatingIsland({ island, index, onClick, unlocked, completed }: {
  island: Island;
  index: number;
  onClick: (i: Island) => void;
  unlocked: boolean;
  completed?: boolean;
}) {
  const Icon = ICON_MAP[island.kind];
  const baseHue = island.hue;

  return (
    <motion.button
      type="button"
      onClick={() => unlocked && onClick(island)}
      className="absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none"
      style={{ left: `${island.x}%`, top: `${island.y}%` }}
      initial={{ opacity: 0, scale: 0.4, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 + index * 0.08, type: 'spring', bounce: 0.4 }}
      whileHover={unlocked ? { scale: 1.08 } : {}}
      whileTap={unlocked ? { scale: 0.95 } : {}}
    >
      {/* Bobbing wrapper */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4 + (index % 3), repeat: Infinity, ease: 'easeInOut', delay: index * 0.3 }}
        style={{ width: 110 * island.size, height: 110 * island.size }}
        className="relative"
      >
        {/* Aura glow */}
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity"
          style={{ background: `radial-gradient(circle, hsl(${baseHue} 80% 60% / 0.55), transparent 70%)` }}
        />

        {/* Floating shadow under island */}
        <motion.div
          animate={{ scaleX: [1, 0.85, 1], opacity: [0.35, 0.2, 0.35] }}
          transition={{ duration: 4 + (index % 3), repeat: Infinity, ease: 'easeInOut', delay: index * 0.3 }}
          className="absolute left-1/2 -translate-x-1/2 w-[70%] h-3 rounded-full bg-black/60 blur-md"
          style={{ bottom: -10 }}
        />

        {/* Island base — stylized rock */}
        <div className="relative w-full h-full">
          {/* Bottom rock */}
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[88%] h-[55%] rounded-b-full"
            style={{
              background: `linear-gradient(180deg, hsl(${baseHue} 25% 28%), hsl(${baseHue} 30% 14%))`,
              clipPath: 'polygon(10% 0%, 90% 0%, 100% 60%, 80% 100%, 20% 100%, 0% 60%)',
              boxShadow: `inset 0 -10px 20px hsl(${baseHue} 50% 5% / 0.8)`,
            }}
          />
          {/* Grass top */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-[20%] w-[92%] h-[45%] rounded-[50%]"
            style={{
              background: `radial-gradient(ellipse at 50% 40%, hsl(${baseHue} 65% 55%), hsl(${baseHue} 55% 35%))`,
              boxShadow: `inset 0 -8px 16px hsl(${baseHue} 60% 20% / 0.6), 0 0 20px hsl(${baseHue} 80% 50% / 0.3)`,
            }}
          />

          {/* Decorative icon (tree/volcano/etc.) */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-[2%] flex items-center justify-center"
            style={{ filter: `drop-shadow(0 4px 6px hsl(${baseHue} 60% 10% / 0.7))` }}
          >
            <Icon
              className="w-9 h-9"
              style={{ color: `hsl(${baseHue} 80% 70%)` }}
              strokeWidth={2.2}
            />
          </div>

          {/* Numbered medallion */}
          <motion.div
            whileHover={unlocked ? { rotate: [0, -6, 6, 0] } : {}}
            transition={{ duration: 0.5 }}
            className="absolute left-1/2 -translate-x-1/2 top-[48%] -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-xl"
            style={{
              background: unlocked
                ? `radial-gradient(circle at 30% 30%, hsl(38 90% 65%), hsl(28 80% 40%))`
                : `radial-gradient(circle at 30% 30%, hsl(220 15% 45%), hsl(220 20% 20%))`,
              border: '3px solid hsl(28 50% 18%)',
              boxShadow: unlocked
                ? '0 4px 10px rgba(0,0,0,0.5), inset 0 -3px 6px rgba(0,0,0,0.4), 0 0 20px hsl(38 90% 60% / 0.5)'
                : '0 4px 10px rgba(0,0,0,0.5), inset 0 -3px 6px rgba(0,0,0,0.4)',
              color: unlocked ? '#3a1d05' : '#1a1a1a',
              fontFamily: 'Georgia, serif',
            }}
          >
            {completed ? <Check className="w-6 h-6" strokeWidth={3} /> : unlocked ? island.id : <Lock className="w-5 h-5" />}
          </motion.div>

          {completed && (
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ boxShadow: '0 0 30px hsl(140 80% 55% / 0.7), inset 0 0 20px hsl(140 80% 55% / 0.3)' }}
            />
          )}

          {/* Sparkle for unlocked */}
          {unlocked && (
            <motion.div
              className="absolute -top-2 -right-1 text-yellow-300"
              animate={{ rotate: [0, 360], scale: [1, 1.3, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="w-5 h-5" />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Tooltip */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 whitespace-nowrap text-xs text-foreground/80 opacity-0 group-hover:opacity-100 transition-opacity bg-background/60 backdrop-blur px-2 py-0.5 rounded-md border border-white/10">
        Уровень {island.id}
      </div>
    </motion.button>
  );
}

function PathLines() {
  // Connect each island to the next with a glowing dashed orbit line
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="pathGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(280 80% 65%)" stopOpacity="0.7" />
          <stop offset="50%" stopColor="hsl(200 90% 65%)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="hsl(330 85% 65%)" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      {ISLANDS.slice(0, -1).map((a, i) => {
        const b = ISLANDS[i + 1];
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2 - 6;
        return (
          <motion.path
            key={a.id}
            d={`M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`}
            fill="none"
            stroke="url(#pathGrad)"
            strokeWidth="0.4"
            strokeDasharray="1.2 1.2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.4, delay: 0.4 + i * 0.1, ease: 'easeOut' }}
            vectorEffect="non-scaling-stroke"
            style={{ filter: 'drop-shadow(0 0 3px hsl(280 80% 60% / 0.7))' }}
          />
        );
      })}
    </svg>
  );
}

function FloatingClouds() {
  // Few wispy clouds drifting across to suggest "in the sky / cosmos"
  const clouds = useMemo(
    () => Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      y: 10 + Math.random() * 80,
      size: 120 + Math.random() * 200,
      delay: Math.random() * 10,
      duration: 40 + Math.random() * 30,
      opacity: 0.06 + Math.random() * 0.1,
    })),
    []
  );
  return (
    <>
      {clouds.map((c) => (
        <motion.div
          key={c.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            top: `${c.y}%`,
            width: c.size,
            height: c.size * 0.5,
            background: 'radial-gradient(ellipse, white, transparent 70%)',
            opacity: c.opacity,
            filter: 'blur(20px)',
          }}
          initial={{ x: '-30%' }}
          animate={{ x: '130%' }}
          transition={{ duration: c.duration, repeat: Infinity, delay: c.delay, ease: 'linear' }}
        />
      ))}
    </>
  );
}

function CloudIntro({ onDone }: { onDone: () => void }) {
  // Combined transition: clouds split + zoom-in
  useEffect(() => {
    const t = setTimeout(onDone, 1700);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[60] overflow-hidden pointer-events-none"
      style={{
        background: 'radial-gradient(ellipse at center, hsl(220 60% 12%), hsl(240 70% 4%))',
      }}
    >
      {/* Zoom container — children appear behind clouds, scaling up */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0, filter: 'blur(20px)' }}
        animate={{ scale: 1.05, opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-5xl md:text-7xl font-extrabold"
            style={{
              background: 'linear-gradient(135deg, hsl(45 95% 65%), hsl(28 90% 55%))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 4px 20px hsl(38 90% 50% / 0.6))',
            }}
          >
            КВЕСТ
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-foreground/70 mt-2 tracking-widest text-sm"
          >
            10 ОСТРОВОВ ЖДУТ
          </motion.div>
        </div>
      </motion.div>

      {/* Left cloud */}
      <motion.div
        initial={{ x: 0, scale: 1.2 }}
        animate={{ x: '-110%', scale: 1.4 }}
        transition={{ duration: 1.6, ease: [0.7, 0, 0.3, 1] }}
        className="absolute top-0 left-0 h-full w-[60%]"
        style={{
          background:
            'radial-gradient(ellipse at 80% 50%, hsl(0 0% 100% / 0.95), hsl(220 30% 90% / 0.7) 40%, transparent 70%)',
          filter: 'blur(2px)',
        }}
      />
      {/* Right cloud */}
      <motion.div
        initial={{ x: 0, scale: 1.2 }}
        animate={{ x: '110%', scale: 1.4 }}
        transition={{ duration: 1.6, ease: [0.7, 0, 0.3, 1] }}
        className="absolute top-0 right-0 h-full w-[60%]"
        style={{
          background:
            'radial-gradient(ellipse at 20% 50%, hsl(0 0% 100% / 0.95), hsl(220 30% 90% / 0.7) 40%, transparent 70%)',
          filter: 'blur(2px)',
        }}
      />

      {/* Tiny puffs floating away */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            top: `${10 + Math.random() * 80}%`,
            left: '50%',
            width: 30 + Math.random() * 60,
            height: 30 + Math.random() * 60,
            filter: 'blur(10px)',
            opacity: 0.6,
          }}
          initial={{ x: 0, scale: 0.5 }}
          animate={{
            x: (Math.random() > 0.5 ? 1 : -1) * (300 + Math.random() * 500),
            y: (Math.random() - 0.5) * 200,
            scale: 1.5,
            opacity: 0,
          }}
          transition={{ duration: 1.5, delay: 0.1 + Math.random() * 0.3, ease: 'easeOut' }}
        />
      ))}
    </motion.div>
  );
}

function MoonFallTransition({ island }: { island: Island }) {
  // Camera "falls" onto the island like a moon descending from the sky.
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[65] pointer-events-none overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at ${island.x}% ${island.y}%, hsl(${island.hue} 70% 12% / 0.4), hsl(240 80% 4% / 0.95) 70%)`,
        transformOrigin: `${island.x}% ${island.y}%`,
      }}
    >
      {/* The "moon" — a glowing orb falling onto target */}
      <motion.div
        initial={{ y: '-60vh', x: '-50%', scale: 0.6, opacity: 0 }}
        animate={{ y: 0, x: '-50%', scale: 4, opacity: 1 }}
        transition={{ duration: 1.0, ease: [0.5, 0, 0.75, 0] }}
        className="absolute rounded-full"
        style={{
          left: `${island.x}%`,
          top: `${island.y}%`,
          width: 120,
          height: 120,
          background: `radial-gradient(circle at 35% 35%, hsl(${island.hue} 90% 80%), hsl(${island.hue} 80% 45%) 60%, hsl(${island.hue} 70% 20%))`,
          boxShadow: `0 0 80px hsl(${island.hue} 90% 60% / 0.9), 0 0 200px hsl(${island.hue} 90% 60% / 0.6)`,
        }}
      />
      {/* Shockwave */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 8, opacity: [0, 0.8, 0] }}
        transition={{ duration: 0.8, delay: 0.85, ease: 'easeOut' }}
        className="absolute rounded-full border-2"
        style={{
          left: `${island.x}%`,
          top: `${island.y}%`,
          width: 100,
          height: 100,
          marginLeft: -50,
          marginTop: -50,
          borderColor: `hsl(${island.hue} 90% 70% / 0.8)`,
          boxShadow: `0 0 40px hsl(${island.hue} 90% 60% / 0.6)`,
        }}
      />
      {/* Streak lines (motion blur of fall) */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: '-30vh', opacity: 0 }}
          animate={{ y: '40vh', opacity: [0, 0.6, 0] }}
          transition={{ duration: 0.6, delay: 0.1 + i * 0.05, ease: 'easeIn' }}
          className="absolute w-px h-32"
          style={{
            left: `${island.x + (Math.random() - 0.5) * 20}%`,
            top: `${island.y - 30}%`,
            background: `linear-gradient(180deg, transparent, hsl(${island.hue} 90% 70%))`,
            filter: 'blur(1px)',
          }}
        />
      ))}
    </motion.div>
  );
}

function LevelDialog({ island, onClose }: { island: Island | null; onClose: (completed?: boolean) => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!island) {
      setCode('');
      setError(false);
    }
  }, [island]);

  const isFirst = island?.id === 1;
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
      {island && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.8, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 30, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full p-8 rounded-3xl border border-white/15 text-center"
            style={{
              background:
                'linear-gradient(135deg, hsl(240 40% 14% / 0.95), hsl(245 50% 8% / 0.95))',
              boxShadow: `0 20px 60px hsl(${island.hue} 80% 30% / 0.5), 0 0 80px hsl(${island.hue} 80% 50% / 0.2)`,
            }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 text-3xl font-black"
              style={{
                background: `radial-gradient(circle at 30% 30%, hsl(38 90% 65%), hsl(28 80% 40%))`,
                color: '#3a1d05',
                fontFamily: 'Georgia, serif',
                boxShadow: '0 0 30px hsl(38 90% 60% / 0.6), inset 0 -4px 8px rgba(0,0,0,0.4)',
                border: '3px solid hsl(28 50% 18%)',
              }}
            >
              {island.id}
            </motion.div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: `hsl(${island.hue} 80% 75%)` }}>
              Остров #{island.id}
            </h2>
            {isFirst ? (
              <>
                <p className="text-muted-foreground mb-4">
                  Введи код квеста, чтобы открыть портал.
                </p>
                <div className="mb-4">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => { setCode(e.target.value); setError(false); }}
                    onKeyDown={(e) => e.key === 'Enter' && submitCode()}
                    placeholder="Код квеста"
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-center tracking-[0.3em] font-mono text-lg text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-yellow-400/60 focus:bg-white/10 transition"
                    style={{ boxShadow: error ? '0 0 0 2px hsl(0 80% 60% / 0.6)' : undefined }}
                  />
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm mt-2"
                    >
                      Неверный код. Попробуй ещё раз.
                    </motion.p>
                  )}
                </div>
                <button
                  onClick={submitCode}
                  className="w-full px-8 py-3 rounded-full font-bold tracking-wide text-background mb-3"
                  style={{
                    background: `linear-gradient(135deg, hsl(${island.hue} 80% 60%), hsl(${(island.hue + 40) % 360} 80% 55%))`,
                    boxShadow: `0 8px 20px hsl(${island.hue} 80% 40% / 0.5)`,
                  }}
                >
                  Открыть портал
                </button>
              </>
            ) : (
              <>
                <p className="text-muted-foreground mb-6">
                  Уровень разблокирован! Скоро здесь появятся испытания.
                </p>
                <div className="flex items-center justify-center gap-2 text-yellow-400 mb-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3 + i * 0.15, type: 'spring', bounce: 0.6 }}
                    >
                      <Star className="w-8 h-8 fill-yellow-400" />
                    </motion.div>
                  ))}
                </div>
              </>
            )}
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-full font-bold tracking-wide text-background"
              style={{
                background: `linear-gradient(135deg, hsl(${island.hue} 80% 60%), hsl(${(island.hue + 40) % 360} 80% 55%))`,
                boxShadow: `0 8px 20px hsl(${island.hue} 80% 40% / 0.5)`,
              }}
            >
              Закрыть
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Quest() {
  const { user } = useAuth();
  const [intro, setIntro] = useState(true);
  const [selected, setSelected] = useState<Island | null>(null);
  const [zooming, setZooming] = useState<Island | null>(null);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

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

  const markCompleted = async (islandId: number) => {
    if (!user || completed.has(islandId)) return;
    const next = new Set(completed);
    next.add(islandId);
    setCompleted(next);
    await supabase
      .from('quest_progress')
      .insert({ user_id: user.id, island_id: islandId });
  };

  const handleIslandClick = (island: Island) => {
    // Cinematic "moon falling" zoom-in to the island, then open dialog
    setZooming(island);
    setTimeout(() => {
      setZooming(null);
      setSelected(island);
    }, 1100);
  };

  const handleDialogClose = (didComplete?: boolean) => {
    if (didComplete && selected) markCompleted(selected.id);
    setSelected(null);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <CosmicBackground />

      <AnimatePresence>{intro && <CloudIntro onDone={() => setIntro(false)} />}</AnimatePresence>

      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: intro ? 1.6 : 0, duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md bg-white/5 text-xs uppercase tracking-[0.2em] text-foreground/70 mb-4">
            <Crown className="w-3.5 h-3.5 text-yellow-400" />
            Карта Приключений
          </div>
          <h1
            className="text-5xl md:text-7xl font-extrabold mb-3"
            style={{
              background: 'linear-gradient(135deg, hsl(45 95% 70%), hsl(280 90% 70%), hsl(200 95% 70%))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 4px 20px hsl(280 80% 50% / 0.5))',
            }}
          >
            Квест
          </h1>
          <p className="text-foreground/60 max-w-xl mx-auto">
            10 парящих островов в бескрайнем космосе. Прокладывай путь от первого берега
            до древнего замка — и стань легендой архипелага.
          </p>
        </motion.div>

        {/* Map canvas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: intro ? 1.8 : 0.2, duration: 0.8 }}
          className="relative mx-auto rounded-[2rem] border border-white/10 overflow-hidden"
          style={{
            aspectRatio: '16 / 10',
            maxWidth: 1200,
            background:
              'radial-gradient(ellipse at 30% 20%, hsl(220 70% 18%) 0%, hsl(240 80% 8%) 60%, hsl(245 90% 4%) 100%)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.6), inset 0 0 120px hsl(220 80% 5% / 0.8)',
          }}
        >
          {/* Inner stars */}
          <div className="absolute inset-0">
            {Array.from({ length: 60 }).map((_, i) => {
              const size = 0.5 + Math.random() * 2;
              return (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-white"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: size,
                    height: size,
                    boxShadow: `0 0 ${size * 4}px white`,
                  }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 3 }}
                />
              );
            })}
          </div>

          {/* Nebula blobs inside the map */}
          <motion.div
            animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-40"
            style={{ background: 'radial-gradient(circle, hsl(280 80% 50%), transparent 70%)' }}
          />
          <motion.div
            animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
            transition={{ duration: 40, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-10 right-10 w-80 h-80 rounded-full blur-3xl opacity-40"
            style={{ background: 'radial-gradient(circle, hsl(200 90% 50%), transparent 70%)' }}
          />

          <FloatingClouds />
          <PathLines />

          {/* Islands */}
          {ISLANDS.map((island, i) => (
            <FloatingIsland
              key={island.id}
              island={island}
              index={i}
              onClick={handleIslandClick}
              unlocked
              completed={completed.has(island.id)}
            />
          ))}

          {/* A drifting comet */}
          <motion.div
            className="absolute w-1 h-1 rounded-full bg-white pointer-events-none"
            style={{ boxShadow: '0 0 8px white, 0 0 20px white' }}
            initial={{ x: '-5%', y: '15%' }}
            animate={{ x: '110%', y: '90%' }}
            transition={{ duration: 6, repeat: Infinity, repeatDelay: 8, ease: 'easeIn' }}
          >
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2 h-px w-24"
              style={{ background: 'linear-gradient(90deg, transparent, white)' }}
            />
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: intro ? 2.4 : 0.6 }}
          className="text-center text-xs text-foreground/40 mt-6 tracking-wider uppercase"
        >
          Нажми на остров, чтобы открыть портал
        </motion.p>
      </div>

      <AnimatePresence>
        {zooming && <MoonFallTransition island={zooming} />}
      </AnimatePresence>

      <LevelDialog island={selected} onClose={(done) => handleDialogClose(done)} />
      <div className="text-center pb-10 text-xs text-foreground/50">
        Пройдено островов: <span className="text-yellow-300 font-bold">{completed.size}</span> / {ISLANDS.length}
      </div>
    </div>
  );
}
