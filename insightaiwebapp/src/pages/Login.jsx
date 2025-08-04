import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import styled from 'styled-components';
import { AppContext } from "../context/AppContext.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import axiosConfig from "../util/axisConfig.jsx";
import { validateEmail } from "../util/validation.js";

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.43, 0.13, 0.23, 0.96],
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  },
};

// --- STYLED COMPONENTS (from landing page for consistency) ---
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

  button:disabled {
    cursor: not-allowed;
    background: #4b5563; /* gray-600 */
    animation: none;
  }

  button:disabled:before {
    background: #4b5563;
    filter: none;
  }
`;

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


// --- Custom Input component for dark theme ---
const Input = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
        <input
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
            {...props}
        />
    </div>
);


const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { setUser } = useContext(AppContext);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Basic validation
        if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            setIsLoading(false);
            return;
        }
        if (!password.trim()) {
            setError("Please enter your password.");
            setIsLoading(false);
            return;
        }

        setError("");

        // Login API call
        try {
            const response = await axiosConfig.post(API_ENDPOINTS.LOGIN, {
                email,
                password,
            });
            const { token, user } = response.data;
            if (token) {
                localStorage.setItem("token", token);
                setUser(user);
                toast.success("Login successful! Redirecting...");
                navigate("/dashboard");
            }

        } catch (err) {
            console.error("Something went wrong", err);
            const errorMessage = err.response?.data?.message || err.message;

            if (errorMessage === "Please Check Your Mails For Verification.") {
                toast.error(errorMessage, {
                    duration: 4000,
                    style: { background: "#fff3cd", color: "#856404" },
                });
            }
            else if (errorMessage === "User not found") {
                toast.error("Email is not registered. Please join Insight AI Club.", {
                    duration: 4000,
                    style: { background: "#f8d7da", color: "#842029" },
                });
            }
            else {
                toast.error(errorMessage);
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-slate-900 font-sans p-4">
            <Toaster position="top-center" reverseOrder={false} />

            <div className="fixed inset-0 z-0">
              <DynamicBackground />
              <MorphingBlobs />
            </div>
            <CursorSpotlight />

            <motion.button
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 z-20 flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
            >
                <ArrowLeft size={20} />
                <span className="font-medium">Back to Home</span>
            </motion.button>

            <div className="relative z-20 w-full max-w-md">
                <motion.div 
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants} className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">
                            Welcome Back
                        </h2>
                        <p className="text-sm text-gray-400">
                            Sign in to access the Insight AI Club portal.
                        </p>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <motion.div variants={itemVariants}>
                            <Input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                label="Email Address"
                                placeholder="user@mitwpu.edu.in"
                                type="email"
                                id="email"
                            />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-300" htmlFor="password">Password</label>
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-cyan-400 hover:text-cyan-300 hover:underline"
                                >
                                    Forgot Password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    type={showPassword ? "text" : "password"}
                                    className="w-full pl-4 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-cyan-400 transition-colors"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </motion.div>
                        
                        {error && (
                            <motion.p 
                                variants={itemVariants}
                                className="text-red-400 text-sm text-center bg-red-900/30 p-3 rounded-lg border border-red-500/50"
                            >
                                {error}
                            </motion.p>
                        )}

                        <motion.div variants={itemVariants} className="flex justify-center pt-4">
                            <AnimatedButtonWrapper>
                                <button
                                    disabled={isLoading}
                                    type="submit"
                                >
                                    {isLoading ? (
                                        <>
                                            <LoaderCircle className="animate-spin w-5 h-5" />
                                            Logging In...
                                        </>
                                    ) : (
                                        "LOG IN"
                                    )}
                                </button>
                            </AnimatedButtonWrapper>
                        </motion.div>

                        <motion.div variants={itemVariants} className="relative pt-2">
                           <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10" />
                           </div>
                           <div className="relative flex justify-center text-sm">
                               <span className="bg-slate-900/80 px-2 text-gray-400 backdrop-blur-sm">Or</span>
                           </div>
                        </motion.div>

                        <motion.p 
                            variants={itemVariants}
                            className="text-sm text-gray-400 text-center"
                        >
                            Not a Member Yet?{" "}
                            <Link
                                to="/signup"
                                className="font-medium text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
                            >
                                Join Now
                            </Link>
                        </motion.p>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
