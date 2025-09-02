import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { RefreshCw, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TropeGeneratorProps {
  tropeCount: number;
  onTropeCountChange: (count: number) => void;
  onGenerate: () => void;
  onRefreshData: () => void;
  isLoading?: boolean;
  dataLoadTime?: string;
  totalTropes?: number;
  showGenerationMessage?: boolean;
  onDismissGenerationMessage?: () => void;
}

export const TropeGenerator = ({ 
  tropeCount, 
  onTropeCountChange, 
  onGenerate,
  onRefreshData,
  isLoading = false,
  dataLoadTime,
  totalTropes,
  showGenerationMessage = false,
  onDismissGenerationMessage
}: TropeGeneratorProps) => {
  return (
    <Card className="bg-card/90 backdrop-blur-sm border-border/60 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground">
            Start with some story elements
          </CardTitle>
        </div>
        
        <p className="text-sm text-muted-foreground bg-muted/10 p-3 rounded-lg border border-border/20">
          Story elements are the key concepts of your story. Create a random combination of common fantasy story concepts to get the brainstorming rolling!
        </p>
        
        <Button 
          variant="mystical" 
          size="lg" 
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full text-sm py-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center justify-center"
        >
          {isLoading ? 'Loading Data...' : 'Generate Story Elements'}
        </Button>
        
        {showGenerationMessage && (
          <div className="text-sm text-green-400 text-center p-3 pr-8 bg-green-500/20 rounded-lg border border-green-500/40 relative">
            Story elements generated! Scroll down to see your elements.
            {onDismissGenerationMessage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismissGenerationMessage}
                className="absolute top-2 right-2 h-5 w-5 p-0 bg-green-500/30 hover:bg-green-500/50 text-green-200 hover:text-white border border-green-500/60"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground/90">
              How many story elements do you want?
            </label>
            <span className="text-foreground font-bold text-xl">
              {tropeCount}
            </span>
          </div>
          
          <Slider
            value={[tropeCount]}
            onValueChange={(value) => onTropeCountChange(value[0])}
            min={1}
            max={6}
            step={1}
            className="w-full"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i + 1} className={tropeCount === i + 1 ? 'text-foreground font-medium' : ''}>
                {i + 1}
              </span>
            ))}
          </div>
        </div>
        
        {totalTropes && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-xs">
                {totalTropes} elements loaded
              </span>
              {dataLoadTime && (
                <span className="text-xs">• {dataLoadTime}</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefreshData}
              disabled={isLoading}
              className="text-muted-foreground hover:text-foreground text-center justify-center"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};