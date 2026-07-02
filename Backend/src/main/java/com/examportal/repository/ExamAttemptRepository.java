package com.examportal.repository;

import com.examportal.entity.Exam;
import com.examportal.entity.ExamAttempt;
import com.examportal.entity.Student;
import com.examportal.enums.AttemptStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Long> {

    /**
     * Finds an attempt for a given student/exam/status triple.
     */
    Optional<ExamAttempt> findByStudentAndExamAndAttemptStatus(
            Student student, Exam exam, AttemptStatus attemptStatus);

    /**
     * Returns all attempts for a student, paginated. Used for attempt history
     */
    Page<ExamAttempt> findByStudent(Student student, Pageable pageable);

    /**
     * Finds all IN_PROGRESS attempts whose deadline has passed.
     */
    @Query("SELECT a FROM ExamAttempt a JOIN FETCH a.exam e " +
           "WHERE a.attemptStatus = 'IN_PROGRESS'")
    List<ExamAttempt> findAllInProgress();

    /**
     * Finds IN_PROGRESS attempts where startTime is before the provided cutoff.
     */
    @Query("SELECT a FROM ExamAttempt a JOIN FETCH a.exam e " +
           "WHERE a.attemptStatus = 'IN_PROGRESS' AND a.startTime < :cutoff")
    List<ExamAttempt> findTimedOutAttempts(@Param("cutoff") LocalDateTime cutoff);
}
