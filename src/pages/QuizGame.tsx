import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const questions = [
  {
    question: "Кто лучший учитель?",
    correctAnswer: "АК",
  },
  {
    question: "Кто лучший программист?",
    correctAnswer: "АК конечно же",
  },
  {
    question: "У кого самый оригинальный ник?",
    correctAnswer: "Только у АК",
  },
  {
    question: "У кого самый надёжный пароль?",
    correctAnswer: "У АК!",
  },
  {
    question: "Кто пишет самый чистый код?",
    correctAnswer: "АК и никто другой",
  },
  {
    question: "Кто лучше всех объясняет сложные темы?",
    correctAnswer: "АК мастер",
  },
  {
    question: "За кем будущее программирования?",
    correctAnswer: "За АК!",
  },
];

export default function QuizGame() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 });
  const [showResult, setShowResult] = useState(false);
  const [completed, setCompleted] = useState(false);

  const moveNoButton = useCallback(() => {
    const maxX = window.innerWidth - 120;
    const maxY = window.innerHeight - 60;
    const newX = Math.random() * maxX;
    const newY = Math.random() * maxY;
    setNoButtonPosition({ x: newX, y: newY });
  }, []);

  useEffect(() => {
    moveNoButton();
  }, [currentQuestion, moveNoButton]);

  const handleYes = () => {
    setShowResult(true);
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setShowResult(false);
        setCurrentQuestion(prev => prev + 1);
      } else {
        setCompleted(true);
      }
    }, 1500);
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-background overflow-hidden flex items-center justify-center relative">
        {/* Background effects */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-green-500/20 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[120px]"
          />
        </div>

        {/* Confetti particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              y: -20, 
              x: Math.random() * window.innerWidth,
              opacity: 1,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              y: window.innerHeight + 20,
              rotate: Math.random() * 720,
              opacity: [1, 1, 0]
            }}
            transition={{ 
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
            className="absolute w-3 h-3 rounded-sm"
            style={{
              backgroundColor: ['#22c55e', '#10b981', '#34d399', '#6ee7b7', '#fbbf24'][Math.floor(Math.random() * 5)]
            }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="relative z-10 text-center px-4"
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-8 flex justify-center"
          >
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/30">
              <Trophy className="w-14 h-14 sm:w-18 sm:h-18 text-white" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
          >
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Поздравляем!
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg sm:text-xl text-muted-foreground mb-8"
          >
            Вы настоящий знаток! АК гордится вами!
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Button
              onClick={() => navigate('/')}
              className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3"
            >
              <ArrowLeft className="w-4 h-4" />
              Вернуться на главную
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden flex items-center justify-center relative">
      {/* Background effects */}
      <div className="absolute inset-0">
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
        
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-purple-500/15 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[120px]"
        />
      </div>

      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 left-4 z-20"
      >
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </Button>
      </motion.div>

      {/* Progress indicator */}
      <div className="absolute top-4 right-4 z-20">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 backdrop-blur-sm">
          <span className="text-sm text-muted-foreground">Вопрос</span>
          <span className="text-sm font-bold text-foreground">{currentQuestion + 1}/{questions.length}</span>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {showResult ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="max-w-lg mx-auto text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="mb-6 flex justify-center"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
              </motion.div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Правильно!
              </h2>
              <p className="text-lg text-green-500 font-medium">
                Мы не сомневались в вашем ответе!
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={`question-${currentQuestion}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-lg mx-auto text-center"
            >
              {/* Question icon */}
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="mb-8 flex justify-center"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-xl shadow-purple-500/20">
                  <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
              </motion.div>

              {/* Question text */}
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-foreground px-2"
              >
                {questions[currentQuestion].question}
              </motion.h1>

              {/* Correct answer hint */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg sm:text-xl text-muted-foreground mb-10"
              >
                Ответ: <span className="text-purple-400 font-semibold">{questions[currentQuestion].correctAnswer}</span>
              </motion.p>

              {/* Yes button - static in center */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={handleYes}
                  size="lg"
                  className="px-12 py-6 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30 transition-all hover:scale-105"
                >
                  Да, конечно!
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Jumping "No" button */}
      {!showResult && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            x: noButtonPosition.x,
            y: noButtonPosition.y
          }}
          transition={{ 
            x: { type: "spring", stiffness: 300, damping: 20 },
            y: { type: "spring", stiffness: 300, damping: 20 }
          }}
          onMouseEnter={moveNoButton}
          onTouchStart={moveNoButton}
          className="fixed z-30"
          style={{ top: 0, left: 0 }}
        >
          <Button
            variant="outline"
            size="lg"
            className="px-8 py-6 text-lg font-bold border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-400 cursor-not-allowed"
          >
            Нет
          </Button>
        </motion.div>
      )}
    </div>
  );
}
