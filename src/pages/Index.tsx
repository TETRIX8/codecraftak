import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  MessageSquare
} from 'lucide-react';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    // Check if already loaded in this session
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
        {isLoading && !hasLoaded && (
          <LoadingScreen onComplete={handleLoadingComplete} />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-background overflow-hidden">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center">
          {/* Animated Background */}
          <div className="absolute inset-0">
            {/* Grid pattern */}
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `
                  linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                  linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px'
              }}
            />
            
            {/* Floating orbs */}
            <motion.div
              animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]"
            />
            <motion.div
              animate={{
                x: [0, -80, 0],
                y: [0, 80, 0],
                scale: [1.2, 1, 1.2],
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px]"
            />
            <motion.div
              animate={{
                x: [0, 50, 0],
                y: [0, -30, 0],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-success/10 rounded-full blur-[100px]"
            />

            {/* Floating icons */}
            {[
              { Icon: Terminal, x: '10%', y: '20%', delay: 0 },
              { Icon: GitBranch, x: '85%', y: '15%', delay: 1 },
              { Icon: Code2, x: '15%', y: '70%', delay: 2 },
              { Icon: Sparkles, x: '80%', y: '75%', delay: 0.5 },
              { Icon: Trophy, x: '90%', y: '45%', delay: 1.5 },
              { Icon: Heart, x: '5%', y: '45%', delay: 2.5 },
            ].map(({ Icon, x, y, delay }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0.1, 0.3, 0.1],
                  scale: 1,
                  y: [0, -20, 0],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  opacity: { duration: 4, repeat: Infinity, delay },
                  scale: { duration: 0.5, delay: delay + 0.5 },
                  y: { duration: 6, repeat: Infinity, delay },
                  rotate: { duration: 8, repeat: Infinity, delay }
                }}
                style={{ left: x, top: y }}
                className="absolute text-primary/30"
              >
                <Icon className="w-8 h-8" />
              </motion.div>
            ))}
          </div>

          <div className="relative z-10 container mx-auto px-4 pt-20">
            <div className="max-w-5xl mx-auto text-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 text-primary text-sm font-medium mb-8 backdrop-blur-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Платформа нового поколения для обучения</span>
                  <Sparkles className="w-4 h-4" />
                </div>
              </motion.div>

              {/* Main heading */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[0.9] tracking-tight">
                  <span className="block">Code</span>
                  <span className="relative inline-block">
                    <span className="gradient-text">⚡ Craft</span>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-2xl -z-10"
                    />
                  </span>
                </h1>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
              >
                Мастерство программирования через{' '}
                <span className="text-primary font-semibold">взаимную проверку кода</span>.
                <br className="hidden sm:block" />
                Решай задачи, проверяй других, становись экспертом.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
              >
                <Link to="/tasks">
                  <Button variant="gradient" size="xl" className="w-full sm:w-auto group text-lg px-8">
                    <Zap className="w-5 h-5 mr-2" />
                    Начать обучение
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/users">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto text-lg px-8">
                    <Users className="w-5 h-5 mr-2" />
                    Найти участников
                  </Button>
                </Link>
              </motion.div>

              {/* Quick stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground"
              >
                {[
                  { icon: Users, value: '10K+', label: 'Разработчиков' },
                  { icon: Code2, value: '500+', label: 'Заданий' },
                  { icon: CheckCircle, value: '50K+', label: 'Проверок' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <stat.icon className="w-4 h-4 text-primary" />
                    <span className="font-bold text-foreground">{stat.value}</span>
                    <span>{stat.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ 
              opacity: { delay: 1.5 },
              y: { duration: 1.5, repeat: Infinity }
            }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
              <motion.div
                animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1 h-2 rounded-full bg-primary"
              />
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-32 relative">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                Как это <span className="gradient-text">работает</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Уникальная система peer-review для эффективного обучения
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Code2,
                  title: 'Решай задания',
                  description: 'Выбирай задания по уровню сложности. От простых алгоритмов до сложных систем.',
                  gradient: 'from-primary to-cyan-400'
                },
                {
                  icon: Users,
                  title: 'Проверяй других',
                  description: 'Чтобы отправить решение, проверь работу другого участника.',
                  gradient: 'from-accent to-purple-400'
                },
                {
                  icon: Trophy,
                  title: 'Расти в рейтинге',
                  description: 'Получай баллы, бейджи и повышай уровень от Новичка до Эксперта.',
                  gradient: 'from-warning to-orange-400'
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative p-8 rounded-3xl bg-card border border-border hover:border-primary/50 transition-all duration-300 h-full">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-8 h-8 text-background" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                    <p className="text-muted-foreground text-lg">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Features */}
        <section className="py-32 bg-gradient-to-b from-card/50 to-background border-y border-border">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
                  <MessageSquare className="w-4 h-4" />
                  Социальные функции
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                  Общайся и{' '}
                  <span className="gradient-text">находи друзей</span>
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Не просто учись — становись частью сообщества разработчиков.
                  Общайся, делись опытом и находи единомышленников.
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: Heart, label: 'Ставь лайки профилям' },
                    { icon: MessageSquare, label: 'Личные сообщения' },
                    { icon: Users, label: 'Общий чат сообщества' },
                    { icon: Sparkles, label: 'Голосовые сообщения' },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
                <div className="relative p-8 rounded-3xl bg-card border border-border">
                  {/* Chat preview mockup */}
                  <div className="space-y-4">
                    {[
                      { name: 'Alex', message: 'Привет! Как решил задачу #42?', isOwn: false },
                      { name: 'Ты', message: 'Использовал рекурсию с мемоизацией 🚀', isOwn: true },
                      { name: 'Alex', message: 'Круто! Можешь объяснить подробнее?', isOwn: false },
                    ].map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.2 }}
                        className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] p-4 rounded-2xl ${
                          msg.isOwn 
                            ? 'bg-primary text-primary-foreground rounded-br-md' 
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

        {/* Trust System */}
        <section className="py-32">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-2 lg:order-1"
              >
                <div className="relative p-8 rounded-3xl bg-card border border-border">
                  <div className="space-y-6">
                    {[
                      { label: 'Рейтинг доверия', value: 94, color: 'from-primary to-cyan-400' },
                      { label: 'Выполненных проверок', value: 67, color: 'from-accent to-purple-400' },
                      { label: 'Точность оценок', value: 89, color: 'from-success to-emerald-400' },
                    ].map((stat, index) => (
                      <div key={stat.label}>
                        <div className="flex justify-between mb-2">
                          <span className="text-muted-foreground">{stat.label}</span>
                          <span className="font-bold">{stat.value}%</span>
                        </div>
                        <div className="h-3 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${stat.value}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: index * 0.2, ease: "easeOut" }}
                            className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-1 lg:order-2"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 text-success text-sm font-medium mb-6">
                  <Shield className="w-4 h-4" />
                  Система честности
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                  Справедливая{' '}
                  <span className="gradient-text">оценка</span>
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Каждое решение проверяется несколькими участниками.
                  Рейтинг доверия определяет вес голоса.
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
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                      <span>{item}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-primary/10 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-accent/10 rounded-full"
          />

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="inline-block mb-8"
              >
                <Star className="w-16 h-16 text-warning" />
              </motion.div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                Готов стать частью{' '}
                <span className="gradient-text">сообщества</span>?
              </h2>
              <p className="text-xl text-muted-foreground mb-12">
                Присоединяйся к тысячам разработчиков, которые уже улучшают
                свои навыки через взаимную проверку кода.
              </p>
              <Link to="/auth">
                <Button variant="gradient" size="xl" className="group text-lg px-10">
                  Начать бесплатно
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-background" />
                </div>
                <span className="text-xl font-bold">
                  Code<span className="gradient-text">⚡Craft</span>
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                © 2024 Code Craft. Платформа для обучения программированию.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
