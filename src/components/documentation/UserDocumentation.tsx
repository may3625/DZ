/**
 * Documentation utilisateur finale bilingue
 * Guide complet pour l'utilisation de l'application algérienne
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAlgerianI18n } from '@/hooks/useAlgerianI18n';
import { 
  BookOpen, 
  Search, 
  Download, 
  Video, 
  FileText,
  HelpCircle,
  Lightbulb,
  Shield,
  Smartphone,
  Globe,
  Zap
} from 'lucide-react';

interface DocumentationSection {
  id: string;
  title: string;
  titleAr: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'getting-started' | 'features' | 'troubleshooting' | 'legal' | 'advanced';
  content: string;
  contentAr: string;
  keywords: string[];
  keywordsAr: string[];
}

export function UserDocumentation() {
  const { t, language, isRTL } = useAlgerianI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const documentationSections: DocumentationSection[] = [
    {
      id: 'welcome',
      title: 'Bienvenue sur Dalil DZ',
      titleAr: 'مرحباً بكم في دليل الجزائر',
      icon: BookOpen,
      category: 'getting-started',
      content: 'Guide de démarrage rapide pour utiliser efficacement l\'application Dalil DZ. Découvrez les fonctionnalités principales et commencez votre parcours.',
      contentAr: 'دليل البدء السريع لاستخدام تطبيق دليل الجزائر بفعالية. اكتشف الميزات الرئيسية وابدأ رحلتك.',
      keywords: ['démarrage', 'bienvenue', 'guide', 'introduction'],
      keywordsAr: ['البداية', 'مرحبا', 'دليل', 'مقدمة']
    },
    {
      id: 'legal-texts',
      title: 'Consultation des Textes Légaux',
      titleAr: 'استشارة النصوص القانونية',
      icon: FileText,
      category: 'features',
      content: 'Comment rechercher, consulter et télécharger les textes légaux algériens. Filtrage par wilaya, type de document et date.',
      contentAr: 'كيفية البحث واستشارة وتحميل النصوص القانونية الجزائرية. التصفية حسب الولاية ونوع الوثيقة والتاريخ.',
      keywords: ['textes', 'légaux', 'recherche', 'consultation', 'téléchargement'],
      keywordsAr: ['النصوص', 'القانونية', 'البحث', 'الاستشارة', 'التحميل']
    },
    {
      id: 'ocr-feature',
      title: 'Reconnaissance OCR Bilingue',
      titleAr: 'التعرف البصري على الحروف ثنائي اللغة',
      icon: Zap,
      category: 'features',
      content: 'Utilisez la fonction OCR pour extraire du texte de vos documents en arabe et français. Optimisé pour les documents algériens.',
      contentAr: 'استخدم ميزة التعرف البصري لاستخراج النص من مستنداتك بالعربية والفرنسية. محسن للوثائق الجزائرية.',
      keywords: ['OCR', 'reconnaissance', 'texte', 'documents', 'extraction'],
      keywordsAr: ['التعرف البصري', 'النص', 'المستندات', 'الاستخراج']
    },
    {
      id: 'offline-mode',
      title: 'Mode Hors Ligne',
      titleAr: 'الوضع غير المتصل',
      icon: Smartphone,
      category: 'features',
      content: 'Travaillez sans connexion internet. Vos données sont synchronisées automatiquement lors du retour en ligne.',
      contentAr: 'اعمل بدون اتصال بالإنترنت. يتم مزامنة بياناتك تلقائياً عند العودة للاتصال.',
      keywords: ['hors ligne', 'offline', 'synchronisation', 'local'],
      keywordsAr: ['غير متصل', 'مزامنة', 'محلي']
    },
    {
      id: 'accessibility',
      title: 'Accessibilité et Support RTL',
      titleAr: 'إمكانية الوصول ودعم اتجاه النص',
      icon: Globe,
      category: 'features',
      content: 'L\'application supporte pleinement l\'arabe avec lecture de droite à gauche et respecte les standards d\'accessibilité.',
      contentAr: 'يدعم التطبيق العربية بالكامل مع القراءة من اليمين إلى اليسار ويحترم معايير إمكانية الوصول.',
      keywords: ['accessibilité', 'RTL', 'arabe', 'navigation'],
      keywordsAr: ['إمكانية الوصول', 'العربية', 'التنقل']
    },
    {
      id: 'troubleshooting',
      title: 'Résolution des Problèmes',
      titleAr: 'حل المشاكل',
      icon: HelpCircle,
      category: 'troubleshooting',
      content: 'Solutions aux problèmes courants : erreurs de chargement, problèmes de synchronisation, difficultés de navigation.',
      contentAr: 'حلول للمشاكل الشائعة: أخطاء التحميل، مشاكل المزامنة، صعوبات التنقل.',
      keywords: ['problèmes', 'erreurs', 'dépannage', 'solutions'],
      keywordsAr: ['المشاكل', 'الأخطاء', 'الحلول']
    },
    {
      id: 'privacy',
      title: 'Confidentialité et Sécurité',
      titleAr: 'الخصوصية والأمان',
      icon: Shield,
      category: 'legal',
      content: 'Vos données personnelles sont protégées. Découvrez notre politique de confidentialité et les mesures de sécurité.',
      contentAr: 'بياناتك الشخصية محمية. اكتشف سياسة الخصوصية وإجراءات الأمان لدينا.',
      keywords: ['confidentialité', 'sécurité', 'données', 'protection'],
      keywordsAr: ['الخصوصية', 'الأمان', 'البيانات', 'الحماية']
    },
    {
      id: 'advanced-search',
      title: 'Recherche Avancée',
      titleAr: 'البحث المتقدم',
      icon: Search,
      category: 'advanced',
      content: 'Maîtrisez les techniques de recherche avancée : filtres multiples, recherche par mots-clés, tri des résultats.',
      contentAr: 'أتقن تقنيات البحث المتقدم: عوامل تصفية متعددة، البحث بالكلمات المفتاحية، ترتيب النتائج.',
      keywords: ['recherche', 'avancée', 'filtres', 'mots-clés'],
      keywordsAr: ['البحث', 'المتقدم', 'المرشحات', 'الكلمات المفتاحية']
    },
    {
      id: 'tips-tricks',
      title: 'Astuces et Bonnes Pratiques',
      titleAr: 'النصائح والممارسات الجيدة',
      icon: Lightbulb,
      category: 'advanced',
      content: 'Conseils pour optimiser votre utilisation de l\'application et gagner en efficacité.',
      contentAr: 'نصائح لتحسين استخدامك للتطبيق وزيادة الكفاءة.',
      keywords: ['astuces', 'conseils', 'efficacité', 'optimisation'],
      keywordsAr: ['النصائح', 'الكفاءة', 'التحسين']
    }
  ];

  const filteredSections = documentationSections.filter(section => {
    const matchesCategory = selectedCategory === 'all' || section.category === selectedCategory;
    
    if (!searchQuery) return matchesCategory;
    
    const query = searchQuery.toLowerCase();
    const keywords = language === 'ar' ? section.keywordsAr : section.keywords;
    const title = language === 'ar' ? section.titleAr : section.title;
    const content = language === 'ar' ? section.contentAr : section.content;
    
    return matchesCategory && (
      title.toLowerCase().includes(query) ||
      content.toLowerCase().includes(query) ||
      keywords.some(keyword => keyword.toLowerCase().includes(query))
    );
  });

  const exportDocumentation = () => {
    const docContent = filteredSections.map(section => {
      const title = language === 'ar' ? section.titleAr : section.title;
      const content = language === 'ar' ? section.contentAr : section.content;
      return `# ${title}\n\n${content}\n\n`;
    }).join('');

    const blob = new Blob([docContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dalil-dz-documentation-${language}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {language === 'ar' ? 'دليل المستخدم' : 'Documentation Utilisateur'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder={language === 'ar' ? 'البحث في الدليل...' : 'Rechercher dans la documentation...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${isRTL ? 'text-right' : ''}`}
                />
              </div>
              <Button onClick={exportDocumentation} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                {language === 'ar' ? 'تصدير' : 'Exporter'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">
                {language === 'ar' ? 'الكل' : 'Tout'}
              </TabsTrigger>
              <TabsTrigger value="getting-started">
                {language === 'ar' ? 'البداية' : 'Démarrage'}
              </TabsTrigger>
              <TabsTrigger value="features">
                {language === 'ar' ? 'الميزات' : 'Fonctionnalités'}
              </TabsTrigger>
              <TabsTrigger value="troubleshooting">
                {language === 'ar' ? 'المشاكل' : 'Dépannage'}
              </TabsTrigger>
              <TabsTrigger value="legal">
                {language === 'ar' ? 'قانوني' : 'Légal'}
              </TabsTrigger>
              <TabsTrigger value="advanced">
                {language === 'ar' ? 'متقدم' : 'Avancé'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-6">
              <div className="grid gap-4">
                {filteredSections.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        {language === 'ar' 
                          ? 'لم يتم العثور على نتائج للبحث المحدد'
                          : 'Aucun résultat trouvé pour cette recherche'
                        }
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredSections.map((section) => {
                    const Icon = section.icon;
                    const title = language === 'ar' ? section.titleAr : section.title;
                    const content = language === 'ar' ? section.contentAr : section.content;
                    
                    return (
                      <Card key={section.id} className="border-l-4 border-l-primary/20">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2">{title}</h3>
                              <p className="text-muted-foreground leading-relaxed">
                                {content}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            {language === 'ar' ? 'مصادر إضافية' : 'Ressources Supplémentaires'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">
                {language === 'ar' ? 'دروس الفيديو' : 'Tutoriels Vidéo'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' 
                  ? 'شاهد دروس فيديو تفاعلية لتعلم استخدام التطبيق'
                  : 'Regardez des tutoriels vidéo interactifs pour apprendre à utiliser l\'application'
                }
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">
                {language === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' 
                  ? 'إجابات على الأسئلة الأكثر شيوعاً من المستخدمين'
                  : 'Réponses aux questions les plus fréquemment posées par les utilisateurs'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}