import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TropeGeneratorProps {
  tropeCount: number;
  onTropeCountChange: (count: number) => void;
  onGenerate: () => void;
  onRefreshData: () => void;
  isLoading?: boolean;
  dataLoadTime?: string;
  totalTropes?: number;
}

export const TropeGenerator = ({ 
  tropeCount, 
  onTropeCountChange, 
  onGenerate,
  onRefreshData,
  isLoading = false,
  dataLoadTime,
  totalTropes
}: TropeGeneratorProps) => {
  return (
    <Card className="bg-card/90 backdrop-blur-sm border-border/60 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Story Generator
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefreshData}
            disabled={isLoading}
            className="text-muted-foreground hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {totalTropes && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary" className="text-xs">
              {totalTropes} tropes loaded
            </Badge>
            {dataLoadTime && (
              <span className="text-xs">• {dataLoadTime}</span>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground/90">
              Number of Tropes:
            </label>
            <span className="text-white font-bold text-xl">
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
              <span key={i + 1} className={tropeCount === i + 1 ? 'text-white font-medium' : ''}>
                {i + 1}
              </span>
            ))}
          </div>
        </div>
        
        <Button 
          variant="mystical" 
          size="lg" 
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full text-sm sm:text-base lg:text-lg py-6 pl-4 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {isLoading ? 'Loading Data...' : 'Generate story elements'}
        </Button>
      </CardContent>
    </Card>
  );
};