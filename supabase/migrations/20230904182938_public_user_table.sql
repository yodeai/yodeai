-- USERS
CREATE TABLE public.users (
  id UUID NOT NULL PRIMARY KEY, -- UUID from auth.users
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT 
);
COMMENT ON TABLE public.users IS 'Profile data for each user.';
COMMENT ON COLUMN public.users.id IS 'References the internal Supabase Auth user.';

-- Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
