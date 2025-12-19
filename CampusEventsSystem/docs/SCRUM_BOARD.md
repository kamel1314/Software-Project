# Scrum Board

## What It Is
A Scrum board is a Kanban-style board that visualizes workflow and progress. It organizes tasks (Issues) into columns representing stages of completion:

- **To Do**: Not started; ready to be picked up.
- **In Progress**: Currently being worked on.
- **Review**: Completed but awaiting review/approval (testing, code review, QA).
- **Done**: Finished and accepted; meets definition of done.

Moving cards left-to-right shows progress. Bottlenecks (e.g., too many in Review) become visible.

## What You Need
- **Issue Tracking**: Each task linked to PROJECT_ISSUES.md or GitHub Issues.
- **Assignment**: Who is working on it.
- **Priority/Label**: P0/P1/P2 severity tags; epic/component tags.
- **Estimate**: Effort (story points or t-shirt sizing: S/M/L).
- **Target Sprint**: e.g., Sprint 1, Sprint 2.
- **Update Cadence**: Move cards as work progresses; review daily/weekly.

## Sprint Structure (Optional)
- **Sprint Duration**: 1–2 weeks.
- **Sprint Goal**: what to ship in this sprint.
- **Sprint Backlog**: items selected for the sprint (from BACKLOG.md).
- **Retrospective**: post-sprint review; lessons learned.

---

## Current Sprint Board

### To Do
- [ ] (P0) Create event: title/date/location/description/capacity/status with validation. — **Backlog Epic: Event Management** — Estimate: L
- [ ] (P0) Unregister from event. — **Backlog Epic: Registration** — Estimate: M
- [ ] (P0) Date validation: YYYY-MM-DD, real date, today/future only. — **Backlog Epic: Validation & Data Integrity** — Estimate: M
- [ ] (P0) Unit tests: validation helpers, capacity/status logic. — **Backlog Epic: Testing & Quality** — Estimate: L

### In Progress
- [ ] (P0) Register for event: requires 9-digit student ID + name; blocks when full/cancelled/completed. — **Assigned to:** _(add name)_ — Estimate: L
- [ ] (P0) Integration tests: API endpoints, role enforcement, capacity constraints. — **Assigned to:** _(add name)_ — Estimate: L

### Review
- [ ] (P0) Edit event: update all fields with validation. — **PR/Review Date:** _(add)_ — **Reviewer:** _(add name)_
- [ ] (P0) Prevent duplicate registrations; enforce capacity. — **PR/Review Date:** _(add)_ — **Reviewer:** _(add name)_

### Done
- [ ] (P0) Admin-only endpoints: create/update/delete events, view registrations, analytics. ✅
- [ ] (P0) Student-only actions: register/unregister. ✅
- [ ] (P0) Field limits: title/location ≤200 chars; description ≤1000; capacity 1–100000; status enum. ✅

---

## How to Update
1. **Pick a task** from To Do.
2. **Add assignee** and move to In Progress.
3. **Open a PR or branch** with a link.
4. **Move to Review** when ready for testing/code review.
5. **Add reviewer/tester** notes.
6. **Move to Done** when accepted and merged/deployed.

## Backlog Link
See [BACKLOG.md](BACKLOG.md) for the full epic and priority breakdown.

## Notes
- Use labels/tags to filter: P0, P1, P2, Epic name, Component (e.g., frontend, backend, db).
- Sync with PROJECT_ISSUES.md for detailed issue descriptions.
- Daily standup: what moved yesterday, blockers, what's next.