export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  categoryEmoji: string;
  date: string;
  time: string;
}

export interface Category {
  name: string;
  emoji: string;
  amount: number;
  percentage: number;
  color: string;
}

export const transactions: Transaction[] = [
  { id: '1', title: 'Бургер King', amount: -500, category: 'Еда', categoryEmoji: '🍔', date: 'Сегодня', time: '14:30' },
  { id: '2', title: 'Яндекс.Такси', amount: -200, category: 'Транспорт', categoryEmoji: '🚕', date: 'Сегодня', time: '09:15' },
  { id: '3', title: 'Steam игры', amount: -1200, category: 'Игры', categoryEmoji: '🎮', date: 'Вчера', time: '22:00' },
  { id: '4', title: 'Маршрутка', amount: -50, category: 'Транспорт', categoryEmoji: '🚌', date: 'Вчера', time: '08:00' },
  { id: '5', title: 'KFC', amount: -450, category: 'Еда', categoryEmoji: '🍗', date: '09 апр', time: '13:45' },
  { id: '6', title: 'Кинотеатр', amount: -600, category: 'Развлечения', categoryEmoji: '🎬', date: '08 апр', time: '19:00' },
  { id: '7', title: 'Супермаркет', amount: -1800, category: 'Продукты', categoryEmoji: '🛒', date: '07 апр', time: '17:20' },
];

export const categories: Category[] = [
  { name: 'Еда', emoji: '🍔', amount: 4000, percentage: 40, color: '#7c3aed' },
  { name: 'Транспорт', emoji: '🚕', amount: 2000, percentage: 20, color: '#3b82f6' },
  { name: 'Игры', emoji: '🎮', amount: 1200, percentage: 12, color: '#8b5cf6' },
  { name: 'Развлечения', emoji: '🎬', amount: 1000, percentage: 10, color: '#06b6d4' },
  { name: 'Продукты', emoji: '🛒', amount: 1800, percentage: 18, color: '#10b981' },
];

export const weeklyData = [
  { day: 'Пн', amount: 1200 },
  { day: 'Вт', amount: 450 },
  { day: 'Ср', amount: 2200 },
  { day: 'Чт', amount: 800 },
  { day: 'Пт', amount: 1500 },
  { day: 'Сб', amount: 3200 },
  { day: 'Вс', amount: 650 },
];

export const AI_CATEGORIES: { [key: string]: { name: string; emoji: string } } = {
  бургер: { name: 'Еда', emoji: '🍔' },
  пицца: { name: 'Еда', emoji: '🍕' },
  кофе: { name: 'Еда', emoji: '☕' },
  еда: { name: 'Еда', emoji: '🍔' },
  ресторан: { name: 'Еда', emoji: '🍽️' },
  cafe: { name: 'Еда', emoji: '☕' },
  такси: { name: 'Транспорт', emoji: '🚕' },
  маршрутка: { name: 'Транспорт', emoji: '🚌' },
  автобус: { name: 'Транспорт', emoji: '🚌' },
  метро: { name: 'Транспорт', emoji: '🚇' },
  транспорт: { name: 'Транспорт', emoji: '🚕' },
  игра: { name: 'Игры', emoji: '🎮' },
  игры: { name: 'Игры', emoji: '🎮' },
  steam: { name: 'Игры', emoji: '🎮' },
  playstation: { name: 'Игры', emoji: '🎮' },
  кино: { name: 'Развлечения', emoji: '🎬' },
  кинотеатр: { name: 'Развлечения', emoji: '🎬' },
  концерт: { name: 'Развлечения', emoji: '🎵' },
  одежда: { name: 'Одежда', emoji: '👕' },
  кроссовки: { name: 'Одежда', emoji: '👟' },
  наушники: { name: 'Техника', emoji: '🎧' },
  телефон: { name: 'Техника', emoji: '📱' },
  ноутбук: { name: 'Техника', emoji: '💻' },
  продукты: { name: 'Продукты', emoji: '🛒' },
  магазин: { name: 'Продукты', emoji: '🛒' },
};

export function detectCategory(text: string): { name: string; emoji: string } {
  const lower = text.toLowerCase();
  for (const key of Object.keys(AI_CATEGORIES)) {
    if (lower.includes(key)) {
      return AI_CATEGORIES[key];
    }
  }
  return { name: 'Другое', emoji: '💸' };
}
