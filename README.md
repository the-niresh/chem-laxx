# Chemical Industry AI Decision Engine

![Chemical Engine](https://grainy-gradients.vercel.app/noise.svg)

An enterprise-grade, highly-specialized AI decision support system designed specifically for chemical manufacturing, formulation engineers, and technical sales. 

Powered by **Next.js**, **Convex** (for real-time multiplayer synchronization and auth), and **OpenAI**. 

## Core Features
- **Context-Aware Decision Support:** Recommends chemical solutions based on performance, pricing, safety constraints, and client requirements.
- **Persistent Conversational Threads:** Auto-titled, resumable chat threads using `@convex-dev/persistent-text-streaming`.
- **Zero-Latency Real-Time Sync:** WebSockets-first streaming architecture.
- **Isolated Multi-Tenant Security:** Strict role-based isolation via Convex Auth; your queries and IP remain siloed.

## Tech Stack
- **Frontend:** Next.js 14, React, Tailwind CSS, Shadcn UI, Framer Motion
- **Backend & Database:** Convex (Serverless, Real-time Database + Auth)
- **AI Models:** OpenAI API (`gpt-3.5-turbo` or GPT-4, configurable)

## Setup & Local Development

1. **Clone the repository**
```bash
git clone https://github.com/the-niresh/chem-laxx.git
cd chem-laxx
```

2. **Install dependencies**
```bash
npm install
# or bun install
```

3. **Setup Environment Variables**
Copy `.env.example` to `.env.local` and populate your secrets:
```bash
cp .env.example .env.local
```

4. **Initialize Convex Backend**
```bash
npx convex dev
```
This will set up your Convex project and run the serverless backend.

5. **Start the Next.js Client**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Security Notice
This template implements strict server-side authentication (`getAuthUserId`) on all mutations and actions to protect against IDOR. Always ensure API keys like `OPENAI_API_KEY` are kept only in your Convex secrets dashboard.

---
*Built by [the-niresh](https://github.com/the-niresh).*