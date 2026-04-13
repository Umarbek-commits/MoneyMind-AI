def classify_transaction(text: str):
    text = text.lower()

    if "бургер" in text or "еда" in text or "кафе" in text:
        return "Еда"
    if "такси" in text or "автобус" in text:
        return "Транспорт"
    if "игра" in text:
        return "Развлечения"

    return "Другое"

def predict_days_left(balance, transactions):
    if not transactions:
        return 30

    total = sum(t.amount for t in transactions)
    days = len(set(t.date for t in transactions))


    if days == 0:
        return 30

    avg_per_day = total / days

    if avg_per_day == 0:
        return 30

    return int(balance / avg_per_day)


    