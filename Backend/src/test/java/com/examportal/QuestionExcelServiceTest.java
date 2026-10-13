package com.examportal;

import com.examportal.exception.BadRequestException;
import com.examportal.service.QuestionExcelService;
import com.examportal.service.QuestionService;
import jakarta.validation.Validation;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class QuestionExcelServiceTest {
    private QuestionService questions;
    private QuestionExcelService excel;

    @BeforeEach
    void setup() {
        questions = mock(QuestionService.class);
        excel = new QuestionExcelService(questions, Validation.buildDefaultValidatorFactory().getValidator());
    }

    @Test
    void importsAllThreeQuestionTypesFromTemplate() throws Exception {
        assertEquals(3, excel.importQuestions(file(excel.template()), "admin@example.com"));
        verify(questions, times(3)).createQuestion(any(), eq("admin@example.com"));
    }

    @Test
    void invalidLaterRowDoesNotSaveEarlierRows() throws Exception {
        try (var workbook = WorkbookFactory.create(new ByteArrayInputStream(excel.template()));
             var output = new ByteArrayOutputStream()) {
            workbook.getSheetAt(0).getRow(3).getCell(9).setCellValue("0");
            workbook.write(output);
            var error = assertThrows(BadRequestException.class,
                    () -> excel.importQuestions(file(output.toByteArray()), "admin@example.com"));
            assertTrue(error.getMessage().contains("Row 4"));
            verifyNoInteractions(questions);
        }
    }

    @Test
    void rejectsMissingHeadersAndCorruptWorkbooks() throws Exception {
        try (var workbook = WorkbookFactory.create(new ByteArrayInputStream(excel.template()));
             var output = new ByteArrayOutputStream()) {
            workbook.getSheetAt(0).getRow(0).getCell(1).setCellValue("wrongHeader");
            workbook.write(output);
            assertThrows(BadRequestException.class,
                    () -> excel.importQuestions(file(output.toByteArray()), "admin@example.com"));
        }
        assertThrows(BadRequestException.class,
                () -> excel.importQuestions(file(new byte[]{1, 2, 3}), "admin@example.com"));
        verifyNoInteractions(questions);
    }

    private MockMultipartFile file(byte[] bytes) {
        return new MockMultipartFile("file", "questions.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", bytes);
    }

    @Test
    void rejectsFormulasWithRowNumber() throws Exception {
        try (var workbook = WorkbookFactory.create(new ByteArrayInputStream(excel.template()));
             var output = new ByteArrayOutputStream()) {
            workbook.getSheetAt(0).getRow(1).getCell(9).setCellFormula("1+1");
            workbook.write(output);
            var error = assertThrows(BadRequestException.class,
                    () -> excel.importQuestions(file(output.toByteArray()), "admin@example.com"));
            assertTrue(error.getMessage().contains("Row 2"));
            verifyNoInteractions(questions);
        }
    }

    @Test
    void importsLegacyXlsWorkbook() throws Exception {
        try (var workbook = new org.apache.poi.hssf.usermodel.HSSFWorkbook();
             var output = new ByteArrayOutputStream()) {
            var sheet = workbook.createSheet("Questions");
            var header = sheet.createRow(0);
            for (int c = 0; c < QuestionExcelService.HEADERS.size(); c++)
                header.createCell(c).setCellValue(QuestionExcelService.HEADERS.get(c));
            var row = sheet.createRow(1);
            row.createCell(0).setCellValue("SHORT_ANSWER");
            row.createCell(1).setCellValue("Explain gravity.");
            row.createCell(8).setCellValue("An attraction between masses.");
            row.createCell(9).setCellValue(2);
            workbook.write(output);
            assertEquals(1, excel.importQuestions(new MockMultipartFile("file", "questions.xls",
                    "application/vnd.ms-excel", output.toByteArray()), "admin@example.com"));
        }
    }
}
