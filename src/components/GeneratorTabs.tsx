import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface GeneratorTabsProps {
  activeTab: 'adventure' | 'encounter';
  onTabChange: (tab: 'adventure' | 'encounter') => void;
}

export const GeneratorTabs = ({ activeTab, onTabChange }: GeneratorTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as 'adventure' | 'encounter')} className="w-full">
      <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
        <TabsTrigger value="adventure" className="text-sm font-medium">
          Adventure Generator
        </TabsTrigger>
        <TabsTrigger value="encounter" className="text-sm font-medium">
          Encounter Generator
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
