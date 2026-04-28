import { NextRequest, NextResponse } from "next/server";

export type Intent = "crisis" | "emotion" | "job" | "community" | "unknown";

// ─── Intent detection — priority: crisis > emotion > job > community ──────────
function detectIntent(message: string): Intent {
  const m = message.toLowerCase();

  if (["urgent","unsafe","emergency","kicked out","abuse","abused","homeless","suicid","hurt myself","kill myself","die","danger","violence","assault","nowhere to go","help me please","not safe"].some(w => m.includes(w)))
    return "crisis";

  if (["lonely","alone","sad","tired","anxious","depressed","broken","crying","hopeless","worthless","empty","numb","overwhelmed","hurt","pain","fear","suffering","lost","low","upset","invisible","exhausted"].some(w => m.includes(w)))
    return "emotion";

  if (["job","work","hiring","resume","cv","career","employ","salary","income","interview","opportunity","earn","money","skill","placement","bangalore","mumbai","delhi","remote"].some(w => m.includes(w)))
    return "job";

  if (["friends","people","community","connect","belong","meet","social","group","someone to talk","no one","understand me","like me","family","together"].some(w => m.includes(w)))
    return "community";

  return "unknown";
}

// ─── Rule-based fallback — no API key needed ──────────────────────────────────
function buildFallback(
  intent: Intent,
  lastIntent: Intent,
  lastTopic: string,
  guidedCount: number
): string {
  // Topic switch: was emotional, now asking about job
  if (lastIntent === "emotion" && intent === "job") {
    return "Carrying all of that while also trying to figure out work — that takes real strength. Let me help. The Grow page has jobs from inclusive employers, and there's a resume builder that lets you lead with skills without sharing anything you're not comfortable with. What kind of role are you looking for?";
  }

  // Topic switch: was job, now emotional
  if (lastIntent === "job" && intent === "emotion") {
    return "The job search can be exhausting on its own — especially when you're already carrying a lot. That's completely valid. Do you want to talk about what's been weighing on you most?";
  }

  switch (intent) {
    case "crisis":
      return "I'm here with you right now 💛 Your safety matters most.\n\nPlease reach out:\n📞 iCall: 9152987821\n📞 Vandrevala Foundation: 1860-2662-345 (24/7)\n📞 Emergency: 112\n\nI'm not going anywhere. Can you tell me a little more about what's happening?";

    case "emotion":
      if (lastIntent === "emotion" && guidedCount > 0) {
        return "You don't have to explain it perfectly. I'm just here with you. Is there anything that would make right now even a little easier?";
      }
      return "What you're feeling is real and it makes sense 💛 You don't have to carry this alone. What's been weighing on you the most?";

    case "job":
      return "Let's work on this together. The Grow page has listings from inclusive employers — you can filter by remote, city, or salary. There's also a resume builder that helps you lead with your skills. What kind of work are you looking for?";

    case "community":
      return "You're not as alone as it might feel right now. The Connect page has communities of people who genuinely understand — you can even post anonymously if that feels safer to start. What kind of connection are you hoping for?";

    case "unknown":
      if (guidedCount === 0) return "Hey, I'm glad you're here 💛 What would feel most helpful right now — talking through something you're feeling, finding work or opportunities, or connecting with people who get it?";
      if (guidedCount === 1) return "No rush at all. Sometimes it's hard to find the words. Is there anything on your mind — even something small?";
      return "You don't need the right words. Just being here is enough, and so are you 💛";
  }
}

