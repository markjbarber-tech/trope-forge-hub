import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { Trope } from '@/types/trope';

interface TropeCardProps {
  trope: Trope;
  onAddTrope?: (trope: Trope) => void;
  showAddButton?: boolean;
}

export const TropeCard = ({ trope, onAddTrope, showAddButton = false }: TropeCardProps) => {
  const [isDetailVisible, setIsDetailVisible] = useState(false);

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:border-white/30 transition-all duration-300 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg font-bold">
            {trope.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            {showAddButton && onAddTrope && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddTrope(trope)}
                className="text-white hover:text-mystical-glow hover:bg-fantasy-purple/10"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDetailVisible(!isDetailVisible)}
              className="text-white hover:text-mystical-glow hover:bg-fantasy-purple/10"
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