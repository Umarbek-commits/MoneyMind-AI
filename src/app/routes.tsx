import { createBrowserRouter, Navigate, Outlet, useLocation } from "react-router";
import { BottomNav } from "./components/BottomNav";
import Dashboard from "./pages/Dashboard";
import AddExpense from "./pages/AddExpense";
import AIChat from "./pages/AIChat";
import Achievements from "./pages/Achievements";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Welcome from "./pages/Welcome";
import { useUser } from "./context/UserContext";

const NO_NAV_PATHS = ["/add", "/chat"];

function Root() {
  const location = useLocation();
  const showNav = !NO_NAV_PATHS.includes(location.pathname);

  return (
    <div
  style={{
    background: "#080814",
    minHeight: "100dvh",
    position: "relative",
    width: "100%",          // ✅ вместо maxWidth
  }}
>
      {/* Subtle purple top glow */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: "100%",
          height: "100dvh",
          background:
            "radial-gradient(ellipse 70% 35% at 50% 0%, rgba(124,58,237,0.14) 0%, transparent 65%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div style={{ position: "relative", zIndex: 1, minHeight: "100dvh" }}>
        <Outlet />
      </div>
      {showNav && <BottomNav />}
    </div>
  );
}

/** Защищает дочерние маршруты: редиректит на /login, если нет авторизации */
function ProtectedRoute() {
  const { user } = useUser();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

/** Если уже авторизован — не пускает на login/register */
function GuestRoute() {
  const { user } = useUser();
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}

export const router = createBrowserRouter([
  // Auth pages — вне Root (без фоновых декораций)
  {
    Component: GuestRoute,
    children: [
      { path: "/login", Component: Login },
      { path: "/register", Component: Register },
    ],
  },
  { path: "/welcome", Component: Welcome },

  // Main app
  {
    path: "/",
    Component: Root,
    children: [
      {
        Component: ProtectedRoute,
        children: [
          { index: true, Component: Dashboard },
          { path: "add", Component: AddExpense },
          { path: "chat", Component: AIChat },
          { path: "analytics", Component: Analytics },
          { path: "achievements", Component: Achievements },
          { path: "profile", Component: Profile },
        ],
      },
    ],
  },
]);
