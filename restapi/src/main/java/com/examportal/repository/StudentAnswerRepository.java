package com.examportal.repository;

import com.examportal.entity.ExamAttempt;
import com.examportal.entity.StudentAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentAnswerRepository extends JpaRepository<StudentAnswer, Long> {

    /**
     * Returns all answers submitted within a given attempt.
     */
    List<StudentAnswer> findByAttempt(ExamAttempt attempt);
}
