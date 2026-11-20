import { useEffect, useRef, useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { GeneratorTabs, type GeneratorTab } from '@/components/GeneratorTabs';
import { SavedAdventureCard } from '@/components/SavedAdventureCard';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { loadSavedList, storeSavedList, mergeSavedLists, parseSavedList } from '@/utils/savedAdventures';

interface MyAdventuresProps { isOnline: boolean; onTabChange: (tab: GeneratorTab) => void; }

export const MyAdventures = ({ isOnline, onTabChange }: MyAdventuresProps) => {
  const { toast } = useToast();
  const [list, setList] = useState(loadSavedList);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const refresh = () => setList(loadSavedList());
    window.addEventListener('saved-adventures-changed', refresh);
    window.addEventListener('storage', refresh);
    return () => { window.removeEventListener('saved-adventures-changed', refresh); window.removeEventListener('storage', refresh); };
  }, []);

  const exportList = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'my-adventures.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const importList = async (file: File) => {
    try {
      const incoming = parseSavedList(JSON.parse(await file.text()));
      if (incoming.length === 0) throw new Error('No saved adventures found in that file.');
      storeSavedList(mergeSavedLists(loadSavedList(), incoming));
      toast({ title: 'List imported', description: `${incoming.length} adventure(s) loaded.` });
    } catch (e) {
      toast({ title: 'Import failed', description: e instanceof Error ? e.message : 'Invalid file.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader isOnline={isOnline} />
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8"><GeneratorTabs activeTab="library" onTabChange={onTabChange} /></div>
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-2xl font-bold text-foreground">My Adventures</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportList} disabled={list.length === 0}><Download className="h-4 w-4 mr-1" />Export list</Button>
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4 mr-1" />Import list</Button>
              <input ref={fileRef} type="file" accept=".json,application/json" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) importList(f); e.target.value = ''; }} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Every campaign, one-shot and encounter PDF you generate is saved here. Anyone with a link can open that PDF. Export your list to back it up or move it to another device.
          </p>
          {list.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No saved adventures yet. Generate one and it will appear here.</p>
          ) : list.map(entry => <SavedAdventureCard key={entry.id} entry={entry} />)}
        </div>
      </div>
    </div>
  );
};
