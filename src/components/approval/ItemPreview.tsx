// Composant pour l'aperçu des items d'approbation en format JSON

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Code, 
  Eye, 
  Download, 
  Copy, 
  Check,
  Calendar,
  User,
  Hash
} from 'lucide-react';
import { ApprovalItem } from '@/types/approval';
import { useToast } from '@/hooks/use-toast';

interface ItemPreviewProps {
  item: ApprovalItem;
}

export function ItemPreview({ item }: ItemPreviewProps) {
  const [copied, setCopied] = useState<'data' | 'original' | null>(null);
  const [activeView, setActiveView] = useState<'formatted' | 'json'>('formatted');
  const { toast } = useToast();

  const copyToClipboard = async (text: string, type: 'data' | 'original') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
      toast({
        title: "Copié",
        description: "Le contenu a été copié dans le presse-papiers"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de copier le contenu"
      });
    }
  };

  const downloadJson = (data: any, filename: string) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderValue = (value: any, key?: string): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">null</span>;
    }

    if (typeof value === 'boolean') {
      return (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'true' : 'false'}
        </Badge>
      );
    }

    if (typeof value === 'string') {
      // Formatage spécial pour les dates
      if (key?.includes('date') || key?.includes('_at')) {
        return (
          <span className="font-mono text-sm">
            {new Date(value).toLocaleString('fr-FR')}
          </span>
        );
      }
      
      // Formatage spécial pour les URLs
      if (value.startsWith('http')) {
        return (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline break-all"
          >
            {value}
          </a>
        );
      }
      
      return <span className="break-words">{value}</span>;
    }

    if (typeof value === 'number') {
      return <span className="font-mono">{value}</span>;
    }

    if (Array.isArray(value)) {
      return (
        <div className="space-y-1">
          {value.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {index}
              </Badge>
              {renderValue(item)}
            </div>
          ))}
        </div>
      );
    }

    if (typeof value === 'object') {
      return (
        <div className="space-y-2 border-l-2 border-muted pl-3">
          {Object.entries(value).map(([k, v]) => (
            <div key={k} className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">
                {k}:
              </div>
              <div className="ml-3">
                {renderValue(v, k)}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return <span>{String(value)}</span>;
  };

  const formatData = (data: any) => {
    return Object.entries(data).map(([key, value]) => (
      <div key={key} className="space-y-2 p-3 border rounded">
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">{key}</span>
        </div>
        <div className="ml-6">
          {renderValue(value, key)}
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-4">
      {/* En-tête de l'élément */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {item.title}
              </CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadJson(item.data, `approval-item-${item.id}.json`)}
              >
                <Download className="h-3 w-3 mr-1" />
                Télécharger
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>Type: {item.item_type}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Créé: {new Date(item.created_at).toLocaleDateString()}</span>
            </div>
            {item.submitted_by && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Par: {item.submitted_by}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span>ID: {item.id.slice(0, 8)}...</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contenu principal */}
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'formatted' | 'json')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="formatted" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Vue formatée
          </TabsTrigger>
          <TabsTrigger value="json" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            JSON brut
          </TabsTrigger>
        </TabsList>

        <TabsContent value="formatted" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Données à approuver</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {formatData(item.data)}
            </CardContent>
          </Card>

          {item.original_data && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Données originales</CardTitle>
                <CardDescription>
                  Données avant modification (pour comparaison)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {formatData(item.original_data)}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="json" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Données à approuver (JSON)</CardTitle>
                <CardDescription>
                  Format JSON brut pour révision technique
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(JSON.stringify(item.data, null, 2), 'data')}
              >
                {copied === 'data' ? (
                  <Check className="h-3 w-3 mr-1" />
                ) : (
                  <Copy className="h-3 w-3 mr-1" />
                )}
                Copier
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted/50 p-4 rounded text-xs overflow-auto max-h-96 border">
                {JSON.stringify(item.data, null, 2)}
              </pre>
            </CardContent>
          </Card>

          {item.original_data && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Données originales (JSON)</CardTitle>
                  <CardDescription>
                    État précédent pour comparaison
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(JSON.stringify(item.original_data, null, 2), 'original')}
                >
                  {copied === 'original' ? (
                    <Check className="h-3 w-3 mr-1" />
                  ) : (
                    <Copy className="h-3 w-3 mr-1" />
                  )}
                  Copier
                </Button>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted/50 p-4 rounded text-xs overflow-auto max-h-96 border">
                  {JSON.stringify(item.original_data, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}