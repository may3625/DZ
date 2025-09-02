import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAlgerianI18n } from '@/hooks/useAlgerianI18n';
import { AlgerianText } from '@/components/algerian/AlgerianText';
import { 
  FileText, 
  Scale, 
  Users, 
  TrendingUp, 
  MessageSquare,
  BarChart3,
  Clock,
  AlertCircle,
  CheckCircle,
  Eye,
  Download,
  Share2,
  Star,
  Zap,
  Target,
  Activity,
  ClipboardList,
  LineChart,
  PieChart
} from "lucide-react";

interface EnhancedDashboardProps {
  language?: string;
}

/**
 * Dashboard unifié avec react-i18next et support RTL complet
 */
export function EnhancedDashboard({ language = "fr" }: EnhancedDashboardProps) {
  const { t, isRTL, getRTLClasses, formatNumber, dashboard, common } = useAlgerianI18n();

  const handleNavigateToSection = (section: string) => {
    window.dispatchEvent(new CustomEvent('navigate-to-section', { detail: section }));
  };

  const handleAIAssistant = () => {
    window.dispatchEvent(new CustomEvent('navigate-to-section', { detail: 'ai-assistant' }));
  };

  const quickActions = [
    {
      title: t('dashboard.legalAssistant'),
      description: t('dashboard.legalAssistantDesc'),
      icon: MessageSquare,
      color: "bg-blue-500",
      onClick: handleAIAssistant
    },
    {
      title: t('dashboard.searchTexts'),
      description: t('dashboard.searchTextsDesc'),
      icon: FileText,
      color: "bg-green-500",
      onClick: () => handleNavigateToSection('legal-catalog')
    },
    {
      title: t('dashboard.newProcedure'),
      description: t('dashboard.newProcedureDesc'),
      icon: ClipboardList,
      color: "bg-purple-500",
      onClick: () => handleNavigateToSection('procedures-catalog')
    }
  ];

  const statistics = [
    {
      title: t('dashboard.totalTexts'),
      value: formatNumber(12847),
      icon: FileText,
      trend: "+12%",
      color: "text-blue-600"
    },
    {
      title: t('dashboard.totalProcedures'),
      value: formatNumber(356),
      icon: Scale,
      trend: "+8%",
      color: "text-green-600"
    },
    {
      title: t('dashboard.consultations'),
      value: formatNumber(2543),
      icon: Eye,
      trend: "+15%",
      color: "text-purple-600"
    },
    {
      title: t('dashboard.users'),
      value: formatNumber(892),
      icon: Users,
      trend: "+5%",
      color: "text-orange-600"
    }
  ];

  const recentAlerts = [
    {
      id: 1,
      title: t('legal.categories.decrets'),
      description: language === 'ar' ? 'مرسوم جديد حول التنظيم الإداري' : 'Nouveau décret sur l\'organisation administrative',
      time: "Il y a 2h",
      status: "new",
      priority: "high"
    },
    {
      id: 2, 
      title: t('legal.categories.lois'),
      description: language === 'ar' ? 'تعديل قانون الإجراءات المدنية' : 'Modification du code de procédure civile',
      time: "Il y a 5h",
      status: "updated",
      priority: "medium"
    }
  ];

  return (
    <div className={`p-6 space-y-8 max-w-7xl mx-auto ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* En-tête principal */}
      <div className="text-center space-y-4">
        <AlgerianText variant="heading" className="text-4xl font-bold text-primary" as="h1">
          {dashboard.welcome()}
        </AlgerianText>
        <AlgerianText variant="body" className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {dashboard.subtitle()}
        </AlgerianText>
      </div>

      {/* Assistant IA en vedette */}
      <Card className={`bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 ${getRTLClasses('hover:shadow-lg transition-all cursor-pointer')}`}>
        <CardHeader className={getRTLClasses('pb-4')}>
          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="p-3 bg-blue-500 rounded-xl text-white">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
              <AlgerianText variant="heading" className="text-2xl font-bold text-blue-900" as="h2">
                {t('dashboard.aiAssistant')}
              </AlgerianText>
              <AlgerianText variant="body" className="text-blue-700">
                {t('dashboard.aiDescription')}
              </AlgerianText>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleAIAssistant}
            className={`bg-blue-600 hover:bg-blue-700 text-white ${getRTLClasses('gap-2')}`}
          >
            <Zap className={`w-4 h-4 ${isRTL ? 'rtl-flip' : ''}`} />
            <AlgerianText>{t('dashboard.askQuestion')}</AlgerianText>
          </Button>
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <div className="space-y-6">
        <AlgerianText variant="heading" className="text-2xl font-semibold" as="h2">
          {t('dashboard.quickAccess')}
        </AlgerianText>
        
        <div className="grid md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Card 
              key={index}
              className={`hover:shadow-md transition-shadow cursor-pointer group ${getRTLClasses('')}`}
              onClick={action.onClick}
            >
              <CardHeader className={getRTLClasses('pb-2')}>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <AlgerianText variant="legal" className="font-semibold group-hover:text-primary transition-colors">
                    {action.title}
                  </AlgerianText>
                </div>
              </CardHeader>
              <CardContent>
                <AlgerianText variant="body" className="text-muted-foreground">
                  {action.description}
                </AlgerianText>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {statistics.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <AlgerianText variant="caption" className="text-muted-foreground">
                    {stat.title}
                  </AlgerianText>
                  <AlgerianText variant="heading" className={`text-2xl font-bold ${stat.color}`} as="p">
                    {stat.value}
                  </AlgerianText>
                  <Badge variant="secondary" className="mt-2">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.trend}
                  </Badge>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alertes récentes */}
      <div className="space-y-6">
        <AlgerianText variant="heading" className="text-2xl font-semibold" as="h2">
          {t('dashboard.recentAlerts')}
        </AlgerianText>
        
        <div className="space-y-4">
          {recentAlerts.map((alert) => (
            <Card key={alert.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex-shrink-0 p-2 rounded-full ${
                    alert.priority === 'high' ? 'bg-red-100 text-red-600' :
                    alert.priority === 'medium' ? 'bg-orange-100 text-orange-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                    <AlgerianText variant="legal" className="font-semibold">
                      {alert.title}
                    </AlgerianText>
                    <AlgerianText variant="body" className="text-muted-foreground">
                      {alert.description}
                    </AlgerianText>
                    <AlgerianText variant="caption" className="text-xs text-muted-foreground">
                      {alert.time}
                    </AlgerianText>
                  </div>
                  <Badge variant={alert.status === 'new' ? 'default' : 'secondary'}>
                    {alert.status === 'new' ? 'Nouveau' : 'Mis à jour'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}