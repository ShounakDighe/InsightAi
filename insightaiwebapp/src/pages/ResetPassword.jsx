import { ArrowLeft, KeyRound, CheckCircle, LoaderCircle, Eye, EyeOff } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import styled from 'styled-components';
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import axiosConfig from "../util/axisConfig.jsx";

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
    width: 15em; 
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

export default function ResetPassword() {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { search } = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const t = params.get("token");
    if (!t) {
      setError("Invalid or missing reset token.");
      toast.error("Invalid or missing reset token.");
    } else {
      setToken(t);
    }
  }, [search]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await axiosConfig.post(API_ENDPOINTS.RESET_PASSWORD, { token, newPassword });
      toast.success("Password reset successfully! You can now log in.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to reset password. The link may have expired.";
      setError(errorMessage);
      toast.error(errorMessage);
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

      <div className="relative z-20 w-full max-w-md">
        <motion.div
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={itemVariants} className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">
                Reset Your Password
              </h2>
              <p className="text-sm text-gray-400">
                Choose a new, strong password.
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="w-full pl-4 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
                  disabled={!token || isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-cyan-400"
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
                  type="submit"
                  disabled={isLoading || !token || !newPassword}
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle className="animate-spin w-5 h-5" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      Reset Password <KeyRound size={16} />
                    </>
                  )}
                </button>
              </AnimatedButtonWrapper>
            </motion.div>
          </form>
          <motion.div variants={itemVariants} className="mt-6 text-center">
            <Link to="/login" className="font-medium text-sm text-cyan-400 hover:text-cyan-300 hover:underline transition-colors">
              Back to Login
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
