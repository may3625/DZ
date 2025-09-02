import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, AlertTriangle, FileText, Plus, Zap } from 'lucide-react';
import { DocumentImportModal } from './DocumentImportModal';
import { ReportIssueModal } from './ReportIssueModal';

interface LegalCatalogQuickActionsProps {
  onAddLegalText?: () => void;
}

export function LegalCatalogQuickActions({ onAddLegalText }: LegalCatalogQuickActionsProps) {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const handleImportSuccess = (files: any[]) => {
    console.log('Files imported successfully:', files);
    // Ici, vous pourriez déclencher une actualisation de la liste ou autres actions
  };

  const quickActions = [
    {
      title: "Ajouter un texte",
      description: "Saisir manuellement un nouveau texte juridique",
      icon: Plus,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      hoverColor: "hover:bg-green-100",
      action: onAddLegalText
    },
    {
      title: "Importer des documents",
      description: "Télécharger plusieurs fichiers PDF, DOC, DOCX ou TXT",
      icon: Upload,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      hoverColor: "hover:bg-blue-100",
      action: () => setShowImportModal(true)
    },
    {
      title: "Signaler un problème",
      description: "Signaler une erreur ou un contenu manquant",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      hoverColor: "hover:bg-red-100",
      action: () => setShowReportModal(true)
    }
  ];

  return (
    <>
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            Actions rapides
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            
            return (
              <Button
                key={index}
                variant="ghost"
                className={`w-full h-auto p-4 justify-start text-left ${action.bgColor} ${action.borderColor} border ${action.hoverColor} transition-all hover:shadow-sm`}
                onClick={action.action}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className={`${action.color} mt-0.5`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className={`font-medium text-sm ${action.color}`}>
                      {action.title}
                    </div>
                    <div className="text-xs text-gray-600 mt-1 leading-relaxed">
                      {action.description}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </CardContent>
      </Card>

      {/* Modales */}
      <DocumentImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={handleImportSuccess}
      />

      <ReportIssueModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </>
  );
}