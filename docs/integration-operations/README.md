# Integration Operations

Operational tooling for API testing and local deployment.

## Contents

- [API Request Collection](api-request-collection.md) — Postman collection for exercising all endpoints
- [Local Service Configuration](local-service-configuration.md) — Docker Compose, environment, container pipeline

## Quick Reference

| Tool | File | Purpose |
|------|------|---------|
| Postman | `ExamPortal.postman_collection.json` | All endpoints with variables |
| Docker Compose | `docker-compose.yml` | Local PostgreSQL + app |
| Environment | `.env.example` | Local variable template |
| Backend Dockerfile | `Backend/Dockerfile` | Container build pipeline |