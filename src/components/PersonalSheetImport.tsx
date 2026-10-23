import { useId, useState } from 'react';
import { Link, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { parseTropeCSV } from '@/utils/csvDataSource';
import { parseGoogleSheetUrl } from '../../supabase/functions/_shared/googleSheetUrl';
import { FunctionsHttpError } from '@supabase/supabase-js';

export function PersonalSheetImport({ onImport, disabled = false }: {
  onImport: (csv: string) => void; disabled?: boolean;
}) {
  const id = useId();
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const importSheet = async () => {
    setError(''); setSuccess('');
    try {
      parseGoogleSheetUrl(url);
      setBusy(true);
      const { data, error: requestError } = await supabase.functions.invoke('import-public-sheet', { body: { url: url.trim() } });
      if (requestError) {
        const details = requestError instanceof FunctionsHttpError ? await requestError.context.text() : requestError.message;
        throw new Error(`Could not import the sheet: ${details}`);
      }
      if (data?.error) throw new Error(data.error);
      if (typeof data?.csv !== 'string') throw new Error('No spreadsheet data was returned.');
      const tropes = parseTropeCSV(data.csv);
      onImport(data.csv);
      setSuccess(`Imported ${tropes.length} personal story elements.`);
      setUrl('');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not import this sheet.'); }
    finally { setBusy(false); }
  };
  return <div className="space-y-2">
    <Label htmlFor={id}>Public Google Sheet URL</Label>
    <div className="flex flex-col sm:flex-row gap-2">
      <Input id={id} type="url" value={url} onChange={event => { setUrl(event.target.value); setError(''); setSuccess(''); }}
        placeholder="https://docs.google.com/spreadsheets/d/…" disabled={disabled || busy} className="min-w-0 flex-1" />
      <Button variant="outline" disabled={disabled || busy || !url.trim()} onClick={importSheet} className="gap-2 shrink-0">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link className="h-4 w-4" />} Import Sheet
      </Button>
    </div>
    {error && <p role="alert" className="text-sm text-destructive break-words">{error}</p>}
    {success && <p role="status" className="text-sm text-foreground">{success}</p>}
  </div>;
}