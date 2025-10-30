import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const recommendationMap: Record<string, { movies: string[], activities: string[] }> = {
  happy: {
    movies: ["The Grand Budapest Hotel", "La La Land", "Amélie", "Sing", "Paddington 2"],
    activities: ["Go for a nature walk", "Call a friend", "Try a new recipe", "Dance to your favorite music", "Start a creative project"]
  },
  sad: {
    movies: ["The Pursuit of Happyness", "Good Will Hunting", "Inside Out", "Soul", "It's a Wonderful Life"],
    activities: ["Write in a journal", "Practice meditation", "Listen to calming music", "Watch comfort shows", "Take a warm bath"]
  },
  anxious: {
    movies: ["My Neighbor Totoro", "Paddington", "Finding Nemo", "The Secret Life of Walter Mitty", "Kiki's Delivery Service"],
    activities: ["Deep breathing exercises", "Gentle yoga", "Organize a small space", "Color or draw", "Go for a short walk"]
  },
  calm: {
    movies: ["The Sound of Music", "Chef", "Julie & Julia", "A Beautiful Day in the Neighborhood", "Paterson"],
    activities: ["Read a book", "Practice mindfulness", "Enjoy a cup of tea", "Listen to ambient music", "Gentle stretching"]
  },
  angry: {
    movies: ["Peaceful Warrior", "The Karate Kid", "Remember the Titans", "Rocky", "Coach Carter"],
    activities: ["Physical exercise", "Punch a pillow", "Listen to calming music", "Practice deep breathing", "Write down your feelings"]
  },
  neutral: {
    movies: ["The Truman Show", "Eternal Sunshine of the Spotless Mind", "Her", "Lost in Translation", "Before Sunrise"],
    activities: ["Explore a new hobby", "Listen to a podcast", "Take a walk", "Try meditation", "Read something interesting"]
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emotion } = await req.json();
    console.log("Getting recommendations for emotion:", emotion);

    const recommendations = recommendationMap[emotion.toLowerCase()] || recommendationMap.neutral;

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
