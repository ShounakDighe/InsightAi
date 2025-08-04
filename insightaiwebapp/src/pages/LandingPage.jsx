import {
  AnimatePresence,
  motion,
  useCycle,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import {
  FaArrowRight,
  FaBars,
  FaBrain,
  FaInstagram,
  FaLinkedin,
  FaRocket,
  FaTimes,
  FaUsers,
  FaWhatsapp,
} from 'react-icons/fa';
// Make sure to install styled-components: npm install styled-components
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';


// --- ANIMATION VARIANTS --- //
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.95, filter: 'blur(5px)' },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.7,
      ease: [0.43, 0.13, 0.23, 0.96]
    }
  },
};


// --- STYLED COMPONENTS --- //

// 1. Animated Button Style
const AnimatedButtonWrapper = styled(motion.div)`
  button {
    text-decoration: none;
    position: relative;
    border: none;
    font-size: 14px;
    font-family: inherit;
    font-weight: 600;
    cursor: pointer;
    color: #fff;
    width: 11em;
    height: 3.5em;
    line-height: 2em;
    text-align: center;
    background: linear-gradient(90deg, #03a9f4, #f441a5, #ffeb3b, #03a9f4);
    background-size: 300%;
    border-radius: 30px;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px; /* For icon spacing */
  }

  button:hover {
    animation: ani 8s linear infinite;
    border: none;
  }

  @keyframes ani {
    0% {
      background-position: 0%;
    }
    100% {
      background-position: 400%;
    }
  }

  button:before {
    content: "";
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    z-index: -1;
    background: linear-gradient(90deg, #03a9f4, #f441a5, #ffeb3b, #03a9f4);
    background-size: 400%;
    border-radius: 35px;
    transition: 1s;
  }

  button:hover::before {
    filter: blur(20px);
  }

  button:active {
    background: linear-gradient(32deg, #03a9f4, #f441a5, #ffeb3b, #03a9f4);
  }
`;

// 2. Glass Radio Navigation Style
const GlassRadioWrapper = styled(motion.div)`
  .glass-radio-group {
    --bg: rgba(255, 255, 255, 0.06);
    --text: #e5e5e5;

    display: flex;
    position: relative;
    background: var(--bg);
    border-radius: 1rem;
    backdrop-filter: blur(12px);
    box-shadow:
      inset 1px 1px 4px rgba(255, 255, 255, 0.2),
      inset -1px -1px 6px rgba(0, 0, 0, 0.3),
      0 4px 12px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    width: fit-content;
  }

  .glass-radio-group input {
    display: none;
  }

  .glass-radio-group label {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 80px;
    font-size: 14px;
    padding: 0.8rem 1.6rem;
    cursor: pointer;
    font-weight: 600;
    letter-spacing: 0.3px;
    color: var(--text);
    position: relative;
    z-index: 2;
    transition: color 0.3s ease-in-out;
  }

  .glass-radio-group label:hover {
    color: white;
  }

  .glass-radio-group input:checked + label {
    color: #fff;
  }

  .glass-glider {
    position: absolute;
    top: 0;
    bottom: 0;
    width: calc(100% / 4); /* Updated for 4 items */
    border-radius: 1rem;
    z-index: 1;
    transition:
      transform 0.5s cubic-bezier(0.37, 1.95, 0.66, 0.56),
      background 0.4s ease-in-out,
      box-shadow 0.4s ease-in-out;
  }

  #glass-home:checked ~ .glass-glider {
    transform: translateX(0%);
    background: linear-gradient(135deg, #c0c0c055, #e0e0e0);
    box-shadow: 0 0 18px rgba(192, 192, 192, 0.5), 0 0 10px rgba(255, 255, 255, 0.4) inset;
  }

  #glass-about:checked ~ .glass-glider {
    transform: translateX(100%);
    background: linear-gradient(135deg, #67e8f955, #3b82f6);
    box-shadow: 0 0 18px rgba(59, 130, 246, 0.5), 0 0 10px rgba(103, 232, 249, 0.4) inset;
  }

  #glass-events:checked ~ .glass-glider {
    transform: translateX(200%);
    background: linear-gradient(135deg, #f472b655, #ec4899);
    box-shadow: 0 0 18px rgba(236, 72, 153, 0.5), 0 0 10px rgba(244, 114, 182, 0.4) inset;
  }
  
  #glass-team:checked ~ .glass-glider {
    transform: translateX(300%);
    background: linear-gradient(135deg, #a78bfa55, #8b5cf6);
    box-shadow: 0 0 18px rgba(139, 92, 246, 0.5), 0 0 10px rgba(167, 139, 250, 0.4) inset;
  }
`;

