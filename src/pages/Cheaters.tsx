import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Ban, AlertTriangle, ShieldAlert, Flame, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const cheaters = [
  { id: 1, name: 'Аушев', reason: 'Использование багов системы' },
  { id: 2, name: 'Гамурзиев', reason: 'Использование багов системы' },
  { id: 3, name: 'Илез', reason: 'Использование багов системы' },
  { id: 4, name: 'Гогиев', reason: 'Использование багов системы' },
  { id: 5, name: 'Мансур', reason: 'Использование багов системы' },
  { id: 6, name: 'Ильяс', reason: 'Использование багов системы' },
];

function FloatingSkull({ delay, x }: { delay: number; x: number }) {
  return (
    <motion.div
      initial={{ y: '100vh', opacity: 0, rotate: 0 }}
      animate={{ 
        y: '-100vh', 
        opacity: [0, 0.3, 0.3, 0],
        rotate: 360,
      }}
      transition={{ 
        duration: 15, 
        delay, 
        repeat: Infinity,
        ease: 'linear'
      }}
      className="absolute text-red-500/20"
      style={{ left: `${x}%` }}
    >
      <Skull className="w-12 h-12" />
    </motion.div>
  );
}

function GlitchText({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <span className="relative inline-block">
        {text}
        <motion.span
          className="absolute inset-0 text-red-500"
          animate={{
            x: [-2, 2, -2, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 0.2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        >
          {text}
        </motion.span>
        <motion.span
          className="absolute inset-0 text-cyan-500"
          animate={{
            x: [2, -2, 2, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 0.2,
            repeat: Infinity,
            repeatDelay: 3,
            delay: 0.1,
          }}
        >
          {text}
        </motion.span>
      </span>
    </div>
  );
}

export default function Cheaters() {
  const [showIntro, setShowIntro] = useState(true);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background py-24 overflow-hidden relative">
      {/* Floating skulls background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <FloatingSkull key={i} delay={i * 2} x={10 + i * 12} />
        ))}
      </div>

      {/* Red vignette effect */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(220,38,38,0.1)_100%)]" />

      {/* Intro Animation */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            onClick={() => setShowIntro(false)}
          >
            <div className="relative">
              {/* Pulsing red glow */}
              <motion.div
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-red-600/30 blur-3xl rounded-full"
                style={{ width: '400px', height: '400px', left: '-150px', top: '-150px' }}
              />

              {/* Main skull */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
              >
                <motion.div
                  animate={{ 
                    filter: ['drop-shadow(0 0 20px #dc2626)', 'drop-shadow(0 0 40px #dc2626)', 'drop-shadow(0 0 20px #dc2626)']
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Skull className="w-32 h-32 text-red-500" />
                </motion.div>
              </motion.div>

              {/* Warning text */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="text-center mt-6"
              >
                <GlitchText 
                  text="WALL OF SHAME" 
                  className="text-4xl font-black text-red-500 tracking-wider"
                />
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="text-red-400/80 mt-4 text-lg"
                >
                  Эти люди использовали баги
                </motion.p>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ delay: 2.5, duration: 1, repeat: Infinity }}
                className="absolute -bottom-20 left-1/2 -translate-x-1/2 text-red-400/60 text-sm"
              >
                Нажмите, чтобы продолжить
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-medium mb-4"
            animate={{ 
              boxShadow: ['0 0 0 0 rgba(220,38,38,0)', '0 0 0 10px rgba(220,38,38,0)'],
              borderColor: ['rgba(220,38,38,0.3)', 'rgba(220,38,38,0.6)', 'rgba(220,38,38,0.3)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ShieldAlert className="w-4 h-4" />
            ВНИМАНИЕ: Стена позора
          </motion.div>
          
          <div className="flex items-center justify-center gap-4 mb-4">
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              <Skull className="w-10 h-10 text-red-500" />
            </motion.div>
            <GlitchText 
              text="ЧИТЕРЫ" 
              className="text-4xl sm:text-5xl font-black text-red-500"
            />
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              <Skull className="w-10 h-10 text-red-500" />
            </motion.div>
          </div>
          
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Эти участники были уличены в использовании багов платформы
          </p>
        </motion.div>

        {/* Warning Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-3xl mx-auto mb-12"
        >
          <motion.div 
            className="relative p-6 rounded-2xl bg-gradient-to-r from-red-950/50 via-red-900/30 to-red-950/50 border border-red-500/30 overflow-hidden"
            animate={{
              borderColor: ['rgba(220,38,38,0.3)', 'rgba(220,38,38,0.6)', 'rgba(220,38,38,0.3)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {/* Animated background stripes */}
            <motion.div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(220,38,38,0.3) 10px, rgba(220,38,38,0.3) 20px)'
              }}
              animate={{ x: [0, 28] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            
            <div className="relative flex items-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="flex-shrink-0"
              >
                <AlertTriangle className="w-12 h-12 text-red-500" />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-red-400 mb-1 flex items-center gap-2">
                  <Flame className="w-5 h-5" />
                  МЕРЫ УЖЕ ПРИМЕНЯЮТСЯ
                  <Flame className="w-5 h-5" />
                </h3>
                <p className="text-red-300/80">
                  К указанным пользователям применяются санкции за нарушение правил платформы. 
                  Использование багов и эксплойтов строго запрещено!
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Cheaters List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          <div className="space-y-4">
            {cheaters.map((cheater, index) => (
              <motion.div
                key={cheater.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index + 0.4 }}
                onMouseEnter={() => setHoveredId(cheater.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="relative group"
              >
                <motion.div
                  className={cn(
                    "relative p-6 rounded-xl border transition-all duration-300",
                    "bg-gradient-to-r from-card via-red-950/20 to-card",
                    hoveredId === cheater.id 
                      ? "border-red-500 shadow-[0_0_30px_rgba(220,38,38,0.3)]" 
                      : "border-red-500/30"
                  )}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Scan line effect on hover */}
                  {hoveredId === cheater.id && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-b from-red-500/10 via-transparent to-transparent rounded-xl pointer-events-none"
                      initial={{ y: '-100%' }}
                      animate={{ y: '200%' }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}

                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      {/* Skull Avatar */}
                      <motion.div
                        className="relative w-14 h-14 rounded-xl bg-red-950/50 border border-red-500/50 flex items-center justify-center"
                        animate={hoveredId === cheater.id ? { 
                          boxShadow: ['0 0 0 0 rgba(220,38,38,0)', '0 0 20px 5px rgba(220,38,38,0.3)', '0 0 0 0 rgba(220,38,38,0)']
                        } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Skull className="w-8 h-8 text-red-500" />
                        {/* Ban overlay */}
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          initial={{ rotate: -45 }}
                        >
                          <div className="w-full h-1 bg-red-500 rounded-full" />
                        </motion.div>
                      </motion.div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-red-400">
                            {cheater.name}
                          </span>
                          <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                          >
                            <Zap className="w-4 h-4 text-yellow-500" />
                          </motion.div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {cheater.reason}
                        </p>
                      </div>
                    </div>

                    {/* Ban Badge */}
                    <motion.div
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/50"
                      animate={{ 
                        scale: hoveredId === cheater.id ? [1, 1.1, 1] : 1,
                      }}
                      transition={{ duration: 0.5, repeat: hoveredId === cheater.id ? Infinity : 0 }}
                    >
                      <Ban className="w-5 h-5 text-red-500" />
                      <span className="text-red-400 font-bold text-sm">BANNED</span>
                    </motion.div>
                  </div>

                  {/* Number badge */}
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-sm border-2 border-background">
                    {index + 1}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Footer Warning */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 text-center"
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red-500/10 border border-red-500/30"
              animate={{ 
                scale: [1, 1.02, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <span className="text-red-400 font-medium">
                Не нарушайте правила - играйте честно!
              </span>
              <ShieldAlert className="w-5 h-5 text-red-500" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
