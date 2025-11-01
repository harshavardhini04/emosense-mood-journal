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
    const { emotion, intent, language = 'english', genre } = await req.json();
    console.log("Getting recommendations for emotion:", emotion, "intent:", intent, "language:", language, "genre:", genre);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Query movies from database based on intent
    let moviesQuery = supabase
      .from('movies')
      .select('title, genre, year, rating, description')
      .eq('language', language.toLowerCase())
      .limit(8);

    // If intent is provided, prioritize intent-based recommendations
    if (intent) {
      moviesQuery = moviesQuery.eq('intent', intent.toLowerCase());
    } else {
      // Fallback to emotion-based recommendations
      moviesQuery = moviesQuery.eq('base_emotion', emotion.toLowerCase());
    }

    // For genre filtering (when user is happy and selects a genre)
    if (genre) {
      moviesQuery = moviesQuery.eq('genre', genre.toLowerCase());
    }

    const { data: movies, error: moviesError } = await moviesQuery;

    if (moviesError) {
      console.error("Error fetching movies:", moviesError);
      throw moviesError;
    }

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
