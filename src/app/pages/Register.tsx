import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, User, Calendar, Wallet, Eye, EyeOff, AlertCircle, ArrowLeft } from "lucide-react";
import { useUser } from "../context/UserContext";

interface Field {
  label: string;
  placeholder: string;
  type: string;
  key: "name" | "email" | "password" | "age" | "balance";
  icon: React.ReactNode;
  prefix?: string;
}

export default function Register() {
  const navigate = useNavigate();
  const { register } = useUser();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    balance: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key: string, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    setError("");
    if (!form.name.trim()) { setError("Введи имя"); return; }
    if (!form.email.trim()) { setError("Введи email"); return; }
    if (form.password.length < 4) { setError("Пароль минимум 4 символа"); return; }
    
    const balance = parseFloat(form.balance);
    if (!form.balance || isNaN(balance) || balance < 0) {
      setError("Введи корректный начальный баланс");
      return;
    }
    
    // ✅ Возраст теперь обязательный
    const age = parseInt(form.age);
    if (!form.age || isNaN(age) || age <= 0 || age > 120) {
      setError("Введи корректный возраст (от 1 до 120 лет)");
      return;
    }

    setLoading(true);
    
    try {
      const success = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        balance,
        age, // ← всегда число
      });
      
      if (success) {
        navigate("/welcome");
      } else {
        setError("Ошибка регистрации. Попробуй другой email.");
      }
    } catch (err) {
      setError("Ошибка соединения с сервером");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fields: Field[] = [
    {
      label: "Имя",
      placeholder: "Айбек",
      type: "text",
      key: "name",
      icon: <User size={16} style={{ color: "#7c3aed" }} />,
    },
    {
      label: "Email",
      placeholder: "example@gmail.com",
      type: "email",
      key: "email",
      icon: <Mail size={16} style={{ color: "#7c3aed" }} />,
    },
    {
      label: "Возраст",
      placeholder: "18",
      type: "number",
      key: "age",
      icon: <Calendar size={16} style={{ color: "#7c3aed" }} />,
    },
    {
      label: "Начальный баланс",
      placeholder: "10 000",
      type: "number",
      key: "balance",
      icon: <Wallet size={16} style={{ color: "#10b981" }} />,
      prefix: "сом",
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden"
      style={{ background: "#060612" }}
    >
      {/* Background glows */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute bottom-10 left-0 w-60 h-60 rounded-full opacity-15"
        style={{
          background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 mb-6"
          style={{ color: "#9ca3af", fontSize: "14px" }}
        >
          <ArrowLeft size={16} />
          Назад
        </motion.button>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 style={{ color: "white", fontSize: "24px", fontWeight: 800 }}>
            Создать аккаунт 🚀
          </h1>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>
            AI проанализирует твои финансы сразу после регистрации
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl p-6 space-y-4"
          style={{
            background: "rgba(16, 14, 35, 0.9)",
            border: "1px solid rgba(124, 58, 237, 0.25)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          {/* Regular fields */}
          {fields.map((f, i) => (
            <motion.div
              key={f.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
            >
              <label
                style={{
                  color: "#9ca3af",
                  fontSize: "12px",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                {f.label}{" "}
                {f.key === "balance" && (
                  <span style={{ color: "#10b981" }}>💡 делает приложение живым</span>
                )}
              </label>
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{
                  background:
                    f.key === "balance"
                      ? "rgba(16, 185, 129, 0.06)"
                      : "rgba(255,255,255,0.05)",
                  border:
                    f.key === "balance"
                      ? "1px solid rgba(16,185,129,0.3)"
                      : "1px solid rgba(124,58,237,0.2)",
                }}
              >
                {f.icon}
                <input
                  type={f.type}
                  value={form[f.key]}
                  onChange={(e) => set(f.key, e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder={f.placeholder}
                  className="flex-1 bg-transparent outline-none"
                  style={{ color: "white", fontSize: "14px" }}
                />
                {f.prefix && (
                  <span style={{ color: "#6b7280", fontSize: "13px" }}>{f.prefix}</span>
                )}
              </div>
            </motion.div>
          ))}

          {/* Password separately (needs eye toggle) */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label
              style={{
                color: "#9ca3af",
                fontSize: "12px",
                display: "block",
                marginBottom: "6px",
              }}
            >
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
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Минимум 4 символа"
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
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                }}
              >
                <AlertCircle size={14} style={{ color: "#ef4444" }} />
                <span style={{ color: "#fca5a5", fontSize: "13px" }}>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
            style={{
              background: loading
                ? "rgba(124,58,237,0.4)"
                : "linear-gradient(135deg, #7c3aed, #06b6d4)",
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
                AI анализирует...
              </>
            ) : (
              "Создать аккаунт ✨"
            )}
          </motion.button>
        </motion.div>

        <p className="text-center mt-4" style={{ color: "#6b7280", fontSize: "14px" }}>
          Уже есть аккаунт?{" "}
          <button
            onClick={() => navigate("/login")}
            style={{ color: "#a78bfa", fontWeight: 600 }}
          >
            Войти
          </button>
        </p>
      </div>
    </div>
  );
}