# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /app

# Copy Maven wrapper and project descriptor first (layer cache)
COPY .mvn/ .mvn/
COPY mvnw mvnw
COPY pom.xml pom.xml

# Make the wrapper executable (needed on Linux)
RUN chmod +x mvnw

# Pre-download dependencies (improves rebuild speed when only source changes)
RUN ./mvnw dependency:go-offline -B

# Copy source and build
COPY src/ src/
RUN ./mvnw clean package -DskipTests -B

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runtime

WORKDIR /app

# Copy the fat JAR produced by the build stage
COPY --from=build /app/target/restapi-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
