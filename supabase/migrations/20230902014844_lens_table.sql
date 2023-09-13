-- Create lens table
CREATE TABLE IF NOT EXISTS lens (
    lens_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    parent_id INTEGER REFERENCES lens(lens_id) ON DELETE SET NULL ON UPDATE CASCADE
);


-- Create lens_blocks table
CREATE TABLE IF NOT EXISTS lens_blocks (
    lens_id INTEGER NOT NULL REFERENCES lens(lens_id) ON DELETE CASCADE ON UPDATE CASCADE,
    block_id INTEGER NOT NULL REFERENCES block(block_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_lens_blocks UNIQUE (lens_id, block_id)
);


-- Foreign key constraints
ALTER TABLE lens_blocks ADD CONSTRAINT fk_lens FOREIGN KEY (lens_id) REFERENCES lens(lens_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE lens_blocks ADD CONSTRAINT fk_block FOREIGN KEY (block_id) REFERENCES block(block_id) ON DELETE CASCADE ON UPDATE CASCADE;

-- Create lens_references table
CREATE TABLE IF NOT EXISTS lens_references (
    lens_ref_A INTEGER NOT NULL REFERENCES lens(lens_id) ON DELETE CASCADE ON UPDATE CASCADE,
    lens_ref_B INTEGER NOT NULL REFERENCES lens(lens_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_lens_references UNIQUE (lens_ref_A, lens_ref_B)
);

-- Foreign key constraints
ALTER TABLE lens_references ADD CONSTRAINT fk_lens_ref_A FOREIGN KEY (lens_ref_A) REFERENCES lens(lens_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE lens_references ADD CONSTRAINT fk_lens_ref_B FOREIGN KEY (lens_ref_B) REFERENCES lens(lens_id) ON DELETE CASCADE ON UPDATE CASCADE;
