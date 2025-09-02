import React from 'react';

export const PredefinedTemplates: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Modèles Pré-définis d'Analyse
      </h3>
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Analyse Réglementaire</h4>
          <p className="text-blue-700 text-sm">
            Modèle standard pour l'analyse des textes réglementaires algériens
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-900 mb-2">Analyse Juridique</h4>
          <p className="text-green-700 text-sm">
            Modèle spécialisé pour l'analyse des textes juridiques
          </p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h4 className="font-medium text-purple-900 mb-2">Analyse Administrative</h4>
          <p className="text-purple-700 text-sm">
            Modèle pour l'analyse des procédures administratives
          </p>
        </div>
      </div>
    </div>
  );
};