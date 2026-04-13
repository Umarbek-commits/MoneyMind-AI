from fastapi import APIRouter
from pydantic import BaseModel
import os
from google import genai

router = APIRouter(prefix="/api/ai", tags=["ai"])


class ChatRequest(BaseModel):
    message: str


# 🔑 подключаем ключ
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


@router.post("/chat")
async def chat(req: ChatRequest):
    user_message = req.message

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=user_message,
        )

        return {
            "reply": response.text
        }

    except Exception as e:
        return {
            "reply": f"Ошибка AI: {str(e)}"
        }