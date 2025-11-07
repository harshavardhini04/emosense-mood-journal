import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mood → Genre Mapping
const moodToGenres: Record<string, string[]> = {
  happy: ["Comedy", "Family", "Adventure"],
  sad: ["Feel-good", "Animation", "Friendship"],
  stressed: ["Comfort", "Romance", "Light-Drama"],
  anxious: ["Comfort", "Romance", "Light-Drama"],
  angry: ["Action", "Thriller"],
  bored: ["Comedy", "Action", "Sci-Fi"],
  lonely: ["Romance", "Drama"],
  motivated: ["Sports", "Biography", "Inspirational"],
  excited: ["Action", "Superhero", "Adventure"],
  romantic: ["Romance", "Drama"],
  tired: ["Calm", "Slice-of-Life", "Family"],
  calm: ["Calm", "Slice-of-Life", "Family"],
  neutral: ["Adventure", "Comedy"],
};

// Fallback activities based on emotion
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
    const { emotion, intent, language = 'english' } = await req.json();
    console.log("Getting recommendations for emotion:", emotion, "intent:", intent, "language:", language);

    // LOVABLE_API_KEY is automatically provided by Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Map emotion to genres (fallback to Adventure + Comedy if not found)
    const mappedGenres = moodToGenres[emotion.toLowerCase()] || ["Adventure", "Comedy"];
    const genresString = mappedGenres.join(", ");
    
    console.log("Mapped genres:", genresString);

    // Construct Gemini prompt for emotion-based, language-specific movie recommendations
    const prompt = `The user's detected mood is: ${emotion}.
The user's selected cinema language/industry is: ${language}.
Recommend exactly 6 movies that match:
(A) the mood using these emotion-aligned genres: ${genresString}
(B) movies produced in the cinema industry: ${language}.

Movie titles must always be in English spelling only, even if the movie language is not English.
If fewer than 6 exist in ${language} cinema, fill remaining using international (English) cinema while preserving the mood.

Return only valid JSON in this format:
[ { "title": "English Title", "year": 2024 } ]

No markdown, no description, no extra fields, no commentary.`;

    console.log("Calling Gemini API with prompt for language:", language);

    // Call Lovable AI Gateway (Google Gemini)
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are a movie recommendation expert. Always return valid JSON arrays only, with no markdown or additional text.' 
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Gemini API response:", JSON.stringify(data));

    // Parse the response content
    let movies: any[] = [];
    const content = data.choices?.[0]?.message?.content;
    
    if (content) {
      try {
        // Clean up potential markdown formatting
        let cleanedContent = content.trim();
        if (cleanedContent.startsWith('```json')) {
          cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (cleanedContent.startsWith('```')) {
          cleanedContent = cleanedContent.replace(/```\n?/g, '');
        }
        
        movies = JSON.parse(cleanedContent);
        console.log("Parsed movies:", movies);
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", parseError);
        console.error("Content was:", content);
        // Fallback to empty array
        movies = [];
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
