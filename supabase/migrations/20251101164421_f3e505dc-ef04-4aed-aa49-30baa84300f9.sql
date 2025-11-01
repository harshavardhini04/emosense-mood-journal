-- Create movies table with intent/emotion tagging
CREATE TABLE public.movies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'english',
  genre TEXT NOT NULL,
  intent TEXT NOT NULL, -- grateful, achievement, excited, burnout, lonely, etc.
  base_emotion TEXT NOT NULL, -- happy, sad, anxious, calm, angry, neutral
  year INTEGER,
  rating NUMERIC(3,1),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_movies_intent_language ON public.movies(intent, language);
CREATE INDEX idx_movies_emotion_language ON public.movies(base_emotion, language);
CREATE INDEX idx_movies_genre ON public.movies(genre);

-- Enable RLS
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read movies (public data)
CREATE POLICY "Movies are viewable by everyone" 
ON public.movies 
FOR SELECT 
USING (true);

-- Insert sample dataset with intent-based movies
INSERT INTO public.movies (title, language, genre, intent, base_emotion, year, rating, description) VALUES
-- Grateful intent movies (English)
('The Pursuit of Happyness', 'english', 'drama', 'grateful', 'happy', 2006, 8.0, 'Inspiring story of overcoming adversity'),
('Life is Beautiful', 'english', 'drama', 'grateful', 'happy', 1997, 8.6, 'Finding joy in difficult circumstances'),
('It''s a Wonderful Life', 'english', 'drama', 'grateful', 'happy', 1946, 8.6, 'Appreciating life and relationships'),

-- Achievement intent movies (English)
('Rocky', 'english', 'drama', 'achievement', 'happy', 1976, 8.1, 'Triumph against the odds'),
('The Social Network', 'english', 'drama', 'achievement', 'happy', 2010, 7.8, 'Building something from scratch'),
('Hidden Figures', 'english', 'drama', 'achievement', 'happy', 2016, 7.8, 'Breaking barriers and achieving greatness'),

-- Lonely intent movies (English)
('Her', 'english', 'romance', 'lonely', 'sad', 2013, 8.0, 'Exploring loneliness and connection'),
('Lost in Translation', 'english', 'drama', 'lonely', 'sad', 2003, 7.7, 'Finding connection in isolation'),
('The Perks of Being a Wallflower', 'english', 'drama', 'lonely', 'sad', 2012, 7.9, 'Belonging and friendship'),

-- Burnout intent movies (English)
('Office Space', 'english', 'comedy', 'burnout', 'anxious', 1999, 7.6, 'Finding escape from corporate burnout'),
('Lost in Translation', 'english', 'drama', 'burnout', 'calm', 2003, 7.7, 'Slowing down and finding meaning'),
('Soul', 'english', 'animation', 'burnout', 'calm', 2020, 8.0, 'Rediscovering purpose and passion'),

-- Grief intent movies (English)
('Manchester by the Sea', 'english', 'drama', 'grief', 'sad', 2016, 7.8, 'Processing loss and grief'),
('Up', 'english', 'animation', 'grief', 'sad', 2009, 8.3, 'Moving forward after loss'),
('A Ghost Story', 'english', 'drama', 'grief', 'sad', 2017, 6.8, 'Time and memory after loss'),

-- Worried intent movies (English)
('Inside Out', 'english', 'animation', 'worried', 'anxious', 2015, 8.1, 'Understanding and managing emotions'),
('Good Will Hunting', 'english', 'drama', 'worried', 'calm', 1997, 8.3, 'Overcoming fear and self-doubt'),

-- Excited intent movies (English)
('La La Land', 'english', 'musical', 'excited', 'happy', 2016, 8.0, 'Following dreams with passion'),
('Whiplash', 'english', 'drama', 'excited', 'happy', 2014, 8.5, 'Pursuing excellence with drive'),
('The Greatest Showman', 'english', 'musical', 'excited', 'happy', 2017, 7.5, 'Creating something extraordinary'),

-- Tamil movies
('96', 'tamil', 'romance', 'reflective', 'calm', 2018, 8.5, 'Nostalgic journey of love'),
('Soorarai Pottru', 'tamil', 'drama', 'achievement', 'happy', 2020, 8.9, 'Fighting for your dreams'),
('Vada Chennai', 'tamil', 'drama', 'frustrated', 'angry', 2018, 8.5, 'Breaking cycles of violence'),
('Super Deluxe', 'tamil', 'drama', 'confused', 'neutral', 2019, 8.4, 'Complex interconnected stories'),
('Jai Bhim', 'tamil', 'drama', 'motivated', 'angry', 2021, 8.8, 'Fighting for justice'),

-- Hindi movies  
('3 Idiots', 'hindi', 'comedy', 'achievement', 'happy', 2009, 8.4, 'Following passion over expectations'),
('Taare Zameen Par', 'hindi', 'drama', 'hopeful', 'calm', 2007, 8.4, 'Understanding and nurturing potential'),
('Zindagi Na Milegi Dobara', 'hindi', 'drama', 'excited', 'happy', 2011, 8.2, 'Embracing life and adventure'),
('Queen', 'hindi', 'comedy', 'motivated', 'happy', 2013, 8.1, 'Finding yourself and independence'),
('Dangal', 'hindi', 'drama', 'achievement', 'happy', 2016, 8.3, 'Breaking barriers and achieving dreams'),

-- Malayalam movies
('Kumbalangi Nights', 'malayalam', 'drama', 'reflective', 'calm', 2019, 8.6, 'Family bonds and healing'),
('Maheshinte Prathikaaram', 'malayalam', 'comedy', 'content', 'calm', 2016, 8.0, 'Simple life and satisfaction'),
('Drishyam', 'malayalam', 'thriller', 'worried', 'anxious', 2013, 8.6, 'Protecting loved ones'),
('Ustad Hotel', 'malayalam', 'drama', 'hopeful', 'calm', 2012, 8.1, 'Finding purpose and passion'),
('Bangalore Days', 'malayalam', 'drama', 'excited', 'happy', 2014, 8.3, 'New beginnings and friendships'),

-- Telugu movies
('C/o Kancharapalem', 'telugu', 'drama', 'hopeful', 'calm', 2018, 8.4, 'Love across different lives'),
('Jersey', 'telugu', 'drama', 'achievement', 'happy', 2019, 8.5, 'Second chances and redemption'),
('Pelli Choopulu', 'telugu', 'romance', 'content', 'calm', 2016, 8.1, 'Finding connection and partnership'),
('Mahanati', 'telugu', 'biography', 'reflective', 'sad', 2018, 8.5, 'Life of legendary actress'),
('Balagam', 'telugu', 'drama', 'grief', 'sad', 2023, 9.1, 'Family and loss in rural setting');