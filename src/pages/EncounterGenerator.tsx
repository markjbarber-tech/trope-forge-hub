import { AppHeader } from '@/components/AppHeader';
import { GeneratorTabs } from '@/components/GeneratorTabs';
import { EncounterExportPanel } from '@/components/EncounterExportPanel';
import { EncounterCategorySearch } from '@/components/EncounterCategorySearch';
import { EncounterPersonalTropes } from '@/components/EncounterPersonalTropes';
import { useEncounterGenerator } from '@/hooks/useEncounterGenerator';
import { useCustomEncounterInputs } from '@/hooks/useCustomEncounterInputs';
import { useEncounterPersonalTropes } from '@/hooks/useEncounterPersonalTropes';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dices, Trash2, Loader2, MapPin, Sparkles, Building, Swords, AlertTriangle, User, Skull, RefreshCw, Download, Star } from 'lucide-react';
import { GeneratedEncounter, EncounterCategory } from '@/types/encounter';
import { toast } from 'sonner';

interface EncounterGeneratorProps {
  isOnline: boolean;
  onTabChange: (tab: 'adventure' | 'encounter') => void;
}

const categoryConfig: { key: EncounterCategory; title: string; icon: React.ElementType; color: string }[] = [
  { key: 'location', title: 'Location', icon: MapPin, color: 'text-emerald-500' },
  { key: 'fantasticalNature', title: 'Fantastical Nature', icon: Sparkles, color: 'text-purple-500' },
  { key: 'currentState', title: 'Current State', icon: Building, color: 'text-blue-500' },
  { key: 'situation', title: 'Situation', icon: Swords, color: 'text-orange-500' },
  { key: 'complication', title: 'Complication', icon: AlertTriangle, color: 'text-red-500' },
  { key: 'npc', title: 'NPC', icon: User, color: 'text-cyan-500' },
  { key: 'adversaries', title: 'Adversaries', icon: Skull, color: 'text-rose-500' },
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

  const {
    addCustomInput,
    getCustomInputsForCategory,
    exportCustomInputs,
    totalCount: customInputCount,
  } = useCustomEncounterInputs();

  const {
    allPersonalTropes,
    selectedTropes: personalTropes,
    tropeCount: personalTropeCount,
    isLoading: isLoadingPersonalTropes,
    hasPersonalTropes,
    setTropeCount: setPersonalTropeCount,
    regenerateTropes: regeneratePersonalTropes,
    addTrope: addPersonalTrope,
    removeTrope: removePersonalTrope,
    clearTropes: clearPersonalTropes,
    randomizeTrope: randomizePersonalTrope,
  } = useEncounterPersonalTropes();

  const handleExportCustomInputs = () => {
    if (customInputCount === 0) {
      toast.error('No custom inputs to export');
      return;
    }
    exportCustomInputs();
    toast.success(`Exported ${customInputCount} custom inputs`);
  };

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

          {customInputCount > 0 && (
            <Button
              onClick={handleExportCustomInputs}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <Download className="h-5 w-5" />
              <Star className="h-4 w-4 text-amber-500" />
              Export Custom ({customInputCount})
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
                  const customOptions = getCustomInputsForCategory(key);
                  
                  return (
                    <div key={key} className="flex flex-col gap-2 p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-5 w-5 flex-shrink-0 ${color}`} />
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {title}
                          </p>
                          {customOptions.length > 0 && (
                            <span className="flex items-center gap-0.5 text-xs text-amber-500">
                              <Star className="h-3 w-3" />
                              {customOptions.length}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <EncounterCategorySearch
                            options={options}
                            customOptions={customOptions}
                            value={value}
                            onSelect={(v) => setEncounterField(key, v)}
                            onAddCustom={(v) => addCustomInput(key, v)}
                            placeholder={`Search ${title.toLowerCase()}...`}
                            disabled={isLoading || options.length === 0}
                            categoryName={title.toLowerCase()}
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

          {/* Personal Tropes Section */}
          <div className="mt-6">
            <EncounterPersonalTropes
              allTropes={allPersonalTropes}
              selectedTropes={personalTropes}
              tropeCount={personalTropeCount}
              isLoading={isLoadingPersonalTropes}
              hasPersonalTropes={hasPersonalTropes}
              onCountChange={setPersonalTropeCount}
              onRegenerate={regeneratePersonalTropes}
              onAddTrope={addPersonalTrope}
              onRemoveTrope={removePersonalTrope}
              onRandomizeTrope={randomizePersonalTrope}
              onClearTropes={clearPersonalTropes}
            />
          </div>
          
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
