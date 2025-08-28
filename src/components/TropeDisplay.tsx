import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Eye, EyeOff, Dice6, X, Plus } from 'lucide-react';
import { Trope } from '@/types/trope';
import { Badge } from '@/components/ui/badge';

interface TropeDisplayProps {
  tropes: Trope[];
  onRemoveTrope?: (tropeId: string) => void;
  onAddRandomTrope?: () => void;
}

export const TropeDisplay = ({ tropes, onRemoveTrope, onAddRandomTrope }: TropeDisplayProps) => {
  const [expandedTropes, setExpandedTropes] = useState<Set<string>>(new Set());
  const [showAllDetails, setShowAllDetails] = useState(false);

  const toggleTrope = (tropeId: string) => {
    const newExpanded = new Set(expandedTropes);
    if (newExpanded.has(tropeId)) {
      newExpanded.delete(tropeId);
    } else {
      newExpanded.add(tropeId);
    }
    setExpandedTropes(newExpanded);
  };

  const toggleAllDetails = () => {
    if (showAllDetails) {
      setExpandedTropes(new Set());
    } else {
      setExpandedTropes(new Set(tropes.map(t => t.id)));
    }
    setShowAllDetails(!showAllDetails);
  };

  if (tropes.length === 0) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-fantasy-purple/20 flex items-center justify-center mb-4">
            <Dice6 className="h-8 w-8 text-fantasy-purple" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Ready to Generate Tropes
          </h3>
          <p className="text-muted-foreground max-w-md">
            Click the "Generate Tropes" button to create random story elements for your D&D campaign. 
            Each generation will give you fresh inspiration for your adventures.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-fantasy-gold">
          Generated Tropes
        </h2>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-fantasy-gold border-fantasy-gold/30">
            {tropes.length} trope{tropes.length !== 1 ? 's' : ''}
          </Badge>
          {onAddRandomTrope && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddRandomTrope}
              className="text-muted-foreground hover:text-fantasy-gold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Random
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAllDetails}
            className="text-muted-foreground hover:text-fantasy-gold"
          >
            {showAllDetails ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide All Details
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Show All Details
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {tropes.map((trope, index) => {
          const isExpanded = expandedTropes.has(trope.id);
          
          return (
            <Card 
              key={trope.id} 
              className="bg-card/90 backdrop-blur-sm border-border/60 hover:border-fantasy-gold/40 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-xs font-mono">
                      {index + 1}
                    </Badge>
                    <CardTitle className="text-fantasy-gold text-lg font-bold">
                      {trope.name}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {onRemoveTrope && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveTrope(trope.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleTrope(trope.id)}
                      className="text-fantasy-gold hover:text-mystical-glow hover:bg-fantasy-purple/10 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Hide
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Show Detail
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="bg-secondary/30 rounded-lg p-4 border border-border/40">
                    <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {trope.detail}
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};