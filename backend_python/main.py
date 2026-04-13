import os
import re
import requests
from datetime import datetime, timedelta
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, Field
from sqlalchemy import Column, DateTime, Integer, MetaData, String, Text, create_engine, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Session, relationship
from sqlalchemy.sql import func

from services.ai_service import classify_transaction, predict_days_left

# Загружаем переменные окружения
load_dotenv()

# Проверка наличия ключа Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("⚠️ Gemini ключ не найден, будет использоваться только резервный AI")

# Инициализация Google GenAI (новый SDK) – только если ключ есть
from google.genai import Client
client = Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("❌ DATABASE_URL не найден в .env")

engine = create_engine(DATABASE_URL, future=True)

# 🔐 JWT Settings
SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Упрощённый Base (без лишнего metadata)
class Base(DeclarativeBase):
    pass


class Log(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    path = Column(String(255), nullable=False)
    method = Column(String(10), nullable=False)
    body = Column(Text, nullable=True)
    status_code = Column(Integer, nullable=False)
    # ✅ Исправлено: func.datetime("now") → func.now()
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(200), nullable=False, unique=True)
    password = Column(String(255), nullable=True)
    balance = Column(Integer, nullable=False, default=0)
    level = Column(Integer, nullable=False, default=1)
    age = Column(Integer, nullable=True)
    
    transactions = relationship("Transaction", back_populates="user")
    chat_messages = relationship("ChatMessage", back_populates="user")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    amount = Column(Integer, nullable=False)
    category = Column(String(100), nullable=False)
    category_emoji = Column(String(10), nullable=False)
    date = Column(String(50), nullable=False)
    time = Column(String(50), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    user = relationship("User", back_populates="transactions")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    role = Column(String(10), nullable=False)          # "user" или "ai"
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="chat_messages")


# Создание таблиц
Base.metadata.create_all(bind=engine)

app = FastAPI(title="MoneyMind Python Backend")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 🔐 Password utilities
def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str):
    return pwd_context.verify(password, hashed)

def create_token(data: dict):
    to_encode = data.copy()
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# 📦 Request/Response Schemas
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    age: int

class LoginRequest(BaseModel):
    email: str
    password: str

class TransactionCreate(BaseModel):
    title: str = Field(..., min_length=1)
    amount: int
    category: str = Field(..., min_length=1)
    category_emoji: str = Field(default="💸")
    date: Optional[str] = None
    time: Optional[str] = None

class UpdateBalanceRequest(BaseModel):
    balance: int

class UserOut(BaseModel):
    model_config = {"from_attributes": True}
    name: str
    email: str
    balance: int
    level: int
    age: Optional[int] = None


class TransactionOut(BaseModel):
    model_config = {"from_attributes": True}
    id: int
    title: str
    amount: int
    category: str
    category_emoji: str
    date: str
    time: str


class AnalyticsOut(BaseModel):
    model_config = {"from_attributes": True}
    total_balance: int
    transaction_count: int
    top_categories: List[str]


class LogOut(BaseModel):
    model_config = {"from_attributes": True}
    id: int
    path: str
    method: str
    body: Optional[str] = None
    status_code: int
    created_at: Optional[datetime] = None


class ChatRequest(BaseModel):
    message: str


# ---------- AI fallback через OpenRouter ----------
def ask_openrouter(prompt: str) -> str:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        return "⚠️ OpenRouter ключ не настроен"

    try:
        res = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "meta-llama/llama-3-8b-instruct",
                "messages": [
                    {
                        "role": "system",
                        "content": """
Ты финансовый ассистент банка.

Правила:
- Отвечай ТОЛЬКО на русском
- Коротко и понятно
- Без английского текста
- Без лишних фраз типа "your thought process"
- Давай конкретный совет
- Если вопрос про деньги → оцени риск (низкий/средний/высокий)

Отвечай как банковское приложение (Kaspi / Tinkoff стиль).
"""
                    },
                    {"role": "user", "content": prompt}
                ]
            },
            timeout=10
        )

        data = res.json()

        if "error" in data:
            return f"⚠️ OpenRouter ошибка: {data['error']}"

        if "choices" not in data or not data["choices"]:
            return "⚠️ OpenRouter не ответил"

        return data["choices"][0]["message"]["content"]

    except Exception as e:
        print("OpenRouter error:", e)
        return "⚠️ Ошибка резервного AI"


# Словарь для защиты от спама (ключ – id пользователя)
last_request_time = {}

@app.middleware("http")
async def log_requests(request: Request, call_next):
    body = await request.body()
    response = await call_next(request)
    with Session(engine) as session:
        session.add(
            Log(
                path=request.url.path,
                method=request.method,
                body=body.decode("utf-8") if body else "",
                status_code=response.status_code,
            )
        )
        session.commit()
    return response


