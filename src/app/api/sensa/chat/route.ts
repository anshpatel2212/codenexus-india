import { NextRequest, NextResponse } from 'next/server';

const CANDIDATE_MODELS = [
  'gemini-flash-latest',
  'gemini-2.5-flash',
  'gemini-3.1-flash-lite-preview',
  'gemini-flash-lite-latest',
];

function sanitizeRewrittenContent(text: string): string {
  if (!text) return '';
  const unsupported = [
    [/\b(?:industry-leading|market-leading|best-in-class)\b/gi, 'standard'],
    [/\b(?:trusted\s+worldwide|globally\s+trusted)\b/gi, '[claim removed: pending verified evidence]'],
    [/\b(?:growing\s+teams)\b/gi, 'teams'],
    [/\b(?:industry\s+standards?)\b/gi, 'established processes'],
    [/\b(?:millions\s+of\s+(?:customers|users))\b/gi, '[unverified metric removed]'],
  ] as const;

  let cleaned = text;
  for (const [pat, rep] of unsupported) {
    cleaned = cleaned.replace(pat, rep);
  }
  return cleaned;
}

function getDeterministicFallback(prompt: string): string {
  const lower = prompt.toLowerCase().trim();
  const isGreeting = /^(hi|hello|hey|hhii|heyy|greetings|hola)\b/i.test(lower);
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

  if (isGreeting) {
    return 'Hello! I am SENSA, your BrandSense copilot. How can I assist you with your brand guidelines and content today?';
  }
  if (hasGuarantee) {
    return '**Policy Review Result: Potential Risk Flagged**\n\nYour drafted copy contains absolute performance warranties ("guarantee", "100%", "miracle"). Under corporate legal guardrails, absolute guarantees present potential regulatory risks unless supported by registered, audited third-party validation.\n\n**Guidance:** Pivot from absolute promises to quantifiable risk-mitigation messaging.';
  }
  if (hasFomo) {
    return '**Policy Review Result: Aggressive Tone Flagged**\n\nBrandSense voice guidelines require an empowering, authoritative, and respectful tone. Aggressive urgency or demeaning phrases ("don\'t be a dinosaur", fear-of-missing-out pressure) undermine enterprise trust.\n\n**Guidance:** Frame the value proposition around operational efficiency and strategic enablement.';
  }
  if (hasDirectional) {
    return '**Policy Review Result: Accessibility Issue (WCAG 2.2)**\n\nDirectional or sensory-only cues (e.g. "click the green button on the right") violate accessibility standards for vision-impaired users utilizing screen readers (Content observation; technical WCAG verification requires DOM and assistive tool validation).\n\n**Guidance:** Use clear, non-spatial action verbs such as "Download the compliance report" or "Select Continue".';
  }
  return 'Your query aligns well with BrandSense institutional brand governance principles. The tone is constructive, professional, and clear. Let me know if you need specific guidance on brand voice, terminology, or compliance!';
}

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const systemPrompt = `
You are SENSA, the intelligent AI brand assistant and copilot for BrandSense.
Creators and marketers ask you questions about tone, claim validity, trademark terms, and brand rules, or have a conversation with you.
Always respond helpfully, constructively, and empathetically.
Respond directly to whatever the user says or asks.

CRITICAL AUDIT ACCURACY RULES:
1. STRICT EVIDENCE-BASED REWRITING:
   - Never introduce new marketing claims or unapproved buzzwords ("industry-leading", "trusted worldwide", "growing teams", "industry standards").
   - Rewrites must use only verified facts and approved brand terminology.
   - If no approved evidence exists, remove the claim or use a neutral placeholder.

2. BRAND GUIDELINES INTEGRITY:
   - Never assume brand values (such as trust, transparency, empowerment) unless present in configured brand guidelines.
   - If guidelines are unavailable, state that they could not be verified.

3. ACCESSIBILITY (WCAG) INTEGRITY:
   - Never classify exclamation marks (!) or ordinary punctuation as WCAG violations without actual accessibility evidence.
   - Clearly distinguish content observations from a full technical WCAG audit.

4. COMPLIANCE & LEGAL ANALYSIS:
   - Frame legal or regulatory issues as "potential risks" rather than definitive legal conclusions.
   - Distinguish verified facts, unverified claims, potential risks, and recommendations.

5. FORMATTING:
   - Provide your complete conversational answer or greeting directly in the "content" field.
   - Do not add artificial citations or separate suggested fixes for conversational queries or greetings.
   - Return response strictly as JSON.
`;

  const userPrompt = `
User Query: "${prompt}"

Return JSON matching:
{
  "content": "Your complete conversational response addressing the user directly..."
}
`;

  for (const model of CANDIDATE_MODELS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        continue;
      }

      const resultData = await response.json();
      const rawText = resultData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        try {
          const parsed = JSON.parse(rawText);
          if (parsed.content) return sanitizeRewrittenContent(parsed.content);
          if (parsed.reply) return sanitizeRewrittenContent(parsed.reply);
        } catch {
          return sanitizeRewrittenContent(rawText);
        }
      }
    } catch {
      clearTimeout(timeoutId);
      continue;
    }
  }

  throw new Error('All Gemini candidate models failed');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt = (body?.prompt || '').trim();

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

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      '';

    let content = '';

    if (apiKey.trim()) {
      try {
        content = await callGemini(apiKey.trim(), prompt);
      } catch (geminiErr) {
        console.warn('Gemini server call failed, using fallback:', geminiErr);
        content = getDeterministicFallback(prompt);
      }
    } else {
      content = getDeterministicFallback(prompt);
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
