# Submit an Attempt

> **Status:** Placeholder — content not provided in source material.

## Expected Endpoint

| Method | Path | Controller |
|--------|------|------------|
| POST | `/api/student/attempts/{attemptId}/submit` | `StudentExamController` |

## Expected Behavior

1. Validate attempt exists, belongs to student, status=`IN_PROGRESS`
2. Mark `status=SUBMITTED`, `endTime=now`
3. Trigger scoring (auto-grade objective, queue subjective)
4. Return submission confirmation with preliminary score (if all auto-graded)

## Expected Request

```json
{
  // Optional: final answers if not already saved
  "answers": [
    { "questionId": 1, "selectedOptionId": 3 }
  ]
}
```

## Expected Response

| Field | Type | Description |
|-------|------|-------------|
| `attemptId` | Long | Attempt identifier |
| `status` | AttemptStatus | `SUBMITTED` |
| `submittedAt` | LocalDateTime | Submission timestamp |
| `score` | Integer | Auto-calculated score (null if manual grading needed) |
| `totalMarks` | Integer | Exam total marks |
| `gradedAt` | LocalDateTime | When grading completed (null if pending) |

## To Be Documented

- Scoring algorithm (partial credit, negative marking?)
- Manual grading workflow for subjective questions
- Score visibility timeline (immediate vs delayed)
- Submission after timeout (idempotent?)
- Confirmation / receipt for student