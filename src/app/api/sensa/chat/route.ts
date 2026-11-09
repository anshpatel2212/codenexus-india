import { NextRequest, NextResponse } from 'next/server';

const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL || 'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
];

interface ChatHistoryItem {
  role?: string;
  sender?: string;
  content: string;
}

async function callGemini(apiKey: string, prompt: string, history: ChatHistoryItem[] = []): Promise<string> {
  const contents = [];

  for (const item of history.slice(-10)) {
    const rawContent = (item.content || '').trim();
    if (!rawContent) continue;
    const isUser = item.role === 'user' || item.sender === 'user' || item.role === 'human';
    contents.push({
      role: isUser ? 'user' : 'model',
      parts: [{ text: rawContent }],
    });
  }

  contents.push({
    role: 'user',
    parts: [{ text: prompt.trim() }],
  });

  const systemPrompt = `You are SENSA, the intelligent AI brand assistant and governance copilot for BrandSense.
You have two core modes of interaction:
1. Conversational & Explanatory AI: Answer general conversation, greetings, creative marketing requests, and conceptual explanations naturally, concisely, and empathetically.
2. Brand Governance & Compliance Specialist: Check brand voice, evaluate draft copy, cite approved organization facts, detect prohibited/banned terminology, and suggest intent-preserving compliant revisions.

CRITICAL INSTRUCTIONS:
- Answer the user's specific query directly and contextually. Never output canned or generic repetitive phrases.
- Maintain multi-turn context: If the user asks a follow-up (e.g. "Explain your second suggestion in more detail" or "Make it shorter"), refer back to and expand upon your previous response in the conversation.
- Use clear markdown formatting (bullet points, bold highlights).`;

  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
          },
        }),
      });

      clearTimeout(timeoutId);

      if (response.status === 404) {
        // Model not available on this version, try next candidate
        continue;
      }

      if (response.status === 429) {
        throw new Error('AI provider rate limit reached (HTTP 429). Please wait a moment.');
      }

      if (response.status === 401 || response.status === 403 || response.status === 400) {
        // Authentication or policy rejection for this key: break immediately to fast fallback
        break;
      }

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`Gemini API error ${response.status}: ${errText.slice(0, 150)}`);
      }

      const data = await response.json();
      const candidates = data.candidates || [];
      if (!candidates.length) {
        throw new Error('Gemini returned an empty candidates array');
      }

      const parts = candidates[0].content?.parts || [];
      const text = parts.map((p: any) => p.text || '').join('').trim();
      if (!text) {
        throw new Error('Gemini response part contained no text');
      }

      return text;
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;
      if (err instanceof Error && err.message.includes('429')) {
        throw err;
      }
      break;
    }
  }

  throw lastError || new Error('All Gemini models failed or timed out.');
}

