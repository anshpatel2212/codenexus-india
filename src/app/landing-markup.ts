export const landingMarkup = `
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
    </nav>

    <div class="nav-actions">
      <a href="/login" class="login-link">Log in</a>
      <a href="/dashboard" class="btn btn-primary">Get started</a>
    </div>

    <button type="button" class="menu-toggle" id="menuToggle" aria-label="Open menu" aria-expanded="false">&#x2630;</button>
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
          BrandSense reviews your content against your brand guidelines,
          catches inconsistencies, and helps your team publish with confidence.
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
        <div class="preview-glow" aria-hidden="true"></div>

        <div class="product-window" role="region" aria-label="Content review demonstration">
          <div class="window-top">
            <div class="window-dots" aria-hidden="true"><i></i><i></i><i></i></div>
            <div class="window-label">BrandSense &#xb7; Content Review</div>
            <div class="window-label" aria-hidden="true">&#x2022;&#x2022;&#x2022;</div>
          </div>

          <div class="window-content">
            <div class="review-header">
              <div>
                <h2 class="preview-title">Campaign Content Review</h2>
                <p>Summer campaign &#xb7; Social media post</p>
              </div>
              <div class="review-status">Needs review</div>
            </div>

            <div class="content-preview">
              <div class="content-tag">Submitted content</div>
              <h3 class="content-sample-heading">Make every moment extraordinary.</h3>
              <p>
                Discover our latest collection, designed to bring something
                special to your everyday experience.
              </p>
            </div>

            <div class="issue-list" role="list">
              <div class="issue" role="listitem">
                <div class="issue-icon warning" aria-hidden="true">!</div>
                <div class="issue-text">
                  <strong>Tone inconsistency detected</strong>
                  <small>This phrase may not match the approved brand voice.</small>
                </div>
                <div class="issue-label">Medium</div>
              </div>

              <div class="issue" role="listitem">
                <div class="issue-icon warning" aria-hidden="true">!</div>
                <div class="issue-text">
                  <strong>Claim needs verification</strong>
                  <small>Supporting evidence is not available in the brand knowledge base.</small>
                </div>
                <div class="issue-label">Review</div>
              </div>

              <div class="issue" role="listitem">
                <div class="issue-icon success" aria-hidden="true">&#x2713;</div>
                <div class="issue-text">
                  <strong>Terminology check passed</strong>
                  <small>Approved product terminology has been used.</small>
                </div>
                <div class="issue-label" style="color:var(--success)">Passed</div>
              </div>
            </div>

            <div class="preview-footer">
              <span>Review powered by <strong>BrandSense AI</strong></span>
              <span>3 checks completed</span>
            </div>
          </div>
        </div>

        <div class="floating-note" aria-hidden="true">
          <strong>&#x2726; Review complete</strong>
          <span>Evidence-backed suggestions</span>
        </div>
      </div>
    </div>
  </section>

  <!-- BRAND STRIP -->
  <section class="brand-strip" aria-label="Core brand values">
    <div class="container brand-strip-inner">
      <p>Built Around What Matters</p>
      <div class="brand-values">
        <span>Consistency</span>
        <span>Clarity</span>
        <span>Control</span>
        <span>Confidence</span>
      </div>
    </div>
  </section>

  <!-- PROBLEM / SOLUTION -->
  <section class="problem-section" id="problem" aria-labelledby="problem-heading">
    <div class="container">
      <div class="section-heading">
        <div class="eyebrow">The challenge</div>
        <h2 id="problem-heading">
          Great content can still <span class="highlight">miss the mark.</span>
        </h2>
        <p>
          As teams grow, keeping every campaign, document and message aligned
          with brand standards becomes harder.
        </p>
      </div>

      <div class="problem-grid">
        <div class="problem-card before">
          <div class="card-number">01 / Without BrandSense</div>
          <h3>Brand rules get lost between teams.</h3>
          <p>
            Manual reviews, scattered guidelines and inconsistent feedback
            make it difficult to maintain a unified brand voice.
          </p>
          <div class="card-symbol" aria-hidden="true">?</div>
        </div>

        <div class="problem-card after">
          <div class="card-number">02 / With BrandSense</div>
          <h3>One clear standard. Smarter reviews.</h3>
          <p>
            Bring your brand knowledge into one place and review content with
            relevant guidance, explanations and actionable suggestions.
          </p>

          <div class="solution-points">
            <span>&#x2713; Clear guidelines</span>
            <span>&#x2713; Evidence-backed checks</span>
            <span>&#x2713; Human approval</span>
          </div>

          <div class="card-symbol" aria-hidden="true">&#x2713;</div>
        </div>
      </div>
    </div>
  </section>

  <!-- FEATURES -->
  <section class="features-section" id="features" aria-labelledby="features-heading">
    <div class="container features-layout">
      <div class="features-intro">
        <div class="eyebrow">What it does</div>
        <h2 id="features-heading">
          More than a spellcheck.
          <span class="highlight">A brand intelligence layer.</span>
        </h2>
        <p>
          BrandSense understands your approved brand knowledge and helps teams
          identify what needs attention before content goes live.
        </p>
      </div>

      <div class="features-list">
        <div class="feature-card">
          <div class="feature-icon" aria-hidden="true">&#x2318;</div>
          <h3>Brand Knowledge Base</h3>
          <p>
            Keep guidelines, approved facts, terminology and brand assets
            organised in one accessible knowledge base.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon" aria-hidden="true">&#x2733;</div>
          <h3>AI Content Review</h3>
          <p>
            Review text and visual content for tone, terminology, claims and
            alignment with brand standards.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon" aria-hidden="true">&#x25ce;</div>
          <h3>Evidence-backed Findings</h3>
          <p>
            Understand why something was flagged, with relevant guideline
            references and clear explanations.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon" aria-hidden="true">&#x2197;</div>
          <h3>Intent-preserving Suggestions</h3>
          <p>
            Get practical recommendations that improve brand alignment without
            losing the creator&#x2019;s original purpose.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon" aria-hidden="true">&#x25a3;</div>
          <h3>Review &amp; Approvals</h3>
          <p>
            Collaborate through comments, suggested changes and structured
            human approval workflows.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon" aria-hidden="true">&#x2301;</div>
          <h3>Brand Insights</h3>
          <p>
            Identify recurring issues and unclear guidelines to improve
            consistency across future content.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- WORKFLOW -->
  <section class="workflow-section" id="workflow" aria-labelledby="workflow-heading">
    <div class="container">
      <div class="section-heading">
        <div class="eyebrow">The workflow</div>
        <h2 id="workflow-heading">
          From brand knowledge to
          <span class="highlight">confident publishing.</span>
        </h2>
        <p>
          A simple review process that supports creators, reviewers and brand
          administrators.
        </p>
      </div>

      <div class="workflow">
        <div class="step">
          <div class="step-number" aria-hidden="true">01</div>
          <h3>Set up your brand</h3>
          <p>Add approved guidelines, facts, terminology and reusable assets.</p>
        </div>

        <div class="step">
          <div class="step-number" aria-hidden="true">02</div>
          <h3>Submit your content</h3>
          <p>Upload or submit content for a structured brand compliance review.</p>
        </div>

        <div class="step">
          <div class="step-number" aria-hidden="true">03</div>
          <h3>Review AI findings</h3>
          <p>Understand issues, explore evidence and consider suggested fixes.</p>
        </div>

        <div class="step">
          <div class="step-number" aria-hidden="true">04</div>
          <h3>Approve with confidence</h3>
          <p>Reviewers make the final decision and keep a record of changes.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- TRUST -->
  <section class="trust-section" id="trust" aria-labelledby="trust-heading">
    <div class="container trust-grid">
      <div class="trust-copy">
        <div class="eyebrow">Built on trust</div>
        <h2 id="trust-heading">
          AI should guide your decisions.
          <span style="color:var(--yellow)">Not replace them.</span>
        </h2>
        <p>
          BrandSense is designed to make reviews more transparent.
          Every finding should be understandable, grounded in approved brand
          knowledge and open to human judgement.
        </p>
      </div>

      <div class="trust-list">
        <div class="trust-item">
          <div class="trust-check" aria-hidden="true">&#x2713;</div>
          <div>
            <h3>Evidence-first reviews</h3>
            <p>
              Findings are connected to relevant brand guidance instead of
              relying on unsupported assumptions.
            </p>
          </div>
        </div>

        <div class="trust-item">
          <div class="trust-check" aria-hidden="true">&#x2713;</div>
          <div>
            <h3>Transparent explanations</h3>
            <p>
              See what was flagged, why it matters and which guidance supports
              the recommendation.
            </p>
          </div>
        </div>

        <div class="trust-item">
          <div class="trust-check" aria-hidden="true">&#x2713;</div>
          <div>
            <h3>Human-controlled approvals</h3>
            <p>
              AI provides suggestions. People remain responsible for accepting
              changes and approving content.
            </p>
          </div>
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
          A smarter way to review content, protect brand consistency and help
          teams publish with confidence.
        </p>
      </div>

      <nav class="footer-links" aria-label="Footer navigation">
        <div class="footer-column">
          <h3>Explore</h3>
          <a href="#problem">Why BrandSense</a>
          <a href="#features">Features</a>
          <a href="#workflow">How it works</a>
        </div>

        <div class="footer-column">
          <h3>Platform</h3>
          <a href="#trust">Trust &amp; Safety</a>
          <a href="/dashboard">App Dashboard</a>
          <a href="/knowledge">Knowledge Base</a>
        </div>

        <div class="footer-column">
          <h3>Legal</h3>
          <a href="/settings">SOC2 Compliance</a>
          <a href="/settings">Responsible AI</a>
          <a href="/privacy">Privacy Policy</a>
        </div>
      </nav>
    </div>

    <div class="footer-bottom">
      <span>&#xa9; <span id="year"></span> BrandSense. All rights reserved.</span>
      <span>Built for better brand consistency.</span>
    </div>
  </div>
</footer>
`;
