# Global Next.js Frontend Engineering Guidelines

> **The canonical reference document for frontend developers and AI coding agents. Read this file before creating, modifying, refactoring, or reviewing code in any Next.js application. Auto-loaded via [`frontend/AGENTS.md`](../AGENTS.md).**

---

## 1. Core Architectural Pillars

1. **Strict 5-Tier Data Flow:** Clear separation of concerns from Server Pages down to HTTP Services: Page (RSC) $\rightarrow$ Feature Container (Client) $\rightarrow$ shadcn UI $\rightarrow$ TanStack Hook $\rightarrow$ Axios Service. Direct network calls inside JSX are strictly forbidden.
2. **Dual-Engine State Separation:** Server state belongs exclusively in TanStack Query v5; Client UI state belongs exclusively in Zustand v5 with atomic selectors (`state => state.property`). Forms use React Hook Form + Zod v4. Zero `useEffect` for data fetching or derived state.
3. **Deterministic External REST Contract:** Direct alignment with Laravel's REST API contract (as documented in `ARCHITECTURE.md` and `backend/routes/api.php`), ADR-001 response envelope unwrapping (`response.data?.data`), and automated 422 validation error bag mapping.

---

## 2. Mandatory Standards vs. Forbidden Anti-Patterns

| Category | Approved Standard | Forbidden Anti-Pattern |
| :--- | :--- | :--- |
| **Language & Types** | 100% pure JavaScript (`.js`, `.jsx`). JSDoc annotations (`@param`, `@returns`) for IDE and AI autocomplete. | Writing TypeScript (`.ts`, `.tsx`), interfaces, inline type annotations (`: string`, `<T>`), or `z.infer`. |
| **Application Scope** | Next.js 16 is strictly a presentation layer. All business logic, databases, transactions, and heavy auth live in Laravel. | Next.js Route Handlers (`app/api/**`) doing backend work; Server Actions querying databases or duplicating Laravel domain logic. |
| **Data Flow Pipeline** | Strict 5-Tier Flow: Page (RSC) $\rightarrow$ Container (Client) $\rightarrow$ UI $\rightarrow$ Hook $\rightarrow$ Service. Keep root `page.js` as RSC. | Calling Axios or `fetch()` directly inside JSX components; putting interactive client state in root `page.js`. |
| **HTTP Communication** | Centralized Axios client (`src/lib/api/api.js`) consuming Laravel endpoints (`GET` for queries, `POST` for mutations). Mandatory `AbortSignal` forwarding. | Ad-hoc Axios instances; raw `fetch()` calls; manual Auth header injection in services; inventing unregistered HTTP methods. |
| **Response Envelope** | Unwrap `response.data?.data` (ADR-001) in Tier 5 services. Bind 422 errors via `mapLaravelErrorsToForm()`. | Returning raw HTTP response envelopes to hooks/components; manual 422 form field error parsing in components. |
| **Server State** | TanStack Query v5 with centralized TkDodo query key factories (`featureKeys`). Invalidate keys on mutation success. | Hardcoded string query keys (`['items']`, `['items', id]`); mutating cache arrays directly without invalidation. |
| **Caching Policy** | Fresh by default (`staleTime: 0`). Zero caching on transactional data (Cart, Orders, Addresses, Checkout, Profile). Opt-in reference caching only (5–10m). | Blanket caching; assigning `staleTime > 0` to user-specific or transactional data; caching stale inventory. |
| **Client UI State** | Zustand v5 with atomic selectors (`useUIStore((state) => state.prop)`). Ephemeral UI only (modals, drawers, theme). | Destructuring entire stores (`const { a, b } = useStore()`); mirroring server state or API entities into stores. |
| **Forms & Validation** | React Hook Form + pure JS Zod v4 schemas (`@hookform/resolvers/zod`). Calculate derived values synchronously during render. | Manual `useState` form inputs; computing derived form values inside `useEffect`; writing TypeScript types for schemas. |
| **UI Design System** | shadcn/ui primitives (`components/ui/*.jsx`) with `lucide-react` icons exclusively. Class merging via `cn()`. Radix `asChild` slots. | Heavy UI kits (MUI, AntD); mixing icon libraries; raw SVG dumps; raw template string class concatenation. |
| **Charts, Tables & Bars** | Official shadcn libraries exclusively: `components/ui/chart.jsx` (`recharts`), `components/ui/table.jsx` (`@tanstack/react-table`), `components/ui/progress.jsx` (`@radix-ui/react-progress`). | External chart kits (Chart.js, ApexCharts, CanvasJS); third-party table grids (MUI DataGrid, AG-Grid); ad-hoc canvas drawings. |
| **Routing & UX** | App Router with async `await params` (Next.js 16). Colocated `loading.js` skeletons and `error.js` boundaries. Client auth guards. | Synchronous `params` access; legacy `next/router` imports; blocking raw spinners; unhandled segment crashes. |
| **Asset Optimization** | `next/image` with dimensions or `fill` + `sizes`. External hosts in `images.remotePatterns`. Dynamic imports for heavy modals. | Raw HTML `<img />` tags; disabling image optimization (`unoptimized: true`); monolithic barrel files (`index.js`). |
| **Testing Workflow** | Strictly on-demand: focus 100% on building features first. MSW v2 network-level mocking and RTL user-centric assertions when requested. | Writing tests unprompted; mocking Axios modules (`vi.mock('axios')`); using TypeScript in test files. |

