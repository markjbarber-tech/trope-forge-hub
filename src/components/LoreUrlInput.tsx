import { useEffect, useState, useId, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { readLoreTitle } from '@/utils/loreTitle';

interface Props {
  url: string; title: string; autoTitle?: string;
  onChange: (patch: { url?: string; title?: string; autoTitle?: string }) => void;
}
export function LoreUrlInput({ url, title, autoTitle = '', onChange }: Props) {
  const id = useId();
  const [status, setStatus] = useState('');
  const latest = useRef({ title, autoTitle, onChange });
  latest.current = { title, autoTitle, onChange };
  useEffect(() => {
    if (!url.trim()) { setStatus(''); return; }
    let active = true;
    const timer = setTimeout(async () => {
      setStatus('Reading document title…');
      try {
        const found = await readLoreTitle(url.trim());
        if (!active) return;
        const current = latest.current;
        const override = current.title && current.title !== current.autoTitle;
        current.onChange({ autoTitle: found, ...(override ? {} : { title: found }) });
        setStatus('');
      } catch (error) {
        if (active) setStatus(error instanceof Error ? error.message : 'Could not read document title.');
      }
    }, 600);
    return () => { active = false; clearTimeout(timer); };
  }, [url]);
  return <div className="space-y-2">
    <Label htmlFor={`${id}-url`}>Document URL</Label>
    <Input id={`${id}-url`} placeholder="URL (Google Docs, Notion, etc.)" value={url}
      onChange={event => onChange({ url: event.target.value, autoTitle: '', ...(title === autoTitle ? { title: '' } : {}) })} />
    {autoTitle && <p className="text-sm text-foreground break-words">{autoTitle}</p>}
    {status && <p role="status" className="text-xs text-muted-foreground break-words">{status}</p>}
    <Label htmlFor={`${id}-title`}>Document Title (optional override)</Label>
    <Input id={`${id}-title`} placeholder="Optional title override" value={title === autoTitle ? '' : title}
      onChange={event => onChange({ title: event.target.value || autoTitle })} />
  </div>;
}