import { useEffect, useState } from 'react';
import { ContextMemory, emptyContextMemory, loadContextMemory, saveContextMemory } from '@/utils/contextMemory';
import { CampaignDocument } from '@/utils/campaignContext';

export function useContextMemory(kind: 'history' | 'characters') {
  const key = `story-copilot-context-${kind}-v1`;
  const [initial] = useState(() => {
    try {
      return { memory: loadContextMemory(localStorage, key), error: '' };
    } catch {
      return { memory: emptyContextMemory(), error: 'Saved notes could not be restored on this device.' };
    }
  });
  const [memory, setMemory] = useState<ContextMemory>(initial.memory);
  const [saveError, setSaveError] = useState(initial.error);
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    if (!changed) return;
    try {
      saveContextMemory(localStorage, key, memory);
      setSaveError('');
    } catch {
      setSaveError('These notes could not be saved on this device. Keep a copy before closing.');
    }
  }, [key, memory, changed]);

  const setText = (text: string) => {
    setChanged(true);
    setMemory(previous => ({ ...previous, text }));
  };
  const setDocuments = (documents: CampaignDocument[]) => {
    setChanged(true);
    setMemory(previous => ({ ...previous, documents }));
  };
  return { text: memory.text, documents: memory.documents, setText, setDocuments, saveError };
}