---

## 3. Approved Implementation Signatures

### A. Centralized Query Key Factory & TanStack Hook (`hooks/queries/use<Feature>.js`)
```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
   getFeatureList,
   getFeatureDetail,
   createFeature,
   updateFeature,
   destroyFeature,
} from '@/services/featureService';

export const featureKeys = {
   all: ['features'],
   lists: () => [...featureKeys.all, 'list'],
   list: (filters) => [...featureKeys.lists(), { filters }],
   details: () => [...featureKeys.all, 'detail'],
   detail: (id) => [...featureKeys.details(), id],
};

export function useFeatureListQuery(filters = {}) {
   return useQuery({
      queryKey: featureKeys.list(filters),
      queryFn: ({ signal }) => getFeatureList(filters, signal),
      staleTime: 0, // Fresh by default
   });
}

export function useCreateFeatureMutation() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (payload) => createFeature(payload),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: featureKeys.lists() });
      },
   });
}

export function useDestroyFeatureMutation() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (id) => destroyFeature(id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: featureKeys.lists() });
      },
   });
}
```

### B. Tier 5 API Service (`services/featureService.js`)
HTTP communication unwrapping Laravel ADR-001 response envelopes (`response.data?.data`) and propagating `AbortSignal`.
```javascript
import api from '@/lib/api/api';

export async function getFeatureList(filters = {}, signal) {
   const response = await api.get('/features', { params: filters, signal });
   return response.data?.data ?? [];
}

export async function getFeatureDetail(id, signal) {
   const response = await api.get(`/features/${id}`, { signal });
   return response.data?.data ?? null;
}

export async function createFeature(payload, signal) {
   const response = await api.post('/features/store', payload, { signal });
   return response.data?.data;
}

export async function updateFeature(id, payload, signal) {
   const response = await api.post(`/features/${id}/update`, payload, { signal });
   return response.data?.data;
}

export async function destroyFeature(id, signal) {
   const response = await api.post(`/features/${id}/destroy`, {}, { signal });
   return response.data?.data;
}
```

### C. Zustand UI Store with Atomic Selectors (`lib/store/uiStore.js`)
Client UI state only. Never mirror server state or API response entities.
```javascript
import { create } from 'zustand';

export const useUIStore = create((set) => ({
   isSidebarOpen: false,
   activeModal: null,
   toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
   openModal: (modalId) => set({ activeModal: modalId }),
   closeModal: () => set({ activeModal: null }),
}));

// Atomic Selectors:
export const useIsSidebarOpen = () => useUIStore((s) => s.isSidebarOpen);
export const useActiveModal = () => useUIStore((s) => s.activeModal);
```

### D. Laravel 422 Error Mapper (`utils/formErrors.js`)
Maps Laravel validation error bags directly into React Hook Form field errors.
```javascript
export function mapLaravelErrorsToForm(laravelErrors, setError) {
   if (!laravelErrors || typeof setError !== 'function') return;

   Object.entries(laravelErrors).forEach(([field, messages]) => {
      const message = Array.isArray(messages) ? messages[0] : String(messages);
      setError(field, { type: 'server', message });
   });
}
```

