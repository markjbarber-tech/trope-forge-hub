import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, X, Eye } from 'lucide-react';
import { Trope } from '@/types/trope';
import { TropeCard } from './TropeCard';

interface PersonalTropesSearchProps {
  personalTropes: Trope[];
  onAddTrope?: (trope: Trope) => void;
}

export const PersonalTropesSearch = ({ personalTropes, onAddTrope }: PersonalTropesSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);

  const filteredTropes = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return personalTropes.filter(trope => 
      trope.name.toLowerCase().includes(lowercaseSearch) ||
      trope.detail.toLowerCase().includes(lowercaseSearch)
    );
  }, [personalTropes, searchTerm]);

  const handleClearSearch = () => {
    setSearchTerm('');
    setShowResults(false);
  };

  const handleToggleResults = () => {
    if (searchTerm.trim()) {
      setShowResults(!showResults);
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Search className="h-5 w-5" />
          Search Personal Tropes
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your personal tropes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50 border-border/50 text-white placeholder:text-muted-foreground"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {searchTerm && filteredTropes.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleResults}
              className="whitespace-nowrap"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showResults ? 'Hide' : 'Show'} Results ({filteredTropes.length})
            </Button>
          )}
        </div>

        {searchTerm && (
          <div className="text-sm text-muted-foreground">
            {filteredTropes.length === 0 
              ? 'No matching tropes found in your personal collection'
              : `Found ${filteredTropes.length} matching trope${filteredTropes.length === 1 ? '' : 's'}`
            }
          </div>
        )}

        {showResults && filteredTropes.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredTropes.map((trope) => (
              <TropeCard 
                key={trope.id} 
                trope={trope} 
                onAddTrope={onAddTrope}
                showAddButton={true}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};