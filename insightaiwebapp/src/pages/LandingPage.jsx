import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// --- MODIFICATION ---: Added Menu and X icons for the mobile navbar.
import { FaBars, FaBrain, FaInstagram, FaLinkedin, FaRocket, FaTimes, FaUsers, FaWhatsapp } from 'react-icons/fa';
import * as THREE from 'three';

// --- Shaders for the background (No changes) ---
const auroraVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const auroraFragmentShader = `
  uniform float u_time;
  uniform vec2 u_mouse;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform vec3 u_color3;
  varying vec2 vUv;

  float random (vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  float noise (vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vec2 p = vUv * 4.0;
    float n = noise(p + u_time * 0.2 + u_mouse * 0.5);
    
    vec3 color = mix(u_color1, u_color2, smoothstep(0.2, 0.6, n));
    color = mix(color, u_color3, smoothstep(0.5, 0.9, n));

    gl_FragColor = vec4(color, 1.0);
  }
`;

// --- Logo Component (No changes) ---
const Logo = ({ className }) => (
  <img src="https://i.ibb.co/9gX1s3H/logo.png" alt="Insight AI Club Logo" className={className} />
);

// --- Intro Screen Component (MODIFIED) ---
const IntroScreen = () => {
  const text = "Insight Ai Club MIT WPU".split(" ");
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };
  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  const loadingDotVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: "easeInOut"
      }
    }
  };

  const loadingContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: text.length * 0.1 + 0.2,
      }
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-gray-900 flex items-center justify-center z-[100]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, delay: 0.5 } }}
    >
      {/* --- MODIFICATION ---: Combined text and dots into a single h1 for proper mobile alignment */}
      <motion.h1
        className="text-3xl sm:text-4xl md:text-6xl text-white font-bold text-center px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {text.map((word, index) => (
          <motion.span key={index} variants={childVariants} className="inline-block mr-2 sm:mr-3">
            {word}
          </motion.span>
        ))}
        <motion.span variants={loadingContainerVariants} className="inline-flex">
          {[...Array(3)].map((_, i) => (
            <motion.span key={i} variants={loadingDotVariants}>
              .
            </motion.span>
          ))}
        </motion.span>
      </motion.h1>
    </motion.div>
  );
};


// --- Dynamic Aurora Background (No changes) ---
const DigitalAurora = () => {
  const mountRef = useRef(null);
  const mouse = useRef(new THREE.Vector2());

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 10);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const clock = new THREE.Clock();

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader: auroraVertexShader,
      fragmentShader: auroraFragmentShader,
      uniforms: {
        u_time: { value: 0.0 },
        u_mouse: { value: new THREE.Vector2(0, 0) },
        u_color1: { value: new THREE.Color('#0f172a') },
        u_color2: { value: new THREE.Color('#7c3aed') },
        u_color3: { value: new THREE.Color('#0ea5e9') },
      },
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const onMouseMove = (event) => {
      mouse.current.x = (event.clientX / window.innerWidth) - 0.5;
      mouse.current.y = (event.clientY / window.innerHeight) - 0.5;
    };
    window.addEventListener('mousemove', onMouseMove);

    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      material.uniforms.u_time.value = clock.getElapsedTime();
      material.uniforms.u_mouse.value.lerp(mouse.current, 0.05);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 z-0" />;
};


