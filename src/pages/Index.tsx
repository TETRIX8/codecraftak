import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import cyberCity from '@/assets/cyber-city.jpg';

/* =========================================================
   Neon Frame — corners like in reference
   ========================================================= */
function NeonFrame({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Border */}
      <div className="absolute inset-0 rounded-2xl border border-[hsl(var(--neon-purple)/0.4)] pointer-events-none" />
      {/* Glow halo */}
      <div className="absolute -inset-px rounded-2xl pointer-events-none"
        style={{ boxShadow: '0 0 40px hsl(var(--neon-purple) / 0.2), inset 0 0 40px hsl(var(--neon-cyan) / 0.05)' }}
      />
      {/* Corner cuts */}
      {[
        'top-0 left-0 border-t-2 border-l-2 rounded-tl-2xl',
        'top-0 right-0 border-t-2 border-r-2 rounded-tr-2xl',
        'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-2xl',
        'bottom-0 right-0 border-b-2 border-r-2 rounded-br-2xl',
      ].map((c, i) => (
        <div key={i}
          className={`absolute w-6 h-6 ${c} border-[hsl(var(--neon-cyan))] pointer-events-none`}
          style={{ boxShadow: '0 0 12px hsl(var(--neon-cyan) / 0.8)' }}
        />
      ))}
      <div className="relative">{children}</div>
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
        <div className="flex items-center justify-between gap-3 px-4 py-2 rounded-xl bg-primary/10 border border-primary/30 backdrop-blur-md text-sm">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary shrink-0" />
            <span className="text-foreground/80">
              Не открывается из РФ? Используй стабильный домен:{' '}
              <a href="https://codecraftak.lovable.app" className="font-semibold text-primary underline underline-offset-2">
                codecraftak.lovable.app
              </a>
            </span>
          </div>
          <button onClick={() => { sessionStorage.setItem('ru-banner-hidden', '1'); setHidden(true); }}
            className="text-muted-foreground hover:text-foreground" aria-label="Закрыть">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* Stat Card */
function StatCard({ icon: Icon, value, label }: { icon: typeof Users; value: string; label: string }) {
  return (
    <NeonFrame className="px-6 py-5">
      <div className="flex items-center gap-4">
        <Icon className="w-9 h-9 text-[hsl(var(--neon-purple))]"
          style={{ filter: 'drop-shadow(0 0 8px hsl(var(--neon-purple) / 0.7))' }} />
        <div>
          <div className="text-3xl font-bold text-foreground tracking-tight">{value}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-[0.2em] mt-1">{label}</div>
        </div>
      </div>
    </NeonFrame>
  );
}

/* Direction Card */
function DirectionCard({
  icon: Icon, title, description, to, color,
}: {
  icon: typeof Code2; title: string; description: string; to: string; color: string;
}) {
  return (
    <Link to={to}>
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="group h-full"
      >
        <NeonFrame className="h-full p-6 bg-card/40 backdrop-blur-xl transition-all duration-300 hover:bg-card/60">
          <div className="relative h-full flex flex-col">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 border"
              style={{
                borderColor: `hsl(${color} / 0.5)`,
                background: `hsl(${color} / 0.08)`,
                boxShadow: `0 0 20px hsl(${color} / 0.25), inset 0 0 20px hsl(${color} / 0.08)`,
              }}
            >
              <Icon className="w-7 h-7" style={{ color: `hsl(${color})`, filter: `drop-shadow(0 0 6px hsl(${color} / 0.8))` }} />
            </div>
            <h3 className="font-bold text-base uppercase tracking-wider mb-2 text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-grow">{description}</p>
            <div className="flex justify-end">
              <div className="w-9 h-9 rounded-lg border border-[hsl(var(--neon-cyan)/0.4)] flex items-center justify-center group-hover:border-[hsl(var(--neon-cyan))] group-hover:shadow-[0_0_16px_hsl(var(--neon-cyan)/0.6)] transition-all">
                <ArrowRight className="w-4 h-4 text-[hsl(var(--neon-cyan))]" />
              </div>
            </div>
          </div>
        </NeonFrame>
      </motion.div>
    </Link>
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
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    const loaded = sessionStorage.getItem('codecraft-loaded');
    if (loaded) { setIsLoading(false); setHasLoaded(true); }
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false); setHasLoaded(true);
    sessionStorage.setItem('codecraft-loaded', 'true');
  };

  const visibleDirections = directions;

  return (
    <>
      <AnimatePresence>
        {isLoading && !hasLoaded && <LoadingScreen onComplete={handleLoadingComplete} />}
      </AnimatePresence>

      <RuAccessBanner />

      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Animated grid background */}
        <div className="fixed inset-0 neon-grid opacity-40 pointer-events-none" />
        {/* Radial nebulae */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[10%] left-[5%] w-[600px] h-[600px] rounded-full bg-[hsl(var(--neon-cyan)/0.15)] blur-[140px]" />
          <div className="absolute bottom-[5%] right-[5%] w-[700px] h-[700px] rounded-full bg-[hsl(var(--neon-purple)/0.18)] blur-[160px]" />
          <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] rounded-full bg-[hsl(var(--neon-pink)/0.1)] blur-[120px]" />
        </div>

        <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
          {/* HERO PANEL */}
          <NeonFrame className="p-6 md:p-10 lg:p-14 mb-6 bg-[hsl(var(--background)/0.6)] backdrop-blur-xl">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              {/* Text */}
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7 }}
                  className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1] mb-6"
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
                  className="text-xl sm:text-2xl md:text-3xl font-bold tracking-wide uppercase mb-6 text-foreground/90"
                >
                  Образование будущего
                  <br />
                  уже сегодня
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="text-muted-foreground text-base sm:text-lg max-w-md mb-10 leading-relaxed"
                >
                  Практические курсы от экспертов
                  <br />
                  для твоего развития в цифровом мире
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
                      className="rounded-lg bg-gradient-to-r from-[hsl(var(--neon-purple))] to-[hsl(var(--neon-pink))] hover:opacity-90 text-white font-bold tracking-wider px-8 py-6 uppercase shadow-[0_0_30px_hsl(var(--neon-purple)/0.5)]"
                    >
                      Выбрать курс
                    </Button>
                  </Link>
                  <Link to="/topics">
                    <Button
                      variant="outline"
                      size="lg"
                      className="rounded-lg border-2 border-[hsl(var(--neon-cyan)/0.5)] hover:border-[hsl(var(--neon-cyan))] bg-transparent text-foreground hover:bg-[hsl(var(--neon-cyan)/0.1)] font-bold tracking-wider px-8 py-6 uppercase hover:shadow-[0_0_24px_hsl(var(--neon-cyan)/0.5)] transition-all"
                    >
                      Узнать больше
                    </Button>
                  </Link>
                </motion.div>
              </div>

              {/* Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <NeonFrame className="overflow-hidden rounded-2xl">
                  <img
                    src={cyberCity}
                    alt="Cyber megacity"
                    width={1280}
                    height={896}
                    className="w-full h-[280px] sm:h-[360px] lg:h-[440px] object-cover rounded-2xl"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[hsl(var(--neon-purple)/0.25)] via-transparent to-[hsl(var(--neon-cyan)/0.2)] mix-blend-screen pointer-events-none" />
                </NeonFrame>
              </motion.div>
            </div>
          </NeonFrame>

          {/* STATS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            <StatCard icon={BookOpen} value="120+" label="Курсов" />
            <StatCard icon={Users} value="15 000+" label="Студентов" />
            <StatCard icon={Star} value="4.9" label="Рейтинг" />
            <StatCard icon={Trophy} value="50+" label="Экспертов" />
          </motion.div>

          {/* DIRECTIONS */}
          <NeonFrame className="p-6 md:p-8 mb-12 bg-[hsl(var(--background)/0.5)] backdrop-blur-xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl md:text-2xl font-bold uppercase tracking-[0.15em] text-[hsl(var(--neon-cyan))]"
                style={{ textShadow: '0 0 12px hsl(var(--neon-cyan) / 0.6)' }}>
                Популярные направления
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setSlideIdx(Math.max(0, slideIdx - 1))}
                  className="w-10 h-10 rounded-lg border border-[hsl(var(--neon-cyan)/0.4)] hover:border-[hsl(var(--neon-cyan))] hover:shadow-[0_0_16px_hsl(var(--neon-cyan)/0.6)] flex items-center justify-center transition-all"
                  aria-label="Назад"
                >
                  <ChevronLeft className="w-5 h-5 text-[hsl(var(--neon-cyan))]" />
                </button>
                <button
                  onClick={() => setSlideIdx(slideIdx + 1)}
                  className="w-10 h-10 rounded-lg border border-[hsl(var(--neon-cyan)/0.4)] hover:border-[hsl(var(--neon-cyan))] hover:shadow-[0_0_16px_hsl(var(--neon-cyan)/0.6)] flex items-center justify-center transition-all"
                  aria-label="Вперёд"
                >
                  <ChevronRight className="w-5 h-5 text-[hsl(var(--neon-cyan))]" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {visibleDirections.map((d) => (
                <DirectionCard key={d.title} {...d} />
              ))}
            </div>
          </NeonFrame>

          {/* QUICK LINKS */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Link to="/games">
              <motion.div whileHover={{ y: -4 }}>
                <NeonFrame className="p-6 bg-card/40 backdrop-blur-xl">
                  <div className="flex items-center gap-4">
                    <Gamepad2 className="w-10 h-10 text-[hsl(var(--neon-pink))]" style={{ filter: 'drop-shadow(0 0 8px hsl(var(--neon-pink) / 0.8))' }} />
                    <div>
                      <div className="font-bold uppercase tracking-wider">Игры на монеты</div>
                      <div className="text-sm text-muted-foreground">Зарабатывай и соревнуйся</div>
                    </div>
                  </div>
                </NeonFrame>
              </motion.div>
            </Link>
            <Link to="/quest">
              <motion.div whileHover={{ y: -4 }}>
                <NeonFrame className="p-6 bg-card/40 backdrop-blur-xl">
                  <div className="flex items-center gap-4">
                    <MapIcon className="w-10 h-10 text-[hsl(var(--neon-cyan))]" style={{ filter: 'drop-shadow(0 0 8px hsl(var(--neon-cyan) / 0.8))' }} />
                    <div>
                      <div className="font-bold uppercase tracking-wider">Квест</div>
                      <div className="text-sm text-muted-foreground">Парящие острова в космосе</div>
                    </div>
                  </div>
                </NeonFrame>
              </motion.div>
            </Link>
            <Link to="/messages">
              <motion.div whileHover={{ y: -4 }}>
                <NeonFrame className="p-6 bg-card/40 backdrop-blur-xl">
                  <div className="flex items-center gap-4">
                    <MessageSquare className="w-10 h-10 text-[hsl(var(--neon-purple))]" style={{ filter: 'drop-shadow(0 0 8px hsl(var(--neon-purple) / 0.8))' }} />
                    <div>
                      <div className="font-bold uppercase tracking-wider">Сообщество</div>
                      <div className="text-sm text-muted-foreground">Чаты и личные сообщения</div>
                    </div>
                  </div>
                </NeonFrame>
              </motion.div>
            </Link>
          </div>

          {/* CTA */}
          <NeonFrame className="p-10 md:p-14 text-center bg-[hsl(var(--background)/0.6)] backdrop-blur-xl">
            <Sparkles className="w-12 h-12 mx-auto mb-6 text-[hsl(var(--neon-pink))]"
              style={{ filter: 'drop-shadow(0 0 10px hsl(var(--neon-pink) / 0.8))' }} />
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 uppercase tracking-tight">
              Готов к <span className="bg-gradient-to-r from-[hsl(var(--neon-cyan))] to-[hsl(var(--neon-pink))] bg-clip-text text-transparent">старту</span>?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Присоединяйся к экосистеме CodeCraft и прокачивай навыки будущего.
            </p>
            <Link to="/auth">
              <Button size="lg" className="rounded-lg bg-gradient-to-r from-[hsl(var(--neon-purple))] to-[hsl(var(--neon-pink))] hover:opacity-90 text-white font-bold tracking-wider px-10 py-7 uppercase shadow-[0_0_40px_hsl(var(--neon-purple)/0.5)]">
                Регистрация
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </NeonFrame>
        </div>
      </div>
    </>
  );
}
