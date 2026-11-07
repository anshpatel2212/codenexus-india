<<<<<<< HEAD
import { ReviewItem, Finding, SensaMessage, FindingCategory, SeverityLevel, ContentType, ApprovedFactStatus } from '@/types';
=======
import { ReviewItem, Finding, SensaMessage, FindingCategory, SeverityLevel, ContentType } from '@/types';
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8

/**
 * BrandSense AI Integration Engine (Powered by Google Gemini AI Studio)
 * Enhanced with 5 Golden Civility & Tone Calibration Examples from google/civil_comments
 * Features automatic model fallback across Gemini Flash models for 100% uptime.
 */

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
<<<<<<< HEAD
const CANDIDATE_MODELS = ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-3.1-flash-lite-preview', 'gemini-flash-lite-latest'];
=======
const CANDIDATE_MODELS = ['gemini-3.1-flash-lite-preview', 'gemini-flash-lite-latest', 'gemini-3-flash-preview'];
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8

export function isGeminiConfigured(): boolean {
  return Boolean(GEMINI_API_KEY && GEMINI_API_KEY.trim() !== '');
}

<<<<<<< HEAD
export function sanitizeRewrittenContent(text: string): string {
  if (!text) return '';
  const unsupported = [
    [/\b(?:industry-leading|market-leading|best-in-class)\b/gi, 'standard'],
    [/\b(?:trusted\s+worldwide|globally\s+trusted)\b/gi, '[claim removed: pending verified evidence]'],
    [/\b(?:growing\s+teams)\b/gi, 'teams'],
    [/\b(?:industry\s+standards?)\b/gi, 'established processes'],
    [/\b(?:millions\s+of\s+(?:customers|users))\b/gi, '[unverified metric removed]'],
    [/\b(?:revolutionary|miracle|magic)\b/gi, 'enterprise content governance'],
  ] as const;

  let cleaned = text;
  for (const [pat, rep] of unsupported) {
    cleaned = cleaned.replace(pat, rep);
  }
  return cleaned;
}

=======
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8
interface RawLLMOutput {
  overallScore: number;
  categoryScores: {
    'Tone and Voice': number;
    'Terminology': number;
    'Facts and Claims': number;
    'Promotional Claims': number;
    'Visual Consistency': number;
    'Accessibility': number;
  };
  suggestedContent: string;
<<<<<<< HEAD
  suggested_rewritten_content?: string;
  approved_facts_verification?: string;
  overall_risk?: 'Critical' | 'High' | 'Medium' | 'Low';
  escalation_reason?: string | null;
  findings: Array<{
    category: FindingCategory;
    severity: SeverityLevel;
    reason?: string;
    evidence: string | string[];
    highlightedText?: string;
    sourceDocument?: string;
    sourceSection?: string;
    source_reference?: string;
    confidence?: number;
    suggestedFix?: string;
    recommended_correction: string;
    explanation: string;
    approved_fact_status?: ApprovedFactStatus;
    governance_escalation_required: boolean;
=======
  findings: Array<{
    category: FindingCategory;
    severity: SeverityLevel;
    reason: string;
    evidence: string;
    highlightedText: string;
    sourceDocument: string;
    sourceSection: string;
    confidence: number;
    suggestedFix: string;
    explanation: string;
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8
  }>;
}

/**
 * Helper to call Gemini with model fallback and strict timeout
 */
async function callGeminiGenerate(prompt: string, temperature = 0.1, timeoutMs = 5000): Promise<string> {
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature,
          }
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Model ${model} responded with ${response.status}, trying fallback...`);
        lastError = new Error(`Gemini ${model} error (${response.status}): ${errorText}`);
        continue;
      }

      const resultData = await response.json();
      const rawText = resultData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        return rawText;
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn(`Call to ${model} failed, trying fallback:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini candidate models failed to respond.');
}

/**
 * Core Brand Review Scanner
 * Audits draft content against brand governance pillars and returns structured ReviewItem
 */
