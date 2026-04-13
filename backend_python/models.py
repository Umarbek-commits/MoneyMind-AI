from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from database import Base


# 👤 Пользователь
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    balance = Column(Integer, default=10000)
    level = Column(Integer, default=1)
    age = Column(Integer)


# 💸 Транзакции
class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    amount = Column(Integer)
    category = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)