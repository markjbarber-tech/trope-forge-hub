import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Printer, HelpCircle } from 'lucide-react';
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

Your input is a table of **1–10 story tropes**. Each trope includes:  
- A **trope name**  
- An **optional description** (unlimited length, narrative or thematic)  

For any trope that does **not** include a description, you must:  
1. Search the web (e.g., TVTropes.org or Wikipedia)  
2. Summarize the trope's meaning and dramatic function in a few sentences  
3. Cite the source used  

If the user also provides **links to Google Docs files** containing information about their homebrew world or campaign setting, you must:  
- Read and incorporate the relevant details from those files.  
- Use this world information to ground the adventure in its setting (names, factions, locations, history, etc.).  
- Prioritize those lore documents over general assumptions.  

Then, using **all trope details** and any provided lore links, immediately generate a **compact, engaging one-shot or side quest** suitable for:  
- A **one-shot (3–6 hours of play)**  
- OR a **side quest** that fits within a broader campaign  

The story should focus on **local consequences, intimate mysteries, personal stakes, or self-contained magical events.**  

---

✅ **INPUT FORMAT (TROPE TABLE + OPTIONAL WORLD LORE LINKS)**  

| # | Trope Name | Trope Description (optional, any length) |
|---|------------|-------------------------------------------|
${elementTable}
${loreLinkSection}

---

🧾 **OUTPUT FORMAT (ONE-SHOT / SIDE QUEST STRUCTURE)**  

---

## 🧙‍♂️ ADVENTURE TITLE AND PREMISE  

**Title:**  
[Short, evocative title.]  

**Summary:**  
[1–2 paragraphs summarizing the adventure. Explain each trope by weaving it into the context of the story's danger, mystery, or transformation. Do not mention "tropes" directly. Integrate any relevant world-lore details.]  

---

## 🎣 ADVENTURE HOOKS  

[List at least 3 hooks that draw the PCs into the quest.]  

---

## 🦹 BIG BAD EVIL GUY (BBEG) & HENCHMEN  

- **BBEG Name:**  
  *Summary:* Who they are, their goals, and why they are dangerous.  
  *Key Powers / Style:* Signature abilities, tactics, and personality.  

- **Henchmen / Lieutenants:**  
  [List 1–2 henchmen or supporting villains with summaries.]  

- **Supporting Monsters:**  
  [List thematic monsters or creatures that appear alongside the villains.]  

---

## 🗺️ MAIN LOCATIONS  

[Describe at least 4 important locations where the adventure takes place.]  

- **Name:**  
  *Description:*  
  *Why it matters:*  

---

## 🎭 MAJOR NPCs  

[Describe 2–3 supporting NPCs. Each should have motives, personality, and ties to the events.]  

---

## 🎬 CORE SCENES AND CHALLENGES  

[List 3–4 major scenes or situations. Each should include location, NPCs, and central conflict. If mystery, include 3 clues.]  

---

## 🎭 REWARD / OUTCOME OPTIONS  

[Describe 2–3 ways the quest may resolve, allowing for different PC approaches.]  

---

## 🌱 RECURRING THEMES  

[Summarize 1–2 key themes that run throughout the adventure.]  

---

✨ *Generated with the D&D One-Shot / Side Quest Builder Template*`;
    }
  };

  const handleExportTemplate = async () => {
    if (hasNoElements) return;
    
    try {
      const promptContent = generateTemplateContent(templateType, tropes);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(promptContent);
      
      // Show clipboard message
      setShowClipboardMessage(true);
      
      // Hide message after 5 seconds
      setTimeout(() => {
        setShowClipboardMessage(false);
      }, 5000);
      
      toast({
        title: "Prompt Copied!",
        description: "Adventure prompt copied to clipboard",
        duration: 3000,
      });
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
          
          {showClipboardMessage && (
            <div className="text-sm text-green-400 text-center mt-2 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
              Prompt copied to clipboard. Open an LLM to paste the prompt.
            </div>
          )}
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