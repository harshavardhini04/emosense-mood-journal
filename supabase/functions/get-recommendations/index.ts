import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const recommendationMap: Record<string, { activities: string[] }> = {
  happy: {
    activities: ["Go for a nature walk", "Call a friend", "Try a new recipe", "Dance to your favorite music", "Start a creative project"]
  },
  sad: {
    activities: ["Write in a journal", "Practice meditation", "Listen to calming music", "Watch comfort shows", "Take a warm bath"]
  },
  anxious: {
    activities: ["Deep breathing exercises", "Gentle yoga", "Organize a small space", "Color or draw", "Go for a short walk"]
  },
  calm: {
    activities: ["Read a book", "Practice mindfulness", "Enjoy a cup of tea", "Listen to ambient music", "Gentle stretching"]
  },
  angry: {
    activities: ["Physical exercise", "Punch a pillow", "Listen to calming music", "Practice deep breathing", "Write down your feelings"]
  },
  neutral: {
    activities: ["Explore a new hobby", "Listen to a podcast", "Take a walk", "Try meditation", "Read something interesting"]
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emotion, intent, language = 'english', genre, recommended_genres } = await req.json();
    console.log("Getting recommendations for emotion:", emotion, "intent:", intent, "language:", language, "genre:", genre, "recommended_genres:", recommended_genres);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let movies: any[] = [];

    // Strategy 1: Try exact intent match with language
    if (intent && !genre) {
      console.log("Strategy 1: Trying exact intent match:", intent);
      const { data, error } = await supabase
        .from('movies')
        .select('title, genre, year, rating, description')
        .eq('language', language.toLowerCase())
        .eq('intent', intent.toLowerCase())
        .limit(8);
      
      if (!error && data && data.length > 0) {
        movies = data;
        console.log("Found", data.length, "movies with exact intent match");
      }
    }

    // Strategy 2: Try genre-based recommendations using AI-suggested genres
    if (movies.length === 0 && recommended_genres && recommended_genres.length > 0) {
      console.log("Strategy 2: Trying recommended genres:", recommended_genres);
      const { data, error } = await supabase
        .from('movies')
        .select('title, genre, year, rating, description')
        .eq('language', language.toLowerCase())
        .in('genre', recommended_genres.map((g: string) => g.toLowerCase()))
        .limit(8);
      
      if (!error && data && data.length > 0) {
        movies = data;
        console.log("Found", data.length, "movies with recommended genres");
      }
    }

    // Strategy 3: Try user-selected genre (for happy emotion)
    if (movies.length === 0 && genre) {
      console.log("Strategy 3: Trying user-selected genre:", genre);
      const { data, error } = await supabase
        .from('movies')
        .select('title, genre, year, rating, description')
        .eq('language', language.toLowerCase())
        .eq('genre', genre.toLowerCase())
        .limit(8);
      
      if (!error && data && data.length > 0) {
        movies = data;
        console.log("Found", data.length, "movies with user-selected genre");
      }
    }

    // Strategy 4: Fallback to base emotion
    if (movies.length === 0 && emotion) {
      console.log("Strategy 4: Falling back to base emotion:", emotion);
      const { data, error } = await supabase
        .from('movies')
        .select('title, genre, year, rating, description')
        .eq('language', language.toLowerCase())
        .eq('base_emotion', emotion.toLowerCase())
        .limit(8);
      
      if (!error && data && data.length > 0) {
        movies = data;
        console.log("Found", data.length, "movies with base emotion");
      }
    }

    // Strategy 5: Last resort - just get any movies in that language
    if (movies.length === 0) {
      console.log("Strategy 5: Last resort - any movies in language:", language);
      const { data, error } = await supabase
        .from('movies')
        .select('title, genre, year, rating, description')
        .eq('language', language.toLowerCase())
        .limit(8);
      
      if (!error && data && data.length > 0) {
        movies = data;
        console.log("Found", data.length, "movies as last resort");
      }
    }

    console.log("Final movie count:", movies.length);

    // Fallback activities based on emotion
    const activities = recommendationMap[emotion.toLowerCase()]?.activities || 
                      recommendationMap.neutral.activities;

    const recommendations = {
      movies: movies?.map(m => `${m.title}${m.year ? ` (${m.year})` : ''}`).slice(0, 5) || [],
      activities: activities
    };

    return new Response(
      JSON.stringify(recommendations),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error getting recommendations:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
