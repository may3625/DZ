
import { useState, useEffect } from 'react';
import { getTabsConfig } from './procedures/config/tabsConfig';
import { useOCRHandler } from './procedures/hooks/useOCRHandler';
import { ProcedureActionHandlers } from './procedures/handlers/ProcedureActionHandlers';
import { ProcedureTabsLayout } from './procedures/layout/ProcedureTabsLayout';

interface ProceduresTabsProps {
  section: string;
  onAddProcedure?: () => void;
  onOpenApprovalQueue?: () => void;
  onOCRDataExtracted?: (data: { documentType: 'legal' | 'procedure', formData: Record<string, any> }) => void;
}

export function ProceduresTabs({ section, onAddProcedure, onOpenApprovalQueue, onOCRDataExtracted }: ProceduresTabsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>('');
  const { ocrExtractedText, handleOCRTextExtracted } = useOCRHandler({ onAddProcedure });

  // Écouter les événements de changement d'onglet
  useEffect(() => {
    const handleTabSwitch = (event: CustomEvent) => {
      const { section: targetSection, tab } = event.detail;
      console.log('🔄 [ProceduresTabs] Événement de changement d\'onglet reçu:', event.detail);
      if (targetSection === section) {
        console.log(`✅ [ProceduresTabs] Changement vers l'onglet: ${tab} dans la section: ${section}`);
        setActiveTab(tab);
      }
    };

    window.addEventListener('switch-to-tab', handleTabSwitch as EventListener);
    return () => {
      window.removeEventListener('switch-to-tab', handleTabSwitch as EventListener);
    };
  }, [section]);

  console.log('🎯 [ProceduresTabs] Rendu avec activeTab:', activeTab, 'section:', section);

  return (
    <ProcedureActionHandlers 
      onAddProcedure={onAddProcedure}
      onOpenApprovalQueue={onOpenApprovalQueue}
    >
      {({ handleAddClick, handleOpenApprovalQueue }) => {
        const tabsConfig = getTabsConfig({
          section,
          searchTerm,
          setSearchTerm,
          onAddProcedure: handleAddClick,
          onOpenApprovalQueue: handleOpenApprovalQueue,
          onOCRTextExtracted: handleOCRTextExtracted,
          onOCRDataExtracted: onOCRDataExtracted,
          activeTab
        });

        console.log('📋 [ProceduresTabs] Configuration des onglets:', tabsConfig);
        console.log('📋 [ProceduresTabs] Onglet actif:', activeTab || tabsConfig.defaultValue);

        return (
          <ProcedureTabsLayout 
            defaultValue={tabsConfig.defaultValue}
            tabs={tabsConfig.tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        );
      }}
    </ProcedureActionHandlers>
  );
}
