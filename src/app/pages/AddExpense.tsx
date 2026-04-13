import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Check, Loader2, Sparkles } from "lucide-react";
import { addTransaction } from "../../api/api";
import { useUser } from "../context/UserContext";

const CATEGORIES = [
  { name: "Еда", emoji: "🍔" },
  { name: "Транспорт", emoji: "🚕" },
  { name: "Игры", emoji: "🎮" },
  { name: "Развлечения", emoji: "🎬" },
  { name: "Продукты", emoji: "🛒" },
  { name: "Одежда", emoji: "👕" },
  { name: "Техника", emoji: "💻" },
  { name: "Другое", emoji: "💸" },
];

// AI‑определение категории через бэкенд
const detectCategoryAI = async (text: string): Promise<{ name: string; emoji: string }> => {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/ai/category", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: text }),
    });

    const data = await res.json();
    const found = CATEGORIES.find(c => c.name === data.category);
    return found || { name: "Другое", emoji: "💸" };
  } catch (e) {
    console.error("AI ошибка", e);
    return { name: "Другое", emoji: "💸" };
  }
};

export default function AddExpense() {
  const navigate = useNavigate();
  const { refresh } = useUser();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCat, setSelectedCat] = useState<{ name: string; emoji: string } | null>(null);
  const [aiCategory, setAiCategory] = useState<{ name: string; emoji: string } | null>(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [saved, setSaved] = useState(false);
  const [date, setDate] = useState("Сегодня");
  const [error, setError] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (description.length < 2) {
      setAiCategory(null);
      setAiDone(false);
      return;
    }
    setAiThinking(true);
    setAiDone(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const cat = await detectCategoryAI(description);
      setAiCategory(cat);
      setSelectedCat(cat);
      setAiThinking(false);
      setAiDone(true);
    }, 500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [description]);

  const handleSave = async () => {
    if (!description || !amount) return;
    setError("");

    const now = new Date();
    const formattedDate = now.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).replace(" г.", "");
    const formattedTime = now.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit"
    });

    try {
      await addTransaction({
        title: description,
        amount: parseInt(amount),
        category: selectedCat?.name || "Другое",
        category_emoji: selectedCat?.emoji || "💸",
        date: formattedDate,
        time: formattedTime,
      });

      refresh();
      setSaved(true);
      setTimeout(() => navigate("/"), 1500);
    } catch (err: any) {
      console.error("Ошибка при сохранении:", err);
      if (err.message?.includes("Недостаточно средств")) {
        setError("❌ Недостаточно средств на балансе");
      } else {
        setError("Ошибка при сохранении. Попробуй ещё раз");
      }
    }
  };

  return (
    <div className="pb-28 px-4 pt-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <button
          onClick={() => navigate("/")}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.07)", color: "#d1d5db" }}
        >
          <ArrowLeft size={18} />
        </button>
        <h1 style={{ color: "white", fontSize: "20px", fontWeight: 700 }}>
          ➕ Добавить трату
        </h1>
      </motion.div>

      <div className="space-y-4">
        {/* Описание */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-4"
          style={{
            background: "rgba(18, 18, 40, 0.9)",
            border: "1px solid rgba(124, 58, 237, 0.2)",
          }}
        >
          <label style={{ color: "#9ca3af", fontSize: "12px" }}>Описание</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Бургер, такси, кино..."
            className="w-full bg-transparent outline-none mt-1"
            style={{
              color: "white",
              fontSize: "16px",
              borderBottom: "1px solid rgba(124, 58, 237, 0.3)",
              paddingBottom: "8px",
            }}
          />
        </motion.div>

        {/* AI категория */}
        <AnimatePresence>
          {(aiThinking || aiDone) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-xl p-3 flex items-center gap-3"
              style={{
                background: aiDone
                  ? "rgba(16, 185, 129, 0.1)"
                  : "rgba(124, 58, 237, 0.1)",
                border: `1px solid ${aiDone ? "rgba(16,185,129,0.4)" : "rgba(124,58,237,0.4)"}`,
              }}
            >
              {aiThinking ? (
                <>
                  <Loader2 size={16} className="animate-spin" style={{ color: "#a78bfa" }} />
                  <span style={{ color: "#a78bfa", fontSize: "13px" }}>🤖 AI думает...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} style={{ color: "#10b981" }} />
                  <span style={{ color: "#6ee7b7", fontSize: "13px" }}>
                    AI определил:{" "}
                    <span style={{ fontWeight: 700 }}>
                      {aiCategory?.name} {aiCategory?.emoji}
                    </span>
                  </span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Сумма */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl p-4"
          style={{
            background: "rgba(18, 18, 40, 0.9)",
            border: "1px solid rgba(124, 58, 237, 0.2)",
          }}
        >
          <label style={{ color: "#9ca3af", fontSize: "12px" }}>Сумма (сом)</label>
          <div className="flex items-center gap-2 mt-1">
            <span style={{ color: "#7c3aed", fontSize: "24px", fontWeight: 700 }}>−</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="flex-1 bg-transparent outline-none"
              style={{
                color: "#ef4444",
                fontSize: "28px",
                fontWeight: 800,
                borderBottom: "1px solid rgba(124, 58, 237, 0.3)",
                paddingBottom: "4px",
              }}
            />
            <span style={{ color: "#6b7280", fontSize: "16px" }}>сом</span>
          </div>
        </motion.div>

        {/* Категории */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-4"
          style={{
            background: "rgba(18, 18, 40, 0.9)",
            border: "1px solid rgba(124, 58, 237, 0.2)",
          }}
        >
          <label style={{ color: "#9ca3af", fontSize: "12px", marginBottom: "10px", display: "block" }}>
            Категория
          </label>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCat?.name === cat.name;
              return (
                <motion.button
                  key={cat.name}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setSelectedCat(cat)}
                  className="flex flex-col items-center gap-1 py-2 rounded-xl transition-all"
                  style={{
                    background: isActive
                      ? "rgba(124, 58, 237, 0.3)"
                      : "rgba(255,255,255,0.05)",
                    border: isActive
                      ? "1px solid rgba(124,58,237,0.6)"
                      : "1px solid transparent",
                  }}
                >
                  <span style={{ fontSize: "22px" }}>{cat.emoji}</span>
                  <span style={{ color: isActive ? "#a78bfa" : "#6b7280", fontSize: "10px" }}>
                    {cat.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Дата */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl p-4 flex items-center justify-between"
          style={{
            background: "rgba(18, 18, 40, 0.9)",
            border: "1px solid rgba(124, 58, 237, 0.2)",
          }}
        >
          <div>
            <p style={{ color: "#9ca3af", fontSize: "12px" }}>Дата</p>
            <p style={{ color: "white", fontSize: "15px", marginTop: "2px" }}>📅 {date}</p>
          </div>
          <div className="flex gap-2">
            {["Сегодня", "Вчера"].map((d) => (
              <button
                key={d}
                onClick={() => setDate(d)}
                className="px-3 py-1 rounded-lg"
                style={{
                  background: date === d ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.06)",
                  color: date === d ? "#a78bfa" : "#6b7280",
                  fontSize: "12px",
                  border: date === d ? "1px solid rgba(124,58,237,0.5)" : "1px solid transparent",
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Ошибка */}
        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#fca5a5",
              padding: "10px",
              borderRadius: "12px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {/* Кнопка сохранения */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={!description || !amount}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
          style={{
            background:
              description && amount
                ? "linear-gradient(135deg, #7c3aed, #3b82f6)"
                : "rgba(255,255,255,0.06)",
            color: description && amount ? "white" : "#4b5563",
            fontSize: "16px",
            fontWeight: 700,
            boxShadow:
              description && amount
                ? "0 4px 20px rgba(124, 58, 237, 0.4)"
                : "none",
          }}
        >
          
          <AnimatePresence mode="wait">
            {saved ? (
              <motion.div
                key="saved"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2"
              >
                <Check size={20} />
                <span>Сохранено!</span>
              </motion.div>
            ) : (
              <motion.span key="save">➕ Сохранить</motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}