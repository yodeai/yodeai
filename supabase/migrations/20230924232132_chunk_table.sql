CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE chunk (
    chunk_id bigserial PRIMARY KEY,
    block_id bigint REFERENCES block(block_id), 
    content TEXT,
    metadata jsonb,
    embedding vector(1024),
    chunk_type TEXT,
    chunk_start INT,
    chunk_length INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW(); 
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_updated_at
BEFORE UPDATE ON chunk
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- Create a function to search for chunks
CREATE OR REPLACE FUNCTION match_chunks (
  query_embedding vector(1024),
  match_count INT DEFAULT NULL,
  filter JSONB DEFAULT '{}'
) RETURNS TABLE (
  chunk_id BIGINT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
#variable_conflict use_column
BEGIN
  RETURN QUERY
  SELECT
    c.chunk_id,
    c.content,
    c.metadata,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM chunk c
  WHERE c.metadata @> filter
  ORDER BY c.embedding <=> query_embedding
  LIMIT COALESCE(match_count, 10); -- 10 is a default limit if none is provided
END;
$$;
