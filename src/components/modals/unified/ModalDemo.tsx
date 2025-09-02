import React from 'react';
import { Button } from '@/components/ui/button';

export const ModalDemo: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Démonstration des Modales Unifiées
      </h3>
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Système de Modales Unifié</h4>
          <p className="text-blue-700 text-sm mb-3">
            Le système de modales unifié est entièrement fonctionnel avec tous les composants spécialisés.
          </p>
          <Button variant="outline" size="sm">
            Tester les Modales
          </Button>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-900 mb-2">Composants Disponibles</h4>
          <ul className="text-green-700 text-sm space-y-1">
            <li>• ConfirmationModal</li>
            <li>• FormModal</li>
            <li>• WorkflowModal</li>
            <li>• ApprovalModal</li>
            <li>• OCRModal</li>
            <li>• SearchModal</li>
            <li>• LegalModal</li>
            <li>• ProcedureModal</li>
            <li>• AnalyticsModal</li>
          </ul>
        </div>
      </div>
    </div>
  );
};