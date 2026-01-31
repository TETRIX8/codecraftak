import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Search, Code2, Terminal, Zap, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-hidden flex items-center justify-center relative">
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
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Floating orbs */}
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-orange-500/15 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1.1, 1, 1.1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 right-1/3 w-[250px] h-[250px] bg-amber-500/10 rounded-full blur-[80px]"
        />

        {/* Floating icons */}
        {[
          { Icon: Shield, x: '10%', y: '20%', delay: 0 },
          { Icon: Search, x: '85%', y: '15%', delay: 1 },
          { Icon: Code2, x: '15%', y: '75%', delay: 2 },
          { Icon: AlertTriangle, x: '80%', y: '70%', delay: 0.5 },
          { Icon: Terminal, x: '90%', y: '45%', delay: 1.5 },
          { Icon: Zap, x: '5%', y: '50%', delay: 2.5 },
        ].map(({ Icon, x, y, delay }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0.15, 0.35, 0.15],
              scale: 1,
              y: [0, -15, 0],
              rotate: [0, 8, -8, 0]
            }}
            transition={{ 
              opacity: { duration: 4, repeat: Infinity, delay },
              scale: { duration: 0.5, delay: delay + 0.3 },
              y: { duration: 5, repeat: Infinity, delay },
              rotate: { duration: 7, repeat: Infinity, delay }
            }}
            style={{ left: x, top: y }}
            className="absolute text-orange-500/40"
          >
            <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
          </motion.div>
        ))}

        {/* Scanning lines */}
        <motion.div
          animate={{ y: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent"
        />
        <motion.div
          animate={{ y: ['200%', '-100%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear', delay: 1.5 }}
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* Main Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="mb-8 flex justify-center"
          >
            <motion.div
              animate={{ 
                boxShadow: [
                  '0 0 20px rgba(249, 115, 22, 0.3)',
                  '0 0 40px rgba(249, 115, 22, 0.5)',
                  '0 0 20px rgba(249, 115, 22, 0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center"
            >
              <Shield className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
            </motion.div>
          </motion.div>

          {/* Main Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="block text-foreground">Техническая работа</span>
              <span className="block bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                по выявлению читеров
              </span>
            </h1>
          </motion.div>

          {/* Loading indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full"
              />
              <span className="text-muted-foreground text-sm sm:text-base">Сканирование системы...</span>
            </div>
            
            {/* Progress bar */}
            <div className="max-w-xs mx-auto h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="h-full w-1/2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
              />
            </div>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground mb-10 px-4"
          >
            Проводим проверку системы для обеспечения честной игры.
            <br className="hidden sm:block" />
            Скоро вернемся!
          </motion.p>

          {/* AK Reference */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-3 rounded-full bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20"
          >
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-xl sm:text-2xl"
            >
              🔫
            </motion.span>
            <span className="text-sm sm:text-base text-foreground font-medium">
              Да, я знаю что АК лучшие
            </span>
          </motion.div>

          {/* Play Game Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-8"
          >
            <Button
              onClick={() => navigate('/quiz')}
              size="lg"
              className="gap-3 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30 transition-all hover:scale-105"
            >
              <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6" />
              Сыграть в викторину
            </Button>
          </motion.div>

          {/* Decorative elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 flex justify-center gap-2"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.7, 0.3] 
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  delay: i * 0.3 
                }}
                className="w-2 h-2 rounded-full bg-orange-500"
              />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
