import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Plus, X, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LoreUrlInput } from './LoreUrlInput';
import { resolveLoreLinkTitle } from '@/utils/loreLinkTitle';

interface LoreLink {
  id: string;
  title: string;
  url: string;
}

interface LoreLinksManagerProps {
  loreLinks: LoreLink[];
  onLinksChange: (links: LoreLink[]) => void;
}

export const LoreLinksManager = ({ loreLinks, onLinksChange }: LoreLinksManagerProps) => {
  const { toast } = useToast();
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [autoTitle, setAutoTitle] = useState('');

  const isValidUrl = (url: string) => {
    try {
      return new URL(url).protocol === 'https:';
    } catch {
      return false;
    }
  };

  const addLink = () => {
    if (!newUrl.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a document URL",
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
      title: resolveLoreLinkTitle(newUrl, newTitle, autoTitle),
      url: newUrl.trim(),
    };

    onLinksChange([...loreLinks, newLink]);
    setNewTitle('');
    setNewUrl('');
    setAutoTitle('');
    
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
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Lore Documents ({loreLinks.length}/10)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <LoreUrlInput url={newUrl} title={newTitle} autoTitle={autoTitle} onChange={patch => {
            if (patch.url !== undefined) setNewUrl(patch.url);
            if (patch.title !== undefined) setNewTitle(patch.title);
            if (patch.autoTitle !== undefined) setAutoTitle(patch.autoTitle);
          }} />
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
          <div className="text-center py-6 text-muted-foreground">
            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No lore documents added yet</p>
            <p className="text-xs mt-1">Add links to Google Docs, Notion pages, or other reference materials</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};