import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing emotion for content:", content.substring(0, 100));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an advanced empathetic emotion and intent detection system. Analyze journal entries to detect both the surface emotion and the deeper intent/context.

            First, identify the DETAILED INTENT from these categories:
            - grateful: expressing gratitude, appreciation, thankfulness
            - achievement: celebrating success, accomplishment, pride
            - excited: anticipation, enthusiasm, looking forward to something
            - content: peaceful satisfaction, acceptance, serenity
            - burnout: exhaustion, overwhelm, mental fatigue
            - grief: loss, mourning, deep sadness
            - lonely: isolation, disconnection, longing for connection
            - worried: concern about future, uncertainty, fear
            - frustrated: blocked goals, impatience, irritation
            - stressed: pressure, tension, feeling overwhelmed
            - disappointed: unmet expectations, letdown
            - hopeful: optimism despite challenges, looking for silver lining
            - confused: uncertainty, indecision, lack of clarity
            - motivated: driven, energized, ready to take action
            - reflective: contemplative, processing experiences
            
            Then map to a BASE EMOTION (happy, sad, anxious, calm, angry, neutral) for compatibility.
            
            Respond ONLY with a JSON object in this exact format:
            {
              "intent": "one of the detailed intents listed above",
              "emotion": "one of: happy, sad, anxious, calm, angry, neutral",
              "score": a number between 0 and 1 indicating confidence,
              "summary": "a brief empathetic response acknowledging their specific intent (max 50 words)"
            }
            
            Be accurate, nuanced, and empathetic in your analysis.`
          },
          {
            role: "user",
            content: content
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log("AI Response:", aiResponse);

    // Parse the JSON response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }

    const result = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error analyzing emotion:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
