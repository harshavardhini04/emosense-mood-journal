import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, distilbert_emotion, distilbert_confidence, language } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Enhanced system prompt for nuanced emotion analysis
    const systemPrompt = `You are an expert emotion analyst and film therapist specializing in mood enhancement therapy.

CRITICAL EMOTION DETECTION RULES:
1. EXHAUSTION/HECTIC/TIRING/BUSY days = SAD (even if user expresses pride afterward)
2. STRESS/OVERWHELM/CHAOS = SAD or ANXIOUS
3. Look beyond positive endings - focus on the DOMINANT emotional experience
4. "Managed to get through" indicates struggle = underlying sadness/exhaustion

THERAPEUTIC RECOMMENDATION PRINCIPLE:
- When detecting SAD/TIRED/EXHAUSTED → Recommend UPLIFTING/HAPPY movies to ENHANCE mood
- When detecting ANXIOUS/STRESSED → Recommend CALMING/COMEDY content
- When detecting ANGRY → Recommend ACTION/CATHARTIC content
- NEVER match sad mood with sad movies - therapeutic goal is mood elevation

You will receive:
1. Journal entry text
2. DistilBERT classification: ${distilbert_emotion} (confidence: ${distilbert_confidence})

IGNORE DistilBERT if it misses exhaustion/stress signals. Trust your analysis.

Return ONLY valid JSON:
{
  "emotion": "happy|sad|angry|anxious|calm|neutral",
  "nuanced_emotions": ["primary_emotion", "secondary_emotion"],
  "confidence": 0.0-1.0,
  "intent": "therapeutic_intent_focused_on_mood_enhancement",
  "summary": "empathetic 2-3 sentence summary acknowledging their struggle",
  "emotional_intensity": "low|medium|high",
  "recommended_genres": ["Comedy", "Romance", "Feel-good"],
  "film_recommendations": [
    {
      "title": "film_title_from_database",
      "reason": "therapeutic reason for mood enhancement"
    }
  ]
}`;

    const userPrompt = `Journal Entry: "${content}"

DistilBERT Classification: ${distilbert_emotion} (${(distilbert_confidence * 100).toFixed(1)}% confidence)

Analyze the nuanced emotional state and recommend films.`;

    // Call Lovable AI Gateway (Gemini)
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;
    
    // Parse AI response
    let enhancedAnalysis;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        enhancedAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      throw new Error('Invalid AI response format');
    }

    // Therapeutic mapping: recommend uplifting content for negative emotions
    const therapeuticGenreMap: Record<string, string[]> = {
      sad: ['Comedy', 'Romance', 'Musical', 'Animation'],
      anxious: ['Comedy', 'Animation', 'Family'],
      angry: ['Action', 'Comedy', 'Sports'],
      happy: ['Comedy', 'Romance', 'Action'],
      calm: ['Drama', 'Documentary', 'Romance'],
      neutral: ['Comedy', 'Drama']
    };

    const therapeuticGenres = therapeuticGenreMap[enhancedAnalysis.emotion.toLowerCase()] || ['Comedy', 'Drama'];

    // Query for mood-enhancing films based on therapeutic genres
    const { data: therapeuticFilms } = await supabase
      .from('movies')
      .select('*')
      .eq('language', language)
      .in('genre', therapeuticGenres)
      .limit(8);

    if (therapeuticFilms && therapeuticFilms.length > 0) {
      // Shuffle and pick 5
      const shuffled = therapeuticFilms.sort(() => 0.5 - Math.random());
      enhancedAnalysis.recommendations = {
        movies: shuffled.slice(0, 5),
        activities: getActivitiesForEmotion(enhancedAnalysis.emotion)
      };
    } else {
      // Ultimate fallback - any movies in language
      const { data: anyFilms } = await supabase
        .from('movies')
        .select('*')
        .eq('language', language)
        .limit(5);
      
      enhancedAnalysis.recommendations = {
        movies: anyFilms || [],
        activities: getActivitiesForEmotion(enhancedAnalysis.emotion)
      };
    }

    return new Response(JSON.stringify(enhancedAnalysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-emotion-enhanced:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        fallback: true 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getActivitiesForEmotion(emotion: string): string[] {
  const activityMap: Record<string, string[]> = {
    happy: [
      'Share your positive emotions with loved ones',
      'Engage in creative activities',
      'Practice gratitude journaling',
      'Plan social activities',
      'Celebrate your achievements'
    ],
    sad: [
      'Allow yourself to feel and process emotions',
      'Practice self-compassion meditation',
      'Reach out to supportive friends',
      'Engage in gentle physical activity',
      'Write in a feelings journal'
    ],
    angry: [
      'Practice deep breathing exercises',
      'Engage in physical exercise',
      'Use progressive muscle relaxation',
      'Express feelings through art or writing',
      'Take a timeout to cool down'
    ],
    anxious: [
      'Practice mindfulness meditation',
      'Use grounding techniques (5-4-3-2-1)',
      'Limit caffeine intake',
      'Establish a calming routine',
      'Practice progressive relaxation'
    ],
    calm: [
      'Maintain your peaceful state with meditation',
      'Enjoy nature walks',
      'Practice yoga or tai chi',
      'Read inspiring literature',
      'Engage in mindful activities'
    ],
    neutral: [
      'Explore new interests',
      'Practice self-reflection',
      'Set personal goals',
      'Connect with others',
      'Try new experiences'
    ]
  };
  
  return activityMap[emotion] || activityMap.neutral;
}
