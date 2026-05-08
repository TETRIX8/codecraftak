import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import {
  ArrowRight,
  Code2,
  Users,
  BookOpen,
  Star,
  Trophy,
  Gamepad2,
  Brain,
  Shield,
  Palette,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Globe,
  X,
  Sparkles,
  MessageSquare,
  Map as MapIcon,
  Zap,
  Terminal,
  Cpu,
} from 'lucide-react';
import cyberCity from '@/assets/cyber-city.jpg';

/* =========================================================
   Cyberpunk Neon Frame with animated corners
   ========================================================= */
function NeonFrame({ children, className = '', glow = true }: { children: React.ReactNode; className?: string; glow?: boolean }) {
  return (
    <div className={`relative group ${className}`}>
      {/* Animated border gradient */}
      <div className="absolute -inset-[1px] rounded-2xl overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,hsl(var(--neon-cyan)),hsl(var(--neon-purple)),hsl(var(--neon-pink)),hsl(var(--neon-cyan)))]"
          style={{ opacity: 0.4 }}
        />
      </div>
      {/* Inner background */}
      <div className="absolute inset-[1px] rounded-2xl bg-[hsl(var(--background)/0.95)]" />
      
      {/* Glow halo */}
      {glow && (
        <div className="absolute -inset-px rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ boxShadow: '0 0 60px hsl(var(--neon-purple) / 0.3), inset 0 0 60px hsl(var(--neon-cyan) / 0.05)' }}
        />
      )}
      
      {/* Corner cuts with glow */}
      {[
        'top-0 left-0 border-t-2 border-l-2 rounded-tl-2xl',
        'top-0 right-0 border-t-2 border-r-2 rounded-tr-2xl',
        'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-2xl',
        'bottom-0 right-0 border-b-2 border-r-2 rounded-br-2xl',
      ].map((c, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
          className={`absolute w-8 h-8 ${c} border-[hsl(var(--neon-cyan))] pointer-events-none`}
          style={{ boxShadow: '0 0 15px hsl(var(--neon-cyan) / 0.8)' }}
        />
      ))}
      <div className="relative">{children}</div>
    </div>
  );
}

/* =========================================================
   Floating holographic particles
   ========================================================= */
function HoloParticles() {
  const particles = useMemo(() => 
    Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 10 + Math.random() * 20,
      delay: Math.random() * 5,
      color: ['var(--neon-cyan)', 'var(--neon-purple)', 'var(--neon-pink)'][Math.floor(Math.random() * 3)],
    })), []
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: `${p.x}vw`, y: `${p.y}vh`, opacity: 0 }}
          animate={{ 
            y: [`${p.y}vh`, `${p.y - 30}vh`, `${p.y}vh`],
            opacity: [0, 0.6, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut"
          }}
          className="absolute rounded-full"
          style={{ 
            width: p.size, 
            height: p.size,
            background: `hsl(${p.color})`,
            boxShadow: `0 0 ${p.size * 4}px hsl(${p.color})` 
          }}
        />
      ))}
    </div>
  );
}

/* =========================================================
   Animated grid background
   ========================================================= */
