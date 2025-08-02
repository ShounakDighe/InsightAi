import { FaWhatsapp, FaInstagram, FaLinkedin } from "react-icons/fa";
import logo from "./logo.jpeg";
import login_bg from "./logo_bg.avif";

export const assets = {
    logo,
    login_bg,
};

export const SIDE_BAR_DATA = [
    /*{
        id: "01",
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "/dashboard"
    },*/
    {
        id: "01",
        label: "Stay Tuned",
        message: "We will update you soon. Meanwhile, join our social media groups!"
    },
    {
        id: "02",
        label: "Join Our Socials InsightAi Club",
        links: [
            { platform: "WhatsApp", icon: FaWhatsapp, url: "https://chat.whatsapp.com/ETKVq50ZIjp6TRfcYSas2m" },
            { platform: "Instagram", icon: FaInstagram, url: "https://www.instagram.com/insight.ai_club/" },
            { platform: "LinkedIn", icon: FaLinkedin, url: "https://www.linkedin.com/company/insight-ai-club/" }
        ]
    }
];
