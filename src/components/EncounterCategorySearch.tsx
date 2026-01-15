import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X, Check, Plus, Star } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';

interface EncounterCategorySearchProps {
  options: string[];
  customOptions?: string[];
  value: string;
  onSelect: (value: string) => void;
  onAddCustom?: (value: string) => boolean;
  placeholder?: string;
  disabled?: boolean;
  categoryName?: string;
}

export const EncounterCategorySearch = ({
  options,
  customOptions = [],
  value,
  onSelect,
  onAddCustom,
  placeholder = 'Search...',
  disabled = false,
  categoryName = 'input',
}: EncounterCategorySearchProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Combine options with custom options, marking custom ones
  const allOptions = useMemo(() => {
    const customSet = new Set(customOptions.map(o => o.toLowerCase()));
    const standardOptions = options.map(o => ({ value: o, isCustom: false }));
    const customOpts = customOptions.map(o => ({ value: o, isCustom: true }));
    
    // Filter out duplicates from standard that exist in custom
    const filteredStandard = standardOptions.filter(
      o => !customSet.has(o.value.toLowerCase())
    );
    
    return [...customOpts, ...filteredStandard];
  }, [options, customOptions]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return allOptions;
    const query = searchQuery.toLowerCase();
    return allOptions.filter(option => 
      option.value.toLowerCase().includes(query)
    );
  }, [allOptions, searchQuery]);

  const handleSelect = (selectedValue: string) => {
    onSelect(selectedValue);
    setOpen(false);
    setSearchQuery('');
  };

  const handleAddCustom = () => {
    if (!searchQuery.trim()) return;
    
    if (onAddCustom) {
      const success = onAddCustom(searchQuery.trim());
      if (success) {
        toast.success(`Added custom ${categoryName}: "${searchQuery.trim()}"`);
        onSelect(searchQuery.trim());
        setSearchQuery('');
        setOpen(false);
      } else {
        toast.error('This input already exists');
      }
    }
  };

  const exactMatchExists = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return allOptions.some(o => o.value.toLowerCase() === query);
  }, [allOptions, searchQuery]);

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
      <PopoverContent className="w-80 p-0 bg-popover" align="start">
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-8 h-9"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim() && !exactMatchExists && onAddCustom) {
                  handleAddCustom();
                }
              }}
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
          {/* Add custom button */}
          {searchQuery.trim() && !exactMatchExists && onAddCustom && (
            <Button
              variant="secondary"
              size="sm"
              className="w-full mt-2 gap-2"
              onClick={handleAddCustom}
            >
              <Plus className="h-3 w-3" />
              Add custom: "{searchQuery.trim()}"
            </Button>
          )}
        </div>
        <ScrollArea className="h-64">
          {filteredOptions.length > 0 ? (
            <div className="p-1">
              {filteredOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(option.value)}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors flex items-start gap-2"
                >
                  {option.isCustom && (
                    <Star className="h-3 w-3 text-amber-500 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1 break-words">{option.value}</div>
                  {value === option.value && (
                    <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {searchQuery.trim() ? 'No results - add as custom?' : 'No options available'}
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t border-border text-xs text-muted-foreground text-center flex justify-between">
          <span>{filteredOptions.length} of {allOptions.length} options</span>
          {customOptions.length > 0 && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 text-amber-500" />
              {customOptions.length} custom
            </span>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