function CyberGrid() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Main grid */}
      <motion.div 
        animate={{ backgroundPosition: ['0px 0px', '40px 40px'] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--neon-cyan) / 0.1) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--neon-cyan) / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      {/* Larger grid overlay */}
      <motion.div 
        animate={{ backgroundPosition: ['0px 0px', '100px 100px'] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--neon-purple) / 0.2) 2px, transparent 2px),
            linear-gradient(90deg, hsl(var(--neon-purple) / 0.2) 2px, transparent 2px)
          `,
          backgroundSize: '100px 100px',
        }}
      />
      {/* Scanning line */}
      <motion.div
        initial={{ top: '-5%' }}
        animate={{ top: '105%' }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent, hsl(var(--neon-cyan) / 0.5), transparent)',
          boxShadow: '0 0 30px 5px hsl(var(--neon-cyan) / 0.3)',
        }}
      />
    </div>
  );
}

function RuAccessBanner() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    setHidden(sessionStorage.getItem('ru-banner-hidden') === '1');
  }, []);
  if (hidden) return null;
  const isPreview = typeof window !== 'undefined' && window.location.hostname.includes('lovableproject.com');
  if (!isPreview) return null;

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-16 left-0 right-0 z-40 px-4"
    >
      <div className="container mx-auto">
        <NeonFrame className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-2 text-sm bg-[hsl(var(--card)/0.8)] backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[hsl(var(--neon-cyan))]" />
              <span className="text-foreground/80">
                Не открывается из РФ? Используй стабильный домен:{' '}
                <a href="https://codecraftak.lovable.app" className="font-semibold text-[hsl(var(--neon-cyan))] underline underline-offset-2">
                  codecraftak.lovable.app
                </a>
              </span>
            </div>
            <button onClick={() => { sessionStorage.setItem('ru-banner-hidden', '1'); setHidden(true); }}
              className="text-muted-foreground hover:text-foreground" aria-label="Закрыть">
              <X className="w-4 h-4" />
            </button>
          </div>
        </NeonFrame>
      </div>
    </motion.div>
  );
}

/* Stat Card with holographic effect */
function StatCard({ icon: Icon, value, label, delay = 0 }: { icon: typeof Users; value: string; label: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
    >
      <NeonFrame className="px-6 py-5 bg-[hsl(var(--card)/0.5)] backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ 
              boxShadow: [
                '0 0 20px hsl(var(--neon-purple) / 0.4)',
                '0 0 40px hsl(var(--neon-purple) / 0.6)',
                '0 0 20px hsl(var(--neon-purple) / 0.4)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-12 h-12 rounded-xl flex items-center justify-center bg-[hsl(var(--neon-purple)/0.15)] border border-[hsl(var(--neon-purple)/0.3)]"
          >
            <Icon className="w-6 h-6 text-[hsl(var(--neon-purple))]" />
          </motion.div>
          <div>
            <motion.div 
              className="text-3xl font-bold tracking-tight"
              style={{ 
                color: 'hsl(var(--foreground))',
                textShadow: '0 0 20px hsl(var(--neon-cyan) / 0.3)',
              }}
            >
              {value}
            </motion.div>
            <div className="text-xs text-muted-foreground uppercase tracking-[0.2em] mt-1">{label}</div>
          </div>
        </div>
      </NeonFrame>
    </motion.div>
  );
}

/* Direction Card with cyberpunk styling */
function DirectionCard({
  icon: Icon, title, description, to, color, delay = 0,
}: {
  icon: typeof Code2; title: string; description: string; to: string; color: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
    >
      <Link to={to}>
        <motion.div
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="group h-full"
        >
          <NeonFrame className="h-full p-6 bg-[hsl(var(--card)/0.4)] backdrop-blur-xl">
            <div className="relative h-full flex flex-col">
              {/* Icon container with glow */}
              <motion.div
                whileHover={{
                  boxShadow: `0 0 40px hsl(${color} / 0.6), inset 0 0 20px hsl(${color} / 0.2)`,
                }}
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 border transition-all duration-300"
                style={{
                  borderColor: `hsl(${color} / 0.5)`,
                  background: `hsl(${color} / 0.08)`,
                  boxShadow: `0 0 20px hsl(${color} / 0.25)`,
                }}
              >
                <Icon className="w-7 h-7" style={{ color: `hsl(${color})`, filter: `drop-shadow(0 0 8px hsl(${color} / 0.8))` }} />
              </motion.div>
              
              <h3 className="font-bold text-base uppercase tracking-wider mb-2 text-foreground group-hover:text-[hsl(var(--neon-cyan))] transition-colors">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-grow">{description}</p>
              
              {/* Arrow indicator */}
              <div className="flex justify-end">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="w-9 h-9 rounded-lg border border-[hsl(var(--neon-cyan)/0.4)] flex items-center justify-center group-hover:border-[hsl(var(--neon-cyan))] group-hover:bg-[hsl(var(--neon-cyan)/0.1)] transition-all"
                  style={{ boxShadow: '0 0 0 0 hsl(var(--neon-cyan) / 0)' }}
                >
                  <ArrowRight className="w-4 h-4 text-[hsl(var(--neon-cyan))] group-hover:translate-x-1 transition-transform" />
                </motion.div>
              </div>

              {/* Hover glow effect */}
              <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 0%, hsl(${color} / 0.15), transparent 70%)`,
                }}
              />
            </div>
          </NeonFrame>
        </motion.div>
      </Link>
    </motion.div>
  );
}

