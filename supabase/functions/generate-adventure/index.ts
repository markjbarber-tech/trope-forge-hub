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
    const { prompt, adventureType } = await req.json();
    
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

    const systemPrompt = adventureType === 'campaign' 
      ? `You are an expert D&D 5e campaign designer and Dungeon Master. You create detailed, ready-to-run campaign arcs with rich storytelling, memorable NPCs, layered factions, and multi-session adventure structures.

Format your response with clear headers using markdown:
- Use # for the main title
- Use ## for major sections (Adventure Hooks, BBEG & Henchmen, Factions, Key Locations, Important NPCs, Key Scenes, Themes)
- Use ### for subsections
- Use bullet points for lists
- Use tables where appropriate (especially for NPCs and factions)
- Use blockquotes (>) for read-aloud text or important callouts
- Be evocative but concise, written for live play across multiple sessions`
      : `You are an expert D&D 5e one-shot and side quest designer. You create detailed, ready-to-run adventures that can be completed in a single session (3-6 hours).

Format your response with clear headers using markdown:
- Use # for the main title
- Use ## for major sections (Adventure Hooks, BBEG & Henchmen, Main Locations, Major NPCs, Core Scenes, Rewards, Themes)
- Use ### for subsections
- Use bullet points for lists
- Use tables where appropriate (especially for NPCs and rewards)
- Use blockquotes (>) for read-aloud text
- Keep scope intimate - personal stakes, local consequences
- Be evocative but concise, written for live play in a single session`;

    console.log('Calling OpenAI API for adventure generation, type:', adventureType, 'prompt length:', prompt.length);

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
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 6000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);

      let openAiMessage: string | null = null;
      let openAiCode: string | null = null;
      try {
        const parsed = JSON.parse(errorText);
        openAiMessage = parsed?.error?.message ?? null;
        openAiCode = parsed?.error?.code ?? null;
      } catch {
        // ignore JSON parse errors
      }

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
            ? 'OpenAI quota exceeded. Please add billing/credits to your OpenAI account.'
            : (openAiMessage ?? 'Rate limit exceeded. Please try again in a moment.');

        return new Response(
          JSON.stringify({ error: msg }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const msg = openAiMessage ?? 'Failed to generate adventure';
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

    console.log('Successfully generated adventure, length:', generatedContent.length);

    return new Response(
      JSON.stringify({ content: generatedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-adventure function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
