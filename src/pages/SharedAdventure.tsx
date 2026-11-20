import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2 } from 'lucide-react';
import { fetchAdventure, kindLabel } from '@/utils/savedAdventures';

type Adventure = Awaited<ReturnType<typeof fetchAdventure>>;

const SharedAdventure = () => {
  const { id = '' } = useParams();
  const [data, setData] = useState<Adventure | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { fetchAdventure(id).then(setData).catch(e => setError(e instanceof Error ? e.message : 'Not found')); }, [id]);

  return (
    <div className="min-h-screen bg-background flex items-start justify-center p-6">
      <Card className="max-w-2xl w-full mt-12">
        <CardHeader><CardTitle>{data ? data.title : 'Saved adventure'}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-destructive">This adventure couldn't be found. It may have been deleted.</p>}
          {!data && !error && <Loader2 className="h-6 w-6 animate-spin" />}
          {data && (<>
            <p className="text-sm text-muted-foreground">{kindLabel(data.kind)} · {new Date(data.createdAt).toLocaleString()}</p>
            {data.elements.length > 0 && (
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {data.elements.map((e, i) => <li key={i}><span className="font-medium">{e.name}</span>{e.detail ? ` — ${e.detail}` : ''}</li>)}
              </ul>
            )}
            <Button asChild><a href={data.downloadUrl}><Download className="h-4 w-4 mr-1" />Download PDF</a></Button>
          </>)}
          <Link to="/" className="block text-sm underline text-muted-foreground">Open the generator</Link>
        </CardContent>
      </Card>
    </div>
  );
};
export default SharedAdventure;
