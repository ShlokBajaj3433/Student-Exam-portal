package com.examportal.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Configuration class that enables Spring's scheduled task execution.
 *
 * This activates the {@code @Scheduled} annotation processing that drives
 * the exam auto-timeout mechanism in {@code ExamAttemptServiceImpl}.
 *
 * Requirements: 12.1
 */
@Configuration
@EnableScheduling
public class SchedulerConfig {
    // No additional bean definitions required;
    // @EnableScheduling activates the scheduler infrastructure.
}
