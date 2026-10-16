package com.examportal;

import com.examportal.entity.Exam;
import com.examportal.enums.ExamStatus;
import com.examportal.repository.ExamRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.PageRequest;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;
import static org.junit.jupiter.api.Assertions.assertEquals;

@DataJpaTest
class ExamAvailabilityTest {
    @Autowired ExamRepository exams;

    @Test
    void includesOpenEndedAndActiveExamsButExcludesInactiveExams() {
        var now = LocalDateTime.of(2026, 10, 14, 12, 0);
        save("Open", ExamStatus.PUBLISHED, null, null);
        save("No end", ExamStatus.PUBLISHED, now.minusHours(1), null);
        save("No start", ExamStatus.PUBLISHED, null, now.plusHours(1));
        save("Active", ExamStatus.PUBLISHED, now.minusHours(1), now.plusHours(1));
        save("Expired", ExamStatus.PUBLISHED, null, now.minusHours(1));
        save("Future", ExamStatus.PUBLISHED, now.plusHours(1), null);
        save("Draft", ExamStatus.DRAFT, null, null);
        save("Closed", ExamStatus.CLOSED, null, null);
        var expected = Set.of("Open", "No end", "No start", "Active");
        assertEquals(expected, exams.findPublishedWithinWindow(now).stream()
                .map(Exam::getTitle).collect(Collectors.toSet()));
        assertEquals(expected, exams.findPublishedWithinWindowPaged(now, PageRequest.of(0, 20))
                .stream().map(Exam::getTitle).collect(Collectors.toSet()));
    }

    private void save(String title, ExamStatus status, LocalDateTime start, LocalDateTime end) {
        var exam = new Exam();
        exam.setTitle(title);
        exam.setStatus(status);
        exam.setDurationMinutes(120);
        exam.setStartTime(start);
        exam.setEndTime(end);
        exams.save(exam);
    }
}
