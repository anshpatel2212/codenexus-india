<div align="center">

# 🚀 BRANDSense

### Autonomous Enterprise Brand Governance, Dual-Pass AI Verification & Real-Time Content Compliance Platform

<p>
  <a href="https://brandsense-web.onrender.com"><img src="https://img.shields.io/badge/Live_Production-brandsense--web-46E3B7?style=for-the-badge&logo=render&logoColor=black" alt="Live Production Demo" /></a>
  <a href="https://github.com/anshpatel2212/codenexus-india/actions"><img src="https://img.shields.io/badge/Test_Suite-100%25_Passing-brightgreen?style=for-the-badge&logo=githubactions&logoColor=white" alt="Test Suite" /></a>
  <a href="https://github.com/anshpatel2212/codenexus-india/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" /></a>
</p>

<p>
  <img src="https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python_3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python 3.11+" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/SQLite_WAL-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite WAL" />
  <img src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=black" alt="Render" />
</p>

<p>
  <a href="#-overview">Overview</a> •
  <a href="#-round-3-major-innovations">Round 3 Innovations</a> •
  <a href="#-core-platform-features">Core Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-role-based-access-control-rbac">RBAC & Workflows</a> •
  <a href="#-api-endpoints">API Reference</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-environment-variables">Environment Variables</a> •
  <a href="#-authors">Authors</a>
</p>

</div>

---

## 📖 Overview

**BrandSense** is an enterprise-grade AI brand governance platform that automates brand compliance, editorial voice alignment, and legal safety across all marketing, social, and institutional communications before publication.

Powered by a hybrid architecture—**Next.js 16 (App Router)** frontend, an asynchronous **FastAPI** neural backend, and dual **Supabase/SQLite WAL** data persistence—BrandSense enforces institutional knowledge rules, flags non-compliant claims with evidentiary quotes, generates intent-preserving rewrites, and maintains a strict audit trail across multiple organizational tenants.

---

## 🌟 Round 3 Major Innovations

### 1. Dual-Pass AI Verification & Grounded Confidence Scoring
- **Pass 1 (Generative Heuristic Extraction)**: Scans submitted copy across multiple guideline categories (Tone, Terminology, Legal Claims, Banned Buzzwords).
- **Pass 2 (Auditing Verification Engine)**: Each finding undergoes independent verification (`run_second_verification_pass`). Validates exact quotation against source text, checks policy citations against active organization rules, drops hallucinated findings, and automatically routes ambiguous or low-confidence assertions to human reviewers (`escalated_to_human = 1`).
- **30+40+30 Grounded Confidence Formula**:
  $$\text{Confidence} = 30\% \times \text{Evidence Match} + 40\% \times \text{Rule Grounding} + 30\% \times \text{Contextual Relevance}$$
  Every finding outputs a verifiable score ($0\text{–}100\%$) alongside audit notes.

### 2. Multi-Format Native Document Review
- **Direct PDF, DOCX, TXT, & Markdown Extraction**: Upload raw files directly without third-party cloud converters.
  - **PDF Extraction**: Server-side page-by-page streaming with `pypdf`.
  - **DOCX Extraction**: Pure-Python XML parsing via `zipfile` and `xml.etree.ElementTree`.
  - **Text & Markdown**: Line offset tracking with metadata extraction.
- **Contextual Anchoring**: Every finding links to exact document metadata (`sourceDocument`, `sourcePage`, `sourceSection`, `evidenceQuote`).

### 3. Intent-Preserving Rewrites & Tracked Changes Diff View
- **Fact-Preserving Reformulations**: Removes non-compliant hyperbolic claims (e.g., *"guarantees 100% elimination of fines"*) while rigorously preserving key product names, dates, quantitative metrics, and core brand message.
- **Dynamic Intent Preservation Score**: Computes empirical word and key fact retention ratio ($>75\%$ threshold).
- **Interactive Tracked Changes**: View changes in either **Side-by-Side** comparison or **Tracked Changes Diff** (red strikethrough for deleted text, bold green for compliant replacements).
- **Per-Suggestion Granular Controls**: Accept, reject, or modify individual suggestions in real-time with instant copy recalculation.

