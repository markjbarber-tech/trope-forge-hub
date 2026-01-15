import { AppHeader } from '@/components/AppHeader';
import { GeneratorTabs } from '@/components/GeneratorTabs';
import { EncounterExportPanel } from '@/components/EncounterExportPanel';
import { EncounterCategorySearch } from '@/components/EncounterCategorySearch';
import { useEncounterGenerator } from '@/hooks/useEncounterGenerator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dices, Trash2, Loader2, MapPin, Sparkles, Building, Swords, AlertTriangle, User, Skull, RefreshCw } from 'lucide-react';
import { GeneratedEncounter } from '@/types/encounter';

interface EncounterGeneratorProps {
  isOnline: boolean;
  onTabChange: (tab: 'adventure' | 'encounter') => void;
}

const categoryConfig = [
  { key: 'location' as const, title: 'Location', icon: MapPin, color: 'text-emerald-500' },
  { key: 'fantasticalNature' as const, title: 'Fantastical Nature', icon: Sparkles, color: 'text-purple-500' },
  { key: 'currentState' as const, title: 'Current State', icon: Building, color: 'text-blue-500' },
  { key: 'situation' as const, title: 'Situation', icon: Swords, color: 'text-orange-500' },
  { key: 'complication' as const, title: 'Complication', icon: AlertTriangle, color: 'text-red-500' },
  { key: 'npc' as const, title: 'NPC', icon: User, color: 'text-cyan-500' },
  { key: 'adversaries' as const, title: 'Adversaries', icon: Skull, color: 'text-rose-500' },
];

export const EncounterGenerator = ({ isOnline, onTabChange }: EncounterGeneratorProps) => {
  const { 
    categoryData,
    generatedEncounter, 
    isLoading, 
    generateEncounter, 
    setEncounterField,
    randomizeField,
    clearEncounter 
  } = useEncounterGenerator();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader isOnline={isOnline} />
      
      <div className="container mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <GeneratorTabs activeTab="encounter" onTabChange={onTabChange} />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <Button
            onClick={generateEncounter}
            disabled={isLoading}
            size="lg"
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Dices className="h-5 w-5" />
            )}
            Generate Encounter
          </Button>
          
          {generatedEncounter && (
            <Button
              onClick={clearEncounter}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <Trash2 className="h-5 w-5" />
              Clear
            </Button>
          )}
        </div>

        {/* Generated Encounter Output */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold text-center mb-6 text-foreground">
            {generatedEncounter ? 'Generated Encounter' : 'Build Your Encounter'}
          </h2>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryConfig.map(({ key, title, icon: Icon, color }) => {
                  const value = generatedEncounter?.[key] || '';
                  const options = categoryData?.[key] || [];
                  
                  return (
                    <div key={key} className="flex flex-col gap-2 p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-5 w-5 flex-shrink-0 ${color}`} />
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {title}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <EncounterCategorySearch
                            options={options}
                            value={value}
                            onSelect={(v) => setEncounterField(key, v)}
                            placeholder={`Search ${title.toLowerCase()}...`}
                            disabled={isLoading || options.length === 0}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => randomizeField(key)}
                            disabled={isLoading || options.length === 0}
                            title={`Randomize ${title}`}
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="min-h-[2.5rem]">
                        {value ? (
                          <p className="text-foreground leading-relaxed text-sm">{value}</p>
                        ) : (
                          <p className="text-muted-foreground/50 text-sm italic">
                            Search or randomize to select
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          {/* Export Panel - only show when at least one field has a value */}
          {generatedEncounter && Object.values(generatedEncounter).some(v => v) && (
            <div className="mt-6">
              <EncounterExportPanel encounter={generatedEncounter} disabled={isLoading} />
            </div>
          )}
        </div>
      </div>

      {/* PWA Status Bar */}
      {!isOnline && (
        <div className="fixed bottom-0 left-0 right-0 bg-destructive/90 text-destructive-foreground px-4 py-2 text-center text-sm backdrop-blur-sm">
          You're offline. Some features may be limited.
        </div>
      )}
    </div>
  );
};
