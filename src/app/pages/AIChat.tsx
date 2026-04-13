import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Send, Bot, ArrowLeft, Trash2 } from "lucide-react";
import { sendAIMessage } from "../../api/api";

interface Message {
  id: string;
  from: "user" | "ai";
  text: string;
  tips?: string[];
  warning?: string;
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  from: "ai",
  text: "👋 Привет! Я твой AI финансовый ассистент. Спроси меня всё о деньгах!",
  tips: [
    "💡 Напиши: 'хочу купить наушники за 3000'",
    "📊 Или: 'дай совет по экономии'",
  ],
};

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Загрузка истории чата
  const loadHistory = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/chat/history", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("financeai_token")}`,
        },
      });
      if (!res.ok) throw new Error("Failed to load history");
      const data = await res.json();
      // data = [{ role: "user", content: "..." }, { role: "ai", content: "..." }]
      if (Array.isArray(data) && data.length > 0) {
        const historyMessages: Message[] = data.map((msg, idx) => ({
          id: `history-${idx}`,
          from: msg.role === "user" ? "user" : "ai",
          text: msg.content,
        }));
        setMessages(historyMessages);
      } else {
        // Если истории нет, показываем приветственное сообщение
        setMessages([WELCOME_MESSAGE]);
      }
    } catch (error) {
      console.error("Ошибка загрузки истории", error);
      setMessages([WELCOME_MESSAGE]);
    } finally {
      setLoading(false);
    }
  };

  // Очистка чата
  const clearChat = async () => {
    try {
      await fetch("http://127.0.0.1:8000/api/chat/clear", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("financeai_token")}`,
        },
      });
      setMessages([WELCOME_MESSAGE]);
    } catch (error) {
      console.error("Ошибка очистки чата", error);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      from: "user",
      text: input,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await sendAIMessage(userMsg.text);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        from: "ai",
        text: res.reply,
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          from: "ai",
          text: "Ошибка AI 😢",
        },
      ]);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") sendMessage();
  };

  const QUICK_ACTIONS = [
    "Хочу купить наушники за 3000",
    "Дай совет по экономии",
    "Какой мой баланс?",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white">Загрузка истории...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen" style={{ maxHeight: "100dvh" }}>
      {/* Header */}
      <div
        className="px-4 pt-6 pb-3 flex items-center justify-between flex-shrink-0"
        style={{
          background: "rgba(10, 10, 20, 0.95)",
          borderBottom: "1px solid rgba(124, 58, 237, 0.2)",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.07)", color: "#d1d5db" }}
          >
            <ArrowLeft size={18} />
          </button>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
          >
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <p style={{ color: "white", fontWeight: 700, fontSize: "15px" }}>
              AI Финансовый ассистент 🤖
            </p>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span style={{ color: "#10b981", fontSize: "11px" }}>Онлайн</span>
            </div>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}
          title="Очистить историю"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-6"
        style={{ paddingBottom: "120px" }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
              className={`flex ${
                msg.from === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex gap-2 max-w-[85%] ${
                  msg.from === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {msg.from === "ai" && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                    style={{
                      background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
                    }}
                  >
                    <Bot size={14} className="text-white" />
                  </div>
                )}
                <div>
                  <div
                    className="px-4 py-3 rounded-2xl"
                    style={{
                      background:
                        msg.from === "user"
                          ? "linear-gradient(135deg, #7c3aed, #5b21b6)"
                          : "rgba(30, 30, 55, 0.95)",
                      borderRadius:
                        msg.from === "user"
                          ? "18px 4px 18px 18px"
                          : "4px 18px 18px 18px",
                      border:
                        msg.from === "ai"
                          ? "1px solid rgba(124, 58, 237, 0.25)"
                          : "none",
                      boxShadow:
                        msg.from === "user"
                          ? "0 2px 12px rgba(124,58,237,0.35)"
                          : "none",
                    }}
                  >
                    <p
                      style={{
                        color: "white",
                        fontSize: "14px",
                        lineHeight: "1.5",
                      }}
                    >
                      {msg.text}
                    </p>
                  </div>

                  {/* Warning */}
                  {msg.warning && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ delay: 0.2 }}
                      className="mt-2 px-3 py-2 rounded-xl"
                      style={{
                        background: "rgba(239, 68, 68, 0.12)",
                        border: "1px solid rgba(239, 68, 68, 0.35)",
                      }}
                    >
                      <p style={{ color: "#fca5a5", fontSize: "13px" }}>
                        ⏰ {msg.warning}
                      </p>
                    </motion.div>
                  )}

                  {/* Tips */}
                  {msg.tips && (
                    <div className="mt-2 space-y-1">
                      {msg.tips.map((tip, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className="px-3 py-2 rounded-xl"
                          style={{
                            background: "rgba(124, 58, 237, 0.08)",
                            border: "1px solid rgba(124, 58, 237, 0.2)",
                          }}
                        >
                          <p style={{ color: "#c4b5fd", fontSize: "12px" }}>
                            {tip}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* AI Typing */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-2"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
                }}
              >
                <Bot size={14} className="text-white" />
              </div>
              <div
                className="px-4 py-3 rounded-2xl flex items-center gap-1"
                style={{
                  background: "rgba(30, 30, 55, 0.95)",
                  border: "1px solid rgba(124, 58, 237, 0.25)",
                  borderRadius: "4px 18px 18px 18px",
                }}
              >
                <span style={{ color: "#a78bfa", fontSize: "12px" }}>
                  🤖 AI думает
                </span>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "#7c3aed" }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Quick Actions + Input */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 pb-4 pt-2"
        style={{
          background: "rgba(10,10,20,0.98)",
          borderTop: "1px solid rgba(124,58,237,0.15)",
        }}
      >
        {/* Quick actions */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action}
              onClick={() => {
                setInput(action);
                inputRef.current?.focus();
              }}
              className="flex-shrink-0 px-3 py-1.5 rounded-full"
              style={{
                background: "rgba(124, 58, 237, 0.12)",
                border: "1px solid rgba(124, 58, 237, 0.3)",
                color: "#a78bfa",
                fontSize: "11px",
                whiteSpace: "nowrap",
              }}
            >
              {action}
            </button>
          ))}
        </div>

        {/* Input row */}
        <div
          className="flex items-center gap-2 rounded-2xl px-4 py-2"
          style={{
            background: "rgba(30,30,55,0.9)",
            border: "1px solid rgba(124, 58, 237, 0.3)",
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Написать ассистенту..."
            className="flex-1 bg-transparent outline-none"
            style={{ color: "white", fontSize: "14px" }}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={sendMessage}
            disabled={!input.trim()}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: input.trim()
                ? "linear-gradient(135deg, #7c3aed, #3b82f6)"
                : "rgba(255,255,255,0.08)",
            }}
          >
            <Send
              size={16}
              style={{ color: input.trim() ? "white" : "#4b5563" }}
            />
          </motion.button>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}