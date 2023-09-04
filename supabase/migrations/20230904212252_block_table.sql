CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table to store block details

CREATE TABLE IF NOT EXISTS block (
    block_id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    block_type TEXT NOT NULL,
    content TEXT NOT NULL,
    file_url TEXT,  -- URL where the file is stored; NULL if the block is not a file
    is_file BOOLEAN NOT NULL DEFAULT FALSE,
    parent_id INTEGER,
    user_id UUID,  -- UUID to reference the user the block belongs to
    CONSTRAINT fk_parent FOREIGN KEY (parent_id) REFERENCES block(block_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_file_url_present CHECK ((is_file = TRUE AND file_url IS NOT NULL) OR (is_file = FALSE))
);



-- Table to store block references
CREATE TABLE IF NOT EXISTS block_references (
    block_ref_A INTEGER NOT NULL,  -- Changed from UUID to INTEGER
    block_ref_B INTEGER NOT NULL,  -- Changed from UUID to INTEGER

    -- Creating a unique constraint for A and B combinations
    CONSTRAINT uq_block_references UNIQUE (block_ref_A, block_ref_B)
);

-- Foreign key constraints
ALTER TABLE block_references ADD CONSTRAINT fk_block_ref_A FOREIGN KEY (block_ref_A) REFERENCES block(block_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE block_references ADD CONSTRAINT fk_block_ref_B FOREIGN KEY (block_ref_B) REFERENCES block(block_id) ON DELETE CASCADE ON UPDATE CASCADE;

-- Index on B for PostgreSQL
CREATE INDEX idx_block_ref_B ON block_references(block_ref_B);