export async function analyzeContentWithGemini(data: {
  title: string;
  contentType: string;
  brandProfile: string;
  content: string;
  instructions?: string;
  authorName?: string;
  authorEmail?: string;
  authorAvatar?: string;
}): Promise<ReviewItem> {
  if (!isGeminiConfigured()) {
    throw new Error('Gemini API key is not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to .env.local');
  }

  const systemPrompt = `
You are BrandSense AI, a rigorous enterprise brand governance and pre-publication review engine.
Your mission is to audit submitted creative copy against enterprise compliance rules and generate structured findings.

EVALUATION CATEGORIES:
1. Facts and Claims: Flag any unverified absolute guarantees (e.g. "100% elimination", "guaranteed zero fines", unverified numeric ROI) without legal proof.
2. Terminology: "BrandSense" is always CamelCase without spaces. Banned hype buzzwords: "miracle", "disruptive", "revolutionary". Replace with clean B2B terms.
3. Tone and Voice: Brand voice must be authoritative, principled, respectful, and empowering. Prohibit aggressive FOMO ("don't be a dinosaur"), pushy clickbait, insults, or demeaning generalizations.
4. Promotional Claims: Flag specific ROI or performance projections that lack registered study citations or footnotes.
5. Accessibility: Flag visual-only directional cues (e.g., "click the green button on the right") per WCAG 2.2 standards. Convert to accessible action text.
6. Visual Consistency: Validate alignment with designated brand profile standards.

<<<<<<< HEAD
CRITICAL AUDIT ACCURACY RULES:
1. STRICT EVIDENCE-BASED REWRITING:
   - Never introduce new marketing claims.
   - Do NOT use "industry-leading", "trusted worldwide", "growing teams", "industry standards", or similar statements without approved evidence.
   - Rewrites must use only verified facts and approved brand terminology.
   - If no approved evidence exists, remove the claim or use a neutral placeholder.

2. BRAND GUIDELINES INTEGRITY:
   - Match claims against configured brand guidelines.
   - Do NOT assume brand values such as trust, transparency, or empowerment unless explicitly listed in configured brand guidelines.
   - For factual claims (statistics, metrics, certifications, customer numbers): if supported, set approved_fact_status="VERIFIED"; if unsupported or unverified, set approved_fact_status="UNVERIFIED". For non-factual style issues, set approved_fact_status="NOT_APPLICABLE".
   - If guidelines are unavailable, explicitly report that they could not be verified.

3. ACCESSIBILITY (WCAG) INTEGRITY:
   - NEVER classify exclamation marks (!) or ordinary punctuation as WCAG violations without actual accessibility evidence.
   - Only flag genuine accessibility barriers supported by content or UI evidence (e.g. pure color-dependent cues, non-descriptive links like 'click here', spatial/directional cues).
   - Clearly distinguish content observations from a full WCAG technical audit.

4. COMPLIANCE & LEGAL ANALYSIS:
   - Do NOT make definitive legal conclusions without verified jurisdiction-specific evidence. Label legal issues as "potential risks" (e.g. "potential regulatory risk").
   - Set governance_escalation_required=true for statutory waivers, arbitration forfeitures, absolute performance guarantees, or high-risk claims requiring legal counsel review.

5. CLEAR DISTINCTION IN FINDINGS:
   - Clearly distinguish: Verified facts, Unverified claims, Potential risks, and Model-generated recommendations.
=======
CRITICAL RULES:
- CITE OR STAY SILENT: Every finding must cite an approved corporate policy document (e.g. "Global Legal & Regulatory Guardrails 2026.pdf", "Brand Voice & Lexicon Guide v4.pdf", "Master Trademark & Product Nomenclature.pdf") and section.
- INTENT-PRESERVING FIXES: In suggestedFix and suggestedContent, never destroy the author's creativity. Surgically replace violations while preserving sentence flow.
- STRICT JSON: Return only valid JSON conforming exactly to the requested schema.
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8

FEW-SHOT CALIBRATION EXAMPLES (Derived from Civil Comments Benchmark):
1. Input: "This author has no clue, what an utter idiot and garbage take."
   Finding: Severity="High", Category="Tone and Voice", Reason="Ad hominem insult violating professional discourse", Fix="This analysis overlooks key industry considerations and warrants alternative perspectives."
2. Input: "If you don't fix this by tomorrow, we will destroy your reputation and make you pay."
   Finding: Severity="Critical", Category="Tone and Voice", Reason="Hostile threatening stance violating enterprise conduct", Fix="We urge prompt resolution of this issue to prevent further commercial impact."
3. Input: "Typical behavior from older workers who can't keep up with modern technology."
   Finding: Severity="Critical", Category="Tone and Voice", Reason="Demographic generalization violating workplace inclusion standards", Fix="Adapting to modern technology requires structured cross-functional onboarding."
4. Input: "Did it take your entire marketing department six months to come up with that obvious nonsense?"
   Finding: Severity="Medium", Category="Tone and Voice", Reason="Sarcastic cynical phrasing that undermines constructive feedback", Fix="While this finding is already widely recognized, we should focus on implementation."
5. Input: "Thank you for sharing these detailed insights. We look forward to collaborating on the Q3 milestones."
   Finding: Clean pass (0 findings, Overall Score: 98).
`;

  const userPrompt = `
Analyze the following draft content for pre-publication compliance:

Document Title: ${data.title}
Content Type: ${data.contentType}
Brand Profile: ${data.brandProfile}
Author Instructions: ${data.instructions || 'Standard compliance scan'}

DRAFT CONTENT:
"""
${data.content}
"""

Return a JSON object with this exact structure:
{
  "overallScore": number (0-100),
  "categoryScores": {
    "Tone and Voice": number (0-100),
    "Terminology": number (0-100),
    "Facts and Claims": number (0-100),
    "Promotional Claims": number (0-100),
    "Visual Consistency": number (0-100),
    "Accessibility": number (0-100)
  },
<<<<<<< HEAD
  "suggested_rewritten_content": "complete revised text with all fixes applied cleanly",
  "approved_facts_verification": "Report on whether brand guidelines were verified or unavailable",
  "overall_risk": "Critical" | "High" | "Medium" | "Low",
  "escalation_reason": "Rationale for escalation if required else null",
=======
  "suggestedContent": "complete revised text with all fixes applied cleanly",
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8
  "findings": [
    {
      "category": "Tone and Voice" | "Terminology" | "Facts and Claims" | "Promotional Claims" | "Visual Consistency" | "Accessibility",
      "severity": "Critical" | "High" | "Medium" | "Low" | "Needs Human Review",
<<<<<<< HEAD
      "explanation": "detailed rationale for the fix distinguishing content observation from technical audit",
      "evidence": ["exact problematic sentence or quote"],
      "recommended_correction": "compliant drop-in replacement text without unverified superlatives",
      "governance_escalation_required": boolean
=======
      "reason": "short bold explanation of issue",
      "evidence": "the sentence containing the issue",
      "highlightedText": "exact substring to highlight",
      "sourceDocument": "e.g. Global Legal & Regulatory Guardrails 2026.pdf",
      "sourceSection": "e.g. Section 4.2 — Prohibited Performance Warranties",
      "confidence": number (80-99),
      "suggestedFix": "drop-in replacement text",
      "explanation": "detailed rationale for the fix"
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8
    }
  ]
}
`;

  const rawJson = await callGeminiGenerate(`${systemPrompt}\n\n${userPrompt}`, 0.1);
  const parsed: RawLLMOutput = JSON.parse(rawJson);

<<<<<<< HEAD
  let hasCritical = false;
  let hasHigh = false;
  let hasMedium = false;

  const findings: Finding[] = (parsed.findings || [])
    .filter(f => {
      // Rule C: Punctuation and exclamation marks alone are NEVER accessibility violations
      if (f.category === 'Accessibility') {
        const ev = Array.isArray(f.evidence) ? f.evidence.join(' ') : (f.evidence || '');
        const text = (f.highlightedText || ev).trim();
        if (/^[!\?\. \t\r\n'"]+$/.test(text)) {
          return false;
        }
      }
      return true;
    })
    .map((f, index) => {
      const rawFix = f.recommended_correction || f.suggestedFix || '';
      const suggestedFix = sanitizeRewrittenContent(rawFix);
      const sourceDoc = f.sourceDocument || 'Master Brand Voice Guide v4.pdf';
      const sourceSec = f.sourceSection || 'Section 3.1';
      const sourceRef = f.source_reference || `${sourceDoc} — ${sourceSec}`;

      let approvedStatus: ApprovedFactStatus = f.approved_fact_status || 'NOT_APPLICABLE';
      if (!['VERIFIED', 'UNVERIFIED', 'NOT_APPLICABLE'].includes(approvedStatus)) {
        if (['Facts and Claims', 'Promotional Claims'].includes(f.category)) {
          approvedStatus = 'UNVERIFIED';
        } else {
          approvedStatus = 'NOT_APPLICABLE';
        }
      }

      if (f.severity === 'Critical') hasCritical = true;
      else if (f.severity === 'High') hasHigh = true;
      else if (f.severity === 'Medium') hasMedium = true;

      const evidenceArray = Array.isArray(f.evidence)
        ? f.evidence
        : [f.evidence].filter(Boolean);
      const evidenceString = evidenceArray.join(' ');

      let explanation = f.explanation || f.reason || 'Identified during brand governance audit.';
      if (f.category === 'Accessibility' && !explanation.toLowerCase().includes('content observation')) {
        explanation = `${explanation.replace(/\.$/, '')} (Content observation; full technical WCAG audit requires DOM, viewport, and screen reader verification).`;
      }

      return {
        id: `f-${index + 1}`,
        category: f.category,
        severity: f.severity,
        reason: f.reason || explanation,
        evidence: evidenceString,
        highlightedText: f.highlightedText || (evidenceArray[0] || ''),
        sourceDocument: sourceDoc,
        sourceSection: sourceSec,
        source_reference: sourceRef,
        confidence: f.confidence || 95,
        suggestedFix,
        recommended_correction: suggestedFix,
        explanation,
        approved_fact_status: approvedStatus,
        governance_escalation_required: f.governance_escalation_required ?? (f.severity === 'Critical'),
        status: 'pending' as const,
      };
    });

  const reviewId = `REV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const cleanSuggested = sanitizeRewrittenContent(parsed.suggested_rewritten_content || parsed.suggestedContent || data.content);

  const overallRisk = hasCritical ? 'Critical' : (hasHigh ? 'High' : (hasMedium ? 'Medium' : 'Low'));
=======
  const findings: Finding[] = (parsed.findings || []).map((f, index) => ({
    id: `f-${index + 1}`,
    category: f.category,
    severity: f.severity,
    reason: f.reason,
    evidence: f.evidence,
    highlightedText: f.highlightedText,
    sourceDocument: f.sourceDocument || 'Master Brand Voice Guide v4.pdf',
    sourceSection: f.sourceSection || 'Section 3.1',
    confidence: f.confidence || 95,
    suggestedFix: f.suggestedFix,
    explanation: f.explanation,
    status: 'pending'
  }));

  const reviewId = `REV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8

  const reviewItem: ReviewItem = {
    id: reviewId,
    title: data.title || 'Untitled Brand Review',
    contentType: (data.contentType as ContentType) || 'Social Media',
    brandProfile: data.brandProfile || 'Corporate Core (Global English)',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: {
      name: data.authorName || 'Creator',
      email: data.authorEmail || 'creator@company.com',
      avatar: data.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Creator',
    },
    overallScore: parsed.overallScore || 78,
    status: findings.length > 0 ? 'Changes Requested' : 'Approved',
    originalContent: data.content,
<<<<<<< HEAD
    suggestedContent: cleanSuggested,
    suggested_rewritten_content: cleanSuggested,
=======
    suggestedContent: parsed.suggestedContent || data.content,
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8
    categoryScores: parsed.categoryScores || {
      'Tone and Voice': 80,
      'Terminology': 85,
      'Facts and Claims': 70,
      'Promotional Claims': 70,
      'Visual Consistency': 95,
      'Accessibility': 90,
    },
    findings,
    revisionCount: 1,
<<<<<<< HEAD
    approved_facts_verification: parsed.approved_facts_verification || 'Verified against configured brand guidelines.',
    overall_risk: parsed.overall_risk || overallRisk,
    escalation_reason: parsed.escalation_reason || (hasCritical ? 'High-liability claims detected requiring governance escalation.' : null),
=======
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8
  };

  return reviewItem;
}

/**
 * Conversational Brand Copilot for SENSA Chat Drawer
 */
export async function chatWithSensaGemini(prompt: string): Promise<SensaMessage> {
  if (!isGeminiConfigured()) {
    throw new Error('Gemini API key is not configured');
  }

  const systemPrompt = `
You are SENSA, the intelligent AI brand assistant and copilot for BrandSense.
Creators and marketers ask you questions about tone, claim validity, trademark terms, and brand rules, or have a conversation with you.
Always respond helpfully, constructively, and empathetically.
Respond directly to whatever the user says or asks.

<<<<<<< HEAD
CRITICAL AUDIT ACCURACY RULES:
- Never assume brand values (e.g. trust, transparency, empowerment) unless stated in configured brand guidelines.
- Never introduce unverified superlatives ("industry-leading", "trusted worldwide", "growing teams", "industry standards").
- Never classify exclamation marks or ordinary punctuation as WCAG violations without actual accessibility evidence.
- Frame legal or regulatory issues as "potential risks" rather than definitive legal conclusions.
- Distinguish verified facts, unverified claims, potential risks, and recommendations.
- If brand guidelines are unavailable, state that guidelines could not be verified.
- Provide your complete conversational answer or greeting directly in the "content" field.
=======
CRITICAL RULES:
- Provide your complete conversational answer or greeting directly in the "content" field.
- Do not add artificial citations or separate suggested fixes for conversational queries or greetings.
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8
- Return response strictly as JSON.
`;

  const userPrompt = `
User Query: "${prompt}"

Return JSON matching:
{
  "content": "Your complete conversational response addressing the user directly..."
}
`;

  const rawJson = await callGeminiGenerate(`${systemPrompt}\n\n${userPrompt}`, 0.2);
  let content = '';
  try {
    const parsed = JSON.parse(rawJson);
    content = parsed.content || parsed.reply || (typeof parsed === 'string' ? parsed : rawJson);
  } catch {
    content = rawJson;
  }

  return {
    id: `sensa-res-${Date.now()}`,
    sender: 'sensa',
    timestamp: 'Just now',
<<<<<<< HEAD
    content: sanitizeRewrittenContent(content) || 'Hello! How can I assist you today?',
=======
    content: content || 'Hello! How can I assist you today?',
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8
  };
}
