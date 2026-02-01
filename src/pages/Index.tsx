import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { 
  ArrowRight, 
  Code2, 
  Users, 
  CheckCircle, 
  Zap, 
  Star, 
  Shield,
  Sparkles,
  Terminal,
  GitBranch,
  Trophy,
  Heart,
  MessageSquare,
  Gamepad2,
  Brain,
  Rocket,
  Target,
  Award,
  BookOpen,
  Layers,
  Globe,
  ChevronDown
} from 'lucide-react';

// Animated particles component
function FloatingParticles() {
  const particles = useMemo(() => 
    Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 3 + Math.random() * 6,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * 5,
    })), []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: `${p.x}vw`, y: `${p.y}vh`, opacity: 0 }}
          animate={{ 
            y: [`${p.y}vh`, `${p.y - 30}vh`, `${p.y}vh`],
            x: [`${p.x}vw`, `${p.x + 5}vw`, `${p.x}vw`],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1, 0.5]
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
            background: `radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)`,
          }}
        />
      ))}
    </div>
  );
}

// Animated code lines background
function CodeLinesBackground() {
  const lines = useMemo(() => [
    'const developer = await createExpert();',
    'function solveChallenge(task) { ... }',
    'export class CodeCraft extends Platform',
    'const skills = [...learning, ...practice];',
    'await peer.review(solution);',
    'return { success: true, level: "expert" };',
  ], []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-[0.03] pointer-events-none">
      {lines.map((line, i) => (
        <motion.div
          key={i}
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: '100vw', opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 20 + i * 2,
            repeat: Infinity,
            delay: i * 3,
            ease: "linear"
          }}
          className="absolute font-mono text-primary whitespace-nowrap"
          style={{ top: `${15 + i * 12}%` }}
        >
          {line}
        </motion.div>
      ))}
    </div>
  );
}

// Glowing orbs with morphing effect
function GlowingOrbs() {
  return (
    <>
      <motion.div
        animate={{
          x: [0, 100, 50, 0],
          y: [0, -50, 50, 0],
          scale: [1, 1.3, 0.9, 1],
          borderRadius: ['50%', '40%', '60%', '50%']
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 blur-[150px]"
      />
      <motion.div
        animate={{
          x: [0, -80, 30, 0],
          y: [0, 80, -40, 0],
          scale: [1.2, 1, 1.4, 1.2],
          borderRadius: ['50%', '55%', '45%', '50%']
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-1/4 w-[700px] h-[700px] bg-accent/15 blur-[150px]"
      />
      <motion.div
        animate={{
          x: [0, 60, -30, 0],
          y: [0, -40, 60, 0],
          scale: [0.8, 1.1, 0.9, 0.8],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-success/10 rounded-full blur-[120px]"
      />
    </>
  );
}

// Animated grid pattern
function AnimatedGrid() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.03 }}
      transition={{ duration: 2 }}
      className="absolute inset-0"
      style={{
        backgroundImage: `
          linear-gradient(hsl(var(--primary)) 1.5px, transparent 1.5px),
          linear-gradient(90deg, hsl(var(--primary)) 1.5px, transparent 1.5px)
        `,
        backgroundSize: '80px 80px'
      }}
    />
  );
}

// Feature card with hover effects
function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  gradient, 
  index 
}: { 
  icon: typeof Code2; 
  title: string; 
  description: string; 
  gradient: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      whileHover={{ y: -10, transition: { duration: 0.3 } }}
      className="group relative"
    >
      {/* Glow effect on hover */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-xl transition-opacity duration-500" 
      />
      
      <div className="relative p-8 rounded-3xl bg-card border border-border hover:border-primary/50 transition-all duration-500 h-full overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }} />
        </div>
        
        {/* Icon with animation */}
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 5 }}
          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 shadow-lg`}
        >
          <Icon className="w-8 h-8 text-background" />
        </motion.div>
        
        <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground text-lg leading-relaxed">{description}</p>
        
        {/* Bottom gradient line */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} origin-left`}
        />
      </div>
    </motion.div>
  );
}

// Stats counter with animation
function AnimatedCounter({ value, label, icon: Icon }: { value: string; label: string; icon: typeof Users }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05 }}
      className="flex flex-col items-center p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm"
    >
      <Icon className="w-8 h-8 text-primary mb-3" />
      <motion.span 
        className="text-4xl font-bold gradient-text"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {value}
      </motion.span>
      <span className="text-muted-foreground mt-1">{label}</span>
    </motion.div>
  );
}

