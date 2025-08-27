import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Dice6, Sparkles } from 'lucide-react';

interface GeneratorControlsProps {
  tropeCount: number;
  onTropeCountChange: (count: number) => void;
  onGenerate: () => void;
  isLoading?: boolean;
}

export const GeneratorControls = ({ 
  tropeCount, 
  onTropeCountChange, 
  onGenerate,
  isLoading = false
}: GeneratorControlsProps) => {
  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg">
      <CardHeader>
        <CardTitle className="text-fantasy-gold flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Story Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground/80">
              Number of Tropes:
            </label>
            <span className="text-fantasy-gold font-bold text-lg">
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
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
            <span>6</span>
          </div>
        </div>
        
        <Button 
          variant="mystical" 
          size="lg" 
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full text-lg py-6"
        >
          <Dice6 className="h-6 w-6 mr-2" />
          {isLoading ? 'Generating...' : 'Generate Tropes'}
        </Button>
      </CardContent>
    </Card>
  );
};