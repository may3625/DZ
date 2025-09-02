import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, File, Database, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LegalText } from '@/types/store';

interface DocumentExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTexts: LegalText[];
  language: 'fr' | 'ar';
}

export function DocumentExportModal({ isOpen, onClose, selectedTexts, language }: DocumentExportModalProps) {
  const { toast } = useToast();
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exportType, setExportType] = useState('selected'); // 'selected' | 'all' | 'filtered'
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeContent, setIncludeContent] = useState(true);
  const [includeReferences, setIncludeReferences] = useState(false);
  const [exportTemplate, setExportTemplate] = useState('standard');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const exportFormats = [
    { value: 'pdf', label: 'PDF', icon: FileText, description: language === 'fr' ? 'Format portable standard' : 'تنسيق محمول معياري' },
    { value: 'docx', label: 'Word (DOCX)', icon: FileText, description: language === 'fr' ? 'Document Microsoft Word' : 'وثيقة مايكروسوفت وورد' },
    { value: 'xlsx', label: 'Excel (XLSX)', icon: File, description: language === 'fr' ? 'Feuille de calcul Excel' : 'جدول بيانات إكسل' },
    { value: 'json', label: 'JSON', icon: Database, description: language === 'fr' ? 'Format de données structurées' : 'تنسيق البيانات المهيكلة' },
    { value: 'xml', label: 'XML', icon: Database, description: language === 'fr' ? 'Format XML standard' : 'تنسيق XML معياري' }
  ];

  const exportTemplates = [
    { value: 'standard', label: language === 'fr' ? 'Standard' : 'معياري' },
    { value: 'official', label: language === 'fr' ? 'Officiel algérien' : 'رسمي جزائري' },
    { value: 'compact', label: language === 'fr' ? 'Compact' : 'مضغوط' },
    { value: 'detailed', label: language === 'fr' ? 'Détaillé' : 'مفصل' },
    { value: 'legal_brief', label: language === 'fr' ? 'Résumé juridique' : 'ملخص قانوني' }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulation de l'export avec progression
      const intervals = [20, 40, 60, 80, 100];
      
      for (let i = 0; i < intervals.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setExportProgress(intervals[i]);
      }

      // Logique d'export en fonction du format
      let exportData;
      let filename;
      let mimeType;

      switch (exportFormat) {
        case 'pdf':
          exportData = await exportToPDF();
          filename = `textes_juridiques_${Date.now()}.pdf`;
          mimeType = 'application/pdf';
          break;
        case 'docx':
          exportData = await exportToDocx();
          filename = `textes_juridiques_${Date.now()}.docx`;
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        case 'xlsx':
          exportData = await exportToExcel();
          filename = `textes_juridiques_${Date.now()}.xlsx`;
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        case 'json':
          exportData = await exportToJSON();
          filename = `textes_juridiques_${Date.now()}.json`;
          mimeType = 'application/json';
          break;
        case 'xml':
          exportData = await exportToXML();
          filename = `textes_juridiques_${Date.now()}.xml`;
          mimeType = 'application/xml';
          break;
        default:
          throw new Error('Format d\'export non supporté');
      }

      // Téléchargement du fichier
      const blob = new Blob([exportData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsComplete(true);
      
      toast({
        title: language === 'fr' ? 'Export réussi' : 'تم التصدير بنجاح',
        description: language === 'fr' 
          ? `${selectedTexts.length} textes exportés en ${exportFormat.toUpperCase()}`
          : `تم تصدير ${selectedTexts.length} نص في تنسيق ${exportFormat.toUpperCase()}`
      });

    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur d\'export' : 'خطأ في التصدير',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async (): Promise<Blob> => {
    // Logique d'export PDF avec template algérien
    const content = generatePDFContent();
    return new Blob([content], { type: 'application/pdf' });
  };

  const exportToDocx = async (): Promise<Blob> => {
    // Logique d'export DOCX
    const content = generateDocxContent();
    return new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  };

  const exportToExcel = async (): Promise<Blob> => {
    // Logique d'export Excel
    const content = generateExcelContent();
    return new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  };

  const exportToJSON = async (): Promise<string> => {
    const data = {
      metadata: {
        exportDate: new Date().toISOString(),
        totalTexts: selectedTexts.length,
        format: 'json',
        template: exportTemplate,
        language: language
      },
      legalTexts: selectedTexts.map(text => ({
        id: text.id,
        title: text.title,
        type: text.type,
        numero: text.numero,
        datePublication: text.datePublication,
        source: text.source,
        status: text.status,
        content: includeContent ? text.content : undefined,
        keywords: text.keywords,
        references: includeReferences ? text.references : undefined
      }))
    };
    
    return JSON.stringify(data, null, 2);
  };

  const exportToXML = async (): Promise<string> => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<legalTexts>\n';
    xml += `  <metadata>\n`;
    xml += `    <exportDate>${new Date().toISOString()}</exportDate>\n`;
    xml += `    <totalTexts>${selectedTexts.length}</totalTexts>\n`;
    xml += `    <format>xml</format>\n`;
    xml += `    <template>${exportTemplate}</template>\n`;
    xml += `    <language>${language}</language>\n`;
    xml += `  </metadata>\n`;
    
    selectedTexts.forEach(text => {
      xml += '  <legalText>\n';
      xml += `    <id>${text.id}</id>\n`;
      xml += `    <title><![CDATA[${text.title}]]></title>\n`;
      xml += `    <type>${text.type}</type>\n`;
      if (text.numero) xml += `    <numero>${text.numero}</numero>\n`;
      if (text.datePublication) xml += `    <datePublication>${text.datePublication}</datePublication>\n`;
      if (text.source) xml += `    <source><![CDATA[${text.source}]]></source>\n`;
      xml += `    <status>${text.status}</status>\n`;
      if (includeContent) xml += `    <content><![CDATA[${text.content}]]></content>\n`;
      if (text.keywords && text.keywords.length > 0) {
        xml += '    <keywords>\n';
        text.keywords.forEach(keyword => {
          xml += `      <keyword>${keyword}</keyword>\n`;
        });
        xml += '    </keywords>\n';
      }
      xml += '  </legalText>\n';
    });
    
    xml += '</legalTexts>';
    return xml;
  };

  const generatePDFContent = (): string => {
    // Génération du contenu PDF selon le template algérien
    return 'PDF content would be generated here';
  };

  const generateDocxContent = (): string => {
    // Génération du contenu DOCX
    return 'DOCX content would be generated here';
  };

  const generateExcelContent = (): string => {
    // Génération du contenu Excel
    return 'Excel content would be generated here';
  };

  const handleClose = () => {
    if (!isExporting) {
      setIsComplete(false);
      setExportProgress(0);
      onClose();
    }
  };

  if (isComplete) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              {language === 'fr' ? 'Export terminé' : 'تم التصدير'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {language === 'fr' ? 'Export réussi !' : 'تم التصدير بنجاح!'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'fr' 
                ? `${selectedTexts.length} textes exportés en ${exportFormat.toUpperCase()}`
                : `تم تصدير ${selectedTexts.length} نص في تنسيق ${exportFormat.toUpperCase()}`
              }
            </p>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleClose}>
              {language === 'fr' ? 'Fermer' : 'إغلاق'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>
            {language === 'fr' ? 'Exporter les documents' : 'تصدير الوثائق'}
          </DialogTitle>
        </DialogHeader>

        {isExporting ? (
          <div className="space-y-6 py-6">
            <div className="text-center">
              <Download className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-bounce" />
              <h3 className="text-lg font-semibold mb-2">
                {language === 'fr' ? 'Export en cours...' : 'جاري التصدير...'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {language === 'fr' 
                  ? 'Génération du fichier d\'export, veuillez patienter.'
                  : 'يتم إنشاء ملف التصدير، يرجى الانتظار.'
                }
              </p>
              <Progress value={exportProgress} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">
                {exportProgress}%
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Format d'export */}
            <div>
              <Label className="text-base font-semibold">
                {language === 'fr' ? 'Format d\'export' : 'تنسيق التصدير'}
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {exportFormats.map((format) => {
                  const Icon = format.icon;
                  return (
                    <Card 
                      key={format.value}
                      className={`cursor-pointer transition-colors ${
                        exportFormat === format.value 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setExportFormat(format.value)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <Icon className="w-8 h-8 text-primary" />
                          <div>
                            <p className="font-medium">{format.label}</p>
                            <p className="text-sm text-muted-foreground">
                              {format.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Template d'export */}
            <div>
              <Label className="text-base font-semibold">
                {language === 'fr' ? 'Template' : 'القالب'}
              </Label>
              <Select value={exportTemplate} onValueChange={setExportTemplate}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {exportTemplates.map(template => (
                    <SelectItem key={template.value} value={template.value}>
                      {template.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Options d'export */}
            <div>
              <Label className="text-base font-semibold">
                {language === 'fr' ? 'Options d\'export' : 'خيارات التصدير'}
              </Label>
              <div className="space-y-3 mt-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="metadata" 
                    checked={includeMetadata}
                    onCheckedChange={(checked) => setIncludeMetadata(checked === true)}
                  />
                  <Label htmlFor="metadata">
                    {language === 'fr' ? 'Inclure les métadonnées' : 'تضمين البيانات الوصفية'}
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="content" 
                    checked={includeContent}
                    onCheckedChange={(checked) => setIncludeContent(checked === true)}
                  />
                  <Label htmlFor="content">
                    {language === 'fr' ? 'Inclure le contenu complet' : 'تضمين المحتوى الكامل'}
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="references" 
                    checked={includeReferences}
                    onCheckedChange={(checked) => setIncludeReferences(checked === true)}
                  />
                  <Label htmlFor="references">
                    {language === 'fr' ? 'Inclure les références juridiques' : 'تضمين المراجع القانونية'}
                  </Label>
                </div>
              </div>
            </div>

            {/* Résumé */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">
                  {language === 'fr' ? 'Résumé de l\'export' : 'ملخص التصدير'}
                </h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">
                      {language === 'fr' ? 'Nombre de textes:' : 'عدد النصوص:'}
                    </span>{' '}
                    {selectedTexts.length}
                  </p>
                  <p>
                    <span className="font-medium">
                      {language === 'fr' ? 'Format:' : 'التنسيق:'}
                    </span>{' '}
                    {exportFormats.find(f => f.value === exportFormat)?.label}
                  </p>
                  <p>
                    <span className="font-medium">
                      {language === 'fr' ? 'Template:' : 'القالب:'}
                    </span>{' '}
                    {exportTemplates.find(t => t.value === exportTemplate)?.label}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleClose}>
                {language === 'fr' ? 'Annuler' : 'إلغاء'}
              </Button>
              <Button onClick={handleExport} disabled={selectedTexts.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Exporter' : 'تصدير'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}