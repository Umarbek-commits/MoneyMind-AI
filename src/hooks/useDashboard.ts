import { useEffect, useState } from "react";
import { getUser, getTransactions, getPrediction } from "../api/api";
import { User, Transaction, Prediction } from "../types";
import { useUser } from "../app/context/UserContext";

export function useDashboard() {
  const { refreshKey } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [u, t, p] = await Promise.all([
        getUser(),
        getTransactions(),
        getPrediction(),
      ]);

      setUser(u);
      setTransactions(t);
      setPrediction(p);
    } catch (e) {
      console.error("Ошибка загрузки", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [refreshKey]); // ✅ Теперь зависит от refreshKey

  return {
    user,
    transactions,
    prediction,
    loading,
    reload: load,
  };
}