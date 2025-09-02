import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileCheck, 
  Scale, 
  Search,
  MessageSquare,
  Clock,
  User,
  Save,
  RefreshCw,
  Shield,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LegalText } from '@/types/store';

interface LegalTextValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  legalText: LegalText;
  language: 'fr' | 'ar';
  onValidate: (validatedText: LegalText) => void;
}

interface ValidationCheck {
  id: string;
  category: string;
  name: string;
  description: string;
  status: 'pending' | 'passed' | 'failed' | 'warning';
  message: string;
  suggestion?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ValidationHistory {
  id: string;
  date: string;
  validator: string;
  action: 'approved' | 'rejected' | 'modified';
  comments: string;
}

export function LegalTextValidationModal({ 
  isOpen, 
  onClose, 
  legalText, 
  language, 
  onValidate 
}: LegalTextValidationModalProps) {
  const { toast } = useToast();
  
  const [isValidating, setIsValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const [validationChecks, setValidationChecks] = useState<ValidationCheck[]>([]);
  const [validationComments, setValidationComments] = useState('');
  const [validationHistory, setValidationHistory] = useState<ValidationHistory[]>([]);
  const [overallStatus, setOverallStatus] = useState<'pending' | 'passed' | 'failed' | 'warning'>('pending');

  useEffect(() => {
    if (isOpen) {
      performValidation();
      loadValidationHistory();
    }
  }, [isOpen, legalText]);

  const performValidation = async () => {
    setIsValidating(true);
    setValidationProgress(0);

    try {
      // Définition des vérifications de validation spécifiques à l'Algérie
      const checks: ValidationCheck[] = [
        {
          id: 'title_format',
          category: 'Structure',
          name: language === 'fr' ? 'Format du titre' : 'تنسيق العنوان',
          description: language === 'fr' 
            ? 'Vérification de la conformité du titre aux standards algériens'
            : 'التحقق من مطابقة العنوان للمعايير الجزائرية',
          status: 'pending',
          message: '',
          severity: 'medium'
        },
        {
          id: 'number_format',
          category: 'Identification',
          name: language === 'fr' ? 'Numérotation officielle' : 'الترقيم الرسمي',
          description: language === 'fr' 
            ? 'Validation du format de numérotation selon les normes algériennes'
            : 'التحقق من تنسيق الترقيم حسب المعايير الجزائرية',
          status: 'pending',
          message: '',
          severity: 'high'
        },
        {
          id: 'publication_date',
          category: 'Temporel',
          name: language === 'fr' ? 'Date de publication' : 'تاريخ النشر',
          description: language === 'fr' 
            ? 'Vérification de la cohérence de la date de publication'
            : 'التحقق من تماسك تاريخ النشر',
          status: 'pending',
          message: '',
          severity: 'medium'
        },
        {
          id: 'institution_validity',
          category: 'Autorité',
          name: language === 'fr' ? 'Institution émettrice' : 'المؤسسة المصدرة',
          description: language === 'fr' 
            ? 'Validation de l\'autorité compétente pour ce type de texte'
            : 'التحقق من السلطة المختصة لإصدار هذا النوع من النصوص',
          status: 'pending',
          message: '',
          severity: 'critical'
        },
        {
          id: 'legal_references',
          category: 'Références',
          name: language === 'fr' ? 'Références juridiques' : 'المراجع القانونية',
          description: language === 'fr' 
            ? 'Vérification des références aux textes abrogés ou modifiés'
            : 'التحقق من المراجع للنصوص الملغاة أو المعدلة',
          status: 'pending',
          message: '',
          severity: 'medium'
        },
        {
          id: 'content_consistency',
          category: 'Contenu',
          name: language === 'fr' ? 'Cohérence du contenu' : 'تماسك المحتوى',
          description: language === 'fr' 
            ? 'Analyse de la cohérence interne du texte juridique'
            : 'تحليل التماسك الداخلي للنص القانوني',
          status: 'pending',
          message: '',
          severity: 'medium'
        },
        {
          id: 'arabic_translation',
          category: 'Linguistique',
          name: language === 'fr' ? 'Conformité bilingue' : 'المطابقة ثنائية اللغة',
          description: language === 'fr' 
            ? 'Vérification de la conformité des versions française et arabe'
            : 'التحقق من مطابقة النسختين الفرنسية والعربية',
          status: 'pending',
          message: '',
          severity: 'high'
        },
        {
          id: 'legal_hierarchy',
          category: 'Hiérarchie',
          name: language === 'fr' ? 'Hiérarchie normative' : 'التسلسل الهرمي التشريعي',
          description: language === 'fr' 
            ? 'Respect de la hiérarchie des normes juridiques algériennes'
            : 'احترام التسلسل الهرمي للقواعد القانونية الجزائرية',
          status: 'pending',
          message: '',
          severity: 'critical'
        }
      ];

      setValidationChecks(checks);

      // Simulation des vérifications avec progression
      for (let i = 0; i < checks.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const check = checks[i];
        let status: ValidationCheck['status'] = 'passed';
        let message = '';
        let suggestion = '';

        // Logique de validation spécifique
        switch (check.id) {
          case 'title_format':
            if (!legalText.title || legalText.title.length < 10) {
              status = 'failed';
              message = language === 'fr' 
                ? 'Titre trop court ou manquant'
                : 'العنوان قصير جداً أو مفقود';
              suggestion = language === 'fr' 
                ? 'Le titre doit être descriptif et conforme aux standards'
                : 'يجب أن يكون العنوان وصفياً ومطابقاً للمعايير';
            } else {
              message = language === 'fr' 
                ? 'Format du titre conforme'
                : 'تنسيق العنوان مطابق';
            }
            break;

          case 'number_format':
            if (!legalText.numero) {
              status = 'failed';
              message = language === 'fr' 
                ? 'Numéro officiel manquant'
                : 'الرقم الرسمي مفقود';
              suggestion = language === 'fr' 
                ? 'Ajouter le numéro officiel selon la nomenclature algérienne'
                : 'إضافة الرقم الرسمي حسب التسمية الجزائرية';
            } else if (!/^[0-9]+-[0-9]+/.test(legalText.numero)) {
              status = 'warning';
              message = language === 'fr' 
                ? 'Format de numérotation non standard'
                : 'تنسيق الترقيم غير معياري';
              suggestion = language === 'fr' 
                ? 'Vérifier le format XX-YY selon les normes'
                : 'التحقق من التنسيق XX-YY حسب المعايير';
            } else {
              message = language === 'fr' 
                ? 'Numérotation conforme'
                : 'الترقيم مطابق';
            }
            break;

          case 'institution_validity':
            if (!legalText.source) {
              status = 'failed';
              message = language === 'fr' 
                ? 'Institution émettrice non spécifiée'
                : 'المؤسسة المصدرة غير محددة';
            } else {
              const validInstitutions = [
                'Présidence de la République',
                'Gouvernement',
                'Assemblée Populaire Nationale',
                'Conseil de la Nation'
              ];
              
              const isValid = validInstitutions.some(inst => 
                legalText.source?.toLowerCase().includes(inst.toLowerCase())
              );
              
              if (!isValid && legalText.type === 'Loi') {
                status = 'warning';
                message = language === 'fr' 
                  ? 'Institution émettrice à vérifier pour ce type de texte'
                  : 'المؤسسة المصدرة تحتاج للتحقق لهذا النوع من النصوص';
              } else {
                message = language === 'fr' 
                  ? 'Institution émettrice validée'
                  : 'المؤسسة المصدرة مصدقة';
              }
            }
            break;

          default:
            // Simulation d'autres vérifications
            if (Math.random() > 0.8) {
              status = 'warning';
              message = language === 'fr' 
                ? 'Vérification manuelle recommandée'
                : 'يُنصح بالتحقق اليدوي';
            } else {
              message = language === 'fr' 
                ? 'Vérification réussie'
                : 'التحقق ناجح';
            }
            break;
        }

        // Mise à jour du statut
        setValidationChecks(prev => prev.map((c, index) => 
          index === i ? { ...c, status, message, suggestion } : c
        ));

        setValidationProgress(((i + 1) / checks.length) * 100);
      }

      // Calcul du statut global
      const failedChecks = checks.filter(c => 
        validationChecks.find(vc => vc.id === c.id)?.status === 'failed'
      );
      const warningChecks = checks.filter(c => 
        validationChecks.find(vc => vc.id === c.id)?.status === 'warning'
      );

      if (failedChecks.length > 0) {
        setOverallStatus('failed');
      } else if (warningChecks.length > 0) {
        setOverallStatus('warning');
      } else {
        setOverallStatus('passed');
      }

    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur de validation' : 'خطأ في التحقق',
        description: 'Une erreur est survenue lors de la validation',
        variant: 'destructive'
      });
    } finally {
      setIsValidating(false);
    }
  };

