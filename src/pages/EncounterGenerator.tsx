import { AppHeader } from '@/components/AppHeader';
import { GeneratorTabs } from '@/components/GeneratorTabs';

interface EncounterGeneratorProps {
  isOnline: boolean;
  onTabChange: (tab: 'adventure' | 'encounter') => void;
}

export const EncounterGenerator = ({ isOnline, onTabChange }: EncounterGeneratorProps) => {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader isOnline={isOnline} />
      
      <div className="container mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <GeneratorTabs activeTab="encounter" onTabChange={onTabChange} />
        </div>

        {/* Placeholder content */}
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Encounter Generator
          </h2>
          <p className="text-muted-foreground">
            Coming soon...
          </p>
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
