import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Copy, ChevronDown, ChevronUp, Sparkles, Trash2, Link, Upload, FileText, Download, Loader2, Wand2 } from 'lucide-react';
import { GeneratedEncounter } from '@/types/encounter';
import { useToast } from '@/hooks/use-toast';
import { usePromptTemplate } from '@/hooks/usePromptTemplate';
import { useEncounterAI } from '@/hooks/useEncounterAI';
import { generateEncounterPDF, extractEncounterTitle } from '@/utils/pdfGenerator';

interface LoreLink {
  id: string;
  title: string;
  url: string;
  sourceType: 'url' | 'file';
  fileContent?: string;
  fileName?: string;
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
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const { toast } = useToast();
  const { template: promptTemplate, isLoading: templateLoading } = usePromptTemplate();
  const { generateEncounter: generateAIEncounter, isGenerating } = useEncounterAI();

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const addLoreLink = (sourceType: 'url' | 'file' = 'url') => {
    setLoreLinks([...loreLinks, { id: crypto.randomUUID(), title: '', url: '', sourceType }]);
  };

  const removeLoreLink = (id: string) => {
    setLoreLinks(loreLinks.filter(link => link.id !== id));
  };

  const updateLoreLink = (id: string, field: 'title' | 'url' | 'sourceType', value: string) => {
    setLoreLinks(loreLinks.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ));
  };

  const handleFileUpload = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setLoreLinks(loreLinks.map(link => 
        link.id === id ? { 
          ...link, 
          fileContent: content, 
          fileName: file.name,
          title: link.title || file.name.replace(/\.[^/.]+$/, '') 
        } : link
      ));
      toast({
        title: "File loaded",
        description: `${file.name} has been loaded successfully.`,
      });
    };
    reader.onerror = () => {
      toast({
        title: "Error reading file",
        description: "Could not read the uploaded file",
        variant: "destructive",
      });
    };
    reader.readAsText(file);
  };

  const generatePromptContent = (): string => {
    if (!encounter) return '';

    const hasValidLinks = loreLinks.some(l => l.sourceType === 'url' ? l.url.trim() : l.fileContent);
    const loreLinkSection = loreLinks.length > 0 && hasValidLinks
      ? `**World Lore Documents:**
${loreLinks.filter(l => l.sourceType === 'url' ? l.url.trim() : l.fileContent).map(link => {
  if (link.sourceType === 'file' && link.fileContent) {
    return `- ${link.title || link.fileName || 'Untitled'} (Local File):\n\`\`\`\n${link.fileContent.substring(0, 5000)}${link.fileContent.length > 5000 ? '\n... (truncated)' : ''}\n\`\`\``;
  }
  return `- ${link.title || 'Untitled'}: ${link.url}`;
}).join('\n')}
` : '';

    const encounterInputs = `
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

    return promptTemplate + encounterInputs;
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

  const handleGenerateWithAI = async () => {
    if (!encounter) {
      toast({
        title: 'No encounter generated',
        description: 'Please generate an encounter first.',
        variant: 'destructive',
      });
      return;
    }

    const prompt = generatePromptContent();
    const content = await generateAIEncounter(prompt);
    
    if (content) {
      setGeneratedContent(content);
      toast({
        title: 'Encounter Generated!',
        description: 'Your AI-generated encounter is ready. Click "Download PDF" to save it.',
      });
    }
  };

  const handleDownloadPDF = () => {
    if (!generatedContent) {
      toast({
        title: 'No content to download',
        description: 'Please generate an encounter with AI first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const title = extractEncounterTitle(generatedContent);
      generateEncounterPDF(generatedContent, title);
      toast({
        title: 'PDF Downloaded!',
        description: 'Your encounter PDF has been saved.',
      });
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      toast({
        title: 'PDF Generation Failed',
        description: 'Could not create the PDF. Please try again.',
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
              Configure your encounter parameters, then generate with ChatGPT to create a complete, DM-ready encounter PDF.
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

            {/* Lore Alignment Mode - Only show when lore links exist with content */}
            {loreLinks.length > 0 && loreLinks.some(l => l.sourceType === 'url' ? l.url.trim() : l.fileContent) && (
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
            )}

            {/* World Lore Links */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  World Lore Documents (Optional)
                </Label>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addLoreLink('url')}
                    className="gap-1"
                  >
                    <Link className="h-3 w-3" />
                    Add URL
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addLoreLink('file')}
                    className="gap-1"
                  >
                    <Upload className="h-3 w-3" />
                    Add File
                  </Button>
                </div>
              </div>
              
              {loreLinks.length > 0 && (
                <div className="space-y-3">
                  {loreLinks.map((link) => (
                    <div key={link.id} className="p-3 bg-muted/20 rounded-lg border border-border/30 space-y-2">
                      <div className="flex gap-2 items-center">
                        <Input
                          placeholder="Title (e.g., 'Campaign Setting')"
                          value={link.title}
                          onChange={(e) => updateLoreLink(link.id, 'title', e.target.value)}
                          className="flex-1"
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
                      
                      {link.sourceType === 'url' ? (
                        <Input
                          placeholder="URL (Google Docs, Notion, etc.)"
                          value={link.url}
                          onChange={(e) => updateLoreLink(link.id, 'url', e.target.value)}
                        />
                      ) : (
                        <div className="flex gap-2 items-center">
                          <input
                            type="file"
                            accept=".txt,.md,.csv,.json"
                            className="hidden"
                            ref={(el) => { fileInputRefs.current[link.id] = el; }}
                            onChange={(e) => handleFileUpload(link.id, e)}
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => fileInputRefs.current[link.id]?.click()}
                            className="gap-1"
                          >
                            <Upload className="h-3 w-3" />
                            {link.fileName ? 'Change File' : 'Choose File'}
                          </Button>
                          {link.fileName && (
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {link.fileName}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                Add URLs to online documents (Google Docs, Notion) or upload local files (.txt, .md, .csv, .json) containing your campaign's world lore.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Generate with AI Button */}
              <Button
                onClick={handleGenerateWithAI}
                disabled={disabled || !encounter || isGenerating || templateLoading}
                className="w-full gap-2"
                size="lg"
              >
              {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Generate encounter
                  </>
                )}
              </Button>

              {/* Download PDF Button - Only show after generation */}
              {generatedContent && (
                <Button
                  onClick={handleDownloadPDF}
                  variant="secondary"
                  className="w-full gap-2"
                  size="lg"
                >
                  <Download className="h-4 w-4" />
                  Download Encounter PDF
                </Button>
              )}

              {/* Copy Prompt Button */}
              <Button
                onClick={handleCopyPrompt}
                disabled={disabled || !encounter}
                variant="outline"
                className="w-full gap-2"
                size="sm"
              >
                <Copy className="h-4 w-4" />
                Copy Prompt (Manual Mode)
              </Button>
            </div>

            {/* Generated Content Preview */}
            {generatedContent && (
              <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border/50 max-h-64 overflow-y-auto">
                <h4 className="text-sm font-semibold mb-2 text-foreground">Generated Encounter Preview:</h4>
                <div className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                  {generatedContent.substring(0, 1000)}
                  {generatedContent.length > 1000 && '...'}
                </div>
              </div>
            )}

            {!encounter && (
              <p className="text-xs text-center text-muted-foreground">
                Generate an encounter above first, then create it with AI.
              </p>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
