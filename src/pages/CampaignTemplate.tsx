import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Trope } from '@/types/trope';
import { exportDnDCampaignTemplate } from '@/utils/exportUtils';

const CampaignTemplate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tropes, setTropes] = useState<Trope[]>([]);
  const [templateType, setTemplateType] = useState<'campaign' | 'oneshot'>('campaign');

  useEffect(() => {
    const state = location.state;
    if (state?.tropes) {
      setTropes(state.tropes);
      setTemplateType(state.templateType || 'campaign');
    } else {
      // If no tropes provided, redirect back to home
      navigate('/');
    }
  }, [location.state, navigate]);

  const handleDownload = () => {
    exportDnDCampaignTemplate(tropes);
  };

  if (tropes.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Tropes Found</h1>
          <Button onClick={() => navigate('/')} className="text-center justify-center">
            Back to Generator
          </Button>
        </div>
      </div>
    );
  }

  const generateCampaignTemplate = () => {
    const currentDate = new Date().toLocaleDateString();
    
    // Generate trope table for the prompt
    const tropeTable = tropes.map((trope, index) => 
      `| ${index + 1} | ${trope.name} | ${trope.detail || '(No description provided)'} |`
    ).join('\n');

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
  };

  const generateOneShotTemplate = () => {
    const currentDate = new Date().toLocaleDateString();
    
    // Generate trope table for the prompt
    const tropeTable = tropes.map((trope, index) => 
      `| ${index + 1} | ${trope.name} | ${trope.detail || '(No description provided)'} |`
    ).join('\n');

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
  };

  const generateTemplateContent = () => {
    return templateType === 'campaign' ? generateCampaignTemplate() : generateOneShotTemplate();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-center justify-center"
          >
            Back to Generator
          </Button>
          
          <Button
            onClick={handleDownload}
            className="flex items-center gap-2 text-center justify-center"
          >
            Download as Text File
          </Button>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              D&D {templateType === 'campaign' ? 'Campaign' : 'One Shot'} Template
            </CardTitle>
            <p className="text-center text-muted-foreground">
              {templateType === 'campaign' ? 'Campaign-level adventure' : 'One-shot adventure'} generated from {tropes.length} selected tropes
            </p>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate max-w-none dark:prose-invert">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {generateTemplateContent()}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CampaignTemplate;