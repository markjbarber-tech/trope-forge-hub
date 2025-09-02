import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dice6 } from 'lucide-react';
import { Trope } from '@/types/trope';
import { Badge } from '@/components/ui/badge';
interface TropeDisplayProps {
  tropes: Trope[];
  onRemoveTrope?: (tropeId: string) => void;
  onAddRandomTrope?: () => void;
  onAddRandomPersonalTrope?: () => void;
  onAddCustomTrope?: (name: string, detail: string) => void;
  hasPersonalData?: boolean;
}
export const TropeDisplay = ({
  tropes,
  onRemoveTrope,
  onAddRandomTrope,
  onAddRandomPersonalTrope,
  onAddCustomTrope,
  hasPersonalData
}: TropeDisplayProps) => {
  const [expandedTropes, setExpandedTropes] = useState<Set<string>>(new Set());
  const [showAllDetails, setShowAllDetails] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDetail, setCustomDetail] = useState('');
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
  const handleCustomTropeSubmit = () => {
    if (customName.trim() && customDetail.trim() && onAddCustomTrope) {
      onAddCustomTrope(customName.trim(), customDetail.trim());
      setCustomName('');
      setCustomDetail('');
      setShowCustomForm(false);
    }
  };
  const cancelCustomTrope = () => {
    setCustomName('');
    setCustomDetail('');
    setShowCustomForm(false);
  };
  if (tropes.length === 0) {
    return <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-fantasy-purple/20 flex items-center justify-center mb-4">
            <Dice6 className="h-8 w-8 text-fantasy-purple" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Ready to Generate Story Elements
          </h3>
          <p className="text-muted-foreground max-w-md">
            Click the "Generate Story Elements" button to create random story elements for your D&D campaign. 
            Each generation will give you fresh inspiration for your adventures.
          </p>
        </CardContent>
      </Card>;
  }
  return <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Story elements</h2>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-white border-white/30">
            {tropes.length} element{tropes.length !== 1 ? 's' : ''}
          </Badge>
          <Button variant="ghost" size="sm" onClick={toggleAllDetails} className="text-muted-foreground hover:text-white text-center justify-center">
            {showAllDetails ? 'Hide All Details' : 'Show All Details'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {tropes.map((trope, index) => {
        const isExpanded = expandedTropes.has(trope.id);
        return <Card key={trope.id} className="bg-card/90 backdrop-blur-sm border-border/60 hover:border-white/40 transition-all duration-300 shadow-lg hover:shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-xs font-mono">
                      {index + 1}
                    </Badge>
                    <CardTitle className="text-white text-lg font-bold">
                      {trope.name}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {onRemoveTrope && <Button variant="ghost" size="sm" onClick={() => onRemoveTrope(trope.id)} className="text-white hover:text-white hover:bg-white/10 transition-colors text-center justify-center">
                        ×
                      </Button>}
                    <Button variant="ghost" size="sm" onClick={() => toggleTrope(trope.id)} className="text-white hover:text-mystical-glow hover:bg-fantasy-purple/10 transition-colors text-center justify-center">
                      {isExpanded ? 'Hide' : 'Show Detail'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {isExpanded && <CardContent className="pt-0">
                  <div className="bg-secondary/30 rounded-lg p-4 border border-border/40">
                    <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {trope.detail}
                    </p>
                  </div>
                </CardContent>}
            </Card>;
      })}
      </div>

      {/* Custom Trope Form */}
      {showCustomForm && onAddCustomTrope && <Card className="bg-card/90 backdrop-blur-sm border-border/60 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">Add Custom Story Element</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/90">
                Story Element Name
              </label>
              <Input value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Enter story element name..." className="bg-background/50 border-border/60 text-white placeholder:text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/90">
                Story Element Details
              </label>
              <Textarea value={customDetail} onChange={e => setCustomDetail(e.target.value)} placeholder="Enter detailed description of the story element..." rows={4} className="bg-background/50 border-border/60 text-white placeholder:text-muted-foreground resize-none" />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleCustomTropeSubmit} disabled={!customName.trim() || !customDetail.trim()} variant="mystical" size="sm" className="text-center justify-center">
                Confirm Custom Story Element
              </Button>
              <Button onClick={cancelCustomTrope} variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>}

      {/* Action Buttons */}
      <div className="flex justify-center gap-3 pt-4">
        {onAddCustomTrope && <Button variant="ghost" size="sm" onClick={() => setShowCustomForm(true)} className="text-muted-foreground hover:text-white text-center justify-center">
            Add Custom Story Element
          </Button>}
        {onAddRandomTrope && <Button variant="ghost" size="sm" onClick={onAddRandomTrope} className="text-muted-foreground hover:text-white text-center justify-center">
            Add Default Story Element
          </Button>}
        {hasPersonalData && onAddRandomPersonalTrope && <Button variant="ghost" size="sm" onClick={onAddRandomPersonalTrope} className="text-muted-foreground hover:text-white text-center justify-center">
            Add Personal Story Element
          </Button>}
      </div>
    </div>;
};