  const loadValidationHistory = () => {
    // Simulation de l'historique de validation
    const history: ValidationHistory[] = [
      {
        id: '1',
        date: '2024-01-15T10:30:00',
        validator: 'Dr. Ahmed Benali',
        action: 'approved',
        comments: 'Texte conforme aux normes juridiques algériennes'
      },
      {
        id: '2',
        date: '2024-01-14T14:20:00',
        validator: 'Me. Fatima Zohra',
        action: 'modified',
        comments: 'Corrections mineures apportées au format de numérotation'
      }
    ];
    
    setValidationHistory(history);
  };

  const handleApprove = () => {
    const validatedText: LegalText = {
      ...legalText,
      validationStatus: 'approved',
      validationDate: new Date().toISOString(),
      validationComments: validationComments
    };

    onValidate(validatedText);
    
    toast({
      title: language === 'fr' ? 'Texte approuvé' : 'تم اعتماد النص',
      description: language === 'fr' 
        ? 'Le texte juridique a été validé et approuvé'
        : 'تم التحقق من النص القانوني واعتماده'
    });
  };

  const handleReject = () => {
    const validatedText: LegalText = {
      ...legalText,
      validationStatus: 'rejected',
      validationDate: new Date().toISOString(),
      validationComments: validationComments
    };

    onValidate(validatedText);
    
    toast({
      title: language === 'fr' ? 'Texte rejeté' : 'تم رفض النص',
      description: language === 'fr' 
        ? 'Le texte juridique a été rejeté pour correction'
        : 'تم رفض النص القانوني للتصحيح'
    });
  };

