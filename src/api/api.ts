/// <reference types="vite/client" />
import { User, Transaction, Prediction, Analytics } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("financeai_token");

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API error");
  }

  return res.json();
}

// 🔐 AUTH
export const login = (email: string, password: string): Promise<{ token: string }> =>
  request<{ token: string }>(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

export const register = (
  name: string,
  email: string,
  password: string,
  balance?: number,
  age?: number
): Promise<{ token: string }> =>
  request<{ token: string }>(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, balance, age }),
  });

// 👤 USER
export const getUser = (): Promise<User> =>
  request<User>(`${BASE_URL}/user`);

export const updateBalanceAPI = (balance: number): Promise<{ success: boolean; balance: number }> =>
  request<{ success: boolean; balance: number }>(`${BASE_URL}/user/balance`, {
    method: "PUT",
    body: JSON.stringify({ balance }),
  });

// 💸 TRANSACTIONS
export const getTransactions = (): Promise<Transaction[]> =>
  request<Transaction[]>(`${BASE_URL}/transactions`);

export const addTransaction = (data: {
  title: string;
  amount: number;
  category?: string;
  category_emoji?: string;
  date?: string;
  time?: string;
}): Promise<Transaction> =>
  request<Transaction>(`${BASE_URL}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

// 📊 ANALYTICS
export const getAnalytics = (): Promise<Analytics> =>
  request<Analytics>(`${BASE_URL}/analytics`);

// 🤖 AI
export const getPrediction = (): Promise<Prediction> =>
  request<Prediction>(`${BASE_URL}/prediction`);

export const aiChat = (message: string): Promise<{ reply: string }> =>
  request<{ reply: string }>(`${BASE_URL}/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

// 🧠 AI ADVICE
export const getAIAdvice = async (): Promise<{ advice: string }> => {
  const res = await fetch(`${BASE_URL}/ai/advice`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("financeai_token") || ""}`,
    },
  });

  if (!res.ok) throw new Error("AI error");

  return res.json();
};

export async function sendAIMessage(message: string) {
  const res = await fetch("http://127.0.0.1:8000/api/ai/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  return res.json();
}