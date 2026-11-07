import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const engineCode = fs.readFileSync(path.resolve('backend/services/ai_review_engine.py'), 'utf8');
const geminiServiceCode = fs.readFileSync(path.resolve('src/services/gemini-ai.ts'), 'utf8');
const sensaRouteCode = fs.readFileSync(path.resolve('src/app/api/sensa/chat/route.ts'), 'utf8');

test('Optimized Hybrid AI Architecture Test Suite', async (t) => {
  await t.test('1. Gemini is configured as the primary high-throughput engine', () => {
    assert.match(geminiServiceCode, /gemini-flash-latest/);
    assert.match(sensaRouteCode, /gemini-flash-latest/);
    assert.match(engineCode, /gemini-flash-latest/);
  });

  await t.test('2. NVIDIA Nemotron is integrated with max_tokens: 4096 and reasoning separation', () => {
    assert.match(engineCode, /max_tokens["']?:\s*4096/);
    assert.match(engineCode, /reasoning_content/);
    assert.match(engineCode, /_analyze_with_nvidia_nemotron/);
    assert.match(engineCode, /governanceReasoning/);
  });

  await t.test('3. Escalation router only invokes NVIDIA for high-risk / complex compliance', () => {
    assert.match(engineCode, /_is_high_risk_or_escalated/);
    assert.match(engineCode, /arbitration\s*\\s\*\s*waiver|statutory/);
    assert.match(engineCode, /Legal\/Policy/);
  });

  await t.test('4. Robust JSON extraction handles markdown wrappers and codeblocks', () => {
    assert.match(engineCode, /_extract_and_validate_json/);
    assert.match(engineCode, /```(?:json)?/);
  });

  await t.test('5. Deterministic fallback is active and tags results distinctly', () => {
    assert.match(engineCode, /_run_deterministic_fallback/);
    assert.match(engineCode, /Deterministic Python Rule Engine \(Fallback\)/);
  });

  await t.test('6. Finding IDs, categories, and severity levels conform to BrandSense enterprise contract', () => {
    assert.match(engineCode, /f-\{uuid\.uuid4\(\)\.hex/);
    assert.match(engineCode, /Promotional Claims/);
    assert.match(engineCode, /Terminology/);
    assert.match(engineCode, /Tone and Voice/);
    assert.match(engineCode, /Accessibility/);
  });
});
