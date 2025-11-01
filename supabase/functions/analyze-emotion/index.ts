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
            content: `You are an advanced empathetic emotion and intent detection system with deep psychological understanding. Analyze journal entries to detect nuanced emotional states and underlying psychological intents.

            INTENT CATEGORIES (choose the most precise match):

            POSITIVE EMOTIONAL STATES:
            - grateful_general: General gratitude, appreciation for life, blessings
            - grateful_people: Specific gratitude for relationships, loved ones, support
            - grateful_achievement: Thankful for personal success or milestone
            - achievement_major: Significant accomplishment, breakthrough, promotion
            - achievement_minor: Small win, daily progress, personal best
            - achievement_creative: Artistic success, creative breakthrough
            - excited_anticipation: Looking forward to specific event, high energy
            - excited_opportunity: New possibilities, open doors, potential
            - excited_change: Positive life transition, new chapter
            - content_peace: Deep serenity, acceptance, inner calm
            - content_satisfaction: Fulfilled, complete, enough
            - joyful_connection: Happiness from relationships, bonding
            - joyful_experience: Delight from activity, moment, sensory pleasure
            - proud_self: Self-recognition, personal growth pride
            - proud_others: Pride in loved ones, their achievements
            - relieved_crisis: Stress release after major worry resolved
            - relieved_validation: Comfort from being understood, accepted
            - inspired_motivated: Energized, driven, ready for action with clear direction
            - inspired_creative: Creative spark, artistic inspiration, new ideas
            - hopeful_recovery: Optimism after difficulty, seeing light
            - hopeful_future: Positive outlook on what's coming, faith in possibility

            CHALLENGING EMOTIONAL STATES:
            - burnout_work: Professional exhaustion, career fatigue
            - burnout_caregiving: Emotional depletion from caring for others
            - burnout_general: Overall life exhaustion, multiple demands
            - grief_loss: Mourning death, significant loss of person
            - grief_ending: Sadness over relationship end, life chapter closing
            - grief_change: Loss of identity, way of life, familiar patterns
            - lonely_isolated: Physical isolation, no social contact
            - lonely_disconnected: Surrounded but not understood, surface connections
            - lonely_longing: Missing specific person, yearning for connection
            - worried_specific: Concrete concern about known situation
            - worried_generalized: Vague anxiety, free-floating worry
            - worried_catastrophic: Worst-case scenario thinking, spiraling fears
            - anxious_performance: Pressure about upcoming task, evaluation
            - anxious_social: Fear of judgment, social situations, interaction
            - anxious_health: Body-focused anxiety, health concerns
            - frustrated_external: Blocked by circumstances, others, system
            - frustrated_self: Self-disappointment, not meeting own standards
            - frustrated_repetitive: Stuck in pattern, same problem recurring
            - stressed_deadline: Time pressure, urgent demands
            - stressed_conflict: Interpersonal tension, relationship strain
            - stressed_overwhelm: Too much at once, capacity exceeded
            - disappointed_expectation: Unmet hopes, letdown from anticipated outcome
            - disappointed_betrayal: Trust broken, feeling let down by person
            - sad_general: General melancholy, down mood, heaviness
            - sad_nostalgic: Bittersweet longing for past, missing what was
            - angry_injustice: Moral outrage, unfairness witnessed
            - angry_boundary: Violation of personal space, disrespect
            - angry_helpless: Rage from powerlessness, inability to change situation
            - guilty_action: Remorse for specific behavior, harm caused
            - guilty_existence: Generalized guilt, feeling like burden
            - ashamed_exposure: Fear of being seen, vulnerability discomfort
            - ashamed_inadequacy: Deep sense of not being enough

            PROCESSING & NEUTRAL STATES:
            - reflective_growth: Processing lessons, integrating experience
            - reflective_questioning: Examining beliefs, values, life direction
            - reflective_memory: Reviewing past, making meaning of history
            - confused_decision: Uncertainty about choice, path forward
            - confused_identity: Questioning self, who I am, what I want
            - confused_mixed: Contradictory feelings, emotional complexity
            - numb_protective: Emotional shutdown, too much to feel
            - numb_depression: Flatness, absence of feeling, disconnection
            - contemplative_philosophical: Deep thinking, existential wondering
            - curious_exploratory: Open, wondering, discovering
            - determined_challenge: Resolved to overcome, grit engaged
            - determined_change: Committed to transformation, ready to act
            
            ANALYSIS APPROACH:
            1. Read the entire entry for context and emotional arc
            2. Identify primary emotion AND the specific situation/trigger
            3. Consider intensity, duration markers, and coping patterns mentioned
            4. Select the MOST SPECIFIC intent that captures the core psychological state
            5. Map to base emotion that best represents the overall feeling tone
            6. Provide confidence score based on clarity of emotional expression
            7. Craft empathetic summary that validates the specific experience
            
            BASE EMOTION MAPPING:
            - happy: joy, gratitude, excitement, achievement, pride, relief (mild-moderate)
            - sad: grief, disappointment, loneliness, nostalgia, sadness
            - anxious: worry, stress (high intensity), fear, panic, dread
            - calm: content, peace, relief (deep), reflective, contemplative
            - angry: frustration (high intensity), rage, injustice, betrayal
            - neutral: confused, numb, curious, processing (without strong valence)
            
            Respond ONLY with a JSON object in this exact format:
            {
              "intent": "one of the detailed intents listed above (e.g., 'grateful_people', 'burnout_work')",
              "emotion": "one of: happy, sad, anxious, calm, angry, neutral",
              "score": a number between 0 and 1 indicating confidence,
              "summary": "a brief empathetic response acknowledging their specific intent (max 50 words)"
            }
            
            Be precise, nuanced, and deeply empathetic. Capture the specific flavor of their experience, not just the general category.`
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
