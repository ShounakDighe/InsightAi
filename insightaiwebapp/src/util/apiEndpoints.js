export const BASE_URL = "http://localhost:8080/api/v1.0";
const CLOUDINARY_CLOUD_NAME = "dnhurv6ti";

export const API_ENDPOINTS = {
    LOGIN: "/login",
    REGISTER: "/register",
    GET_USER_INFO:"/profile",
    UPLOAD_IMAGE: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
}