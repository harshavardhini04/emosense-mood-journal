-- Add language column to journal_entries table
ALTER TABLE public.journal_entries 
ADD COLUMN language text NOT NULL DEFAULT 'english';