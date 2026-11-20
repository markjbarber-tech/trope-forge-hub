import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type GeneratorTab = 'adventure' | 'encounter' | 'library';

interface GeneratorTabsProps {
  activeTab: GeneratorTab;
  onTabChange: (tab: GeneratorTab) => void;
}

export const GeneratorTabs = ({ activeTab, onTabChange }: GeneratorTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as GeneratorTab)} className="w-full">
      <TabsList className="mx-auto grid h-auto w-full max-w-xl grid-cols-3 gap-1 p-1">
        <TabsTrigger
          value="adventure"
          className="min-w-0 overflow-hidden break-words px-2 py-1.5 text-center text-xs font-medium leading-tight whitespace-normal sm:px-3 sm:text-sm sm:whitespace-nowrap"
        >
          Adventure Generator
        </TabsTrigger>
        <TabsTrigger
          value="encounter"
          className="min-w-0 overflow-hidden break-words px-2 py-1.5 text-center text-xs font-medium leading-tight whitespace-normal sm:px-3 sm:text-sm sm:whitespace-nowrap"
        >
          Encounter Generator
        </TabsTrigger>
        <TabsTrigger
          value="library"
          className="min-w-0 overflow-hidden break-words px-2 py-1.5 text-center text-xs font-medium leading-tight whitespace-normal sm:px-3 sm:text-sm sm:whitespace-nowrap"
        >
          My Adventures
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
