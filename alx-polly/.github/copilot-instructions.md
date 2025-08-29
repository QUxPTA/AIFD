# GitHub Copilot Rules — Polling App with QR Code

> Purpose: Ensure Copilot generates **consistent, high-quality, TypeScript-based code** aligned with this project.

---

## General Rules

1. Always use **TypeScript** (`.tsx` for React components, `.ts` for utils/API).
2. Use **Next.js App Router** conventions:
   - Place routes in `/app/...`.
   - Use `route.ts` files for API endpoints under `/app/api`.
3. Use **Supabase client** for DB/auth interactions. Import it from `/lib/supabaseClient.ts`.
4. Generate **modular, reusable components** inside `/components`.
5. Apply **TailwindCSS + shadcn/ui** for UI styling.
6. Always ensure **accessibility**: semantic HTML, ARIA labels, proper form inputs.

---

## Code Style

- Naming:
  - Components → `PascalCase`
  - Utility functions → `camelCase`
  - API routes → `kebab-case` in folder names
- Prefer **async/await** over `.then()`.
- Include **inline comments** for complex logic.
- Always validate inputs before database writes.

---

## Polling App Specific Rules

- Polls: Each poll has `id`, `question`, `options[]`, `creatorId`, `createdAt`.
- Votes: Each vote has `id`, `pollId`, `optionId`, `userId/anonymousId`.
- User Auth: Use Supabase Auth (email/password for now).
- Sharing: Each poll must generate:
  - A **unique URL** (`/polls/[id]`).
  - A **QR code** using `qrcodejs`.
- Results: Always return vote counts and percentages.

---

## API Guidelines

- Organize APIs under `/app/api/...`.
- Example routes:
  - `POST /api/polls` → Create poll
  - `GET /api/polls/:id` → Get poll details
  - `POST /api/polls/:id/vote` → Cast a vote
  - `DELETE /api/polls/:id` → Delete a poll
- Always return **JSON** with `{ success, data?, error? }`.

---

## Testing Guidelines

- Use **Vitest or Jest** for unit tests.
- Generate tests for:
  - Supabase query utilities
  - API routes
  - Critical components (forms, results chart)
- Use mocks for Supabase where possible.

---
