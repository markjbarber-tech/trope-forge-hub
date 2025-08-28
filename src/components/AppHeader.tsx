import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dice6, Download, Wifi, WifiOff } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { useState, useEffect } from 'react';

interface AppHeaderProps {
  isOnline?: boolean;
}

export const AppHeader = ({ isOnline = true }: AppHeaderProps) => {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-card/95 backdrop-blur-md border-b border-border/50 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center p-1">
                <img 
                  src="/dice-icon.png" 
                  alt="D20 Dice" 
                  className="w-full h-full object-contain rounded"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  D&D Story Generator
                </h1>
                <p className="text-xs text-muted-foreground">
                  Desktop PWA • Fantasy Campaign Tool
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 text-sm text-muted-foreground">
              <time>{currentTime.toLocaleTimeString()}</time>
              <div className="flex items-center gap-1">
                {isOnline ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span>Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-red-500" />
                    <span>Offline</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isInstalled && (
                <Badge variant="secondary" className="text-xs">
                  PWA Installed
                </Badge>
              )}
              
              {isInstallable && !isInstalled && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={installApp}
                  className="text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Install App
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};