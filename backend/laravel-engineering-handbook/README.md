# Laravel Engineering Handbook

> **The definitive architectural standard and coding blueprint for modern Laravel applications.**

---

## 1. What This Handbook Does

This handbook is a centralized, reusable engineering guide. Instead of reinventing architecture for every project, it establishes a single, reliable way to build Laravel backends:

* **Ultra-Thin Controllers & Safe Transactions:** Controllers coordinate requests and manage database transactions (`DB::beginTransaction()`, `DB::commit()`, `DB::rollBack()`).
* **Decoupled Business Logic:** Flat services (`app/Services/`) focus purely on business rules without transaction wrappers or HTTP state (`Auth::user()` is forbidden in services).
* **Deterministic API Contracts:** Strict 2-verb routing (`GET`/`POST`) and unified JSON responses (ADR-001).
* **Database & Concurrency Safety:** Foreign key protection (`restrictOnDelete()`), pessimistic locking (`lockForUpdate()`), and method-based `casts(): array`.
* **AI-Ready Precision:** Serves as the ground truth for AI coding assistants (Antigravity, Cursor, Claude Code) to prevent code hallucinations.

---

## 2. How to Use It in Any Project

### For Developers
1. **Quick Reference:** Read [GUIDELINES.md](GUIDELINES.md) for approved code signatures (Controllers, Form Requests, Services, Resources).
2. **Building Features:** Follow the 5-tier pipeline: `FormRequest` $\rightarrow$ `Controller` $\rightarrow$ `Domain Service` $\rightarrow$ `API Resource` $\rightarrow$ `Pest Feature Test`.
3. **Reviewing Code:** Use the 5-point review rubric defined in [GUIDELINES.md](GUIDELINES.md) to evaluate PRs before merging.

### For AI Coding Assistants
* Reference [`backend/AGENTS.md`](../AGENTS.md) (or root [`AGENTS.md`](../../AGENTS.md)) as the canonical entry point.
* The agent reads [GUIDELINES.md](GUIDELINES.md) first to load company invariants into memory.

---

## 3. Engineering Invariant Domains (Detailed in [GUIDELINES.md](GUIDELINES.md))

All 10 domains are fully consolidated in [GUIDELINES.md](GUIDELINES.md):

1. **Fundamentals & Language Standards:** PHP 8.4 typing, backed enums in `casts(): array`, exhaustive `match()`, pragmatic SOLID.
2. **Application Architecture & Layer Boundaries:** 6 backend layers, flat `app/Services/`, no artificial folders (`DTOs/`, `Repositories/`).
3. **API Engineering Standards:** Strict 2-verb routing (`GET`/`POST`), array validation, `$this->whenLoaded()` guarded resources.
4. **Business Logic & Domain Architecture:** Pure services, `User $user` injection, transaction pre-flights, typed domain exceptions.
5. **Database Engineering & Persistence:** `restrictOnDelete()` safety, `lockForUpdate()` concurrency, method-based `casts()`.
6. **Code Quality & Static Analysis:** Laravel Pint, Larastan Level 8, 5-point Invariant Review Rubric.
7. **Security & Performance:** Webhook HMAC SHA256 verification, `->afterCommit()` cache safety, Sanctum decoupling.
8. **Testing & Quality Assurance:** Pest feature tests, strict `postJson()` testing, external-only gateway mocking (`Http::fake()`).
9. **AI Engineering & MCP Standards:** Laravel MCP tools delegating to flat domain services, exception shielding.
10. **Architecture Decision Records (ADRs):** ADR-001 unified response envelope specification.
