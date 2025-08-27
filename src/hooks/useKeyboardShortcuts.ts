import { useEffect } from 'react';

interface KeyboardShortcuts {
  onGenerate: () => void;
  onExportTropes: () => void;
  onExportTemplate: () => void;
}

export const useKeyboardShortcuts = ({ onGenerate, onExportTropes, onExportTemplate }: KeyboardShortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return;
      }

      // Generate tropes (Enter or Space)
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onGenerate();
        return;
      }

      // Export shortcuts (Ctrl/Cmd + key)
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'p':
            event.preventDefault();
            onExportTropes();
            break;
          case 't':
            event.preventDefault();
            onExportTemplate();
            break;
          case 'g':
            event.preventDefault();
            onGenerate();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onGenerate, onExportTropes, onExportTemplate]);
};