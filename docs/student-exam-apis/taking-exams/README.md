# Taking Exams

Student exam participation workflows.

## Contents

- [Available Exams](available-exams.md) — Discover published exams in active window
- [Start an Attempt](start-attempt.md) — Begin exam attempt (placeholder)
- [Save Answers](save-answers.md) — Persist answers during attempt (placeholder)
- [Submit an Attempt](submit-attempt.md) — Finalize attempt (placeholder)
- [Automatic Timeout](automatic-timeout.md) — Server-side timeout handling (placeholder)

## Flow Overview

```
Available Exams → Start Attempt → [Save Answers]* → Submit Attempt
                                    ↓
                              Automatic Timeout
```

- `IN_PROGRESS` attempts can save answers multiple times
- `SUBMITTED` or `TIMED_OUT` are terminal states
- Only terminal attempts appear in Attempt History for result navigation

## Access

All endpoints: `GET/POST /api/student/exams/**` with `STUDENT` role