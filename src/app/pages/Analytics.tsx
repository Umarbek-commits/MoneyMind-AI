import { motion } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { useEffect, useState } from "react";
import { getTransactions } from "../../api/api";

const COLORS = ["#7c3aed", "#3b82f6", "#8b5cf6", "#06b6d4", "#10b981"];

const AI_TIPS = [
  {
    icon: "🍔",
    color: "#ef4444",
    title: "Слишком много фастфуда",
    desc: "Ты тратишь 4 000 сом/нед на еду. Готовь дома 3 дня — сэкономишь 1 200 сом.",
    type: "warning",
  },
  {
    icon: "🚕",
    color: "#f59e0b",
    title: "Оптимизируй транспорт",
    desc: "Замени утреннее такси на автобус — 300 сом в день = 9 000 сом в месяц.",
    type: "warning",
  },
  {
    icon: "✅",
    color: "#10b981",
    title: "Игры под контролем",
    desc: "Хорошо! Расходы на игры снизились на 20% по сравнению с прошлой неделей.",
    type: "success",
  },
];

interface Transaction {
  id: number;
  title: string;
  amount: number;
  category: string;
  category_emoji: string;
  date: string;
  time: string;
}

interface Category {
  name: string;
  emoji: string;
  amount: number;
  percentage: number;
}

interface WeeklyData {
  day: string;
  amount: number;
}