# 🔐 AUTH ENDPOINTS
@app.post("/api/auth/register")
def register(data: RegisterRequest):
    with Session(engine) as session:
        existing = session.query(User).filter(User.email == data.email).first()
        if existing:
            raise HTTPException(400, "User already exists")

        user = User(
            name=data.name,
            email=data.email,
            password=hash_password(data.password),
            balance=0,
            level=1,
            age=data.age,
        )

        session.add(user)
        session.commit()
        session.refresh(user)

        token = create_token({"user_id": user.id})

        return {"token": token, "user": {"name": user.name, "email": user.email, "balance": user.balance, "level": user.level, "age": user.age}}


@app.post("/api/auth/login")
def login(data: LoginRequest):
    with Session(engine) as session:
        user = session.query(User).filter(User.email == data.email).first()

        if not user or not verify_password(data.password, user.password):
            raise HTTPException(401, "Invalid credentials")

        token = create_token({"user_id": user.id})

        return {"token": token, "user": {"name": user.name, "email": user.email, "balance": user.balance, "level": user.level, "age": user.age}}


@app.get("/api/status")
def status():
    return {"status": "ok", "server_time": datetime.utcnow().isoformat()}


@app.get("/api/user", response_model=UserOut)
def get_user():
    with Session(engine) as session:
        user = session.query(User).first()
        if not user:
            user = User(name="New User", email="user@money-mind.ai", balance=0, level=1)
            session.add(user)
            session.commit()
            session.refresh(user)
        return user


@app.put("/api/user/balance")
def update_balance(data: UpdateBalanceRequest):
    with Session(engine) as session:
        user = session.query(User).first()
        if not user:
            raise HTTPException(404, "User not found")
        user.balance = data.balance
        session.commit()
        return {"success": True, "balance": user.balance}


@app.get("/api/transactions", response_model=List[TransactionOut])
def get_transactions():
    with Session(engine) as session:
        user = session.query(User).first()
        if not user:
            return []
        return session.query(Transaction).filter(Transaction.user_id == user.id).order_by(Transaction.id.desc()).all()


@app.post("/api/transactions", response_model=TransactionOut, status_code=201)
def add_transaction(payload: TransactionCreate):
    with Session(engine) as session:
        user = session.query(User).first()
        if not user:
            raise HTTPException(404, "User not found")

        if payload.amount > user.balance:
            raise HTTPException(400, "Недостаточно средств")

        now = datetime.now()
        date = payload.date or now.strftime("%Y-%m-%d")
        time = payload.time or now.strftime("%H:%M")

        category = classify_transaction(payload.title)

        transaction = Transaction(
            title=payload.title,
            amount=payload.amount,
            category=category,
            category_emoji=payload.category_emoji,
            date=date,
            time=time,
            user_id=user.id
        )

        user.balance -= payload.amount

        session.add(transaction)
        session.commit()
        session.refresh(transaction)
        
        return transaction


@app.get("/api/analytics", response_model=AnalyticsOut)
def analytics():
    with Session(engine) as session:
        user = session.query(User).first()
        if not user:
            return AnalyticsOut(total_balance=0, transaction_count=0, top_categories=[])
        
        transactions = session.query(Transaction).filter(Transaction.user_id == user.id).all()
        total_balance = user.balance
        categories = {}
        for tx in transactions:
            categories[tx.category] = categories.get(tx.category, 0) + tx.amount
        sorted_categories = sorted(categories.items(), key=lambda x: abs(x[1]), reverse=True)
        top_categories = [f"{name}: {amount}" for name, amount in sorted_categories[:5]]
        return AnalyticsOut(
            total_balance=total_balance,
            transaction_count=len(transactions),
            top_categories=top_categories,
        )


@app.get("/api/prediction")
def prediction():
    with Session(engine) as session:
        user = session.query(User).first()
        transactions = session.query(Transaction).filter(Transaction.user_id == user.id).all() if user else []

        if not user:
            return {"days_left": 0}

        days = predict_days_left(user.balance, transactions)

        return {
            "days_left": days,
            "message": f"Деньги закончатся через {days} дней"
        }


@app.get("/api/score")
def get_score():
    with Session(engine) as session:
        user = session.query(User).first()
        if not user:
            return {"score": 100, "status": "Отлично"}
        
        transactions = session.query(Transaction).filter(Transaction.user_id == user.id).all()

        if not transactions:
            return {"score": 100, "status": "Отлично"}

        total = sum(t.amount for t in transactions)

        score = 100
        if total > 10000:
            score -= 30
        elif total > 5000:
            score -= 15
        if len(transactions) > 20:
            score -= 20

        score = max(score, 10)

        if score > 80:
            status = "🔥 Отлично"
        elif score > 50:
            status = "🙂 Нормально"
        else:
            status = "⚠️ Риск"

        return {"score": score, "status": status}


@app.get("/api/logs", response_model=List[LogOut])
def get_logs():
    with Session(engine) as session:
        return session.query(Log).order_by(Log.id.desc()).limit(100).all()


