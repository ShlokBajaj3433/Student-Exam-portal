# Student Results

> **Status:** Placeholder — content not provided in source material.

## Expected Endpoint

| Method | Path | Controller |
|--------|------|------------|
| GET | `/api/student/results` | `StudentExamController` |

## Expected Response

Aggregated view of student performance across exams.

| Field | Type | Description |
|-------|------|-------------|
| `studentId` | Long | Student identifier |
| `studentName` | String | Student name |
| `totalExamsAttempted` | Integer | Count of SUBMITTED + TIMED_OUT |
| `totalExamsPassed` | Integer | Count where score >= pass threshold |
| `averageScore` | Double | Mean percentage across attempts |
| `bestScore` | Double | Highest percentage |
| `recentAttempts` | List<AttemptSummaryResponse> | Last N attempts |
| `examResults` | List<ExamResultSummary> | Per-exam aggregation |

### ExamResultSummary

| Field | Type | Description |
|-------|------|-------------|
| `examId` | Long | Exam identifier |
| `examTitle` | String | Exam title |
| `attemptCount` | Integer | Number of attempts |
| `bestScore` | Integer | Best score achieved |
| `latestScore` | Integer | Most recent score |
| `passed` | Boolean | Best attempt passed? |
| `lastAttemptDate` | LocalDateTime | Most recent attempt |

## To Be Documented

- Pass threshold configuration (global or per-exam)
- Time range filters (semester, academic year)
- Ranking / percentile (if enabled)
- Trend charts data
- Certificate eligibility