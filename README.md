# AI-powered Family Budget Adviser

![Overview Design](/budgetadvisor-ai/frontend/public/budgetadvisor.ai.svg)

![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?logo=openai&logoColor=white)
![ElevenLabs](https://img.shields.io/badge/ElevenLabs-000000?logo=elevenlabs&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

## Overview

AI-powered Family Budget Adviser is a full-stack budgeting assistant designed to help families track everyday spending, understand where money goes, and uncover savings opportunities. Users can record receipts and expenses, review spending trends over time, and ask an advisor agent for plain-language explanations of their finances.

The project is also built around a benefits discovery flow. In addition to budgeting insights, it includes a benefits-focused assistant that helps surface potentially unclaimed support, making the product useful both as a spending tracker and as a financial guidance tool.

## What It Does

- Captures daily spending through a receipt and expense workflow.
- Produces structured spending analysis for daily, weekly, and monthly views.
- Uses AI to explain spending habits and answer budget-related questions in natural language.
- Supports a benefits agent to help users identify support they may be eligible for.
- Combines text, image, and audio-oriented AI features across the product.

## How It Works

The application is organized as a two-part system:

1. The frontend provides the user experience for entering expenses, reviewing insights, and interacting with the AI assistants.
2. The backend handles authentication, persistence, business rules, analytics, OCR/vision processing, and AI integrations.

Typical flow:

1. A user submits a receipt or expense.
2. The backend stores the data and, when needed, extracts structured information from the input.
3. Spending data is aggregated into analytics views and trends.
4. The advisor agent turns those numbers into practical, human-readable guidance.
5. The benefits agent can be used to explore extra financial support options.

## Tech Stack

- Backend: FastAPI, SQLModel, Alembic, PostgreSQL, Pydantic, OpenAI, ElevenLabs
- Frontend: React, TypeScript, Vite, Tailwind CSS, Radix UI, React Query
- Infrastructure: Docker, Docker Compose
- Testing: Pytest, Vitest, Playwright

## Project Structure

The repository is split into a backend and frontend application:

- `budgetadvisor-ai/backend`: FastAPI service, models, API routes, AI helpers, database migrations, and tests.
- `budgetadvisor-ai/frontend`: React application, UI components, pages, client API layer, and browser tests.
- `budgetadvisor-ai/compose.yml`: Container setup for running the stack locally.
- `budgetadvisor-ai/compose.override.yml`: Local development overrides.

Inside the backend, the main areas of responsibility are:

- `app/api`: HTTP route definitions.
- `app/models`: Database models.
- `app/crud.py`: Data access helpers.
- `app/ai`: AI prompts, vision helpers, advisor logic, and speech-related integrations.
- `app/alembic`: Database migration configuration.

## Getting Started

### Backend

From `budgetadvisor-ai/backend`:

```bash
cp .env.example .env
uv sync
source .venv/bin/activate
```

If you are using Docker Compose, start the stack from `budgetadvisor-ai/` with:

```bash
docker compose up --build
```

### Frontend

From `budgetadvisor-ai/frontend`:

```bash
npm install
npm run dev
```

## Development Notes

- The backend uses Alembic for database migrations.
- The frontend is built with Vite and designed to consume the backend API directly.
- The repository includes tests for both backend and frontend workflows.

## 
