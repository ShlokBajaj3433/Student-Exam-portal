# Result Evaluation

> **Status:** Placeholder — content not provided in source material.

## Expected Endpoint

| Method | Path | Controller |
|--------|------|------------|
| GET | `/api/student/attempts/{attemptId}/evaluation` | `StudentExamController` |

## Access Rules

- Requires `STUDENT` role
- Attempt must belong to authenticated student
- Attempt status must be `SUBMITTED` or `TIMED_OUT` (not `IN_PROGRESS`)

## Expected Response

| Field | Type | Description |
|-------|------|-------------|
| `attemptId` | Long | Attempt identifier |
| `examTitle` | String | Exam title |
| `status` | AttemptStatus | `SUBMITTED` or `TIMED_OUT` |
| `startTime` | LocalDateTime | Attempt start |
| `endTime` | LocalDateTime | Attempt end (submit or timeout) |
| `durationMinutes` | Integer | Actual time spent |
| `totalMarks` | Integer | Exam total |
| `score` | Integer | Earned marks |
| `percentage` | Double | Score / totalMarks * 100 |
| `grade` | String | Letter grade (if configured) |
| `questionResults` | List<QuestionResult> | Per-question breakdown |

### QuestionResult

| Field | Type | Description |
|-------|------|-------------|
| `questionId` | Long | Question identifier |
| `questionText` | String | Question text |
| `questionType` | String | MCQ, TRUE_FALSE, etc. |
| `studentAnswer` | Object | Selected option(s) or text |
| `correctAnswer` | Object | Correct option(s) or answer key |
| `isCorrect` | Boolean | Auto-graded correctness |
| `marksAwarded` | Integer | Marks for this question |
| `maxMarks` | Integer | Question weight |
| `feedback` | String | Explanation (if any) |

## To Be Documented

- Manual grading status for subjective questions
- Score breakdown by section/topic
- Time spent per question
- Comparison to class average (if available)
- Review mode: show/hide correct answers based on policy
- Export result (PDF, CSV)