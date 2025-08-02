import { LogOut, Menu, User, X } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets.js";
import { AppContext } from "../context/AppContext.jsx";
import Sidebar from "./Sidebar.jsx";

const Menubar = () => {
    const [openSideMenu, setOpenSideMenu] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const { user, clearUser } = useContext(AppContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        clearUser();
        setShowDropdown(false);
        navigate("/login");
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showDropdown]);

    // A fallback user object to prevent errors if user context is not yet available
    const safeUser = user || { fullname: 'Guest', email: 'guest@example.com' };

    return (
        <div className="flex items-center justify-between gap-5 bg-gray-900/50 border-b border-gray-700/50 backdrop-blur-lg py-4 px-4 sm:px-7 sticky top-0 z-30">
            {/* Left side */}
            <div className="flex items-center gap-5">
                <button
                    onClick={() => setOpenSideMenu(!openSideMenu)}
                    className="block lg:hidden text-gray-300 hover:text-white p-1 rounded transition-colors"
                >
                    {openSideMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                <div className="flex items-center gap-3">
                    <img src={assets.logo} alt="logo" className="h-10 w-10 rounded-full" />
                    <span className="text-lg font-semibold text-white truncate hidden sm:block">
                        Insight AI Club
                    </span>
                </div>
            </div>

            {/* Right side */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center justify-center w-10 h-10 bg-gray-800/50 hover:bg-gray-700/60 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                    <User className="text-purple-400" />
                </button>

                {showDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-gray-900/80 backdrop-blur-xl rounded-lg shadow-2xl border border-gray-700/50 py-1 z-50">
                        <div className="px-4 py-3 border-b border-gray-700/50">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{safeUser.fullname}</p>
                                    <p className="text-xs text-gray-400 truncate">{safeUser.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="py-1">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors duration-150"
                            >
                                <LogOut className="w-4 h-4 text-gray-400" />
                                <span>Log Out</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Sidebar Container */}
            {openSideMenu && (
                <div className="fixed left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 lg:hidden z-20 top-[76px]">
                    <Sidebar />
                </div>
            )}
        </div>
    );
};

export default Menubar;
