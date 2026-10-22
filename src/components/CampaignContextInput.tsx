import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { FileText, Loader2, Upload, X, Pencil, Link, ExternalLink } from 'lucide-react';
import { CampaignDocument } from '@/utils/campaignContext';
import { readCampaignDocument } from '@/utils/readCampaignDocument';
import { readLoreTitle } from '@/utils/loreTitle';
import { resolveLoreLinkTitle } from '@/utils/loreLinkTitle';
import { validateContextDocumentUrl } from '@/utils/contextDocumentUrl';

// crypto.randomUUID is unavailable on older iPhones/Safari.
const newDocumentId = (): string =>
  typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
        (Number(c) ^ (Math.random() * 16 >> (Number(c) / 4))).toString(16));

interface Props {
  history: string;
  documents: CampaignDocument[];
  onHistoryChange: (value: string) => void;
  onDocumentsChange: (documents: CampaignDocument[]) => void;
  onReadingChange: (reading: boolean) => void;
  disabled?: boolean;
  kind?: 'history' | 'characters';
  saveError?: string;
}

export const CampaignContextInput = ({ history, documents, onHistoryChange, onDocumentsChange, onReadingChange, disabled, kind = 'history', saveError }: Props) => {
  const isCharacters = kind === 'characters';
  const fieldId = isCharacters ? 'player-characters' : 'campaign-history';
  const input = useRef<HTMLInputElement>(null);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [documentUrl, setDocumentUrl] = useState('');

  const addUrl = async () => {
    setError('');
    let url: string;
    try { url = validateContextDocumentUrl(documentUrl); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Enter a valid HTTPS document URL.'); return; }
    setReading(true);
    onReadingChange(true);
    try {
      let title = '';
      try { title = await readLoreTitle(url); } catch { /* Titles are optional; retain inaccessible links as references. */ }
      onDocumentsChange([...documents, { id: newDocumentId(), name: resolveLoreLinkTitle(url, '', title), text: '', url }]);
      setDocumentUrl('');
    } finally {
      setReading(false);
      onReadingChange(false);
    }
  };

  const upload = async (files: File[]) => {
    setReading(true);
    onReadingChange(true);
    setError('');
    const added: CampaignDocument[] = [];
    const errors: string[] = [];
    try {
      for (const file of files) {
        try {
          added.push({ id: newDocumentId(), name: file.name, text: await readCampaignDocument(file) });
        } catch (cause) {
          errors.push(`${file.name}: ${cause instanceof Error ? cause.message : 'Unable to read this document.'}`);
        }
      }
      onDocumentsChange([...documents, ...added]);
      setError(errors.join('\n'));
    } finally {
      setReading(false);
      onReadingChange(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <div className="space-y-3 border-t border-border/40 pt-3">
      <Label htmlFor={fieldId}>{isCharacters ? 'Existing player characters (optional)' : 'Campaign / encounter so far (optional)'}</Label>
      <Textarea
        id={fieldId}
        placeholder={isCharacters ? 'Names, classes, levels, backgrounds, goals, relationships and important possessions…' : 'What has happened so far? Include characters, decisions, discoveries and the current situation…'}
        value={history}
        onChange={event => onHistoryChange(event.target.value)}
        disabled={disabled || reading}
        className="min-h-32"
      />
      <input
        ref={input}
        type="file"
        accept=".txt,.md,.csv,.json,.pdf,.docx"
        multiple
        className="hidden"
        aria-label={isCharacters ? 'Upload player character documents' : 'Upload campaign history documents'}
        disabled={disabled || reading}
        onChange={event => { void upload(Array.from(event.target.files ?? [])); }}
      />
      <Button variant="outline" className="w-full gap-2" disabled={disabled || reading} onClick={() => input.current?.click()}>
        {reading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {reading ? 'Reading documents…' : isCharacters ? 'Upload character details' : 'Upload campaign notes'}
      </Button>
      <p className="text-xs text-muted-foreground">TXT, MD, CSV, JSON, text-based PDF or DOCX</p>
      <Label htmlFor={`${fieldId}-url`}>{isCharacters ? 'Character document URL' : 'Story-so-far document URL'}</Label>
      <Input id={`${fieldId}-url`} type="url" placeholder="https://…" value={documentUrl} disabled={disabled || reading}
        onChange={event => setDocumentUrl(event.target.value)} />
      <Button variant="outline" className="w-full gap-2" disabled={disabled || reading || !documentUrl.trim()} onClick={() => { void addUrl(); }}>
        <Link className="h-4 w-4" />Add document URL
      </Button>
      <p role="status" className="text-xs text-muted-foreground">{saveError ? '' : 'Notes retained on this device'}</p>
      {saveError && <p role="alert" className="text-sm text-destructive">{saveError}</p>}
      {documents.map(document => (
        <div key={document.id} className="min-w-0 border-b border-border/40 py-2">
          <div className="flex min-w-0 items-center gap-2">
          {document.url ? <Link className="h-4 w-4 shrink-0 text-muted-foreground" /> : <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />}
          <span className="min-w-0 flex-1 break-words text-sm">{document.name}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" title={`Edit ${document.name}`} aria-label={`Edit ${document.name}`} disabled={disabled || reading} onClick={() => setEditingId(editingId === document.id ? null : document.id)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" title={`Remove ${document.name}`} aria-label={`Remove ${document.name}`} disabled={disabled || reading} onClick={() => onDocumentsChange(documents.filter(item => item.id !== document.id))}>
            <X className="h-4 w-4" />
          </Button>
          </div>
          {document.url && <>
            <a href={document.url} target="_blank" rel="noopener noreferrer" className="mt-1 flex min-w-0 items-start gap-1 text-xs text-primary underline">
              <ExternalLink className="h-3 w-3 shrink-0 mt-0.5" /><span className="min-w-0 break-all">{document.url}</span>
            </a>
            <p className="mt-1 text-xs text-muted-foreground">Link saved; contents not imported. For private or Google documents, upload the file or paste its text.</p>
          </>}
          {editingId === document.id && (
            <div className="mt-2 space-y-2">
            {document.url && <>
              <Label htmlFor={`${fieldId}-${document.id}-name`}>Document name</Label>
              <Input id={`${fieldId}-${document.id}-name`} value={document.name} disabled={disabled || reading}
                onChange={event => onDocumentsChange(documents.map(item => item.id === document.id ? { ...item, name: event.target.value } : item))} />
              <Label htmlFor={`${fieldId}-${document.id}-notes`}>Document notes</Label>
            </>}
            <Textarea
              id={`${fieldId}-${document.id}-notes`}
              aria-label={`Contents of ${document.name}`}
              value={document.text}
              disabled={disabled || reading}
              className="mt-2 min-h-40"
              onChange={event => onDocumentsChange(documents.map(item => item.id === document.id ? { ...item, text: event.target.value } : item))}
            />
            </div>
          )}
        </div>
      ))}
      {error && <p role="alert" className="whitespace-pre-line break-words text-sm text-destructive">{error}</p>}
    </div>
  );
};