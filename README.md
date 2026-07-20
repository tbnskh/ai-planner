# AI Planner

Dump everything on your mind as free text — AI turns the chaos into structured
tasks, and you get a plan for today.

## How it works

1. **Capture** — write an unstructured brain dump into a single text field
2. **Parse** — `/api/parse` sends it to Claude, which splits it into discrete
   tasks with a priority, an optional time estimate, and a due date inferred
   from phrases like "by Friday"
3. **Inbox → Today** — pick what you actually commit to today, then check items
   off as you go

Tasks are stored in `localStorage`. Single user, no auth.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Anthropic API (`claude-haiku-4-5`) with structured outputs
- zod for validating both AI output and stored state

## Local development

```bash
npm install
cp .env.example .env.local   # then paste your Anthropic API key
npm run dev
```

App runs at http://localhost:3000

`ANTHROPIC_API_KEY` is read server-side only, inside the `/api/parse` route
handler — it never reaches the browser bundle.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Lint the codebase |

## Structure

```
src/app/            App Router pages, layouts, and the /api/parse route
src/components/     UI components
src/lib/
  types.ts          Task contract — the source of truth for data shape
  schemas.ts        zod validation for AI responses and localStorage
  storage.ts        Persistence layer (swap this to move off localStorage)
  tasks.ts          Pure task operations, no React and no side effects
  store/            External store + useTasks hook
public/             Static assets
context/            Project working rules and notes
```

## Deployment

Deployed on Vercel; every push to `main` ships automatically. Set
`ANTHROPIC_API_KEY` in the Vercel project's environment variables, otherwise
`/api/parse` returns a `CONFIG` error.
