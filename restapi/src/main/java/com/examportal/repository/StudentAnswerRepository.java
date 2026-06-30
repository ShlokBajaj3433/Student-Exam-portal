package com.examportal.repository;

import com.examportal.entity.ExamAttempt;
import com.examportal.entity.Question;
import com.examportal.entity.StudentAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentAnswerRepository extends JpaRepository<StudentAnswer, Long> {

    /**
     * Returns all answers submitted within a given attempt.
     */
    List<StudentAnswer> findByAttempt(ExamAttempt attempt);

    /**
     * Finds a specific answer record for a (attempt, question) pair.
     * Used for upsert logic when saving an in-progress answer.
     */
    Optional<StudentAnswer> findByAttemptAndQuestion(ExamAttempt attempt, Question question);
}
