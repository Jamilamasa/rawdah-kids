# Rawdah Kids

Rawdah Kids is a mobile‑first web app that gives children a playful, guided way to learn about Islam and manage their daily responsibilities. It is the “kids portal” that talks to the Rawdah backend API for authentication, tasks, quizzes, games, messages, and notifications.

This repository contains only the frontend app. You must run it against a compatible Rawdah API server (HTTP + WebSocket) to get real data.

---

## Features

- **Child‑friendly login**
  - Sign in with a family slug, username, and password.
  - Sessions are stored in the browser using a small persisted auth store.

- **Home dashboard**
  - Personalized Islamic greeting and motivational messages.
  - XP progress card showing current level and XP.
  - Quick stats for pending tasks and quizzes.
  - “Up next” list of tasks and recent badges.

- **Tasks**
  - “My Tasks” view with filters for All / To Do / In Progress / Done.
  - Start, complete, and request rewards for tasks assigned from the parent portal.
  - Live updates when new tasks are assigned or statuses change (via WebSocket).

- **Quizzes**
  - Four quiz categories: Hadith, Prophets, Quran, and Topics.
  - Self‑assign Hadith quizzes in different difficulties (easy / medium / hard).
  - Quiz list sorted to show incomplete quizzes first.
  - Integrated with the API for quiz creation, starting, submitting answers, and results.

- **Games**
  - “Games” hub with filters for Islamic vs general games.
  - Game metadata (name, type, description, icon) loaded from the API, with local fallbacks.
  - Starts game sessions via the API and navigates into game player pages.

- **Messages, requests, rants, notifications**
  - Messages: conversational threads with family members, with live “new message” notifications.
  - Requests: children can create requests (e.g. for items or privileges) that parents see in their portal.
  - Rants: private journal entries that can optionally be password‑protected.
  - Notifications: in‑app notification center, updated in real‑time via WebSocket.

- **XP and badges**
  - XP endpoint integration for tracking child progress.
  - Recent badges component to show latest achievements.

---

## Tech stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **UI:** React 18, Tailwind CSS, Radix UI primitives, Framer Motion
- **State & data:**
  - Zustand (auth store and session persistence)
  - TanStack React Query (server state, caching, revalidation)
- **Forms & validation:** React Hook Form + Zod
- **Feedback & UX:** Sonner toasts, custom skeleton states, loading placeholders

Node.js and npm are used for local development and production builds.

---

## Project structure (high‑level)

- `src/app`
  - Root app layout, global styles, login page.
  - `(portal)/…` – authenticated child portal (home, tasks, quizzes, games, messages, etc.).
- `src/components`
  - Reusable UI components for games, tasks, quizzes, layout, and shared elements.
- `src/hooks`
  - Hooks for data fetching (tasks, quizzes, games, messages, etc.).
  - `useWebSocket` for real‑time updates over WebSocket.
- `src/lib`
  - `api.ts` – typed HTTP client for the Rawdah API.
  - `utils.ts` – small utilities (e.g. greetings, formatting).
  - `toast.ts` – helpers for consistent toast error handling.
- `src/store`
  - `authStore.ts` – persisted auth store using Zustand.
- `src/types`
  - Shared TypeScript types (User, Task, Quiz, Game, etc.).
- `public`
  - Static assets and `sw.js` service worker for push notifications.

You generally do not need to touch anything outside `src/` unless you are adjusting Tailwind, ESLint, or Next.js configuration.

---

## Prerequisites

- **Node.js:** 18 or later (recommended for Next.js 14).
- **npm:** 9+ (or compatible with your Node.js version).
- **Backend API:**
  - HTTP API reachable at `NEXT_PUBLIC_API_URL` (default `http://localhost:8080/v1`).
  - WebSocket endpoint reachable at `NEXT_PUBLIC_WS_URL` (default `ws://localhost:8080/ws`).
  - The backend is responsible for:
    - Authentication (`/auth/child/signin`, `/auth/me`, `/auth/signout`).
    - Tasks, quizzes, games, messages, rants, requests, notifications, XP, and family members.
    - Emitting WebSocket events for real‑time updates (see “WebSocket integration” below).

---

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/your-org/rawdah-kids.git
cd rawdah-kids
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Next.js reads environment variables from `.env`, `.env.local`, and environment‑specific variants (e.g. `.env.production.local`). For local development, the recommended file is `.env.local`, which is already ignored by Git.

