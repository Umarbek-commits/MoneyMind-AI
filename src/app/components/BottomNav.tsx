import { useNavigate, useLocation } from "react-router";
import { Home, MessageCircle, BarChart2, Plus, UserCircle2 } from "lucide-react";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50">
      <div
        className="mx-3 mb-3 rounded-2xl flex items-center justify-around px-2 py-2"
        style={{
          background: "rgba(15, 15, 30, 0.95)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(124, 58, 237, 0.3)",
          boxShadow: "0 -4px 30px rgba(124, 58, 237, 0.15)",
        }}
      >
        <NavBtn
          icon={<Home size={22} />}
          label="Главная"
          active={path === "/"}
          onClick={() => navigate("/")}
        />
        <NavBtn
          icon={<BarChart2 size={22} />}
          label="Аналитика"
          active={path === "/analytics"}
          onClick={() => navigate("/analytics")}
        />

        {/* Center FAB */}
        <button
          onClick={() => navigate("/add")}
          className="relative -top-5 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform active:scale-95"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
            boxShadow: "0 4px 20px rgba(124, 58, 237, 0.6)",
          }}
        >
          <Plus size={28} className="text-white" />
        </button>

        <NavBtn
          icon={<MessageCircle size={22} />}
          label="AI Чат"
          active={path === "/chat"}
          onClick={() => navigate("/chat")}
        />
        <NavBtn
          icon={<UserCircle2 size={22} />}
          label="Профиль"
          active={path === "/profile"}
          onClick={() => navigate("/profile")}
        />
      </div>
    </div>
  );
}

function NavBtn({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all"
      style={{ color: active ? "#a78bfa" : "#4b5563" }}
    >
      {icon}
      <span style={{ fontSize: "10px" }}>{label}</span>
    </button>
  );
}