  const getStatusIcon = (status: ValidationCheck['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getSeverityColor = (severity: ValidationCheck['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
    }
  };

  const getOverallStatusColor = () => {
    switch (overallStatus) {
      case 'passed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-gray-400';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {language === 'fr' ? 'Validation du texte juridique' : 'التحقق من النص القانوني'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="validation" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="validation">
              {language === 'fr' ? 'Validation' : 'التحقق'}
            </TabsTrigger>
            <TabsTrigger value="comments">
              {language === 'fr' ? 'Commentaires' : 'التعليقات'}
            </TabsTrigger>
            <TabsTrigger value="history">
              {language === 'fr' ? 'Historique' : 'التاريخ'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="validation" className="space-y-4">
            {/* Statut global */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileCheck className={`w-8 h-8 ${getOverallStatusColor()}`} />
                    <div>
                      <h3 className="font-semibold">
                        {language === 'fr' ? 'Statut de validation' : 'حالة التحقق'}
                      </h3>
                      <p className={`text-sm font-medium ${getOverallStatusColor()}`}>
                        {overallStatus === 'passed' && (language === 'fr' ? 'Validé' : 'مصدق')}
                        {overallStatus === 'failed' && (language === 'fr' ? 'Échec' : 'فشل')}
                        {overallStatus === 'warning' && (language === 'fr' ? 'Avertissements' : 'تحذيرات')}
                        {overallStatus === 'pending' && (language === 'fr' ? 'En cours' : 'جاري')}
                      </p>
                    </div>
                  </div>
                  
                  {isValidating && (
                    <div className="text-right">
                      <Progress value={validationProgress} className="w-32 mb-1" />
                      <p className="text-xs text-muted-foreground">
                        {validationProgress.toFixed(0)}%
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Vérifications détaillées */}
            <div className="space-y-3">
              {validationChecks.map((check) => (
                <Card key={check.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {getStatusIcon(check.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{check.name}</h4>
                          <Badge className={getSeverityColor(check.severity)}>
                            {check.severity}
                          </Badge>
                          <Badge variant="outline">
                            {check.category}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {check.description}
                        </p>
                        
                        {check.message && (
                          <p className="text-sm font-medium mb-2">
                            {check.message}
                          </p>
                        )}
                        
                        {check.suggestion && (
                          <div className="p-2 bg-blue-50 border-l-4 border-blue-400 rounded">
                            <p className="text-sm text-blue-800">
                              <strong>
                                {language === 'fr' ? 'Suggestion:' : 'اقتراح:'}
                              </strong>{' '}
                              {check.suggestion}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  {language === 'fr' ? 'Commentaires de validation' : 'تعليقات التحقق'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={validationComments}
                  onChange={(e) => setValidationComments(e.target.value)}
                  placeholder={language === 'fr' 
                    ? 'Ajouter des commentaires sur la validation...'
                    : 'إضافة تعليقات حول التحقق...'
                  }
                  rows={6}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {language === 'fr' ? 'Historique de validation' : 'تاريخ التحقق'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {validationHistory.map((entry) => (
                    <div key={entry.id} className="border-l-4 border-blue-400 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{entry.validator}</span>
                        <Badge variant={
                          entry.action === 'approved' ? 'default' :
                          entry.action === 'rejected' ? 'destructive' : 'secondary'
                        }>
                          {entry.action === 'approved' && (language === 'fr' ? 'Approuvé' : 'معتمد')}
                          {entry.action === 'rejected' && (language === 'fr' ? 'Rejeté' : 'مرفوض')}
                          {entry.action === 'modified' && (language === 'fr' ? 'Modifié' : 'معدل')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {new Date(entry.date).toLocaleString(language === 'fr' ? 'fr-FR' : 'ar-DZ')}
                      </p>
                      <p className="text-sm">{entry.comments}</p>
                    </div>
                  ))}
                  
                  {validationHistory.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      {language === 'fr' 
                        ? 'Aucun historique de validation disponible'
                        : 'لا يوجد تاريخ تحقق متاح'
                      }
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={performValidation}
            disabled={isValidating}
          >
            {isValidating ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {language === 'fr' ? 'Revalider' : 'إعادة التحقق'}
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              {language === 'fr' ? 'Fermer' : 'إغلاق'}
            </Button>
            
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isValidating}
            >
              <XCircle className="w-4 h-4 mr-2" />
              {language === 'fr' ? 'Rejeter' : 'رفض'}
            </Button>
            
            <Button
              onClick={handleApprove}
              disabled={isValidating || overallStatus === 'failed'}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {language === 'fr' ? 'Approuver' : 'اعتماد'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}