
-- Up
DO $$ 
BEGIN

-- Up: Apply changes to the database

-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the documents table
CREATE TABLE IF NOT EXISTS documents (
  id bigserial PRIMARY KEY,
  content text, -- corresponds to Document.pageContent
  metadata jsonb, -- corresponds to Document.metadata
  embedding vector(1536) -- 1536 works for OpenAI embeddings, change if needed
);

-- Create the function
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(1536),
  match_count int default null,
  filter jsonb DEFAULT '{}'
) RETURNS table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
#variable_conflict use_column
BEGIN
  RETURN QUERY
  SELECT
    id,
    content,
    metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  FROM documents
  WHERE metadata @> filter
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

EXCEPTION
    WHEN OTHERS THEN
    RAISE NOTICE 'Migration 001_initial_setup UP has already been applied or failed.';
END $$;

-- Down
DO $$ 
BEGIN

-- Down: Revert changes applied in the up section

-- Drop the function (assuming no other function has the same signature)
DROP FUNCTION IF EXISTS match_documents(vector(1536), int, jsonb);

-- Drop the documents table
DROP TABLE IF EXISTS documents;

-- Disable the pgvector extension (only if you are sure no other part of the DB is using it)
DROP EXTENSION IF EXISTS vector;

EXCEPTION
    WHEN OTHERS THEN
    RAISE NOTICE 'Migration 001_initial_setup DOWN has already been applied or failed.';
END $$;
