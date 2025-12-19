# Backlog

## Epic: Event Management (Admin)
- (P0) Create event: title/date/location/description/capacity/status with validation.
- (P0) Edit event: update all fields with validation.
- (P0) Delete event: remove event and cascade registrations.
- (P1) View events list: sortable/filterable by date/status.
- (P1) Event detail view: show full info + capacity/registrations summary.

## Epic: Registration (Student)
- (P0) Register for event: requires 9-digit student ID + name; blocks when full/cancelled/completed.
- (P0) Unregister from event.
- (P1) Check registration status per event.
- (P0) Prevent duplicate registrations; enforce capacity.

## Epic: Roles & Access Control
- (P0) Admin-only endpoints: create/update/delete events, view registrations, analytics.
- (P0) Student-only actions: register/unregister.
- (P1) Anonymous: read-only access to events and capacity info.

## Epic: Validation & Data Integrity
- (P0) Date validation: YYYY-MM-DD, real date, today/future only.
- (P0) Field limits: title/location ≤200 chars; description ≤1000; capacity 1–100000; status enum.
- (P0) Student ID: exactly 9 digits.
- (P0) Atomic registration to avoid overbooking and ensure consistency.

## Epic: Analytics (Admin)
- (P1) Summary: total events, total capacity, total registrations.
- (P1) Per-event stats: capacity, registrations, spots left.

## Epic: Frontend UX
- (P1) Event list page: display key fields, status, capacity/remaining spots.
- (P1) Event detail page: richer info and action buttons (register/unregister) gated by role/status.
- (P1) Admin UI for create/edit/delete events.
- (P2) Role selection/toggle (localStorage) and student info prompts (sessionStorage).
- (P1) Input validation and user-friendly error messages.

## Epic: Testing & Quality
- (P0) Unit tests: validation helpers, capacity/status logic.
- (P0) Integration tests: API endpoints, role enforcement, capacity constraints.
- (P1) E2E tests: admin create/update/delete; student register/unregister; full/cancelled/completed scenarios.
- (P1) Frontend tests: API client functions, storage handling, button-state logic.

## Epic: Infrastructure
- (P2) Configurable environment (port, DB path).
- (P2) Docker compose for local run.
- (P2) CI step to run tests and report coverage.

## Priorities
- P0: Must-have for MVP (core CRUD, registration, validation, auth, atomicity, critical tests).
- P1: Should-have for a solid release (UX polish, analytics, status-aware UI, broader tests).
- P2: Nice-to-have (role toggle UI niceties, infra convenience).
