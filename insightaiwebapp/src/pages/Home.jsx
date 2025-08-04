import { Bell, Lightbulb, Rocket } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Dashboard from "../components/Dashboard.jsx";
import { useUser } from "../hooks/useUser.jsx";

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
      ease: [0.43, 0.13, 0.23, 0.96]
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
      mass: 0.8
    }
  },
};

const quotes = [
    "Artificial Intelligence is the new electricity. – Andrew Ng",
    "The best way to predict the future is to invent it. – Alan Kay",
    "Data is the new oil. – Clive Humby",
    "AI is not about man versus machine, it's about man with machine.",
    "The future belongs to those who prepare for it today."
];

// --- BACKGROUND COMPONENTS (from landing page) ---
const DynamicBackground = () => (
  <motion.div
    className="absolute inset-0 -z-30"
    style={{
      background: 'linear-gradient(135deg, #020617 0%, #1e1b4b 50%, #4c1d95 100%)',
      backgroundSize: '200% 200%'
    }}
    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
    transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
  />
);

const MorphingBlobs = () => (
  <motion.div
    className="absolute inset-0 -z-20 opacity-40"
    style={{
      background: `
        radial-gradient(circle at 15% 85%, rgba(6, 182, 212, 0.3) 0%, transparent 40%),
        radial-gradient(circle at 85% 15%, rgba(147, 51, 234, 0.3) 0%, transparent 40%),
        radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.25) 0%, transparent 40%)
      `
    }}
    animate={{
      backgroundPosition: ['15% 85%, 85% 15%, 50% 50%', '85% 15%, 15% 85%, 50% 50%', '15% 85%, 85% 15%, 50% 50%'],
    }}
    transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
  />
);

const CursorSpotlight = () => {
  const mouse = {
    x: useMotionValue(0),
    y: useMotionValue(0)
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouse.x.set(e.clientX);
      mouse.y.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouse.x, mouse.y]);

  const smoothMouse = {
    x: useSpring(mouse.x, { stiffness: 300, damping: 50, mass: 0.5 }),
    y: useSpring(mouse.y, { stiffness: 300, damping: 50, mass: 0.5 })
  };

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-10"
      style={{
        background: useTransform(
          [smoothMouse.x, smoothMouse.y],
          ([x, y]) => `radial-gradient(600px at ${x}px ${y}px, rgba(29, 78, 216, 0.15), transparent 80%)`
        )
      }}
    />
  );
};

const Home = () => {
    useUser();
    const [randomQuote, setRandomQuote] = useState("");

    useEffect(() => {
        setRandomQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, []);

    return (
        <div className="relative min-h-screen w-full bg-slate-900 font-sans text-white">
            <div className="fixed inset-0 z-0">
                <DynamicBackground />
                <MorphingBlobs />
            </div>
            <CursorSpotlight />
            <div className="relative z-10">
                <Dashboard>
                    <motion.div 
                        className="my-5 mx-auto"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Stay Tuned Banner */}
                        <motion.div 
                            variants={itemVariants}
                            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8 text-center shadow-2xl"
                        >
                            <h2 className="text-3xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                                🚀 Stay Tuned!
                            </h2>
                            <p className="text-gray-300">
                                We are working on something amazing. Your profile and features will be updated soon.
                            </p>
                        </motion.div>

                        {/* Random Quote */}
                        <motion.div 
                            variants={itemVariants}
                            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8 text-center shadow-lg"
                        >
                            <Lightbulb className="mx-auto text-yellow-400 mb-3" size={30} />
                            <p className="italic text-gray-300">"{randomQuote}"</p>
                        </motion.div>

                        {/* Info Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InfoCard
                                icon={<Rocket className="text-pink-400"/>}
                                label="Upcoming Features"
                                value="Launching Soon"
                                color="from-purple-500 to-pink-500"
                            />
                            <InfoCard
                                icon={<Bell className="text-teal-300"/>}
                                label="Notifications"
                                value="Stay Updated"
                                color="from-blue-500 to-teal-400"
                            />
                            <InfoCard
                                icon={<Lightbulb className="text-orange-300"/>}
                                label="AI Insights"
                                value="Coming Soon"
                                color="from-yellow-400 to-orange-500"
                            />
                        </div>
                    </motion.div>
                </Dashboard>
            </div>
        </div>
    );
};

const InfoCard = ({ icon, label, value, color }) => {
    return (
        <motion.div 
            variants={itemVariants}
            className="flex items-center gap-5 bg-white/5 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/10 transition-all duration-300 hover:border-cyan-500/50 hover:-translate-y-1"
        >
            <div
                className={`w-16 h-16 flex-shrink-0 flex items-center justify-center text-3xl text-white bg-gradient-to-br ${color} rounded-full shadow-lg`}
            >
                {icon}
            </div>
            <div>
                <h6 className="text-sm text-gray-400 mb-1">{label}</h6>
                <span className="text-lg font-semibold text-white">{value}</span>
            </div>
        </motion.div>
    );
};

export default Home;
