-- Match Question.java: MCQ uses correct_answer, MULTIPLE_CHOICE uses
-- correct_answers, and SHORT_ANSWER uses model_answer without options.
-- Existing rows are preserved. Application validation still enforces
-- required options/answers for each question type.
BEGIN;
ALTER TABLE questions
    ALTER COLUMN correct_answer DROP NOT NULL,
    ALTER COLUMN optiona DROP NOT NULL,
    ALTER COLUMN optionb DROP NOT NULL,
    ALTER COLUMN optionc DROP NOT NULL,
    ALTER COLUMN optiond DROP NOT NULL;
COMMIT;
