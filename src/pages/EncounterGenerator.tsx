import { AppHeader } from '@/components/AppHeader';
import { GeneratorTabs } from '@/components/GeneratorTabs';
import { EncounterCard } from '@/components/EncounterCard';
import { useEncounterGenerator } from '@/hooks/useEncounterGenerator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dices, Trash2, Loader2, MapPin, Sparkles, Building, Swords, AlertTriangle, User, Skull } from 'lucide-react';

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
  const { categoryData, generatedEncounter, isLoading, generateEncounter, clearEncounter } = useEncounterGenerator();

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
        {generatedEncounter ? (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold text-center mb-6 text-foreground">Generated Encounter</h2>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryConfig.map(({ key, title, icon: Icon, color }) => {
                    const value = generatedEncounter[key];
                    if (!value) return null;
                    return (
                      <div key={key} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${color}`} />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                            {title}
                          </p>
                          <p className="text-foreground leading-relaxed">{value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              {isLoading ? 'Loading encounter data...' : 'Click "Generate Encounter" to create a random encounter.'}
            </p>
          </div>
        )}

        {/* Available Inputs by Category */}
        {categoryData && !isLoading && (
          <div className="mt-12 max-w-6xl mx-auto">
            <h2 className="text-xl font-semibold text-center mb-6 text-foreground">Available Inputs by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categoryConfig.map(({ key, title, icon: Icon, color }) => {
                const items = categoryData[key] || [];
                return (
                  <Card key={key} className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm font-medium">
                        <Icon className={`h-4 w-4 ${color}`} />
                        <span className="text-foreground">{title}</span>
                        <span className="text-muted-foreground ml-auto">({items.length})</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                        {items.map((item, index) => (
                          <p key={index} className="text-sm text-muted-foreground leading-snug py-1 border-b border-border/30 last:border-0">
                            {item}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
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
