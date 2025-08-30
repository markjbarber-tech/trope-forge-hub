import { useState, useMemo, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { Trope } from '@/types/trope';
import { Card, CardContent } from '@/components/ui/card';

interface TropeSearchProps {
  allTropes: Trope[];
  generatedTropes: Trope[];
  onAddTrope: (trope: Trope) => void;
}

export const TropeSearch = ({ allTropes, generatedTropes, onAddTrope }: TropeSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter tropes based on search query
  const filteredTropes = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    const usedTropeIds = new Set(generatedTropes.map(t => t.id));
    
    return allTropes
      .filter(trope => 
        !usedTropeIds.has(trope.id) && // Exclude already generated tropes
        trope.source !== 'personal' && // Only search default tropes
        (trope.name.toLowerCase().includes(query) || 
         trope.detail.toLowerCase().includes(query))
      )
      .slice(0, 5); // Limit to 5 results
  }, [searchQuery, allTropes, generatedTropes]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    setIsOpen(value.trim().length > 0);
  };

  const handleSelectTrope = (trope: Trope) => {
    onAddTrope(trope);
    setSearchQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
          <Search className="h-4 w-4" />
        </div>
        <Input
          ref={inputRef}
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Search story elements to add..."
          className="pl-10 pr-10"
          onFocus={() => searchQuery.trim() && setIsOpen(true)}
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-muted-foreground hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && filteredTropes.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 bg-card backdrop-blur-sm border-border/60 shadow-xl z-[60] max-h-64 overflow-hidden">
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

      {/* No Results Message */}
      {isOpen && searchQuery.trim() && filteredTropes.length === 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 bg-card backdrop-blur-sm border-border/60 shadow-xl z-[60]">
          <CardContent className="p-4 text-center">
            <div className="text-sm text-muted-foreground">
              No story elements found matching "{searchQuery}"
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};