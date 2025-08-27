import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { TropeGenerator } from '@/components/TropeGenerator';
import { TropeDisplay } from '@/components/TropeDisplay';
import { ExportPanel } from '@/components/ExportPanel';
import { useTropeGenerator } from '@/hooks/useTropeGenerator';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { exportTropesToText } from '@/utils/exportUtils';

export const DnDGenerator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loadTime, setLoadTime] = useState<string>('');
  const navigate = useNavigate();

  const {
    allTropes,
    generatedTropes,
    tropeCount,
    isLoading,
    isInitialLoad,
    setTropeCount,
    generateTropes,
    refreshData,
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

  const handleExportTemplate = () => {
    if (generatedTropes.length === 0) return;
    navigate('/campaign-template', { state: { tropes: generatedTropes } });
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onGenerate: generateTropes,
    onExportTropes: () => exportTropesToText(generatedTropes),
    onExportTemplate: handleExportTemplate,
  });

  return (
    <div className="min-h-screen bg-background">
      <AppHeader isOnline={isOnline} />
      
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Controls */}
          <div className="lg:col-span-1 space-y-6">
            <TropeGenerator
              tropeCount={tropeCount}
              onTropeCountChange={setTropeCount}
              onGenerate={generateTropes}
              onRefreshData={refreshData}
              isLoading={isLoading || isInitialLoad}
              dataLoadTime={loadTime}
              totalTropes={allTropes.length}
            />
            
            {/* Show tropes first, then export options */}
            <div className="lg:hidden">
              <TropeDisplay tropes={generatedTropes} />
            </div>
            
            <ExportPanel
              tropes={generatedTropes}
              disabled={isLoading}
              onExportTemplate={handleExportTemplate}
            />
          </div>

          {/* Main Content - Trope Display (desktop only) */}
          <div className="hidden lg:block lg:col-span-3">
            <TropeDisplay tropes={generatedTropes} />
          </div>
        </div>
      </div>

      {/* PWA Status Bar */}
      {!isOnline && (
        <div className="fixed bottom-0 left-0 right-0 bg-yellow-600/90 text-white px-4 py-2 text-center text-sm backdrop-blur-sm">
          You're offline. Some features may be limited.
        </div>
      )}
    </div>
  );
};