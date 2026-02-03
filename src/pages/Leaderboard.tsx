import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Award, Flame, TrendingUp, Loader2, Crown, Sparkles, Star, Zap } from 'lucide-react';
import { LevelBadge } from '@/components/common/Badges';
import { useLeaderboard, useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

// Floating particle component
const FloatingParticle = ({ delay, duration, size, color }: { delay: number; duration: number; size: number; color: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 100, x: Math.random() * 100 - 50 }}
    animate={{ 
      opacity: [0, 1, 1, 0],
      y: [100, -100],
      x: [Math.random() * 100 - 50, Math.random() * 100 - 50]
    }}
    transition={{ 
      duration,
      delay,
      repeat: Infinity,
      ease: "easeOut"
    }}
    className="absolute pointer-events-none"
    style={{
      width: size,
      height: size,
      background: color,
      borderRadius: '50%',
      filter: 'blur(1px)',
      left: `${Math.random() * 100}%`,
      bottom: 0
    }}
  />
);

// Glowing orb component
const GlowOrb = ({ className, color }: { className?: string; color: string }) => (
  <motion.div
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.6, 0.3],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className={cn("absolute rounded-full blur-3xl pointer-events-none", className)}
    style={{ background: color }}
  />
);

export default function Leaderboard() {
  const { user } = useAuth();
  const { data: leaderboard, isLoading } = useLeaderboard();
  const { data: currentProfile } = useProfile();
  const [showIntro, setShowIntro] = useState(true);
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && leaderboard && leaderboard.length > 0) {
      const timer = setTimeout(() => {
        setShowIntro(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, leaderboard]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-24 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-12 h-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  const topThree = leaderboard?.slice(0, 3) || [];
  const leader = topThree[0];

  const currentUserRank = leaderboard?.findIndex(p => p.id === user?.id);
  const isInTop = currentUserRank !== undefined && currentUserRank !== -1;

  const getAccuracy = (correct: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  };

  return (
    <div className="min-h-screen bg-background py-24 overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <GlowOrb className="w-96 h-96 -top-48 -left-48" color="rgba(234, 179, 8, 0.15)" />
        <GlowOrb className="w-80 h-80 top-1/3 -right-40" color="rgba(168, 85, 247, 0.1)" />
        <GlowOrb className="w-72 h-72 bottom-20 left-1/4" color="rgba(59, 130, 246, 0.1)" />
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <FloatingParticle 
            key={i} 
            delay={i * 0.5} 
            duration={8 + Math.random() * 4}
            size={4 + Math.random() * 6}
            color={i % 3 === 0 ? 'rgba(234, 179, 8, 0.6)' : i % 3 === 1 ? 'rgba(168, 85, 247, 0.6)' : 'rgba(59, 130, 246, 0.6)'}
          />
        ))}

        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />

        {/* Animated lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <motion.line
            x1="0%" y1="20%" x2="100%" y2="80%"
            stroke="url(#goldGradient)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 0.5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.line
            x1="100%" y1="10%" x2="0%" y2="90%"
            stroke="url(#purpleGradient)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 0.5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Epic Intro Animation */}
      <AnimatePresence>
        {showIntro && leader && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 bg-background flex items-center justify-center"
            onClick={() => setShowIntro(false)}
          >
            <div className="relative">
              {/* Mega glow effect */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 2, 1.5], opacity: [0, 1, 0.7] }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute inset-0 bg-gradient-to-r from-yellow-400/40 via-warning/50 to-yellow-400/40 blur-[100px] rounded-full"
                style={{ width: '500px', height: '500px', left: '-200px', top: '-200px' }}
              />
              
              {/* Rotating ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 w-48 h-48 -left-8 -top-8"
              >
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-yellow-400/30" />
              </motion.div>
              
              {/* Crown */}
              <motion.div
                initial={{ y: -100, opacity: 0, rotate: -20, scale: 0 }}
                animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
                className="absolute -top-20 left-1/2 -translate-x-1/2"
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Crown className="w-20 h-20 text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.8)]" />
                </motion.div>
              </motion.div>

              {/* Avatar */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
                className="relative"
              >
                <motion.div 
                  className="w-36 h-36 rounded-2xl overflow-hidden border-4 border-yellow-400 shadow-[0_0_60px_rgba(250,204,21,0.5)]"
                  animate={{ boxShadow: ['0 0 60px rgba(250,204,21,0.5)', '0 0 80px rgba(250,204,21,0.8)', '0 0 60px rgba(250,204,21,0.5)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <img
                    src={leader.avatar_url}
                    alt={leader.nickname}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                {/* Orbiting sparkles */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 w-48 h-48 -left-6 -top-6"
                >
                  <Sparkles className="absolute top-0 left-1/2 w-6 h-6 text-yellow-400" />
                  <Star className="absolute bottom-0 left-1/2 w-5 h-5 text-yellow-300" />
                  <Zap className="absolute left-0 top-1/2 w-5 h-5 text-amber-400" />
                </motion.div>
              </motion.div>

              {/* Name & Score */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="text-center mt-8"
              >
                <motion.p
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-warning text-sm font-bold mb-3 tracking-widest"
                >
                  ЛИДЕР РЕЙТИНГА
                </motion.p>
                <motion.h2 
                  className="text-4xl font-black"
                  style={{
                    background: 'linear-gradient(135deg, #EAB308 0%, #FCD34D 50%, #EAB308 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 40px rgba(234, 179, 8, 0.5)'
                  }}
                >
                  {leader.nickname}
                </motion.h2>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, type: "spring" }}
                  className="mt-6"
                >
                  <span className="text-5xl font-black text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]">
                    {leader.reviews_completed * 10}
                  </span>
                  <span className="text-xl text-yellow-400/70 ml-2">очков</span>
                </motion.div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ delay: 2, duration: 2, repeat: Infinity }}
                className="absolute -bottom-24 left-1/2 -translate-x-1/2 text-muted-foreground text-sm"
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
          className="text-center mb-16"
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-yellow-500/20 via-warning/30 to-yellow-500/20 border border-warning/30 text-warning text-sm font-bold mb-6"
            animate={{ 
              boxShadow: ['0 0 20px rgba(234, 179, 8, 0.2)', '0 0 40px rgba(234, 179, 8, 0.4)', '0 0 20px rgba(234, 179, 8, 0.2)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <Trophy className="w-5 h-5" />
            </motion.div>
            Таблица лидеров
          </motion.div>
          <motion.h1 
            className="text-4xl sm:text-5xl font-black mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 bg-clip-text text-transparent">
              Топ ревьюеров
            </span>
          </motion.h1>
          <motion.p 
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Лучшие участники платформы по количеству проверок и рейтингу доверия
          </motion.p>
        </motion.div>

        {/* Top 3 Podium */}
        {topThree.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-6 max-w-4xl mx-auto mb-16"
          >
            {/* 2nd Place */}
            <motion.div 
              className="order-1 pt-12"
              whileHover={{ scale: 1.02, y: -5 }}
              onHoverStart={() => setHoveredUser(topThree[1].id)}
              onHoverEnd={() => setHoveredUser(null)}
            >
              <div className="relative p-6 rounded-3xl bg-gradient-to-b from-slate-400/10 to-card border border-slate-400/30 text-center backdrop-blur-sm overflow-hidden group">
                {/* Shine effect on hover */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                />
                
                <motion.div 
                  className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center text-slate-900 font-black shadow-lg shadow-slate-400/30"
                  animate={hoveredUser === topThree[1].id ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  2
                </motion.div>
                
                <motion.div 
                  className="w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-4 mt-4 border-3 border-slate-400 shadow-lg shadow-slate-400/20 relative"
                  animate={hoveredUser === topThree[1].id ? { scale: 1.1 } : { scale: 1 }}
                >
                  <img
                    src={topThree[1].avatar_url}
                    alt={topThree[1].nickname}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                
                {/* Nickname tooltip on hover */}
                <AnimatePresence>
                  {hoveredUser === topThree[1].id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 bg-slate-800 rounded-lg text-white text-sm font-medium whitespace-nowrap z-20 shadow-xl"
                    >
                      <div className="flex items-center gap-2">
                        <Medal className="w-4 h-4 text-slate-300" />
                        {topThree[1].nickname}
                      </div>
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-slate-800" />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <h3 className="font-bold text-lg mb-2 truncate">{topThree[1].nickname}</h3>
                <LevelBadge level={topThree[1].level} className="mb-4" />
                <motion.div 
                  className="text-3xl font-black bg-gradient-to-r from-slate-300 to-slate-400 bg-clip-text text-transparent"
                  animate={hoveredUser === topThree[1].id ? { scale: [1, 1.1, 1] } : {}}
                >
                  {topThree[1].reviews_completed * 10}
                </motion.div>
                <div className="text-xs text-muted-foreground mt-1">очков</div>
              </div>
            </motion.div>

            {/* 1st Place */}
            <motion.div 
              className="order-2"
              whileHover={{ scale: 1.03, y: -8 }}
              onHoverStart={() => setHoveredUser(topThree[0].id)}
              onHoverEnd={() => setHoveredUser(null)}
            >
              <div className="relative p-8 rounded-3xl bg-gradient-to-b from-yellow-500/20 via-warning/10 to-card border-2 border-yellow-500/40 text-center backdrop-blur-sm overflow-hidden group">
                {/* Animated glow */}
                <motion.div
                  className="absolute inset-0 opacity-50"
                  animate={{
                    background: [
                      'radial-gradient(circle at 50% 0%, rgba(234, 179, 8, 0.3), transparent 70%)',
                      'radial-gradient(circle at 50% 100%, rgba(234, 179, 8, 0.3), transparent 70%)',
                      'radial-gradient(circle at 50% 0%, rgba(234, 179, 8, 0.3), transparent 70%)'
                    ]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                
                {/* Shine effect */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                />
                
                <motion.div 
                  className="absolute -top-8 left-1/2 -translate-x-1/2"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="relative">
                    <motion.div 
                      className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-yellow-900 font-black text-xl shadow-lg shadow-yellow-500/50"
                      animate={hoveredUser === topThree[0].id ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      1
                    </motion.div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0"
                    >
                      <Trophy className="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-8 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
                    </motion.div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="w-28 h-28 rounded-2xl overflow-hidden mx-auto mb-5 mt-8 border-4 border-yellow-400 shadow-xl shadow-yellow-500/30 relative"
                  animate={hoveredUser === topThree[0].id ? { scale: 1.1, boxShadow: '0 0 40px rgba(234, 179, 8, 0.5)' } : {}}
                >
                  <img
                    src={topThree[0].avatar_url}
                    alt={topThree[0].nickname}
                    className="w-full h-full object-cover"
                  />
                  {/* Crown overlay */}
                  <motion.div 
                    className="absolute -top-4 left-1/2 -translate-x-1/2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredUser === topThree[0].id ? 1 : 0 }}
                  >
                    <Crown className="w-10 h-10 text-yellow-400 drop-shadow-lg" />
                  </motion.div>
                </motion.div>
                
                {/* Nickname tooltip on hover */}
                <AnimatePresence>
                  {hoveredUser === topThree[0].id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 bg-yellow-500 rounded-lg text-yellow-900 text-sm font-bold whitespace-nowrap z-20 shadow-xl shadow-yellow-500/30"
                    >
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4" />
                        {topThree[0].nickname}
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-yellow-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <h3 className="text-xl font-black mb-2 truncate bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">
                  {topThree[0].nickname}
                </h3>
                <LevelBadge level={topThree[0].level} className="mb-4" />
                <motion.div 
                  className="text-4xl font-black bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 bg-clip-text text-transparent"
                  animate={hoveredUser === topThree[0].id ? { scale: [1, 1.15, 1] } : {}}
                >
                  {topThree[0].reviews_completed * 10}
                </motion.div>
                <div className="text-sm text-yellow-400/70 mt-1">очков</div>
                <motion.div 
                  className="flex items-center justify-center gap-2 mt-4 text-warning"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Flame className="w-5 h-5" />
                  <span className="font-bold">{topThree[0].streak} дней подряд</span>
                </motion.div>
              </div>
            </motion.div>

            {/* 3rd Place */}
            <motion.div 
              className="order-3 pt-16"
              whileHover={{ scale: 1.02, y: -5 }}
              onHoverStart={() => setHoveredUser(topThree[2].id)}
              onHoverEnd={() => setHoveredUser(null)}
            >
              <div className="relative p-6 rounded-3xl bg-gradient-to-b from-amber-600/10 to-card border border-amber-600/30 text-center backdrop-blur-sm overflow-hidden group">
                {/* Shine effect on hover */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                />
                
                <motion.div 
                  className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-amber-100 font-black shadow-lg shadow-amber-600/30"
                  animate={hoveredUser === topThree[2].id ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  3
                </motion.div>
                
                <motion.div 
                  className="w-18 h-18 rounded-2xl overflow-hidden mx-auto mb-4 mt-4 border-3 border-amber-600 shadow-lg shadow-amber-600/20"
                  style={{ width: 72, height: 72 }}
                  animate={hoveredUser === topThree[2].id ? { scale: 1.1 } : { scale: 1 }}
                >
                  <img
                    src={topThree[2].avatar_url}
                    alt={topThree[2].nickname}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                
                {/* Nickname tooltip on hover */}
                <AnimatePresence>
                  {hoveredUser === topThree[2].id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 bg-amber-600 rounded-lg text-white text-sm font-medium whitespace-nowrap z-20 shadow-xl"
                    >
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        {topThree[2].nickname}
                      </div>
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-amber-600" />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <h3 className="font-bold mb-2 truncate">{topThree[2].nickname}</h3>
                <LevelBadge level={topThree[2].level} className="mb-4" />
                <motion.div 
                  className="text-2xl font-black bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent"
                  animate={hoveredUser === topThree[2].id ? { scale: [1, 1.1, 1] } : {}}
                >
                  {topThree[2].reviews_completed * 10}
                </motion.div>
                <div className="text-xs text-muted-foreground mt-1">очков</div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Full Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-5xl mx-auto"
        >
          <div className="rounded-3xl bg-card/80 backdrop-blur-md border border-border/50 overflow-hidden shadow-2xl">
            <div className="grid grid-cols-12 gap-4 p-5 bg-gradient-to-r from-muted/80 via-muted/60 to-muted/80 text-sm font-bold text-muted-foreground border-b border-border/50">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-5">Участник</div>
              <div className="col-span-2 text-center">Проверок</div>
              <div className="col-span-2 text-center">Рейтинг</div>
              <div className="col-span-2 text-center">Очки</div>
            </div>

            {leaderboard?.map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser = entry.id === user?.id;
              const isHovered = hoveredUser === entry.id;
              
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * Math.min(index, 15) }}
                  onHoverStart={() => setHoveredUser(entry.id)}
                  onHoverEnd={() => setHoveredUser(null)}
                  className={cn(
                    "grid grid-cols-12 gap-4 p-5 items-center transition-all duration-300 cursor-pointer relative overflow-hidden",
                    isCurrentUser && "bg-primary/10 border-l-4 border-primary",
                    isHovered && !isCurrentUser && "bg-muted/50"
                  )}
                >
                  {/* Hover effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
                    initial={{ x: '-100%' }}
                    animate={{ x: isHovered ? '100%' : '-100%' }}
                    transition={{ duration: 0.6 }}
                  />
                  
                  <div className="col-span-1 text-center relative">
                    {rank <= 3 ? (
                      <motion.div 
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center mx-auto font-bold text-sm",
                          rank === 1 && "bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900 shadow-lg shadow-yellow-500/30",
                          rank === 2 && "bg-gradient-to-br from-slate-300 to-slate-500 text-slate-900 shadow-lg shadow-slate-400/30",
                          rank === 3 && "bg-gradient-to-br from-amber-500 to-amber-700 text-amber-100 shadow-lg shadow-amber-600/30",
                        )}
                        animate={isHovered ? { scale: 1.2, rotate: [0, 10, -10, 0] } : { scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {rank === 1 ? <Trophy className="w-5 h-5" /> :
                         rank === 2 ? <Medal className="w-5 h-5" /> :
                         <Award className="w-5 h-5" />}
                      </motion.div>
                    ) : (
                      <motion.span 
                        className="text-muted-foreground font-bold text-lg"
                        animate={isHovered ? { scale: 1.3, color: '#fff' } : { scale: 1 }}
                      >
                        {rank}
                      </motion.span>
                    )}
                  </div>
                  
                  <div className="col-span-5 flex items-center gap-4">
                    <motion.div 
                      className={cn(
                        "w-12 h-12 rounded-xl overflow-hidden border-2 transition-all",
                        isHovered ? "border-primary shadow-lg shadow-primary/30" : "border-border"
                      )}
                      animate={isHovered ? { scale: 1.15 } : { scale: 1 }}
                    >
                      <img
                        src={entry.avatar_url}
                        alt={entry.nickname}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    <div className="relative">
                      <motion.div 
                        className="font-bold text-lg flex items-center gap-2"
                        animate={isHovered ? { x: 5 } : { x: 0 }}
                      >
                        {entry.nickname}
                        {isCurrentUser && (
                          <span className="text-xs text-primary font-medium px-2 py-0.5 bg-primary/20 rounded-full">(Вы)</span>
                        )}
                      </motion.div>
                      <LevelBadge level={entry.level} className="scale-90 origin-left" />
                      
                      {/* Expanded nickname on hover */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute left-0 -top-8 px-3 py-1 bg-foreground text-background text-xs font-medium rounded-lg whitespace-nowrap z-10"
                          >
                            @{entry.nickname}
                            <div className="absolute left-4 -bottom-1 w-2 h-2 bg-foreground rotate-45" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  
                  <div className="col-span-2 text-center">
                    <motion.span 
                      className="font-bold text-lg"
                      animate={isHovered ? { scale: 1.2 } : { scale: 1 }}
                    >
                      {entry.reviews_completed}
                    </motion.span>
                  </div>
                  
                  <div className="col-span-2 text-center">
                    <div className="flex flex-col items-center">
                      {entry.total_reviews > 0 ? (
                        <>
                          <motion.span 
                            className={cn(
                              "font-bold text-lg",
                              getAccuracy(entry.correct_reviews, entry.total_reviews) >= 80 && "text-emerald-500",
                              getAccuracy(entry.correct_reviews, entry.total_reviews) >= 60 && getAccuracy(entry.correct_reviews, entry.total_reviews) < 80 && "text-yellow-500",
                              getAccuracy(entry.correct_reviews, entry.total_reviews) < 60 && "text-red-500",
                            )}
                            animate={isHovered ? { scale: 1.2 } : { scale: 1 }}
                          >
                            {getAccuracy(entry.correct_reviews, entry.total_reviews)}%
                          </motion.span>
                          <span className="text-xs text-muted-foreground">
                            {entry.correct_reviews}/{entry.total_reviews}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-span-2 text-center">
                    <motion.span 
                      className={cn(
                        "font-black text-xl",
                        rank === 1 && "bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent",
                        rank === 2 && "bg-gradient-to-r from-slate-300 to-slate-400 bg-clip-text text-transparent",
                        rank === 3 && "bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent",
                        rank > 3 && "text-foreground",
                      )}
                      animate={isHovered ? { scale: 1.3 } : { scale: 1 }}
                    >
                      {entry.reviews_completed * 10}
                    </motion.span>
                  </div>
                </motion.div>
              );
            })}

            {(!leaderboard || leaderboard.length === 0) && (
              <div className="p-12 text-center text-muted-foreground">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Пока нет участников в рейтинге
                </motion.div>
              </div>
            )}
          </div>

          {/* Your Position Card */}
          {isInTop && currentProfile && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/30 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center"
                  >
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </motion.div>
                  <div>
                    <span className="font-bold text-lg">Ваша позиция: </span>
                    <span className="text-2xl font-black text-primary">#{(currentUserRank ?? 0) + 1}</span>
                  </div>
                </div>
                {currentUserRank !== undefined && currentUserRank > 0 && (
                  <motion.div 
                    className="text-sm text-muted-foreground bg-background/50 px-4 py-2 rounded-full"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    До #{currentUserRank}: нужно ещё <span className="font-bold text-primary">{((leaderboard?.[currentUserRank - 1]?.reviews_completed || 0) - currentProfile.reviews_completed) * 10}</span> очков
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
