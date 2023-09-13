-- Create questions table without document_ids array
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

-- Create the join table
CREATE TABLE question_document_link (
    question_id bigint REFERENCES questions(id),
    document_id bigint REFERENCES documents(id),
    PRIMARY KEY (question_id, document_id)
);