An example file is provided:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and set values appropriate for your environment.

#### Available environment variables

These variables are prefixed with `NEXT_PUBLIC_`, which means they are available in the browser as well as on the server. Do not put secrets here.

| Variable                      | Required | Description                                                | Example (dev)                      | Example (prod)                             |
| ----------------------------- | -------- | ---------------------------------------------------------- | ---------------------------------- | ------------------------------------------ |
| `NEXT_PUBLIC_API_URL`        | Yes      | Base URL for the Rawdah HTTP API (prefix `/v1`).          | `http://localhost:8080/v1`        | `https://api.example.com/v1`               |
| `NEXT_PUBLIC_WS_URL`         | Yes      | WebSocket URL for live updates.                           | `ws://localhost:8080/ws`          | `wss://api.example.com/ws`                 |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Optional | Public VAPID key for Web Push notifications (see below). | *(empty)*                          | `BEl7…your_public_vapid_key…abc`          |

If you are running the backend on a different host or port, update these URLs accordingly.

#### Push notifications (VAPID)

If your backend and infrastructure support Web Push:

- Generate a VAPID key pair on the backend.
- Configure the backend to use the **private** VAPID key.
- Set `NEXT_PUBLIC_VAPID_PUBLIC_KEY` to the corresponding **public** key.
- Ensure `public/sw.js` is registered by the app and that your backend can send push notifications to subscriptions created by the kids portal.

If you do not need push notifications yet, you can leave `NEXT_PUBLIC_VAPID_PUBLIC_KEY` empty.

---

## Running locally

After installing dependencies and configuring `.env.local`, start the development server:

```bash
npm run dev
```

By default this runs Next.js at:

- `http://localhost:3001`

Make sure your backend API and WebSocket server are running and reachable at the URLs you configured in `.env.local`. For the default values, that means:

- HTTP API at `http://localhost:8080/v1`
- WebSocket at `ws://localhost:8080/ws`

You should then be able to open `http://localhost:3001` in a browser and sign in with a child account that exists in your backend.

---

## How the app works (user flow)

### Login

1. Go to the root URL (e.g. `http://localhost:3001/`).
2. Enter:
   - **Family name (slug)** – a lowercase, hyphenated slug for the family (e.g. `ali-family`).
   - **Username** – child’s username.
   - **Password** – child’s password.
3. On successful sign‑in, the app stores the session and redirects to `/home`.

### Home dashboard (`/home`)

- Shows a greeting and motivational message.
- Displays XP progress and level.
- Shows a quick summary of pending tasks and quizzes.
- Highlights a few “up next” tasks and recent badges.

### Tasks (`/tasks`)

- Filter tasks by All / To Do / In Progress / Done.
- Each task shows its title, status, and relevant actions.
- Starting, completing, or requesting rewards triggers calls to:
  - `/tasks/:id/start`
  - `/tasks/:id/complete`
  - `/tasks/:id/request-reward`
- New tasks or status updates can arrive in real‑time via WebSocket events.

### Quizzes (`/quizzes`)

- Tabs for Hadith, Prophets, Quran, and Topics.
- Lists quizzes assigned to the child from the backend:
  - Data is loaded from `/quizzes/my` and related quiz endpoints.
- Self‑assign panel (Hadith tab):
  - Child can generate their own Hadith quiz in the chosen difficulty.
  - Uses `/quizzes/hadith/self` under the hood.
- Tapping a quiz opens the quiz taker view for that quiz.

### Games (`/games`)

- List of games from the backend (`/games`), with a local fallback list.
- Filters for “All”, “Islamic”, and “General” games.
- Starting a game:
  - Creates a game session via `/games/sessions/start`.
  - Navigates to `/games/[slug]` where the actual game implementation runs.

### Messages, requests, rants, notifications

- **Messages:** integrated with `/messages/*` endpoints to show conversations and threads.
- **Requests:** uses `/requests` endpoints so children can send structured requests to parents.
- **Rants:** uses `/rants/*` endpoints for child journal entries (optionally password‑protected).
- **Notifications:** uses `/notifications/*` endpoints and WebSocket events to keep the notification center up to date.

---

## WebSocket integration

The app maintains a WebSocket connection for real‑time updates using `useWebSocket`. It:

