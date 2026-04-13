import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useUser } from "../context/UserContext";

function getLevelInfo(level: number) {
  if (level >= 80) return { label: "Финансовый гений", emoji: "💎", color: "#a78bfa", glow: "rgba(167,139,250,0.4)" };
  if (level >= 50) return { label: "Хороший контроль", emoji: "👍", color: "#3b82f6", glow: "rgba(59,130,246,0.4)" };
  return { label: "Есть потенциал", emoji: "🌱", color: "#10b981", glow: "rgba(16,185,129,0.4)" };
}

export default function Welcome() {
  const navigate = useNavigate();
  const { user } = useUser();

  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    const timers = [
      setTimeout(() => setStep(1), 600),
      setTimeout(() => setStep(2), 2200),
      setTimeout(() => setStep(3), 3400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [user, navigate]);

  if (!user) return null;

  const level = user.level;
  const gameLevel = Math.floor(level / 10);
  const info = getLevelInfo(level);
  const progressPercent = (level % 10) * 10;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: "#060612" }}
    >
      {/* Animated background */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
        style={{
          background: `radial-gradient(circle, ${info.glow} 0%, transparent 70%)`,
          filter: "blur(40px)",
        }}
      />

      <div className="relative z-10 w-full max-w-sm text-center">
        {/* Step 0: Welcome */}
        <AnimatePresence>
          {step >= 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="text-6xl mb-4"
              >
                👋
              </motion.div>
              <h1
                style={{
                  color: "white",
                  fontSize: "30px",
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                }}
              >
                Добро пожаловать,
              </h1>
              <h2
                style={{
                  fontSize: "32px",
                  fontWeight: 900,
                  background: "linear-gradient(135deg, #a78bfa, #38bdf8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {user.name}!
              </h2>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 1: AI analyzing */}
        <AnimatePresence>
          {step >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-8 rounded-2xl px-6 py-4 flex items-center justify-center gap-3"
              style={{
                background: "rgba(124, 58, 237, 0.1)",
                border: "1px solid rgba(124, 58, 237, 0.3)",
              }}
            >
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
              >
                🤖
              </span>
              <p style={{ color: "#c4b5fd", fontSize: "15px" }}>
                AI анализирует твои финансы
              </p>
              {step < 2 && (
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "#7c3aed" }}
                    />
                  ))}
                </div>
              )}
              {step >= 2 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  style={{ color: "#10b981", fontSize: "18px" }}
                >
                  ✓
                </motion.span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 2: Level reveal */}
        <AnimatePresence>
          {step >= 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
              className="mt-6 rounded-3xl p-6"
              style={{
                background: "rgba(16, 14, 35, 0.95)",
                border: `1px solid ${info.color}55`,
                boxShadow: `0 0 40px ${info.glow}`,
              }}
            >
              <p style={{ color: "#9ca3af", fontSize: "13px", marginBottom: "12px" }}>
                👉 Твой стартовый финансовый уровень:
              </p>

              {/* Score */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <motion.span
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 250 }}
                  style={{ fontSize: "40px" }}
                >
                  {info.emoji}
                </motion.span>
                <div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{
                      fontSize: "44px",
                      fontWeight: 900,
                      color: info.color,
                      lineHeight: 1,
                    }}
                  >
                    {level}
                    <span style={{ fontSize: "20px", color: "#6b7280" }}>/100</span>
                  </motion.p>
                  <p style={{ color: info.color, fontSize: "13px", fontWeight: 600 }}>
                    {info.label}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div
                className="h-3 rounded-full overflow-hidden mb-2"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${level}%` }}
                  transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${info.color}, ${info.color}99)`,
                    boxShadow: `0 0 10px ${info.glow}`,
                  }}
                />
              </div>

              {/* Game level */}
              <div
                className="mt-4 rounded-xl px-4 py-3"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <p style={{ color: "#9ca3af", fontSize: "12px", marginBottom: "8px" }}>
                  Игровой уровень {gameLevel} → {gameLevel + 1}
                </p>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #7c3aed, #3b82f6)" }}
                  />
                </div>
                <p style={{ color: "#6b7280", fontSize: "11px", marginTop: "4px" }}>
                  {progressPercent}% до следующего уровня
                </p>
              </div>

              {/* Balance shown */}
              <div className="flex items-center justify-between mt-4 px-1">
                <span style={{ color: "#6b7280", fontSize: "13px" }}>Начальный баланс</span>
                <span style={{ color: "#10b981", fontWeight: 700, fontSize: "15px" }}>
                  {user.balance.toLocaleString("ru-RU")} сом
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 3: Start button */}
        <AnimatePresence>
          {step >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-6"
            >
              <motion.button
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate("/")}
                className="w-full py-4 rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
                  boxShadow: "0 8px 30px rgba(124,58,237,0.5)",
                  color: "white",
                  fontWeight: 800,
                  fontSize: "17px",
                  letterSpacing: "0.3px",
                }}
              >
                Начать управлять деньгами 🚀
              </motion.button>
              <p style={{ color: "#4b5563", fontSize: "12px", marginTop: "10px" }}>
                MoneyMind AI готов к работе
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
