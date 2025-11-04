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
    const systemPrompt = `You are an expert emotion analyst and film therapist. You will receive:
1. A journal entry from a user
2. Initial emotion classification from DistilBERT model (emotion: ${distilbert_emotion}, confidence: ${distilbert_confidence})

Your task is to provide a NUANCED emotional analysis that considers:
- Compound emotions (e.g., "tiring day" suggests exhaustion + sadness, "busy day" suggests stress + neutral)
- Emotional intensity and context
- Underlying therapeutic needs

Then recommend 5 films from our database that ACCURATELY match the user's emotional state and therapeutic intent.

CRITICAL: Base recommendations on ACTUAL intent and nuanced emotion, not just surface keywords.

Return ONLY valid JSON in this exact format:
{
  "emotion": "happy|sad|angry|anxious|calm|neutral",
  "nuanced_emotions": ["primary_emotion", "secondary_emotion"],
  "confidence": 0.0-1.0,
  "intent": "specific_therapeutic_intent",
  "summary": "empathetic 2-3 sentence summary",
  "emotional_intensity": "low|medium|high",
  "recommended_genres": ["genre1", "genre2", "genre3"],
  "film_recommendations": [
    {
      "title": "film_title",
      "reason": "why this film matches their emotional state and intent"
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

    // Query database for actual films matching the AI recommendations
    const filmTitles = enhancedAnalysis.film_recommendations?.map((f: any) => f.title) || [];
    const { data: dbFilms, error: dbError } = await supabase
      .from('movies')
      .select('*')
      .in('title', filmTitles)
      .eq('language', language)
      .limit(5);

    // If we have fewer films from DB, query by intent/genre as fallback
    if (!dbFilms || dbFilms.length < 5) {
      const { data: fallbackFilms } = await supabase
        .from('movies')
        .select('*')
        .eq('language', language)
        .or(`intent.eq.${enhancedAnalysis.intent},genre.in.(${enhancedAnalysis.recommended_genres.join(',')})`)
        .limit(5);
      
      if (fallbackFilms) {
        const combined = [...(dbFilms || []), ...fallbackFilms];
        const unique = Array.from(new Map(combined.map(m => [m.title, m])).values()).slice(0, 5);
        enhancedAnalysis.recommendations = {
          movies: unique,
          activities: getActivitiesForEmotion(enhancedAnalysis.emotion)
        };
      }
    } else {
      enhancedAnalysis.recommendations = {
        movies: dbFilms,
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
