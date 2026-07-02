package com.examportal;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Spring Boot context load test.
 * Verifies the full application context starts correctly against H2.
 */
@SpringBootTest
@ActiveProfiles("test")
class ExamPortalApplicationTests {

    @Test
    void contextLoads() {
        // If the application context loads without exceptions, this test passes.
    }
}
