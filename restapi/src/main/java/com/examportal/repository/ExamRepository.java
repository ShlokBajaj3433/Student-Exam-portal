package com.examportal.repository;

import com.examportal.entity.Exam;
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
     * Returns all PUBLISHED exams 
     */
    @Query("SELECT e FROM Exam e WHERE e.status = 'PUBLISHED' " +
           "AND :now BETWEEN e.startTime AND e.endTime")
    List<Exam> findPublishedWithinWindow(@Param("now") LocalDateTime now);

    boolean existsByTitleAndStartTimeBetween(String title, LocalDateTime windowStart, LocalDateTime windowEnd);
}
