import { AppHeader } from '@/components/AppHeader';
import { GeneratorTabs } from '@/components/GeneratorTabs';
import { EncounterCard } from '@/components/EncounterCard';
import { useEncounterGenerator } from '@/hooks/useEncounterGenerator';
import { Button } from '@/components/ui/button';
import { Dices, Trash2, Loader2 } from 'lucide-react';

interface EncounterGeneratorProps {
  isOnline: boolean;
  onTabChange: (tab: 'adventure' | 'encounter') => void;
}

export const EncounterGenerator = ({ isOnline, onTabChange }: EncounterGeneratorProps) => {
  const { generatedEncounter, isLoading, generateEncounter, clearEncounter } = useEncounterGenerator();

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

        {/* Generated Encounter Display */}
        {generatedEncounter ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            <EncounterCard
              title="Location"
              content={generatedEncounter.location}
              icon="location"
            />
            <EncounterCard
              title="Fantastical Nature"
              content={generatedEncounter.fantasticalNature}
              icon="fantastical"
            />
            <EncounterCard
              title="Current State"
              content={generatedEncounter.currentState}
              icon="state"
            />
            <EncounterCard
              title="Situation"
              content={generatedEncounter.situation}
              icon="situation"
            />
            <EncounterCard
              title="Complication"
              content={generatedEncounter.complication}
              icon="complication"
            />
            <EncounterCard
              title="NPC"
              content={generatedEncounter.npc}
              icon="npc"
            />
            <EncounterCard
              title="Adversaries"
              content={generatedEncounter.adversaries}
              icon="adversaries"
            />
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              {isLoading ? 'Loading encounter data...' : 'Click "Generate Encounter" to create a random encounter.'}
            </p>
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
