# Runtime Configuration

## Application Bootstrap

The application starts through `ExamPortalApplication` and uses Spring Boot's standard application bootstrap.

## Runtime Defaults

| Setting | Value | Source |
|---------|-------|--------|
| Server Port | 8081 (unless `PORT` environment variable is provided) | `application.yml` / `application.properties` |
| Hikari Maximum Pool Size | 5 | Datasource configuration |
| Database Connection Timeout | 30,000 milliseconds | Datasource configuration |
| JWT Expiration | 86,400,000 milliseconds (24 hours) | `app.jwt.expiration-ms` |
| JWT Signing Secret | `APP_JWT_SECRET` environment variable; embedded fallback when unset | `app.jwt.secret` |

## Local Docker Compose Deployment

The `docker-compose.yml` declares the following services and configuration:

### Services

| Service | Image / Build | Purpose |
|---------|---------------|---------|
| `db` | `postgres:16-alpine` | PostgreSQL database with `examportal` database |
| `app` | `build: ./Backend` | Spring Boot application |

### Volumes

| Volume | Mount Path | Purpose |
|--------|------------|---------|
| `pgdata` | `/var/lib/postgresql/data` | Persistent PostgreSQL data storage |

### Startup Ordering

- Application startup is gated on the database health check (`service_healthy` condition).
- The db service healthcheck runs `pg_isready -U ${SUPABASE_DB_USER} -d examportal` with:
  - Start period: 20 seconds
  - Interval: 10 seconds
  - Timeout: 5 seconds
  - Retries: 5

> **Important:** These declarations define configuration and startup ordering; they do not guarantee a successful image build, database readiness, or application startup.

## Environment Variables

### Docker Compose (`.env.example`)

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_PASSWORD` | PostgreSQL password (used for both `POSTGRES_PASSWORD` and `SUPABASE_DB_PASSWORD`) | `<your-database-password>` |
| `SUPABASE_DB_USER` | PostgreSQL username | `postgres` |
| `APP_JWT_SECRET` | Base64-encoded HS256 secret, minimum 256-bit / 32-byte key | `<base64-encoded-256-bit-secret>` |

### Application Datasource (Compose)

| Variable | Value | Source |
|----------|-------|--------|
| `SUPABASE_DB_URL` | `jdbc:postgresql://db:5432/examportal` | `docker-compose.yml` |
| `SUPABASE_DB_USER` | `${SUPABASE_DB_USER}` | `docker-compose.yml` |
| `SUPABASE_DB_PASSWORD` | `${DB_PASSWORD}` | `docker-compose.yml` |
| `APP_JWT_SECRET` | `${APP_JWT_SECRET}` | `docker-compose.yml` |

### Direct Backend Deployment

| Variable | Description |
|----------|-------------|
| `SUPABASE_DB_URL` | `jdbc:postgresql://db.<project-ref>.supabase.co:5432/postgres?sslmode=require` |
| `SUPABASE_DB_USER` | `postgres` |
| `SUPABASE_DB_PASSWORD` | `<database-password>` |
| `APP_JWT_SECRET` | `<base64-encoded-256-bit-secret>` |

### Spring Boot Bindings

| Property | Value |
|----------|-------|
| `server.port` | `${PORT:8081}` |
| `spring.datasource.url` | `SUPABASE_DB_URL` |
| `spring.datasource.username` | `SUPABASE_DB_USER` |
| `spring.datasource.password` | `SUPABASE_DB_PASSWORD` |
| `spring.datasource.driver-class-name` | `org.postgresql.Driver` |
| `spring.jpa.hibernate.ddl-auto` | `update` |

## Container Artifact Path

The `Backend/Dockerfile` pipeline:

1. **Build Stage** (JDK 21 Alpine): Runs `./mvnw clean package -DskipTests -B`
2. **Runtime Stage** (JRE 21 Alpine): Copies `restapi-0.0.1-SNAPSHOT.jar` to `app.jar`
3. **Entrypoint**: `java -jar app.jar`

> **Note:** The build command includes `-DskipTests`, so this pipeline does not establish test execution or a successful image build.

## Readiness and Operational Limits

- Database healthcheck: `pg_isready -U ${SUPABASE_DB_USER} -d examportal` (20s start period, 10s interval, 5s timeout, 5 retries)
- No explicit validation or fail-fast handling for missing, placeholder, malformed, or unsuitable deployment values
- No declared restart or post-failure recovery action
- No successful database readiness or application startup recorded
- **Configure an explicit secure `APP_JWT_SECRET` rather than relying on the source-defined fallback**