- Connects to `NEXT_PUBLIC_WS_URL` with a query parameter: `?token=<access_token>`.
- Listens for JSON messages of the form:

```json
{
  "type": "event.name",
  "payload": {
    "title": "Optional human-readable title",
    "…": "Other fields"
  }
}
```

- Reacts to events such as:
  - `task.assigned`
  - `task.status_updated`
  - `quiz.assigned`
  - `quiz.completed`
  - `message.new`
  - `request.new`
  - `notification.new`
  - `game.limit_reached`

On these events, the app invalidates relevant React Query caches (tasks, quizzes, messages, notifications) and shows appropriate toasts to the child.

Your backend should emit events in this format for the full real‑time experience, but the app still works (without live updates) if WebSocket is not configured.

---

## Building for production

To create a production build:

```bash
npm run build
```

This:

- Runs TypeScript type checking.
- Optimizes and bundles the app for production.

After a successful build, start the app:

```bash
npm run start
```

By default, this starts the server on port `3001`. You can override the port via the `PORT` environment variable if needed.

Ensure that the same environment variables you used in development are available in the production environment:

- As a `.env` / `.env.production.local` file in the deployment directory, or
- As actual environment variables provided by your process manager or hosting platform.

---

## Deploying on your own infrastructure

You can deploy Rawdah Kids anywhere you can run a Node.js process: a VM, a bare‑metal server, a PaaS, or a container platform. The general pattern is:

1. Build the app.
2. Serve it with `npm run start` behind a reverse proxy (optional but recommended).
3. Expose the correct environment variables for the API and WebSocket URLs.

### Option 1: Simple Node.js deployment (VM / bare‑metal)

On your server:

```bash
git clone https://github.com/your-org/rawdah-kids.git
cd rawdah-kids
npm ci       # or npm install
npm run build
```

Create a `.env.production.local` or `.env` file:

```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com/v1
NEXT_PUBLIC_WS_URL=wss://api.your-domain.com/ws
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_vapid_key_here
```

Then start the server (ideally under a process manager like `pm2` or systemd):

```bash
npm run start
```

Place a reverse proxy (e.g. Nginx or Caddy) in front of the app to:

- Terminate TLS (HTTPS).
- Forward traffic from `https://kids.your-domain.com` to `http://127.0.0.1:3001`.

Make sure your backend API and WebSocket endpoints are reachable at the URLs referenced in the env variables.

### Option 2: Containerized deployment

You can also build the app into a container image. A minimal Dockerfile might look like:

```Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
RUN npm ci --omit=dev

EXPOSE 3001
CMD ["npm", "run", "start"]
```

You would then provide the env variables (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`) via your container platform (e.g. `docker run -e …` or Kubernetes `env`).

### Option 3: Managed Next.js hosting (e.g. Vercel)

The app is compatible with standard Next.js 14 hosting:

- Import the project into your hosting provider (e.g. Vercel).
- Configure these environment variables in the provider’s dashboard:
  - `NEXT_PUBLIC_API_URL`
  - `NEXT_PUBLIC_WS_URL`
  - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- Use the default build command:
  - `npm run build`
- Use the default start command or the platform’s built‑in Next.js runtime.

When using a managed host, ensure that:

- Your backend API and WebSocket endpoints are publicly reachable.
- CORS configuration on the backend allows requests and WebSocket connections from your kids app domain.

---

## Development tooling

### Linting

This project uses ESLint with Next.js defaults:

```bash
npm run lint
```

Run this before committing changes to keep the codebase consistent and catch common issues early.

### Type checking

TypeScript type checking runs as part of the production build:

```bash
npm run build
```

If there are type errors, the build will fail and you will need to fix them before deploying.

---

## Notes and tips

- Because all `NEXT_PUBLIC_*` variables are exposed to the browser, never store private keys or secrets in them.
- If WebSocket is not available:
  - The app still works using regular HTTP polling via React Query.
  - You simply won’t get instant toasts or auto‑refresh when new tasks/quizzes/messages arrive.
- If the XP endpoint is not implemented yet, the home screen uses a safe fallback XP value so the UI still works.

With the backend properly configured, deploying Rawdah Kids is as simple as:

1. Setting the environment variables for your API and WebSocket endpoints.
2. Running `npm run build`.
3. Running `npm run start` behind your chosen HTTP entrypoint.

