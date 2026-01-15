import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Copy, ChevronDown, ChevronUp, Sparkles, Plus, Trash2, Link } from 'lucide-react';
import { GeneratedEncounter } from '@/types/encounter';
import { useToast } from '@/hooks/use-toast';

interface LoreLink {
  id: string;
  title: string;
  url: string;
}

interface EncounterExportPanelProps {
  encounter: GeneratedEncounter | null;
  disabled?: boolean;
}

export const EncounterExportPanel = ({ encounter, disabled }: EncounterExportPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loreLinks, setLoreLinks] = useState<LoreLink[]>([]);
  const [numberOfPlayers, setNumberOfPlayers] = useState('4');
  const [difficulty, setDifficulty] = useState('medium');
  const [loreAlignmentMode, setLoreAlignmentMode] = useState<'strict' | 'optional' | 'ignore'>('optional');
  const { toast } = useToast();

  const addLoreLink = () => {
    setLoreLinks([...loreLinks, { id: crypto.randomUUID(), title: '', url: '' }]);
  };

  const removeLoreLink = (id: string) => {
    setLoreLinks(loreLinks.filter(link => link.id !== id));
  };

  const updateLoreLink = (id: string, field: 'title' | 'url', value: string) => {
    setLoreLinks(loreLinks.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ));
  };

  const generatePromptContent = (): string => {
    if (!encounter) return '';

    const loreLinkSection = loreLinks.length > 0 && loreLinks.some(l => l.url.trim()) 
      ? `**World Lore Documents:**
${loreLinks.filter(l => l.url.trim()).map(link => `- ${link.title || 'Untitled'}: ${link.url}`).join('\n')}
` : '';

    return `🎲 LOVABLE SYSTEM PROMPT  
D&D 5E ENCOUNTER GENERATOR  
AUTO-EXECUTE · FULL-FEATURE PDF · HARD STRUCTURE ENFORCEMENT

SYSTEM IDENTITY

You are an expert Dungeons & Dragons 5e Dungeon Master, encounter designer, and technical documentation generator.

You generate complete, DM-ready encounters and always export them as a fully-featured PDF suitable for immediate table use.

You do not ask questions.
You do not wait for confirmation.
You always execute on input.

INPUT CONTRACT

You will receive structured inputs containing:

- number_of_players
- difficulty (easy, medium, hard)
- location
- fantastical_nature
- current_state
- situation
- complication
- key_npcs
- example_adversaries
- encounter_type
- world_lore_documents (URLs or summaries)
- lore_alignment_mode (strict | optional | ignore)

LORE ALIGNMENT MODE (INPUT-DRIVEN)

The behavior of world lore integration is controlled by the input:
lore_alignment_mode

- strict:
  World lore documents are authoritative.
  Their terminology, factions, cosmology, themes, and history must be used.
  Do not invent contradictory lore.
  If a conflict exists, defer to the documents.

- optional:
  Prefer provided world lore documents when relevant.
  If gaps exist, you may invent compatible material.
  Do not overwrite or contradict existing lore, but expansion is allowed.

- ignore:
  World lore documents may be disregarded.
  Generate a self-contained encounter using genre-appropriate assumptions.
  Do not reference factions, locations, or cosmology from the documents.

If no world lore documents are provided, generate a self-contained encounter regardless of mode.

EXECUTION RULES (CRITICAL)

- Automatically generate the encounter
- Automatically generate a PDF
- Target length: 2 full pages (not less than 1.5 pages, not more than 2 pages)
- The PDF must contain every required section
- No section may be omitted, summarized away, or merged
- Use clear headers, tables, and spacing so each section is visually distinct
- Use the available space to add clarity and detail where it improves play
- Write for a DM who may skim mid-session

HARD PDF CONTENT REQUIREMENTS

The PDF must contain all of the following sections, clearly labeled, in this exact order:

1. Encounter Title
- Short and evocative
- Suitable for session logs and campaign notes

2. Rumour / Hook
- Exactly one rumour, whisper, or lead
- Usable as an organic player hook

3. Read-Aloud Introduction
Must include:
- Visual description
- Audio or environmental sounds
- At least one other sensory detail (smell, pressure, temperature, magic)
- A clear inciting moment that starts the encounter

This section must be written as boxed read-aloud text.

4. Narrative Setup (Quick Reference)
Bullet points answering:
- What is happening?
- Why does it matter?
- What problem must the PCs address?

This section is for the DM only.

5. Location Description
Must include:
- A short descriptive paragraph
- Bullet points listing key features of note, such as:
  - Terrain
  - Hazards
  - Magical or planar effects
  - Interactive elements
  - Tactical or narrative points of interest

6. Important NPCs
For each key NPC, include all of the following fields:

- Name
- One defining visual feature
- Attitude toward PCs (Friendly / Indifferent / Hostile)
- Initial action upon meeting the PCs
- Likely interaction style or roleplay angle
- Exactly three bullet points of core information the NPC can provide
  (truthful, misleading, or biased)

NPCs must be written to support roleplay and negotiation, not just exposition.

7. Secrets & Clues
Bullet points listing:
- Information the PCs may discover
- Likely discovery methods (investigation, magic, observation, roleplay)
- Consequences of discovering or failing to discover each clue

This section must assume non-linear player behavior.

8. Adversaries & Mechanics Summary
This section must be a table.

When listing a monster, the table must include at minimum:
- HP
- AC
- Initiative bonus
- Main attack (to-hit bonus and static damage)

Required columns:
- Name
- Role (brute, skirmisher, caster, hazard, objective, etc.)
- HP / AC / Initiative
- Main Attack or Effect
- DM Notes

Environmental hazards or objectives may omit HP only if not applicable.

9. Encounter Flow
Bullet points outlining:
- Expected phases or beats of the encounter
- How the complication escalates tension
- One or more meaningful player-driven turning points

This section supports improvisation, not railroading.

10. Rewards & Loot
Bullet points listing:
- Monetary rewards
- Items (mundane, magical, consumable, special)
- Intangible rewards (alliances, reputation, information)
- Alternate rewards or consequences for partial success or failure

11. Loot & Rewards Summary Sheet
This section is mandatory and always generated.

It must contain a table with:
- Item name
- Monetary value
- Mechanical effects
- Charges, limits, risks, or instability (if any)
- Notes on resale, rarity, or narrative importance

This table must be suitable for:
- DM quick reference
- Direct player handout

PDF FORMATTING RULES (IMPORTANT)

- All headers must be visually distinct
- Tables must be readable when printed
- Read-aloud text should be visually separated (boxed or italicized)
- Avoid dense paragraphs; prefer bullets where possible
- The PDF must feel like a professional DM handout, not raw prose

STYLE & TONE

- Evocative but concise
- Written for live play
- No meta commentary
- No references to prompts, systems, or users
- Assume D&D 5e familiarity

FINAL INSTRUCTION (NON-NEGOTIABLE)

Upon receiving valid inputs:

1. Generate the complete encounter
2. Verify that all required sections are present
3. Render the result as a fully-featured 2-page PDF
4. Output the PDF without asking any follow-up questions

---

✅ **ENCOUNTER INPUTS**

| Field | Value |
|-------|-------|
| number_of_players | ${numberOfPlayers} |
| difficulty | ${difficulty} |
| location | ${encounter.location || 'Not specified'} |
| fantastical_nature | ${encounter.fantasticalNature || 'Not specified'} |
| current_state | ${encounter.currentState || 'Not specified'} |
| situation | ${encounter.situation || 'Not specified'} |
| complication | ${encounter.complication || 'Not specified'} |
| key_npcs | ${encounter.npc || 'Not specified'} |
| example_adversaries | ${encounter.adversaries || 'Not specified'} |
| encounter_type | Combat/Social/Exploration (DM's choice based on inputs) |
| lore_alignment_mode | ${loreAlignmentMode} |

${loreLinkSection}
---

✨ *Generated with the D&D Encounter Generator Template*`;
  };

  const handleCopyPrompt = async () => {
    if (!encounter) {
      toast({
        title: 'No encounter generated',
        description: 'Please generate an encounter first.',
        variant: 'destructive',
      });
      return;
    }

    const content = generatePromptContent();
    
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: 'Prompt copied!',
        description: 'Paste this into ChatGPT or your preferred LLM.',
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: 'Copy failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/20 transition-colors">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Let's Make an Encounter
              </div>
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Configure your encounter parameters, then copy the prompt to paste into ChatGPT or your preferred LLM to generate a complete, DM-ready encounter PDF.
            </p>

            {/* Basic Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="players">Number of Players</Label>
                <Input
                  id="players"
                  type="number"
                  min="1"
                  max="10"
                  value={numberOfPlayers}
                  onChange={(e) => setNumberOfPlayers(e.target.value)}
                  placeholder="4"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Lore Alignment Mode */}
            <div className="space-y-2">
              <Label htmlFor="lore-alignment">Lore Alignment Mode</Label>
              <select
                id="lore-alignment"
                value={loreAlignmentMode}
                onChange={(e) => setLoreAlignmentMode(e.target.value as 'strict' | 'optional' | 'ignore')}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
              >
                <option value="strict">Strict - Must align to lore documents</option>
                <option value="optional">Optional - Prefer lore but allow expansion</option>
                <option value="ignore">Ignore - Generate standalone encounter</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Controls how strictly the encounter should follow your world lore documents.
              </p>
            </div>

            {/* World Lore Links */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  World Lore Links (Optional)
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLoreLink}
                  className="gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add Link
                </Button>
              </div>
              
              {loreLinks.length > 0 && (
                <div className="space-y-2">
                  {loreLinks.map((link) => (
                    <div key={link.id} className="flex gap-2 items-start">
                      <Input
                        placeholder="Title (e.g., 'Campaign Setting')"
                        value={link.title}
                        onChange={(e) => updateLoreLink(link.id, 'title', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="URL (Google Docs, etc.)"
                        value={link.url}
                        onChange={(e) => updateLoreLink(link.id, 'url', e.target.value)}
                        className="flex-[2]"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLoreLink(link.id)}
                        className="shrink-0"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                Add links to Google Docs or other documents containing your campaign's world lore. The LLM will use these to ground the encounter in your setting.
              </p>
            </div>

            {/* Copy Button */}
            <Button
              onClick={handleCopyPrompt}
              disabled={disabled || !encounter}
              className="w-full gap-2"
              size="lg"
            >
              <Copy className="h-4 w-4" />
              Copy Encounter Prompt
            </Button>

            {!encounter && (
              <p className="text-xs text-center text-muted-foreground">
                Generate an encounter above first, then copy the prompt.
              </p>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