// --- Navbar component updated for mobile responsiveness
const Navbar = ({ onJoinClick }) => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = ['Home', 'About', 'Events', 'Team'];

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const menuVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: 'tween', ease: 'easeInOut' } }
  };

  return (
    <>
      <motion.nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled || isMobileMenuOpen ? 'bg-gray-900/50 backdrop-blur-lg shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <a href="#home" onClick={(e) => handleNavClick(e, 'home')} className="flex-shrink-0">
              <Logo className="h-12 w-12 md:h-14 md:w-14 rounded-full" />
            </a>
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} onClick={(e) => handleNavClick(e, item.toLowerCase())} className="relative text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium" onMouseEnter={() => setHoveredItem(item)} onMouseLeave={() => setHoveredItem(null)}>
                  {item}
                  {hoveredItem === item && (
                    <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-400" layoutId="underline" />
                  )}
                </a>
              ))}
            </div>
            <div className="hidden md:block">
              <motion.button onClick={() => navigate('/signup')} className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Join Insight Ai Club</motion.button>                        </div>
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-300 hover:text-white focus:outline-none">
                {isMobileMenuOpen ? <FaTimes size={28} /> : <FaBars size={28} />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 z-30 bg-gray-900/95 backdrop-blur-xl pt-24 p-8 md:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full space-y-8">
              {navItems.map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} onClick={(e) => handleNavClick(e, item.toLowerCase())} className="text-gray-300 hover:text-white text-3xl font-bold transition-colors">
                  {item}
                </a>
              ))}
              <motion.button onClick={() => navigate('/signup')}
                className="bg-purple-600 text-white px-8 py-4 rounded-full text-xl font-medium mt-8"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Join Insight Ai Club
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// --- Main Landing Page Component ---
export default function LandingPage() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const aboutRef = useRef(null);
  const benefitsRef = useRef(null);
  const eventsRef = useRef(null);
  const teamRef = useRef(null);

  const { scrollYProgress: aboutScrollYProgress } = useScroll({ target: aboutRef, offset: ['start end', 'end start'] });
  const { scrollYProgress: benefitsScrollYProgress } = useScroll({ target: benefitsRef, offset: ['start end', 'end start'] });
  const { scrollYProgress: eventsScrollYProgress } = useScroll({ target: eventsRef, offset: ['start end', 'end start'] });
  const { scrollYProgress: teamScrollYProgress } = useScroll({ target: teamRef, offset: ['start end', 'end start'] });

  const aboutTitleY = useTransform(aboutScrollYProgress, [0, 1], ['-25%', '25%']);
  const benefitsTitleY = useTransform(benefitsScrollYProgress, [0, 1], ['-25%', '25%']);
  const eventsTitleY = useTransform(eventsScrollYProgress, [0, 1], ['-25%', '25%']);
  const teamTitleY = useTransform(teamScrollYProgress, [0, 1], ['-25%', '25%']);

  const heroTitle = "Insight AI Club".split(" ");
  const titleVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };
  const wordVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  const pastEvents = [
    {
      img: "https://placehold.co/800x600/1a1a2e/e94560?text=BRAINWAVE",
      title: "BRAINWAVE 2025: AI & ML Workshop",
    },
    {
      img: "https://placehold.co/600x400/16213e/0f3460?text=Pavilion",
      title: "Stall at Make-in MIT-WPU Pavilion",
    },
    {
      img: "https://placehold.co/600x400/000000/ffffff?text=Induction",
      title: "Induction Event",
    },
  ];

  const benefits = [
    { icon: <FaBrain size={40} className="text-purple-400" />, title: "Learn & Grow", desc: "Engage in workshops on cutting-edge AI topics." },
    { icon: <FaUsers size={40} className="text-purple-400" />, title: "Collaborate", desc: "Work on exciting projects with like-minded peers." },
    { icon: <FaRocket size={40} className="text-purple-400" />, title: "Build Your Career", desc: "Gain practical experience and build network." }
  ];

  const team = [
    { img: "https://placehold.co/300x300/6d28d9/ffffff?text=PD", name: "Prasanna Dengale", role: "President" },
    { img: "https://placehold.co/300x300/be185d/ffffff?text=MR", name: "Manish Raut", role: "Vice President" },
    { img: "https://placehold.co/300x300/2563eb/ffffff?text=SD", name: "Shounak Dighe", role: "Tech Support" },
    { img: "https://placehold.co/300x300/059669/ffffff?text=VC", name: "Vedant Chaudhari", role: "Secretary" },
    { img: "https://placehold.co/300x300/d97706/ffffff?text=SD", name: "Sachetan Debray", role: "Research head" },
    { img: "https://placehold.co/300x300/db2777/ffffff?text=AP", name: "Aman Kumar Padhy", role: "Technical Head" },
  ];

  const duplicatedTeam = [...team, ...team];

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const benefitsContainerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const benefitItemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <>
      <AnimatePresence>{loading && <IntroScreen />}</AnimatePresence>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white font-sans">
        <Navbar onJoinClick={() => navigate('/signup')} />

        <section id="home" className="relative h-screen w-full overflow-hidden flex items-center justify-center">
          <motion.div className="absolute inset-0 z-0">
            <DigitalAurora />
          </motion.div>
          <div className="relative z-10 flex flex-col items-center text-center px-4">
            <motion.h1 className="px-4 sm:px-8 md:px-16 py-2 text-5xl md:text-7xl lg:text-8xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400">
              {heroTitle.map((word, index) => (
                <motion.span key={index} variants={wordVariants} className="inline-block mr-2 md:mr-4">{word}</motion.span>
              ))}
            </motion.h1>
            <motion.p className="text-base md:text-xl mb-8 text-gray-300 max-w-lg md:max-w-2xl" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.8 }}>
              MIT WPU’s premier student community for AI enthusiasts—learn, build, and innovate together.
            </motion.p>
            <motion.button onClick={() => navigate('/signup')} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 px-6 py-3 md:px-8 md:py-4 rounded-full text-base md:text-lg font-medium shadow-lg shadow-purple-500/30" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5, delay: 1, type: 'spring', stiffness: 120 }} whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(192, 132, 252, 0.5)" }}>
              Join Our Club
            </motion.button>
            <motion.button
              onClick={() => navigate('/login')}
              className="text-sm text-gray-400 mt-4 hover:text-white transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              Already a member? Sign in.
            </motion.button>
          </div>
        </section>

        <div className="relative z-10 bg-gray-900">
          <motion.section ref={aboutRef} id="about" className="py-20 md:py-24 px-4 sm:px-8" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={sectionVariants}>
            <div className="max-w-4xl mx-auto text-center">
              <motion.h2 style={{ y: aboutTitleY }} initial={{ opacity: 0, y: -30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 inline-block">Who We Are</motion.h2>
              <motion.p initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-gray-300 leading-relaxed text-base md:text-lg">
                The Insight AI Club strives to create a vibrant community of AI enthusiasts by encouraging innovation, hands-on learning, and the real-world application of AI concepts through engaging workshops, impactful projects, and collaborative events.
              </motion.p>
            </div>
          </motion.section>

          <motion.section ref={benefitsRef} className="py-20 md:py-24 px-4 sm:px-8 bg-black/20" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={benefitsContainerVariants}>
            <motion.h2 style={{ y: benefitsTitleY }} className="text-3xl md:text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 inline-block">Why Join Us?</motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {benefits.map((benefit, i) => (
                <motion.div key={i} className="bg-gray-800/50 backdrop-blur-md p-6 md:p-8 rounded-xl border border-gray-700/50 text-center flex flex-col items-center transition-all duration-300 hover:border-purple-500" variants={benefitItemVariants} whileHover={{ y: -8, scale: 1.05, transition: { type: 'spring', stiffness: 300 } }}>
                  <div className="mb-4">{benefit.icon}</div>
                  <h3 className="font-semibold text-xl md:text-2xl mb-2 text-white">{benefit.title}</h3>
                  <p className="text-gray-400 text-sm md:text-base">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section ref={eventsRef} id="events" className="py-20 md:py-24 px-4 sm:px-8" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={sectionVariants}>
            <motion.h2 style={{ y: eventsTitleY }} className="text-3xl md:text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 inline-block">Past Highlights and Events</motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 max-w-6xl mx-auto md:h-[600px]">
              {pastEvents.map((event, i) => (
                <motion.div
                  key={i}
                  className={`
                                        bg-gray-800/50 backdrop-blur-md rounded-xl overflow-hidden shadow-lg border border-gray-700/50 group relative h-80 md:h-auto
                                        ${i === 0 ? 'md:col-span-2 md:row-span-2' : 'md:col-span-1'}
                                    `}
                  initial={{ scale: 0.9, opacity: 0, y: 50 }}
                  whileInView={{ scale: 1, opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i, duration: 0.5 }}
                  whileHover={{ y: -5, transition: { type: 'spring', stiffness: 300 } }}
                >
                  <img src={event.img} alt={event.title} className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="relative h-full flex flex-col justify-end p-6">
                    <h3 className="font-bold text-xl md:text-2xl mb-2 text-white">{event.title}</h3>
                    <p className="text-gray-300 text-sm md:text-base">{event.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section ref={teamRef} id="team" className="py-20 md:py-24 bg-black/20 overflow-hidden" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={sectionVariants}>
            <motion.h2 style={{ y: teamTitleY }} className="text-3xl md:text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">Meet the Team</motion.h2>
            <div className="w-full overflow-hidden">
              <motion.div
                className="flex"
                animate={{
                  x: ['0%', '-100%'],
                  transition: {
                    ease: 'linear',
                    duration: 25,
                    repeat: Infinity,
                  }
                }}
              >
                {duplicatedTeam.map((member, i) => (
                  <div key={i} className="flex-shrink-0 mx-4" style={{ width: '200px' }}>
                    <div className="flex flex-col items-center text-center">
                      <motion.img
                        src={member.img}
                        alt={member.name}
                        className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover mb-4 border-4 border-purple-500"
                        whileHover={{ scale: 1.1, boxShadow: "0px 0px 20px rgba(167, 139, 250, 0.8)" }}
                      />
                      <h3 className="font-bold text-lg md:text-xl text-white mt-2">{member.name}</h3>
                      <p className="text-purple-400 text-sm md:text-base">{member.role}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.section>
        </div>

        <footer className="mt-auto bg-gray-900 py-8 px-4 sm:px-8 border-t border-gray-800/50 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto">
            <p className="text-gray-500 text-center md:text-left mb-4 md:mb-0 text-sm">
              © {new Date().getFullYear()} Insight AI Club @Mit-Wpu
            </p>
            <div className="flex gap-6">
              {[
                { icon: <FaWhatsapp size={24} />, color: "text-green-500 hover:text-green-400", href: "https://chat.whatsapp.com/ETKVq50ZIjp6TRfcYSas2m" },
                { icon: <FaInstagram size={24} />, color: "text-pink-500 hover:text-pink-400", href: "https://www.instagram.com/insight.ai_club/" },
                { icon: <FaLinkedin size={24} />, color: "text-blue-500 hover:text-blue-400", href: "https://www.linkedin.com/company/insight-ai-club/" }
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${social.color} transition-colors duration-300`}
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: 'spring', stiffness: 300 }}
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
