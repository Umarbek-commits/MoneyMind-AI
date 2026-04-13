from pydantic import BaseModel

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    age: int  # 💥 ДОБАВЬ

class LoginRequest(BaseModel):
    email: str
    password: str

    from datetime import datetime

class TransactionResponse(BaseModel):
    id: int
    title: str
    amount: int
    category: str
    created_at: datetime  # ✅ ВАЖНО

    class Config:
        from_attributes = True