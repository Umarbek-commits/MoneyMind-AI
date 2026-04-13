import { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, register as apiRegister, getUser, updateBalanceAPI } from "../../api/api";

export interface User {
  name: string;
  email: string;
  balance: number;
  level: number;
  age?: number;
}

interface UserContextType {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    balance?: number;
    age?: number;
  }) => Promise<boolean>;
  logout: () => void;
  updateBalance: (balance: number) => Promise<void>;
  refresh: () => void;
  refreshKey: number;
}

const UserContext = createContext<UserContextType | null>(null);
const STORAGE_KEY = "financeai_user";
const TOKEN_KEY = "financeai_token";

function calcLevel(name: string, balance: number): number {
  const nameSeed = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 18;
  const balanceFactor = Math.min(Math.floor(balance / 350), 52);
  return Math.min(balanceFactor + nameSeed + 26, 95);
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });
  
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey(prev => prev + 1);

  // Загрузка пользователя из API при наличии токена
  useEffect(() => {
    if (token) {
      getUser()
        .then(userData => {
          setUser(userData);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        })
        .catch(error => {
          console.error("Error loading user:", error);
          if (error.message.includes("401") || error.message.includes("Unauthorized")) {
            logout();
          }
        });
    }
  }, [refreshKey, token]);

  const saveUser = (u: User | null, t: string | null = null) => {
    setUser(u);
    if (u) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    
    if (t !== undefined) {
      if (t) {
        localStorage.setItem(TOKEN_KEY, t);
        setToken(t);
      } else if (t === null) {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      }
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiLogin(email, password);
      if (response.token) {
        saveUser(null, response.token);
        refresh();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    balance?: number;
    age?: number;
  }): Promise<boolean> => {
    try {
      const response = await apiRegister(
        data.name,
        data.email,
        data.password,
        data.balance,
        data.age
      );
      if (response.token) {
        saveUser(null, response.token);
        refresh();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };

  const logout = () => {
    saveUser(null, null);
  };

  // ✅ ИСПРАВЛЕНО: после обновления баланса — загружаем пользователя заново с сервера
  const updateBalance = async (balance: number): Promise<void> => {
    try {
      await updateBalanceAPI(balance);
      const updatedUser = await getUser();
      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Update balance error:", error);
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{ 
      user,
      token,
      setUser,
      login, 
      register, 
      logout, 
      updateBalance,
      refresh,
      refreshKey
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be inside UserProvider");
  return ctx;
}