export interface User {
  id: number;
  name: string;
  email: string;
  balance: number;
  level: number;
}

export interface Transaction {
  id: number;
  title: string;
  amount: number;
  category: string;
  category_emoji: string;
  date: string;
  time: string;
}

export interface Prediction {
  days_left: number;
  message: string;
}

export interface Analytics {
  total_balance: number;
  transaction_count: number;
  top_categories: string[];
}