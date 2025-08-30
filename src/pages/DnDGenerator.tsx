import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { TropeGenerator } from '@/components/TropeGenerator';
import { TropeDisplay } from '@/components/TropeDisplay';
import { TropeSearch } from '@/components/TropeSearch';
import { ExportPanel } from '@/components/ExportPanel';
import { AdvancedOptions } from '@/components/AdvancedOptions';
import { useTropeGenerator } from '@/hooks/useTropeGenerator';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { exportTropesToText } from '@/utils/exportUtils';

interface LoreLink {
  id: string;
  title: string;
  url: string;
}

export const DnDGenerator = () => {
  console.log('DnDGenerator component rendering...');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loadTime, setLoadTime] = useState<string>('');
  const [loreLinks, setLoreLinks] = useState<LoreLink[]>([]);
  const navigate = useNavigate();

  console.log('DnDGenerator: About to call useTropeGenerator hook');

  const {
    allTropes,
    generatedTropes,
    tropeCount,
    isLoading,
    isInitialLoad,
    personalTropes,
    hasPersonalData,
    showGenerationMessage,
    dismissGenerationMessage,
    setTropeCount,
    generateTropes,
    refreshData,
    removeTrope,
    addRandomTrope,
    addCustomTrope,
    addSpecificTrope,
    uploadPersonalData,
    purgePersonalData
  } = useTropeGenerator();

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update load time when data changes
  useEffect(() => {
    if (allTropes.length > 0 && !isLoading) {
      setLoadTime(new Date().toLocaleTimeString());
    }
  }, [allTropes.length, isLoading]);

  const handleExportTemplate = (templateType: 'campaign' | 'oneshot') => {
    if (generatedTropes.length === 0) return;
    navigate('/campaign-template', { 
      state: { 
        tropes: generatedTropes, 
        templateType 
      } 
    });
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onGenerate: generateTropes,
    onExportTropes: () => exportTropesToText(generatedTropes),
    onExportTemplate: () => handleExportTemplate('campaign'),
  });

  console.log('DnDGenerator rendering with:', { 
    allTropesCount: allTropes.length, 
    generatedTropesCount: generatedTropes.length, 
    isLoading, 
    isInitialLoad 
  });

  return (
    <div className="min-h-screen bg-background">
      <AppHeader isOnline={isOnline} />
      
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Controls */}
          <div className="lg:col-span-1 space-y-6">
            <p className="text-muted-foreground italic text-center">Supercharge story brainstorming</p>
            <TropeGenerator
              tropeCount={tropeCount}
              onTropeCountChange={setTropeCount}
              onGenerate={generateTropes}
              onRefreshData={refreshData}
              isLoading={isLoading || isInitialLoad}
              dataLoadTime={loadTime}
              totalTropes={allTropes.length}
              showGenerationMessage={showGenerationMessage}
              onDismissGenerationMessage={dismissGenerationMessage}
            />
            
            <TropeSearch
              allTropes={allTropes}
              generatedTropes={generatedTropes}
              onAddTrope={addSpecificTrope}
            />
            
            <ExportPanel
              tropes={generatedTropes}
              loreLinks={loreLinks}
              disabled={isLoading}
              onExportTemplate={handleExportTemplate}
            />
            
            {/* Show tropes on mobile */}
            <div className="lg:hidden">
              <TropeDisplay 
                tropes={generatedTropes} 
                onRemoveTrope={removeTrope}
                onAddRandomTrope={addRandomTrope}
                onAddCustomTrope={addCustomTrope}
              />
            </div>
            
            <AdvancedOptions
              personalElementCount={personalTropes.length}
              hasPersonalData={hasPersonalData}
              onPersonalUpload={uploadPersonalData}
              onPurgePersonalData={purgePersonalData}
              loreLinks={loreLinks}
              onLinksChange={setLoreLinks}
              isLoading={isLoading}
            />
          </div>

          {/* Main Content - Trope Display (desktop only) */}
          <div className="hidden lg:block lg:col-span-3">
            <TropeDisplay 
              tropes={generatedTropes} 
              onRemoveTrope={removeTrope}
              onAddRandomTrope={addRandomTrope}
              onAddCustomTrope={addCustomTrope}
            />
          </div>
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