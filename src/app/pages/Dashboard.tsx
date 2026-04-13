import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "motion/react";
import { AlertTriangle, TrendingDown, Zap, ChevronRight } from "lucide-react";
import { useDashboard } from "../../hooks/useDashboard";
import { getAIAdvice } from "../../api/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, transactions, loading } = useDashboard();
  const [animatedBalance, setAnimatedBalance] = useState(0);
  const [aiAdvice, setAiAdvice] = useState("Загрузка...");

  const BALANCE = user?.balance ?? 0;

  useEffect(() => {
    let start = 0;
    const end = BALANCE;
    const duration = 1200;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setAnimatedBalance(end);
        clearInterval(timer);
      } else {
        setAnimatedBalance(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [BALANCE]);

  // Загрузка AI‑совета
  useEffect(() => {
    getAIAdvice()
      .then(data => setAiAdvice(data.advice))
      .catch(() => setAiAdvice("Следи за расходами 💡"));
  }, []);

  // Weekly data from real transactions
  const getWeeklyData = () => {
    const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
    const weeklyMap = new Map(days.map(day => [day, 0]));
    
    transactions.forEach(tx => {
      const txDate = new Date(tx.date);
      const dayIndex = txDate.getDay();
      const dayName = days[dayIndex === 0 ? 6 : dayIndex - 1];
      if (weeklyMap.has(dayName)) {
        weeklyMap.set(dayName, weeklyMap.get(dayName)! + tx.amount);
      }
    });
    
    return days.map(day => ({
      day,
      amount: weeklyMap.get(day) || 0
    }));
  };

  const weeklyData = getWeeklyData();

  // Category spending
  const getCategoryData = () => {
    const categoryMap = new Map<string, number>();
    transactions.forEach(tx => {
      categoryMap.set(tx.category, (categoryMap.get(tx.category) || 0) + tx.amount);
    });
    
    const total = Array.from(categoryMap.values()).reduce((a, b) => a + b, 0);
    
    const categoryColors: Record<string, string> = {
      "Еда": "#ef4444",
      "Транспорт": "#3b82f6",
      "Развлечения": "#a855f7",
      "Шопинг": "#ec4899",
      "Здоровье": "#10b981",
      "Кафе": "#f59e0b",
      "Дом": "#14b8a6",
      "Другое": "#6b7280"
    };
    
    return Array.from(categoryMap.entries()).map(([name, amount]) => ({
      name,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      emoji: getCategoryEmoji(name),
      color: categoryColors[name] || "#7c3aed"
    }));
  };

  const getCategoryEmoji = (category: string): string => {
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
  };

  const categories = getCategoryData();

  // ✅ Исправленная функция для подсчёта трат за сегодня
  const getTodaySpending = () => {
    const today = new Date().toISOString().slice(0, 10);
    return transactions
      .filter(tx => tx.date === today)
      .reduce((sum, tx) => sum + tx.amount, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="pb-28 px-4 pt-6 space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <p style={{ color: "#9ca3af", fontSize: "14px" }}>Добро пожаловать</p>
          <h1 className="text-white" style={{ fontSize: "22px", fontWeight: 700 }}>
            Привет, {user?.name ?? "Пользователь"} 👋
          </h1>
        </div>
        <button
          onClick={() => navigate("/profile")}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
        >
          <span style={{ color: "white", fontWeight: 700 }}>
            {(user?.name ?? "У").charAt(0).toUpperCase()}
          </span>
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1e0a3c 0%, #0d1b4b 50%, #0a1628 100%)",
          border: "1px solid rgba(124, 58, 237, 0.4)",
          boxShadow: "0 8px 32px rgba(124, 58, 237, 0.2)",
        }}
      >
        <div
          className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }}
        />
        <div
          className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }}
        />
        <div className="relative z-10">
          <p style={{ color: "#a78bfa", fontSize: "13px" }}>💰 Текущий баланс</p>
          <div className="flex items-end gap-2 mt-1">
            <span
              style={{
                color: "white",
                fontSize: "38px",
                fontWeight: 800,
                lineHeight: 1.1,
              }}
            >
              {animatedBalance.toLocaleString("ru-RU")}
            </span>
            <span style={{ color: "#a78bfa", fontSize: "20px", marginBottom: "4px" }}>
              сом
            </span>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <TrendingDown size={14} style={{ color: "#ef4444" }} />
            <span style={{ color: "#9ca3af", fontSize: "12px" }}>
              Потрачено сегодня:{" "}
              <span style={{ color: "#ef4444", fontWeight: 600 }}>
                -{getTodaySpending().toLocaleString()} сом
              </span>
            </span>
          </div>
        </div>
      </motion.div>

      {/* AI Advice Card — заменяет старый прогноз */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="rounded-xl p-4 flex items-start gap-3"
        style={{
          background: "rgba(16, 185, 129, 0.1)",
          border: "1px solid rgba(16, 185, 129, 0.4)",
        }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: "rgba(16, 185, 129, 0.2)" }}
        >
          <Zap size={16} style={{ color: "#10b981" }} />
        </div>
        <div>
          <p style={{ color: "#10b981", fontWeight: 600, fontSize: "14px" }}>
            🤖 AI Совет
          </p>
          <p style={{ color: "#6ee7b7", fontSize: "13px", marginTop: "2px" }}>
            {aiAdvice}
          </p>
        </div>
      </motion.div>

      {/* Spending Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="rounded-2xl p-4"
        style={{
          background: "rgba(18, 18, 40, 0.9)",
          border: "1px solid rgba(124, 58, 237, 0.2)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 style={{ color: "white", fontWeight: 600, fontSize: "15px" }}>
            📊 Расходы за неделю
          </h3>
          <span style={{ color: "#7c3aed", fontSize: "12px" }}>7 дней</span>
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={weeklyData}>
            <defs>
              <linearGradient id="dashboardSpendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 11 }}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: "#1a1a2e",
                border: "1px solid #7c3aed",
                borderRadius: "8px",
                color: "white",
                fontSize: "12px",
              }}
              formatter={(val: number) => [`${val} сом`, "Расходы"]}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#7c3aed"
              strokeWidth={2}
              fill="url(#dashboardSpendGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Category Bars */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="rounded-2xl p-4 space-y-3"
        style={{
          background: "rgba(18, 18, 40, 0.9)",
          border: "1px solid rgba(124, 58, 237, 0.2)",
        }}
      >
        <h3 style={{ color: "white", fontWeight: 600, fontSize: "15px" }}>
          Категории расходов
        </h3>
        {categories.length > 0 ? (
          categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span style={{ color: "#d1d5db", fontSize: "13px" }}>
                  {cat.emoji} {cat.name}
                </span>
                <span style={{ color: "#9ca3af", fontSize: "12px" }}>
                  {cat.amount.toLocaleString()} сом · {cat.percentage}%
                </span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${cat.percentage}%` }}
                  transition={{ duration: 0.8, delay: 0.5 + i * 0.1, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: cat.color }}
                />
              </div>
            </motion.div>
          ))
        ) : (
          <p style={{ color: "#6b7280", textAlign: "center", padding: "20px" }}>
            Нет данных о расходах
          </p>
        )}
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="rounded-2xl p-4"
        style={{
          background: "rgba(18, 18, 40, 0.9)",
          border: "1px solid rgba(124, 58, 237, 0.2)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 style={{ color: "white", fontWeight: 600, fontSize: "15px" }}>
            Последние траты
          </h3>
          <button
            onClick={() => navigate("/analytics")}
            className="flex items-center gap-1"
            style={{ color: "#7c3aed", fontSize: "12px" }}
          >
            Все <ChevronRight size={12} />
          </button>
        </div>
        <div className="space-y-2">
          {transactions.slice(0, 4).map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.07 }}
              className="flex items-center justify-between py-2 rounded-xl px-3"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(124, 58, 237, 0.15)" }}
                >
                  <span style={{ fontSize: "18px" }}>{tx.category_emoji}</span>
                </div>
                <div>
                  <p style={{ color: "#e5e7eb", fontSize: "13px", fontWeight: 500 }}>
                    {tx.title}
                  </p>
                  <p style={{ color: "#6b7280", fontSize: "11px" }}>
                    {tx.date} · {tx.time}
                  </p>
                </div>
              </div>
              <span
                style={{
                  color: "#ef4444",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                -{tx.amount.toLocaleString()} с
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Старый блок AI Tip (оставлен как есть) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="rounded-2xl p-4 flex items-start gap-3"
        style={{
          background: "rgba(16, 185, 129, 0.08)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
        }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(16, 185, 129, 0.2)" }}
        >
          <Zap size={16} style={{ color: "#10b981" }} />
        </div>
        <div>
          <p style={{ color: "#10b981", fontWeight: 600, fontSize: "14px" }}>
            🤖 AI Совет
          </p>
          <p style={{ color: "#6ee7b7", fontSize: "13px", marginTop: "2px" }}>
            Ты тратишь {categories.find(c => c.name === "Еда")?.percentage || 0}% бюджета на еду. 
            Попробуй готовить дома — сэкономишь до <span style={{ fontWeight: 700 }}>2 000 сом</span> в месяц!
          </p>
        </div>
      </motion.div>
    </div>
  );
}

