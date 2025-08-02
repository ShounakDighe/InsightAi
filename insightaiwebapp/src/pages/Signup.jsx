import { Eye, EyeOff, LoaderCircle, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import * as THREE from 'three';
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import axiosConfig from "../util/axisConfig.jsx";
import uploadProfileImage from "../util/uploadProfileImage.js";
import { validateEmail } from "../util/validation.js";

// --- Shaders for the background (same as login) ---
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

// --- Dynamic Aurora Background Component (same as login) ---
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

// --- Custom Input component for dark theme (same as login) ---
const Input = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
        <input
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
            {...props}
        />
    </div>
);

// --- Profile Photo Selector styled for the new UI ---
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
                className="w-32 h-32 rounded-full bg-gray-800/50 border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer mb-2 overflow-hidden"
                onClick={() => fileInputRef.current.click()}
            >
                {preview ? (
                    <img src={preview} alt="Profile Preview" className="w-full h-full object-cover" />
                ) : (
                    <div className="text-center">
                        <Upload className="mx-auto text-gray-500" size={32} />
                        <p className="text-xs text-gray-500 mt-1">Upload Photo</p>
                    </div>
                )}
            </div>
             {/* Added text to indicate photo is optional */}
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
    const [showPassword, setShowPassword] = useState(false); // State for password visibility

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
        <div className="h-screen w-full relative flex items-center justify-center overflow-hidden bg-gray-900 font-sans">
            {/* Toaster component to display toast notifications */}
            <Toaster position="top-center" reverseOrder={false} />

            {/* Background Aurora */}
            <DigitalAurora />

            {/* Signup Box */}
            <div className="relative z-10 w-full max-w-lg px-6">
                <div className="bg-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
                    <h3 className="text-3xl font-bold text-white text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400">
                        Join the Future
                    </h3>
                    <p className="text-sm text-gray-400 text-center mb-8">
                        Create your account for Insight AI Club.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <ProfilePhotoSelector image={profilePhoto} setImage={setProfilePhoto} />

                        <Input
                            value={fullname}
                            onChange={(e) => setFullName(e.target.value)}
                            label="Full Name"
                            placeholder="Enter your full name"
                            type="text"
                        />
                        <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            label="Email"
                            placeholder="name@email.com"
                            type="email"
                        />
                        
                        {/* Password Input with Visibility Toggle */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="********"
                                    type={showPassword ? "text" : "password"}
                                    className="w-full pl-4 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-purple-400"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>


                        {error && (
                            <p className="text-red-400 text-sm text-center bg-red-900/30 p-3 rounded-lg border border-red-500/50">
                                {error}
                            </p>
                        )}

                        <button
                            disabled={isLoading}
                            className={`w-full py-3 mt-4 text-base font-bold flex items-center justify-center gap-2 rounded-lg text-white transition-all duration-300
                                ${isLoading
                                    ? "bg-gray-600 cursor-not-allowed"
                                    : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
                                }`}
                            type="submit"
                        >
                            {isLoading ? (
                                <>
                                    <LoaderCircle className="animate-spin w-5 h-5" />
                                    Creating Account...
                                </>
                            ) : (
                                "SIGN UP"
                            )}
                        </button>

                        <p className="text-sm text-gray-400 text-center pt-4">
                            Already a Member?{" "}
                            <Link
                                to="/login"
                                className="font-medium text-purple-400 hover:text-purple-300 underline transition-colors"
                            >
                                Login
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup;
