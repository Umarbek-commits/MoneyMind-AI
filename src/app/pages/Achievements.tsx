import { motion } from "motion/react";
import { Shield, Flame, AlertTriangle, Star, Target, TrendingUp } from "lucide-react";
import { useDashboard } from "../../hooks/useDashboard";
import "../../styles/Achievements.css";

const LEVEL_MAX = 100;

const STATUS_CONFIG = {
  success: {
    bg: "rgba(16, 185, 129, 0.12)",
    border: "rgba(16, 185, 129, 0.35)",
    iconBg: "rgba(16, 185, 129, 0.2)",
    iconColor: "#10b981",
    labelColor: "#6ee7b7",
  },
  warning: {
    bg: "rgba(239, 68, 68, 0.1)",
    border: "rgba(239, 68, 68, 0.35)",
    iconBg: "rgba(239, 68, 68, 0.2)",
    iconColor: "#ef4444",
    labelColor: "#fca5a5",
  },
  locked: {
    bg: "rgba(255,255,255,0.03)",
    border: "rgba(255,255,255,0.07)",
    iconBg: "rgba(255,255,255,0.08)",
    iconColor: "#4b5563",
    labelColor: "#374151",
  },
};

export default function Achievements() {
  const { user, transactions } = useDashboard();

  // Уровень на основе баланса
  const LEVEL = Math.min(Math.floor((user?.balance ?? 0) / 1000), 100);
  const balance = user?.balance ?? 0;

  // Сегодняшняя дата в ISO формате
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySpentCount = transactions.filter(tx => tx.date === todayStr).length;
  const todaySpent = transactions
    .filter(tx => tx.date === todayStr)
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  // Статистика
  const stats = [
    {
      label: "Трат сегодня",
      value: todaySpentCount.toString(),
      color: "#f59e0b",
    },
    {
      label: "Всего трат",
      value: transactions.length.toString(),
      color: "#7c3aed",
    },
    {
      label: "Потрачено",
      value: totalSpent.toLocaleString() + " с",
      color: "#ef4444",
    },
    {
      label: "Баланс",
      value: balance.toLocaleString() + " с",
      color: "#10b981",
    },
  ];

  // --- Реальные условия для достижений ---
  // 1. Риск: если сегодня потрачено более 30% баланса (банковская логика)
  const isHighRisk = todaySpent > balance * 0.3;
  const riskStatus = isHighRisk ? "warning" : "success";
  const riskXp = isHighRisk ? "−10 XP" : "+5 XP";
  const riskUnlocked = true;

  // 2. Контроль расходов: 3 дня без трат
  const getLastNDays = (n: number) => {
    const days = [];
    for (let i = 0; i < n; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  };
  const last3Days = getLastNDays(3);
  const noSpend3Days = last3Days.every(day =>
    !transactions.some(tx => tx.date === day)
  );
  const controlStatus = noSpend3Days ? "success" : "locked";
  const controlUnlocked = noSpend3Days;

  // 3. Экономист: сэкономил 1 000 сом (баланс >= 1000)
  const isSaving = balance >= 1000;
  const economistStatus = isSaving ? "success" : "locked";
  const economistUnlocked = isSaving;

  // 4. Инвестор: сэкономил 10 000 сом
  const isInvestor = balance >= 10000;
  const investorStatus = isInvestor ? "success" : "locked";
  const investorUnlocked = isInvestor;
  const investorProgress = Math.min(balance, 10000);
  const investorTotal = 10000;

  // Достижения (полностью динамические)
  const achievements = [
    {
      id: "1",
      icon: <Shield size={24} />,
      title: "Контроль расходов",
      desc: "3 дня без лишних трат",
      status: controlStatus,
      unlocked: controlUnlocked,
      xp: "+15 XP",
    },
    {
      id: "2",
      icon: <Flame size={24} />,
      title: "Экономист",
      desc: "Сэкономил 1 000 сом",
      status: economistStatus,
      unlocked: economistUnlocked,
      xp: "+20 XP",
    },
    {
      id: "3",
      icon: <Star size={24} />,
      title: "Первая трата",
      desc: "Добавил первую транзакцию",
      status: transactions.length > 0 ? "success" : "locked",
      unlocked: transactions.length > 0,
      xp: "+5 XP",
    },
    {
      id: "4",
      icon: <AlertTriangle size={24} />,
      title: "Риск",
      desc: "Траты слишком быстрые",
      status: riskStatus,
      unlocked: riskUnlocked,
      xp: riskXp,
    },
    {
      id: "5",
      icon: <Target size={24} />,
      title: "Активный",
      desc: "Сделал 5 трат",
      status: transactions.length >= 5 ? "success" : "locked",
      unlocked: transactions.length >= 5,
      xp: "+10 XP",
      progress: Math.min(transactions.length, 5),
      total: 5,
    },
    {
      id: "6",
      icon: <TrendingUp size={24} />,
      title: "Инвестор",
      desc: "Сэкономь 10 000 сом",
      status: investorStatus,
      unlocked: investorUnlocked,
      xp: "+50 XP",
      progress: investorProgress,
      total: investorTotal,
    },
  ];

  return (
    <div className="achievements-container">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="achievements-header"
      >
        <h1>Твои достижения 🏆</h1>
        <p>Зарабатывай XP и повышай уровень</p>
      </motion.div>

      {/* Level Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="level-card"
      >
        <div className="level-card-content">
          <div>
            <p className="level-label">Финансовый уровень</p>
            <div className="level-value">
              <span className="level-number">{LEVEL}</span>
              <span className="level-max">/ {LEVEL_MAX}</span>
            </div>
          </div>
          <div className="level-icon">
            <span>💎</span>
          </div>
        </div>
        <div className="level-progress">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${LEVEL}%` }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            className="level-progress-bar"
          />
        </div>
        <p className="level-next">
          ещё <span className="level-next-xp">{LEVEL_MAX - LEVEL} XP</span> до уровня{" "}
          <span className="level-next-rank">Diamond</span> 💎
        </p>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="stats-grid"
      >
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.07 }}
            className="stat-card"
          >
            <p className="stat-value" style={{ color: s.color }}>{s.value}</p>
            <p className="stat-label">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Achievements */}
      <div>
        <h3 className="achievements-subtitle">ДОСТИЖЕНИЯ</h3>
        <div className="achievements-list">
          {achievements.map((ach, i) => {
            const cfg = STATUS_CONFIG[ach.status as keyof typeof STATUS_CONFIG];
            return (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className={`achievement-item ${ach.status === "locked" ? "locked" : ""}`}
                style={{
                  background: cfg.bg,
                  borderColor: cfg.border,
                }}
              >
                <div
                  className="achievement-icon"
                  style={{
                    background: cfg.iconBg,
                    color: cfg.iconColor,
                  }}
                >
                  {ach.icon}
                </div>
                <div className="achievement-info">
                  <div className="achievement-title-wrap">
                    <p className="achievement-title">
                      {ach.status === "locked" && "🔒 "}
                      {ach.title}
                    </p>
                    <span
                      className="achievement-xp"
                      style={{
                        background: ach.status === "locked" ? "transparent" : "rgba(255,255,255,0.07)",
                        color: cfg.labelColor,
                        borderColor: ach.status !== "locked" ? cfg.border : "none",
                      }}
                    >
                      {ach.xp}
                    </span>
                  </div>
                  <p className="achievement-desc">{ach.desc}</p>
                  {ach.status === "locked" && ach.progress !== undefined && ach.total && (
                    <div className="achievement-progress">
                      <div className="progress-bar-bg">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(ach.progress / ach.total) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.4 + i * 0.08 }}
                          className="progress-bar-fill"
                        />
                      </div>
                      <p className="progress-text">
                        {ach.total === 10000
                          ? `${ach.progress.toLocaleString()} / ${ach.total.toLocaleString()} сом`
                          : `${ach.progress} / ${ach.total} дней`}
                      </p>
                    </div>
                  )}
                </div>
                {ach.unlocked && ach.status === "success" && (
                  <div className="achievement-check">✓</div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}