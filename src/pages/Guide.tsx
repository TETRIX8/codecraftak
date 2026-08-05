import { useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  ArrowLeft,
  Code2,
  BookOpen,
  Trophy,
  Gamepad2,
  Shield,
  MessageSquare,
  Map as MapIcon,
  Zap,
  Terminal,
  Cpu,
  UserPlus,
  ClipboardCheck,
  Coins,
  Crown,
  Award,
  Eye,
  CheckCircle2,
  XCircle,
  Ship,
  Hand,
  Skull,
  Grid3X3,
  Sparkles,
  Users,
  GraduationCap,
  Gavel,
  ScanLine,
  Star,
} from 'lucide-react';

/* =========================================================
   Neon Frame (same visual language as the homepage)
   ========================================================= */
function NeonFrame({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative group ${className}`}>
      <div className="absolute -inset-[1px] rounded-2xl overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,hsl(var(--neon-cyan)),hsl(var(--neon-purple)),hsl(var(--neon-pink)),hsl(var(--neon-cyan)))]"
          style={{ opacity: 0.35 }}
        />
      </div>
      <div className="absolute inset-[1px] rounded-2xl bg-[hsl(var(--background)/0.95)]" />
      <div className="relative">{children}</div>
    </div>
  );
}

/* =========================================================
   Background: grid + particles
   ========================================================= */
function GuideBackground() {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 3,
        duration: 12 + Math.random() * 18,
        delay: Math.random() * 6,
        color: ['var(--neon-cyan)', 'var(--neon-purple)', 'var(--neon-pink)'][Math.floor(Math.random() * 3)],
      })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <motion.div
        animate={{ backgroundPosition: ['0px 0px', '40px 40px'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--neon-cyan) / 0.1) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--neon-cyan) / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.12, 0.18, 0.12] }}
        transition={{ duration: 9, repeat: Infinity }}
        className="absolute top-[5%] left-[0%] w-[550px] h-[550px] rounded-full bg-[hsl(var(--neon-cyan)/0.15)] blur-[140px]"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.22, 0.15] }}
        transition={{ duration: 11, repeat: Infinity, delay: 2 }}
        className="absolute bottom-[0%] right-[0%] w-[650px] h-[650px] rounded-full bg-[hsl(var(--neon-purple)/0.18)] blur-[160px]"
      />
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: `${p.x}vw`, y: `${p.y}vh`, opacity: 0 }}
          animate={{
            y: [`${p.y}vh`, `${p.y - 25}vh`, `${p.y}vh`],
            opacity: [0, 0.5, 0],
            scale: [0, 1, 0],
          }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: `hsl(${p.color})`,
            boxShadow: `0 0 ${p.size * 4}px hsl(${p.color})`,
          }}
        />
      ))}
    </div>
  );
}

/* =========================================================
   Section header with animated icon
   ========================================================= */
function SectionHeader({
  icon: Icon,
  index,
  title,
  subtitle,
  color,
}: {
  icon: typeof Cpu;
  index: string;
  title: string;
  subtitle: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
      className="flex items-start gap-5 mb-8"
    >
      <motion.div
        animate={{
          boxShadow: [
            `0 0 15px hsl(${color} / 0.4)`,
            `0 0 35px hsl(${color} / 0.7)`,
            `0 0 15px hsl(${color} / 0.4)`,
          ],
        }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="w-14 h-14 shrink-0 rounded-xl flex items-center justify-center border"
        style={{ borderColor: `hsl(${color} / 0.5)`, background: `hsl(${color} / 0.1)` }}
      >
        <Icon className="w-7 h-7" style={{ color: `hsl(${color})`, filter: `drop-shadow(0 0 8px hsl(${color} / 0.8))` }} />
      </motion.div>
      <div>
        <div className="font-mono text-xs tracking-[0.3em] uppercase mb-1" style={{ color: `hsl(${color})` }}>
          {index}
        </div>
        <h2
          className="text-2xl md:text-3xl font-extrabold uppercase tracking-wide text-foreground text-balance"
          style={{ textShadow: `0 0 25px hsl(${color} / 0.4)` }}
        >
          {title}
        </h2>
        <p className="text-muted-foreground mt-1 text-pretty">{subtitle}</p>
      </div>
    </motion.div>
  );
}

/* =========================================================
   Animated step (timeline "How it works")
   ========================================================= */
function TimelineStep({
  icon: Icon,
  step,
  title,
  description,
  color,
  isLast = false,
}: {
  icon: typeof Cpu;
  step: number;
  title: string;
  description: string;
  color: string;
  isLast?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: step * 0.08 }}
      className="relative flex gap-5"
    >
      {/* Line + node */}
      <div className="flex flex-col items-center">
        <motion.div
          whileInView={{ scale: [0, 1.25, 1] }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: step * 0.08 + 0.2 }}
          className="w-12 h-12 shrink-0 rounded-full border-2 flex items-center justify-center relative z-10 bg-[hsl(var(--background))]"
          style={{ borderColor: `hsl(${color})`, boxShadow: `0 0 20px hsl(${color} / 0.5)` }}
        >
          <Icon className="w-5 h-5" style={{ color: `hsl(${color})` }} />
          {/* Pulse ring */}
          <motion.div
            animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: step * 0.4 }}
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: `hsl(${color})` }}
          />
        </motion.div>
        {!isLast && (
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: step * 0.08 + 0.3 }}
            className="w-[2px] flex-grow origin-top my-1"
            style={{ background: `linear-gradient(to bottom, hsl(${color} / 0.7), hsl(var(--neon-purple) / 0.2))` }}
          />
        )}
      </div>

      {/* Content */}
      <div className={`pb-10 ${isLast ? 'pb-0' : ''} flex-grow`}>
        <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-1">
          {`Шаг ${String(step).padStart(2, '0')}`}
        </div>
        <h3 className="font-bold text-lg uppercase tracking-wider mb-2" style={{ color: `hsl(${color})` }}>
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-lg text-pretty">{description}</p>
      </div>
    </motion.div>
  );
}

/* =========================================================
   Feature card
   ========================================================= */
function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
  delay = 0,
  badge,
}: {
  icon: typeof Cpu;
  title: string;
  description: string;
  color: string;
  delay?: number;
  badge?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -6 }}
      className="h-full"
    >
      <div
        className="h-full p-5 rounded-xl border bg-[hsl(var(--card)/0.5)] backdrop-blur-xl transition-shadow duration-300 hover:shadow-[0_0_30px_hsl(var(--neon-purple)/0.2)]"
        style={{ borderColor: `hsl(${color} / 0.3)` }}
      >
        <div className="flex items-center justify-between mb-4">
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center border"
            style={{
              borderColor: `hsl(${color} / 0.4)`,
              background: `hsl(${color} / 0.08)`,
              boxShadow: `0 0 15px hsl(${color} / 0.25)`,
            }}
          >
            <Icon className="w-5 h-5" style={{ color: `hsl(${color})`, filter: `drop-shadow(0 0 6px hsl(${color} / 0.7))` }} />
          </div>
          {badge && (
            <span
              className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded border"
              style={{ color: `hsl(${color})`, borderColor: `hsl(${color} / 0.4)`, background: `hsl(${color} / 0.08)` }}
            >
              {badge}
            </span>
          )}
        </div>
        <h3 className="font-bold uppercase tracking-wider text-sm mb-2 text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{description}</p>
      </div>
    </motion.div>
  );
}

/* =========================================================
   Animated stat chip
   ========================================================= */
function RuleChip({ icon: Icon, text, color, delay = 0 }: { icon: typeof Cpu; text: string; color: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay, type: 'spring', stiffness: 200 }}
      className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm"
      style={{ borderColor: `hsl(${color} / 0.4)`, background: `hsl(${color} / 0.08)` }}
    >
      <Icon className="w-4 h-4 shrink-0" style={{ color: `hsl(${color})` }} />
      <span className="text-foreground/85">{text}</span>
    </motion.div>
  );
}

/* =========================================================
   Page
   ========================================================= */
export default function Guide() {
  const pageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -60]);

  return (
    <div ref={pageRef} className="min-h-screen bg-background relative overflow-hidden">
      <GuideBackground />

      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] z-50 origin-left"
        style={{
          scaleX: progress,
          background: 'linear-gradient(90deg, hsl(var(--neon-cyan)), hsl(var(--neon-purple)), hsl(var(--neon-pink)))',
          boxShadow: '0 0 15px hsl(var(--neon-cyan) / 0.6)',
        }}
      />

      <div className="relative z-10 container mx-auto px-4 pt-24 pb-16 max-w-5xl">
        {/* Back link */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[hsl(var(--neon-cyan))] transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            На главную
          </Link>
        </motion.div>

        {/* ============ HERO ============ */}
        <motion.div style={{ y: heroY }}>
          <NeonFrame className="p-8 md:p-14 mb-16 overflow-hidden">
            <div className="relative text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, type: 'spring' }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[hsl(var(--neon-cyan)/0.3)] bg-[hsl(var(--neon-cyan)/0.1)] mb-6"
              >
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
                  <ScanLine className="w-4 h-4 text-[hsl(var(--neon-cyan))]" />
                </motion.div>
                <span className="text-xs font-mono uppercase tracking-wider text-[hsl(var(--neon-cyan))]">
                  System Manual // Полный гид
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[0.95] mb-6 text-balance"
              >
                <span className="text-foreground">Как работает </span>
                <span className="bg-gradient-to-r from-[hsl(var(--neon-cyan))] via-[hsl(var(--neon-purple))] to-[hsl(var(--neon-pink))] bg-clip-text text-transparent">
                  MoksuHub
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.25 }}
                className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed text-pretty"
              >
                Обучение, задания, проверки решений, игры на монеты, квест и рейтинги —
                разбираем всю экосистему платформы по полочкам.
              </motion.p>

              {/* Animated divider */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-[2px] w-48 mx-auto mt-8"
                style={{
                  background: 'linear-gradient(90deg, transparent, hsl(var(--neon-cyan)), transparent)',
                  boxShadow: '0 0 20px hsl(var(--neon-cyan) / 0.5)',
                }}
              />
            </div>
          </NeonFrame>
        </motion.div>

        {/* ============ 01: HOW IT WORKS ============ */}
        <section className="mb-20">
          <SectionHeader
            icon={Cpu}
            index="Раздел 01"
            title="Твой путь на платформе"
            subtitle="От регистрации до вершины рейтинга — за 6 шагов"
            color="var(--neon-cyan)"
          />
          <NeonFrame className="p-6 md:p-10">
            <div>
              <TimelineStep
                icon={UserPlus}
                step={1}
                title="Регистрация и одобрение"
                description="Создай аккаунт и дождись одобрения. После входа тебя встретит приветствие и стартовый баланс — можно сразу осваиваться."
                color="var(--neon-cyan)"
              />
              <TimelineStep
                icon={BookOpen}
                step={2}
                title="Выбери направление"
                description="Программирование, ИИ, кибербезопасность, дизайн или маркетинг. Изучай темы и материалы курсов в разделе «Темы»."
                color="var(--neon-purple)"
              />
              <TimelineStep
                icon={Code2}
                step={3}
                title="Решай задания"
                description="Открывай задачи разной сложности, пиши код прямо в встроенном редакторе и отправляй решения на проверку."
                color="var(--neon-pink)"
              />
              <TimelineStep
                icon={ClipboardCheck}
                step={4}
                title="Проверяй других"
                description="Peer-review: смотри чужие решения, выноси вердикт «Принять» или «Отклонить» с комментарием. За проверки тоже начисляются награды."
                color="var(--neon-cyan)"
              />
              <TimelineStep
                icon={Coins}
                step={5}
                title="Зарабатывай монеты"
                description="Баллы приходят за решённые задачи, проверки и активность. Трать их в играх или копи для рейтинга."
                color="var(--neon-purple)"
              />
              <TimelineStep
                icon={Crown}
                step={6}
                title="Поднимайся в топ"
                description="Получай достижения, проходи квест и борись за первые места в таблице лидеров."
                color="var(--neon-pink)"
                isLast
              />
            </div>
          </NeonFrame>
        </section>

        {/* ============ 02: LEARNING ============ */}
        <section className="mb-20">
          <SectionHeader
            icon={GraduationCap}
            index="Раздел 02"
            title="Обучение и задания"
            subtitle="Чему учат и как устроена система задач"
            color="var(--neon-purple)"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon={Code2}
              title="Программирование"
              description="Задачи по разработке, языкам и алгоритмам с встроенным редактором кода Monaco — как в VS Code."
              color="var(--neon-cyan)"
              delay={0}
            />
            <FeatureCard
              icon={Sparkles}
              title="Искусственный интеллект"
              description="Темы по машинному обучению и нейросетям — от основ до практики."
              color="var(--neon-purple)"
              delay={0.08}
            />
            <FeatureCard
              icon={Shield}
              title="Кибербезопасность"
              description="Защита данных и этичный хакинг: учись видеть уязвимости и закрывать их."
              color="var(--neon-pink)"
              delay={0.16}
            />
            <FeatureCard
              icon={Star}
              title="Уровни сложности"
              description="У каждой задачи есть метка сложности и языка. Начинай с простого и повышай планку."
              color="var(--neon-purple)"
              delay={0.24}
            />
            <FeatureCard
              icon={BookOpen}
              title="Темы и материалы"
              description="Раздел «Темы» — теория и материалы по направлениям. Открывай тему и переходи к практике."
              color="var(--neon-cyan)"
              delay={0.32}
            />
            <FeatureCard
              icon={Trophy}
              title="Награды за решения"
              description="Принятое решение = монеты и рост рейтинга. Чем сложнее задача, тем выше награда."
              color="var(--neon-pink)"
              delay={0.4}
            />
          </div>
        </section>

        {/* ============ 03: REVIEW SYSTEM ============ */}
        <section className="mb-20">
          <SectionHeader
            icon={Eye}
            index="Раздел 03"
            title="Система проверок"
            subtitle="Peer-review: решения проверяют сами участники"
            color="var(--neon-pink)"
          />
          <NeonFrame className="p-6 md:p-10">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed text-pretty">
                  Когда ты отправляешь решение, оно попадает в очередь на проверку другим участникам.
                  Ты и сам можешь стать проверяющим: платформа выдаёт случайное чужое решение.
                </p>
                <div className="flex flex-wrap gap-3">
                  <RuleChip icon={CheckCircle2} text="Вердикт «Принять» — автор получает награду" color="var(--neon-cyan)" delay={0} />
                  <RuleChip icon={XCircle} text="«Отклонить» — с обязательным комментарием" color="var(--neon-pink)" delay={0.1} />
                  <RuleChip icon={Coins} text="За проверки — монеты" color="var(--neon-purple)" delay={0.2} />
                  <RuleChip icon={Gavel} text="Не согласен? Подай апелляцию" color="var(--neon-cyan)" delay={0.3} />
                </div>
              </div>

              {/* Animated review mock */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="rounded-xl border border-[hsl(var(--neon-cyan)/0.3)] bg-[hsl(var(--card)/0.6)] p-4 font-mono text-xs overflow-hidden"
              >
                <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>review_session.log</span>
                </div>
                {[
                  { text: '> Загрузка решения #4821...', color: 'var(--neon-cyan)', d: 0 },
                  { text: '> Язык: Python | Сложность: средняя', color: 'var(--neon-purple)', d: 0.4 },
                  { text: '> Анализ кода...', color: 'var(--neon-cyan)', d: 0.8 },
                  { text: '> Вердикт: ��РИНЯТО ✓', color: 'var(--neon-pink)', d: 1.2 },
                  { text: '> +монеты автору и проверяющему', color: 'var(--neon-cyan)', d: 1.6 },
                ].map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: line.d, duration: 0.4 }}
                    className="py-1"
                    style={{ color: `hsl(${line.color})` }}
                  >
                    {line.text}
                  </motion.div>
                ))}
                <motion.div
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="inline-block w-2 h-4 mt-1 bg-[hsl(var(--neon-cyan))]"
                />
              </motion.div>
            </div>
          </NeonFrame>
        </section>

        {/* ============ 04: GAMES ============ */}
        <section className="mb-20">
          <SectionHeader
            icon={Gamepad2}
            index="Раздел 04"
            title="Игры на монеты"
            subtitle="Соревнуйся с другими участниками и выигрывай ставки"
            color="var(--neon-cyan)"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <FeatureCard
              icon={Grid3X3}
              title="Крестики-нолики"
              description="Классика 3×3. Продумай стратегию и забери ставку соперника."
              color="var(--neon-cyan)"
              delay={0}
              badge="PvP"
            />
            <FeatureCard
              icon={Hand}
              title="Камень-ножницы-бумага"
              description="Дуэль на реакцию и психологию. Один раунд решает всё."
              color="var(--neon-purple)"
              delay={0.08}
              badge="PvP"
            />
            <FeatureCard
              icon={Ship}
              title="Морской бой"
              description="Расставь флот и потопи корабли противника раньше, чем он найдёт твои."
              color="var(--neon-pink)"
              delay={0.16}
              badge="PvP"
            />
            <FeatureCard
              icon={Skull}
              title="Русская рулетка"
              description="Игра для смелых: испытай удачу на максимум."
              color="var(--neon-purple)"
              delay={0.24}
              badge="Risk"
            />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-wrap gap-3 justify-center p-5 rounded-xl border border-[hsl(var(--neon-purple)/0.3)] bg-[hsl(var(--card)/0.4)]">
              <RuleChip icon={Coins} text="Ставка: от 1 до 5 монет" color="var(--neon-cyan)" delay={0} />
              <RuleChip icon={Zap} text="Лимит: 5 игр в день" color="var(--neon-pink)" delay={0.1} />
              <RuleChip icon={Cpu} text="Кулдаун между играми: 5 минут" color="var(--neon-purple)" delay={0.2} />
              <RuleChip icon={UserPlus} text="Приглашай друзей на матч" color="var(--neon-cyan)" delay={0.3} />
            </div>
          </motion.div>
        </section>

        {/* ============ 05: QUEST & ACHIEVEMENTS ============ */}
        <section className="mb-20">
          <SectionHeader
            icon={MapIcon}
            index="Раздел 05"
            title="Квест и достижения"
            subtitle="Исследуй парящие острова и собирай награды"
            color="var(--neon-purple)"
          />
          <div className="grid md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <NeonFrame className="p-6 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-12 h-12 rounded-xl flex items-center justify-center border border-[hsl(var(--neon-cyan)/0.4)] bg-[hsl(var(--neon-cyan)/0.08)]"
                    style={{ boxShadow: '0 0 20px hsl(var(--neon-cyan) / 0.3)' }}
                  >
                    <MapIcon className="w-6 h-6 text-[hsl(var(--neon-cyan))]" />
                  </motion.div>
                  <h3 className="font-bold uppercase tracking-wider">Космический квест</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 text-pretty">
                  10 парящих островов в космосе — от леса до замка. Проходи острова по цепочке:
                  каждый следующий открывается после предыдущего. Внутри — испытания и награды.
                </p>
                <div className="flex gap-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.06, type: 'spring' }}
                      className="w-3 h-3 rounded-full"
                      style={{
                        background: i < 4 ? 'hsl(var(--neon-cyan))' : 'hsl(var(--muted))',
                        boxShadow: i < 4 ? '0 0 8px hsl(var(--neon-cyan) / 0.8)' : 'none',
                      }}
                    />
                  ))}
                </div>
              </NeonFrame>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <NeonFrame className="p-6 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-12 h-12 rounded-xl flex items-center justify-center border border-[hsl(var(--neon-pink)/0.4)] bg-[hsl(var(--neon-pink)/0.08)]"
                    style={{ boxShadow: '0 0 20px hsl(var(--neon-pink) / 0.3)' }}
                  >
                    <Award className="w-6 h-6 text-[hsl(var(--neon-pink))]" />
                  </motion.div>
                  <h3 className="font-bold uppercase tracking-wider">Достижения и рейтинг</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 text-pretty">
                  За активность открываются ачивки, а таблица ли��еров показывает лучших участников.
                  Решай, проверяй, играй — и твоё имя окажется наверху.
                </p>
                <div className="space-y-2">
                  {[
                    { label: 'Топ-1 рейтинга', w: '95%' },
                    { label: 'Твоя цель', w: '70%' },
                    { label: 'Старт', w: '25%' },
                  ].map((bar, i) => (
                    <div key={i}>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">{bar.label}</div>
                      <div className="h-2 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: bar.w }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.3 + i * 0.15, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{
                            background: 'linear-gradient(90deg, hsl(var(--neon-purple)), hsl(var(--neon-pink)))',
                            boxShadow: '0 0 10px hsl(var(--neon-pink) / 0.5)',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </NeonFrame>
            </motion.div>
          </div>
        </section>

        {/* ============ 06: COMMUNITY & SAFETY ============ */}
        <section className="mb-20">
          <SectionHeader
            icon={Shield}
            index="Раздел 06"
            title="Сообщество и честная игра"
            subtitle="Общение, роли и защита от нарушителей"
            color="var(--neon-pink)"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon={MessageSquare}
              title="Сообщения и чаты"
              description="Общайся с участниками в личных сообщениях, обсуждай задачи и договаривайся об играх."
              color="var(--neon-cyan)"
              delay={0}
            />
            <FeatureCard
              icon={Users}
              title="Профили участников"
              description="У каждого — профиль с аватаром, статистикой, достижениями и историей активности."
              color="var(--neon-purple)"
              delay={0.08}
            />
            <FeatureCard
              icon={Crown}
              title="Роли"
              description="Админы, модераторы, старосты и античит-команда следят за порядком и развивают платформу."
              color="var(--neon-pink)"
              delay={0.16}
            />
            <FeatureCard
              icon={ScanLine}
              title="Античит"
              description="Специальная команда отслеживает нечестную игру. Нарушителям — бан. Играй честно."
              color="var(--neon-cyan)"
              delay={0.24}
            />
            <FeatureCard
              icon={Gavel}
              title="Апелляции"
              description="Несправедливо отклонили решение? Подай апелляцию — её рассмотрят модераторы."
              color="var(--neon-purple)"
              delay={0.32}
            />
            <FeatureCard
              icon={Trophy}
              title="Таблица лидеров"
              description="Прозрачный рейтинг всех участников: смотри, кто впереди, и догоняй."
              color="var(--neon-pink)"
              delay={0.4}
            />
          </div>
        </section>

        {/* ============ CTA ============ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <NeonFrame className="p-10 md:p-14 text-center overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ x: ['-100%', '200%'], opacity: [0, 1, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.5, ease: 'linear' }}
                  className="absolute h-[1px] w-32"
                  style={{
                    top: `${20 + i * 15}%`,
                    background: 'linear-gradient(90deg, transparent, hsl(var(--neon-cyan) / 0.5), transparent)',
                  }}
                />
              ))}
            </div>

            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Zap
                className="w-12 h-12 mx-auto mb-6 text-[hsl(var(--neon-cyan))]"
                style={{ filter: 'drop-shadow(0 0 15px hsl(var(--neon-cyan) / 0.8))' }}
              />
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 uppercase tracking-tight text-balance">
              Теперь ты знаешь{' '}
              <span className="bg-gradient-to-r from-[hsl(var(--neon-cyan))] to-[hsl(var(--neon-pink))] bg-clip-text text-transparent">
                всё
              </span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto text-pretty">
              Пора применить знания на практике. Начни с первой задачи или загляни в игры.
            </p>

            <div className="flex flex-wrap gap-4 justify-center relative">
              <Link to="/tasks">
                <Button
                  size="lg"
                  className="rounded-lg bg-gradient-to-r from-[hsl(var(--neon-purple))] to-[hsl(var(--neon-pink))] hover:opacity-90 text-white font-bold tracking-wider px-8 py-6 uppercase"
                  style={{ boxShadow: '0 0 30px hsl(var(--neon-purple)/0.5)' }}
                >
                  <Code2 className="w-5 h-5 mr-2" />
                  К заданиям
                </Button>
              </Link>
              <Link to="/games">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-lg border-2 border-[hsl(var(--neon-cyan)/0.5)] hover:border-[hsl(var(--neon-cyan))] bg-transparent text-foreground hover:bg-[hsl(var(--neon-cyan)/0.1)] font-bold tracking-wider px-8 py-6 uppercase transition-all"
                >
                  <Gamepad2 className="w-5 h-5 mr-2" />
                  В игры
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </NeonFrame>
        </motion.div>
      </div>
    </div>
  );
}
