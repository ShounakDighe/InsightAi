export const BASE_URL = "https://insight-ai-club.onrender.com/api/v1.0";
const CLOUDINARY_CLOUD_NAME = "dnhurv6ti";

export const API_ENDPOINTS = {
  LOGIN:      "/login",
  REGISTER:   "/register",
  GET_USER_INFO: "/profile",
  UPLOAD_IMAGE: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,

  // ← Add these:
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD:  "/auth/reset-password",
};
