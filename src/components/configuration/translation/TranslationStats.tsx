import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, XCircle, TrendingUp } from 'lucide-react';

interface TranslationStats {
  complete: number;
  partial: number;
  missing: number;
  total: number;
  byLanguage: {
    fr: number;
    ar: number;
    en: number;
  };
}

interface TranslationStatsProps {
  stats: TranslationStats;
  sectionName: string;
}

export function TranslationStatsComponent({ stats, sectionName }: TranslationStatsProps) {
  const completionRate = stats.total > 0 ? Math.round((stats.complete / stats.total) * 100) : 0;
  
  const getProgressColor = (rate: number) => {
    if (rate >= 90) return 'bg-green-500';
    if (rate >= 70) return 'bg-blue-500';
    if (rate >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getLanguageCompletionRate = (lang: keyof TranslationStats['byLanguage']) => {
    return stats.total > 0 ? Math.round((stats.byLanguage[lang] / stats.total) * 100) : 0;
  };

  return (
    <div className="space-y-4">
      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.complete}</div>
                <div className="text-sm text-muted-foreground">Complètes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">{stats.partial}</div>
                <div className="text-sm text-muted-foreground">Partielles</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.missing}</div>
                <div className="text-sm text-muted-foreground">Manquantes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <div>
                <div className="text-2xl font-bold text-primary">{completionRate}%</div>
                <div className="text-sm text-muted-foreground">Progression</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progression globale - {sectionName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Traductions complètes</span>
              <span className="font-medium">{completionRate}%</span>
            </div>
            <Progress 
              value={completionRate} 
              className="h-2"
            />
            <div className="text-xs text-muted-foreground">
              {stats.complete} sur {stats.total} traductions terminées
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language-specific Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progression par langue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* French */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                🇫🇷 Français
              </span>
              <span className="font-medium">{getLanguageCompletionRate('fr')}%</span>
            </div>
            <Progress value={getLanguageCompletionRate('fr')} className="h-2" />
          </div>

          {/* Arabic */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                🇩🇿 العربية
              </span>
              <span className="font-medium">{getLanguageCompletionRate('ar')}%</span>
            </div>
            <Progress value={getLanguageCompletionRate('ar')} className="h-2" />
          </div>

          {/* English */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                🇬🇧 English
              </span>
              <span className="font-medium">{getLanguageCompletionRate('en')}%</span>
            </div>
            <Progress value={getLanguageCompletionRate('en')} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}