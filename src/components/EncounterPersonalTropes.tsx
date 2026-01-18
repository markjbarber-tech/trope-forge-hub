import { useState, useMemo, useRef, useEffect } from 'react';
import { Trope } from '@/types/trope';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Dices, X, RefreshCw, Search, User, Loader2 } from 'lucide-react';

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
}: EncounterPersonalTropesProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter tropes based on search query
  const filteredTropes = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    const selectedIds = new Set(selectedTropes.map(t => t.id));
    
    return allTropes
      .filter(trope => 
        !selectedIds.has(trope.id) && // Exclude already selected
        (trope.name.toLowerCase().includes(query) || 
         trope.detail.toLowerCase().includes(query))
      )
      .slice(0, 5);
  }, [searchQuery, allTropes, selectedTropes]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    setIsSearchOpen(value.trim().length > 0);
  };

  const handleSelectTrope = (trope: Trope) => {
    onAddTrope(trope);
    setSearchQuery('');
    setIsSearchOpen(false);
    inputRef.current?.blur();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearchOpen(false);
    inputRef.current?.focus();
  };

  if (!hasPersonalTropes && !isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="py-6 text-center text-muted-foreground">
          <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No personal tropes available</p>
          <p className="text-xs mt-1">Upload a Personal-data-template.csv file to add personal elements</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-cyan-500" />
            Personal Story Elements
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerate}
              disabled={isLoading || tropeCount === 0}
              className="gap-1"
            >
              <Dices className="h-4 w-4" />
              Generate
            </Button>
            {selectedTropes.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearTropes}
                className="gap-1 text-muted-foreground"
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

        {/* Search input */}
        <div className="relative mt-4" ref={searchRef}>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              <Search className="h-4 w-4" />
            </div>
            <Input
              ref={inputRef}
              value={searchQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Search personal tropes to add..."
              className="pl-10 pr-10 text-sm"
              onFocus={() => searchQuery.trim() && setIsSearchOpen(true)}
              disabled={isLoading || allTropes.length === 0}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {isSearchOpen && filteredTropes.length > 0 && (
            <Card className="absolute top-full left-0 right-0 mt-1 bg-card border-border shadow-xl z-50 max-h-64 overflow-hidden">
              <CardContent className="p-2">
                <div className="space-y-1">
                  {filteredTropes.map((trope) => (
                    <Button
                      key={trope.id}
                      variant="ghost"
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => handleSelectTrope(trope)}
                    >
                      <div className="flex flex-col items-start gap-1">
                        <div className="font-medium text-sm">{trope.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {trope.detail.length > 80 
                            ? `${trope.detail.substring(0, 80)}...` 
                            : trope.detail}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Results */}
          {isSearchOpen && searchQuery.trim() && filteredTropes.length === 0 && (
            <Card className="absolute top-full left-0 right-0 mt-1 bg-card border-border shadow-xl z-50">
              <CardContent className="p-4 text-center">
                <div className="text-sm text-muted-foreground">
                  No personal tropes found matching "{searchQuery}"
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
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
