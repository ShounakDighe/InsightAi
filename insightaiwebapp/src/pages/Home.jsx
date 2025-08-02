import { Bell, Lightbulb, Rocket } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as THREE from 'three';
import Dashboard from "../components/Dashboard.jsx";
import { useUser } from "../hooks/useUser.jsx";

const quotes = [
    "Artificial Intelligence is the new electricity. – Andrew Ng",
    "The best way to predict the future is to invent it. – Alan Kay",
    "Data is the new oil. – Clive Humby",
    "AI is not about man versus machine, it's about man with machine.",
    "The future belongs to those who prepare for it today."
];

// --- Shaders for the background ---
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

// --- Dynamic Aurora Background Component ---
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

const Home = () => {
    useUser();
    const [randomQuote, setRandomQuote] = useState("");

    useEffect(() => {
        setRandomQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, []);

    return (
        <div className="relative min-h-screen w-full bg-gray-900 font-sans text-white">
             <DigitalAurora />
            <div className="relative z-10">
                <Dashboard>
                    <div className="my-5 mx-auto">
                        {/* Stay Tuned Banner */}
                        <div className="bg-gray-900/50 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-6 mb-8 text-center shadow-2xl shadow-purple-500/10">
                            <h2 className="text-3xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                                🚀 Stay Tuned!
                            </h2>
                            <p className="text-gray-300">
                                We are working on something amazing. Your profile and features will be updated soon.
                            </p>
                        </div>

                        {/* Random Quote */}
                        <div className="bg-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6 mb-8 text-center shadow-lg">
                            <Lightbulb className="mx-auto text-yellow-400 mb-3" size={30} />
                            <p className="italic text-gray-300">"{randomQuote}"</p>
                        </div>

                        {/* Info Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InfoCard
                                icon={<Rocket className="text-pink-400"/>}
                                label="Upcoming Features"
                                value="Launching Soon"
                                color="from-purple-500 to-pink-500"
                            />
                            <InfoCard
                                icon={<Bell className="text-teal-300"/>}
                                label="Notifications"
                                value="Stay Updated"
                                color="from-blue-500 to-teal-400"
                            />
                            <InfoCard
                                icon={<Lightbulb className="text-orange-300"/>}
                                label="AI Insights"
                                value="Coming Soon"
                                color="from-yellow-400 to-orange-500"
                            />
                        </div>
                    </div>
                </Dashboard>
            </div>
        </div>
    );
};

const InfoCard = ({ icon, label, value, color }) => {
    return (
        <div className="flex items-center gap-5 bg-gray-900/50 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-gray-700/50 transition-all duration-300 hover:border-purple-500/50 hover:-translate-y-1">
            <div
                className={`w-16 h-16 flex items-center justify-center text-3xl text-white bg-gradient-to-br ${color} rounded-full shadow-lg`}
            >
                {icon}
            </div>
            <div>
                <h6 className="text-sm text-gray-400 mb-1">{label}</h6>
                <span className="text-lg font-semibold text-white">{value}</span>
            </div>
        </div>
    );
};

export default Home;
