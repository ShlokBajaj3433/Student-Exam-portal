# Springboot-Project

Springboot-Project is a Spring Boot backend for an exam portal. It provides authenticated student identity and exam workflows, including profile management, published-exam discovery, and attempt-history retrieval, alongside administrative exam and question operations.

---

## Capabilities

### Student Workflows

- Retrieve and partially update the authenticated student profile.
- Discover published exams available within the active participation window.
- Review attempt summaries for the authenticated student.
- Use `SUBMITTED` and `TIMED_OUT` attempts for result navigation; `IN_PROGRESS` attempts are not treated as navigable results.

> **Note:** Student resources are resolved from the authenticated identity. Callers do not provide a student identifier.

### Administrative Operations

The API request collection exercises administrative operations for:

- Creating, listing, retrieving, updating, publishing, closing, and deleting exams.
- Creating, listing, retrieving, updating, and deleting questions.
- Assigning questions to exams.

---

## Architecture and Runtime

The application starts through `ExamPortalApplication` and uses Spring Boot's standard application bootstrap.

### Runtime Defaults

| Setting | Value |
|---------|-------|
| Port | 8081 (unless `PORT` is provided) |
| Hikari maximum connection pool size | 5 |
| Database connection timeout | 30,000 milliseconds |
| JWT expiration | 86,400,000 milliseconds |
| JWT signing secret | Supplied through `APP_JWT_SECRET`; embedded fallback when unset |

### Local Docker Compose Deployment

- **PostgreSQL 16 Alpine** db service with the `examportal` database
- **App service** built from `./Backend`
- **Persistent pgdata** volume
- Application startup gated on the database health check

> **Note:** These declarations define configuration and startup ordering; they do not guarantee a successful image build, database readiness, or application startup.

---

## Documentation Map

- [Platform Access](platform-access/README.md)
  - [Runtime Configuration](platform-access/runtime-configuration.md)
  - [Access Boundaries](platform-access/access-boundaries.md)
    - [Server Access Control](platform-access/server-access-control.md)
  - [Error Response Contract](platform-access/error-response-contract.md)
- [Identity APIs](identity-apis/README.md)
  - [Registration and Sign-In](identity-apis/registration-signin.md)
  - [Student Profile](identity-apis/student-profile.md)
  - [Admin Profile](identity-apis/admin-profile.md)
- [Administration APIs](administration-apis/README.md)
  - [Assessment Design](administration-apis/assessment-design.md)
  - [Administrative Review](administration-apis/administrative-review.md)
- [Student Exam APIs](student-exam-apis/README.md)
  - [Taking Exams](student-exam-apis/taking-exams/README.md)
    - [Available Exams](student-exam-apis/taking-exams/available-exams.md)
    - [Start an Attempt](student-exam-apis/taking-exams/start-attempt.md)
    - [Save Answers](student-exam-apis/taking-exams/save-answers.md)
    - [Submit an Attempt](student-exam-apis/taking-exams/submit-attempt.md)
    - [Automatic Timeout](student-exam-apis/taking-exams/automatic-timeout.md)
  - [Reviewing Outcomes](student-exam-apis/reviewing-outcomes/README.md)
    - [Attempt History](student-exam-apis/reviewing-outcomes/attempt-history.md)
    - [Result Evaluation](student-exam-apis/reviewing-outcomes/result-evaluation.md)
    - [Student Results](student-exam-apis/reviewing-outcomes/student-results.md)
    - [Score Report Status](student-exam-apis/reviewing-outcomes/score-report-status.md)
- [Integration Operations](integration-operations/README.md)
  - [API Request Collection](integration-operations/api-request-collection.md)
  - [Local Service Configuration](integration-operations/local-service-configuration.md)