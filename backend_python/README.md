# MoneyMind Python Backend

Этот бэкенд реализован на FastAPI и использует SQLite для хранения данных и логов.

## Установка

```bash
cd backend_python
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

## Запуск

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 4000
```

## Хранилище

- `moneymind.db` — файл SQLite, в котором сохраняются:
  - `users`
  - `transactions`
  - `logs`

## Эндпоинты

- `GET /api/status` — статус сервера
- `GET /api/user` — данные пользователя
- `GET /api/transactions` — список транзакций
- `POST /api/transactions` — добавить транзакцию
- `GET /api/analytics` — аналитика по транзакциям
- `GET /api/logs` — последние 100 логов запросов