// 3. Event Card Hover Effect
const EventCardsWrapper = styled(motion.div)`
  .cards {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    grid-template-rows: auto;
    gap: 1.5rem;
    max-width: 64rem;
    margin: 0 auto;
    height: auto;

    @media (min-width: 768px) {
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(2, 1fr);
      height: 600px;
    }
  }

  .card {
    position: relative;
    height: 18rem; /* 288px */
    overflow: hidden;
    border-radius: 1.5rem; /* 24px */
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: 400ms;

    @media (min-width: 768px) {
      height: auto;
    }
  }

  .card-1 {
    @media (min-width: 768px) {
      grid-column: span 2 / span 2;
      grid-row: span 2 / span 2;
    }
  }

  .card-2, .card-3 {
    @media (min-width: 768px) {
      grid-column: span 1 / span 1;
    }
  }

  .cards:hover > .card:not(:hover) {
    filter: blur(10px);
    transform: scale(0.95);
  }

  .card:hover {
    transform: scale(1.03);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }
`;

// 4. Loader for Intro Screen
const LoaderWrapper = styled.div`
  .loader-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 280px; /* Increased size to fit text */
    height: 280px;
    user-select: none;
  }

  .loader {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 50%;
    background-color: transparent;
    animation: loader-rotate 3s linear infinite;
    z-index: 0;
  }

  @keyframes loader-rotate {
    0% {
      transform: rotate(90deg);
      box-shadow:
        0 10px 20px 0 #fff inset,
        0 20px 30px 0 #ad5fff inset,
        0 60px 60px 0 #471eec inset;
    }
    50% {
      transform: rotate(270deg);
      box-shadow:
        0 10px 20px 0 #fff inset,
        0 20px 10px 0 #d60a47 inset,
        0 40px 60px 0 #311e80 inset;
    }
    100% {
      transform: rotate(450deg);
      box-shadow:
        0 10px 20px 0 #fff inset,
        0 20px 30px 0 #ad5fff inset,
        0 60px 60px 0 #471eec inset;
    }
  }

  .text-container {
      position: relative;
      z-index: 1;
      display: flex;
      font-family: "Inter", sans-serif;
      font-size: 1.2em;
      font-weight: 500;
      color: white;
  }

  .loader-letter {
    display: inline-block;
    opacity: 0.4;
    transform: translateY(0);
    animation: loader-letter-anim 2s infinite;
    z-index: 1;
  }

  .loader-letter:nth-child(1) { animation-delay: 0s; }
  .loader-letter:nth-child(2) { animation-delay: 0.1s; }
  .loader-letter:nth-child(3) { animation-delay: 0.2s; }
  .loader-letter:nth-child(4) { animation-delay: 0.3s; }
  .loader-letter:nth-child(5) { animation-delay: 0.4s; }
  .loader-letter:nth-child(6) { animation-delay: 0.5s; }
  .loader-letter:nth-child(7) { animation-delay: 0.6s; }
  .loader-letter:nth-child(8) { animation-delay: 0.7s; }
  .loader-letter:nth-child(9) { animation-delay: 0.8s; }
  .loader-letter:nth-child(10) { animation-delay: 0.9s; }
  .loader-letter:nth-child(11) { animation-delay: 1.0s; }
  .loader-letter:nth-child(12) { animation-delay: 1.1s; }
  .loader-letter:nth-child(13) { animation-delay: 1.2s; }
  .loader-letter:nth-child(14) { animation-delay: 1.3s; }

  @keyframes loader-letter-anim {
    0%,
    100% {
      opacity: 0.4;
      transform: translateY(0);
    }
    20% {
      opacity: 1;
      transform: scale(1.15);
    }
    40% {
      opacity: 0.7;
      transform: translateY(0);
    }
  }
`;


