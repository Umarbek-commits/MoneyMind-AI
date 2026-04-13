from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from database import SessionLocal
from models import Transaction
from schemas import TransactionResponse

router = APIRouter(prefix="/api/transactions", tags=["transactions"])


# 📌 Подключение к БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ✅ ПОЛУЧИТЬ ВСЕ ТРАНЗАКЦИИ
@router.get("/", response_model=list[TransactionResponse])
def get_transactions(db: Session = Depends(get_db)):
    return db.query(Transaction).order_by(Transaction.id.desc()).all()


# ✅ СОЗДАТЬ ТРАНЗАКЦИЮ
@router.post("/")
def create_transaction(
    title: str,
    amount: int,
    category: str,
    db: Session = Depends(get_db),
):
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Сумма должна быть больше 0")

    new_tx = Transaction(
        title=title,
        amount=amount,
        category=category,
        created_at=datetime.utcnow(),  # ✅ ВАЖНО
    )

    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)

    return new_tx