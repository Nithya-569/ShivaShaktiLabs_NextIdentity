"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, SmilePlus } from "lucide-react";

type Intent = "crisis" | "emotion" | "job" | "community" | "unknown";

type Message = {
  id: number;
  text: string;
  sender: "ai" | "user";
};

type ConversationContext = {
  lastIntent: Intent;
  lastTopic: string;
  guidedQuestionsAsked: number;
  hasAcknowledgedEmotion: boolean;
};

const INITIAL_CONTEXT: ConversationContext = {
  lastIntent: "unknown",
  lastTopic: "",
  guidedQuestionsAsked: 0,
  hasAcknowledgedEmotion: false,
};

function topicFromMessage(text: string, intent: Intent): string {
  if (intent === "crisis")    return "safety concern";
  if (intent === "emotion")   return "emotional support";
  if (intent === "job")       return "career / jobs";
  if (intent === "community") return "community / connection";
  return text.slice(0, 50);
}

export default function SupportPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hey brave soul 💛\nWhat's on your mind today?", sender: "ai" },
  ]);
  const [inputVal, setInputVal]   = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const [ctx, setCtx]             = useState<ConversationContext>(INITIAL_CONTEXT);
  const bottomRef                 = useRef<HTMLDivElement>(null);

  // Auto-scroll on every new message or typing indicator
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatting]);

  const handleSend = async () => {
    const text = inputVal.trim();
    if (!text || isChatting) return;

    setInputVal("");
    setIsChatting(true);

    // Append user message immediately
    const userMsg: Message = { id: Date.now(), text, sender: "user" };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);

    // Build history from all messages except the opening greeting
    const history = messages
      .filter(m => m.id !== 1)
      .map(m => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history,
          lastIntent:            ctx.lastIntent,
          lastTopic:             ctx.lastTopic,
          guidedQuestionsAsked:  ctx.guidedQuestionsAsked,
          hasAcknowledgedEmotion: ctx.hasAcknowledgedEmotion,
        }),
      });

      const data = await res.json();
      const reply: string  = data.reply  ?? "I'm here 💛 Tell me more.";
      const intent: Intent = data.intent ?? "unknown";

      // Update context for next turn
      setCtx({
        // Priority: crisis always wins; keep previous if new is unknown
        lastIntent: intent === "crisis"
          ? "crisis"
          : intent !== "unknown"
            ? intent
            : ctx.lastIntent,

        lastTopic: topicFromMessage(text, intent),

        // Increment guided counter only when truly unknown
        guidedQuestionsAsked: intent === "unknown"
          ? Math.min(ctx.guidedQuestionsAsked + 1, 3)
          : ctx.guidedQuestionsAsked,

        // Once emotion is addressed, stay acknowledged
        hasAcknowledgedEmotion:
          ctx.hasAcknowledgedEmotion || intent === "emotion",
      });

      setMessages([
        ...nextMessages,
        { id: Date.now() + 1, text: reply, sender: "ai" },
      ]);

    } catch (err) {
      console.error("Chat fetch error:", err);
      setMessages([
        ...nextMessages,
        {
          id: Date.now() + 1,
          text: "I'm having a little trouble connecting right now 💛 I'm still here — please try again.",
          sender: "ai",
        },
      ]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="w-full relative min-h-screen pb-32">
      <div className="absolute inset-0 bg-[#F4F7F9] -z-10 fixed" />

      <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 px-6 md:px-12 pt-8 md:pt-16">

        <div className="space-y-4 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">Support ❤️</h1>
          <p className="text-lg text-slate-600 font-medium">A completely safe, non-judgmental space to share your thoughts.</p>
        </div>

        {/* Mood Check — untouched */}
        <div className="w-full bg-white border border-slate-100 rounded-[2rem] p-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-pink-50 rounded-[1.25rem] flex items-center justify-center border border-pink-100 pb-1">
              <SmilePlus className="w-7 h-7 text-pink-500" strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="text-slate-800 font-black text-xl">Log your mood</h4>
              <p className="text-slate-500 font-medium text-sm mt-1">Check in with yourself today.</p>
            </div>
          </div>
          <button className="px-6 py-3 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 rounded-xl text-slate-700 font-bold">
            Check In
          </button>
        </div>

        {/* Chat window — structure identical to original */}
        <div className="w-full flex-1 md:min-h-[500px] h-[60vh] bg-white border border-slate-100 rounded-[2rem] p-4 md:p-8 shadow-sm flex flex-col relative overflow-hidden mt-2">

          <div className="flex-1 overflow-y-auto flex flex-col gap-4 pb-20 pr-2">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`max-w-[85%] p-5 rounded-[1.5rem] shadow-sm ${
                  msg.sender === "ai"
                    ? "bg-[#F4F7F9] text-slate-800 self-start"
                    : "bg-teal-700 text-white self-end"
                }`}
              >
                {msg.sender === "ai" && (
                  <Bot className="w-6 h-6 text-slate-400 mb-3" strokeWidth={2.5} />
                )}
                <p className="font-semibold text-[16px] leading-relaxed whitespace-pre-line">
                  {msg.text}
                </p>
              </div>
            ))}

            {/* Typing indicator */}
            {isChatting && (
              <div className="max-w-[85%] p-5 rounded-[1.5rem] bg-[#F4F7F9] self-start shadow-sm">
                <Bot className="w-6 h-6 text-slate-400 mb-3" strokeWidth={2.5} />
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0ms]"   />
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input bar — identical to original */}
          <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 bg-gradient-to-t from-white via-white to-white/80 flex flex-col gap-2">
            <p className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/80 rounded-full py-1">
              This is AI support, not professional advice.
            </p>
            <div className="flex bg-slate-50 border border-slate-200 rounded-[1.5rem] p-2 pl-6 items-center shadow-inner">
              <input
                type="text"
                placeholder="Type a message safely..."
                className="flex-1 bg-transparent border-none text-slate-800 focus:outline-none placeholder-slate-400 text-lg font-medium"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                disabled={isChatting}
              />
              <button
                disabled={isChatting || !inputVal.trim()}
                onClick={handleSend}
                className="w-12 h-12 bg-teal-700 flex items-center justify-center rounded-[1rem] hover:bg-teal-600 transition-colors shadow-md shrink-0 focus:scale-95 disabled:opacity-50 disabled:bg-slate-400"
              >
                <Send className="w-5 h-5 text-white" strokeWidth={2.5} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}