# Start an Attempt

> **Status:** Placeholder — content not provided in source material.

## Expected Endpoint

| Method | Path | Controller |
|--------|------|------------|
| POST | `/api/student/exams/{examId}/attempts` | `StudentExamController` |

## Expected Behavior

1. Validate exam is `PUBLISHED` and within active window
2. Check student has no existing `IN_PROGRESS` attempt for this exam
3. Create `ExamAttempt` with `status=IN_PROGRESS`, `startTime=now`
4. Return attempt details with `attemptId`

## Expected Request

```json
{
  // No body required, or optional initial answers
}
```

## Expected Response

| Field | Type | Description |
|-------|------|-------------|
| `attemptId` | Long | New attempt identifier |
| `examId` | Long | Exam identifier |
| `examTitle` | String | Exam title |
| `status` | AttemptStatus | `IN_PROGRESS` |
| `startTime` | LocalDateTime | Attempt start timestamp |
| `endTime` | LocalDateTime | Calculated expiry (startTime + durationMinutes) |
| `durationMinutes` | Integer | From exam |
| `totalMarks` | Integer | From exam |
| `questions` | List<QuestionSnapshot> | Questions with options (no correct answers) |

## To Be Documented

- Concurrency: one active attempt per student per exam?
- Question snapshot content (shuffled options?)
- Time remaining calculation
- Client-side timer synchronization
- Resume attempt after disconnect