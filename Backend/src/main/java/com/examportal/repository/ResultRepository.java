package com.examportal.repository;

import com.examportal.entity.ExamAttempt;
import com.examportal.entity.Result;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ResultRepository extends JpaRepository<Result, Long> {

    Optional<Result> findByAttempt(ExamAttempt attempt);

    /**
     * Returns results for a specific exam, paginated. Used by admin filtering.
     */
    @Query("SELECT r FROM Result r JOIN r.attempt a WHERE a.exam.examId = :examId")
    Page<Result> findByExamId(@Param("examId") Long examId, Pageable pageable);

    // ─── Analytics queries ────────────────────────────────────────────────────

    /**
     * Total number of evaluated results (across all exams).
     */
    @Query("SELECT COUNT(r) FROM Result r")
    long countTotalAttempts();

    /**
     * Number of results where passed = true.
     */
    @Query("SELECT COUNT(r) FROM Result r WHERE r.passed = true")
    long countPassedAttempts();

    /**
     * Average percentage score across all results.
     */
    @Query("SELECT AVG(r.percentage) FROM Result r")
    BigDecimal findAverageScore();

    /**
     * Returns a list of [examId, examTitle, totalAttempts, passedCount, avgPercentage]
     * grouped by exam — used to build per-exam stats in the analytics endpoint.
     */
    @Query("SELECT a.exam.examId, a.exam.title, COUNT(r), " +
           "SUM(CASE WHEN r.passed = true THEN 1 ELSE 0 END), AVG(r.percentage) " +
           "FROM Result r JOIN r.attempt a " +
           "GROUP BY a.exam.examId, a.exam.title")
    List<Object[]> findPerExamStats();

    /**
     * Returns all results for a specific exam (no pagination) — used to fetch
     * per-exam attempt data for difficulty breakdown computation.
     */
    @Query("SELECT r FROM Result r JOIN FETCH r.attempt a JOIN FETCH a.exam e " +
           "WHERE e.examId = :examId")
    List<Result> findAllByExamId(@Param("examId") Long examId);
}
