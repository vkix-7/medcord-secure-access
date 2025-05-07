
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_MODEL = "gemini-1.5-flash";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY) {
      throw new Error("Missing Gemini API key");
    }

    const { message, userContext } = await req.json();

    // Craft a specific prompt that includes medical context but avoids medical advice liability
    const systemPrompt = `You are an AI health assistant for MedCord. You can help users understand their medical records, 
    appointments, and general health information available in their account. 
    
    You CANNOT provide medical advice, diagnoses, or treatment recommendations.
    
    When users ask medical questions, direct them to consult with their healthcare provider.
    
    You can provide factual information about general health topics, remind users of their 
    upcoming appointments, or summarize information already present in their medical records.`;

    // Include the user's medical info in the prompt if available
    let contextPrompt = "";
    if (userContext) {
      contextPrompt = `\n\nHere is some context about the user that might help you provide more relevant information:
      - User name: ${userContext.name || 'Not available'}
      - Age: ${userContext.age || 'Not available'}
      - Medical conditions: ${userContext.conditions?.join(', ') || 'Not available'}
      - Medications: ${userContext.medications?.join(', ') || 'Not available'}
      - Allergies: ${userContext.allergies?.join(', ') || 'Not available'}
      - Recent appointments: ${userContext.appointments || 'None scheduled'}`;
    }

    // Call the Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: systemPrompt + contextPrompt },
              { text: message }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    const data = await response.json();
    let aiResponse = "I'm sorry, I couldn't process your request at this time.";

    // Extract the response text from the Gemini API response
    try {
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        aiResponse = data.candidates[0].content.parts[0].text || aiResponse;
      }
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
    }

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error in gemini-health-assistant function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
