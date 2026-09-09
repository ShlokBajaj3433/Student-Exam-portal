# Reviewing Outcomes

Student attempt history and result review.

## Contents

- [Attempt History](attempt-history.md) — List of past attempts for authenticated student
- [Result Evaluation](result-evaluation.md) — Detailed attempt review (placeholder)
- [Student Results](student-results.md) — Aggregated results view (placeholder)
- [Score Report Status](score-report-status.md) — Report generation status (placeholder)

## Access

All endpoints: `GET /api/student/attempts/**` with `STUDENT` role
Identity resolved from authenticated principal

## Attempt Status & Navigation

| Status | Description | Result Navigation |
|--------|-------------|-------------------|
| `IN_PROGRESS` | Active attempt | No |
| `SUBMITTED` | Student submitted | Yes |
| `TIMED_OUT` | Auto-submitted on expiry | Yes |

> Frontend permits result navigation only for `SUBMITTED` or `TIMED_OUT`