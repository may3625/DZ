import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, PlayCircle, Settings } from 'lucide-react';
import { SourcesTabSection } from './SourcesTabSection';
import { JobsTabSection } from './JobsTabSection';
import { SupabaseStrategyTabSection } from './SupabaseStrategyTabSection';

interface SourcesSupabaseSectionProps {
  language: string;
}

export const SourcesSupabaseSection = ({ language }: SourcesSupabaseSectionProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Sources (Supabase)
          </h1>
          <p className="text-gray-600 text-lg">
            Gestion stratégique de la base de données et monitoring en temps réel
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="sources" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="sources" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Sources
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <PlayCircle className="w-4 h-4" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="strategy" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Stratégie Supabase
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sources">
            <SourcesTabSection />
          </TabsContent>

          <TabsContent value="jobs">
            <JobsTabSection />
          </TabsContent>

          <TabsContent value="strategy">
            <SupabaseStrategyTabSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};