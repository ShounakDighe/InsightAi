import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage    from "./pages/LandingPage.jsx";
import Login          from "./pages/Login.jsx";
import Signup         from "./pages/Signup.jsx";
import Home           from "./pages/Home.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";  // new
import ResetPassword  from "./pages/ResetPassword.jsx";   // new

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/signup"   element={<Signup />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
