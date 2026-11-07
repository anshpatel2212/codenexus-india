import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const markupContent = fs.readFileSync(path.resolve('src/app/landing-markup.ts'), 'utf8');
const cssContent = fs.readFileSync(path.resolve('src/app/landing.css'), 'utf8');
const pageContent = fs.readFileSync(path.resolve('src/app/page.tsx'), 'utf8');
const authCssContent = fs.readFileSync(path.resolve('src/components/auth/AuthShell.module.css'), 'utf8');

test('Navbar Responsiveness & Mobile Menu Action Buttons Suite', async (t) => {
  await t.test('1. Desktop navbar contains visible Log in and Get started buttons', () => {
    assert.match(
      markupContent,
      /<div class="nav-actions">[\s\S]*?<a href="\/login" class="login-link">Log in<\/a>[\s\S]*?<a href="\/signup" class="btn btn-primary">Get started<\/a>[\s\S]*?<\/div>/
    );
  });

  await t.test('2. Mobile navigation drawer contains Log in and Get started buttons', () => {
    assert.match(
      markupContent,
      /<nav class="nav-links" id="navLinks"[\s\S]*?<div class="nav-mobile-actions">[\s\S]*?<a href="\/signup" class="btn btn-primary">Get started<\/a>[\s\S]*?<a href="\/login" class="login-link">Log in<\/a>[\s\S]*?<\/div>[\s\S]*?<\/nav>/
    );
  });

  await t.test('3. Log in routes correctly to /login and Get started routes to /signup', () => {
    const loginMatches = markupContent.match(/href="\/login"/g);
    assert.ok(loginMatches && loginMatches.length >= 2, 'Must have at least 2 login links (desktop + mobile)');

    const signupMatches = markupContent.match(/href="\/signup"/g);
    assert.ok(signupMatches && signupMatches.length >= 2, 'Must have at least 2 signup links (desktop + mobile)');
  });

  await t.test('4. Desktop base CSS hides mobile actions to prevent duplicate rendering', () => {
    assert.match(cssContent, /\.nav-mobile-actions\s*\{\s*display:\s*none;?\s*\}/);
  });

  await t.test('5. Responsive breakpoint covers tablet portrait and mobile (<= 768px, 425px, 375px, 320px)', () => {
    assert.match(cssContent, /@media\s*\(max-width:\s*768px\)/);
    assert.match(cssContent, /\.nav-links\.active\s*\{\s*display:\s*flex;?\s*\}/);
    assert.match(cssContent, /\.nav-mobile-actions\s*\{\s*display:\s*flex;/);
  });

  await t.test('6. Mobile buttons have proper touch dimensions and white text on primary button', () => {
    assert.match(cssContent, /\.nav-mobile-actions\s+\.login-link\s*\{[\s\S]*?min-height:\s*44px;/);
    assert.match(cssContent, /\.nav-mobile-actions\s+\.btn[\s\S]*?min-height:\s*44px;/);
    assert.match(cssContent, /\.nav-mobile-actions\s+\.btn[\s\S]*?color:\s*#ffffff\s*!important;/);
  });

  await t.test('7. Menu drawer has positioning, z-index, and scroll overflow protection', () => {
    assert.match(cssContent, /z-index:\s*999;/);
    assert.match(cssContent, /max-height:\s*calc\(100vh\s*-\s*70px\);/);
    assert.match(cssContent, /overflow-y:\s*auto;/);
  });

  await t.test('8. Sub-links scoping avoids CSS conflict with buttons (.nav-links > a)', () => {
    assert.match(cssContent, /\.nav-links\s*>\s*a\s*\{/);
  });

  await t.test('9. Menu interaction in page.tsx supports click toggle, escape key, link click, and outside click', () => {
    assert.match(pageContent, /menuToggle\.addEventListener\('click',\s*toggleMenu\)/);
    assert.match(pageContent, /document\.addEventListener\('keydown',\s*handleKeyDown\)/);
    assert.match(pageContent, /document\.addEventListener\('click',\s*handleClickOutside\)/);
    assert.match(pageContent, /links\.forEach\(\(link\)\s*=>\s*link\.addEventListener\('click'/);
  });

  await t.test('10. Mobile login layout is column-oriented and centered with no horizontal squeeze', () => {
    assert.match(authCssContent, /\.main\s*\{[\s\S]*?flex-direction:\s*column;/);
    assert.match(authCssContent, /\.loginMain\s*\{[\s\S]*?flex-direction:\s*column;/);
    assert.match(authCssContent, /\.formOptions\s*\{[\s\S]*?flex-wrap:\s*wrap;/);
    assert.match(authCssContent, /\.pageLogin\s*\.welcomePanel\s*\{\s*display:\s*none;?\s*\}/);
  });
});