// --- REUSABLE COMPONENTS --- //

const Logo = ({ className }) => (
  <motion.img
    src="src/assets/logo.png"
    alt="Insight AI Club Logo"
    className={`${className} object-cover`}
    onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/100x100/020617/FFFFFF?text=Logo'; }}
  />
);

const IntroScreen = () => {
  const text = 'Insight Ai'.split('');
  return (
    <motion.div
      className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-[100]"
      initial="visible"
      exit={{
        opacity: 0,
        scale: 1.05,
        filter: 'blur(10px)',
        transition: { duration: 0.8, delay: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }
      }}
    >
        <LoaderWrapper>
            <div className="loader-wrapper">
                <div className="text-container">
                    {text.map((char, index) => (
                        <span key={index} className="loader-letter">
                            {char === ' ' ? '\u00A0' : char}
                        </span>
                    ))}
                </div>
                <div className="loader" />
            </div>
        </LoaderWrapper>
    </motion.div>
  );
};

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
      className="pointer-events-none fixed inset-0 z-30"
      style={{
        background: useTransform(
          [smoothMouse.x, smoothMouse.y],
          ([x, y]) => `radial-gradient(600px at ${x}px ${y}px, rgba(29, 78, 216, 0.15), transparent 80%)`
        )
      }}
    />
  );
};

const InteractiveCard = ({ children, className, delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);
  
  const springX = useSpring(rotateX, { stiffness: 300, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 300, damping: 20 });

  const handleMouseMove = e => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    x.set(e.clientX - left - width / 2);
    y.set(e.clientY - top - height / 2);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={itemVariants}
      transition={{ delay }}
      style={{
        transformStyle: 'preserve-3d',
        rotateX: springX,
        rotateY: springY,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const [open, cycleOpen] = useCycle(false, true);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  
  const items = ['Home', 'About', 'Events', 'Team'];
  
  const scrollTo = id => {
    const sectionId = id.toLowerCase();
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(sectionId);
    if (open) cycleOpen();
  };

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      // Logic to update active section on scroll can be added here
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  
  return (
    <>
      <motion.nav
        className={`fixed top-0 w-full flex items-center justify-between px-6 sm:px-8 py-2 z-50 transition-all duration-300 ${
          scrolled ? 'bg-slate-900/50 backdrop-blur-lg border-b border-cyan-500/10 shadow-2xl' : 'bg-transparent'
        }`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 2.8 }}
      >
        <motion.div
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => scrollTo('home')}
          whileHover={{ scale: 1.05 }}
        >
          <Logo className="h-16 w-16" />
          <span className="text-white font-bold text-xl tracking-wide hidden sm:block">Insight AI Club</span>
        </motion.div>
        
        <div className="hidden md:flex items-center">
          <GlassRadioWrapper initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 2.9 }}>
            <div className="glass-radio-group">
              {items.map(item => {
                const id = item.toLowerCase();
                return (
                  <React.Fragment key={id}>
                    <input 
                      type="radio" 
                      name="nav-group" 
                      id={`glass-${id}`} 
                      checked={activeSection === id}
                      onChange={() => scrollTo(id)}
                    />
                    <label htmlFor={`glass-${id}`}>{item}</label>
                  </React.Fragment>
                );
              })}
              <div className="glass-glider" />
            </div>
          </GlassRadioWrapper>
        </div>
        
        <div className="hidden md:block">
          <AnimatedButtonWrapper initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 3.3 }}>
            <button onClick={() => navigate('/signup')}> Join Now</button>
          </AnimatedButtonWrapper>
        </div>

        <motion.button
          className="md:hidden text-white z-50"
          onClick={() => cycleOpen()}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {open ? <FaTimes size={24} /> : <FaBars size={24} />}
        </motion.button>
      </motion.nav>
      
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center space-y-10 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {items.map((item, index) => (
              <motion.button
                key={item}
                className="text-white text-4xl font-bold hover:text-cyan-300 transition-colors"
                onClick={() => scrollTo(item.toLowerCase())}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.1 * index } }}
                exit={{ opacity: 0, y: 20, transition: { delay: 0.1 * (items.length - index) } }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {item}
              </motion.button>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
              exit={{ opacity: 0, y: 20, transition: { delay: 0 } }}
            >
              <AnimatedButtonWrapper>
                  <button onClick={() => navigate('/signup')}>Join Now</button>
              </AnimatedButtonWrapper>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const HeroTitle = () => (
  <motion.h1
    className="text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black text-center leading-none tracking-tighter"
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 3.1, duration: 1 }}
  >
    <motion.span
      className="bg-clip-text text-transparent"
      style={{
        backgroundImage: 'linear-gradient(90deg, #67e8f9, #3b82f6, #8b5cf6, #ec4899, #67e8f9)',
        backgroundSize: '300% 100%',
        WebkitBackgroundClip: 'text',
      }}
      animate={{ backgroundPosition: ['0% center', '150% center', '0% center'] }}
      transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
    >
      Insight Ai Club
    </motion.span>
  </motion.h1>
);

