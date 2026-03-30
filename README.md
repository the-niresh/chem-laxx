# Chemical Industry AI Decision Engine (B2B)

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Convex](https://img.shields.io/badge/Backend-Convex-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)
![LLM](https://img.shields.io/badge/LLM-OpenAI-111827)

## Overview

This repository contains a **B2B AI decision-making engine for the chemical industry**.

It’s designed to reduce operational risk by **automating chemical selection/matching decisions** under strict safety, environmental, and operational constraints—minimizing human error in high-stakes workflows.

Unlike a generic “chatbot”, the AI layer is implemented as a **constrained decision system**: prompts, output structure, and backend validation are engineered to produce **reliable, auditable recommendations** aligned with organizational policy.

## Business Value

- **Risk reduction**: consistent application of safety/operational constraints across decisions.
- **Faster decision cycles**: reduces back-and-forth between operations, sales, and engineering.
- **Repeatability**: improves standardization of recommendations across teams and shifts.
- **Traceability**: conversations and outcomes are persisted and can be reviewed for QA.

## Architecture

### High-level components

- **Next.js App Router (Frontend + Routing)**
  - Human-facing workflow (login, conversation UI, history/sidebar, profile)
  - UI is optimized for low-bloat, accessibility, and maintainability.

- **Convex (Real-time backend + database + storage)**
  - Type-safe queries/mutations powering:
    - thread lifecycle (`threads`)
    - message lifecycle (`messages`)
    - user profile (`users`)
    - avatar uploads (Convex storage)

- **OpenAI (Decision logic)**
  - Integrated through Convex actions / HTTP streaming endpoints.
  - The LLM is treated as a *bounded reasoning engine* rather than an unconstrained assistant.

### Data model (Convex)

- **`users`**: identity + profile fields (`name`, `email`, `avatar_url`, `image` storage id)
- **`threads`**: per-user decision sessions (title, timestamps)
- **`messages`**: user/assistant/system messages; optionally streamed (`responseStreamId`)

See: `convex/schema.ts`.

## Deterministic / Safety-Constrained AI Integration

The AI layer is engineered to produce **structured, decision-focused output** rather than free-form conversation.

- **[Structured output contract]**
  - The system prompt constrains responses into explicit sections (recommended solution, safety assessment, operational expectations, cost range, business impact, etc.).

- **[Policy-driven behavior]**
  - The prompt includes rules such as:
    - avoid supplier-specific hallucinations
    - state assumptions when data is missing
    - prioritize decision confidence over verbosity

- **[Validation & guardrails]**
  - Convex acts as the authoritative compute boundary where:
    - inputs are validated (Convex validators)
    - outputs are persisted for review
    - streaming is controlled and recoverable

This approach makes the system suitable for production usage in regulated/high-risk operational contexts.

## System Flow (How It Works)

1. **User input (Next.js)**
   - A user submits requirements/constraints via the chat UI.

2. **Persist + orchestrate (Convex)**
   - A mutation stores the message and associates it with a thread.
   - The system triggers an LLM action/streaming path.

3. **LLM decision step (OpenAI)**
   - OpenAI is called with a strict system prompt to enforce a consistent decision format.
   - For streaming use-cases, tokens are streamed and persisted.

4. **Validated output + real-time sync (Convex → Next.js)**
   - The assistant response is written back to Convex.
   - UI updates automatically via Convex reactive queries.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React, TypeScript
- **Backend / DB**: Convex (queries, mutations, actions, real-time sync)
- **UI**: TailwindCSS + shadcn/ui + Radix primitives (accessible components, minimal bloat)
- **AI**: OpenAI API

## Key Features

- **Safety-first decision support**
  - Designed for chemical picking/matching decisions under strict constraints.

- **Streaming responses (where applicable)**
  - Token streaming with persistence for reliability and UX.

- **Threaded decision history**
  - Each session is stored as a thread with searchable history and lifecycle management.

- **Profile management**
  - Editable name, read-only email; avatar upload stored in Convex storage.

- **Type-safe real-time backend**
  - Convex validators and generated types provide a strongly-typed API boundary.

## Security & Safety Notes

- **Secrets management**
  - OpenAI API key must be stored as a **Convex secret** (never committed).

- **Authentication boundary**
  - Backend mutations rely on authenticated user identity (`getAuthUserId`).

- **Auditability**
  - Decisions are stored in threads/messages, enabling post-hoc review and process improvements.

## Repository Map

- **`app/`**
  - Next.js routing and UI composition
- **`components/`**
  - Dashboard UI, chat, navigation, reusable UI pieces
- **`convex/`**
  - Schema, queries/mutations/actions, OpenAI orchestration, streaming

## Brief Setup (Development)

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
npm install
npx convex dev
npm run dev
```

Environment requirements:

- Set `OPENAI_API_KEY` as a Convex secret.
- set `CONVEX_DEPLOYMENT` as a Convex Connector
- set `NEXT_PUBLIC_CONVEX_URL` to the Convex URL
- set `NEXT_PUBLIC_CONVEX_SITE_URL` to the Convex site URL
