import { useEffect } from "react";
import Navbar from "../components/Navbar";
import HomePage from "../pages/HomePage";
import { Routes, Route } from "react-router-dom";
import { useThemeStore } from "../store/useThemeStore";
import { useAuthStore } from "../store/hooks/useAuthStore";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();

  useEffect(() => {
    console.log("🔗 Current user:", user);
  }, [user]);

  return (
    <div data-theme={theme}>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
      <Toaster />
      {user && (
        <div
          style={{
            position: "fixed",
            bottom: 10,
            right: 10,
            background: "#e0f7fa",
            padding: "10px 15px",
            borderRadius: "10px",
            fontSize: "14px",
            boxShadow: "0 0 5px rgba(0,0,0,0.2)",
          }}
        >
          ✅ Connected as <strong>{user.username}</strong>
        </div>
      )}
    </div>
  );
};

export default App;
