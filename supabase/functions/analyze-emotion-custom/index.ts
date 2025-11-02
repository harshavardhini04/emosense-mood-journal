import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// TODO: Configure your custom ML model endpoint
// Options:
// 1. HuggingFace Inference API: https://api-inference.huggingface.co/models/YOUR-MODEL
// 2. Custom deployed model endpoint
// 3. Local model server
const CUSTOM_MODEL_ENDPOINT = Deno.env.get('CUSTOM_MODEL_ENDPOINT') || 'https://api-inference.huggingface.co/models/your-model-name';
const CUSTOM_MODEL_API_KEY = Deno.env.get('CUSTOM_MODEL_API_KEY'); // Optional, if your model requires auth

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();
    console.log('Analyzing emotion with custom ML model for content length:', content?.length);

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call your custom ML model
    // Adjust the payload format based on your model's API
    const modelPayload = {
      inputs: content,
      // Add any additional parameters your model needs
      parameters: {
        // e.g., max_length, temperature, etc.
      }
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add API key if provided
    if (CUSTOM_MODEL_API_KEY) {
      headers['Authorization'] = `Bearer ${CUSTOM_MODEL_API_KEY}`;
    }

    console.log('Calling custom model endpoint:', CUSTOM_MODEL_ENDPOINT);
    
    const modelResponse = await fetch(CUSTOM_MODEL_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify(modelPayload),
    });

    if (!modelResponse.ok) {
      const errorText = await modelResponse.text();
      console.error('Custom model error:', modelResponse.status, errorText);
      
      // Fallback to basic analysis if model fails
      return new Response(
        JSON.stringify({
          intent: "general_reflection",
          emotion: "neutral",
          confidence: 0.5,
          summary: "Unable to analyze emotion with custom model. Please check model endpoint configuration.",
          recommended_genres: ["Drama"]
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const modelResult = await modelResponse.json();
    console.log('Custom model result:', JSON.stringify(modelResult).substring(0, 200));

    // Transform model output to expected format
    // TODO: Adjust this transformation based on your model's output format
    // Example formats:
    // 1. HuggingFace classification: [{ label: "emotion", score: 0.95 }]
    // 2. Custom model: { emotion: "happy", confidence: 0.95, intent: "..." }
    
    let analysisResult;
    
    if (Array.isArray(modelResult)) {
      // HuggingFace-style output: array of predictions
      const topPrediction = modelResult[0];
      analysisResult = {
        intent: mapEmotionToIntent(topPrediction.label),
        emotion: normalizeEmotion(topPrediction.label),
        confidence: topPrediction.score,
        summary: `Detected ${topPrediction.label} with ${Math.round(topPrediction.score * 100)}% confidence`,
        recommended_genres: getRecommendedGenres(topPrediction.label)
      };
    } else if (modelResult.emotion || modelResult.label) {
      // Custom structured output
      const emotion = modelResult.emotion || modelResult.label;
      analysisResult = {
        intent: modelResult.intent || mapEmotionToIntent(emotion),
        emotion: normalizeEmotion(emotion),
        confidence: modelResult.confidence || modelResult.score || 0.8,
        summary: modelResult.summary || `Emotional state: ${emotion}`,
        recommended_genres: modelResult.recommended_genres || getRecommendedGenres(emotion)
      };
    } else {
      // Unknown format - log and provide default
      console.warn('Unexpected model output format:', modelResult);
      analysisResult = {
        intent: "general_reflection",
        emotion: "neutral",
        confidence: 0.5,
        summary: "Emotion detected (custom model)",
        recommended_genres: ["Drama"]
      };
    }

    console.log('Final analysis result:', analysisResult);

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-emotion-custom:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        intent: "general_reflection",
        emotion: "neutral",
        confidence: 0.5,
        summary: "Error analyzing emotion",
        recommended_genres: ["Drama"]
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper functions to map model outputs to EMOSENSE format

function normalizeEmotion(emotion: string): string {
  const emotionMap: Record<string, string> = {
    'happy': 'happy',
    'happiness': 'happy',
    'joy': 'happy',
    'sad': 'sad',
    'sadness': 'sad',
    'angry': 'angry',
    'anger': 'angry',
    'anxious': 'anxious',
    'anxiety': 'anxious',
    'fear': 'anxious',
    'calm': 'calm',
    'peace': 'calm',
    'neutral': 'neutral',
  };

  const normalized = emotion.toLowerCase();
  return emotionMap[normalized] || 'neutral';
}

function mapEmotionToIntent(emotion: string): string {
  const intentMap: Record<string, string> = {
    'happy': 'celebrate_success',
    'sad': 'process_grief',
    'angry': 'manage_anger',
    'anxious': 'reduce_anxiety',
    'calm': 'maintain_peace',
    'neutral': 'general_reflection',
  };

  const normalizedEmotion = normalizeEmotion(emotion);
  return intentMap[normalizedEmotion] || 'general_reflection';
}

function getRecommendedGenres(emotion: string): string[] {
  const genreMap: Record<string, string[]> = {
    'happy': ['Comedy', 'Romance', 'Musical'],
    'sad': ['Drama', 'Romance', 'Documentary'],
    'angry': ['Action', 'Thriller', 'Documentary'],
    'anxious': ['Comedy', 'Animation', 'Family'],
    'calm': ['Drama', 'Documentary', 'Romance'],
    'neutral': ['Drama', 'Documentary', 'Comedy'],
  };

  const normalizedEmotion = normalizeEmotion(emotion);
  return genreMap[normalizedEmotion] || ['Drama'];
}
