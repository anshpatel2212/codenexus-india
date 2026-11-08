<div align="center">

<h1>🚀 BRANDSense</h1>

<h3>AI-powered enterprise platform built with Next.js, FastAPI & Supabase</h3>

<p>
  <a href="https://brandsense-web-przj.onrender.com"><img src="https://img.shields.io/badge/Live_Demo-brandsense--web-46E3B7?style=for-the-badge&logo=render&logoColor=black" alt="Live Demo" /></a>
</p>

<p>
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=black" alt="Render" />
</p>

<p>
  <a href="https://brandsense-web-przj.onrender.com">Live Demo</a> •
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-environment-variables">Environment</a> •
  <a href="#-deployment">Deployment</a> •
  <a href="#-authors">Authors</a> •
  <a href="#-contributing">Contributing</a>
</p>

</div>

---

## 📖 About

**BRANDSense** is a full-stack, AI-driven web platform. The frontend is a modern **Next.js** app styled with **Tailwind CSS**, backed by a **FastAPI** service for business logic and AI orchestration, with **Supabase** providing authentication and database. It plugs into multiple LLM providers (NVIDIA Nemotron, Gemini, OpenAI, Anthropic) through one configurable layer.

> Replace this paragraph with a 1–2 line pitch of what BRANDSense does for users.

## 🌐 Live Demo

**👉 [https://brandsense-web-przj.onrender.com](https://brandsense-web-przj.onrender.com)**

> ⏳ Hosted on Render's free tier, so the first load may take 30–60 seconds while the server wakes up.

## ✨ Features

- ⚡ **Modern UI**: Next.js (TypeScript) + Tailwind CSS, responsive and fast
- 🔐 **Authentication & Database**: Supabase (JWT auth, Postgres)
- 🧠 **Multi-model AI layer**: switch between NVIDIA Nemotron, Gemini, OpenAI or Anthropic via env config
- 🛡️ **Secure by design**: service keys stay on the backend, never in the browser
- 🌐 **CORS-controlled API**: configurable allowed origins
- ☁️ **Deploy-ready**: Firebase Hosting for the frontend, `render.yaml` for the backend
- ✅ **Tests**: dedicated `tests/` directory

## 🧰 Tech Stack

| Layer    | Technology                                    |
|----------|-----------------------------------------------|
| Frontend | Next.js, React, TypeScript, Tailwind CSS      |
| Backend  | FastAPI (Python)                              |
| Database | Supabase (PostgreSQL + Auth)                  |
| AI       | NVIDIA Nemotron, Gemini, OpenAI, Anthropic    |
| Hosting  | Firebase Hosting (frontend), Render (backend) |

## 🏗️ Architecture

```
┌──────────────┐     HTTPS      ┌──────────────────┐      ┌────────────────┐
│  Next.js UI  │ ─────────────▶ │  FastAPI Backend │ ───▶ │  LLM Providers │
│  (src/)      │                │  (backend/)      │      │ NVIDIA/Gemini/ │
└──────┬───────┘                └────────┬─────────┘      │ OpenAI/Claude  │
       │                                 │                └────────────────┘
       │        Supabase Auth / DB       │
       └────────────────┬────────────────┘
                        ▼
                 ┌─────────────┐
                 │  Supabase   │  (supabase/)
                 └─────────────┘
```

## 📁 Project Structure

```
codenexus-india/
├── backend/               # FastAPI service
├── src/                   # Next.js application source
├── supabase/              # Supabase config & migrations
├── tests/                 # Test suite
├── .env.example           # Environment variable template
├── firebase.json          # Firebase Hosting config
├── .firebaserc            # Firebase project alias
├── render.yaml            # Render deployment blueprint
├── next.config.mjs        # Next.js config
├── tailwind.config.ts     # Tailwind config
├── postcss.config.mjs     # PostCSS config
├── tsconfig.json          # TypeScript config
├── AGENTS.md              # AI agent / contributor guidelines
└── package.json
```

## 🚦 Getting Started

### Prerequisites

- **Node.js** 18+ and **npm**
- **Python** 3.10+
- A **Supabase** project ([supabase.com](https://supabase.com))
- At least one AI provider API key

### 1. Clone the repository

```bash
git clone https://github.com/anshpatel2212/codenexus-india.git
cd codenexus-india
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in the values (see [Environment Variables](#-environment-variables)).

### 3. Run the frontend

```bash
npm install
npm run dev
```

App runs at **http://localhost:3000**.

### 4. Run the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API runs at **http://localhost:8000** (interactive docs at `/docs`).

### 5. Run tests

```bash
npm test      # frontend
pytest        # backend
```

## 🔑 Environment Variables

### Frontend (public)

| Variable                        | Description                         |
|---------------------------------|-------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key          |
| `NEXT_PUBLIC_API_URL`           | Base URL of the FastAPI backend     |
| `NEXT_PUBLIC_GEMINI_API_KEY`    | Gemini key for client-side features |

### Backend (private, never expose to the frontend)

| Variable                    | Description                             |
|-----------------------------|-----------------------------------------|
| `SUPABASE_URL`              | Supabase project URL                    |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key               |
| `SUPABASE_JWT_SECRET`       | JWT secret used to verify user tokens   |
| `BACKEND_CORS_ORIGINS`      | Comma-separated list of allowed origins |
| `NVIDIA_API_KEY`            | NVIDIA API key                          |
| `NVIDIA_MODEL`              | NVIDIA model name (e.g. Nemotron)       |
| `OPENAI_API_KEY`            | OpenAI API key                          |
| `GEMINI_API_KEY`            | Google Gemini API key                   |
| `ANTHROPIC_API_KEY`         | Anthropic API key                       |
| `AI_MODEL_NAME`             | Default model used by the AI layer      |
| `PORT`                      | Backend port (default `8000`)           |

> ⚠️ **Never commit your `.env` file.** Keep service-role keys server-side only.

## ☁️ Deployment

**Frontend → Firebase Hosting**

```bash
npm run build
npm install -g firebase-tools
firebase login
firebase deploy
```

**Backend → Render**

1. Push the repo to GitHub.
2. In Render, create a new **Blueprint** pointing at this repo (`render.yaml` is picked up automatically).
3. Add the backend environment variables in the Render dashboard.
4. Set `NEXT_PUBLIC_API_URL` in the frontend to your Render service URL.

## 👥 Authors

| Name | Role | GitHub |
|------|------|--------|
| **Ansh Patel** | Repository Owner | [@anshpatel2212](https://github.com/anshpatel2212) |
| **Prince Patel** | Contributor | [@Prince94-p](https://github.com/Prince94-p) |
| **Dwij Patel** | Contributor | [@PatelDwij](https://github.com/PatelDwij) |
| **Smit Patel** | Contributor | [@PatelSmit-2007](https://github.com/PatelSmit-2007) |

> Built with ❤️ by the BRANDSense team.

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m "feat: add amazing feature"`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

See [`AGENTS.md`](./AGENTS.md) for coding conventions.

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.

---

<div align="center">

⭐ If you find this project useful, please give it a star!

</div>
