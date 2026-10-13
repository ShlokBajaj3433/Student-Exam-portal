package com.examportal.service;

import com.examportal.dto.request.CreateQuestionRequest;
import com.examportal.enums.Difficulty;
import com.examportal.enums.QuestionType;
import com.examportal.exception.BadRequestException;
import com.examportal.service.impl.QuestionServiceImpl;
import jakarta.validation.Validator;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;

@Service
public class QuestionExcelService {
    public static final List<String> HEADERS = List.of("questionType", "questionText", "optionA", "optionB",
            "optionC", "optionD", "correctAnswer", "correctAnswers", "modelAnswer", "marks", "difficulty");
    private final QuestionService questions;
    private final Validator validator;

    public QuestionExcelService(QuestionService questions, Validator validator) {
        this.questions = questions;
        this.validator = validator;
    }

    public byte[] template() throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Questions");
            Row header = sheet.createRow(0);
            for (int i = 0; i < HEADERS.size(); i++) {
                header.createCell(i).setCellValue(HEADERS.get(i));
                sheet.setColumnWidth(i, i == 1 || i == 8 ? 15000 : 5500);
            }
            String[][] examples = {
                    {"MCQ", "What is 2 + 2?", "3", "4", "5", "6", "B", "", "", "1", "EASY"},
                    {"MULTIPLE_CHOICE", "Which numbers are even?", "2", "3", "4", "5", "", "A,C", "", "2", "MEDIUM"},
                    {"SHORT_ANSWER", "Explain photosynthesis.", "", "", "", "", "", "", "Plants convert light into chemical energy.", "5", "HARD"}
            };
            for (int r = 0; r < examples.length; r++) {
                Row row = sheet.createRow(r + 1);
                for (int c = 0; c < examples[r].length; c++) row.createCell(c).setCellValue(examples[r][c]);
            }
            sheet.createFreezePane(0, 1);
            workbook.write(output);
            return output.toByteArray();
        }
    }

    // All rows are validated before saving; any persistence failure rolls back the entire import.
    @Transactional
    public int importQuestions(MultipartFile file, String adminEmail) {
        String name = Optional.ofNullable(file.getOriginalFilename()).orElse("").toLowerCase(Locale.ROOT);
        if (file.isEmpty() || !(name.endsWith(".xlsx") || name.endsWith(".xls")))
            throw new BadRequestException("Choose a non-empty Excel file (.xlsx or .xls).");
        if (file.getSize() > 1024 * 1024)
            throw new BadRequestException("The Excel file must be 1 MB or smaller.");
        List<CreateQuestionRequest> requests = new ArrayList<>();
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            if (workbook.getNumberOfSheets() == 0) throw new BadRequestException("The workbook has no worksheets.");
            Sheet sheet = workbook.getSheetAt(0);
            DataFormatter formatter = new DataFormatter(Locale.ROOT);
            Row header = sheet.getRow(0);
            Map<String, Integer> columns = new HashMap<>();
            if (header != null) {
                for (Cell cell : header) {
                    String label = formatter.formatCellValue(cell).trim();
                    if (columns.put(label, cell.getColumnIndex()) != null)
                        throw new BadRequestException("Duplicate column: " + label);
                }
            }
            for (String required : HEADERS) {
                if (!columns.containsKey(required)) throw new BadRequestException("Missing column: " + required + ". Use the Excel template.");
            }
            if (sheet.getLastRowNum() > 5000) throw new BadRequestException("The worksheet must contain at most 5,000 rows.");
            for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null) continue;
                Map<String, String> values = new HashMap<>();
                for (String key : HEADERS) {
                    Cell cell = row.getCell(columns.get(key));
                    if (cell != null && cell.getCellType() == CellType.FORMULA)
                        throw new BadRequestException("Row " + (r + 1) + ": formulas are not supported. Paste values instead.");
                    String value = formatter.formatCellValue(cell).trim();
                    values.put(key, value.isEmpty() ? null : value);
                }
                if (values.values().stream().allMatch(Objects::isNull)) continue;
                if (requests.size() >= 500) throw new BadRequestException("Import at most 500 questions at a time.");
                try {
                    for (String option : List.of("optionA", "optionB", "optionC", "optionD")) {
                        if (values.get(option) != null && values.get(option).length() > 255)
                            throw new IllegalArgumentException(option + " must be 255 characters or fewer.");
                    }
                    CreateQuestionRequest request = new CreateQuestionRequest(
                            QuestionType.valueOf(upper(values.get("questionType"))), values.get("questionText"),
                            values.get("optionA"), values.get("optionB"), values.get("optionC"), values.get("optionD"),
                            upper(values.get("correctAnswer")), upper(values.get("correctAnswers")), values.get("modelAnswer"),
                            Integer.valueOf(values.get("marks")),
                            values.get("difficulty") == null ? null : Difficulty.valueOf(upper(values.get("difficulty"))));
                    var violations = validator.validate(request);
                    if (!violations.isEmpty()) throw new IllegalArgumentException(violations.stream()
                            .map(v -> v.getMessage()).sorted().collect(java.util.stream.Collectors.joining("; ")));
                    QuestionServiceImpl.validateForType(request.questionType(), request.optionA(), request.optionB(),
                            request.optionC(), request.optionD(), request.correctAnswer(), request.correctAnswers(), request.modelAnswer());
                    if (request.questionType() == QuestionType.MULTIPLE_CHOICE && !request.correctAnswers().matches("[ABCD](\\s*,\\s*[ABCD])*"))
                        throw new IllegalArgumentException("correctAnswers must use comma-separated letters, such as A,C.");
                    requests.add(request);
                } catch (IllegalArgumentException | NullPointerException ex) {
                    throw new BadRequestException("Row " + (r + 1) + ": " + (ex.getMessage() == null ? "Check questionType and marks." : ex.getMessage()));
                }
            }
        } catch (BadRequestException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new BadRequestException("Unable to read this Excel workbook. Upload a valid, unencrypted .xlsx or .xls file.");
        }
        if (requests.isEmpty()) throw new BadRequestException("The worksheet contains no questions.");
        requests.forEach(request -> questions.createQuestion(request, adminEmail));
        return requests.size();
    }

    private static String upper(String value) {
        return value == null ? null : value.toUpperCase(Locale.ROOT);
    }
}