# 🧠 AI CHAT с контекстом финансов и анализом покупок, а также сохранением истории
@app.post("/api/ai/chat")
def ai_chat(req: ChatRequest):
    # Получаем данные пользователя и транзакции
    with Session(engine) as session:
        user = session.query(User).first()
        if not user:
            return {"reply": "Пользователь не найден"}

        user_id = user.id  # реальный id пользователя

        # ✅ Защита от спама – для каждого пользователя отдельно
        now = datetime.now()
        if user_id in last_request_time:
            diff = (now - last_request_time[user_id]).seconds
            if diff < 2:
                return {"reply": "⏳ Подожди пару секунд перед следующим вопросом"}
        last_request_time[user_id] = now

        transactions = session.query(Transaction).filter(Transaction.user_id == user.id).all()
        total_spent = sum(t.amount for t in transactions)
        total_funds = user.balance + total_spent
        percent_spent = (total_spent / total_funds * 100) if total_funds > 0 else 0

        cat_map = {}
        for t in transactions:
            cat_map[t.category] = cat_map.get(t.category, 0) + t.amount
        top_categories = sorted(cat_map.items(), key=lambda x: x[1], reverse=True)[:3]
        top_cats_str = ", ".join([f"{cat}: {amount} сом" for cat, amount in top_categories])

        user_id_val = user.id

    # Формируем промпт
    prompt = f"""
Ты строгий финансовый аналитик банка. Отвечай кратко, по делу, без лишних слов.

Данные пользователя:
- Баланс: {user.balance} сом
- Всего потрачено: {total_spent} сом
- Потрачено: {percent_spent:.1f}% от общего бюджета
- Топ категории расходов: {top_cats_str if top_cats_str else "нет данных"}

Задача: ответь на вопрос пользователя. Если вопрос касается покупки, обязательно оцени риск (низкий/средний/высокий) и скажи, стоит ли покупать. Используй проценты от баланса.

Вопрос пользователя: {req.message}
"""

    try:
        if client is None:
            raise Exception("Gemini client не инициализирован")
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        if not response or not response.text:
            raise Exception("Empty Gemini response")
        reply = response.text
    except Exception as e:
        print("Gemini error:", e)
        reply = ask_openrouter(prompt)

    # Сохраняем сообщения в БД
    with Session(engine) as session:
        session.add(ChatMessage(
            role="user",
            content=req.message,
            user_id=user_id_val
        ))
        session.add(ChatMessage(
            role="ai",
            content=reply,
            user_id=user_id_val
        ))
        session.commit()

    return {"reply": reply}


# 🧠 История чата
@app.get("/api/chat/history")
def get_chat_history():
    with Session(engine) as session:
        user = session.query(User).first()
        if not user:
            return []
        messages = session.query(ChatMessage)\
            .filter(ChatMessage.user_id == user.id)\
            .order_by(ChatMessage.id.asc())\
            .all()
        return [{"role": m.role, "content": m.content} for m in messages]


# 🧠 Очистка чата
@app.delete("/api/chat/clear")
def clear_chat():
    with Session(engine) as session:
        user = session.query(User).first()
        if not user:
            return {"success": False}
        session.query(ChatMessage)\
            .filter(ChatMessage.user_id == user.id)\
            .delete()
        session.commit()
        return {"success": True}


# 🧠 AI совет (краткий)
@app.post("/api/ai/advice")
def ai_advice():
    with Session(engine) as session:
        user = session.query(User).first()
        if not user:
            return {"advice": "Пользователь не найден"}

        transactions = session.query(Transaction).filter(Transaction.user_id == user.id).all()
        total_spent = sum(t.amount for t in transactions)
        total_funds = user.balance + total_spent
        percent_spent = (total_spent / total_funds * 100) if total_funds > 0 else 0

        cat_map = {}
        for t in transactions:
            cat_map[t.category] = cat_map.get(t.category, 0) + t.amount
        top_cats = sorted(cat_map.items(), key=lambda x: x[1], reverse=True)[:2]

        prompt = f"""
Финансовые показатели:
- Баланс: {user.balance} сом
- Потрачено: {total_spent} сом ({percent_spent:.1f}% бюджета)
- Основные категории: {', '.join([f'{c}: {a} сом' for c, a in top_cats])}

Дай один короткий совет (1-2 предложения) на русском языке.
"""

        try:
            if client is None:
                raise Exception("Gemini client не инициализирован")
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt
            )
            if response and response.text:
                return {"advice": response.text}
            else:
                raise Exception()
        except Exception:
            return {"advice": "Следи за расходами и не трать лишнего 💡"}


# 🧠 Определение категории расхода через AI
@app.post("/api/ai/category")
def ai_category(req: ChatRequest):
    prompt = f"""
Определи категорию расхода.

Текст: {req.message}

Варианты:
Еда, Транспорт, Игры, Развлечения, Продукты, Одежда, Техника, Другое

Ответь ТОЛЬКО одним словом.
"""
    response = ask_openrouter(prompt)
    return {"category": response.strip()}