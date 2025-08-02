import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import Login       from "./pages/Login.jsx";
import Signup      from "./pages/Signup.jsx";
import Home        from "./pages/Home.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Show LandingPage at "/" */}
        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/signup"   element={<Signup />} />
        <Route path="/dashboard" element={<Home />} />

        {/* catch-all: if someone goes to unknown route, redirect to "/" */}
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
