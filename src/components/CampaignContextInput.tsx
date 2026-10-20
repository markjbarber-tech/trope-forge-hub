import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Loader2, Upload, X } from 'lucide-react';
import { CampaignDocument } from '@/utils/campaignContext';
import { readCampaignDocument } from '@/utils/readCampaignDocument';

interface Props {
  history: string;
  documents: CampaignDocument[];
  onHistoryChange: (value: string) => void;
  onDocumentsChange: (documents: CampaignDocument[]) => void;
  onReadingChange: (reading: boolean) => void;
  disabled?: boolean;
}

export const CampaignContextInput = ({ history, documents, onHistoryChange, onDocumentsChange, onReadingChange, disabled }: Props) => {
  const input = useRef<HTMLInputElement>(null);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState('');

  const upload = async (files: File[]) => {
    setReading(true);
    onReadingChange(true);
    setError('');
    const added: CampaignDocument[] = [];
    const errors: string[] = [];
    try {
      for (const file of files) {
        try {
          added.push({ id: crypto.randomUUID(), name: file.name, text: await readCampaignDocument(file) });
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
      <Label htmlFor="campaign-history">Campaign / encounter so far (optional)</Label>
      <Textarea
        id="campaign-history"
        placeholder="What has happened so far? Include characters, decisions, discoveries and the current situation…"
        value={history}
        onChange={event => onHistoryChange(event.target.value)}
        disabled={disabled}
        className="min-h-32"
      />
      <input
        ref={input}
        type="file"
        accept=".txt,.md,.csv,.json,.pdf,.docx"
        multiple
        className="hidden"
        aria-label="Upload campaign history documents"
        onChange={event => { void upload(Array.from(event.target.files ?? [])); }}
      />
      <Button variant="outline" className="w-full gap-2" disabled={disabled || reading} onClick={() => input.current?.click()}>
        {reading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {reading ? 'Reading documents…' : 'Upload campaign notes'}
      </Button>
      <p className="text-xs text-muted-foreground">TXT, MD, CSV, JSON, text-based PDF or DOCX</p>
      {documents.map(document => (
        <div key={document.id} className="flex min-w-0 items-center gap-2 border-b border-border/40 py-2">
          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 break-words text-sm">{document.name}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" title={`Remove ${document.name}`} aria-label={`Remove ${document.name}`} disabled={disabled || reading} onClick={() => onDocumentsChange(documents.filter(item => item.id !== document.id))}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      {error && <p role="alert" className="whitespace-pre-line break-words text-sm text-destructive">{error}</p>}
    </div>
  );
};