// ─── Gemini system prompt — built fresh each turn with full context ────────────
function buildGeminiBody(
  message: string,
  history: { role: string; content: string }[],
  intent: Intent,
  lastIntent: Intent,
  lastTopic: string,
  guidedCount: number,
  hasAcknowledgedEmotion: boolean
): object {
  const systemText = `You are Saya, a warm AI support companion for NextIdentity — a safe platform for transgender and gender-diverse people in India.

ABSOLUTE RULES:
1. NEVER ignore or dismiss what the user just said. Acknowledge it directly first.
2. NEVER repeat a question already asked in this conversation.
3. NEVER reset or restart — this is a continuous conversation.
4. Keep responses SHORT: 2 to 5 sentences maximum.
5. Be warm and human. Never robotic, never clinical, never preachy.
6. Use 💛 at most once per response.
7. Do NOT give medical diagnoses, legal advice, or claim to be a therapist.
8. If the user switches topics (e.g. was emotional, now asking about jobs), acknowledge their emotional state briefly FIRST, then address the new topic.
9. In CRISIS mode: respond with immediate warmth and resources. Do NOT ask questions first.
10. Never start two consecutive responses with the same opening word.

CURRENT CONTEXT:
- This message's intent: ${intent}
- Previous intent: ${lastIntent}
- Last topic: ${lastTopic || "first message"}
- Emotion already acknowledged: ${hasAcknowledgedEmotion}
- Guided questions asked: ${guidedCount}

INTENT GUIDANCE:
${intent === "crisis"    ? "CRISIS — Lead with warmth immediately. Include: iCall 9152987821 | Vandrevala 1860-2662-345 (24/7) | Emergency 112. No clarifying questions." : ""}
${intent === "emotion"   ? `EMOTION — Validate deeply before anything else.${hasAcknowledgedEmotion ? " Emotion was already acknowledged — don't re-validate, move gently forward." : ""}` : ""}
${intent === "job"       ? `JOB — Be encouraging and practical. Mention inclusive job listings and resume builder on Grow page.${lastIntent === "emotion" && !hasAcknowledgedEmotion ? " Briefly acknowledge their emotional state first." : ""}` : ""}
${intent === "community" ? "COMMUNITY — Be warm. Mention the Connect page has communities and anonymous posting." : ""}
${intent === "unknown"   ? `GUIDED — Ask ONE gentle open question. Questions asked: ${guidedCount}.${guidedCount >= 3 ? " Do NOT ask more questions. Just offer gentle presence." : ""}` : ""}`;

  const contents = [
    { role: "user",  parts: [{ text: systemText }] },
    { role: "model", parts: [{ text: "Understood. I'm Saya — warm, attentive, and holding this whole conversation in mind." }] },
    // Real history — last 10 turns
    ...history.slice(-10).map(h => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.content }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  return { contents };
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      message,
      history = [],
      lastIntent = "unknown",
      lastTopic  = "",
      guidedQuestionsAsked = 0,
      hasAcknowledgedEmotion = false,
    }: {
      message: string;
      history: { role: string; content: string }[];
      lastIntent: Intent;
      lastTopic: string;
      guidedQuestionsAsked: number;
      hasAcknowledgedEmotion: boolean;
    } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Empty message" }, { status: 400 });
    }

    const intent = detectIntent(message);
    const apiKey = process.env.GEMINI_API_KEY;

    // ── No API key → rule-based fallback ──────────────────────
    if (!apiKey) {
      const reply = buildFallback(intent, lastIntent, lastTopic, guidedQuestionsAsked);
      return NextResponse.json({ reply, intent });
    }

    // ── Gemini call ────────────────────────────────────────────
    const geminiBody = buildGeminiBody(
      message, history, intent, lastIntent,
      lastTopic, guidedQuestionsAsked, hasAcknowledgedEmotion
    );

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiBody),
      }
    );

    if (!res.ok) {
      console.error("Gemini HTTP error:", res.status, await res.text());
      const reply = buildFallback(intent, lastIntent, lastTopic, guidedQuestionsAsked);
      return NextResponse.json({ reply, intent });
    }

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (reply) {
      return NextResponse.json({ reply, intent });
    }

    return NextResponse.json({
      reply: buildFallback(intent, lastIntent, lastTopic, guidedQuestionsAsked),
      intent,
    });

  } catch (err) {
    console.error("Chat route error:", err);
    return NextResponse.json(
      { reply: "I'm having a little trouble right now 💛 I'm still here — please try again in a moment.", intent: "unknown" },
      { status: 200 } // return 200 so the frontend still shows the message
    );
  }
}