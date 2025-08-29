import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Upload, 
  Trash2, 
  Download, 
  Plus, 
  X, 
  ExternalLink, 
  ChevronDown,
  Settings,
  Users,
  BookOpen
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface LoreLink {
  id: string;
  title: string;
  url: string;
}

interface AdvancedOptionsProps {
  personalElementCount: number;
  hasPersonalData: boolean;
  onPersonalUpload: (content: string) => void;
  onPurgePersonalData: () => void;
  loreLinks: LoreLink[];
  onLinksChange: (links: LoreLink[]) => void;
  isLoading?: boolean;
}

export const AdvancedOptions = ({ 
  personalElementCount,
  hasPersonalData,
  onPersonalUpload, 
  onPurgePersonalData,
  loreLinks,
  onLinksChange,
  isLoading = false 
}: AdvancedOptionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onPersonalUpload(content);
    };
    
    reader.onerror = () => {
      toast({
        title: "Error reading file",
        description: "Could not read the uploaded file",
        variant: "destructive"
      });
    };
    
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const templateContent = `#,Element name,Element detail`;
    const blob = new Blob([templateContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'personal-elements-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Template Downloaded",
      description: "Template file saved as personal-elements-template.csv",
    });
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const addLink = () => {
    if (!newTitle.trim() || !newUrl.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and URL",
        variant: "destructive",
      });
      return;
    }

    if (!isValidUrl(newUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please provide a valid URL",
        variant: "destructive",
      });
      return;
    }

    if (loreLinks.length >= 10) {
      toast({
        title: "Maximum Links Reached",
        description: "You can add up to 10 lore document links",
        variant: "destructive",
      });
      return;
    }

    const newLink: LoreLink = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      url: newUrl.trim(),
    };

    onLinksChange([...loreLinks, newLink]);
    setNewTitle('');
    setNewUrl('');
    
    toast({
      title: "Link Added",
      description: "Lore document link added successfully",
    });
  };

  const removeLink = (id: string) => {
    onLinksChange(loreLinks.filter(link => link.id !== id));
    toast({
      title: "Link Removed",
      description: "Lore document link removed",
    });
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-card/60 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Advanced Options
              </CardTitle>
              <div className="flex items-center gap-2">
                {(hasPersonalData || loreLinks.length > 0) && (
                  <div className="flex items-center gap-1">
                    {hasPersonalData && (
                      <Badge variant="secondary" className="text-xs">
                        {personalElementCount} personal
                      </Badge>
                    )}
                    {loreLinks.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {loreLinks.length} docs
                      </Badge>
                    )}
                  </div>
                )}
                <ChevronDown 
                  className={`h-4 w-4 text-white transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`} 
                />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-6 pt-0">
            {/* Personal Story Elements Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-white" />
                <h3 className="text-white font-medium">Personal Story Elements</h3>
                {hasPersonalData && (
                  <Badge variant="secondary" className="text-xs">
                    {personalElementCount} elements
                  </Badge>
                )}
              </div>
              
              {hasPersonalData ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    When generating story elements, at least 1 will come from your personal collection.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Replace
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={onPurgePersonalData}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Add your own custom story elements! Upload a CSV file with the same structure as the default data.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="parchment"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Personal Story Elements
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadTemplate}
                      disabled={isLoading}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Template
                    </Button>
                  </div>
                </>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Lore Documents Section */}
            <div className="space-y-4 border-t border-border/30 pt-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-white" />
                <h3 className="text-white font-medium">Lore Documents ({loreLinks.length}/10)</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label htmlFor="link-title" className="text-sm font-medium text-white">
                    Document Title
                  </Label>
                  <Input
                    id="link-title"
                    placeholder="e.g., World History, Character Backgrounds..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="link-url" className="text-sm font-medium text-white">
                    Document URL
                  </Label>
                  <Input
                    id="link-url"
                    placeholder="https://docs.google.com/document/..."
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={addLink}
                  disabled={loreLinks.length >= 10}
                  className="w-full"
                  variant="secondary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lore Document
                </Button>
              </div>

              {loreLinks.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white">Added Documents:</Label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {loreLinks.map((link) => (
                      <div
                        key={link.id}
                        className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border/30"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium text-white truncate">
                              {link.title}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {link.url}
                          </p>
                        </div>
                        <Button
                          onClick={() => removeLink(link.id)}
                          variant="ghost"
                          size="sm"
                          className="ml-2 text-destructive hover:text-destructive-foreground hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {loreLinks.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <BookOpen className="h-6 w-6 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No lore documents added yet</p>
                  <p className="text-xs mt-1">Add links to Google Docs, Notion pages, or other reference materials</p>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};