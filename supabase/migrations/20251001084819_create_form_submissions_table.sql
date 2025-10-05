/*
  # Complete form submissions table setup
  1. Create or update table with family_id column
     - If table doesn't exist: Create with all fields including family_id
     - If table exists: Add family_id if missing
  2. Security
     - Enable RLS on `form_submissions` table
     - Add policy for anyone to insert form submissions (allows public form submissions)
     - Add policy for anyone to view all submissions (allows public viewing)
*/

-- Create table if it doesn't exist (with family_id included)
CREATE TABLE IF NOT EXISTS form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  address text DEFAULT '',
  message text DEFAULT '',
  family_id text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Add family_id column if it doesn't exist (safe for existing tables)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'form_submissions' 
    AND column_name = 'family_id'
  ) THEN
    ALTER TABLE form_submissions ADD COLUMN family_id text DEFAULT '';
  END IF;
END $$;

-- Enable RLS
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can submit forms"
  ON form_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view submissions"
  ON form_submissions
  FOR SELECT
  TO anon, authenticated
  USING (true);
