/*
  # Create form submissions table
  1. New Tables
    - `form_submissions`
      - `id` (uuid, primary key) - Unique identifier for each submission
      - `name` (text) - User's name
      - `email` (text) - User's email address
      - `phone` (text) - User's phone number
      - `address` (text) - User's address
      - `message` (text) - User's message
      - `created_at` (timestamptz) - Timestamp when the form was submitted
  2. Security
    - Enable RLS on `form_submissions` table
    - Add policy for anyone to insert form submissions (allows public form submissions)
    - Add policy for anyone to view all submissions (allows public viewing)
*/
CREATE TABLE IF NOT EXISTS form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  address text DEFAULT '',
  message text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
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
