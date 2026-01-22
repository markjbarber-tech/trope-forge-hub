import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { prompt } = await req.json();
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Calling OpenAI API with prompt length:', prompt.length);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert D&D 5e Dungeon Master and encounter designer. You create detailed, DM-ready encounters with rich descriptions, NPC details, combat mechanics, and loot tables. Format your response with clear headers using markdown (# for main sections, ## for subsections). Use tables where appropriate for adversaries and loot. Include read-aloud text in blockquotes (>). Be evocative but concise, written for live play.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);

      // Try to extract a helpful message from OpenAI's error payload
      let openAiMessage: string | null = null;
      let openAiCode: string | null = null;
      try {
        const parsed = JSON.parse(errorText);
        openAiMessage = parsed?.error?.message ?? null;
        openAiCode = parsed?.error?.code ?? null;
      } catch {
        // ignore JSON parse errors
      }

      // Provide user-friendly messages for common failure modes
      if (response.status === 401) {
        return new Response(
          JSON.stringify({
            error: 'Invalid OpenAI API key. Please update your API key and try again.',
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (response.status === 429) {
        const msg =
          openAiCode === 'insufficient_quota'
            ? 'OpenAI quota exceeded. Please add billing/credits to your OpenAI account, or switch to the built-in AI provider.'
            : (openAiMessage ?? 'Rate limit exceeded. Please try again in a moment.');

        return new Response(
          JSON.stringify({ error: msg }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Pass through a best-effort message for other statuses
      const msg = openAiMessage ?? 'Failed to generate encounter';
      return new Response(
        JSON.stringify({ error: msg }),
        { status: response.status || 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const generatedContent = data.choices[0]?.message?.content;

    if (!generatedContent) {
      console.error('No content in OpenAI response');
      return new Response(
        JSON.stringify({ error: 'No content generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully generated encounter, length:', generatedContent.length);

    return new Response(
      JSON.stringify({ content: generatedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-encounter function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
