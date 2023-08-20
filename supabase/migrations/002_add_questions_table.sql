-- Up
DO $$ 
BEGIN

-- Up: Apply changes to the database

-- Create the questions table without the document_ids array
CREATE TABLE IF NOT EXISTS questions (
    id bigserial PRIMARY KEY,
    question_text text NOT NULL,
    generated_answer text,
    asked_on_whatsapp boolean NOT NULL DEFAULT false,
    whatsapp_message_id text,
    whatsapp_phone_number text,
    -- Ensure that whatsapp_message_id and whatsapp_phone_number are only 
    -- populated if asked_on_whatsapp is true
    CHECK ((asked_on_whatsapp = false AND whatsapp_message_id IS NULL AND whatsapp_phone_number IS NULL) OR
           (asked_on_whatsapp = true))
);

-- Create the join table for the many-to-many relationship
CREATE TABLE IF NOT EXISTS question_document_link (
    question_id bigint REFERENCES questions(id),
    document_id bigint REFERENCES documents(id),
    PRIMARY KEY (question_id, document_id)
);

EXCEPTION
    WHEN OTHERS THEN
    RAISE NOTICE 'Migration 002_add_questions_table UP has already been applied or failed.';
END $$;

-- Down
DO $$ 
BEGIN

-- Down: Revert changes applied in the up section

-- Drop the join table first due to the foreign key constraints
DROP TABLE IF EXISTS question_document_link;

-- Then drop the questions table
DROP TABLE IF EXISTS questions;

EXCEPTION
    WHEN OTHERS THEN
    RAISE NOTICE 'Migration 002_add_questions_table DOWN has already been applied or failed.';
END $$;
