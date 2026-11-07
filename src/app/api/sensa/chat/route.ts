import { NextRequest, NextResponse } from 'next/server';

const INTERACTIONS_URL = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';

interface ChatHistoryItem {
  role?: string;
  sender?: string;
  content: string;
}

function getDeterministicFallback(prompt: string, history: ChatHistoryItem[] = []): string {
  const lower = prompt.toLowerCase().trim();
  const isGreeting = /^(hi|hello|hey|hhii|heyy|greetings|hola)\b/i.test(lower);
  const isShorten = lower.includes('shorter') || lower.includes('shorten') || lower.includes('concise') || lower.includes('brief') || lower.includes('condense');
  const isRewrite = lower.includes('rewrite') || lower.includes('alternative') || lower.includes('rephrase') || lower.includes('variant');
  const hasGuarantee =
    lower.includes('guarantee') ||
    lower.includes('100%') ||
    lower.includes('zero fine') ||
    lower.includes('cures') ||
    lower.includes('miracle');
  const hasFomo =
    lower.includes('dinosaur') ||
    lower.includes('idiot') ||
    lower.includes('stupid') ||
    lower.includes('hurry') ||
    lower.includes('dust');
  const hasDirectional =
    lower.includes('green button') ||
    lower.includes('right side') ||
    lower.includes('click here');

  const previousAssistantMsg = [...history].reverse().find(
    (h) => h.role === 'model' || h.role === 'sensa' || h.sender === 'sensa'
  );

  if (isShorten && previousAssistantMsg) {
    return `**Refined (Concise Variant):**\n\nAccelerate reviews and maintain brand consistency with AI-assisted verification. Built for confident, compliant publishing.`;
  }

  if (isRewrite && previousAssistantMsg) {
    return `**Alternative Compliant Variant:**\n\nEnsure brand integrity across every touchpoint with continuous governance and clear, verified messaging.`;
  }

  if (isGreeting) {
    return 'Hello! I am SENSA, your BrandSense copilot. How can I assist you with your brand guidelines, tone, or content today?';
  }
  if (hasGuarantee) {
    return '**Policy Review Result: Non-Compliant Claim Flagged**\n\nYour drafted copy contains absolute performance warranties ("guarantee", "100%", "miracle"). Under corporate legal guardrails, absolute guarantees expose the brand to regulatory penalties unless supported by registered, audited third-party validation.\n\n**Guidance:** Pivot from absolute promises to quantifiable risk-mitigation messaging.';
  }
  if (hasFomo) {
    return '**Policy Review Result: Aggressive Tone Flagged**\n\nBrandSense voice guidelines require an empowering, authoritative, and respectful tone. Aggressive urgency or demeaning phrases ("don\'t be a dinosaur", fear-of-missing-out pressure) undermine enterprise trust.\n\n**Guidance:** Frame the value proposition around operational efficiency and strategic enablement.';
  }
  if (hasDirectional) {
    return '**Policy Review Result: Accessibility Issue (WCAG 2.2)**\n\nDirectional or sensory-only cues (e.g. "click the green button on the right") violate accessibility standards for vision-impaired users utilizing screen readers.\n\n**Guidance:** Use clear, non-spatial action verbs such as "Download the compliance report" or "Select Continue".';
  }
  return 'Your query aligns well with BrandSense institutional brand governance principles. The tone is constructive, professional, and clear. Let me know if you need specific guidance on brand voice, terminology, or compliance!';
}

function extractOutputText(payload: any): string {
  const chunks: string[] = [];
  for (const step of payload?.steps || []) {
    if (step?.type !== 'model_output') continue;
    for (const part of step?.content || []) {
      if (part?.type === 'text' && part?.text) chunks.push(part.text);
    }
  }
  return chunks.join('').trim();
}

async function callGemini(apiKey: string, prompt: string, history: ChatHistoryItem[] = []): Promise<string> {
  const historyLines = history
    .slice(-10)
    .filter((item) => item.content && item.content.trim())
    .map((item) => {
      const isUser = item.role === 'user' || item.sender === 'user';
      return `${isUser ? 'User' : 'SENSA'}: ${item.content.trim()}`;
    });

  const systemPrompt = `You are SENSA, the intelligent AI brand assistant and copilot for BrandSense.
Creators and marketers ask you questions about tone, claim validity, trademark terms, and brand rules, or have a multi-turn conversation with you.
Always respond helpfully, constructively, and empathetically.
Respond directly to whatever the user says or asks, maintaining context from previous turns in the conversation.
If the user asks for a follow-up (e.g. "make it shorter", "rewrite that"), use the preceding conversation context.
Return JSON matching the requested schema with the complete conversational answer in the "content" field.`;

  const input = `CONVERSATION SO FAR:
${historyLines.length ? historyLines.join('\n') : 'No previous turns.'}

LATEST USER MESSAGE:
${prompt}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(INTERACTIONS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
        'Api-Revision': '2026-05-20',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        input: `${systemPrompt}\n\n${input}`,
        response_format: {
          type: 'text',
          mime_type: 'application/json',
          schema: {
            type: 'object',
            properties: { content: { type: 'string' } },
            required: ['content'],
          },
        },
        generation_config: { temperature: 0.2 },
        store: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini interaction failed with status ${response.status}`);
    }

    const resultData = await response.json();
    const rawText = extractOutputText(resultData);
    if (!rawText) {
      throw new Error('Gemini returned an empty response');
    }
    try {
      const parsed = JSON.parse(rawText);
      if (parsed.content) return parsed.content;
      if (parsed.reply) return parsed.reply;
    } catch {
      return rawText;
    }
    return rawText;
  } finally {
    clearTimeout(timeoutId);
  }
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
          content: 'Hello! I am SENSA, your BrandSense copilot. How can I assist you today?',
        },
        { status: 200 }
      );
    }

    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    let content = '';

    if (apiKey) {
      try {
        content = await callGemini(apiKey, prompt, history);
      } catch (geminiErr) {
        console.warn('Gemini server call failed, using fallback:', geminiErr);
        content = getDeterministicFallback(prompt, history);
      }
    } else {
      content = getDeterministicFallback(prompt, history);
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
  } catch {
    return NextResponse.json(
      {
        id: `sensa-res-${Date.now()}`,
        sender: 'sensa',
        timestamp: 'Just now',
        content: 'Hello! I am SENSA, your BrandSense copilot. How can I assist you with your content and brand guidelines today?',
      },
      { status: 200 }
    );
  }
}
