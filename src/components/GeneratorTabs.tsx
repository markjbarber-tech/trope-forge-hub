import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type GeneratorTab = 'adventure' | 'encounter' | 'library';

interface GeneratorTabsProps {
  activeTab: GeneratorTab;
  onTabChange: (tab: GeneratorTab) => void;
}

export const GeneratorTabs = ({ activeTab, onTabChange }: GeneratorTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as GeneratorTab)} className="w-full">
      <TabsList className="grid w-full max-w-xl mx-auto grid-cols-3">
        <TabsTrigger value="adventure" className="text-sm font-medium">Adventure Generator</TabsTrigger>
        <TabsTrigger value="encounter" className="text-sm font-medium">Encounter Generator</TabsTrigger>
        <TabsTrigger value="library" className="text-sm font-medium">My Adventures</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
