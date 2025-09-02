
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TabConfig {
  value: string;
  label: string;
  content: React.ReactNode;
}

interface ProcedureTabsLayoutProps {
  defaultValue: string;
  tabs: TabConfig[];
  activeTab?: string;
  onTabChange?: (value: string) => void;
}

export function ProcedureTabsLayout({ defaultValue, tabs, activeTab, onTabChange }: ProcedureTabsLayoutProps) {
  const getGridCols = (tabCount: number) => {
    switch (tabCount) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      case 5: return 'grid-cols-5';
      default: return 'grid-cols-6';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs 
        defaultValue={defaultValue} 
        value={activeTab || defaultValue}
        onValueChange={onTabChange}
        className="w-full"
      >
        <TabsList className={`grid w-full ${getGridCols(tabs.length)}`}>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-sm">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-6">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
