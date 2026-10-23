import { Trope } from '@/types/trope';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { PersonalTropesSearch } from '@/components/PersonalTropesSearch';
import { Dices, X, RefreshCw, User, Loader2, Upload } from 'lucide-react';
import { useRef } from 'react';
import { PersonalSheetImport } from './PersonalSheetImport';
import { toast } from 'sonner';

interface EncounterPersonalTropesProps {
  allTropes: Trope[];
  selectedTropes: Trope[];
  tropeCount: number;
  isLoading: boolean;
  hasPersonalTropes: boolean;
  onCountChange: (count: number) => void;
  onRegenerate: () => void;
  onAddTrope: (trope: Trope) => void;
  onRemoveTrope: (tropeId: string) => void;
  onRandomizeTrope: (tropeId: string) => void;
  onClearTropes: () => void;
  onPersonalUpload: (csv: string) => void;
}

export const EncounterPersonalTropes = ({
  allTropes,
  selectedTropes,
  tropeCount,
  isLoading,
  hasPersonalTropes,
  onCountChange,
  onRegenerate,
  onAddTrope,
  onRemoveTrope,
  onRandomizeTrope,
  onClearTropes,
  onPersonalUpload,
}: EncounterPersonalTropesProps) => {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-cyan-500" />
            Personal Story Elements
          </CardTitle>
          <div className="flex items-center gap-2">
            <PersonalTropesSearch
              allTropes={allTropes}
              selectedTropes={selectedTropes}
              onSelect={onAddTrope}
              disabled={isLoading}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerate}
              disabled={isLoading || tropeCount === 0}
              className="gap-1 h-8"
            >
              <Dices className="h-4 w-4" />
              Generate
            </Button>
            {selectedTropes.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearTropes}
                className="gap-1 text-muted-foreground h-8"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Slider for trope count */}
        <div className="flex items-center gap-4 mt-4">
          <span className="text-sm text-muted-foreground min-w-[80px]">
            Count: {tropeCount}
          </span>
          <Slider
            value={[tropeCount]}
            onValueChange={([value]) => onCountChange(value)}
            min={0}
            max={5}
            step={1}
            className="flex-1"
            disabled={isLoading}
          />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3 mb-4">
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={async event => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (!file) return;
            try {
              onPersonalUpload(await file.text());
              toast.success('Personal story elements uploaded');
            } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not read the CSV file.'); }
          }} />
          <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={isLoading} className="gap-2">
            <Upload className="h-4 w-4" /> Upload CSV
          </Button>
          <PersonalSheetImport onImport={onPersonalUpload} disabled={isLoading} />
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !hasPersonalTropes ? (
          <p className="text-sm text-muted-foreground">No personal story elements available</p>
        ) : selectedTropes.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">
              {tropeCount === 0 
                ? 'Slide to include personal elements' 
                : 'Click "Generate" or search to add personal elements'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedTropes.map((trope) => (
              <div
                key={trope.id}
                className="p-3 rounded-lg bg-muted/30 border border-border/30"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-foreground">{trope.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {trope.detail}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => onRandomizeTrope(trope.id)}
                      title="Randomize this trope"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => onRemoveTrope(trope.id)}
                      title="Remove this trope"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
