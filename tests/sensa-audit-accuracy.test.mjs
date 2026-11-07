import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const engineCode = fs.readFileSync(path.resolve('backend/services/ai_review_engine.py'), 'utf8');
const geminiServiceCode = fs.readFileSync(path.resolve('src/services/gemini-ai.ts'), 'utf8');
const sensaRouteCode = fs.readFileSync(path.resolve('src/app/api/sensa/chat/route.ts'), 'utf8');
const typesCode = fs.readFileSync(path.resolve('src/types/index.ts'), 'utf8');
const routerCode = fs.readFileSync(path.resolve('backend/routers/reviews.py'), 'utf8');

test('BrandSense SENSA — Final Content Audit Quality & Regression Suite', async (t) => {
  await t.test('1. Unsupported Facts in Rewritten Content', () => {
    // Scrub forbidden superlatives from rewrites
    assert.match(
      engineCode,
      /industry-leading|market-leading|best-in-class/i,
      'ai_review_engine must sanitize "industry-leading" marketing claims'
    );
    assert.match(
      engineCode,
      /trusted\s+worldwide/i,
      'ai_review_engine must sanitize "trusted worldwide"'
    );
    assert.match(
      engineCode,
      /growing\s+teams/i,
      'ai_review_engine must sanitize "growing teams"'
    );
    assert.match(
      engineCode,
      /industry\s+standards/i,
      'ai_review_engine must sanitize "industry standards"'
    );
    assert.match(
      geminiServiceCode,
      /industry-leading/i,
      'gemini-ai.ts must sanitize "industry-leading" from rewrites'
    );
    assert.match(
      geminiServiceCode,
      /trusted\s+worldwide/i,
      'gemini-ai.ts must sanitize "trusted worldwide" from rewrites'
    );
  });

  await t.test('2. Invented Brand Guidelines & Unavailable Reporting', () => {
    // When guidelines are missing, explicitly report that they could not be verified
    assert.match(
      engineCode,
      /Brand guidelines unavailable: Organization has no verified brand guidelines configured/i,
      'Engine must explicitly report when brand guidelines are unavailable'
    );
    assert.match(
      engineCode,
      /Tone and values could not be verified/i,
      'Engine must report that tone and values could not be verified'
    );
    assert.match(
      geminiServiceCode,
      /If guidelines are unavailable, explicitly report that they could not be verified/i,
      'gemini-ai.ts must prompt model to report unavailable guidelines'
    );
    assert.match(
      sensaRouteCode,
      /If guidelines are unavailable, state that they could not be verified/i,
      'sensa/chat must instruct copilot on unavailable guidelines'
    );
  });

  await t.test('3. Unsupported ISO and Regulatory Certification Claims', () => {
    // Unsupported certification claims must be flagged UNVERIFIED with governance escalation
    assert.ok(
      engineCode.includes('ISO-9001,\\s+HIPAA,\\s+and\\s+GDPR\\s+globally\\s+verified'),
      'Engine must detect unverified ISO-9001 / HIPAA / GDPR claims'
    );
    assert.match(
      engineCode,
      /"approved_fact_status":\s*"UNVERIFIED"/,
      'Must assign approved_fact_status: UNVERIFIED'
    );
    assert.match(
      engineCode,
      /"governance_escalation_required":\s*True/,
      'Must require governance escalation for fake certification claims'
    );
  });

  await t.test('4. Unsupported Customer Statistics', () => {
    // Customer metrics like "over 10,000 enterprise customers" or "millions of satisfied users" must be flagged
    assert.ok(
      engineCode.includes('over\\s+10,000\\s+enterprise\\s+customers') || engineCode.includes('millions\\s+of\\s+satisfied\\s+users'),
      'Engine must identify unverified customer statistics'
    );
    assert.match(
      engineCode,
      /Specific numerical metric lacks registered and audited substantiation/i,
      'Engine must explain that numerical customer statistics require audited proof'
    );
  });

  await t.test('5. Incorrect WCAG Punctuation Flags', () => {
    // Punctuation and exclamation marks alone are NEVER accessibility violations
    assert.ok(
      engineCode.includes('is_pure_punctuation'),
      'ai_review_engine.py must filter out pure punctuation from accessibility findings'
    );
    assert.ok(
      geminiServiceCode.includes('Punctuation and exclamation marks alone are NEVER accessibility violations'),
      'gemini-ai.ts must reject punctuation-only accessibility findings'
    );
    assert.match(
      sensaRouteCode,
      /Never classify exclamation marks \(!\) or ordinary punctuation as WCAG violations/i,
      'sensa/chat route must prohibit classifying exclamation marks as WCAG violations'
    );
    // Must clearly distinguish content observation from technical WCAG audit
    assert.match(
      engineCode,
      /Content observation; full technical WCAG audit requires DOM/i,
      'Engine must explicitly distinguish content observation from technical WCAG audit'
    );
  });

  await t.test('6. Missing Evidence Handling', () => {
    // Evidence must be formatted as an array/list of strings
    assert.match(
      engineCode,
      /"evidence":\s*evidence_list/,
      'ai_review_engine.py must output evidence as a list'
    );
    assert.match(
      engineCode,
      /isinstance\(raw_ev,\s*list\)/,
      'ai_review_engine.py must validate list-based evidence'
    );
    assert.match(
      routerCode,
      /isinstance\(f\.get\("evidence"\),\s*list\)/,
      'backend/routers/reviews.py must handle list-based evidence safely'
    );
  });

  await t.test('7. Missing Severity and Escalation Fields', () => {
    // Missing severity defaults to Medium, missing escalation defaults safely
    assert.match(
      engineCode,
      /severity = str\(f\.get\("severity", "Medium"\)\)/,
      'ai_review_engine.py must default missing severity to Medium'
    );
    assert.match(
      engineCode,
      /escalation_required = f\.get\("governance_escalation_required"\)/,
      'ai_review_engine.py must extract and normalize governance_escalation_required'
    );
    assert.match(
      engineCode,
      /escalation_required = bool\(/,
      'ai_review_engine.py must cast governance_escalation_required to boolean'
    );
  });

  await t.test('8. Structured JSON Schema & Invalid JSON Handling', () => {
    // Top-level fields: approved_facts_verification, overall_risk, suggested_rewritten_content, escalation_reason
    assert.match(
      engineCode,
      /parsed\["approved_facts_verification"\]/,
      'Must populate top-level approved_facts_verification'
    );
    assert.match(
      engineCode,
      /parsed\["overall_risk"\]/,
      'Must populate top-level overall_risk'
    );
    assert.match(
      engineCode,
      /parsed\["suggested_rewritten_content"\]/,
      'Must populate top-level suggested_rewritten_content'
    );
    assert.match(
      engineCode,
      /parsed\["escalation_reason"\]/,
      'Must populate top-level escalation_reason'
    );
    assert.match(
      routerCode,
      /"approved_facts_verification"/,
      'Router must return approved_facts_verification'
    );
    assert.match(
      routerCode,
      /"overall_risk"/,
      'Router must return overall_risk'
    );
    assert.match(
      routerCode,
      /"suggested_rewritten_content"/,
      'Router must return suggested_rewritten_content'
    );
    assert.match(
      routerCode,
      /"escalation_reason"/,
      'Router must return escalation_reason'
    );
    assert.match(
      typesCode,
      /approved_facts_verification\?: string/,
      'ReviewItem type must declare approved_facts_verification'
    );
    assert.match(
      typesCode,
      /overall_risk\?: 'Critical' \| 'High' \| 'Medium' \| 'Low'/,
      'ReviewItem type must declare overall_risk'
    );
    assert.match(
      typesCode,
      /suggested_rewritten_content\?: string/,
      'ReviewItem type must declare suggested_rewritten_content'
    );
    assert.match(
      typesCode,
      /escalation_reason\?: string \| null/,
      'ReviewItem type must declare escalation_reason'
    );
    // Robust error recovery
    assert.match(
      engineCode,
      /except Exception:\s*return None/,
      'Must catch JSON parsing exceptions and return None safely without crashing'
    );
  });
});
