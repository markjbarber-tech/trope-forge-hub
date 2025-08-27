import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Trope } from '@/types/trope';

interface TropeCardProps {
  trope: Trope;
}

export const TropeCard = ({ trope }: TropeCardProps) => {
  const [isDetailVisible, setIsDetailVisible] = useState(false);

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:border-fantasy-gold/30 transition-all duration-300 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-fantasy-gold text-lg font-bold">
            {trope.name}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDetailVisible(!isDetailVisible)}
            className="text-fantasy-gold hover:text-mystical-glow hover:bg-fantasy-purple/10"
          >
            {isDetailVisible ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Hide
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show Detail
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      {isDetailVisible && (
        <CardContent className="pt-0">
          <div className="bg-secondary/20 rounded-lg p-4 border border-border/30">
            <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {trope.detail}
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};