### 4. Real Governance Analytics & Friction Index
- **Live Database Aggregations**: `/insights/governance` queries SQLite/Postgres across real submission histories.
- **Repeated Violation Tracker**: Identifies recurring non-compliant patterns across organizational channels.
- **Override Frequency Analysis**: Surfaces rules frequently rejected by human reviewers to highlight organizational policy friction.
- **Unclear Guidelines Friction Index**: Automatically diagnoses ambiguous guidelines causing review bottlenecks and suggests remediation actions.

### 5. Review Revision History & One-Click Rollback
- Tracks every modification, accepted fix, or manual edit as an immutable revision record with diff summaries and author attribution.
- Supports instant one-click rollback to any historical revision, recalculating compliance scores automatically.

### 6. Conversational SENSA AI Assistant
- Completely eliminated static repetitive responses.
- Supports multi-turn conversational context, natural greetings, brand voice guidance, approved facts retrieval, and institutional rule explanations.

---

## 🧰 Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 16.4 (App Router)** | TypeScript 5.4, Server & Client Components, Responsive UI |
| **Styling & Design System** | **Tailwind CSS 3.4** | Accessible palettes (`#20364A`, `#315C74`, `#416F89`, `#1F7560`, `#9A682D`, `#A94842`, `#C4D5E0`), Mobile-First Shell |
| **Backend API** | **FastAPI 0.110 (Python 3.11+)** | Asynchronous routers, Pydantic v2 schemas, JWT guards |
| **Document Processing** | **pypdf 5.0+ & xml.etree** | Pure-Python PDF & DOCX stream extraction |
| **AI / LLM Integration** | **Google Gemini, OpenAI, Claude** | Multi-model fallback, multi-turn chat, deterministic RAG |
| **Data Persistence** | **SQLite WAL & Supabase** | High-concurrency local WAL mode, Row-Level Security (RLS) |
| **Deployment** | **Render & Firebase Hosting** | Automated blueprints via `render.yaml`, ephemeral-safe database self-healing |

---

## 🏗️ Architecture

```
                                  ┌─────────────────────────────┐
                                  │      Next.js 16 Web App     │
                                  │  (Responsive Desktop/Mobile)│
                                  └──────────────┬──────────────┘
                                                 │
                                                 │ HTTPS / JSON / FormData
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │    FastAPI Neural Backend   │
                                  │   (JWT Guard, RBAC, Routers)│
                                  └──────────────┬──────────────┘
                                                 │
               ┌─────────────────────────────────┼─────────────────────────────────┐
               ▼                                 ▼                                 ▼
   ┌───────────────────────┐         ┌───────────────────────┐         ┌───────────────────────┐
   │  AI Review Engine     │         │   Document Extractor  │         │   SENSA Assistant     │
   │  • Pass 1: Detection  │         │  • pypdf Stream (PDF) │         │  • Multi-Turn Context │
   │  • Pass 2: Audit Pass │         │  • XML Parser (DOCX)  │         │  • Grounded RAG       │
   │  • 30/40/30 Scoring   │         │  • Text / Markdown    │         │  • Active Guidelines  │
   └───────────┬───────────┘         └───────────┬───────────┘         └───────────┬───────────┘
               │                                 │                                 │
               └─────────────────────────────────┼─────────────────────────────────┘
                                                 │
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │     Persistence Layer       │
                                  │  • SQLite (WAL Mode)        │
                                  │  • Supabase (Postgres, RLS) │
                                  │  • Private Storage Buckets  │
                                  └─────────────────────────────┘
```

---

## 👥 Role-Based Access Control (RBAC)

BrandSense enforces strict role-based separation and multi-tenant isolation across 4 distinct user roles:

| Role | Accessible Routes | Permissions & Capabilities |
| :--- | :--- | :--- |
| **Content Creator** | `/creator/*`, `/review/new`, `/review/results`, `/review/rewrite` | Submit copy, upload documents, review AI findings, apply intent-preserving rewrites, submit to reviewers. |
| **Brand Reviewer** | `/reviewer/*`, `/approvals`, `/review/*` | View assigned reviews, inspect evidence quotes, approve/reject submissions, trigger rollbacks. |
| **Brand Admin** | `/admin/*`, `/knowledge`, `/insights` | Manage brand voice guidelines, banned terms, approved corporate facts, inspect analytics and friction index. |
| **Super Admin** | `/super-admin/*` | Multi-organization provisioning, AI engine configuration, system health monitoring, global audit logs. |

