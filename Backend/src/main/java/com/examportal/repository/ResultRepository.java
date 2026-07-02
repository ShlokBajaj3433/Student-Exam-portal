package com.examportal.repository;

import com.examportal.entity.ExamAttempt;
import com.examportal.entity.Result;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResultRepository extends JpaRepository<Result, Long> {


    Optional<Result> findByAttempt(ExamAttempt attempt);

    /**
     * Returns results for a specific exam, paginated. Used by admin filtering 
     */
    @Query("SELECT r FROM Result r JOIN r.attempt a WHERE a.exam.examId = :examId")
    Page<Result> findByExamId(Long examId, Pageable pageable);
}