export default function Analytics() {
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);

  useEffect(() => {
    getTransactions().then((data) => {
      setTransactions(data);

      // 📊 категории
      const catMap: any = {};

      data.forEach((t: Transaction) => {
        if (!catMap[t.category]) {
          catMap[t.category] = {
            name: t.category,
            emoji: t.category_emoji,
            amount: 0,
          };
        }
        catMap[t.category].amount += t.amount;
      });

      const catArray = Object.values(catMap) as Category[];
      const total = catArray.reduce((s: number, c: Category) => s + c.amount, 0);

      setCategories(
        catArray.map((c: Category) => ({
          ...c,
          percentage: total ? (c.amount / total) * 100 : 0,
        }))
      );

      // 📈 по дням
      const dayMap: any = {};

      data.forEach((t: Transaction) => {
        dayMap[t.date] = (dayMap[t.date] || 0) + t.amount;
      });

      setWeeklyData(
        Object.entries(dayMap).map(([day, amount]) => ({
          day: day.slice(0, 6), // сокращаем для отображения
          amount: amount as number,
        }))
      );
    });
  }, []);

  const monthlyData = categories.map((c) => ({
    ...c,
    amount: Math.round(c.amount * 4.2),
    percentage: c.percentage,
  }));

  const displayData = period === "week" ? categories : monthlyData;
  const totalSpent = displayData.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="pb-28 px-4 pt-6 space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 style={{ color: "white", fontSize: "22px", fontWeight: 700 }}>
          Аналитика 📊
        </h1>
        <p style={{ color: "#6b7280", fontSize: "13px" }}>
          Полная картина твоих расходов
        </p>
      </motion.div>

      {/* Period Switcher */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex rounded-xl overflow-hidden"
        style={{ background: "rgba(18,18,40,0.9)", border: "1px solid rgba(124,58,237,0.2)" }}
      >
        {(["week", "month"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className="flex-1 py-2.5 transition-all"
            style={{
              background: period === p ? "rgba(124,58,237,0.3)" : "transparent",
              color: period === p ? "#a78bfa" : "#6b7280",
              fontSize: "14px",
              fontWeight: period === p ? 600 : 400,
              borderRadius: period === p ? "10px" : "0",
            }}
          >
            {p === "week" ? "📅 За неделю" : "🗓️ За месяц"}
          </button>
        ))}
      </motion.div>

      {/* Bar Chart */}
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
        <h3 style={{ color: "white", fontWeight: 600, fontSize: "15px", marginBottom: "12px" }}>
          По дням недели
        </h3>
        {weeklyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyData} barSize={24}>
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
                formatter={(val: number) => [`${val} сом`, ""]}
                cursor={{ fill: "rgba(124,58,237,0.1)" }}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {weeklyData.map((entry, i) => (
                  <Cell
                    key={`bar-cell-${entry.day}`}
                    fill={
                      entry.amount === Math.max(...weeklyData.map((d) => d.amount))
                        ? "#ef4444"
                        : i % 2 === 0
                        ? "#7c3aed"
                        : "#3b82f6"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ color: "#6b7280", textAlign: "center", padding: "40px" }}>
            Нет данных о расходах
          </p>
        )}
      </motion.div>

      {/* Category List */}
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
        <h3 style={{ color: "white", fontWeight: 600, fontSize: "15px", marginBottom: "12px" }}>
          По категориям
        </h3>

        {displayData.length > 0 ? (
          <>
            <div className="flex gap-4 items-center">
              {/* Pie */}
              <div className="flex-shrink-0">
                <PieChart width={100} height={100}>
                  <Pie
                    data={displayData}
                    cx={50}
                    cy={50}
                    innerRadius={28}
                    outerRadius={46}
                    dataKey="percentage"
                    strokeWidth={0}
                  >
                    {displayData.map((cat, i) => (
                      <Cell key={`pie-cell-${cat.name}`} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </div>

              {/* List */}
              <div className="flex-1 space-y-2">
                {displayData.map((cat, i) => (
                  <motion.div
                    key={`legend-${cat.name}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.07 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: COLORS[i % COLORS.length] }}
                      />
                      <span style={{ color: "#d1d5db", fontSize: "13px" }}>
                        {cat.emoji} {cat.name}
                      </span>
                    </div>
                    <span style={{ color: "#9ca3af", fontSize: "12px" }}>
                      {cat.amount.toLocaleString()} с
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div
              className="mt-3 pt-3 flex items-center justify-between"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span style={{ color: "#6b7280", fontSize: "13px" }}>Всего потрачено:</span>
              <span style={{ color: "#ef4444", fontSize: "16px", fontWeight: 700 }}>
                {totalSpent.toLocaleString()} сом
              </span>
            </div>
          </>
        ) : (
          <p style={{ color: "#6b7280", textAlign: "center", padding: "40px" }}>
            Нет данных о категориях
          </p>
        )}
      </motion.div>

      {/* AI Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3
          style={{ color: "#9ca3af", fontSize: "13px", marginBottom: "10px" }}
        >
          🤖 AI СОВЕТЫ
        </h3>
        <div className="space-y-3">
          {AI_TIPS.map((tip, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.1 }}
              className="rounded-xl p-3 flex items-start gap-3"
              style={{
                background:
                  tip.type === "warning"
                    ? "rgba(239, 68, 68, 0.07)"
                    : "rgba(16, 185, 129, 0.07)",
                border: `1px solid ${
                  tip.type === "warning"
                    ? "rgba(239,68,68,0.25)"
                    : "rgba(16,185,129,0.25)"
                }`,
              }}
            >
              <span style={{ fontSize: "20px" }}>{tip.icon}</span>
              <div>
                <p
                  style={{
                    color: tip.type === "warning" ? "#fca5a5" : "#6ee7b7",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  {tip.title}
                </p>
                <p style={{ color: "#9ca3af", fontSize: "12px", marginTop: "2px" }}>
                  {tip.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* All Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl p-4"
        style={{
          background: "rgba(18, 18, 40, 0.9)",
          border: "1px solid rgba(124, 58, 237, 0.2)",
        }}
      >
        <h3 style={{ color: "white", fontWeight: 600, fontSize: "15px", marginBottom: "10px" }}>
          Все транзакции
        </h3>
        {transactions.length > 0 ? (
          <div className="space-y-2">
            {transactions.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 + i * 0.05 }}
                className="flex items-center justify-between py-2 px-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(124,58,237,0.12)" }}
                  >
                    <span style={{ fontSize: "16px" }}>{tx.category_emoji}</span>
                  </div>
                  <div>
                    <p style={{ color: "#e5e7eb", fontSize: "13px" }}>{tx.title}</p>
                    <p style={{ color: "#6b7280", fontSize: "10px" }}>
                      {tx.date} · {tx.category}
                    </p>
                  </div>
                </div>
                <span
                  style={{
                    color: "#ef4444",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  {tx.amount.toLocaleString()} с
                </span>
              </motion.div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#6b7280", textAlign: "center", padding: "40px" }}>
            Нет транзакций
          </p>
        )}
      </motion.div>
    </div>
  );
}