"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, SmilePlus, RotateCcw, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────
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

// ─── Constants ────────────────────────────────────────────────
const OPENING_TEXT = "Hey brave soul 💛\nWhat's on your mind today?";

const OPENING_MESSAGE: Message = {
  id: 1,
  text: OPENING_TEXT,
  sender: "ai",
};

const FRESH_CONTEXT: ConversationContext = {
  lastIntent: "unknown",
  lastTopic: "",
  guidedQuestionsAsked: 0,
  hasAcknowledgedEmotion: false,
};

const MOOD_OPTIONS = [
  { value: "Happy",   emoji: "😊" },
  { value: "Sad",     emoji: "😢" },
  { value: "Anxious", emoji: "😰" },
  { value: "Angry",   emoji: "😠" },
  { value: "Neutral", emoji: "😐" },
];

// ─── Helpers ──────────────────────────────────────────────────
function topicFromMessage(text: string, intent: Intent): string {
  if (intent === "crisis")    return "safety concern";
  if (intent === "emotion")   return "emotional support";
  if (intent === "job")       return "career / jobs";
  if (intent === "community") return "community / connection";
  return text.slice(0, 50);
}

// ─── Component ────────────────────────────────────────────────
export default function SupportPage() {
  const [messages,    setMessages]    = useState<Message[]>([OPENING_MESSAGE]);
  const [inputVal,    setInputVal]    = useState("");
  const [isChatting,  setIsChatting]  = useState(false);
  const [ctx,         setCtx]         = useState<ConversationContext>(FRESH_CONTEXT);

  // Mood modal state
  const [showMoodModal,  setShowMoodModal]  = useState(false);
  const [selectedMood,   setSelectedMood]   = useState<string | null>(null);
  const [savingMood,     setSavingMood]     = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on every new message or typing
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatting]);

  // ── Feature 1: Start new chat ──────────────────────────────
  function handleNewChat() {
    setMessages([{ ...OPENING_MESSAGE, id: Date.now() }]);
    setCtx(FRESH_CONTEXT);
    setInputVal("");
  }

  // ── Feature 2: Mood check-in ───────────────────────────────
  function openMoodModal() {
    setSelectedMood(null);
    setShowMoodModal(true);
  }

  async function submitMood() {
    if (!selectedMood || savingMood) return;
    setSavingMood(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id ?? null;

      if (userId) {
        const { error } = await supabase.from("mood_logs").insert({
          user_id: userId,
          mood:    selectedMood,
        });
        if (error) console.error("mood_logs insert error:", error);
      }
    } catch (err) {
      console.error("submitMood error:", err);
    }

    setShowMoodModal(false);
    setSavingMood(false);

    // Inject bot acknowledgement into chat
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        text: `Thanks for sharing that you're feeling ${selectedMood.toLowerCase()} 💛 I'm here with you.`,
        sender: "ai",
      },
    ]);
  }

  // ── Main send handler ──────────────────────────────────────
  const handleSend = async () => {
    const text = inputVal.trim();
    if (!text || isChatting) return;

    setInputVal("");
    setIsChatting(true);

    const userMsg: Message = { id: Date.now(), text, sender: "user" };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);

    // History for context — skip the static opening message (id=1 or first)
    const history = messages
      .filter((_, i) => i > 0)
      .map(m => ({
        role:    m.sender === "user" ? "user" : "assistant",
        content: m.text,
      }));

    try {
      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message:               text,
          history,
          lastIntent:            ctx.lastIntent,
          lastTopic:             ctx.lastTopic,
          guidedQuestionsAsked:  ctx.guidedQuestionsAsked,
          hasAcknowledgedEmotion: ctx.hasAcknowledgedEmotion,
        }),
      });

      const data = await res.json();
      const reply:  string = data.reply  ?? "I'm here 💛 Tell me more.";
      const intent: Intent = data.intent ?? "unknown";

      // Update context for next turn
      setCtx({
        lastIntent: intent === "crisis"
          ? "crisis"
          : intent !== "unknown"
            ? intent
            : ctx.lastIntent,
        lastTopic: topicFromMessage(text, intent),
        guidedQuestionsAsked: intent === "unknown"
          ? Math.min(ctx.guidedQuestionsAsked + 1, 3)
          : ctx.guidedQuestionsAsked,
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
          id:     Date.now() + 1,
          text:   "I'm having a little trouble connecting right now 💛 I'm still here — please try again.",
          sender: "ai",
        },
      ]);
    } finally {
      setIsChatting(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="w-full relative min-h-screen pb-32">
      <div className="absolute inset-0 bg-[#F4F7F9] -z-10 fixed" />

      <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 px-6 md:px-12 pt-8 md:pt-16">

        {/* Page header */}
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">Support ❤️</h1>
          <p className="text-lg text-slate-600 font-medium">A completely safe, non-judgmental space to share your thoughts.</p>
        </div>

        {/* Mood check-in card — Check In button now opens modal */}
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
          <button
            onClick={openMoodModal}
            className="px-6 py-3 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 rounded-xl text-slate-700 font-bold"
          >
            Check In 💛
          </button>
        </div>

        {/* Chat window */}
        <div className="w-full flex-1 md:min-h-[500px] h-[60vh] bg-white border border-slate-100 rounded-[2rem] p-4 md:p-8 shadow-sm flex flex-col relative overflow-hidden mt-2">

          {/* New Chat button — top right inside chat window */}
          <div className="flex justify-end mb-2 shrink-0">
            <button
              onClick={handleNewChat}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors px-3 py-1.5 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              New Chat
            </button>
          </div>

          {/* Messages */}
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

          {/* Input bar */}
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

      {/* ── Mood modal ────────────────────────────────────────── */}
      {showMoodModal && (
        <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white border border-slate-100 rounded-3xl p-8 flex flex-col gap-6 shadow-2xl relative">

            {/* Close */}
            <button
              onClick={() => setShowMoodModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <p className="text-2xl mb-1">💛</p>
              <h3 className="text-slate-800 text-xl font-black tracking-tight">How are you feeling today?</h3>
              <p className="text-slate-400 text-sm font-medium mt-1">No right or wrong answer.</p>
            </div>

            {/* Mood options */}
            <div className="flex flex-col gap-2.5">
              {MOOD_OPTIONS.map(({ value, emoji }) => (
                <button
                  key={value}
                  onClick={() => setSelectedMood(value)}
                  className={`flex items-center gap-3 w-full px-5 py-3.5 rounded-2xl border font-bold text-sm transition-all ${
                    selectedMood === value
                      ? "bg-teal-50 border-teal-300 text-teal-700"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:border-teal-200 hover:bg-teal-50/40"
                  }`}
                >
                  <span className="text-xl">{emoji}</span>
                  {value}
                </button>
              ))}
            </div>

            {/* Submit */}
            <button
              onClick={submitMood}
              disabled={!selectedMood || savingMood}
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:bg-slate-300 text-white rounded-2xl font-bold text-sm transition-all shadow-md shadow-teal-500/20"
            >
              {savingMood
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                : "Share with Saya"}
            </button>

          </div>
        </div>
      )}
    </div>
  );
}