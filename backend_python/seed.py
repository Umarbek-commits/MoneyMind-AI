import hashlib
from datetime import datetime
from sqlalchemy.orm import Session
from main import engine, User, Category, Transaction, Budget, Achievement, SpendingLimit

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def seed_database():
    """Заполняет БД начальными данными"""
    with Session(engine) as session:
        categories_data = [
            {"name": "Еда", "emoji": "🍔", "color": "#7c3aed", "description": "Продукты и рестораны"},
            {"name": "Транспорт", "emoji": "🚕", "color": "#3b82f6", "description": "Такси, маршрутки, бензин"},
            {"name": "Игры", "emoji": "🎮", "color": "#8b5cf6", "description": "Видеоигры и развлечения"},
            {"name": "Развлечения", "emoji": "🎬", "color": "#06b6d4", "description": "Кино, концерты"},
            {"name": "Продукты", "emoji": "🛒", "color": "#10b981", "description": "Продуктовые магазины"},
            {"name": "Одежда", "emoji": "👕", "color": "#f59e0b", "description": "Одежда и обувь"},
            {"name": "Техника", "emoji": "📱", "color": "#ef4444", "description": "Электроника и гаджеты"},
        ]

        for cat_data in categories_data:
            existing = session.query(Category).filter(Category.name == cat_data["name"]).first()
            if not existing:
                category = Category(**cat_data)
                session.add(category)
        
        session.commit()

        user_email = "demo@money-mind.ai"
        existing_user = session.query(User).filter(User.email == user_email).first()
        if not existing_user:
            user = User(
                name="Demo User",
                email=user_email,
                balance=50000,
                level=15,
                age=28,
            )
            user.password_hash = hash_password("password123")
            session.add(user)
            session.commit()
            session.refresh(user)

            spending_limit = SpendingLimit(
                user_id=user.id,
                daily_limit=5000,
                weekly_limit=30000,
                monthly_limit=100000,
            )
            session.add(spending_limit)
            session.commit()

            categories = session.query(Category).all()
            for cat in categories[:3]:
                budget = Budget(
                    user_id=user.id,
                    category_id=cat.id,
                    limit=20000,
                    period="month",
                )
                session.add(budget)
            
            session.commit()
            print(f"✅ Пользователь '{user.name}' создан (ID: {user.id})")
        else:
            print("✅ Демо-пользователь уже существует")

        categories = session.query(Category).all()
        print(f"✅ Категорий в БД: {len(categories)}")

if __name__ == "__main__":
    seed_database()
    print("✅ БД инициализирована успешно!")
