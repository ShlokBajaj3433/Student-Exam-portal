# Student Exam APIs

Student-facing exam workflows: discovery, attempt management, and result review.

## Contents

### Taking Exams
- [Available Exams](taking-exams/available-exams.md) — Published exam discovery with pagination
- [Start an Attempt](taking-exams/start-attempt.md) — Begin a new exam attempt (placeholder)
- [Save Answers](taking-exams/save-answers.md) — Persist answers during attempt (placeholder)
- [Submit an Attempt](taking-exams/submit-attempt.md) — Finalize and score attempt (placeholder)
- [Automatic Timeout](taking-exams/automatic-timeout.md) — Server-side attempt timeout handling (placeholder)

### Reviewing Outcomes
- [Attempt History](reviewing-outcomes/attempt-history.md) — List of past attempts for authenticated student
- [Result Evaluation](reviewing-outcomes/result-evaluation.md) — Detailed attempt review (placeholder)
- [Student Results](reviewing-outcomes/student-results.md) — Aggregated results view (placeholder)
- [Score Report Status](reviewing-outcomes/score-report-status.md) — Report generation status (placeholder)

## Access Boundary

| API Family | Route Prefix | Required Role | Identity Resolution |
|------------|--------------|---------------|---------------------|
| Taking Exams | `/api/student/exams/**` | STUDENT | From principal |
| Reviewing Outcomes | `/api/student/attempts/**` | STUDENT | From principal |

## Common Patterns

- All endpoints require valid JWT with `STUDENT` role
- Student identity **never** passed as parameter — resolved from `authentication.getName()` (email)
- `@PreAuthorize("hasRole('STUDENT')")` on controllers + `SecurityConfig` route protection
- Responses use DTOs: `ExamResponse`, `AttemptSummaryResponse`, etc.

## Exam Status & Attempt Status

### ExamStatus
| Value | Meaning |
|-------|---------|
| `DRAFT` | Not visible to students |
| `PUBLISHED` | Visible during active window |
| `CLOSED` | No new attempts allowed |

### AttemptStatus
| Value | Meaning | Navigable for Results |
|-------|---------|----------------------|
| `IN_PROGRESS` | Attempt started, not submitted | No |
| `SUBMITTED` | Student submitted | Yes |
| `TIMED_OUT` | Auto-submitted on expiry | Yes |

## To Be Documented

- Attempt lifecycle state machine
- Concurrency control (one active attempt per exam?)
- Answer format and validation
- Scoring algorithm
- Timezone handling for exam windows