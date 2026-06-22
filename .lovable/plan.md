## Ikusasa MVP — Phase 1

UI-only build on the existing stack: TanStack Start + React 19 + TypeScript + Tailwind v4 + shadcn/ui + Zustand. No backend, no Supabase, no real APIs. Everything reads from mock data through a service layer so backend can be swapped in later without touching components.

### Design system

- Palette: Cloud White + Coral (`#fafbfc`, `#e8ecf1`, `#94a3b8`, accent `#ff6b35`). Full semantic token set in `src/styles.css` via `@theme inline` over CSS variables on `:root` and `.dark`. Coral as `--primary`; muted slate for secondary text; off-white surfaces with one elevated surface token for "cards on canvas".
- Type: Space Grotesk (display/headings) + DM Sans (body), loaded via `<link>` in `__root.tsx` head with preconnect. Token names `--font-display`, `--font-sans`.
- Radii, shadows, gradients: soft (rounded-2xl default), low-elevation premium shadows, one subtle coral glow for primary CTAs.
- Dark mode: class-based via `@custom-variant dark`, theme switcher in settings/header (Phase later — token foundation ships now).
- Mobile-first responsive utilities; bento grid scaffolding for dashboards (Phase 2).
- Motion: install `motion` (Motion for React) for subtle page/card transitions.

### Architecture scaffold

```
src/
  routes/                  # TanStack file-based routes
  components/
    ui/                    # shadcn primitives (already present, extended)
    common/                # Logo, EmptyState, ErrorState, Skeletons, Badges, StatusPill
    layout/                # AppShell, Sidebar, Topbar, AuthLayout, OnboardingLayout
    forms/                 # FormField wrappers, FileDropzone (mock), TagInput
    opportunities/         # (Phase 2)
    dashboard/             # (Phase 2)
    profile/               # (Phase 5)
  features/
    auth/                  # login/register/forgot forms + role chooser
    onboarding/            # student/graduate/employer step components
    students/ graduates/ businesses/ opportunities/ applications/ reviews/ admin/  # placeholders
  hooks/                   # useAuth, useUser, useMockDelay
  lib/                     # cn, format (ZAR currency, dates), zod helpers
  mock-data/               # users, students, graduates, businesses, opportunities, applications, reviews, notifications
  services/                # auth, user, student, business, opportunity, application, review, notification — all return mocks via Promise with simulated latency
  store/                   # Zustand: authStore, onboardingStore, uiStore (theme, sidebar)
  types/                   # User, Role, Student, Graduate, Business, Opportunity, Application, Review, Notification — no `any`
  constants/               # roles, statuses, industries, SA cities, skills catalog
  config/                  # app config (name, currency=ZAR, routes map)
```

Rule enforced from day one: routes/components import only from `services/*` and `types/*`, never from `mock-data/*` directly.

### Routes built in Phase 1

- `/` — minimal placeholder landing (real landing comes Phase 2); redirects authenticated users to dashboard.
- `/login`
- `/register` — with role selector (Student / Graduate / Employer); routes to correct onboarding on submit.
- `/forgot-password` — single email field + success state.
- `/onboarding/student` — 5 steps: Personal Info → Skills → Portfolio links → CV upload (mock) → Review.
- `/onboarding/graduate` — same shape as student, with "current role / years since graduation" instead of "graduation year only".
- `/onboarding/business` — 4 steps: Company Details → Description → Verification (reg # + docs, mock upload) → Review.

Auth layout = centered card on soft canvas. Onboarding layout = progress bar + step body + back/next footer, state held in `onboardingStore`.

Forms: React Hook Form + Zod, shared `FormField` wrappers, inline errors, disabled-while-submitting, mock latency via service.

Mock auth: `authService.login/register/logout` writes a fake user to `authStore` (persisted to localStorage). No real tokens, no real validation beyond schema.

### Phase 1 deliverables checklist

1. Tokens + fonts wired in `src/styles.css` and `__root.tsx`.
2. Folder scaffold created with index barrels where useful.
3. Types + constants + mock data seeded (≥ 8 opportunities, 6 businesses, 10 students/grads, sample applications, reviews, notifications — used by later phases).
4. Service layer for all entities returning typed mocks with simulated latency.
5. Zustand stores: auth (persisted), onboarding (in-memory), ui (theme + sidebar collapsed).
6. AuthLayout + OnboardingLayout + minimal AppShell (sidebar+topbar) component ready for Phase 2.
7. Login / Register / Forgot Password pages.
8. Three onboarding flows fully clickable end-to-end against mocks, landing on a placeholder dashboard route.
9. Common UI primitives: StatusPill, EmptyState, FileDropzone (mock), TagInput, Stepper.

### Out of scope (later phases, as you outlined)

- Phase 2: landing, dashboards, marketplace, opportunity detail.
- Phase 3: messaging, notifications center, wallet/earnings.
- Phase 4: student/employer/admin dashboards with analytics, moderation.
- Phase 5: reviews/ratings, profile/portfolio, settings.

### Technical notes

- Sidebar uses shadcn `Sidebar` primitives, collapsible to icon strip; `SidebarTrigger` lives in the topbar so it's always visible.
- Currency formatter: `formatZAR(amount)` → `R 1 250`.
- File uploads: visually complete dropzone + file list with mock progress; no real storage.
- A11y: semantic landmarks, one `<main>` in shells, aria-labels on icon buttons, focus rings via tokens.
- No `src/pages/`. No React Router DOM. No Next.js patterns. Every route is a `createFileRoute` file under `src/routes/`.
- Build verification at end of Phase 1: lint clean, build passes, all onboarding flows reachable from `/register`.

Approve to start Phase 1; subsequent phases will each be planned and confirmed before building.