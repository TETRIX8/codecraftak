import { useMemo } from 'react';
import { motion } from 'framer-motion';

function StarField() {
  const stars = useMemo(() => {
    const layers = [
      { count: 70, sizeMin: 0.5, sizeMax: 1.2, depth: 0.2, twinkle: 4 },
      { count: 40, sizeMin: 1, sizeMax: 2, depth: 0.5, twinkle: 3 },
      { count: 20, sizeMin: 1.5, sizeMax: 3, depth: 1, twinkle: 2.2 },
    ];
    return layers.flatMap((layer, li) =>
      Array.from({ length: layer.count }).map((_, i) => ({
        id: `${li}-${i}`,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: layer.sizeMin + Math.random() * (layer.sizeMax - layer.sizeMin),
        depth: layer.depth,
        twinkle: layer.twinkle + Math.random() * 1.5,
        delay: Math.random() * 4,
      }))
    );
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-foreground"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            boxShadow: `0 0 ${s.size * 3}px hsl(var(--foreground) / ${0.4 * s.depth})`,
          }}
          animate={{ opacity: [0.2 * s.depth, 1 * s.depth, 0.2 * s.depth] }}
          transition={{ duration: s.twinkle, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

function Nebulas() {
  return (
    <>
      <motion.div
        animate={{ x: [0, 80, -40, 0], y: [0, -60, 40, 0], scale: [1, 1.2, 0.9, 1] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(280 80% 50% / 0.5), transparent 70%)' }}
      />
      <motion.div
        animate={{ x: [0, -60, 40, 0], y: [0, 40, -60, 0], scale: [1, 0.9, 1.2, 1] }}
        transition={{ duration: 50, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 -right-40 w-[700px] h-[700px] rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(200 90% 55% / 0.5), transparent 70%)' }}
      />
      <motion.div
        animate={{ x: [0, 50, -30, 0], y: [0, -40, 60, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 60, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(330 85% 55% / 0.5), transparent 70%)' }}
      />
    </>
  );
}

interface CosmicBackgroundProps {
  showNebulas?: boolean;
}

export function CosmicBackground({ showNebulas = true }: CosmicBackgroundProps) {
  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, hsl(240 50% 10%) 0%, hsl(240 55% 5%) 60%, hsl(245 60% 3%) 100%)',
      }}
    >
      <StarField />
      {showNebulas && <Nebulas />}
    </div>
  );
}
