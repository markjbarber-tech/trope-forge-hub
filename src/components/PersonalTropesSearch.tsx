import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Trope } from '@/types/trope';

interface PersonalTropesSearchProps {
  allTropes: Trope[];
  selectedTropes: Trope[];
  onSelect: (trope: Trope) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const PersonalTropesSearch = ({
  allTropes,
  selectedTropes,
  onSelect,
  placeholder = 'Search personal tropes...',
  disabled = false,
}: PersonalTropesSearchProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get available tropes (not already selected)
  const availableTropes = useMemo(() => {
    const selectedIds = new Set(selectedTropes.map(t => t.id));
    return allTropes.filter(t => !selectedIds.has(t.id));
  }, [allTropes, selectedTropes]);

  const filteredTropes = useMemo(() => {
    if (!searchQuery.trim()) return availableTropes;
    const query = searchQuery.toLowerCase();
    return availableTropes.filter(trope => 
      trope.name.toLowerCase().includes(query) ||
      trope.detail.toLowerCase().includes(query)
    );
  }, [availableTropes, searchQuery]);

  const handleSelect = (trope: Trope) => {
    onSelect(trope);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || allTropes.length === 0}
          className="gap-1 h-8 text-xs"
        >
          <Search className="h-3 w-3" />
          Search Tropes
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 bg-popover" align="start">
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-8 h-9"
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="h-72">
          {filteredTropes.length > 0 ? (
            <div className="p-1">
              {filteredTropes.map((trope) => (
                <button
                  key={trope.id}
                  onClick={() => handleSelect(trope)}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="font-medium text-foreground">{trope.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {trope.detail.length > 100 
                      ? `${trope.detail.substring(0, 100)}...` 
                      : trope.detail}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {searchQuery.trim() 
                ? `No tropes found matching "${searchQuery}"` 
                : 'No tropes available'}
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t border-border text-xs text-muted-foreground text-center">
          {filteredTropes.length} of {availableTropes.length} available tropes
        </div>
      </PopoverContent>
    </Popover>
  );
};
