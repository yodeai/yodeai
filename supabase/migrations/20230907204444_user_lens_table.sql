CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Assuming the users and lenses table have been created as mentioned before

-- Table to store user-lens relationships (sharing)

CREATE TABLE IF NOT EXISTS user_lens (
    id SERIAL PRIMARY KEY, 
    user_id UUID NOT NULL,
    lens_id INTEGER NOT NULL,
    access_type TEXT NOT NULL CHECK (access_type IN ('read', 'write', 'owner')),

    -- Ensuring a user can't have multiple access types for the same lens
    CONSTRAINT uq_user_lens UNIQUE (user_id, lens_id),

    -- Foreign key references
    CONSTRAINT fk_user_lens_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_user_lens_lens FOREIGN KEY (lens_id) REFERENCES lens(lens_id) ON DELETE CASCADE ON UPDATE CASCADE
);
