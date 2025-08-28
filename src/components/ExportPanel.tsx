import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Download, FileText, Scroll, Printer } from 'lucide-react';
import { Trope } from '@/types/trope';
import { exportTropesToText, exportDnDCampaignTemplate } from '@/utils/exportUtils';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface ExportPanelProps {
  tropes: Trope[];
  disabled?: boolean;
  onExportTemplate?: (templateType: 'campaign' | 'oneshot') => void;
}

export const ExportPanel = ({ tropes, disabled = false, onExportTemplate }: ExportPanelProps) => {
  const { toast } = useToast();
  const [templateType, setTemplateType] = useState<'campaign' | 'oneshot'>('campaign');
  const [showClipboardMessage, setShowClipboardMessage] = useState(false);
  const hasNoTropes = tropes.length === 0;

  const handleExportText = () => {
    if (hasNoTropes) return;
    
    try {
      exportTropesToText(tropes);
      toast({
        title: "Export Successful",
        description: "Tropes exported to text file",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export tropes to text file",
        variant: "destructive",
      });
    }
  };

  const generateTemplateContent = (type: 'campaign' | 'oneshot', tropeList: Trope[]) => {
    const currentDate = new Date().toLocaleDateString();
    
    // Generate trope table for the prompt
    const tropeTable = tropeList.map((trope, index) => 
      `| ${index + 1} | ${trope.name} | ${trope.detail || '(No description provided)'} |`
    ).join('\n');

    if (type === 'campaign') {
      return `🎯 PROMPT ENGINEERED TEMPLATE: SINGLE-ARC CAMPAIGN BUILDER (1–10 Tropes)

---

🧠 SYSTEM INSTRUCTIONS (FOR CHATGPT):

You are a creative D&D adventure generator.

Your input is a table of 1–10 tropes. Each trope includes:
- A trope name
- An optional description of any length, giving full thematic or narrative detail

For any trope that does not include a description, you must:
- Search the web (e.g., TVTropes.org or Wikipedia)
- Summarize the trope's meaning in a few sentences, incorporating its key narrative elements
- Cite the source used

Then, use all trope details to build a single-arc campaign-level adventure. This arc should span multiple sessions and support 3rd–10th level progression, with branching player decisions but a cohesive story climax.

Your output must include a structured, modular campaign outline with:
- World premise
- Adventure hooks
- Factions and NPCs
- Key locations
- 4–6 detailed scenes/situations (with clues if applicable)
- Major themes

---

✅ INPUT FORMAT (TROPE TABLE)

| # | Trope Name         | Trope Description (optional, any length)                            |
|---|--------------------|------------------------------------------------------------------------|
${tropeTable}

---

🧾 OUTPUT FORMAT (D&D SINGLE-ARC CAMPAIGN STRUCTURE)

---

🧙‍♂️ CAMPAIGN TITLE AND PREMISE

Title:  
[A compelling, setting-appropriate campaign title.]

Summary:  
[1–2 paragraphs summarizing the single main story arc. Clearly show how the tropes drive the central mystery, danger, or transformation in the world.]

---

🎣 ADVENTURE HOOKS

[3–5 starting plot hooks that draw players into the world and main arc.]

1.  
2.  
3.  
4.  
5.

---

🛡️ FACTIONS AND POWER PLAYERS

[2–4 major factions, organizations, or influential individuals. Each should be tied to 1 or more tropes.]

- Name:  
  Philosophy / Goals:  
  Key Figure:  
  Tropes Represented:  

---

🗺️ KEY LOCATIONS

[Describe 3–5 campaign locations. These may evolve as the story progresses.]

- Location Name:  
  Description:  
  Narrative Role:  
  Unusual Effects / Inhabitants:  
  Associated Tropes:  

---

🎭 IMPORTANT NPCs

[List 3–5 memorable and influential NPCs. Tie each to a trope.]

- Name:  
  Role in the Story:  
  Agenda / Secrets:  
  Relationship to Tropes:  
  How They Interact with the PCs:  
  Roleplaying Tips:  

---

🎬 KEY SCENES AND SITUATIONS

[List 4–6 major scenes that define the arc's progression. Each should include location, purpose, major NPCs, conflict or mystery, and optional clues.]

🔹 Scene 1: [Scene Title]

- Location:  
- Involved NPCs:  
- Scene Focus / Conflict:  
  [Describe the core problem or event here. What decision or danger must the PCs confront?]

- If there's a mystery, include 3 clues the PCs may discover:  
  - Clue 1:  
  - Clue 2:  
  - Clue 3:  

🔹 Scene 2: [Scene Title]

- Location:  
- Involved NPCs:  
- Scene Focus / Conflict:  
- Clues (if applicable):  
  -  
  -  
  -  

(Repeat up to Scene 6.)

---

🌌 RECURRING THEMES

[List 2–3 deeper philosophical or emotional themes present in the campaign, drawn from the tropes.]

1.  
2.  
3.

---

🔁 AI BEHAVIOR INSTRUCTIONS:

- Always assume the output must support multi-session play and long-form engagement, but with a single, primary story arc.
- Incorporate trope details, not just names—reflect their thematic impact across the world, factions, and characters.
- Write scenes as non-linear but interlinked, allowing players to choose their path while staying within the central arc.
- If the campaign contains a central mystery, ensure each scene that contributes to it includes 3 discoverable clues.

---

💾 EXPORT OPTIONS (OPTIONAL):

Would you like this exported as:
- \`.txt\` plain text
- \`.md\` Markdown
- Google Docs copyable format

---

*Generated on ${currentDate} using the D&D Story Generator*`;
    } else {
      return `🎯 PROMPT ENGINEERED TEMPLATE: ONE-SHOT OR SIDE QUEST ADVENTURE (1–10 Tropes)

---

🧠 SYSTEM INSTRUCTIONS (FOR CHATGPT):

You are a creative D&D one-shot or side quest generator.

Your input is a table of **1–10 story tropes**. Each trope includes:
- A **trope name**
- An **optional description** (unlimited length, narrative or thematic)

For any trope that does not include a description, you must:
- Search the web (e.g., TVTropes.org or Wikipedia)
- Summarize the trope's meaning and dramatic function in a few sentences
- Cite the source used

You will then use all trope details to build a **compact, engaging adventure** suitable for:
- A **one-shot (3–6 hours of play)**
- OR a **side quest** that fits within a broader campaign

The story should reflect a **lower scale of epicness**: focus on local consequences, intimate mysteries, personal stakes, or self-contained magical events.

---

✅ INPUT FORMAT (TROPE TABLE)

| # | Trope Name         | Trope Description (optional, any length)                          |
|---|--------------------|----------------------------------------------------------------------|
${tropeTable}

---

🧾 OUTPUT FORMAT (ONE-SHOT / SIDE QUEST STRUCTURE)

---

🧙‍♂️ ADVENTURE TITLE AND PREMISE

**Title:**  
[A short, evocative title.]

**Summary:**  
[1 paragraph summary. Show how the selected tropes combine to shape the plot, tone, and central problem.]

---

🎣 ADVENTURE HOOKS

[2–3 ways the party might become involved in the quest.]

1.  
2.  
3.  

---

🗺️ MAIN LOCATION(S)

[Describe 1–2 key settings where the adventure takes place.]

- **Name:**  
  *Description:*  
  *Why it matters:*  
  *Relevant Tropes:*  

---

🎭 MAJOR NPCs

[Describe 2–3 important NPCs involved in the quest.]

- **Name:**  
  *Role in the Quest:*  
  *Connection to Tropes:*  
  *What they want from the PCs:*  
  *How to Roleplay Them:*  

---

🎬 CORE SCENES AND CHALLENGES

[List **3–4 major scenes or situations** in the one-shot. Each should include the location, NPCs, core problem, and mystery clues if relevant.]

🔹 Scene 1: [Scene Title]  
- **Location:**  
- **Involved NPCs:**  
- **Scene Focus / Conflict:**  
- **Mystery Clues (if applicable):**  
  - Clue 1:  
  - Clue 2:  
  - Clue 3:  

🔹 Scene 2:  
- **Location:**  
- **Involved NPCs:**  
- **Scene Focus / Conflict:**  
- **Mystery Clues (if applicable):**  
  -  
  -  
  -  

(Repeat up to Scene 4.)

---

🎭 REWARD / OUTCOME OPTIONS

[Describe 2–3 ways the quest may resolve. Allow for different choices or approaches.]

1.  
2.  
3.

---

🌱 RECURRING THEMES

[1–2 themes that emerge from the tropes and story.]

1.  
2.

---

📌 CUSTOMIZATION INVITE

Would you like to tailor this one-shot or side quest to an existing world or campaign?

If so, please provide:
- Key facts about your campaign (major factions, current story arc, tone, known NPCs, etc.)
- Whether you want this to connect to the main plot, foreshadow something bigger, or stay standalone
- Any known character backgrounds or hooks you'd like to incorporate

I'll adapt the adventure accordingly.

---

*Generated on ${currentDate} using the D&D Story Generator*`;
    }
  };

  const handleExportTemplate = async () => {
    if (hasNoTropes) return;
    
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
        <CardTitle className="text-white flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="gold"
          onClick={handleExportText}
          disabled={disabled || hasNoTropes}
          className="w-full justify-start"
        >
          <FileText className="h-4 w-4 mr-2" />
          Export to Text File
        </Button>
        
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Template Type</Label>
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
            variant="parchment"
            onClick={handleExportTemplate}
            disabled={disabled || hasNoTropes}
            className="w-full justify-start"
          >
            <Scroll className="h-4 w-4 mr-2" />
            Create adventure prompt
          </Button>
          
          {showClipboardMessage && (
            <div className="text-sm text-green-400 text-center mt-2 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
              Prompt copied to clipboard. Open an LLM to paste the prompt.
            </div>
          )}
        </div>
        
        {hasNoTropes && (
          <div className="text-xs text-muted-foreground text-center mt-3 p-3 bg-muted/30 rounded-lg">
            <Printer className="h-4 w-4 mx-auto mb-1 opacity-50" />
            Generate some tropes first to enable export options
          </div>
        )}
        
        {!hasNoTropes && (
          <div className="text-xs text-muted-foreground space-y-1 mt-3 pt-3 border-t border-border/30">
            <p>Keyboard shortcuts:</p>
            <p><kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl+P</kbd> Export text</p>
            <p><kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl+T</kbd> Generate template</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};