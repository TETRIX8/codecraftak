import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import {
  ArrowRight,
  Code2,
  Users,
  CheckCircle,
  Zap,
  Shield,
  Sparkles,
  Trophy,
  Heart,
  MessageSquare,
  Gamepad2,
  Rocket,
  Globe,
  ChevronDown,
  Orbit,
  Satellite,
  Telescope,
  Star,
  X,
} from 'lucide-react';

/* =========================================================
   COSMIC BACKDROP — звёзды, туманности, кометы, планеты
   ========================================================= */

// Многослойное звёздное небо с параллаксом
function StarField() {
  const stars = useMemo(() => {
    const layers = [
      { count: 80, sizeMin: 0.5, sizeMax: 1.2, depth: 0.2, twinkle: 4 },
      { count: 50, sizeMin: 1, sizeMax: 2, depth: 0.5, twinkle: 3 },
      { count: 25, sizeMin: 1.5, sizeMax: 3, depth: 1, twinkle: 2.2 },
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

// Туманности — крупные размытые цветовые пятна
function Nebulas() {
  return (
    <>
      <motion.div
        animate={{ x: [0, 80, -40, 0], y: [0, -60, 40, 0], scale: [1, 1.2, 0.9, 1] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[10%] left-[5%] w-[700px] h-[700px] rounded-full bg-primary/25 blur-[160px]"
      />
      <motion.div
        animate={{ x: [0, -100, 50, 0], y: [0, 80, -30, 0], scale: [1.1, 1, 1.3, 1.1] }}
        transition={{ duration: 50, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[5%] right-[5%] w-[800px] h-[800px] rounded-full bg-accent/25 blur-[180px]"
      />
      <motion.div
        animate={{ x: [0, 60, -30, 0], y: [0, -40, 60, 0], scale: [0.9, 1.2, 1, 0.9] }}
        transition={{ duration: 35, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[40%] left-[40%] w-[500px] h-[500px] rounded-full bg-cyan-500/15 blur-[140px]"
      />
    </>
  );
}

// Кометы — пролетают по диагонали
function Comets() {
  const comets = useMemo(
    () =>
      Array.from({ length: 4 }).map((_, i) => ({
        id: i,
        startY: 10 + Math.random() * 60,
        delay: i * 7,
        duration: 4 + Math.random() * 3,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {comets.map((c) => (
        <motion.div
          key={c.id}
          initial={{ x: '-10vw', y: `${c.startY}vh`, opacity: 0 }}
          animate={{ x: '110vw', y: `${c.startY + 30}vh`, opacity: [0, 1, 1, 0] }}
          transition={{
            duration: c.duration,
            repeat: Infinity,
            repeatDelay: 12,
            delay: c.delay,
            ease: 'easeIn',
          }}
          className="absolute"
        >
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-foreground shadow-[0_0_20px_8px_hsl(var(--primary)/0.7)]" />
            <div
              className="absolute top-1/2 right-full -translate-y-1/2 h-px w-40"
              style={{
                background:
                  'linear-gradient(to left, hsl(var(--primary) / 0.9), transparent)',
              }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Планеты с орбитами
function OrbitingPlanet({
  size,
  orbitSize,
  duration,
  color,
  top,
  left,
  delay = 0,
}: {
  size: number;
  orbitSize: number;
  duration: number;
  color: string;
  top: string;
  left: string;
  delay?: number;
}) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{ top, left, width: orbitSize, height: orbitSize }}
    >
      {/* Орбита */}
      <div
        className="absolute inset-0 rounded-full border border-primary/15"
        style={{ borderStyle: 'dashed' }}
      />
      {/* Планета вращается по орбите */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration, repeat: Infinity, ease: 'linear', delay }}
      >
        <div
          className="absolute rounded-full"
          style={{
            width: size,
            height: size,
            top: -size / 2,
            left: '50%',
            transform: 'translateX(-50%)',
            background: color,
            boxShadow: `0 0 ${size}px ${color}, inset -${size / 4}px -${size / 4}px ${size / 2}px rgba(0,0,0,0.5)`,
          }}
        />
      </motion.div>
    </div>
  );
}

// 3D-астронавт-эмодзи следящий за курсором
function MouseFollower() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 50, damping: 20 });
  const sy = useSpring(y, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      x.set((e.clientX - cx) / 30);
      y.set((e.clientY - cy) / 30);
    };
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, [x, y]);

  return (
    <motion.div
      style={{ x: sx, y: sy }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-[120px] opacity-20 select-none"
    >
      🚀
    </motion.div>
  );
}

/* =========================================================
   UI BLOCKS
   ========================================================= */

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
        <div className="flex items-center justify-between gap-3 px-4 py-2 rounded-xl bg-primary/10 border border-primary/30 backdrop-blur-md text-sm">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary shrink-0" />
            <span className="text-foreground/80">
              Не открывается из РФ? Используй стабильный домен:{' '}
              <a
                href="https://codecraftak.lovable.app"
                className="font-semibold text-primary underline underline-offset-2"
              >
                codecraftak.lovable.app
              </a>
            </span>
          </div>
          <button
            onClick={() => {
              sessionStorage.setItem('ru-banner-hidden', '1');
              setHidden(true);
            }}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function CosmicCard({
  icon: Icon,
  title,
  description,
  index,
  accent,
}: {
  icon: typeof Code2;
  title: string;
  description: string;
  index: number;
  accent: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 20 });
  const sry = useSpring(ry, { stiffness: 200, damping: 20 });

  const handleMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 15);
    rx.set(-py * 15);
  };
  const handleLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX: srx, rotateY: sry, transformStyle: 'preserve-3d', transformPerspective: 1000 }}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay: index * 0.12 }}
      className="relative group"
    >
      <div
        className="absolute -inset-px rounded-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${accent}, transparent 60%)`,
          filter: 'blur(20px)',
        }}
      />
      <div className="relative h-full p-8 rounded-3xl bg-card/60 border border-border/60 backdrop-blur-xl overflow-hidden">
        {/* звёздная пыль внутри карточки */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)',
            backgroundSize: '20px 20px',
          }}
        />
        <div
          style={{ transform: 'translateZ(40px)' }}
          className="relative z-10"
        >
          <div
            className="inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-6"
            style={{ background: accent, boxShadow: `0 8px 30px ${accent}` }}
          >
            <Icon className="w-7 h-7 text-background" />
          </div>
          <h3 className="text-2xl font-bold mb-3">{title}</h3>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

function StatPill({ icon: Icon, value, label }: { icon: typeof Users; value: string; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="relative px-6 py-5 rounded-2xl bg-card/60 border border-border/50 backdrop-blur-xl overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative flex flex-col items-center text-center">
        <Icon className="w-7 h-7 text-primary mb-2" />
        <span className="text-3xl font-bold gradient-text">{value}</span>
        <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{label}</span>
      </div>
    </motion.div>
  );
}

/* =========================================================
   MAIN PAGE
   ========================================================= */

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.92]);
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, -100]);
  const starsParallax = useTransform(scrollYProgress, [0, 1], [0, -300]);

  useEffect(() => {
    const loaded = sessionStorage.getItem('codecraft-loaded');
    if (loaded) {
      setIsLoading(false);
      setHasLoaded(true);
    }
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    setHasLoaded(true);
    sessionStorage.setItem('codecraft-loaded', 'true');
  };

  return (
    <>
      <AnimatePresence>
        {isLoading && !hasLoaded && <LoadingScreen onComplete={handleLoadingComplete} />}
      </AnimatePresence>

      <RuAccessBanner />

      <div className="min-h-screen bg-background overflow-hidden relative">
        {/* Глобальный звёздный фон с параллаксом */}
        <motion.div style={{ y: starsParallax }} className="fixed inset-0 pointer-events-none">
          <StarField />
        </motion.div>

        {/* HERO */}
        <motion.section
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="relative min-h-screen flex items-center justify-center"
        >
          <div className="absolute inset-0">
            <Nebulas />
            <Comets />
            <MouseFollower />

            {/* Планеты с орбитами */}
            <OrbitingPlanet
              size={28}
              orbitSize={180}
              duration={20}
              color="hsl(var(--primary))"
              top="15%"
              left="8%"
            />
            <OrbitingPlanet
              size={20}
              orbitSize={140}
              duration={15}
              color="hsl(var(--accent))"
              top="65%"
              left="82%"
              delay={3}
            />
            <OrbitingPlanet
              size={36}
              orbitSize={220}
              duration={28}
              color="hsl(38 92% 55%)"
              top="70%"
              left="6%"
              delay={5}
            />
            <OrbitingPlanet
              size={16}
              orbitSize={100}
              duration={12}
              color="hsl(142 72% 50%)"
              top="20%"
              left="86%"
              delay={2}
            />
          </div>

          <div className="relative z-10 container mx-auto px-4 pt-20">
            <div className="max-w-5xl mx-auto text-center">
              {/* Бейдж */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card/40 border border-primary/30 text-primary text-sm font-medium mb-10 backdrop-blur-xl"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                >
                  <Orbit className="w-4 h-4" />
                </motion.div>
                <span>Платформа в космической лиге</span>
                <Star className="w-3 h-3 fill-current" />
              </motion.div>

              {/* Заголовок */}
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.3 }}
                className="text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] font-bold mb-8 leading-[0.85] tracking-tight"
              >
                <motion.span
                  className="block"
                  animate={{
                    textShadow: [
                      '0 0 20px hsl(var(--primary) / 0.2)',
                      '0 0 40px hsl(var(--primary) / 0.5)',
                      '0 0 20px hsl(var(--primary) / 0.2)',
                    ],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  Code
                </motion.span>
                <span className="relative inline-block">
                  <motion.span
                    className="gradient-text"
                    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                    style={{ backgroundSize: '200% 200%' }}
                  >
                    Craft
                  </motion.span>
                  <motion.span
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
                    className="absolute -top-6 -right-12 text-5xl"
                  >
                    🪐
                  </motion.span>
                </span>
              </motion.h1>

              {/* Подзаголовок */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
              >
                Запусти свою карьеру разработчика в{' '}
                <span className="text-primary font-semibold">безграничную вселенную</span> кода.
                <br className="hidden sm:block" />
                Решай. Проверяй. Достигай звёзд.
              </motion.p>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
              >
                <Link to="/tasks">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                    <Button variant="gradient" size="xl" className="group text-lg px-10 py-7 rounded-2xl shadow-[0_0_40px_hsl(var(--primary)/0.4)]">
                      <Rocket className="w-6 h-6 mr-2" />
                      Начать полёт
                      <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/games">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                    <Button variant="outline" size="xl" className="text-lg px-10 py-7 rounded-2xl border-2 backdrop-blur-md bg-card/30">
                      <Gamepad2 className="w-6 h-6 mr-2" />
                      Играть на монеты
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>

              {/* Статистика */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto"
              >
                <StatPill icon={Users} value="10K+" label="Разработчиков" />
                <StatPill icon={Code2} value="500+" label="Заданий" />
                <StatPill icon={CheckCircle} value="50K+" label="Проверок" />
                <StatPill icon={Trophy} value="1K+" label="Экспертов" />
              </motion.div>
            </div>
          </div>

          {/* Скролл вниз */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-2 text-muted-foreground"
            >
              <span className="text-xs uppercase tracking-widest">Исследуй вселенную</span>
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </motion.div>
        </motion.section>

        {/* ВОЗМОЖНОСТИ — космические карточки */}
        <section className="relative py-32">
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/40 border border-primary/30 text-primary text-sm font-medium mb-6 backdrop-blur-xl">
                <Telescope className="w-4 h-4" />
                Карта галактики
              </div>
              <h2 className="text-5xl sm:text-6xl font-bold mb-6">
                Три ступени к{' '}
                <span className="gradient-text">мастерству</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Открой бесконечный путь развития через peer-review
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              <CosmicCard
                icon={Code2}
                title="Решай задания"
                description="От простых алгоритмов до архитектурных вызовов. Выбирай сложность по силам и поднимайся выше."
                index={0}
                accent="hsl(var(--primary) / 0.4)"
              />
              <CosmicCard
                icon={Users}
                title="Проверяй других"
                description="Чтобы отправить решение, проверь чужое. Учись на коде других — это ускоряет рост в разы."
                index={1}
                accent="hsl(var(--accent) / 0.4)"
              />
              <CosmicCard
                icon={Trophy}
                title="Покоряй рейтинг"
                description="Получай баллы, бейджи, монеты. Поднимайся от Новичка до Эксперта и стань легендой."
                index={2}
                accent="hsl(38 92% 50% / 0.4)"
              />
            </div>
          </div>
        </section>

        {/* ИГРЫ */}
        <section className="relative py-32">
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/40 border border-warning/30 text-warning text-sm font-medium mb-6 backdrop-blur-xl">
                  <Gamepad2 className="w-4 h-4" />
                  Игровая зона
                </div>
                <h2 className="text-5xl sm:text-6xl font-bold mb-6">
                  Играй и{' '}
                  <span className="gradient-text">зарабатывай</span>
                </h2>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Используй заработанные монеты в играх с другими разработчиками.
                  Морской бой, рулетка, крестики-нолики — всё в одной вселенной.
                </p>
                <Link to="/games">
                  <Button variant="gradient" size="lg" className="group">
                    К играм
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>

              {/* 3D карточка-планета */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative flex items-center justify-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                  className="absolute w-[400px] h-[400px] rounded-full border border-primary/20"
                  style={{ borderStyle: 'dashed' }}
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
                  className="absolute w-[300px] h-[300px] rounded-full border border-accent/20"
                  style={{ borderStyle: 'dashed' }}
                />
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative w-56 h-56 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle at 30% 30%, hsl(var(--primary)), hsl(var(--accent)) 70%, hsl(265 70% 30%))',
                    boxShadow:
                      '0 0 80px hsl(var(--primary) / 0.5), inset -30px -30px 60px rgba(0,0,0,0.5)',
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-7xl">
                    🎮
                  </div>
                </motion.div>
                {/* Спутник */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  className="absolute w-[400px] h-[400px]"
                >
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="w-10 h-10 rounded-full bg-card border border-primary/50 flex items-center justify-center backdrop-blur-md">
                      <Satellite className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* СОЦИАЛЬНОЕ */}
        <section className="relative py-32">
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/40 border border-accent/30 text-accent text-sm font-medium mb-6 backdrop-blur-xl">
                <MessageSquare className="w-4 h-4" />
                Сообщество
              </div>
              <h2 className="text-5xl sm:text-6xl font-bold mb-6">
                Найди свой <span className="gradient-text">экипаж</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Не путешествуй один — общайся с такими же исследователями
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
              {[
                { icon: Heart, label: 'Лайки профилям', color: 'hsl(0 72% 60%)' },
                { icon: MessageSquare, label: 'Личные сообщения', color: 'hsl(var(--primary))' },
                { icon: Users, label: 'Общий чат', color: 'hsl(var(--accent))' },
                { icon: Globe, label: 'Голосовые', color: 'hsl(142 72% 45%)' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -8, scale: 1.03 }}
                  className="relative p-6 rounded-2xl bg-card/60 border border-border/60 backdrop-blur-xl text-center group"
                >
                  <div
                    className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center"
                    style={{ background: `${item.color} / 0.15`, backgroundColor: `${item.color}20` }}
                  >
                    <item.icon className="w-7 h-7" style={{ color: item.color }} />
                  </div>
                  <div className="font-semibold">{item.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA В КОНЦЕ */}
        <section className="relative py-32">
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative max-w-4xl mx-auto text-center p-12 sm:p-16 rounded-[2.5rem] bg-card/40 border border-primary/30 backdrop-blur-xl overflow-hidden"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/20 blur-3xl"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-accent/20 blur-3xl"
              />

              <div className="relative">
                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="text-6xl mb-6 inline-block"
                >
                  🚀
                </motion.div>
                <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                  Готов к <span className="gradient-text">старту</span>?
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Тысячи разработчиков уже исследуют вселенную CodeCraft. Присоединяйся.
                </p>
                <Link to="/auth">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="inline-block">
                    <Button variant="gradient" size="xl" className="text-lg px-12 py-7 rounded-2xl shadow-[0_0_60px_hsl(var(--primary)/0.5)]">
                      <Sparkles className="w-6 h-6 mr-2" />
                      Запустить ракету
                      <ArrowRight className="w-6 h-6 ml-2" />
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Фоновый шум-туманность по всей странице */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          <Nebulas />
        </div>
      </div>
    </>
  );
}
