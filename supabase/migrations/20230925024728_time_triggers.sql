-- Create the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW(); 
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on lens table
CREATE TRIGGER tr_update_updated_at
BEFORE UPDATE ON lens
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- Create the trigger on block table
CREATE TRIGGER tr_update_updated_at_block
BEFORE UPDATE ON block
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
