import { Eye, EyeOff, LoaderCircle, Upload, ArrowLeft } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import styled from 'styled-components';
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import axiosConfig from "../util/axisConfig.jsx";
import uploadProfileImage from "../util/uploadProfileImage.js";
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

// --- Profile Photo Selector ---
const ProfilePhotoSelector = ({ image, setImage }) => {
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    return (
        <div className="flex flex-col items-center">
            <div
                className="w-32 h-32 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer mb-2 overflow-hidden hover:border-cyan-400 transition-colors"
                onClick={() => fileInputRef.current.click()}
            >
                {preview ? (
                    <img src={preview} alt="Profile Preview" className="w-full h-full object-cover" />
                ) : (
                    <div className="text-center">
                        <Upload className="mx-auto text-gray-400" size={32} />
                        <p className="text-xs text-gray-400 mt-1">Upload Photo</p>
                    </div>
                )}
            </div>
            <p className="text-xs text-gray-500 mb-4">(Optional)</p>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
            />
        </div>
    );
};


const Signup = () => {
    const [fullname, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        let profileImageUrl = "";
        setIsLoading(true);

        if (!fullname.trim()) {
            setError("Please enter your full name");
            setIsLoading(false);
            return;
        }
        if (!validateEmail(email)) {
            setError("Please enter a valid email");
            setIsLoading(false);
            return;
        }
        if (!password.trim()) {
            setError("Please enter your password");
            setIsLoading(false);
            return;
        }

        setError("");

        // Signup api call
        try {
            // Upload the img if present
            if (profilePhoto) {
                const imageUrl = await uploadProfileImage(profilePhoto);
                profileImageUrl = imageUrl || "";
            }

            const response = await axiosConfig.post(API_ENDPOINTS.REGISTER, {
                fullname,
                email,
                password,
                profileImageUrl
            });
            if (response.status === 201) {
                toast.success("Signup successful! Please check your email to verify your account.");
                navigate("/login");
            }
        } catch (err) {
            if (err.response) {
                if (err.response.status === 403) {
                    toast.error("User already a member. Please login.");
                } else {
                    toast.error(err.response.data?.message || "Signup failed");
                }
            } else {
                toast.error("Network error. Please try again.");
            }
             setError(err.response?.data?.message || "An error occurred.");
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
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.h3 
                        variants={itemVariants}
                        className="text-3xl font-bold text-white text-center mb-2"
                    >
                        Join Insight Ai Club
                    </motion.h3>
                    <motion.p 
                        variants={itemVariants}
                        className="text-sm text-gray-400 text-center mb-8"
                    >
                        Create your account for Insight AI Club Portal.
                    </motion.p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <motion.div variants={itemVariants}>
                            <ProfilePhotoSelector image={profilePhoto} setImage={setProfilePhoto} />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Input
                                value={fullname}
                                onChange={(e) => setFullName(e.target.value)}
                                label="Full Name"
                                placeholder="Enter your full name"
                                type="text"
                            />
                        </motion.div>
                        
                        <motion.div variants={itemVariants}>
                            <Input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                label="Email"
                                placeholder="user.mitwpu.edu.in"
                                type="email"
                            />
                        </motion.div>
                        
                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="********"
                                    type={showPassword ? "text" : "password"}
                                    className="w-full pl-4 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
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
                                    disabled={isLoading}
                                    type="submit"
                                >
                                    {isLoading ? (
                                        <>
                                            <LoaderCircle className="animate-spin w-5 h-5" />
                                            Creating...
                                        </>
                                    ) : (
                                        "SIGN UP"
                                    )}
                                </button>
                            </AnimatedButtonWrapper>
                        </motion.div>

                        <motion.p 
                            variants={itemVariants}
                            className="text-sm text-gray-400 text-center pt-4"
                        >
                            Already a Member?{" "}
                            <Link
                                to="/login"
                                className="font-medium text-cyan-400 hover:text-cyan-300 underline transition-colors"
                            >
                                Login
                            </Link>
                        </motion.p>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default Signup;
