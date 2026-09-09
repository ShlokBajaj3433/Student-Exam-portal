# Save Answers

> **Status:** Placeholder — content not provided in source material.

## Expected Endpoint

| Method | Path | Controller |
|--------|------|------------|
| PUT/PATCH | `/api/student/attempts/{attemptId}/answers` | `StudentExamController` |

## Expected Behavior

1. Validate attempt exists, belongs to student, status=`IN_PROGRESS`
2. Validate not past `endTime` (exam duration)
3. Upsert answers for provided questions
4. Return updated attempt or saved answers summary

## Expected Request

```json
{
  "answers": [
    { "questionId": 1, "selectedOptionId": 3 },
    { "questionId": 2, "selectedOptionId": 1 },
    { "questionId": 3, "textResponse": "Short answer text" }
  ]
}
```

## Expected Response

| Field | Type | Description |
|-------|------|-------------|
| `savedCount` | Integer | Number of answers persisted |
| `attemptId` | Long | Attempt identifier |
| `lastSavedAt` | LocalDateTime | Timestamp of save |

## To Be Documented

- Answer format per question type (MCQ, multi-select, text, etc.)
- Partial saves allowed?
- Validation: question belongs to exam, option belongs to question
- Optimistic locking / version conflict handling
- Auto-save interval recommendations
- Offline/queue-then-sync support