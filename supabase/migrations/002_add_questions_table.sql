-- Up
DO $$ 
BEGIN

-- Up: Apply changes to the database

-- Add the UUID extension, which is needed to generate UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the questions table with UUID for id
CREATE TABLE IF NOT EXISTS questions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),  -- Link to the user who asked the question
    question_text text NOT NULL,
    slug text UNIQUE NOT NULL,  -- Added slug column with uniqueness constraint
    generated_answer text,
    asked_on_whatsapp boolean NOT NULL DEFAULT false,
    whatsapp_message_id text,
    whatsapp_phone_number text,
    CHECK ((asked_on_whatsapp = false AND whatsapp_message_id IS NULL AND whatsapp_phone_number IS NULL) OR
           (asked_on_whatsapp = true))
);

-- Create the join table for the many-to-many relationship
CREATE TABLE IF NOT EXISTS question_document_link (
    question_id uuid REFERENCES questions(id),
    document_id bigint REFERENCES documents(id),
    PRIMARY KEY (question_id, document_id)
);

EXCEPTION
    WHEN OTHERS THEN
    RAISE NOTICE 'Migration 002_add_questions_table UP has already been applied or failed.';
END $$;
