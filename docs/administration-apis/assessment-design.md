# Assessment Design

> **Status:** Placeholder — content not provided in source material.

## Exam Management

### Create Exam
- **Endpoint:** `POST /api/exams`
- **Request:** Title, description, duration, totalMarks, startTime, endTime, status (DRAFT)
- **Response:** Created exam with `examId`, timestamps

### List Exams
- **Endpoint:** `GET /api/exams`
- **Parameters:** Pageable (page, size, sort)
- **Response:** Page<ExamResponse>

### Get Exam
- **Endpoint:** `GET /api/exams/{examId}`
- **Response:** ExamResponse with assigned questions

### Update Exam
- **Endpoint:** `PUT/PATCH /api/exams/{examId}`
- **Rules:** Only DRAFT exams editable? (Not specified)

### Publish Exam
- **Endpoint:** `POST /api/exams/{examId}/publish`
- **Effect:** Status → PUBLISHED, visible to students in active window

### Close Exam
- **Endpoint:** `POST /api/exams/{examId}/close`
- **Effect:** Status → CLOSED, no new attempts

### Assign Questions
- **Endpoint:** `POST /api/exams/{examId}/questions`
- **Request:** List of questionIds or question assignments with order/marks

### Delete Exam
- **Endpoint:** `DELETE /api/exams/{examId}`
- **Constraints:** Cannot delete if attempts exist? (Not specified)

## Question Management

### Create Question
- **Endpoint:** `POST /api/questions`
- **Request:** Text, type (MCQ, TRUE_FALSE, etc.), options, correctAnswer, marks

### List Questions
- **Endpoint:** `GET /api/questions`
- **Parameters:** Pageable, filters (type, examId?)

### Get Question
- **Endpoint:** `GET /api/questions/{questionId}`

### Update Question
- **Endpoint:** `PUT/PATCH /api/questions/{questionId}`

### Delete Question
- **Endpoint:** `DELETE /api/questions/{questionId}`

## To Be Documented

- Exam status enum and transitions
- Question type definitions
- Scoring rules per question type
- Validation constraints
- Soft delete vs hard delete
- Versioning / audit