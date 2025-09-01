/*
  # Fix student_answers table primary key constraint

  1. Database Changes
    - Add primary key constraint to student_answers table on the id column
    - This resolves the "no unique or exclusion constraint matching the ON CONFLICT specification" error

  2. Security
    - No RLS changes needed as the table already has RLS enabled with proper policies
*/

-- Add primary key constraint to student_answers table
ALTER TABLE student_answers ADD CONSTRAINT student_answers_pkey PRIMARY KEY (id);