package com.examportal.service;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Stateless utility bean that encapsulates the grading policy.
 *
 * Requirements: 11.7, 11.8
 */
@Component
public class GradeCalculator {

    /**
     * Derives a letter grade from the given percentage using the standard policy:
     *
     * @param percentage score expressed as a percentage (e.g. 85.50)
     * @return letter grade string
     */
    public String calculateGrade(BigDecimal percentage) {
        if (percentage.compareTo(new BigDecimal("90.00")) >= 0) {
            return "A+";
        } else if (percentage.compareTo(new BigDecimal("80.00")) >= 0) {
            return "A";
        } else if (percentage.compareTo(new BigDecimal("70.00")) >= 0) {
            return "B";
        } else if (percentage.compareTo(new BigDecimal("60.00")) >= 0) {
            return "C";
        } else if (percentage.compareTo(new BigDecimal("40.00")) >= 0) {
            return "D";
        } else {
            return "F";
        }
    }

    /**
     * Returns {@code true} when the percentage represents a passing score (>= 40).
     *
     * @param percentage score expressed as a percentage
     * @return {@code true} if passed, {@code false} otherwise
     */
    public boolean isPassed(BigDecimal percentage) {
        return percentage.compareTo(new BigDecimal("40.00")) >= 0;
    }
}
