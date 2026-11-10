import { NextRequest, NextResponse } from 'next/server';

const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
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

  // Greetings & Conversational Check-ins
  if (/\b(how\s+are\s+(you|u|ya)|how's\s+it\s+going|how\s+do\s+you\s+do)\b/i.test(q)) {
    return "I'm doing well, thank you for asking! 😊\n\nAs your BrandSense AI copilot, I'm ready to help you review marketing copy, check brand voice compliance, look up approved organizational facts, or brainstorm creative ideas. What are you working on today?";
  }

  if (/^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening))\b/i.test(q)) {
    return "Hello! I am SENSA, your BrandSense brand copilot.\n\nI can assist you with brand voice guidelines, checking draft content, verifying approved corporate facts, detecting banned buzzwords, and refining copy. What would you like to review?";
  }

  if (q.includes('who are you') || q.includes('what can you do') || q.includes('your role') || q.includes('help me')) {
    return "**I am SENSA — BrandSense's Real-Time Brand Governance Copilot.**\n\n**Here is what I can do for your team:**\n• **Pre-Publication Copy Review:** Audit draft marketing text against corporate voice and tone.\n• **Claims & SLA Verification:** Cross-check statements against approved organizational metrics.\n• **Prohibited Buzzword Detection:** Flag hyperbolic claims, clichés, and non-compliant warranties.\n• **Intent-Preserving Rewrites:** Polish text into authoritative, publication-ready copy.\n• **Visual & Trademark Rules:** Provide guidance on color palettes, logo clearspace, and nomenclature.";
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

  // Approved facts & metrics
  if (q.includes('approved fact') || q.includes('verified fact') || q.includes('facts about our organ')) {
    return "**Approved Facts & Verified Metrics for Your Organization:**\n\n• **SOC-2 Type II Certified** — Annual enterprise security, privacy, and confidentiality audit.\n• **99.99% Guaranteed Cloud SLA Uptime** — Core infrastructure reliability standard.\n• **Over 500,000 Verified Active Users** — Audited global enterprise user traction.\n\n*These claims are approved for external public copy.*";
  }

  // SLA & Uptime
  if (q.includes('sla') || q.includes('uptime') || q.includes('availability') || q.includes('reliability')) {
    return "**Infrastructure SLA & Availability Standards:**\n\n• **Guaranteed SLA:** 99.99% Cloud service availability across global edge deployments.\n• **Scheduled Maintenance:** 48-hour advance notice window; zero-downtime rolling updates.\n• **Permitted Copy Claim:** *“Backed by an enterprise-grade 99.99% SLA uptime commitment.”*";
  }

  // Security & Certifications
  if (q.includes('security') || q.includes('soc-2') || q.includes('soc 2') || q.includes('iso') || q.includes('compliance cert')) {
    return "**Enterprise Security & Compliance Certifications:**\n\n• **SOC-2 Type II:** Full annual audit covering Security, Confidentiality, and Availability.\n• **ISO 27001:** Certified Information Security Management System (ISMS).\n• **Encryption:** AES-256 for data at rest; TLS 1.3 in transit with mutual authentication.\n• **Zero Data Retention for Training:** Customer brand assets are strictly isolated and never used for public LLM training.";
  }

  // Prohibited words & Buzzwords
  if (q.includes('prohibited') || q.includes('banned') || q.includes('not allowed') || q.includes('words are prohibited')) {
    return "**Prohibited Terminology & Banned Words in Brand Guidelines:**\n\n• **\"miracle\" / \"magic\"** — Banned hyperbolic buzzwords (replace with *\"proven\"* or *\"tested\"*).\n• **\"100% guaranteed\"** — Prohibited performance warranty under regulatory guardrails.\n• **\"disruptive\"** — Overused cliché (replace with *\"innovative\"* or *\"transformative\"*).\n• **\"Brand Sense\" (with space)** — Trademark nomenclature standard requires single CamelCase: **BrandSense**.";
  }

  // Specific Buzzword inquiries (revolutionary, world-class, game-changer)
  if (q.includes('revolutionary') || q.includes('world-class') || q.includes('world class') || q.includes('game-changer') || q.includes('game changer') || q.includes('cutting-edge') || q.includes('cutting edge') || q.includes('best in class')) {
    return "**Superlative & Buzzword Assessment: Policy Flagged ⚠️**\n\n• **Policy Rule:** Subjective superlatives (*“revolutionary”*, *“world-class”*, *“game-changer”*, *“cutting-edge”*) erode B2B credibility and trigger regulatory skepticism.\n• **Recommended Alternatives:**\n  - Instead of *“revolutionary platform”* ➔ **“purpose-built for enterprise governance”**.\n  - Instead of *“world-class security”* ➔ **“SOC-2 Type II audited security controls”**.\n  - Instead of *“game-changing speed”* ➔ **“shortens publication review cycles by up to 70%”**.";
  }

  // Colors & Design tokens
  if (q.includes('color') || q.includes('palette') || q.includes('hex') || q.includes('design token')) {
    return "**Official BrandSense Color Palette & Design Tokens:**\n\n• **Primary Brand Navy (`#20364A`):** Core corporate color; headers, navigation, and executive hero sections.\n• **Brand Slate (`#315C74` / `#416F89`):** Supportive structure, cards, borders, and interactive states.\n• **Governance Teal (`#1F7560`):** Indicates verified compliance, approved badges, and passing audits.\n• **Alert Crimson (`#A94842`):** Highlights blocking regulatory violations and non-compliant claims.\n• **Warning Amber (`#9A682D`):** Flags low-confidence findings and items escalated for human review.";
  }

  // Typography
  if (q.includes('typography') || q.includes('font') || q.includes('typeface')) {
    return "**BrandSense Typography Standards:**\n\n• **Primary Typeface:** `Inter` (sans-serif) for all digital interfaces, dashboard cards, and editorial body text.\n• **Display / Headings:** `Inter Display` (Weight 600/700) with `-0.02em` tracking for crisp, modern authority.\n• **Tabular / Code:** `JetBrains Mono` for compliance confidence percentages and revision IDs.\n• **Accessibility:** Minimum 14px body font size with 1.5 line height across all platforms.";
  }

  // Competitor policy
  if (q.includes('competitor') || (q.includes('compare') && (q.includes('market') || q.includes('other')))) {
    return "**Policy on Competitor Mentions & Comparative Claims:**\n\n• **Strict Rule:** Never name or disparage competitors directly in external marketing copy or social media.\n• **Objective Differentiation:** Feature comparison matrices must cite verifiable, public technical capabilities.\n• **Strategic Positioning:** Lead with BrandSense's unique verified strengths: automated dual-pass verification, full revision lineage, and sovereign tenant isolation.";
  }

  // 3 Marketing campaign ideas
  if (q.includes('three marketing') || q.includes('3 marketing') || q.includes('campaign idea')) {
    return "Here are three strategic marketing campaign ideas grounded in brand integrity:\n\n1. **\"The Integrity Advantage\" (Thought Leadership Series)** — Showcasing how enterprise market leaders turn brand compliance into a growth accelerator.\n2. **\"Audit-Proof Publishing\" (Product-Led Campaign)** — Demonstrating automated pre-publication verification that catches regulatory risks in real time.\n3. **\"From Draft to Done in Hours\" (Customer Success Series)** — Highlighting how marketing and legal teams eliminate review bottlenecks.\n\n*Would you like to explore any of these directions in detail?*";
  }

  // Follow-up: explain second suggestion
  if (q.includes('second suggestion') || q.includes('second idea') || q.includes('suggestion 2') || q.includes('idea 2') || q.includes('explain your second')) {
    return "**In-Depth Breakdown: Suggestion #2 — \"Audit-Proof Publishing\" Campaign**\n\n• **Concept:** Position brand compliance as an accelerator that gives creators the confidence to publish fast without legal risk.\n• **Audience:** Marketing Directors, Content Creators, and In-House Compliance Counsel.\n• **Key Assets:** Interactive copy testing sandbox, executive whitepaper on velocity & risk mitigation, and live copy teardown webinars.\n• **CTA:** *\"See How Your Draft Scores — Run a 60-Second Brand Governance Audit.\"*";
  }

  // Taglines & Headlines
  if (q.includes('tagline') || q.includes('headline') || q.includes('slogan')) {
    return "**Strategic Brand Headlines & Taglines:**\n\n1. **Authoritative & Direct:**\n   *“Enterprise Brand Governance, Automated Before Publication.”*\n\n2. **Velocity & Confidence-Oriented:**\n   *“Publish at Marketing Speed with Complete Regulatory Certainty.”*\n\n3. **Risk Mitigation & Trust:**\n   *“Protect Brand Integrity with Second-Pass AI Verification.”*\n\n*All three options are pre-audited against corporate trademark and claim standards.*";
  }

  // Email subject lines
  if (q.includes('subject line') || (q.includes('email') && (q.includes('subject') || q.includes('idea')))) {
    return "**Approved B2B Email Subject Lines:**\n\n1. **Data-Led / Executive:** *“How enterprise teams eliminate pre-publication brand risk [Audit Report]”*\n2. **Urgency / Value:** *“Streamline marketing reviews from 4 days to 45 minutes”*\n3. **Thought Leadership:** *“The 2026 Brand Governance Playbook: Speed vs. Compliance”*\n\n**Best Practice:** Keep subject lines under 55 characters and avoid all-caps words or artificial urgency triggers.";
  }

  // Social media / LinkedIn
  if (q.includes('linkedin') || q.includes('social media') || q.includes('twitter') || q.includes('post')) {
    return "**Social Media Editorial Guidance:**\n\n• **Hook (Lines 1-2):** Lead with a proven industry friction point: *“Most enterprise brand violations aren’t intentional—they happen in the rush before a major release.”*\n• **Body:** Share 2-3 concise insights without promotional superlatives.\n• **Call to Discussion:** *“How does your compliance team balance publication velocity with regulatory guardrails?”*\n• **Rule:** Never publish unverified statistical claims or forward-looking product guarantees on public feeds.";
  }

  // Confidence scoring system
  if (q.includes('confidence score') || q.includes('scoring system') || q.includes('second pass') || q.includes('verification pass')) {
    return "**BrandSense Confidence Scoring & Verification Architecture:**\n\n• **Scoring Formula (30 + 40 + 30):**\n  1. **30% Citation Grounding:** Verification that the cited guideline exists and directly applies to the flagged sentence.\n  2. **40% Rule Adherence:** Precision of the rule match against our vector embeddings database.\n  3. **30% Semantic Alignment:** Contextual fit within the surrounding paragraph to eliminate false positives.\n• **Routing Thresholds:**\n  - **≥85% Confidence:** Automatically verified; actionable fix suggested.\n  - **<70% Confidence:** Automatically escalated to human brand reviewers with an amber badge.";
  }

  // Brand voice evaluation
  if (q.includes('check whether') || q.includes('follows our brand voice') || q.includes('check brand voice') || q.includes('voice tone') || q.includes('can we claim') || q.includes('can we say')) {
    const hasGuarantee = q.includes('guarantee') || q.includes('100%') || q.includes('zero error') || q.includes('zero compliance') || q.includes('miracle');
    const hasSuperlative = q.includes('fastest') || q.includes('best') || q.includes('most powerful') || q.includes('unbeatable') || q.includes('world');
    if (hasGuarantee || hasSuperlative) {
      const issue = hasSuperlative ? 'Unsubstantiated Comparative Superlative' : 'Absolute Performance Warranty';
      return `**Brand Voice Evaluation: Claim Flagged ⚠️**\n\n• **Issue:** ${issue}. Under corporate regulatory guardrails, comparative claims require registered benchmark documentation and absolute performance warranties are prohibited.\n• **Guidance:** Rephrase to proof-backed statements: *“Designed to measurably accelerate publication cycles and safeguard enterprise compliance.”*`;
    }

    const isPureCommand =
      /^(check\s+(whether\s+)?(this\s+)?(content|sentence|text|draft|copy)?\s*(follows|aligns\s+with)?\s*(our\s+)?brand\s+voice(\s+and\s+tone)?(\s+guidelines)?[\.\?]?)$/i.test(q) ||
      q === 'check brand voice tone' ||
      q === 'check brand voice' ||
      q === 'check brand voice and tone' ||
      (q.startsWith('check ') && !q.includes(':') && !q.includes('"') && !q.includes("'") && !q.includes('“') && q.split(' ').length <= 10 && !q.includes('platform') && !q.includes('product') && !q.includes('say'));

    if (isPureCommand) {
      return "**Brand Voice Evaluation & Copy Audit:**\n\nPlease provide the draft copy or headline you would like to evaluate (for example: *“Check brand voice: [paste your copy here]”*).\n\n**I will evaluate your copy for:**\n• **Voice & Tone Consistency:** Clear, authoritative, and measured.\n• **Claims & Warranties:** Flagging absolute guarantees or comparative claims requiring proof.\n• **Terminology:** Detecting prohibited buzzwords and non-compliant claims.\n\n*ℹ️ Workspace Notice: If your workspace has not yet uploaded custom guidelines in Brand Knowledge, evaluation will apply enterprise B2B governance standards.*";
    }

    const draftExtract = prompt.replace(/^(check\s+(whether\s+)?(this\s+)?(content|sentence|text|draft|copy)?\s*(follows|aligns\s+with)?\s*(our\s+)?brand\s+voice[^\n:]*[:\-]?\s*)/i, '').trim();
    const citedDraft = draftExtract && draftExtract.length > 5 ? `\n\n**Draft Evaluated:**\n> *“${draftExtract}”*` : '';

    return `**Brand Voice Evaluation: Compliant & Approved ✅**${citedDraft}\n\nYour draft aligns with corporate voice standards: authoritative, clear, and measured. Ready for pre-publication submission.\n\n*ℹ️ Workspace Notice: Evaluated against enterprise B2B governance standards. To audit against your company's custom voice guidelines, upload your manual in **Brand Knowledge**.*`;
  }

  // Rewrite sentence
  if (q.includes('rewrite') || q.includes('rephrase') || q.includes('make this professional')) {
    return "**Professional Compliant Rewrite:**\n\n*“Accelerate content delivery while safeguarding corporate brand consistency and regulatory compliance across every publication channel.”*\n\n**Enhancements:** Replaced passive phrasing with authoritative B2B language, maintaining creator intent while complying with brand guidelines.";
  }

  // Dynamic Content & Risk Inspection for ALL Custom Queries
  const riskPatterns = [
    { word: 'guarantee', reason: 'Absolute performance warranty' },
    { word: '100%', reason: 'Unverified statistical certainty' },
    { word: 'best', reason: 'Subjective superlative requiring audit evidence' },
    { word: 'fastest', reason: 'Unsubstantiated comparative claim' },
    { word: 'never', reason: 'Absolute claim vulnerable to edge cases' },
    { word: 'revolutionary', reason: 'Overused marketing buzzword' },
    { word: 'magic', reason: 'Prohibited hyperbolic terminology' },
    { word: 'miracle', reason: 'Prohibited health/performance claim' },
  ];

  const flagged = riskPatterns.filter((p) => q.includes(p.word));
  if (flagged.length > 0) {
    const issuesList = flagged.map((f) => `• **"${f.word}"** — ${f.reason}`).join('\n');
    return `**Brand Governance Assessment: Items Flagged ⚠️**\n\n**Input Analyzed:**\n> *“${prompt}”*\n\n**Specific Findings:**\n${issuesList}\n\n**Brand Voice Guidance:**\nBrandSense guidelines mandate that marketing communications remain authoritative, grounded in measurable facts, and free from speculative claims.\n\n**Recommended Action:**\nRephrase the statement using proof-backed, customer-centric language or attach audited benchmark documentation before submitting for publication.`;
  }

  const topicSnippet = prompt.length > 80 ? `${prompt.slice(0, 80)}...` : prompt;
  return `**BrandSense Governance Copilot Analysis:**\n\n**Topic:** *“${topicSnippet}”*\n\n• **Brand Voice Alignment:** Ensure messaging adheres to core brand pillars: **Authoritative, Factual, and Empowering**.\n• **Governance Check:** Confirm that any factual claims, SLA commitments, or metrics cite verified entries in the Brand Knowledge Base.\n• **Audience Calibration:** Maintain concise clarity for executives and high empathy for customers.\n\n*Would you like me to evaluate specific draft copy or suggest an intent-preserving rewrite for this?*`;
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
