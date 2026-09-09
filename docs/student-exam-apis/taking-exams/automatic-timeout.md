# Automatic Timeout

> **Status:** Placeholder — content not provided in source material.

## Expected Behavior

- Server-side job/scheduler detects `IN_PROGRESS` attempts past `endTime`
- Auto-transitions status to `TIMED_OUT`
- Triggers same scoring pipeline as manual submit
- Student sees `TIMED_OUT` in attempt history (navigable for results)

## Implementation Approaches

| Approach | Description |
|----------|-------------|
| Scheduled job | `@Scheduled` polling for expired attempts |
| Database trigger | DB-level trigger on `endTime` passed |
| Event-driven | Attempt start schedules timeout event (Quartz, etc.) |
| Lazy evaluation | Status computed on read (attempt history, result view) |

## To Be Documented

- Chosen implementation approach
- Timeout precision (seconds/minutes)
- Grace period handling
- Student notification (email, in-app)
- Idempotency with manual submit race condition
- Partial answers at timeout (score what's saved)
- Cleanup of stale `IN_PROGRESS` attempts