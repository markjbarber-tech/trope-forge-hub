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

*Note: Please read and incorporate relevant information from these lore documents to ground the adventure in the established world setting.*` : '';

    if (type === 'campaign') {
      return `# 🎯 PROMPT: SINGLE-ARC CAMPAIGN BUILDER

Create a complete D&D 5e campaign arc based on the following story tropes.

## TROPES TABLE

| # | Trope Name | Trope Description |
|---|------------|-------------------|
${elementTable}
${loreLinkSection}

## REQUIREMENTS

Generate a single-arc campaign that:
- Spans multiple sessions (3rd–10th level progression)
- Uses ALL provided tropes naturally woven into the story
- Includes branching player decisions with a cohesive climax

## OUTPUT STRUCTURE

1. **Campaign Title and Premise** - Title and 1-2 paragraph summary
2. **Adventure Hooks** - 3-5 plot hooks introducing players to the arc
3. **BBEG & Henchmen** - Main villain, 2-3 lieutenants, supporting monsters
4. **Factions and Power Players** - 2-4 factions with philosophy, leaders, goals
5. **Key Locations** - 4-5 campaign locations with roles and threats
6. **Important NPCs** - 3-5 memorable NPCs with motives and ties to conflict
7. **Key Scenes** - 4-6 pivotal scenes with location, NPCs, conflict
8. **Recurring Themes** - 2-3 key themes throughout the story`;
    } else {
      return `# 🎯 PROMPT: ONE-SHOT ADVENTURE BUILDER

Create a complete D&D 5e one-shot adventure based on the following story tropes.

## TROPES TABLE

| # | Trope Name | Trope Description |
|---|------------|-------------------|
${elementTable}
${loreLinkSection}

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
    if (hasNoElements) return;
    
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
    if (hasNoElements) return;

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

          {/* Generate Adventure Button */}
          <Button
            variant="mystical"
            onClick={handleGenerateAdventure}
            disabled={disabled || hasNoElements || isGenerating}
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
            disabled={disabled || hasNoElements}
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
