export const landingMarkup = `
<a href="#main-content" class="skip-link">Skip to main content</a>

<!-- NAVBAR -->
<header class="navbar" id="home" role="banner">
  <div class="container nav-inner">
    <a href="#home" class="logo" aria-label="BrandSense home">
      <div class="logo-mark" aria-hidden="true">B</div>
      <span>BrandSense</span>
    </a>

    <nav class="nav-links" id="navLinks" aria-label="Primary navigation">
      <a href="#problem">The problem</a>
      <a href="#features">Platform</a>
      <a href="#workflow">How it works</a>
      <a href="#trust">Why BrandSense</a>
      <div class="nav-mobile-actions">
        <a href="/signup" class="btn btn-primary">Get started</a>
        <a href="/login" class="login-link">Log in</a>
      </div>
    </nav>

    <div class="nav-actions">
      <a href="/login" class="login-link">Log in</a>
      <a href="/signup" class="btn btn-primary">Get started</a>
    </div>

    <button type="button" class="menu-toggle" id="menuToggle" aria-label="Open menu" aria-expanded="false" aria-controls="navLinks">&#x2630;</button>
  </div>
</header>

<main id="main-content">
  <!-- HERO -->
  <section class="hero" aria-labelledby="hero-heading">
    <div class="container hero-grid">
      <div class="hero-copy">
        <div class="hero-badge">
          <span class="pulse-dot" aria-hidden="true"></span>
          AI-powered brand intelligence
        </div>

        <h1 id="hero-heading">
          Your brand deserves <span>consistency.</span> Every time.
        </h1>

        <p class="hero-description">
          BrandSense checks your content against your brand rules, finds issues and helps your team publish with confidence.
        </p>

        <div class="hero-buttons">
          <a href="#get-started" class="btn btn-primary">
            Explore BrandSense
            <span aria-hidden="true">&#x2197;</span>
          </a>
          <a href="#workflow" class="btn btn-outline">
            See how it works
            <span aria-hidden="true">&#x2192;</span>
          </a>
        </div>

        <div class="hero-note">
          <span aria-hidden="true">&#x2713;</span>
          AI-powered suggestions. Human-controlled decisions.
        </div>
      </div>

      <div class="preview-wrap">
        <div class="product-window" role="region" aria-label="BrandSense product preview">
          <div class="window-topbar">
            <div class="window-dots" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="window-title">BrandSense · Content Review</div>
            <div class="window-actions" aria-hidden="true">···</div>
          </div>

          <div class="window-content">
            <div class="review-header">
              <div class="review-title">
                <h2>Product Launch Announcement</h2>
                <p>Social Media · LinkedIn Post · Draft v2</p>
              </div>
              <div class="review-score">
                <span>82%</span>
                <small>Compliance score</small>
              </div>
            </div>

            <div class="content-preview">
              <h3>Content under review</h3>
              <p>
                Introducing our revolutionery new analytics platform. We guarantee
                a 50% increase in productivity within two weeks. Our team has worked
                unbelievably hard to bring this game-changing solution to market.
              </p>
            </div>

            <div class="issues-list" aria-label="Identified brand issues">
              <div class="issue-item">
                <span class="badge-flag" aria-hidden="true">!</span>
                <div class="issue-text">
                  <strong>Typo: &ldquo;revolutionery&rdquo;</strong>
                  <small>Spelling error · Brand Voice Guidelines</small>
                </div>
                <span class="issue-fix">revolutionary</span>
              </div>

              <div class="issue-item">
                <span class="badge-flag" aria-hidden="true">!</span>
                <div class="issue-text">
                  <strong>Unsubstantiated claim: &ldquo;guarantee 50% increase&rdquo;</strong>
                  <small>Claim Substantiation · Rule #14</small>
                </div>
                <span class="issue-fix">can improve</span>
              </div>

              <div class="issue-item">
                <span class="badge-flag" aria-hidden="true">!</span>
                <div class="issue-text">
                  <strong>Exaggerated tone: &ldquo;unbelievably hard&rdquo;</strong>
                  <small>Tone of Voice · Professional Tone Rule</small>
                </div>
                <span class="issue-fix">diligently</span>
              </div>
            </div>

            <div class="preview-footer">
              <span class="fix-count">3 suggestions available</span>
              <button type="button" class="btn btn-sm btn-primary">Apply all</button>
            </div>
          </div>
        </div>

        <div class="floating-note" aria-hidden="true">
          <div class="floating-icon">✓</div>
          <div>
            <div><strong>98% accuracy</strong></div>
            <div class="text-sm">in rule detection</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- BRAND STRIP -->
  <section class="brand-strip" aria-label="Platform capabilities">
    <div class="container">
      <div class="brand-strip-inner">
        <span>Trusted principles built for real teams:</span>
        <div class="brand-values">
          <span class="value-item">Consistency first</span>
          <span class="value-item">Speed without shortcuts</span>
          <span class="value-item">Evidence-backed reviews</span>
          <span class="value-item">Human-in-the-loop</span>
        </div>
      </div>
    </div>
  </section>

  <!-- THE PROBLEM -->
  <section class="problem-section" id="problem" aria-labelledby="problem-heading">
    <div class="container">
      <div class="section-heading">
        <div class="eyebrow">The challenge</div>
        <h2 id="problem-heading">Why brand consistency is hard to scale</h2>
        <p>
          As organizations grow, keeping every piece of communication on-brand
          becomes a major operational challenge.
        </p>
      </div>

      <div class="problem-grid">
        <article class="problem-card">
          <div class="problem-icon" aria-hidden="true">&#x26A0;</div>
          <h3>Brand guidelines get ignored</h3>
          <p>
            Teams create 60-page PDF guidelines that sit in shared drives.
            Creators rarely read them, and nobody has time to check every post
            manually.
          </p>
        </article>

        <article class="problem-card">
          <div class="problem-icon" aria-hidden="true">&#x23F1;</div>
          <h3>Manual review is slow</h3>
          <p>
            Content sits in review queues for days. Approvers are overwhelmed,
            bottlenecks form, and publishing deadlines get missed regularly.
          </p>
        </article>

        <article class="problem-card">
          <div class="problem-icon" aria-hidden="true">&#x21C4;</div>
          <h3>Inconsistent feedback</h3>
          <p>
            Different reviewers give different feedback. What one editor approves,
            another rejects. Creators get confused and brand trust erodes over
            time.
          </p>
        </article>
      </div>
    </div>
  </section>

  <!-- FEATURES / PLATFORM -->
  <section class="features-section" id="features" aria-labelledby="features-heading">
    <div class="container">
      <div class="features-layout">
        <div class="features-intro">
          <div class="eyebrow">The platform</div>
          <h2 id="features-heading">Everything you need to govern brand output</h2>
          <p>
            BrandSense gives marketing leaders, brand managers, and content
            creators a unified workspace to enforce brand rules automatically.
          </p>
          <a href="#workflow" class="btn btn-outline" style="margin-top:20px;">
            See the workflow
            <span aria-hidden="true">&#x2192;</span>
          </a>
        </div>

        <div class="features-list">
          <article class="feature-card">
            <div class="feature-card-icon" aria-hidden="true">&#x2699;</div>
            <h3>Custom Rule Engine</h3>
            <p>
              Define rules for tone, terminology, claims, and style. Set severity
              levels and categorize by channel or content type.
            </p>
          </article>

          <article class="feature-card">
            <div class="feature-card-icon" aria-hidden="true">&#x2728;</div>
            <h3>AI-Assisted Suggestions</h3>
            <p>
              When an issue is flagged, BrandSense suggests specific, on-brand
              alternatives that preserve the writer&rsquo;s original intent.
            </p>
          </article>

          <article class="feature-card">
            <div class="feature-card-icon" aria-hidden="true">&#x1F4CA;</div>
            <h3>Compliance Scoring</h3>
            <p>
              Every piece of content receives a clear compliance score based on
              your rules. Track scores across teams and channels over time.
            </p>
          </article>

          <article class="feature-card">
            <div class="feature-card-icon" aria-hidden="true">&#x1F512;</div>
            <h3>Review Workflows</h3>
            <p>
              Route content through approval stages. Maintain an audit trail of who
              checked what, when it was approved, and why changes were made.
            </p>
          </article>
        </div>
      </div>
    </div>
  </section>

  <!-- WORKFLOW -->
  <section class="workflow-section" id="workflow" aria-labelledby="workflow-heading">
    <div class="container">
      <div class="section-heading">
        <div class="eyebrow">How it works</div>
        <h2 id="workflow-heading">Four steps to consistent brand communication</h2>
        <p>A simple, transparent process that fits into your existing content workflow.</p>
      </div>

      <div class="workflow">
        <div class="step">
          <div class="step-num">1</div>
          <h3>Define guidelines</h3>
          <p>
            Upload your existing brand guide or set up rules for tone, terms, and
            claims using our intuitive rule builder.
          </p>
        </div>

        <div class="step">
          <div class="step-num">2</div>
          <h3>Submit content</h3>
          <p>
            Paste draft copy, upload documents, or integrate directly with your
            CMS and social scheduling tools.
          </p>
        </div>

        <div class="step">
          <div class="step-num">3</div>
          <h3>Get instant feedback</h3>
          <p>
            BrandSense highlights issues in real time, explains which rule is
            violated, and provides on-brand rewrite suggestions.
          </p>
        </div>

        <div class="step">
          <div class="step-num">4</div>
          <h3>Publish with confidence</h3>
          <p>
            Accept suggestions, request reviewer sign-off if needed, and publish
            knowing your content represents your brand faithfully.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- WHY BRANDSENSE / TRUST -->
  <section class="trust-section" id="trust" aria-labelledby="trust-heading">
    <div class="container">
      <div class="section-heading">
        <div class="eyebrow">Why BrandSense</div>
        <h2 id="trust-heading">Built for quality, designed for teams</h2>
        <p>We believe technology should empower creators, not replace their judgement.</p>
      </div>

      <div class="trust-grid">
        <div class="trust-item">
          <div class="trust-icon" aria-hidden="true">&#x1F441;</div>
          <h3>Transparent reasoning</h3>
          <p>
            No black boxes. BrandSense always tells you which specific rule was
            triggered and why. Your team stays in control of every editorial
            decision.
          </p>
        </div>

        <div class="trust-item">
          <div class="trust-icon" aria-hidden="true">&#x1F3AF;</div>
          <h3>Accurate detection</h3>
          <p>
            Trained to catch subtle brand-voice drifts, unsupported claims, and
            prohibited terminology with high precision and low false-positive
            rates.
          </p>
        </div>

        <div class="trust-item">
          <div class="trust-icon" aria-hidden="true">&#x1F6E1;</div>
          <h3>Enterprise ready</h3>
          <p>
            Role-based permissions, custom rule libraries, audit logs, and
            dedicated workspaces keep your brand governance secure and
            organized.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="cta-section" id="get-started" aria-labelledby="cta-heading">
    <div class="container">
      <div class="cta-box">
        <div class="eyebrow">Make every message count</div>
        <h2 id="cta-heading">
          Keep your brand consistent.
          <span class="highlight">Keep your team confident.</span>
        </h2>
        <p>
          Bring your brand knowledge and content review process together with
          BrandSense.
        </p>
        <a href="mailto:hello@brandsense.ai" class="btn btn-primary">
          Get in touch
          <span aria-hidden="true">&#x2197;</span>
        </a>
      </div>
    </div>
  </section>
</main>

<!-- FOOTER -->
<footer role="contentinfo">
  <div class="container">
    <div class="footer-top">
      <div class="footer-brand">
        <a href="#home" class="logo" aria-label="BrandSense home">
          <div class="logo-mark" aria-hidden="true">B</div>
          <span>BrandSense</span>
        </a>
        <p>
          AI-powered brand consistency intelligence for teams that care about
          how they communicate.
        </p>
      </div>

      <div class="footer-links">
        <div class="footer-col">
          <h4>Platform</h4>
          <a href="#features">Rule Engine</a>
          <a href="#workflow">Suggestions</a>
          <a href="#features">Compliance Scoring</a>
          <a href="/dashboard">App Dashboard</a>
        </div>

        <div class="footer-col">
          <h4>Resources</h4>
          <a href="#workflow">How It Works</a>
          <a href="#trust">Why BrandSense</a>
          <a href="/terms">Terms of Service</a>
          <a href="/privacy">Privacy Policy</a>
        </div>

        <div class="footer-col">
          <h4>Contact</h4>
          <a href="mailto:hello@brandsense.ai">hello@brandsense.ai</a>
          <a href="#home">Back to top &#x2191;</a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <div>&copy; <span id="year">2026</span> BrandSense. All rights reserved.</div>
      <div>Designed with care for brand-conscious organizations.</div>
    </div>
  </div>
</footer>
`;