// Section divider with animation
function SectionDivider() {
  return (
    <div className="relative py-20">
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
      />
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary"
      />
    </div>
  );
}

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

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

  const floatingIcons = useMemo(() => [
    { Icon: Terminal, x: '8%', y: '18%', delay: 0, size: 'w-10 h-10' },
    { Icon: GitBranch, x: '88%', y: '12%', delay: 1, size: 'w-8 h-8' },
    { Icon: Code2, x: '12%', y: '72%', delay: 2, size: 'w-12 h-12' },
    { Icon: Sparkles, x: '82%', y: '78%', delay: 0.5, size: 'w-8 h-8' },
    { Icon: Trophy, x: '92%', y: '42%', delay: 1.5, size: 'w-10 h-10' },
    { Icon: Heart, x: '4%', y: '48%', delay: 2.5, size: 'w-8 h-8' },
    { Icon: Rocket, x: '75%', y: '25%', delay: 3, size: 'w-9 h-9' },
    { Icon: Brain, x: '20%', y: '35%', delay: 1.8, size: 'w-9 h-9' },
  ], []);

  return (
    <>
      <AnimatePresence>
        {isLoading && !hasLoaded && (
          <LoadingScreen onComplete={handleLoadingComplete} />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-background overflow-hidden">
        {/* Hero Section */}
        <motion.section 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative min-h-screen flex items-center justify-center"
        >
          {/* Animated Background */}
          <div className="absolute inset-0">
            <AnimatedGrid />
            <CodeLinesBackground />
            <GlowingOrbs />
            <FloatingParticles />

            {/* Floating icons */}
            {floatingIcons.map(({ Icon, x, y, delay, size }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0.15, 0.4, 0.15],
                  scale: 1,
                  y: [0, -25, 0],
                  rotate: [0, 15, -15, 0]
                }}
                transition={{ 
                  opacity: { duration: 5, repeat: Infinity, delay },
                  scale: { duration: 0.8, delay: delay + 0.5 },
                  y: { duration: 8, repeat: Infinity, delay },
                  rotate: { duration: 10, repeat: Infinity, delay }
                }}
                style={{ left: x, top: y }}
                className="absolute text-primary/40"
              >
                <Icon className={size} />
              </motion.div>
            ))}
          </div>

          <div className="relative z-10 container mx-auto px-4 pt-20">
            <div className="max-w-5xl mx-auto text-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-primary text-sm font-medium mb-10 backdrop-blur-sm"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                  <span>MoksHub - Платформа нового поколения</span>
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Main heading */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold mb-10 leading-[0.85] tracking-tight">
                  <motion.span 
                    className="block"
                    animate={{ 
                      textShadow: [
                        '0 0 0px transparent',
                        '0 0 30px hsl(var(--primary) / 0.3)',
                        '0 0 0px transparent'
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    Code
                  </motion.span>
                  <span className="relative inline-block">
                    <motion.span 
                      className="gradient-text"
                      animate={{ 
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                      }}
                      transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                      style={{ backgroundSize: '200% 200%' }}
                    >
                      Craft
                    </motion.span>
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1,
                        rotate: [0, 10, -10, 0]
                      }}
                      transition={{ 
                        opacity: { delay: 0.6 },
                        scale: { delay: 0.6, type: "spring" },
                        rotate: { delay: 1, duration: 0.5, repeat: Infinity, repeatDelay: 3 }
                      }}
                      className="absolute -top-4 -right-8 text-4xl"
                    >
                      ⚡
                    </motion.span>
                    <motion.div
                      animate={{ 
                        scale: [1, 1.3, 1], 
                        opacity: [0.3, 0.6, 0.3] 
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute -inset-6 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl -z-10"
                    />
                  </span>
                </h1>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl sm:text-2xl lg:text-3xl text-muted-foreground max-w-3xl mx-auto mb-14 leading-relaxed"
              >
                Мастерство программирования через{' '}
                <span className="text-primary font-semibold">взаимную проверку кода</span>.
                <br className="hidden sm:block" />
                Решай, проверяй, становись экспертом.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-5 justify-center mb-20"
              >
                <Link to="/tasks">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="gradient" size="xl" className="w-full sm:w-auto group text-lg px-10 py-7 rounded-2xl">
                      <Zap className="w-6 h-6 mr-2" />
                      Начать обучение
                      <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/games">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline" size="xl" className="w-full sm:w-auto text-lg px-10 py-7 rounded-2xl border-2">
                      <Gamepad2 className="w-6 h-6 mr-2" />
                      Играть на монеты
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>

              {/* Quick stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
              >
                <AnimatedCounter icon={Users} value="10K+" label="Разработчиков" />
                <AnimatedCounter icon={Code2} value="500+" label="Заданий" />
                <AnimatedCounter icon={CheckCircle} value="50K+" label="Проверок" />
                <AnimatedCounter icon={Trophy} value="1K+" label="Экспертов" />
              </motion.div>
            </div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-2 text-muted-foreground"
            >
              <span className="text-sm">Листай вниз</span>
              <ChevronDown className="w-6 h-6" />
            </motion.div>
          </motion.div>
        </motion.section>

        <SectionDivider />

        {/* Features Section */}
        <section className="py-32 relative">
          <FloatingParticles />
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
              >
                <Layers className="w-4 h-4" />
                Как это работает
              </motion.div>
              <h2 className="text-5xl sm:text-6xl font-bold mb-6">
                Система{' '}
                <span className="gradient-text">Peer-Review</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Уникальная методология обучения через взаимную проверку кода
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={Code2}
                title="Решай задания"
                description="Выбирай задания по уровню сложности. От простых алгоритмов до сложных архитектурных решений."
                gradient="from-primary to-cyan-400"
                index={0}
              />
              <FeatureCard
                icon={Users}
                title="Проверяй других"
                description="Чтобы отправить решение, проверь работу другого участника. Учись на чужих решениях."
                gradient="from-accent to-purple-400"
                index={1}
              />
              <FeatureCard
                icon={Trophy}
                title="Расти в рейтинге"
                description="Получай баллы, бейджи и монеты. Повышай уровень от Новичка до Эксперта."
                gradient="from-warning to-orange-400"
                index={2}
              />
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* Games Section */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-card/30 to-transparent" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 border border-warning/20 text-warning text-sm font-medium mb-6"
                >
                  <Gamepad2 className="w-4 h-4" />
                  Игровая зона
                </motion.div>
                <h2 className="text-5xl sm:text-6xl font-bold mb-6">
                  Играй и{' '}
                  <span className="gradient-text">зарабатывай</span>
                </h2>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Используй заработанные монеты в играх с другими участниками.
                  Морской бой, русская рулетка и другие игры ждут тебя!
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Target, label: 'Морской бой', color: 'text-blue-400' },
                    { icon: Zap, label: 'Русская рулетка', color: 'text-red-400' },
                    { icon: Award, label: 'Крестики-нолики', color: 'text-green-400' },
                    { icon: Star, label: 'Камень-ножницы', color: 'text-yellow-400' },
                  ].map((game, i) => (
                    <motion.div
                      key={game.label}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
                    >
                      <game.icon className={`w-6 h-6 ${game.color}`} />
                      <span className="font-medium">{game.label}</span>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="mt-8"
                >
                  <Link to="/games">
                    <Button variant="gradient" size="lg" className="group">
                      Перейти к играм
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.02, 1]
                  }}
                  transition={{ duration: 6, repeat: Infinity }}
                  className="absolute -inset-4 bg-gradient-to-br from-warning/20 to-primary/20 rounded-3xl blur-3xl"
                />
                <div className="relative p-8 rounded-3xl bg-card border border-border overflow-hidden">
                  {/* Game preview mockup */}
                  <div className="grid grid-cols-10 gap-1">
                    {Array.from({ length: 100 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.005 }}
                        className={`aspect-square rounded-sm ${
                          [12, 13, 14, 22, 32, 45, 46, 47, 67, 77, 87].includes(i)
                            ? 'bg-primary'
                            : [25, 35, 55, 65, 75].includes(i)
                            ? 'bg-red-500'
                            : 'bg-muted/30'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="mt-6 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="text-sm text-muted-foreground">Твои корабли</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-sm text-muted-foreground">Попадания</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* Social Features */}
        <section className="py-32">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6"
                >
                  <MessageSquare className="w-4 h-4" />
                  Социальные функции
                </motion.div>
                <h2 className="text-5xl sm:text-6xl font-bold mb-6">
                  Общайся и{' '}
                  <span className="gradient-text">находи друзей</span>
                </h2>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Не просто учись — становись частью сообщества разработчиков.
                  Общайся, делись опытом и находи единомышленников.
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: Heart, label: 'Лайки профилям' },
                    { icon: MessageSquare, label: 'Личные сообщения' },
                    { icon: Users, label: 'Общий чат' },
                    { icon: Globe, label: 'Голосовые сообщения' },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ scale: 1.05, x: 5 }}
                      className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -inset-4 bg-gradient-to-br from-accent/20 to-primary/20 rounded-3xl blur-3xl"
                />
                <div className="relative p-8 rounded-3xl bg-card border border-border">
                  {/* Chat preview */}
                  <div className="space-y-4">
                    {[
                      { name: 'Alex', message: 'Привет! Как решил задачу #42?', isOwn: false },
                      { name: 'Ты', message: 'Использовал рекурсию с мемоизацией', isOwn: true },
                      { name: 'Alex', message: 'Круто! Можешь объяснить?', isOwn: false },
                    ].map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.2 }}
                        className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] p-4 rounded-2xl ${
                          msg.isOwn 
                            ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-br-md' 
                            : 'bg-muted rounded-bl-md'
                        }`}>
                          {!msg.isOwn && (
                            <div className="text-xs text-muted-foreground mb-1">{msg.name}</div>
                          )}
                          <p>{msg.message}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* Trust System */}
        <section className="py-32">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-2 lg:order-1"
              >
                <div className="relative p-8 rounded-3xl bg-card border border-border">
                  <div className="space-y-8">
                    {[
                      { label: 'Рейтинг доверия', value: 94, color: 'from-primary to-cyan-400' },
                      { label: 'Выполненных проверок', value: 67, color: 'from-accent to-purple-400' },
                      { label: 'Точность оценок', value: 89, color: 'from-success to-emerald-400' },
                    ].map((stat, index) => (
                      <div key={stat.label}>
                        <div className="flex justify-between mb-3">
                          <span className="text-muted-foreground">{stat.label}</span>
                          <motion.span 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="font-bold text-lg"
                          >
                            {stat.value}%
                          </motion.span>
                        </div>
                        <div className="h-4 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${stat.value}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, delay: index * 0.2, ease: "easeOut" }}
                            className={`h-full bg-gradient-to-r ${stat.color} rounded-full relative overflow-hidden`}
                          >
                            <motion.div
                              animate={{ x: ['-100%', '200%'] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: index * 0.3 }}
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            />
                          </motion.div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-1 lg:order-2"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 text-success text-sm font-medium mb-6"
                >
                  <Shield className="w-4 h-4" />
                  Система честности
                </motion.div>
                <h2 className="text-5xl sm:text-6xl font-bold mb-6">
                  Справедливая{' '}
                  <span className="gradient-text">оценка</span>
                </h2>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Каждое решение проверяется несколькими участниками.
                  Рейтинг доверия определяет вес вашего голоса.
                </p>

                <div className="space-y-4">
                  {[
                    'Множественная проверка каждого решения',
                    'Рейтинг доверия влияет на вес голоса',
                    'Система апелляции для спорных случаев',
                    'Защита от накрутки и мошенничества',
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 + 0.2, type: "spring" }}
                      >
                        <CheckCircle className="w-6 h-6 text-success flex-shrink-0" />
                      </motion.div>
                      <span className="text-lg">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          
          {/* Animated rings */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] border border-primary/5 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-accent/5 rounded-full"
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-primary/10 rounded-full"
          />

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1], 
                  rotate: [0, 10, -10, 0],
                  filter: [
                    'drop-shadow(0 0 20px hsl(var(--warning)))',
                    'drop-shadow(0 0 40px hsl(var(--warning)))',
                    'drop-shadow(0 0 20px hsl(var(--warning)))'
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="inline-block mb-10"
              >
                <Star className="w-20 h-20 text-warning" />
              </motion.div>
              <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8">
                Готов стать частью{' '}
                <span className="gradient-text">сообщества</span>?
              </h2>
              <p className="text-xl sm:text-2xl text-muted-foreground mb-14 leading-relaxed">
                Присоединяйся к тысячам разработчиков, которые уже улучшают
                свои навыки через взаимную проверку кода.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to="/auth">
                  <Button variant="gradient" size="xl" className="group text-xl px-12 py-8 rounded-2xl">
                    <Rocket className="w-6 h-6 mr-3" />
                    Начать бесплатно
                    <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="flex items-center gap-3"
              >
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"
                >
                  <Code2 className="w-6 h-6 text-background" />
                </motion.div>
                <span className="text-2xl font-bold">
                  Code<span className="gradient-text">Craft</span>
                </span>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <span>MoksHub Platform</span>
                <span className="text-primary">•</span>
                <span>2024</span>
              </motion.div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