/* Quick Link Card */
function QuickLinkCard({ 
  to, icon: Icon, title, subtitle, color, delay = 0 
}: { 
  to: string; 
  icon: typeof Gamepad2; 
  title: string; 
  subtitle: string; 
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
    >
      <Link to={to}>
        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          className="group"
        >
          <NeonFrame className="p-6 bg-[hsl(var(--card)/0.4)] backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ 
                  boxShadow: [
                    `0 0 15px hsl(${color} / 0.4)`,
                    `0 0 30px hsl(${color} / 0.6)`,
                    `0 0 15px hsl(${color} / 0.4)`,
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: `hsl(${color} / 0.1)`,
                  border: `1px solid hsl(${color} / 0.3)`,
                }}
              >
                <Icon 
                  className="w-6 h-6" 
                  style={{ 
                    color: `hsl(${color})`,
                    filter: `drop-shadow(0 0 8px hsl(${color} / 0.8))` 
                  }} 
                />
              </motion.div>
              <div>
                <div className="font-bold uppercase tracking-wider group-hover:text-[hsl(var(--neon-cyan))] transition-colors">{title}</div>
                <div className="text-sm text-muted-foreground">{subtitle}</div>
              </div>
              <ArrowRight className="w-5 h-5 ml-auto text-muted-foreground group-hover:text-[hsl(var(--neon-cyan))] group-hover:translate-x-1 transition-all" />
            </div>
          </NeonFrame>
        </motion.div>
      </Link>
    </motion.div>
  );
}