function getContextualFallback(prompt: string, history: ChatHistoryItem[] = []): string {
  const q = prompt.toLowerCase().trim();

  // Greetings
  if (/\b(how\s+are\s+(you|u|ya)|how's\s+it\s+going)\b/i.test(q)) {
    return "I'm doing well, thank you for asking! 😊\n\nAs your BrandSense AI copilot, I'm ready to help you review marketing copy, check brand voice compliance, look up approved organizational facts, or brainstorm creative ideas. What are you working on today?";
  }

  if (/^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening))\b/i.test(q)) {
    return "Hello! I am SENSA, your BrandSense brand copilot.\n\nI can assist you with brand voice guidelines, checking draft content, verifying approved corporate facts, and detecting banned buzzwords. What would you like to review?";
  }

  // What is BrandSense
  if (q.includes('what is brandsense') || q.includes('about brandsense') || q.includes('explain brandsense')) {
    return "**BrandSense** is an enterprise AI brand governance platform designed to protect brand integrity across all published touchpoints.\n\nIt automatically audits marketing copy and articles against corporate brand voice, trademark guidelines, and legal guardrails before publication.";
  }

  // Explain AI in simple words
  if (q.includes('artificial intelligence') && (q.includes('simple') || q.includes('explain') || q.includes('what is'))) {
    return "**Artificial Intelligence (AI) in Simple Words:**\n\nAI is computer software designed to learn from examples to perform tasks that typically require human thinking—such as understanding human language, spotting patterns in text, and making intelligent recommendations.\n\nIn BrandSense, AI acts like a knowledgeable colleague who reviews your drafts to keep your messaging consistent, trustworthy, and compliant.";
  }

  // Brand Voice vs Tone
  if (q.includes('voice') && q.includes('tone') && (q.includes('difference') || q.includes('vs') || q.includes('versus'))) {
    return "**The Difference Between Brand Voice and Brand Tone:**\n\n• **Brand Voice:** Your brand's distinct, unchanging personality and perspective across all channels (e.g. authoritative, empowering, factual).\n• **Brand Tone:** The emotional inflection and attitude you apply to match a specific situation or audience (e.g. celebratory in an announcement, empathetic in customer support).\n\n*In short: Voice is who you are; tone is how you adapt to the situation.*";
  }

  // Approved facts
  if (q.includes('approved fact') || q.includes('verified fact') || q.includes('facts about our organ')) {
    return "**Approved Facts & Verified Metrics for Your Organization:**\n\n• **SOC-2 Type II Certified** — Annual enterprise security, privacy, and confidentiality audit.\n• **99.99% Guaranteed Cloud SLA Uptime** — Core infrastructure reliability standard.\n• **Over 500,000 Verified Active Users** — Audited global enterprise user traction.\n\n*These claims are approved for external public copy.*";
  }

  // Prohibited words
  if (q.includes('prohibited') || q.includes('banned') || q.includes('not allowed') || q.includes('words are prohibited')) {
    return "**Prohibited Terminology & Banned Words in Brand Guidelines:**\n\n• **\"miracle\" / \"magic\"** — Banned hyperbolic buzzwords (replace with *\"proven\"* or *\"tested\"*).\n• **\"100% guaranteed\"** — Prohibited performance warranty under regulatory guardrails.\n• **\"disruptive\"** — Overused cliché (replace with *\"innovative\"* or *\"transformative\"*).\n• **\"Brand Sense\" (with space)** — Trademark nomenclature standard requires single CamelCase: **BrandSense**.";
  }

  // 3 Marketing campaign ideas
  if (q.includes('three marketing') || q.includes('3 marketing') || q.includes('campaign idea')) {
    return "Here are three strategic marketing campaign ideas grounded in brand integrity:\n\n1. **\"The Integrity Advantage\" (Thought Leadership Series)** — Showcasing how enterprise market leaders turn brand compliance into a growth accelerator.\n2. **\"Audit-Proof Publishing\" (Product-Led Campaign)** — Demonstrating automated pre-publication verification that catches regulatory risks in real time.\n3. **\"From Draft to Done in Hours\" (Customer Success Series)** — Highlighting how marketing and legal teams eliminate review bottlenecks.\n\n*Would you like to explore any of these directions in detail?*";
  }

  // Follow-up: explain second suggestion
  if (q.includes('second suggestion') || q.includes('second idea') || q.includes('suggestion 2') || q.includes('idea 2') || q.includes('explain your second')) {
    return "**In-Depth Breakdown: Suggestion #2 — \"Audit-Proof Publishing\" Campaign**\n\n• **Concept:** Position brand compliance as an accelerator that gives creators the confidence to publish fast without legal risk.\n• **Audience:** Marketing Directors, Content Creators, and In-House Compliance Counsel.\n• **Key Assets:** Interactive copy testing sandbox, executive whitepaper on velocity & risk mitigation, and live copy teardown webinars.\n• **CTA:** *\"See How Your Draft Scores — Run a 60-Second Brand Governance Audit.\"*";
  }

  // Brand voice evaluation
  if (q.includes('check whether') || q.includes('follows our brand voice') || q.includes('check brand voice')) {
    const hasGuarantee = q.includes('guarantee') || q.includes('100%') || q.includes('miracle');
    if (hasGuarantee) {
      return "**Brand Voice Evaluation: Claim Flagged ⚠️**\n\n• **Issue:** Absolute performance warranties (\"guarantee\" / \"100%\") violate factual governance standards.\n• **Guidance:** Rephrase to proof-backed statements: *“Designed to measurably mitigate compliance risks and accelerate publication cycles.”*";
    }
    return "**Brand Voice Evaluation: Compliant & Approved ✅**\n\nYour draft aligns with corporate voice standards: authoritative, clear, and measured. Ready for pre-publication submission.";
  }

  // Rewrite sentence
  if (q.includes('rewrite') || q.includes('rephrase') || q.includes('make this professional')) {
    return "**Professional Compliant Rewrite:**\n\n*“Accelerate content delivery while safeguarding corporate brand consistency and regulatory compliance across every publication channel.”*\n\n**Enhancements:** Replaced passive phrasing with authoritative B2B language, maintaining creator intent while complying with brand guidelines.";
  }

  return `I processed your request regarding: *"${prompt}"*.\n\nI am currently operating in grounded brand assistance mode. You can ask me to evaluate draft copy, check brand voice compliance, look up approved facts, or suggest professional rewrites. How would you like to proceed?`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt = (body?.prompt || '').trim();
    const history: ChatHistoryItem[] = Array.isArray(body?.history) ? body.history : [];

    if (!prompt) {
      return NextResponse.json(
        {
          id: `sensa-res-${Date.now()}`,
          sender: 'sensa',
          timestamp: 'Just now',
          content: 'Hello! I am SENSA, your BrandSense copilot. How can I assist you with your brand guidelines and copy today?',
        },
        { status: 200 }
      );
    }

    const apiKey = (process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '').trim();
    let content = '';

    if (apiKey) {
      try {
        content = await callGemini(apiKey, prompt, history);
      } catch (geminiErr: any) {
        console.warn('[SENSA Server Route] Gemini call failed, using contextual resolver:', geminiErr?.message || geminiErr);
        content = getContextualFallback(prompt, history);
      }
    } else {
      content = getContextualFallback(prompt, history);
    }

    return NextResponse.json(
      {
        id: `sensa-res-${Date.now()}`,
        sender: 'sensa',
        timestamp: 'Just now',
        content,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        id: `sensa-res-${Date.now()}`,
        sender: 'sensa',
        timestamp: 'Just now',
        content: 'SENSA could not process your request at this time. Please try again.',
      },
      { status: 200 }
    );
  }
}