const TeamSection = ({ teamRef, teamY, team }) => {
  const duplicatedTeam = [...team, ...team, ...team];
  return (
    <motion.section
      ref={teamRef}
      id="team"
      className="py-24 bg-white/5 backdrop-blur-2xl overflow-hidden relative"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={containerVariants}
    >
      <motion.h2
        style={{ y: teamY }}
        className="text-5xl md:text-6xl font-bold mb-16 text-center text-white"
        variants={itemVariants}
      >
        Meet the Team
      </motion.h2>
      <div className="w-full overflow-hidden group">
        <motion.div
          className="flex"
          animate={{ x: ['0%', '-200%'] }}
          transition={{ ease: 'linear', duration: 90, repeat: Infinity }}
          whileHover={{ animationPlayState: 'paused' }}
        >
          {duplicatedTeam.map((member, i) => (
            <motion.div
              key={`${member.name}-${i}`}
              className="flex-shrink-0 mx-4 w-[280px]"
              whileHover={{ y: -10, scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="flex flex-col items-center text-center p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 hover:bg-white/10 hover:border-cyan-500/20 transition-all duration-300 h-full shadow-lg">
                <motion.img
                  src={member.img}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mb-6 border-2 border-white/20 object-cover"
                  whileHover={{
                    borderColor: 'rgba(6, 182, 212, 0.5)',
                    boxShadow: "0 0 25px rgba(6, 182, 212, 0.3)"
                  }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/128x128/1e293b/ffffff?text=${member.name.charAt(0)}`; }}
                />
                <h3 className="font-bold text-xl text-white mb-1">{member.name}</h3>
                <p className="text-cyan-300 text-base font-medium">{member.role}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Refs for scroll-triggered animations
  const aboutRef = useRef(null);
  const benefitsRef = useRef(null);
  const eventsRef = useRef(null);
  const teamRef = useRef(null);
  const ctaRef = useRef(null);

  // Scroll progress hooks for parallax
  const { scrollYProgress: aboutProgress } = useScroll({ target: aboutRef, offset: ['start end', 'end start'] });
  const { scrollYProgress: benefitsProgress } = useScroll({ target: benefitsRef, offset: ['start end', 'end start'] });
  const { scrollYProgress: eventsProgress } = useScroll({ target: eventsRef, offset: ['start end', 'end start'] });
  const { scrollYProgress: teamProgress } = useScroll({ target: teamRef, offset: ['start end', 'end start'] });
  const { scrollYProgress: ctaProgress } = useScroll({ target: ctaRef, offset: ['start end', 'end start'] });

  // Parallax effect transformations
  const aboutY = useSpring(useTransform(aboutProgress, [0, 1], ['-20%', '20%']), { stiffness: 100, damping: 30 });
  const benefitsY = useSpring(useTransform(benefitsProgress, [0, 1], ['-20%', '20%']), { stiffness: 100, damping: 30 });
  const eventsY = useSpring(useTransform(eventsProgress, [0, 1], ['-20%', '20%']), { stiffness: 100, damping: 30 });
  const teamY = useSpring(useTransform(teamProgress, [0, 1], ['-20%', '20%']), { stiffness: 100, damping: 30 });
  const ctaY = useSpring(useTransform(ctaProgress, [0, 1], ['-20%', '20%']), { stiffness: 100, damping: 30 });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  // --- MOCK DATA --- //
  const pastEvents = [
    { img: "src/assets/Brainwave.jpg", title: "BRAINWAVE 2025: AI & ML Workshop" },
    { img: "src/assets/stall.jpg", title: "Stall at Make-in MIT-WPU Pavilion" },
    { img: "src/assets/induction.jpg", title: "Induction Event" },
  ];
  
  const benefits = [
    { icon: <FaBrain size={32} className="text-cyan-400"/>, title: "Learn & Grow", desc: "Engage in workshops on cutting-edge AI topics and expand your knowledge base." },
    { icon: <FaUsers size={32} className="text-purple-400"/>, title: "Collaborate", desc: "Work on exciting projects with like-minded peers and build lasting connections." },
    { icon: <FaRocket size={32} className="text-pink-400"/>, title: "Build Your Career", desc: "Gain practical experience and build a professional network in AI." },
  ];
  
  const team = [
    { img: "src/assets/Prasanna.jpg", name: "Prasanna Dengale", role: "President" },
    { img: "src/assets/ManishRaut.jpg", name: "Manish Raut", role: "Vice President" },
    { img: "src/assets/Shounak.HEIC", name: "Shounak Dighe", role: "Tech Support" },
    { img: "src/assets/vedant.png", name: "Vedant Chaudhari", role: "Secretary" },
    { img: "src/assets/sachi.jpg", name: "Sachetan Debray", role: "Research Head" },
    { img: "src/assets/aman.png", name: "Aman Kumar Padhy", role: "Technical Head" },
  ];

  return (
    <>
      <AnimatePresence>
        {loading && <IntroScreen />}
      </AnimatePresence>
      
      <div className="relative min-h-screen bg-slate-900 text-white font-sans overflow-x-hidden">
        <div className="fixed inset-0 z-0">
          <DynamicBackground />
          <MorphingBlobs />
        </div>
        
        {!loading && <CursorSpotlight />}
        
        <Navbar />
        
        <main className="relative z-10">
          {/* Hero Section */}
          <section id="home" className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 overflow-hidden">
            <div className="relative z-10 text-center max-w-5xl mx-auto">
              <HeroTitle />
              <motion.p 
                className="mt-6 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3.3, duration: 0.8 }}
              >
                Hello, World! Welcome to the AI revolution.
              </motion.p>
              <motion.div 
                className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3.5, duration: 0.8 }}
              >
                <AnimatedButtonWrapper>
                  <button onClick={() => navigate('/signup')}>Join Our Club</button>
                </AnimatedButtonWrapper>
                <motion.button 
                  onClick={() => navigate('/login')}
                  className="px-8 py-3.5 border-2 border-white/20 text-white rounded-full text-lg font-medium hover:bg-white/10 hover:border-white/40 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Already a Member!
                </motion.button>
              </motion.div>
            </div>
          </section>

          {/* About Section */}
          <motion.section 
            ref={aboutRef} 
            id="about" 
            className="py-24 px-6 sm:px-8" 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, amount: 0.3 }} 
            variants={containerVariants}
          >
            <div className="max-w-5xl mx-auto text-center">
              <motion.h2 
                style={{ y: aboutY }} 
                className="text-5xl md:text-6xl font-bold mb-12 text-white"
                variants={itemVariants}
              >
                Who We Are
              </motion.h2>
              <motion.div 
                className="p-10 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl"
                variants={scaleInVariants}
                whileHover={{ y: -8, boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <p className="text-gray-200 leading-relaxed text-xl md:text-2xl">
                  The Insight AI Club strives to create a vibrant community of AI enthusiasts by encouraging innovation, hands-on learning, and the real-world application of AI concepts through engaging workshops, impactful projects, and collaborative events.
                </p>
              </motion.div>
            </div>
          </motion.section>

          {/* Benefits Section */}
          <motion.section 
            ref={benefitsRef} 
            id="benefits" 
            className="py-24 px-6 sm:px-8" 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, amount: 0.2 }} 
            variants={containerVariants}
          >
            <motion.h2 
              style={{ y: benefitsY }} 
              className="text-5xl md:text-6xl font-bold mb-16 text-center text-white"
              variants={itemVariants}
            >
              Why Join Us?
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {benefits.map((benefit, i) => (
                <InteractiveCard 
                  key={i} 
                  delay={i * 0.15} 
                  className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 text-center flex flex-col items-center h-full shadow-lg hover:bg-white/10 hover:border-cyan-500/20 transition-all duration-300"
                >
                  <motion.div 
                    className="p-5 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 mb-6 border border-white/15"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {benefit.icon}
                  </motion.div>
                  <h3 className="font-bold text-2xl mb-3 text-white">{benefit.title}</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">{benefit.desc}</p>
                </InteractiveCard>
              ))}
            </div>
          </motion.section>

          {/* Events Section */}
          <motion.section 
            ref={eventsRef} 
            id="events" 
            className="py-24 px-6 sm:px-8" 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, amount: 0.1 }} 
            variants={containerVariants}
          >
            <motion.h2 
              style={{ y: eventsY }} 
              className="text-5xl md:text-6xl font-bold mb-16 text-center text-white"
              variants={itemVariants}
            >
              Past Highlights
            </motion.h2>
            <EventCardsWrapper variants={containerVariants}>
                <div className="cards">
                    {pastEvents.map((event, i) => (
                        <div key={i} className={`card card-${i + 1}`}>
                            <motion.img 
                                src={event.img} 
                                alt={event.title} 
                                className="absolute inset-0 w-full h-full object-cover"
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/800x600/1e293b/ffffff?text=Event'; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                            <div className="relative h-full flex flex-col justify-end p-8">
                                <h3 className="font-bold text-2xl md:text-3xl text-white leading-tight">
                                {event.title}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>
            </EventCardsWrapper>
          </motion.section>

          <TeamSection teamRef={teamRef} teamY={teamY} team={team} />

          {/* New Call to Action Section */}
          <motion.section
            ref={ctaRef}
            id="cta"
            className="py-24 px-6 sm:px-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
          >
            <div className="max-w-4xl mx-auto">
              <motion.div
                className="relative p-10 sm:p-12 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl border border-white/10 text-center overflow-hidden shadow-2xl flex flex-col items-center"
                variants={scaleInVariants}
              >
                <motion.h2
                  style={{ y: ctaY }}
                  className="text-4xl md:text-5xl font-bold mb-4 text-white"
                >
                  Ready to Innovate?
                </motion.h2>
                <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
                  Become a part of our growing community and start your journey into the world of Artificial Intelligence today.
                </p>
                <AnimatedButtonWrapper>
                    <button onClick={() => navigate('/signup')}>
                        Join Insight Ai Club <FaArrowRight />
                    </button>
                </AnimatedButtonWrapper>
              </motion.div>
            </div>
          </motion.section>
        </main>

        {/* Footer */}
        <footer className="relative z-10 bg-slate-900/50 backdrop-blur-lg py-12 px-6 sm:px-8 border-t border-cyan-500/10">
          <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto gap-8">
            <p className="text-gray-400 text-center md:text-left">
              © {new Date().getFullYear()} Insight AI Club @ MIT-WPU. All Rights Reserved.
            </p>
            <div className="flex gap-6">
              {[
                { icon: <FaWhatsapp size={26}/>, href: "https://chat.whatsapp.com/ETKVq50ZIjp6TRfcYSas2m", color: 'hover:text-green-400', shadow: 'rgba(34, 197, 94, 0.4)' },
                { icon: <FaInstagram size={26}/>, href: "https://www.instagram.com/insight.ai_club/", color: 'hover:text-pink-400', shadow: 'rgba(236, 72, 153, 0.4)' },
                { icon: <FaLinkedin size={26}/>, href: "https://www.linkedin.com/company/insight-ai-club/", color: 'hover:text-blue-400', shadow: 'rgba(59, 130, 246, 0.4)' }
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-gray-400 ${social.color} transition-colors duration-300`}
                  whileHover={{
                    scale: 1.25,
                    y: -5,
                    filter: `drop-shadow(0 6px 12px ${social.shadow})`
                  }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