const directions = [
  { icon: Code2, title: 'Программирование', description: 'Разработка, языки и алгоритмы', to: '/tasks', color: 'var(--neon-cyan)' },
  { icon: Brain, title: 'Искусственный интеллект', description: 'Машинное обучение и нейросети', to: '/topics', color: 'var(--neon-purple)' },
  { icon: Shield, title: 'Кибербезопасность', description: 'Защита данных и этичный хакинг', to: '/topics', color: 'var(--neon-pink)' },
  { icon: Palette, title: 'Дизайн', description: 'UI/UX, графика и визуальные коммуникации', to: '/topics', color: 'var(--neon-purple)' },
  { icon: TrendingUp, title: 'Маркетинг', description: 'SMM, таргетинг и аналитика', to: '/topics', color: 'var(--neon-cyan)' },
];

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const loaded = sessionStorage.getItem('codecraft-loaded');
    if (loaded) { setIsLoading(false); setHasLoaded(true); }
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false); setHasLoaded(true);
    sessionStorage.setItem('codecraft-loaded', 'true');
  };

  return (
    <>
      <AnimatePresence>
        {isLoading && !hasLoaded && <LoadingScreen onComplete={handleLoadingComplete} />}
      </AnimatePresence>

      <RuAccessBanner />

      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Background effects */}
        <CyberGrid />
        <HoloParticles />
        
        {/* Radial nebulae */}
        <div className="fixed inset-0 pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.2, 0.15] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-[10%] left-[5%] w-[600px] h-[600px] rounded-full bg-[hsl(var(--neon-cyan)/0.15)] blur-[140px]" 
          />
          <motion.div 
            animate={{ scale: [1, 1.15, 1], opacity: [0.18, 0.25, 0.18] }}
            transition={{ duration: 10, repeat: Infinity, delay: 2 }}
            className="absolute bottom-[5%] right-[5%] w-[700px] h-[700px] rounded-full bg-[hsl(var(--neon-purple)/0.18)] blur-[160px]" 
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
            transition={{ duration: 12, repeat: Infinity, delay: 4 }}
            className="absolute top-[40%] left-[50%] w-[400px] h-[400px] rounded-full bg-[hsl(var(--neon-pink)/0.1)] blur-[120px]" 
          />
        </div>

        <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
          {/* HERO PANEL */}
          <NeonFrame className="p-6 md:p-10 lg:p-14 mb-6 bg-[hsl(var(--background)/0.6)] backdrop-blur-xl overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-5">
              <motion.div
                animate={{ backgroundPosition: ['0 0', '100px 100px'] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300ffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-10 items-center relative">
              {/* Text */}
              <div>
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[hsl(var(--neon-cyan)/0.3)] bg-[hsl(var(--neon-cyan)/0.1)] mb-6"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <Cpu className="w-4 h-4 text-[hsl(var(--neon-cyan))]" />
                  </motion.div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[hsl(var(--neon-cyan))]">
                    Neural Education System v2.0
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7 }}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[0.9] mb-6"
                >
                  <span className="text-foreground">CODE</span>
                  <span className="bg-gradient-to-r from-[hsl(var(--neon-cyan))] via-[hsl(var(--neon-purple))] to-[hsl(var(--neon-pink))] bg-clip-text text-transparent">
                    CRAFT
                  </span>
                </motion.h1>
                
                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="text-xl sm:text-2xl md:text-3xl font-bold tracking-wide uppercase mb-6"
                  style={{
                    color: 'hsl(var(--foreground) / 0.9)',
                    textShadow: '0 0 30px hsl(var(--neon-purple) / 0.3)',
                  }}
                >
                  Образование будущего
                  <br />
                  <span className="text-[hsl(var(--neon-pink))]">уже сегодня</span>
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="text-muted-foreground text-base sm:text-lg max-w-md mb-10 leading-relaxed"
                >
                  Практические курсы от экспертов для твоего развития в цифровом мире. 
                  <span className="text-[hsl(var(--neon-cyan))]"> Прокачай скиллы</span> и стань частью нового поколения.
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                  className="flex flex-wrap gap-4"
                >
                  <Link to="/tasks">
                    <Button
                      size="lg"
                      className="rounded-lg bg-gradient-to-r from-[hsl(var(--neon-purple))] to-[hsl(var(--neon-pink))] hover:opacity-90 text-white font-bold tracking-wider px-8 py-6 uppercase relative overflow-hidden group"
                      style={{
                        boxShadow: '0 0 30px hsl(var(--neon-purple)/0.5), 0 0 60px hsl(var(--neon-purple)/0.25)',
                      }}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Выбрать курс
                      </span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--neon-pink))] to-[hsl(var(--neon-purple))] opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </Button>
                  </Link>
                  <Link to="/topics">
                    <Button
                      variant="outline"
                      size="lg"
                      className="rounded-lg border-2 border-[hsl(var(--neon-cyan)/0.5)] hover:border-[hsl(var(--neon-cyan))] bg-transparent text-foreground hover:bg-[hsl(var(--neon-cyan)/0.1)] font-bold tracking-wider px-8 py-6 uppercase transition-all"
                      style={{
                        boxShadow: '0 0 0 0 hsl(var(--neon-cyan) / 0)',
                      }}
                    >
                      <Terminal className="w-5 h-5 mr-2" />
                      Узнать больше
                    </Button>
                  </Link>
                </motion.div>
              </div>

              {/* Image with holographic effect */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, rotateY: -10 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
                style={{ perspective: '1000px' }}
              >
                <NeonFrame className="overflow-hidden rounded-2xl">
                  <div className="relative">
                    <img
                      src={cyberCity}
                      alt="Cyber megacity"
                      width={1280}
                      height={896}
                      className="w-full h-[280px] sm:h-[360px] lg:h-[440px] object-cover rounded-2xl"
                    />
                    {/* Holographic overlay */}
                    <motion.div
                      animate={{ opacity: [0.3, 0.5, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{
                        background: 'linear-gradient(135deg, hsl(var(--neon-purple)/0.2), transparent, hsl(var(--neon-cyan)/0.2))',
                        mixBlendMode: 'screen',
                      }}
                    />
                    {/* Scan line */}
                    <motion.div
                      initial={{ top: '-10%' }}
                      animate={{ top: '110%' }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-[2px] pointer-events-none"
                      style={{
                        background: 'linear-gradient(90deg, transparent, hsl(var(--neon-cyan) / 0.8), transparent)',
                        boxShadow: '0 0 20px 3px hsl(var(--neon-cyan) / 0.5)',
                      }}
                    />
                    {/* Corner markers */}
                    <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[hsl(var(--neon-cyan))] opacity-60" />
                    <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[hsl(var(--neon-cyan))] opacity-60" />
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[hsl(var(--neon-cyan))] opacity-60" />
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[hsl(var(--neon-cyan))] opacity-60" />
                  </div>
                </NeonFrame>

                {/* Floating data badge */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="absolute -right-4 top-1/2 -translate-y-1/2 hidden lg:block"
                >
                  <div 
                    className="px-4 py-3 rounded-lg border border-[hsl(var(--neon-purple)/0.5)] bg-[hsl(var(--background)/0.9)] backdrop-blur-xl"
                    style={{ boxShadow: '0 0 20px hsl(var(--neon-purple) / 0.3)' }}
                  >
                    <div className="text-xs font-mono text-[hsl(var(--neon-purple))] mb-1">ACTIVE USERS</div>
                    <motion.div 
                      className="text-2xl font-bold text-foreground"
                      animate={{ opacity: [1, 0.7, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      15,247
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </NeonFrame>

          {/* STATS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon={BookOpen} value="120+" label="Курсов" delay={0} />
            <StatCard icon={Users} value="15 000+" label="Студентов" delay={0.1} />
            <StatCard icon={Star} value="4.9" label="Рейтинг" delay={0.2} />
            <StatCard icon={Trophy} value="50+" label="Экспертов" delay={0.3} />
          </div>

          {/* DIRECTIONS */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <NeonFrame className="p-6 md:p-8 mb-12 bg-[hsl(var(--background)/0.5)] backdrop-blur-xl overflow-hidden">
              {/* Section header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 rounded-lg border border-[hsl(var(--neon-cyan)/0.5)] flex items-center justify-center"
                    style={{ boxShadow: '0 0 15px hsl(var(--neon-cyan) / 0.3)' }}
                  >
                    <Cpu className="w-5 h-5 text-[hsl(var(--neon-cyan))]" />
                  </motion.div>
                  <h2 
                    className="text-xl md:text-2xl font-bold uppercase tracking-[0.15em] text-[hsl(var(--neon-cyan))]"
                    style={{ textShadow: '0 0 20px hsl(var(--neon-cyan) / 0.5)' }}
                  >
                    Популярные направления
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {directions.map((d, i) => (
                  <DirectionCard key={d.title} {...d} delay={i * 0.1} />
                ))}
              </div>
            </NeonFrame>
          </motion.div>

          {/* QUICK LINKS */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <QuickLinkCard
              to="/games"
              icon={Gamepad2}
              title="Игры на монеты"
              subtitle="Зарабатывай и соревнуйся"
              color="var(--neon-pink)"
              delay={0}
            />
            <QuickLinkCard
              to="/quest"
              icon={MapIcon}
              title="Квест"
              subtitle="Парящие острова в космосе"
              color="var(--neon-cyan)"
              delay={0.1}
            />
            <QuickLinkCard
              to="/messages"
              icon={MessageSquare}
              title="Сообщество"
              subtitle="Чаты и личные сообщения"
              color="var(--neon-purple)"
              delay={0.2}
            />
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <NeonFrame className="p-10 md:p-14 text-center bg-[hsl(var(--background)/0.6)] backdrop-blur-xl overflow-hidden">
              {/* Background animated elements */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      x: ['-100%', '200%'],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: "linear",
                    }}
                    className="absolute h-[1px] w-32"
                    style={{
                      top: `${20 + i * 15}%`,
                      background: `linear-gradient(90deg, transparent, hsl(var(--neon-cyan) / 0.5), transparent)`,
                    }}
                  />
                ))}
              </div>

              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Sparkles 
                  className="w-12 h-12 mx-auto mb-6 text-[hsl(var(--neon-pink))]"
                  style={{ filter: 'drop-shadow(0 0 15px hsl(var(--neon-pink) / 0.8))' }} 
                />
              </motion.div>
              
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4 uppercase tracking-tight relative">
                Готов к{' '}
                <span 
                  className="bg-gradient-to-r from-[hsl(var(--neon-cyan))] to-[hsl(var(--neon-pink))] bg-clip-text text-transparent"
                  style={{ textShadow: '0 0 30px hsl(var(--neon-cyan) / 0.5)' }}
                >
                  старту
                </span>
                ?
              </h2>
              
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto relative">
                Присоединяйся к экосистеме CodeCraft и прокачивай навыки будущего.
              </p>
              
              <Link to="/auth">
                <Button 
                  size="lg" 
                  className="rounded-lg bg-gradient-to-r from-[hsl(var(--neon-purple))] to-[hsl(var(--neon-pink))] hover:opacity-90 text-white font-bold tracking-wider px-10 py-7 uppercase relative overflow-hidden group"
                  style={{ boxShadow: '0 0 40px hsl(var(--neon-purple)/0.5), 0 0 80px hsl(var(--neon-purple)/0.25)' }}
                >
                  <span className="relative z-10 flex items-center">
                    Регистрация
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <motion.div
                    animate={{ x: ['0%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                </Button>
              </Link>
            </NeonFrame>
          </motion.div>
        </div>
      </div>
    </>
  );
}
