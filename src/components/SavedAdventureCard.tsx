import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, Link2, Pencil, Trash2, Check, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SavedAdventureEntry, fetchAdventure, deleteAdventure, renameAdventure, shareLink, kindLabel } from '@/utils/savedAdventures';

export const SavedAdventureCard = ({ entry }: { entry: SavedAdventureEntry }) => {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(entry.title);
  const fail = (e: unknown) => toast({ title: 'Something went wrong', description: e instanceof Error ? e.message : String(e), variant: 'destructive' });

  const run = async (fn: () => Promise<void>) => { setBusy(true); try { await fn(); } catch (e) { fail(e); } finally { setBusy(false); } };

  return (
    <Card className="bg-card/90 border-border/60">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          {editing ? (
            <div className="flex gap-2 flex-1">
              <Input value={title} onChange={e => setTitle(e.target.value)} maxLength={200} aria-label="Adventure title" />
              <Button size="icon" variant="ghost" aria-label="Save title" disabled={busy || !title.trim()}
                onClick={() => run(async () => { await renameAdventure(entry, title.trim()); setEditing(false); })}><Check className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" aria-label="Cancel" onClick={() => { setTitle(entry.title); setEditing(false); }}><X className="h-4 w-4" /></Button>
            </div>
          ) : (
            <h3 className="font-semibold text-foreground">{entry.title}</h3>
          )}
          <Badge variant="secondary">{kindLabel(entry.kind)}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</p>
        {entry.elements.length > 0 && (
          <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Elements:</span> {entry.elements.map(e => e.name).join(', ')}</p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={busy} onClick={() => run(async () => { const a = await fetchAdventure(entry.id); window.location.assign(a.downloadUrl); })}>
            {busy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}Download PDF
          </Button>
          <Button size="sm" variant="outline" onClick={async () => {
            try { await navigator.clipboard.writeText(shareLink(entry.id)); toast({ title: 'Link copied' }); } catch (e) { fail(e); }
          }}><Link2 className="h-4 w-4 mr-1" />Copy link</Button>
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}><Pencil className="h-4 w-4 mr-1" />Rename</Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => {
            if (window.confirm(`Delete "${entry.title}"? This removes the PDF for everyone with the link.`)) run(() => deleteAdventure(entry));
          }}><Trash2 className="h-4 w-4 mr-1" />Delete</Button>
        </div>
      </CardContent>
    </Card>
  );
};
