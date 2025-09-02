import React from 'react';
import { Helmet } from 'react-helmet-async';
import PageLayout from '@/components/layout/PageLayout';
import { DZOCRIAProcessor } from '@/components/ocr/DZOCRIAProcessor';

const OCRProcessor: React.FC = () => {
  return (
    <PageLayout currentSection="ocr-extraction">
      <Helmet>
        <title>Processeur OCR DZ-IA - Extraction de texte arabe et français</title>
        <meta name="description" content="Processeur OCR avancé pour l'extraction et la correction de textes arabes et français avec des améliorations spécifiques aux documents juridiques algériens." />
        <meta name="keywords" content="OCR, arabe, français, extraction texte, documents juridiques, Algérie" />
      </Helmet>
      
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
        <DZOCRIAProcessor />
      </main>
    </PageLayout>
  );
};

export default OCRProcessor;