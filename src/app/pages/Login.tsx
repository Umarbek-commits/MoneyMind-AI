import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useUser } from "../context/UserContext";
import { login as apiLogin } from "../../api/api";

export default function Login() {
  const navigate = useNavigate();
  const { refresh } = useUser(); // убираем setUser, он не нужен

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Заполни все поля");
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await apiLogin(email.trim(), password);
      if (res.token) {
        localStorage.setItem("financeai_token", res.token);
        refresh(); // принудительно обновить данные на всех страницах (подгрузит user)
        navigate("/");
      } else {
        setError("Неверный email или пароль");
      }
    } catch (err) {
      setError("Ошибка соединения с сервером");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden"
      style={{ background: "#060612" }}
    >
      {/* Background glows */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full opacity-25"
        style={{
          background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-56 h-56 rounded-full opacity-15"
        style={{
          background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center mb-8"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
              boxShadow: "0 8px 32px rgba(124, 58, 237, 0.5)",
            }}
          >
            <span style={{ fontSize: "40px" }}>🤖</span>
          </motion.div>

          <h1
            style={{
              color: "white",
              fontSize: "26px",
              fontWeight: 800,
              letterSpacing: "-0.5px",
            }}
          >
            MoneyMind AI
          </h1>
          <p style={{ color: "#a78bfa", fontSize: "14px", marginTop: "4px" }}>
            Управляй деньгами умно
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-3xl p-6 space-y-4"
          style={{
            background: "rgba(16, 14, 35, 0.9)",
            border: "1px solid rgba(124, 58, 237, 0.25)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          {/* Email */}
          <div>
            <label style={{ color: "#9ca3af", fontSize: "12px", display: "block", marginBottom: "6px" }}>
              Email
            </label>
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(124,58,237,0.2)",
              }}
            >
              <Mail size={16} style={{ color: "#7c3aed", flexShrink: 0 }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="example@gmail.com"
                className="flex-1 bg-transparent outline-none"
                style={{ color: "white", fontSize: "14px" }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ color: "#9ca3af", fontSize: "12px", display: "block", marginBottom: "6px" }}>
              Пароль
            </label>
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(124,58,237,0.2)",
              }}
            >
              <Lock size={16} style={{ color: "#7c3aed", flexShrink: 0 }} />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="••••••••"
                className="flex-1 bg-transparent outline-none"
                style={{ color: "white", fontSize: "14px" }}
              />
              <button onClick={() => setShowPass(!showPass)}>
                {showPass ? (
                  <EyeOff size={16} style={{ color: "#6b7280" }} />
                ) : (
                  <Eye size={16} style={{ color: "#6b7280" }} />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}
              >
                <AlertCircle size={14} style={{ color: "#ef4444" }} />
                <span style={{ color: "#fca5a5", fontSize: "13px" }}>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
            style={{
              background: loading
                ? "rgba(124,58,237,0.4)"
                : "linear-gradient(135deg, #7c3aed, #3b82f6)",
              boxShadow: loading ? "none" : "0 6px 24px rgba(124,58,237,0.45)",
              color: "white",
              fontWeight: 700,
              fontSize: "16px",
            }}
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white"
                />
                Входим...
              </>
            ) : (
              "Войти 🚀"
            )}
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            <span style={{ color: "#4b5563", fontSize: "12px" }}>или</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* Google Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={async () => {
              setEmail("demo@example.com");
              setPassword("demo1234");
              try {
                const res = await apiLogin("demo@example.com", "demo1234");
                if (res.token) {
                  localStorage.setItem("financeai_token", res.token);
                  refresh();
                  navigate("/");
                } else {
                  setError("Демо вход не удался");
                }
              } catch (err) {
                setError("Ошибка демо входа");
              }
            }}
            className="w-full py-3 rounded-2xl flex items-center justify-center gap-3 transition-all"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#e5e7eb",
              fontSize: "15px",
              fontWeight: 500,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Войти через Google
          </motion.button>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-5"
          style={{ color: "#6b7280", fontSize: "13px" }}
        >
          🤖 AI поможет тебе не остаться без денег
        </motion.p>

        {/* Register link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-4"
          style={{ color: "#6b7280", fontSize: "14px" }}
        >
          Нет аккаунта?{" "}
          <button
            onClick={() => navigate("/register")}
            style={{ color: "#a78bfa", fontWeight: 600 }}
          >
            Регистрация
          </button>
        </motion.p>
      </div>
    </div>
  );
}