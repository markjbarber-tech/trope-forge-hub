import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Printer, HelpCircle, X, Wand2, Loader2, FileText, Download } from 'lucide-react';
import { Trope } from '@/types/trope';
import { useToast } from '@/hooks/use-toast';
import { useAdventureAI } from '@/hooks/useAdventureAI';
import { generateAdventurePDF, extractAdventureTitle } from '@/utils/pdfGenerator';
import { CampaignContextInput } from '@/components/CampaignContextInput';
import { buildCampaignContext, CampaignDocument } from '@/utils/campaignContext';

interface LoreLink {
  id: string;
  title: string;
  url: string;
}

interface ExportPanelProps {
  tropes: Trope[];
  loreLinks?: LoreLink[];
  disabled?: boolean;
  onExportTemplate?: (templateType: 'campaign' | 'oneshot') => void;
}

export const ExportPanel = ({ tropes, loreLinks = [], disabled = false, onExportTemplate }: ExportPanelProps) => {
  const { toast } = useToast();
  const [templateType, setTemplateType] = useState<'campaign' | 'oneshot'>('campaign');
  const [showClipboardMessage, setShowClipboardMessage] = useState(false);
  const [showExportHelp, setShowExportHelp] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [campaignHistory, setCampaignHistory] = useState('');
  const [campaignDocuments, setCampaignDocuments] = useState<CampaignDocument[]>([]);
  const [isReadingDocuments, setIsReadingDocuments] = useState(false);
  const { generateAdventure, isGenerating, error } = useAdventureAI();
  const hasNoElements = tropes.length === 0;

  const handleExportTable = () => {
    if (hasNoElements) return;
    
    try {
      const routeUrl = `${import.meta.env.BASE_URL}#/trope-table?timestamp=${Date.now()}`;
      sessionStorage.setItem('tropes-for-table', JSON.stringify(tropes));

      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

      if (isStandalone) {
        window.location.assign(routeUrl);
      } else {
        window.open(routeUrl, '_blank');
      }

      toast({
        title: "Table Opened",
        description: "Story elements table opened",
      });
    } catch (error) {
      toast({
        title: "Failed to Open Table",
        description: "Failed to open story elements table",
        variant: "destructive",
      });
    }
  };

  const generateTemplateContent = (type: 'campaign' | 'oneshot', elementList: Trope[]) => {
    const elementTable = elementList.map((element, index) => 
      `| ${index + 1} | ${element.name} | ${element.detail || '(No description provided)'} |`
    ).join('\n');

    const loreLinkSection = loreLinks.length > 0 ? `

**Optional World Lore Links:**  
${loreLinks.map((link) => `- ${link.title}: ${link.url}`).join('  \n')}  

${type === 'campaign'
  ? 'Read and incorporate relevant information from these lore documents to ground the adventure in the established world. If a document is inaccessible, state this clearly rather than claiming to have read it. Distinguish established lore from newly invented campaign details.'
  : '*Note: Please read and incorporate relevant information from these lore documents to ground the adventure in the established world setting.*'}` : '';

    if (type === 'campaign') {
      return `# 🎯 PROMPT: SINGLE-ARC CAMPAIGN BUILDER

Create a complete D&D 5e campaign arc based on the following story tropes.

## TROPES TABLE

| # | Trope Name | Trope Description |
|---|------------|-------------------|
${elementTable}
${loreLinkSection}
${buildCampaignContext(campaignHistory, campaignDocuments)}

## REQUIREMENTS

Generate a single-arc campaign that:
- Spans multiple sessions, with progression from 3rd to 10th level.
- Uses ALL provided tropes naturally woven into the story.
- Includes branching player decisions with a cohesive climax.
- Gives the DM a complete understanding of the scenario, including secrets the players have not discovered.
- Clearly distinguishes objective truth, NPC beliefs, player-facing information, and deliberate misinformation.
- Explains the causes, motivations, mechanisms, and consequences behind major events. Do not substitute evocative descriptions or unexplained mysteries for information the DM needs.
- Allows players to discover essential information through multiple routes, without requiring one successful check or a predetermined decision.
- Includes a consolidated overview of all key items players may encounter, acquire, seek, or hear about, including items that remain inaccessible or in someone else’s possession.

## OUTPUT STRUCTURE

### 1. Campaign Title and Premise

Provide a title and a 1–2 paragraph summary. Clearly label any player-facing introduction separately from DM-only information.

### 2. DM-Only: What Is Actually Going On

This section is mandatory. It contains the full underlying truth, including spoilers. Never withhold information from the DM to preserve a player-facing mystery.

Include:

- The underlying situation: Explain plainly what is really happening, what caused it, why it matters, and why the campaign begins now.
- Relevant history and timeline: Describe the events that created the current conflict in chronological order, identifying who did what and why.
- The villain’s actual objective and plan: Explain the intended outcome, motivation, operational steps, required resources, current progress, constraints, and conditions for success or failure. Explain why the villain has not already succeeded.
- Other hidden agendas: Describe relevant NPC and faction secrets, alliances, betrayals, competing goals, and misunderstandings. Clarify what each major actor knows, believes, and conceals.
- How important mechanisms work: Explain any rituals, curses, artifacts, prophecies, supernatural forces, or other devices central to the plot. Specify their origins where relevant, capabilities, limits, costs, triggers, and ways they can be disrupted. Define usable rules for any invented mechanism.
- The party’s involvement: Explain why the characters become involved, why their actions matter, and how any personal connections or tropes relate to the underlying conflict.
- Secrets and discoveries: Use a table listing each major hidden truth, the apparent explanation available to players, who knows the truth, and the clues or routes through which it can be discovered. Provide multiple independent routes to essential revelations.
- What happens without intervention: Give the likely sequence of events if the party delays, fails, refuses the quest, or walks away, including meaningful consequences and opportunities to re-enter the story.
- Possible resolutions: Explain how major player choices can alter the plan, climax, and aftermath. Include plausible alternatives to killing the main villain.

Provide enough concrete detail that the DM can explain the scenario in their own words, answer likely player questions, and adjudicate unexpected actions without inventing missing foundations.

### 3. Adventure Hooks

Provide 3–5 plot hooks introducing players to the arc. For each, explain the player-facing invitation and its actual connection to the underlying conflict.

### 4. BBEG & Henchmen

Describe the main villain, 2–3 lieutenants, and supporting monsters. Include their motivations, roles in the plan, relationships, knowledge, and likely reactions to interference.

### 5. Factions and Power Players

Describe 2–4 factions, including their philosophies, leaders, public goals, actual goals, resources, and relationships to the conflict.

### 6. Key Locations

Describe 4–5 campaign locations, including their roles, threats, relevant history, secrets, and discoverable clues.

### 7. Important NPCs

Provide 3–5 memorable NPCs with motives and ties to the conflict. Explain what each knows, what they want from the party, what they conceal or misunderstand, and how their behaviour could change.

### 8. Key Items: Overview and DM Reference

Provide a consolidated reference for all narratively or mechanically significant items that players may encounter or hear about. Include relevant artifacts, magic items, weapons, relics, keys, documents, ritual components, special materials, and personal possessions. Include legendary, lost, destroyed, or rumoured items when they matter to the campaign. Routine equipment does not need an entry unless it has a specific story role.

Start with an overview table:

| Item | Description and identifying features | Campaign significance | Current location or holder | How players may encounter it or hear of it |
|---|---|---|---|---|

Follow with a concise reference entry for each key item, covering:

- Player-facing information: What characters can initially observe or reasonably know, including its name, appearance, and reputation.
- Rumours and beliefs: What people claim about it, who makes those claims, and whether each claim is true, false, or incomplete.
- DM-only truth: Its actual origin, purpose, history, secrets, and connection to the underlying conflict. Explain why relevant NPCs or factions want it.
- Actual properties and use: What it does and how it is used. For usable items, specify applicable activation requirements, attunement, charges, duration, limitations, costs, risks, and ways to disable or destroy it. Clearly label homebrew rules.
- Discovery and identification: How players can locate it and learn its true nature. State what observation, research, NPC testimony, checks, or identification magic can reveal, including any justified limits.
- Availability and timing: Whether the item is obtainable, when it is likely to enter the campaign, and any prerequisites for acquiring or using it.
- Choices and consequences: Explain the relevant effects of taking, using, surrendering, losing, destroying, or ignoring it. For plot-critical items, explain how the campaign can continue if the party never obtains them.
- Connections: Reference the relevant NPCs, factions, locations, scenes, and revelations.

Use enough detail to make each item understandable and usable without requiring the DM to invent essential properties. Mark irrelevant fields as not applicable rather than adding unnecessary mechanics. Keep powerful obtainable items appropriate to the intended level range, and explain any deliberate exceptions and their consequences.

### 9. Key Scenes

Provide 4–6 pivotal scenes with locations, NPCs, conflicts, and meaningful player choices. Indicate the expected level range and progression milestones across the arc.

For each scene or encounter, include:

- Player-facing situation: What the characters initially perceive.
- DM-only explanation: What is actually happening, why it is happening, and how it connects to the wider campaign.
- Discoverable information: Relevant clues, how players can find them, and what they reveal.
- Relevant items: Which key items are present, mentioned, sought, or usable, with references to their entries in Section 8.
- Choices and consequences: Likely outcomes of different approaches, including failure, avoidance, or unexpected intervention.
- NPC responses: How relevant actors react and adapt.
- Continuation: How the story can proceed from different outcomes without forcing a predetermined choice.

### 10. Recurring Themes

Identify 2–3 key themes and explain how they appear through situations, choices, and consequences.

### 11. DM Clarity and Consistency Check

Before presenting the final output, review the entire campaign from the perspective of a DM encountering it for the first time. Fix any gaps or contradictions you identify.

Check that:

- The underlying situation and sequence of events are understandable and internally consistent.
- Every major actor has a clear motivation, sufficient knowledge, and plausible means to take their described actions.
- The villain’s plan is workable within the established rules, with clear dependencies, limitations, and reasons for its timing.
- Important mechanisms are explained well enough to adjudicate at the table.
- Every major mystery has an explicit DM-facing answer.
- Essential revelations have accessible clues and multiple discovery routes.
- NPC behaviour reflects what each NPC actually knows, rather than unexplained knowledge of the plot.
- Hooks, locations, NPCs, scenes, and the climax connect coherently.
- Every significant item mentioned elsewhere in the campaign appears in the key items overview, including items known only through rumours or historical accounts.
- Item properties, locations, ownership, histories, and availability are consistent across the campaign.
- The DM can distinguish what players believe about each item from what it actually does.
- Plot-critical item dependencies are explicit, with viable continuations if those items are missed, lost, destroyed, or used unexpectedly.
- Player choices meaningfully affect events, and failure or refusal does not leave the DM without a way to continue.
- All provided tropes are integrated, and established lore is respected.
- No essential explanation is left as “the DM decides,” “somehow,” or an unresolved placeholder.

Conclude with a brief DM Readiness Summary identifying any assumptions, remaining optional decisions, and where the answers to the campaign’s central mysteries are explained. Do not merely declare that the check passed: provide specific references to the relevant sections. If an essential issue cannot be resolved without user input, identify the exact missing information and provide a clearly labelled provisional solution.`;
    } else {
      return `# 🎯 PROMPT: ONE-SHOT ADVENTURE BUILDER

Create a complete D&D 5e one-shot adventure based on the following story tropes.

## TROPES TABLE

| # | Trope Name | Trope Description |
|---|------------|-------------------|
${elementTable}
${loreLinkSection}
${buildCampaignContext(campaignHistory, campaignDocuments)}

## REQUIREMENTS

Generate a one-shot adventure that:
- Can be completed in a single session (3-6 hours)
- Uses ALL provided tropes naturally
- Has personal stakes and local consequences (not world-ending)

## OUTPUT STRUCTURE

1. **Adventure Title and Premise** - Title and 1-2 paragraph summary
2. **Adventure Hooks** - 3 hooks drawing PCs into the quest
3. **BBEG & Henchmen** - Main villain, 1-2 supporters, thematic creatures
4. **Main Locations** - 4 important locations with descriptions
5. **Major NPCs** - 2-3 supporting NPCs with motives and ties
6. **Core Scenes** - 3-4 major scenes with conflicts
7. **Rewards & Outcomes** - 2-3 resolutions depending on PC choices
8. **Recurring Themes** - 1-2 key themes`;
    }
  };

  const handleExportTemplate = async () => {
    if (hasNoElements || isReadingDocuments) return;
    
    try {
      const promptContent = generateTemplateContent(templateType, tropes);
      await navigator.clipboard.writeText(promptContent);
      setShowClipboardMessage(true);
    } catch (error) {
      toast({
        title: "Copy Failed", 
        description: "Failed to copy prompt to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleGenerateAdventure = async () => {
    if (hasNoElements || isReadingDocuments) return;

    const prompt = generateTemplateContent(templateType, tropes);
    const content = await generateAdventure(prompt, templateType);
    
    if (content) {
      setGeneratedContent(content);
      const title = extractAdventureTitle(content);
      generateAdventurePDF(content, title, templateType);
      
      toast({
        title: "Adventure Generated",
        description: `Your ${templateType === 'campaign' ? 'campaign' : 'one-shot'} PDF has been downloaded.`,
      });
    }
  };

  const handleDownloadAgain = () => {
    if (generatedContent) {
      const title = extractAdventureTitle(generatedContent);
      generateAdventurePDF(generatedContent, title, templateType);
    }
  };

  return (
    <Card className="bg-card/90 backdrop-blur-sm border-border/60 shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-foreground">
            Let's make an adventure
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowExportHelp(!showExportHelp)}
            className="h-6 w-6 p-0 hover:bg-muted/20"
          >
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {showExportHelp && (
          <p className="text-sm text-muted-foreground bg-muted/10 p-3 rounded-lg border border-border/20">
            Generate a complete adventure directly as a PDF, or copy the prompt to use with your own LLM.
          </p>
        )}
        
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-sm font-medium">What sort of adventure do you want to create?</Label>
            <RadioGroup 
              value={templateType} 
              onValueChange={(value) => setTemplateType(value as 'campaign' | 'oneshot')}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="campaign" id="campaign" />
                <Label htmlFor="campaign" className="text-sm">Campaign</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="oneshot" id="oneshot" />
                <Label htmlFor="oneshot" className="text-sm">One Shot</Label>
              </div>
            </RadioGroup>
          </div>

          <CampaignContextInput
            history={campaignHistory}
            documents={campaignDocuments}
            onHistoryChange={setCampaignHistory}
            onDocumentsChange={setCampaignDocuments}
            onReadingChange={setIsReadingDocuments}
            disabled={isGenerating}
          />

          {/* Generate Adventure Button */}
          <Button
            variant="mystical"
            onClick={handleGenerateAdventure}
            disabled={disabled || hasNoElements || isGenerating || isReadingDocuments}
            className="w-full justify-center text-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Generate adventure
              </>
            )}
          </Button>

          {/* Download Again Button - shown after generation */}
          {generatedContent && !isGenerating && (
            <Button
              variant="outline"
              onClick={handleDownloadAgain}
              className="w-full justify-center text-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download PDF again
            </Button>
          )}

          {/* Error display */}
          {error && (
            <div className="text-sm text-destructive text-center p-3 bg-destructive/20 rounded-lg border border-destructive/40">
              {error}
            </div>
          )}

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/40" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          {/* Copy Prompt Button */}
          <Button
            variant="outline"
            onClick={handleExportTemplate}
            disabled={disabled || hasNoElements || isReadingDocuments}
            className="w-full justify-center text-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Copy prompt to clipboard
          </Button>
          
          {showClipboardMessage && (
            <div className="text-sm text-primary text-center p-3 pr-8 bg-primary/20 rounded-lg border border-primary/40 relative">
              Prompt copied to clipboard. Open an LLM to paste the prompt.
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClipboardMessage(false)}
                className="absolute top-2 right-2 h-5 w-5 p-0 bg-primary/30 hover:bg-primary/50 text-primary hover:text-primary-foreground border border-primary/60"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          <Button
            variant="outline"
            onClick={handleExportTable}
            disabled={disabled || hasNoElements}
            className="w-full justify-center text-center"
          >
            Export Story Elements
          </Button>
        </div>
        
        {hasNoElements && (
          <div className="text-xs text-muted-foreground text-center mt-3 p-3 bg-muted/30 rounded-lg">
            <Printer className="h-4 w-4 mx-auto mb-1 opacity-50" />
            Generate some story elements first to enable export options
          </div>
        )}
      </CardContent>
    </Card>
  );
};
