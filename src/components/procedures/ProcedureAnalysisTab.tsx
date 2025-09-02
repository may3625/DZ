
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProcedureComparisonTable } from './analysis/ProcedureComparisonTable';
import { ImprovementRecommendations } from './analysis/ImprovementRecommendations';
import { UserFeedbackAnalysis } from './analysis/UserFeedbackAnalysis';
import { ProcedureDetailAnalysis } from './analysis/ProcedureDetailAnalysis';
import { MetricsOverview } from './analysis/MetricsOverview';
import { OverviewTab } from './analysis/OverviewTab';
import { ProcedureSimplificationSection } from './analysis/ProcedureSimplificationSection';
import { useAppStore } from '@/stores/appStore';
import { calculateAverageMetrics } from './analysis/utils';
import { SectionHeader } from '@/components/common/SectionHeader';
import { BarChart3 } from 'lucide-react';

export function ProcedureAnalysisTab() {
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const procedures = useAppStore(state => state.procedures);
  const procedureMetrics = procedures.map(p => ({
    id: p.id,
    name: p.title,
    averageTime: 15,
    steps: p.steps?.length || 0,
    documents: p.requirements?.length || 0,
    administrations: 1,
    cost: 0,
    complexityScore: 6,
    successRate: 85,
    userSatisfaction: 4.0,
    feedbackCount: 10,
    trends: { timeChange: 0, satisfactionChange: 0 }
  }));
  const averageMetrics = calculateAverageMetrics(procedureMetrics);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Analyse des Procédures"
        description="Analyse approfondie des performances et métriques des procédures administratives"
        icon={BarChart3}
        iconColor="text-purple-600"
      />

      {/* Vue d'ensemble des métriques */}
      <MetricsOverview averageMetrics={averageMetrics} />

      {/* Onglets d'analyse */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="procedure">Procédure</TabsTrigger>
          <TabsTrigger value="comparison">Comparaison</TabsTrigger>
          <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
          <TabsTrigger value="feedback">Feedback Utilisateurs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab procedures={procedureMetrics} />
        </TabsContent>

        <TabsContent value="procedure" className="space-y-6">
          <ProcedureDetailAnalysis procedures={procedureMetrics} />
          <ProcedureSimplificationSection />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <ProcedureComparisonTable 
            procedures={procedureMetrics}
            selectedProcedures={selectedForComparison}
            onSelectionChange={setSelectedForComparison}
          />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <ImprovementRecommendations procedures={procedureMetrics} />
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <UserFeedbackAnalysis procedures={procedureMetrics} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
