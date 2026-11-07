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
<<<<<<< HEAD
      <div class="nav-mobile-actions">
        <a href="/signup" class="btn btn-primary">Get started</a>
        <a href="/login" class="login-link">Log in</a>
      </div>
=======
      <a href="/login" class="mobile-only-nav-item">Log in</a>
      <a href="/dashboard" class="mobile-only-nav-item mobile-get-started">Get started &rarr;</a>
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8
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
<<<<<<< HEAD
        <div class="product-window" role="region" aria-label="BrandSense product preview">
          <div class="window-topbar">
            <div class="window-dots" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="window-title">BrandSense · Content Review</div>
            <div class="window-actions" aria-hidden="true">···</div>
=======
        <div class="preview-glow" aria-hidden="true"></div>

        <div class="product-window" role="region" aria-label="Content review demonstration">
          <div class="window-top">
            <div class="window-dots" aria-hidden="true"><i></i><i></i><i></i></div>
            <div class="window-label">BrandSense &#xb7; Content Review</div>
            <div class="window-label" aria-hidden="true">&#x2022;&#x2022;&#x2022;</div>
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8
          </div>

          <div class="window-content">
            <div class="review-header">
<<<<<<< HEAD
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
=======
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
                Explore our latest collection and make every day more special.
              </p>
            </div>

            <div class="issue-list" role="list">
              <div class="issue" role="listitem">
                <div class="issue-icon warning" aria-hidden="true">!</div>
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8
                <div class="issue-text">
                  <strong>Typo: &ldquo;revolutionery&rdquo;</strong>
                  <small>Spelling error · Brand Voice Guidelines</small>
                </div>
<<<<<<< HEAD
                <span class="issue-fix">revolutionary</span>
              </div>

              <div class="issue-item">
                <span class="badge-flag" aria-hidden="true">!</span>
=======
                <div class="issue-label">Medium</div>
              </div>

              <div class="issue" role="listitem">
                <div class="issue-icon warning" aria-hidden="true">!</div>
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8
                <div class="issue-text">
                  <strong>Unsubstantiated claim: &ldquo;guarantee 50% increase&rdquo;</strong>
                  <small>Claim Substantiation · Rule #14</small>
                </div>
<<<<<<< HEAD
                <span class="issue-fix">can improve</span>
              </div>

              <div class="issue-item">
                <span class="badge-flag" aria-hidden="true">!</span>
=======
                <div class="issue-label">Review</div>
              </div>

              <div class="issue" role="listitem">
                <div class="issue-icon success" aria-hidden="true">&#x2713;</div>
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8
                <div class="issue-text">
                  <strong>Exaggerated tone: &ldquo;unbelievably hard&rdquo;</strong>
                  <small>Tone of Voice · Professional Tone Rule</small>
                </div>
<<<<<<< HEAD
                <span class="issue-fix">diligently</span>
=======
                <div class="issue-label success">Passed</div>
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8
              </div>
            </div>

            <div class="preview-footer">
              <span class="fix-count">3 suggestions available</span>
              <button type="button" class="btn btn-sm btn-primary">Apply all</button>
            </div>
          </div>
        </div>

        <div class="floating-note" aria-hidden="true">
<<<<<<< HEAD
          <div class="floating-icon">✓</div>
          <div>
            <div><strong>98% accuracy</strong></div>
            <div class="text-sm">in rule detection</div>
          </div>
=======
          <strong>&#x2726; Review complete</strong>
          <span>Evidence-backed suggestions</span>
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8
        </div>
      </div>
    </div>
  </section>

  <!-- BRAND STRIP -->
<<<<<<< HEAD
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
=======
  <section class="brand-strip" aria-label="Core brand values">
    <div class="container brand-strip-inner">
      <p>Built Around What Matters</p>
      <div class="brand-values">
        <span>Consistency</span>
        <span>Clarity</span>
        <span>Control</span>
        <span>Confidence</span>
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8
      </div>
    </div>
  </section>

<<<<<<< HEAD
  <!-- THE PROBLEM -->
=======
  <!-- PROBLEM / SOLUTION -->
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8
  <section class="problem-section" id="problem" aria-labelledby="problem-heading">
    <div class="container">
      <div class="section-heading">
        <div class="eyebrow">The challenge</div>
<<<<<<< HEAD
        <h2 id="problem-heading">Why brand consistency is hard to scale</h2>
        <p>
          As organizations grow, keeping every piece of communication on-brand
          becomes a major operational challenge.
=======
        <h2 id="problem-heading">
          Great content can still <span class="highlight">miss the mark.</span>
        </h2>
        <p>
          As your team grows, it gets harder to keep every campaign, document and message on brand.
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8
        </p>
      </div>

      <div class="problem-grid">
<<<<<<< HEAD
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
=======
        <div class="problem-card before">
          <div class="card-number">01 / Without BrandSense</div>
          <h3>Brand rules get lost between teams.</h3>
          <p>
            Manual reviews, scattered guidelines and mixed feedback make it hard to keep one clear brand voice.
          </p>
          <div class="card-symbol" aria-hidden="true">?</div>
        </div>

        <div class="problem-card after">
          <div class="card-number">02 / With BrandSense</div>
          <h3>One clear standard. Smarter reviews.</h3>
          <p>
            Keep your brand knowledge in one place. Review content with clear guidance and useful suggestions.
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8
          </p>
        </article>

