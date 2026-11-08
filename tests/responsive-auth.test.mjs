import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Responsive Auth Shell Layout and Fallback Test Suite', async (t) => {
  const authShellPath = path.resolve('src/components/auth/AuthShell.tsx');
  const authCssPath = path.resolve('src/components/auth/AuthShell.module.css');
  const authClientPath = path.resolve('src/services/auth-client.ts');
  const supabaseClientPath = path.resolve('src/lib/supabase/client.ts');

  const authShellCode = fs.readFileSync(authShellPath, 'utf8');
  const authCssCode = fs.readFileSync(authCssPath, 'utf8');
  const authClientCode = fs.readFileSync(authClientPath, 'utf8');
  const supabaseClientCode = fs.readFileSync(supabaseClientPath, 'utf8');

  await t.test('1. DOM Order: formPanel is FIRST, welcomePanel is SECOND', () => {
    const formPanelIdx = authShellCode.indexOf('className={`${styles.formPanel}');
    const welcomePanelIdx = authShellCode.indexOf('className={styles.welcomePanel}');
    assert.ok(formPanelIdx !== -1, 'formPanel must be present in AuthShell');
    assert.ok(welcomePanelIdx !== -1, 'welcomePanel must be present in AuthShell');
    assert.ok(formPanelIdx < welcomePanelIdx, 'formPanel must precede welcomePanel in DOM order for mobile single-column stacking');
  });

  await t.test('2. Desktop Layout: Two-column grid with form on left and branding on right', () => {
    assert.ok(authCssCode.includes('grid-template-columns: 1fr 1fr;'), 'Desktop wrapper must be a 2-column grid');
    assert.ok(authCssCode.includes('.welcomePanel {'), 'welcomePanel styles must exist');
    assert.ok(authCssCode.includes('linear-gradient(145deg, #20364a, #416f89)'), 'welcomePanel must preserve its blue brand gradient');
  });

  await t.test('3. Mobile Layout: Single column with form first and welcomePanel below', () => {
    assert.ok(authCssCode.includes('@media (max-width: 840px)'), 'Mobile media query for <= 840px must exist');
    assert.ok(authCssCode.includes('flex-direction: column;'), 'Mobile wrapper must stack vertically');
    assert.ok(authCssCode.includes('order: 1;'), 'formPanel must have order: 1 on mobile');
    assert.ok(authCssCode.includes('order: 2;'), 'welcomePanel must have order: 2 on mobile');
  });

  await t.test('4. Right-side branding section NOT hidden on mobile, copyright visible', () => {
    // Check that welcomePanel p is NOT set to display: none on small screens
    assert.ok(!authCssCode.match(/\.welcomePanel\s+p\s*\{\s*display:\s*none/i), 'welcomePanel paragraph description must NOT be hidden');
    assert.ok(authCssCode.includes('.welcomeBottom {\n    display: block !important;'), 'welcomeBottom copyright must be explicitly visible on mobile');
    assert.ok(authShellCode.includes('© 2026 BrandSense. All rights reserved.'), 'Copyright string must exist inside welcomeBottom');
  });

  await t.test('5. Viewport scrolling and width occupancy', () => {
    assert.ok(authCssCode.includes('max-height: none !important;'), 'Mobile wrapper must remove desktop max-height restrictions');
    assert.ok(authCssCode.includes('width: 100%;'), 'Mobile panels must take 100% available width');
  });

  await t.test('6. Supabase auth fallback: "not configured" does not fail signup/login', () => {
    assert.ok(authClientCode.includes("error.message?.includes('not configured')"), 'auth-client.ts must handle "not configured" gracefully without failing');
    assert.ok(authClientCode.includes("falling back to local persistent store"), 'auth-client.ts must fall back to local store for signup');
    assert.ok(authClientCode.includes("falling back to local user store"), 'auth-client.ts must fall back to local store for signin');
  });
});