---

## 4. Topic Modules Directory

Consolidated architectural directives and module-specific standards:

### Active Modules

#### Module 01: Fundamentals & Language Standards
* **What it Does:** Enforces 100% pure JavaScript standards, JSDoc type hinting, state immutability, root `@/` aliasing, and React 19 compiler optimization rules.
* **Actionable Directives for AI Agents:**
  * **Strictly Pure JavaScript:** Write 100% pure JavaScript (`.js`, `.jsx`). Never write TypeScript (`.ts`, `.tsx`), interfaces, generics, or inline type annotations (`: string`, `<T>`).
  * **JSDoc Autocomplete:** Use standard JSDoc annotations (`@param`, `@returns`) on service methods and complex utilities for IDE and AI autocomplete without compilation friction.
  * **React 19 Compiler Purity:** Keep render functions pure and idempotent. Manual `useMemo`, `useCallback`, and `React.memo` wrappers are strictly forbidden.

#### Module 02: Frontend Architecture & 5-Tier Data Flow
* **What it Does:** Defines the 5-tier pipeline, Single Responsibility Principle (SRP) per layer, smart container vs. dumb UI decoupling, and flat directory conventions.
* **Actionable Directives for AI Agents:**
  * **5-Tier Execution:** Always adhere to: Page (RSC) $\rightarrow$ Feature Container (Client) $\rightarrow$ shadcn UI $\rightarrow$ TanStack Hook $\rightarrow$ Axios Service.
  * **Transport Shield:** Never call `api.get()` or `api.post()` inside JSX components; always route requests through TanStack Query hooks and API services.
  * **Dumb UI Decoupling:** Presentational components (`components/ui/` or `*Item.jsx`) must remain pure (props in, JSX out). Never import stores or services into them.

#### Module 03: API Consumer Layer & Laravel Contracts
* **What it Does:** Configures the centralized Axios client, guarantees request cancellation via `AbortSignal`, and unwraps Laravel ADR-001 responses.
* **Actionable Directives for AI Agents:**
  * **Centralized Client & Interceptors:** All HTTP calls route through `src/lib/api/api.js`. The request interceptor attaches Bearer tokens; ad-hoc Axios instances are forbidden.
  * **Backend Endpoint Alignment:** Call backend endpoints as defined in `ARCHITECTURE.md` / `backend/routes/api.php` (`/store`, `/{id}/update`, `/{id}/destroy`). Never invent unrouted methods.
  * **ADR-001 Response Unwrapping:** Tier 5 service functions must unwrap and return `response.data?.data`. Accept `{ signal }` in every service method and forward it to Axios.

#### Module 04: Server State & TanStack Query
* **What it Does:** Establishes the TkDodo query key factory standard, enforces fresh-by-default caching, outlines transactional vs. static caching rules, and standardizes mutation lifecycles.
* **Actionable Directives for AI Agents:**
  * **Centralized Query Key Factory:** Every feature must export a `featureKeys` factory (`all`, `lists()`, `list(filters)`, `detail(id)`). Hardcoded string arrays are forbidden.
  * **Fresh by Default (`staleTime: 0`):** Default to `staleTime: 0`. Transactional data (Cart, Orders, Addresses, Checkout, Profile) is **never** cached.
  * **Mutation Invalidation & Debouncing:** Invalidate query keys (`featureKeys.lists()`) in `onSuccess`. Debounce live search inputs by 300ms before passing values to query keys.

#### Module 05: Client State & Form Validation
* **What it Does:** Enforces separation between server state (TanStack) and client UI state (Zustand v5), mandates atomic store selectors, and standardizes React Hook Form with pure JS Zod v4 schemas.
* **Actionable Directives for AI Agents:**
  * **Atomic Zustand Selectors:** Consume UI stores strictly via atomic selector functions (`useUIStore((s) => s.prop)`). Destructuring stores or mirroring server state into stores is forbidden.
  * **Pure JS Zod Schemas:** Declare schemas in pure JavaScript (`.js`). Never write TypeScript types or interfaces (`z.infer`).
  * **Automated 422 Error Mapping:** Map Laravel 422 validation errors directly into input fields via `mapLaravelErrorsToForm(parsed.errors, form.setError)`. Calculate derived form values synchronously (zero `useEffect`).

