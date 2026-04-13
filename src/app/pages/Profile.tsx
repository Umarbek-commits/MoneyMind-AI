import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy,
  Wallet,
  Bell,
  Shield,
  LogOut,
  ChevronRight,
  TrendingDown,
  Utensils,
  Bot,
  ArrowLeft,
  Check,
  X,
} from "lucide-react";
import { useUser } from "../context/UserContext";

interface Transaction {
  id: number;
  title: string;
  amount: number;
  category: string;
  category_emoji: string;
  date: string;
  time: string;
}

interface TopCategory {
  name: string;
  emoji: string;
}

function getLevelInfo(level: number) {
  if (level >= 80)
    return { label: "Финансовый гений 💎", color: "#a78bfa", glow: "rgba(167,139,250,0.3)" };
  if (level >= 50)
    return { label: "Хороший контроль 👍", color: "#3b82f6", glow: "rgba(59,130,246,0.3)" };
  return { label: "Есть потенциал 🌱", color: "#10b981", glow: "rgba(16,185,129,0.3)" };
}

function getAIInsight(level: number, name: string): string {
  if (level >= 70)
    return `🔥 Отлично, ${name}! Ты контролируешь расходы лучше большинства пользователей`;
  if (level >= 50)
    return `📈 ${name}, ты тратишь чуть больше среднего. AI видит потенциал для роста!`;
  return `⚠️ ${name}, ты тратишь больше, чем 70% пользователей. AI готов помочь тебе это исправить`;
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    "Еда": "🍔",
    "Транспорт": "🚗",
    "Развлечения": "🎮",
    "Шопинг": "🛍️",
    "Здоровье": "💊",
    "Кафе": "☕",
    "Дом": "🏠",
    "Другое": "📦"
  };
  return emojis[category] || "💸";
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateBalance } = useUser();

  const [editBalance, setEditBalance] = useState(false);
  const [newBalance, setNewBalance] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [topCategory, setTopCategory] = useState<TopCategory | null>(null);
  const [avgDailySpend, setAvgDailySpend] = useState(0);

  useEffect(() => {
    // Fetch top category from analytics
    fetch("http://127.0.0.1:8000/api/analytics")
      .then(res => res.json())
      .then(data => {
        const categories = data.top_categories;
        if (categories && categories.length > 0) {
          const first = categories[0]; // "Еда: 4000"
          const name = first.split(":")[0].trim();
          setTopCategory({
            name,
            emoji: getCategoryEmoji(name)
          });
        }
      })
      .catch(err => console.error("Error fetching analytics:", err));

    // Calculate average daily spend
    fetch("http://127.0.0.1:8000/api/transactions")
      .then(res => res.json())
      .then((data: Transaction[]) => {
        if (data.length === 0) return;

        const total = data.reduce((sum: number, t: Transaction) => sum + t.amount, 0);
        const days = new Set(data.map((t: Transaction) => t.date)).size;
        const avg = days ? total / days : 0;
        setAvgDailySpend(Math.round(avg));
      })
      .catch(err => console.error("Error fetching transactions:", err));
  }, []);

  if (!user) return null;

  const level = user.level;
  const gameLevel = Math.floor(level / 10);
  const progressPercent = (level % 10) * 10;
  const info = getLevelInfo(level);

  const handleSaveBalance = () => {
    const val = parseFloat(newBalance.replace(/\s/g, ""));
    if (!isNaN(val) && val >= 0) {
      updateBalance(val);
    }
    setEditBalance(false);
    setNewBalance("");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="pb-28 px-4 pt-6 space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <button
          onClick={() => navigate("/")}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.07)", color: "#d1d5db" }}
        >
          <ArrowLeft size={18} />
        </button>
        <h1 style={{ color: "white", fontSize: "20px", fontWeight: 700 }}>
          Профиль
        </h1>
      </motion.div>

      {/* Avatar + Name Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05 }}
        className="rounded-3xl p-6 flex flex-col items-center relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1e0a3c 0%, #0d1b4b 60%, #0a1628 100%)",
          border: "1px solid rgba(124,58,237,0.4)",
          boxShadow: `0 8px 32px ${info.glow}`,
        }}
      >
        {/* Deco blobs */}
        <div
          className="absolute -top-10 -right-10 w-36 h-36 rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }}
        />
        <div
          className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }}
        />

        {/* Avatar */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 250, delay: 0.1 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mb-3 relative z-10"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
            boxShadow: "0 6px 24px rgba(124,58,237,0.5)",
            fontSize: "36px",
            fontWeight: 800,
            color: "white",
          }}
        >
          {user.name.charAt(0).toUpperCase()}
        </motion.div>

        <h2 style={{ color: "white", fontSize: "22px", fontWeight: 700 }}>{user.name}</h2>
        <p style={{ color: "#9ca3af", fontSize: "13px" }}>{user.email}</p>

        {/* Balance */}
        <div
          className="mt-4 px-6 py-3 rounded-2xl flex items-center gap-2"
          style={{ background: "rgba(255,255,255,0.07)" }}
        >
          <span style={{ color: "#9ca3af", fontSize: "14px" }}>💰 Баланс:</span>
          <span style={{ color: "white", fontWeight: 800, fontSize: "20px" }}>
            {user.balance.toLocaleString("ru-RU")}
          </span>
          <span style={{ color: "#a78bfa", fontSize: "14px" }}>сом</span>
        </div>
      </motion.div>

      {/* Level Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-5"
        style={{
          background: "rgba(18,18,40,0.9)",
          border: `1px solid ${info.color}44`,
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p style={{ color: "#9ca3af", fontSize: "12px" }}>📊 Финансовый уровень</p>
            <p style={{ color: info.color, fontWeight: 700, fontSize: "16px", marginTop: "2px" }}>
              {info.label}
            </p>
          </div>
          <div className="text-right">
            <span
              style={{
                fontSize: "36px",
                fontWeight: 900,
                color: info.color,
                lineHeight: 1,
              }}
            >
              {level}
            </span>
            <span style={{ color: "#6b7280", fontSize: "16px" }}>/100</span>
          </div>
        </div>

        {/* Score bar */}
        <div
          className="h-3 rounded-full overflow-hidden mb-3"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${level}%` }}
            transition={{ duration: 1.0, delay: 0.3, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${info.color}, ${info.color}99)`,
              boxShadow: `0 0 10px ${info.glow}`,
            }}
          />
        </div>

        {/* Game Level */}
        <div
          className="rounded-xl px-4 py-3"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <div className="flex items-center justify-between mb-2">
            <p style={{ color: "#9ca3af", fontSize: "12px" }}>
              🎮 Уровень {gameLevel}
            </p>
            <p style={{ color: "#6b7280", fontSize: "11px" }}>
              {progressPercent}% до уровня {gameLevel + 1}
            </p>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #7c3aed, #3b82f6)" }}
            />
          </div>
        </div>
      </motion.div>

      {/* AI Insight */}
      <motion.div
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl p-4 flex items-start gap-3"
        style={{
          background: "rgba(124,58,237,0.08)",
          border: "1px solid rgba(124,58,237,0.3)",
        }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
        >
          <Bot size={16} className="text-white" />
        </div>
        <div>
          <p style={{ color: "#a78bfa", fontWeight: 600, fontSize: "13px" }}>
            🤖 AI говорит:
          </p>
          <p style={{ color: "#c4b5fd", fontSize: "13px", marginTop: "3px", lineHeight: 1.5 }}>
            {getAIInsight(level, user.name)}
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl p-4"
        style={{
          background: "rgba(18,18,40,0.9)",
          border: "1px solid rgba(124,58,237,0.2)",
        }}
      >
        <h3 style={{ color: "white", fontWeight: 600, fontSize: "15px", marginBottom: "12px" }}>
          📈 Статистика
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(239,68,68,0.15)" }}
              >
                <TrendingDown size={14} style={{ color: "#ef4444" }} />
              </div>
              <span style={{ color: "#9ca3af", fontSize: "13px" }}>
                Средние траты в день
              </span>
            </div>
            <span style={{ color: "white", fontWeight: 600, fontSize: "14px" }}>
              {avgDailySpend.toLocaleString()} сом
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(124,58,237,0.15)" }}
              >
                <Utensils size={14} style={{ color: "#a78bfa" }} />
              </div>
              <span style={{ color: "#9ca3af", fontSize: "13px" }}>
                Самая большая категория
              </span>
            </div>
            <span style={{ color: "white", fontWeight: 600, fontSize: "14px" }}>
              {topCategory ? `${topCategory.emoji} ${topCategory.name}` : "Загрузка..."}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Achievements Card */}
      <motion.button
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate("/achievements")}
        className="w-full rounded-2xl p-4 flex items-center justify-between"
        style={{
          background: "rgba(18,18,40,0.9)",
          border: "1px solid rgba(245,158,11,0.3)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(245,158,11,0.15)" }}
          >
            <Trophy size={18} style={{ color: "#f59e0b" }} />
          </div>
          <div className="text-left">
            <p style={{ color: "white", fontWeight: 600, fontSize: "14px" }}>
              Мои достижения 🏆
            </p>
            <p style={{ color: "#6b7280", fontSize: "12px" }}>
              Открыто 3 из 8 достижений
            </p>
          </div>
        </div>
        <ChevronRight size={18} style={{ color: "#f59e0b" }} />
      </motion.button>

      {/* Settings */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(18,18,40,0.9)",
          border: "1px solid rgba(124,58,237,0.2)",
        }}
      >
        <p
          className="px-4 pt-4 pb-2"
          style={{ color: "#6b7280", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.8px" }}
        >
          Настройки
        </p>

        {/* Change balance */}
        <div>
          <button
            onClick={() => { setEditBalance(true); setNewBalance(String(user.balance)); }}
            className="w-full flex items-center justify-between px-4 py-3 transition-all"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(16,185,129,0.15)" }}
              >
                <Wallet size={14} style={{ color: "#10b981" }} />
              </div>
              <span style={{ color: "#e5e7eb", fontSize: "14px" }}>
                Изменить баланс
              </span>
            </div>
            <ChevronRight size={16} style={{ color: "#4b5563" }} />
          </button>

          {/* Inline balance edit */}
          <AnimatePresence>
            {editBalance && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div className="px-4 py-3 flex items-center gap-2">
                  <input
                    autoFocus
                    type="number"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSaveBalance(); if (e.key === "Escape") setEditBalance(false); }}
                    className="flex-1 rounded-xl px-3 py-2 outline-none"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(16,185,129,0.4)",
                      color: "white",
                      fontSize: "14px",
                    }}
                    placeholder="Новый баланс"
                  />
                  <button
                    onClick={handleSaveBalance}
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(16,185,129,0.2)" }}
                  >
                    <Check size={16} style={{ color: "#10b981" }} />
                  </button>
                  <button
                    onClick={() => setEditBalance(false)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(239,68,68,0.15)" }}
                  >
                    <X size={16} style={{ color: "#ef4444" }} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <button
          className="w-full flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(59,130,246,0.15)" }}
            >
              <Bell size={14} style={{ color: "#3b82f6" }} />
            </div>
            <span style={{ color: "#e5e7eb", fontSize: "14px" }}>Уведомления</span>
          </div>
          <div
            className="w-10 h-6 rounded-full flex items-center px-1"
            style={{ background: "rgba(16,185,129,0.3)", border: "1px solid rgba(16,185,129,0.5)" }}
          >
            <motion.div
              animate={{ x: 16 }}
              className="w-4 h-4 rounded-full"
              style={{ background: "#10b981" }}
            />
          </div>
        </button>

        {/* Security */}
        <button
          className="w-full flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(167,139,250,0.15)" }}
            >
              <Shield size={14} style={{ color: "#a78bfa" }} />
            </div>
            <span style={{ color: "#e5e7eb", fontSize: "14px" }}>Безопасность</span>
          </div>
          <ChevronRight size={16} style={{ color: "#4b5563" }} />
        </button>

        {/* Logout */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center gap-3 px-4 py-3"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(239,68,68,0.15)" }}
          >
            <LogOut size={14} style={{ color: "#ef4444" }} />
          </div>
          <span style={{ color: "#ef4444", fontSize: "14px" }}>Выйти</span>
        </button>
      </motion.div>

      {/* Logout confirm modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.7)" }}
              onClick={() => setShowLogoutConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-72 rounded-3xl p-6"
              style={{
                background: "rgba(20,18,45,0.98)",
                border: "1px solid rgba(239,68,68,0.4)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
              }}
            >
              <p
                className="text-center"
                style={{ fontSize: "32px", marginBottom: "8px" }}
              >
                👋
              </p>
              <h3
                className="text-center"
                style={{ color: "white", fontWeight: 700, fontSize: "17px" }}
              >
                Выйти из аккаунта?
              </h3>
              <p
                className="text-center mt-2 mb-5"
                style={{ color: "#9ca3af", fontSize: "13px" }}
              >
                Твои данные сохранятся
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    color: "#9ca3af",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  Отмена
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-3 rounded-xl"
                  style={{
                    background: "rgba(239,68,68,0.2)",
                    border: "1px solid rgba(239,68,68,0.4)",
                    color: "#ef4444",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  Выйти
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}