---

## 📡 API Reference

### AI Review & Verification
- `POST /api/v1/reviews/submit` — Submits content for dual-pass analysis, grounded confidence scoring, and rule matching.
- `POST /api/v1/reviews/extract-document` — Extracts clean text, page counts, and sections from PDF, DOCX, and text files.
- `POST /api/v1/reviews/{id}/rewrite` — Generates intent-preserving rewrites with token retention scores and diff analysis.
- `GET /api/v1/reviews/{id}/revisions` — Retrieves tracked revision snapshots and diff summaries.
- `POST /api/v1/reviews/{id}/revisions/{rev_id}/rollback` — Restores previous review state and recalculates compliance score.

### Governance Analytics
- `GET /api/v1/insights/governance` — Live SQL-aggregated metrics: repeated violations, override frequencies, and friction index.

### SENSA Assistant
- `POST /api/v1/sensa/chat` — Multi-turn context-aware assistant grounded in organization-specific brand rules.

### Knowledge Base & Governance Rules
- `GET /api/v1/knowledge` — Lists active brand guidelines, banned vocabulary, and approved facts.
- `POST /api/v1/knowledge` — Creates brand guidelines with category, severity, and regex/phrase rules.

---

## 🚦 Getting Started

### Prerequisites
- **Node.js**: v18.18+ or v20+
- **Python**: v3.11+
- **Git**

### 1. Clone & Setup
```bash
git clone https://github.com/anshpatel2212/codenexus-india.git
cd codenexus-india
```

### 2. Configure Environment
```bash
cp .env.example .env.local
cp backend/.env.example backend/.env
```

### 3. Run Backend (FastAPI)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate    # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Interactive OpenAPI documentation will be live at: **http://localhost:8000/docs**

### 4. Run Frontend (Next.js)
```bash
# In the repository root:
npm install
npm run dev
```
Open **http://localhost:3000** in your browser.

---

## 🧪 Automated Test Suite

BrandSense comes with an end-to-end automated verification suite covering unit, integration, and security boundaries:

```bash
# Run Backend Pytest Suite (26 tests)
PYTHONPATH=. pytest -v

# Run SENSA Conversational Intelligence Verification (10 tests)
python tests/test_sensa_intelligence.py

# Run Frontend Node Test Suite (39 tests)
npm test

# Run TypeScript Validation (0 errors)
npx tsc --noEmit

# Run Next.js Production Build (63/63 pages compiled)
npm run build
```

---

## 🔑 Environment Variables

### Frontend (`.env.local`)
| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API (e.g. `http://localhost:8000/api/v1` or Render URL) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Optional client-side Gemini API key |

### Backend (`backend/.env`)
| Variable | Description |
| :--- | :--- |
| `DATABASE_PATH` | Path to persistent SQLite DB file (e.g., `/data/brandsense.db` for Render disks) |
| `BACKEND_CORS_ORIGINS` | Allowed CORS origins (e.g., `*` or frontend domains) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role secret key (backend only) |
| `SUPABASE_JWT_SECRET` | Secret key for JWT verification |
| `GEMINI_API_KEY` | Google Gemini API key for AI engine |

---

## 👥 Authors

| Name | Role | GitHub |
| :--- | :--- | :--- |
| **Ansh Patel** | Lead Full-Stack Architect | [@anshpatel2212](https://github.com/anshpatel2212) |
| **Prince Patel** | Principal QA & AI Systems Engineer | [@Prince94-p](https://github.com/Prince94-p) |
| **Dwij Patel** | DevOps & Cloud Infrastructure Specialist | [@PatelDwij](https://github.com/PatelDwij) |
| **Smit Patel** | UI/UX & Responsive Frontend Specialist | [@PatelSmit-2007](https://github.com/PatelSmit-2007) |

---

## 📄 License

Distributed under the MIT License. Built with ❤️ for enterprise brand excellence.
