package com.examportal.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI / Swagger configuration for the Online Examination System API.
 *
 * Defines:
 *   - Global API metadata (title, version, contact)
 *   - JWT Bearer security scheme named "bearerAuth"
 *   - Global security requirement so all endpoints show the Authorize button
 *   - Grouped API views by functional tag (Auth, Exam, Question, Student, Admin)
 *
 * Public endpoints (/api/auth/**, /swagger-ui/**, /v3/api-docs/**) are already
 * permitted without authentication in SecurityConfig, so the UI is accessible
 * without a token.
 *
 */
@Configuration
public class SwaggerConfig {

    private static final String BEARER_AUTH = "bearerAuth";

    /**
     * Main OpenAPI bean.
     *
     * Sets up the API title, version, a JWT Bearer security scheme, and a
     * global security requirement so every operation shows the padlock icon
     * in the Swagger UI and the Authorization header is sent automatically
     * once a token is entered.
     */
    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(apiInfo())
                .addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH))
                .components(new Components()
                        .addSecuritySchemes(BEARER_AUTH, jwtBearerScheme()));
    }

    // ─── Grouped API views ────────────────────────────────────────────────────

    /** Auth group — registration and login endpoints */
    @Bean
    public GroupedOpenApi authGroup() {
        return GroupedOpenApi.builder()
                .group("Auth")
                .pathsToMatch("/api/auth/**")
                .build();
    }

    /** Exam group — admin exam management endpoints */
    @Bean
    public GroupedOpenApi examGroup() {
        return GroupedOpenApi.builder()
                .group("Exam")
                .pathsToMatch("/api/exams/**")
                .build();
    }

    /** Question group — admin question bank endpoints */
    @Bean
    public GroupedOpenApi questionGroup() {
        return GroupedOpenApi.builder()
                .group("Question")
                .pathsToMatch("/api/questions/**")
                .build();
    }

    /** Student group — student exam and profile endpoints */
    @Bean
    public GroupedOpenApi studentGroup() {
        return GroupedOpenApi.builder()
                .group("Student")
                .pathsToMatch("/api/student/**")
                .build();
    }

    /** Admin group — admin result, analytics, and user management endpoints */
    @Bean
    public GroupedOpenApi adminGroup() {
        return GroupedOpenApi.builder()
                .group("Admin")
                .pathsToMatch("/api/admin/**")
                .build();
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    private Info apiInfo() {
        return new Info()
                .title("Online Examination System API")
                .version("1.0")
                .description("REST API for the Online Examination System. " +
                        "Provides JWT-based authentication, role-based access control, " +
                        "exam management, timed exam attempts, automated result evaluation, " +
                        "and admin analytics.")
                .contact(new Contact()
                        .name("Exam Portal Team")
                        .email("support@examportal.com"));
    }

    /**
     * JWT Bearer security scheme.
     *
     * Scheme name: "bearerAuth"
     * Type: HTTP, scheme: bearer, bearerFormat: JWT
     *
     * This matches the @SecurityRequirement(name = "bearerAuth") used on
     * all secured controllers.
     */
    private SecurityScheme jwtBearerScheme() {
        return new SecurityScheme()
                .name(BEARER_AUTH)
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description("Provide a valid JWT token obtained from POST /api/auth/login. " +
                        "Enter it in the format: Bearer <token> (the 'Bearer ' prefix is added automatically).");
    }
}
