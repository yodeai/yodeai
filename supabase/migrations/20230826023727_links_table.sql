-- Up
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'links') THEN
        CREATE TABLE links (
            id SERIAL PRIMARY KEY,
            url VARCHAR(2048) NOT NULL,
            title VARCHAR(255) NOT NULL
        );
    END IF;
END $$;

