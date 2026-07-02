package com.examportal.validator;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Class-level constraint that enforces {@code endTime > startTime} when both fields
 * are non-null on a DTO. Apply this annotation to the record/class itself.
 *
 */
@Documented
@Constraint(validatedBy = ExamTimeValidator.class)
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidTimeRange {

    String message() default "End time must be strictly after start time";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    /** Name of the accessor method / field that provides the start time. */
    String startTimeField() default "startTime";

    /** Name of the accessor method / field that provides the end time. */
    String endTimeField() default "endTime";
}