<<<<<<< HEAD
        <article class="problem-card">
          <div class="problem-icon" aria-hidden="true">&#x21C4;</div>
          <h3>Inconsistent feedback</h3>
          <p>
            Different reviewers give different feedback. What one editor approves,
            another rejects. Creators get confused and brand trust erodes over
            time.
          </p>
        </article>
=======
          <div class="solution-points">
            <span>&#x2713; Clear guidelines</span>
            <span>&#x2713; Evidence-backed checks</span>
            <span>&#x2713; Human approval</span>
          </div>

          <div class="card-symbol" aria-hidden="true">&#x2713;</div>
        </div>
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8
      </div>
    </div>
  </section>

<<<<<<< HEAD
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
=======
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
          BrandSense uses your approved brand rules to find issues before your content goes live.
        </p>
      </div>

      <div class="features-list">
        <div class="feature-card">
          <div class="feature-icon" aria-hidden="true">&#x2318;</div>
          <h3>Brand Knowledge Base</h3>
          <p>
            Keep your guidelines, approved facts, key terms and brand assets in one place.
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8
          </p>
          <a href="#workflow" class="btn btn-outline" style="margin-top:20px;">
            See the workflow
            <span aria-hidden="true">&#x2192;</span>
          </a>
        </div>

<<<<<<< HEAD
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
=======
        <div class="feature-card">
          <div class="feature-icon" aria-hidden="true">&#x2733;</div>
          <h3>AI Content Review</h3>
          <p>
            Check text and images for tone, key terms, claims and brand fit.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon" aria-hidden="true">&#x25ce;</div>
          <h3>Evidence-backed Findings</h3>
          <p>
            See why content was flagged and which brand rules explain the issue.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon" aria-hidden="true">&#x2197;</div>
          <h3>Intent-preserving Suggestions</h3>
          <p>
            Get clear tips to match your brand while keeping the creator&#x2019;s original idea.
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
            Find common issues and unclear rules to keep future content consistent.
          </p>
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8
        </div>
      </div>
    </div>
  </section>

  <!-- WORKFLOW -->
  <section class="workflow-section" id="workflow" aria-labelledby="workflow-heading">
    <div class="container">
      <div class="section-heading">
<<<<<<< HEAD
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
=======
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

      <div class="workflow" role="list">
        <div class="step" role="listitem">
          <div class="step-number" aria-hidden="true">01</div>
          <h3>Set up your brand</h3>
          <p>Add approved guidelines, facts, terminology and reusable assets.</p>
        </div>

        <div class="step" role="listitem">
          <div class="step-number" aria-hidden="true">02</div>
          <h3>Submit your content</h3>
          <p>Upload or submit content for a structured brand compliance review.</p>
        </div>

        <div class="step" role="listitem">
          <div class="step-number" aria-hidden="true">03</div>
          <h3>Review AI findings</h3>
          <p>Understand issues, explore evidence and consider suggested fixes.</p>
        </div>

        <div class="step" role="listitem">
          <div class="step-number" aria-hidden="true">04</div>
          <h3>Approve with confidence</h3>
          <p>Reviewers make the final decision and keep a record of changes.</p>
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8
        </div>
      </div>
    </div>
  </section>

<<<<<<< HEAD
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
=======
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
          BrandSense makes reviews clear and easy to follow. Every finding is based on approved brand rules, with people making the final decisions.
        </p>
      </div>

      <div class="trust-list" role="list">
        <div class="trust-item" role="listitem">
          <div class="trust-check" aria-hidden="true">&#x2713;</div>
          <div>
            <h3>Evidence-first reviews</h3>
            <p>
              Findings are connected to relevant brand guidance instead of
              relying on unsupported assumptions.
            </p>
          </div>
        </div>

        <div class="trust-item" role="listitem">
          <div class="trust-check" aria-hidden="true">&#x2713;</div>
          <div>
            <h3>Transparent explanations</h3>
            <p>
              See what was flagged, why it matters and which guidance supports
              the recommendation.
            </p>
          </div>
        </div>

        <div class="trust-item" role="listitem">
          <div class="trust-check" aria-hidden="true">&#x2713;</div>
          <div>
            <h3>Human-controlled approvals</h3>
            <p>
              AI provides suggestions. People remain responsible for accepting
              changes and approving content.
            </p>
          </div>
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8
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

<<<<<<< HEAD
      <div class="footer-links">
        <div class="footer-col">
          <h4>Platform</h4>
          <a href="#features">Rule Engine</a>
          <a href="#workflow">Suggestions</a>
          <a href="#features">Compliance Scoring</a>
=======
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
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8
          <a href="/dashboard">App Dashboard</a>
        </div>

<<<<<<< HEAD
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
=======
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
      <span style="display:inline-flex;align-items:center;flex-wrap:wrap;gap:6px;">
        <span>Made with <span style="color:#E05252">&#x2764;&#xfe0f;</span> by <strong style="color:#ffffff">Team Timepass</strong></span>
        <span style="opacity:0.5">&bull;</span>
        <span style="color:#d5e3ec">Ansh Patel &middot; Prince Patel &middot; Smit Patel &middot; Dwij Patel</span>
      </span>
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8
    </div>
  </div>
</footer>
`;
