# MoneyMind Database Schema

## Таблицы

### users
- `id` (PRIMARY KEY)
- `name` (VARCHAR)
- `email` (VARCHAR UNIQUE)
- `password_hash` (VARCHAR)
- `balance` (FLOAT)
- `level` (INTEGER)
- `age` (INTEGER, nullable)
- `created_at` (DATETIME)

### categories
- `id` (PRIMARY KEY)
- `name` (VARCHAR UNIQUE)
- `emoji` (VARCHAR)
- `color` (VARCHAR)
- `description` (VARCHAR, nullable)

### transactions
- `id` (PRIMARY KEY)
- `user_id` (INTEGER)
- `title` (VARCHAR)
- `amount` (FLOAT)
- `category_id` (INTEGER)
- `category_emoji` (VARCHAR)
- `date` (VARCHAR)
- `time` (VARCHAR)
- `created_at` (DATETIME)

### budgets
- `id` (PRIMARY KEY)
- `user_id` (INTEGER)
- `category_id` (INTEGER)
- `limit` (FLOAT)
- `period` (VARCHAR)
- `created_at` (DATETIME)

### achievements
- `id` (PRIMARY KEY)
- `user_id` (INTEGER)
- `title` (VARCHAR)
- `description` (VARCHAR)
- `icon` (VARCHAR)
- `xp_reward` (INTEGER)
- `unlocked_at` (DATETIME)

### spending_limits
- `id` (PRIMARY KEY)
- `user_id` (INTEGER)
- `daily_limit` (FLOAT)
- `weekly_limit` (FLOAT)
- `monthly_limit` (FLOAT)
- `created_at` (DATETIME)

### logs
- `id` (PRIMARY KEY)
- `path` (VARCHAR)
- `method` (VARCHAR)
- `body` (TEXT, nullable)
- `status_code` (INTEGER)
- `created_at` (DATETIME)

## Инициализация

```bash
python seed.py
```

Это создаст:
- 7 категорий расходов
- Demo пользователя (email: demo@money-mind.ai)
- Лимиты траты на день/неделю/месяц
- Бюджеты по категориям
