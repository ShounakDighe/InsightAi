import { User } from "lucide-react";
import { useContext } from "react";
import { SIDE_BAR_DATA } from "../assets/assets";
import { AppContext } from "../context/AppContext";

const Sidebar = () => {
    const { user } = useContext(AppContext);

    // A fallback user object to prevent errors if user context is not yet available
    const safeUser = user || { fullname: 'Guest', profileImageUrl: null };

    return (
        <div className="w-64 h-[calc(100vh-77px)] bg-gray-900/80 backdrop-blur-xl text-white p-5 flex flex-col items-center sticky top-[77px] z-20 lg:bg-gray-900/50 lg:border-r lg:border-gray-700/50">
            
            {/* Profile */}
            <div className="flex flex-col items-center justify-center gap-3 mt-3 mb-8 w-full">
                <div className="relative">
                    {safeUser?.profileImageUrl ? (
                        <img
                            src={safeUser.profileImageUrl}
                            alt="profile"
                            className="w-24 h-24 rounded-full object-cover border-4 border-purple-500/50 shadow-lg"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center border-4 border-purple-500/50 shadow-lg">
                            <User className="w-12 h-12 text-white" />
                        </div>
                    )}
                </div>
                <h5 className="text-white font-semibold text-lg leading-6 text-center mt-2 truncate w-full">
                    {safeUser.fullname}
                </h5>
            </div>

            {/* Sidebar Items */}
            <div className="w-full flex flex-col items-center space-y-6">
                {SIDE_BAR_DATA.map((item) => {
                    if (item.message) {
                        return (
                            <div
                                key={item.id}
                                className="p-4 text-sm text-gray-300 bg-gray-800/50 rounded-xl text-center border border-gray-700/50 w-full"
                            >
                                <p className="font-semibold text-purple-400 mb-1">{item.label}</p>
                                <p>{item.message}</p>
                            </div>
                        );
                    }

                    if (item.links) {
                        return (
                            <div key={item.id} className="mt-4 flex flex-col items-center w-full">
                                <h6 className="font-semibold text-gray-400 mb-3 text-center uppercase text-xs tracking-wider">
                                    {item.label}
                                </h6>
                                <div className="flex gap-4 justify-center">
                                    {item.links.map((link, index) => (
                                        <a
                                            key={index}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 bg-gray-800/50 rounded-full hover:bg-purple-500/30 transition-all duration-300 group"
                                        >
                                            <link.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        );
                    }

                    return null;
                })}
            </div>
        </div>
    );
};

export default Sidebar;
