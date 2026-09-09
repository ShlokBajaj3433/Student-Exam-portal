# API Request Collection

Postman collection for exercising all declared API operations.

---

## Collection File

**`ExamPortal.postman_collection.json`** — Postman Collection v2.1 schema

**Name:** Online Examination System

---

## Configuration

### 1. Set `baseUrl`

Replace checked-in default `http://localhost:8081` with running service origin.

> Backend declares `server.port=${PORT:8081}` — deployment `PORT` changes service port.

### 2. Review Fixture Accounts

Registration/login requests contain example admin/student credentials. **Rotate before real use.**

### 3. Create/Refresh Role Tokens

| Request | Action | Variable Set |
|---------|--------|--------------|
| Register Admin | POST `/api/auth/register/admin` | — |
| Login Admin | POST `/api/auth/login` | `adminToken` (on success status) |
| Register Student | POST `/api/auth/register/student` | — |
| Login Student | POST `/api/auth/login` | `studentToken` (on success status) |

Test scripts read response `token` field and assign to variable only when status condition matches.

### 4. Create/Refresh Resource IDs

| Request | Variable Set | Initial Value |
|---------|--------------|---------------|
| Create Exam | `examId` on 201 | 1 |
| Create Question | `questionId` on 201 | 1 |
| Start Exam | `attemptId` on 200 | 1 |

---

## Collection Structure

### Folders (by functional area)

- **Auth** — Registration, login, token refresh
- **Admin - Exams** — CRUD, publish, close, assign questions
- **Admin - Questions** — CRUD
- **Student - Exams** — Available exams, start attempt
- **Student - Attempts** — Save answers, submit, history
- **Security Tests** — Missing token, invalid token, wrong role

> Request entries contain empty response arrays — no captured responses. Successful execution must be confirmed against running service.

---

## Variable Reference

| Variable | Purpose | Source |
|----------|---------|--------|
| `baseUrl` | Service origin (e.g., `http://localhost:8081`) | Manual set |
| `adminToken` | ADMIN Bearer token | Login Admin response |
| `studentToken` | STUDENT Bearer token | Login Student response |
| `examId` | Current exam ID | Create Exam / manual |
| `questionId` | Current question ID | Create Question / manual |
| `attemptId` | Current attempt ID | Start Exam / manual |

---

## Security Test Requests

Verify protected access behavior:

- Missing `Authorization` header → 401
- Invalid/malformed Bearer token → 401
- Expired token → 401
- STUDENT token on ADMIN route → 403
- ADMIN token on STUDENT route → 403
- Valid token, principal not Student (attempt history) → 404

---

## Usage Notes

- Run requests in dependency order (auth → tokens → resources → dependent ops)
- Refresh tokens on expiry (24h default)
- Re-create resource IDs after database reset
- Collection provides **request templates only** — no test assertions beyond status checks