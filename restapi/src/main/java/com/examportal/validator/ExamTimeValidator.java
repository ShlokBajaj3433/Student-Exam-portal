package com.examportal.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.lang.reflect.Method;
import java.time.LocalDateTime;

/**
 * ConstraintValidator for {@link ValidTimeRange}.
 *
 * Reads {@code startTime()} and {@code endTime()} accessor methods (Java record accessors
 * or regular getter-style methods) from the annotated type. Validation passes when:
 *   - either value is null (field is optional), OR
 *   - endTime is strictly after startTime
 *
 */
public class ExamTimeValidator implements ConstraintValidator<ValidTimeRange, Object> {

    private String startTimeField;
    private String endTimeField;

    @Override
    public void initialize(ValidTimeRange constraintAnnotation) {
        this.startTimeField = constraintAnnotation.startTimeField();
        this.endTimeField = constraintAnnotation.endTimeField();
    }

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }

        try {
            // Java record accessor methods match the field name directly.
            // For POJO beans, try the field name first, then getXxx convention.
            LocalDateTime startTime = readLocalDateTime(value, startTimeField);
            LocalDateTime endTime = readLocalDateTime(value, endTimeField);

            // Null means "not provided" — skip cross-field check
            if (startTime == null || endTime == null) {
                return true;
            }

            boolean valid = endTime.isAfter(startTime);
            if (!valid) {
                // Point the constraint violation at the endTime field for clearer feedback
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate(context.getDefaultConstraintMessageTemplate())
                        .addPropertyNode(endTimeField)
                        .addConstraintViolation();
            }
            return valid;

        } catch (ReflectiveOperationException e) {
            // If the fields can't be read, fail validation with a clear message
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                    "Could not read '" + startTimeField + "' or '" + endTimeField + "' from the request")
                    .addConstraintViolation();
            return false;
        }
    }

    /**
     * Reads a {@link LocalDateTime} value from {@code obj} by first trying the field name
     * as a method (record accessor), then the {@code get<FieldName>} convention.
     */
    private LocalDateTime readLocalDateTime(Object obj, String fieldName)
            throws ReflectiveOperationException {

        // 1. Try record-style accessor: startTime()
        try {
            Method method = obj.getClass().getMethod(fieldName);
            Object result = method.invoke(obj);
            return (LocalDateTime) result;
        } catch (NoSuchMethodException ignored) {
            // fall through to getter convention
        }

        // 2. Try JavaBean getter: getStartTime()
        String getterName = "get" + Character.toUpperCase(fieldName.charAt(0)) + fieldName.substring(1);
        Method getter = obj.getClass().getMethod(getterName);
        Object result = getter.invoke(obj);
        return (LocalDateTime) result;
    }
}
