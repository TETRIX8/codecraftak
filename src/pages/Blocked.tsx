import { motion } from "framer-motion";
import { ShieldAlert, Lock, AlertTriangle, Home } from "lucide-react";
import { Link } from "react-router-dom";

const Blocked = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating orbs */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/10 blur-3xl"
            style={{
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,100,100,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,100,100,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 text-center max-w-lg mx-auto"
      >
        {/* Animated icons */}
        <div className="relative mb-8 flex justify-center">
          <motion.div
            animate={{
              rotate: [0, -10, 10, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative"
          >
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-red-500/30 to-orange-500/20 flex items-center justify-center backdrop-blur-sm border border-red-500/30">
              <ShieldAlert className="w-12 h-12 sm:w-16 sm:h-16 text-red-400" />
            </div>
            
            {/* Orbiting lock */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-orange-500/30 flex items-center justify-center border border-orange-500/50">
                <Lock className="w-4 h-4 text-orange-400" />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Main text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              Ай-яй-яй!
            </span>
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-zinc-300 mb-6">
            Куда мы лезем?
          </h2>
        </motion.div>

        {/* Warning block */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-zinc-900/60 backdrop-blur-md border border-red-500/30 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <span className="text-orange-400 font-medium">Раздел недоступен</span>
          </div>
          <p className="text-zinc-400 text-sm sm:text-base">
            Этот раздел временно закрыт на время технических работ. 
            Вернитесь на главную страницу.
          </p>
        </motion.div>

        {/* Home button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25"
          >
            <Home className="w-5 h-5" />
            На главную
          </Link>
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-t from-red-500/10 to-transparent rounded-full blur-3xl"
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </div>
  );
};

export default Blocked;
