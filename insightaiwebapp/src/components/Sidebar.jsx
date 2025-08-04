import { User, Instagram, Linkedin, Twitter, Camera, LoaderCircle } from "lucide-react";
import { motion } from 'framer-motion';
import React, { useContext, useRef, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { SIDE_BAR_DATA } from "../assets/assets"; // Assuming this is the correct path
import { AppContext } from "../context/AppContext"; // Assuming this is the correct path
import axiosConfig from "../util/axisConfig.jsx"; // Assuming this utility exists

// --- MISSING UTILITIES AND CONFIG (Added for a complete solution) ---

// 1. API Endpoints (with the missing UPDATE_PROFILE)
const API_ENDPOINTS = {
  UPDATE_PROFILE: "/profile/update", // The endpoint to save the new image URL
  UPLOAD_IMAGE: `https://api.cloudinary.com/v1_1/dnhurv6ti/image/upload`,
};

// 2. Image Upload Utility (The missing uploadProfileImage.js logic)
const uploadProfileImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    
    formData.append("upload_preset", "Insight Ai"); 

    try {
        const response = await fetch(API_ENDPOINTS.UPLOAD_IMAGE, {
            method: "POST",
            body: formData,
        });
        const data = await response.json();
        if (data.secure_url) {
            return data.secure_url;
        } else {
            // Throw the actual error from Cloudinary for better debugging
            throw new Error(data.error?.message || "Cloudinary upload failed.");
        }
    } catch (error) {
        console.error("Error uploading image to Cloudinary:", error);
        // Re-throw the error so the calling function can catch it
        throw error;
    }
};


// --- ANIMATION VARIANTS ---
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
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12
    }
  },
};

const Sidebar = () => {
    const { user, setUser } = useContext(AppContext);
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // A fallback user object to prevent errors if user context is not yet available
    const safeUser = user || { fullname: 'Guest', profileImageUrl: null };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setPreview(URL.createObjectURL(file));
        setIsLoading(true);

        try {
            // Step 1: Upload image to Cloudinary
            const imageUrl = await uploadProfileImage(file);
            
            // Step 2: Update the user's profile in your database
            const response = await axiosConfig.put(API_ENDPOINTS.UPDATE_PROFILE, {
                profileImageUrl: imageUrl,
            });

            // Step 3: Update the user context to reflect the change
            if (response.data && response.data.user) {
                setUser(response.data.user);
                setPreview(null); // Clear local preview to use the new URL from context
                toast.success("Profile picture updated!");
            } else {
                throw new Error("Invalid response from server after update.");
            }

        } catch (error) {
            // This will now log more specific errors from the upload or the API call
            console.error("Failed to update profile picture:", error);
            toast.error(error.message || "Couldn't update profile picture.");
            setPreview(null); // Revert preview on failure
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <>
            {/* Toaster for notifications */}
            <Toaster position="top-center" reverseOrder={false} />
            <motion.aside 
                className="w-64 h-screen bg-white/5 backdrop-blur-xl text-white p-5 flex-col items-center sticky top-0 z-20 border-r border-white/10 hidden lg:flex"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                
                {/* Profile Section */}
                <motion.div 
                    variants={itemVariants}
                    className="flex flex-col items-center justify-center gap-3 mt-3 mb-8 w-full"
                >
                    <div className="relative">
                        {preview || safeUser?.profileImageUrl ? (
                            <motion.img
                                src={preview || safeUser.profileImageUrl}
                                alt="profile"
                                className="w-24 h-24 rounded-full object-cover border-4 border-purple-500/50 shadow-lg"
                                whileHover={{ scale: 1.05, rotate: 3 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/96x96/6d28d9/ffffff?text=User'; }}
                            />
                        ) : (
                            <motion.div 
                                className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center border-4 border-purple-500/50 shadow-lg"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <User className="w-12 h-12 text-white" />
                            </motion.div>
                        )}
                        {/* Hidden file input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            className="hidden"
                            accept="image/*"
                            disabled={isLoading}
                        />

                        {/* Loading Overlay */}
                        {isLoading && (
                            <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                                <LoaderCircle className="w-8 h-8 text-white animate-spin" />
                            </div>
                        )}

                        {/* Update Profile Picture Button */}
                        {!isLoading && (
                            <motion.button
                                className="absolute bottom-0 right-0 bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20 text-white hover:bg-white/20 transition-colors"
                                title="Update Profile Picture"
                                whileHover={{ scale: 1.15, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => fileInputRef.current.click()}
                            >
                                <Camera className="w-4 h-4" />
                            </motion.button>
                        )}
                    </div>
                    <h5 className="text-white font-semibold text-lg leading-6 text-center mt-2 truncate w-full">
                        {safeUser.fullname}
                    </h5>
                </motion.div>

                {/* Sidebar Items */}
                <div className="w-full flex flex-col items-center space-y-6">
                    {SIDE_BAR_DATA.map((item) => {
                        if (item.message) {
                            return (
                                <motion.div
                                    key={item.id}
                                    variants={itemVariants}
                                    className="p-4 text-sm text-gray-300 bg-white/5 rounded-xl text-center border border-white/10 w-full"
                                >
                                    <p className="font-semibold text-purple-400 mb-1">{item.label}</p>
                                    <p>{item.message}</p>
                                </motion.div>
                            );
                        }

                        if (item.links) {
                            return (
                                <motion.div key={item.id} variants={itemVariants} className="mt-4 flex flex-col items-center w-full">
                                    <h6 className="font-semibold text-gray-400 mb-3 text-center uppercase text-xs tracking-wider">
                                        {item.label}
                                    </h6>
                                    <div className="flex gap-4 justify-center">
                                        {item.links.map((link, index) => (
                                            <motion.a
                                                key={index}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 bg-white/5 rounded-full hover:bg-purple-500/30 transition-all duration-300 group"
                                                whileHover={{ y: -3, scale: 1.1 }}
                                                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                                            >
                                                <link.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                                            </motion.a>
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        }

                        return null;
                    })}
                </div>
            </motion.aside>
        </>
    );
};

export default Sidebar;
