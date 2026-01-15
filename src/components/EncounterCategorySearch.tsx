import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X, Check } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface EncounterCategorySearchProps {
  options: string[];
  value: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const EncounterCategorySearch = ({
  options,
  value,
  onSelect,
  placeholder = 'Search...',
  disabled = false,
}: EncounterCategorySearchProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter(option => 
      option.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  const handleSelect = (selectedValue: string) => {
    onSelect(selectedValue);
    setOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="gap-1 h-7 text-xs"
        >
          <Search className="h-3 w-3" />
          Search
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9"
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
        <ScrollArea className="h-64">
          {filteredOptions.length > 0 ? (
            <div className="p-1">
              {filteredOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(option)}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors flex items-start gap-2"
                >
                  <div className="flex-1 break-words">{option}</div>
                  {value === option && (
                    <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results found
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t border-border text-xs text-muted-foreground text-center">
          {filteredOptions.length} of {options.length} options
        </div>
      </PopoverContent>
    </Popover>
  );
};
