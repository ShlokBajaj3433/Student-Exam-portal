package com.examportal.repository;

import com.examportal.entity.Exam;
import com.examportal.entity.Question;
import com.examportal.enums.ExamStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {

    Page<Exam> findByStatus(ExamStatus status, Pageable pageable);

    /**
     * Returns all PUBLISHED exams whose active window covers the given instant.
     */
    @Query("SELECT e FROM Exam e WHERE e.status = 'PUBLISHED' " +
           "AND :now BETWEEN e.startTime AND e.endTime")
    List<Exam> findPublishedWithinWindow(@Param("now") LocalDateTime now);

    /**
     * Returns a paginated list of PUBLISHED exams whose active window covers the given instant.
     */
    @Query("SELECT e FROM Exam e WHERE e.status = 'PUBLISHED' " +
           "AND :now BETWEEN e.startTime AND e.endTime")
    Page<Exam> findPublishedWithinWindowPaged(@Param("now") LocalDateTime now, Pageable pageable);

    boolean existsByTitleAndStartTimeBetween(String title, LocalDateTime windowStart, LocalDateTime windowEnd);

    /**
     * Returns true if the given question is assigned to at least one PUBLISHED exam.
     * Used to guard question deletion.
     */
    @Query("SELECT COUNT(e) > 0 FROM Exam e JOIN e.questions q " +
           "WHERE q = :question AND e.status = 'PUBLISHED'")
    boolean existsPublishedExamContaining(@Param("question") Question question);
}