#### Module 06: Routing, UX & App Router
* **What it Does:** Defines Server Component (RSC) vs. Client Component boundaries, standardizes multi-layout Route Groups, enforces Next.js 16 async params, and establishes client auth route protection.
* **Actionable Directives for AI Agents:**
  * **RSC Leaf Boundaries:** Keep root `page.js` as an ultra-thin Server Component (RSC); push `'use client'` down to interactive feature containers.
  * **Next.js 16 Async Dynamic APIs:** Always `await` dynamic route parameters: `const { id } = await params;` and `const query = await searchParams;`. Synchronous access is strictly forbidden.
  * **Modern Navigation & Auth Guards:** Import navigation hooks strictly from `next/navigation` (never `next/router`). Protect private containers with client auth guards.

#### Module 07: Design System & shadcn/ui
* **What it Does:** Establishes pure JavaScript shadcn/ui patterns in `components/ui/*.jsx`, standardizes class composition via `cn()`, enforces Tailwind CSS v4 semantic tokens, and mandates exclusive `lucide-react` icons.
* **Actionable Directives for AI Agents:**
  * **Pure JS shadcn Primitives:** Implement shadcn components in `components/ui/*.jsx` in pure JavaScript (`.jsx`). Zero TypeScript or `.tsx`.
  * **Class Merging via `cn()`:** Always merge Tailwind classes using `cn(...)`. Use Radix UI `<Slot>` via `asChild` for custom link/button triggers.
  * **Exclusive Lucide Iconography:** Import icons exclusively from `lucide-react`. Mixing icon libraries or pasting raw `<svg>` elements into components is strictly forbidden.

#### Module 08: Performance & Asset Optimization
* **What it Does:** Mandates Next.js image optimization (`<Image />`), eliminates Cumulative Layout Shift (CLS), requires remote domain authorization in `next.config.mjs`, and enforces dynamic code splitting.
* **Actionable Directives for AI Agents:**
  * **`<Image />` Component Mandate:** Always use `next/image` (`<Image />`). HTML `<img>` tags and global `unoptimized: true` bypasses are strictly forbidden.
  * **Remote Domains & Dimensions:** Register external backend hosts in `next.config.mjs`. Provide explicit `width`/`height` or use `fill` with an aspect-ratio container and `sizes` prop.
  * **Dynamic Code Splitting & No Barrel Files:** Lazy-load heavy modals, drawers, and client-only libraries (`next/dynamic` with `{ ssr: false }`). Monolithic barrel files (`index.js`) are strictly forbidden.

#### Module 09: Testing & Quality Assurance
* **What it Does:** Establishes on-demand pure JavaScript testing with React Testing Library, test-isolated `QueryClient` harnesses, and network-level API contract mocking with Mock Service Worker (MSW v2).
* **Actionable Directives for AI Agents:**
  * **On-Demand Testing Invariant:** In initial and active feature development, focus 100% on building UI and features. Never write test files or run test suites unprompted.
  * **Pure JS Testing:** Write all tests in pure JavaScript (`*.test.jsx`). Wrap tested containers in a fresh `QueryClient` per test with `{ queries: { retry: false } }`.
  * **MSW Network Contract Mocking:** Mock HTTP communication strictly at the network layer via MSW v2, mirroring the Laravel ADR-001 envelope. Direct Axios module mocking is forbidden.

#### Module 10: Research, ADRs & AI Standards
* **What it Does:** Establishes formal Frontend Architecture Decision Records (ADR-001-F, ADR-002-F) and defines inviolable operational guardrails for autonomous AI coding assistants.
* **Actionable Directives for AI Agents:**
  * **ADR-001-F & ADR-002-F Compliance:** Strictly consume Laravel ADR-001 envelopes (`response.data?.data`) and enforce centralized `featureKeys` across all features.
  * **AI Code Generation Guardrails:** Never speculate TypeScript types (`z.infer`). Always declare `{ signal }` in service methods and forward it to Axios.
  * **Operational Decision Matrix:** Prioritize building features, enforce pure JS, push `'use client'` to leaf boundaries, and never run tests unprompted.
