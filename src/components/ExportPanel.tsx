import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Printer, HelpCircle, X } from 'lucide-react';
import { Trope } from '@/types/trope';
import { exportTropesToText, exportDnDCampaignTemplate } from '@/utils/exportUtils';
import { useToast } from '@/hooks/use-toast';

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
  const hasNoElements = tropes.length === 0;

  const handleExportTable = () => {
    if (hasNoElements) return;
    
    try {
      // Build a hash-route URL that works in PWAs and respects base path
      const routeUrl = `${import.meta.env.BASE_URL}#/trope-table?timestamp=${Date.now()}`;

      // Store story elements before navigating
      sessionStorage.setItem('tropes-for-table', JSON.stringify(tropes));

      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

      if (isStandalone) {
        // In iOS A2HS/standalone, open in-app to avoid 404/new-window issues
        window.location.assign(routeUrl);
      } else {
        // In browsers, open a new tab
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
    const currentDate = new Date().toLocaleDateString();
    
    // Generate story elements table for the prompt
    const elementTable = elementList.map((element, index) => 
      `| ${index + 1} | ${element.name} | ${element.detail || '(No description provided)'} |`
    ).join('\n');

    // Generate lore links section
    const loreLinkSection = loreLinks.length > 0 ? `

**Optional World Lore Links:**  
${loreLinks.map((link) => `- ${link.title}: ${link.url}`).join('  \n')}  

*Note: Please read and incorporate relevant information from these lore documents to ground the adventure in the established world setting.*` : '';

    if (type === 'campaign') {
      return `# 🎯 PROMPT ENGINEERED TEMPLATE: SINGLE-ARC CAMPAIGN BUILDER (1–10 Tropes, Auto-Execute)

---

🧠 SYSTEM INSTRUCTIONS (FOR CHATGPT):

You are a creative **D&D campaign generator**.

Your input is a table of **1–10 tropes**. Each trope includes:  
- A **trope name**  
- An **optional description of any length**, giving full thematic or narrative detail  

For any trope that does **not** include a description, you must:  
1. Search the web (e.g., TVTropes.org or Wikipedia)  
2. Summarize the trope's meaning in a few sentences, incorporating its key narrative elements  
3. Cite the source used  

If the user also provides **links to Google Docs files** containing information about their homebrew world or campaign setting, you must:  
- Read and incorporate the relevant details from those files.  
- Use this world information to ground the campaign in its setting (names, factions, locations, history, etc.).  
- Prioritize those lore documents over general assumptions.  

Then, use **all trope details** and any provided lore links to build a **single-arc campaign-level adventure**.  

This arc should span **multiple sessions** and support **3rd–10th level progression**, with **branching player decisions** but a **cohesive story climax**.  

---

✅ **INPUT FORMAT (TROPE TABLE + OPTIONAL WORLD LORE LINKS)**  

| # | Trope Name | Trope Description (optional, any length) |
|---|------------|-------------------------------------------|
${elementTable}
${loreLinkSection}

---

🧾 **OUTPUT FORMAT (CAMPAIGN STRUCTURE)**  

---

## 🧙‍♂️ CAMPAIGN TITLE AND PREMISE  

**Title:**  
[A compelling campaign title.]  

**Summary:**  
[1–2 paragraphs summarizing the arc. Explain each trope by weaving it into the story's central conflict and transformation. Do not mention "tropes" directly. Integrate any relevant world-lore details.]  

---

## 🎣 ADVENTURE HOOKS  

[Provide at least 3–5 plot hooks that introduce the players to the campaign arc.]  

---

## 🦹 BIG BAD EVIL GUY (BBEG) & HENCHMEN  

- **BBEG Name:**  
  *Summary:* Who they are, their goals, and why they are dangerous.  
  *Key Powers / Style:* Signature abilities, tactics, and personality.  

- **Henchmen / Lieutenants:**  
  [List 2–3 important henchmen or rivals with summaries.]  

- **Supporting Monsters:**  
  [List thematic monsters or creatures that populate the campaign, tied to the villains.]  

---

## 🛡️ FACTIONS AND POWER PLAYERS  

[2–4 factions, each tied to the story. Show their philosophy, leaders, and goals.]  

---

## 🗺️ KEY LOCATIONS  

[Describe at least 4–5 campaign locations, including their role and evolving threats.]  

---

## 🎭 IMPORTANT NPCs  

[List 3–5 memorable NPCs with clear motives, agendas, and ties to the conflict.]  

---

## 🎬 KEY SCENES AND SITUATIONS  

[Provide 4–6 pivotal scenes or situations. Each should describe location, NPCs, conflict, and optional mystery clues.]  

---

## 🌌 RECURRING THEMES  

[List 2–3 key themes running through the story arc.]  

---

✨ *Generated with the D&D Single-Arc Campaign Builder Template*`;
    } else {
      return `# 🎯 PROMPT ENGINEERED TEMPLATE: ONE-SHOT OR SIDE QUEST ADVENTURE (1–10 Tropes, Auto-Execute)

---

🧠 SYSTEM INSTRUCTIONS (FOR CHATGPT):

You are a creative **D&D one-shot or side quest generator**.

The input is a table of **1–10 story tropes**. Each trope includes:

- A **trope name**
- An **optional description** (any length).

For any trope **without a description**:

1. Check any linked Google Docs world-lore or "story so far" files first.
2. If the trope name (or something thematically aligned) appears, generate a descriptive summary of that trope from the lore.
3. If no relevant lore reference exists, search the web (e.g., TVTropes.org, Wikipedia).
4. Summarize the trope's meaning and dramatic function in a few sentences.
5. Cite the source if the web was used.

If **Google Docs links** are provided:

- **World lore documents** → use to ground the adventure in its setting (names, factions, places, history).
- **"Story so far" documents** → weave into the adventure so the new quest connects directly to the party's recent events, characters, and unresolved threads.
- Prioritize lore docs first, then story docs, before making assumptions.

👉 Once the trope table is given, **immediately generate a complete one-shot or side quest adventure** in the format below.

⚖️ **Scope and Tone Instruction:**
This is not a sweeping epic. Design it at a **medium level of intensity** — like a novella or a few chapters of a book rather than the whole fantasy saga. Focus on **personal stakes, local consequences, and contained magical events**. The adventure should feel impactful but manageable in a single session (3–6 hours) or a short side quest inside a larger campaign.

---

✅ **INPUT FORMAT (TROPE TABLE + OPTIONAL WORLD LORE LINKS)**  

| # | Trope Name | Trope Description (optional, any length) |
|---|------------|-------------------------------------------|
${elementTable}
${loreLinkSection}

---

🧾 **OUTPUT FORMAT**

---

## 🧙‍♂️ ADVENTURE TITLE AND PREMISE

**Title:**  
[Short, evocative title.]

**Summary:**  
[1–2 paragraphs summarizing the adventure. Integrate each trope naturally. Tie in world lore and the "story so far" if provided. Keep the scale intimate, not world-ending.]

---

## 🎣 ADVENTURE HOOKS

[List at least 3 hooks that draw the PCs into the quest. Where possible, tie directly to recent "story so far" events.]

---

## 🦹 BIG BAD EVIL GUY (BBEG) & HENCHMEN

- **BBEG Name:**  
  *Summary:* Who they are, their goals, and why they are dangerous.  
  *Key Powers / Style:* Signature abilities, tactics, and personality.

- **Henchmen / Lieutenants:**  
  [1–2 supporting villains with summaries.]

- **Supporting Monsters:**  
  [List thematic creatures.]

---

## 🗺️ MAIN LOCATIONS

[Describe at least 4 important locations.]

- **Name:**  
  *Description:*  
  *Why it matters:*

---

## 🎭 MAJOR NPCs

[2–3 supporting NPCs with motives, personality, and ties to events. Where possible, link them to "story so far" characters.]

---

## 🎬 CORE SCENES AND CHALLENGES

[List 3–4 major scenes. Include location, NPCs, central conflict. If mystery: 3 clues. Where possible, connect challenges to unresolved "story so far" elements.]

---

## 🎭 REWARD / OUTCOME OPTIONS

[2–3 possible resolutions depending on PC choices. Where possible, tie outcomes to ongoing plot threads from the "story so far."]

---

## 🌱 RECURRING THEMES

[Summarize 1–2 key themes running throughout the adventure.]

---

✨ **Auto-generated with the D&D One-Shot / Side Quest Builder Template**`;
    }
  };

  const handleExportTemplate = async () => {
    if (hasNoElements) return;
    
    try {
      const promptContent = generateTemplateContent(templateType, tropes);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(promptContent);
      
      // Show clipboard message (persistent until dismissed)
      setShowClipboardMessage(true);
    } catch (error) {
      toast({
        title: "Copy Failed", 
        description: "Failed to copy prompt to clipboard",
        variant: "destructive",
      });
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
            You can use your story elements combination to create an adventure with an LLM. Click "create adventure prompt" to copy a prompt to the clipboard.
          </p>
        )}
        
        <div className="space-y-3">
          <Button
            variant="mystical"
            onClick={handleExportTemplate}
            disabled={disabled || hasNoElements}
            className="w-full justify-center text-center"
          >
            Create adventure prompt
          </Button>
          
          {showClipboardMessage && (
            <div className="text-sm text-green-400 text-center p-3 pr-8 bg-green-500/20 rounded-lg border border-green-500/40 relative">
              Prompt copied to clipboard. Open an LLM to paste the prompt.
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClipboardMessage(false)}
                className="absolute top-2 right-2 h-5 w-5 p-0 bg-green-500/30 hover:bg-green-500/50 text-green-200 hover:text-white border border-green-500/60"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          
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