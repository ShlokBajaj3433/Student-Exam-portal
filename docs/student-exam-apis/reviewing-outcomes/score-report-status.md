# Score Report Status

> **Status:** Placeholder — content not provided in source material.

## Expected Endpoint

| Method | Path | Controller |
|--------|------|------------|
| GET | `/api/student/attempts/{attemptId}/report/status` | `StudentExamController` |

## Expected Response

| Field | Type | Description |
|-------|------|-------------|
| `attemptId` | Long | Attempt identifier |
| `reportStatus` | ReportStatus | `PENDING`, `GENERATING`, `READY`, `FAILED` |
| `generatedAt` | LocalDateTime | When report was generated (if READY) |
| `downloadUrl` | String | Signed URL for PDF (if READY) |
| `expiresAt` | LocalDateTime | URL expiry (if READY) |

## ReportStatus Enum

| Value | Description |
|-------|-------------|
| `PENDING` | Report not yet requested |
| `GENERATING` | Async generation in progress |
| `READY` | Report available for download |
| `FAILED` | Generation failed |

## Expected Flow

1. Student requests report generation: `POST /api/student/attempts/{attemptId}/report`
2. Returns `202 Accepted` with `reportStatus=GENERATING`
3. Poll `GET /report/status` until `READY` or `FAILED`
4. Download from `downloadUrl` when ready

## To Be Documented

- Report template / contents
- Generation async mechanism (queue, scheduler)
- Retention policy for generated reports
- Regeneration allowed?
- Access control (student only, admin can view all)
- Bulk report generation for admins