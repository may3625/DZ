import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp,
  Download,
  Share2,
  Filter,
  Calendar,
  Eye,
  RefreshCw,
  Loader2,
  Settings,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
    borderWidth?: number;
  }[];
}

export interface AnalyticsModalProps {
  title: string;
  description?: string;
  chartType: 'bar' | 'line' | 'pie' | 'area' | 'table';
  data: ChartData;
  period?: 'day' | 'week' | 'month' | 'year';
  filters?: Record<string, any>;
  onExport?: (format: 'pdf' | 'excel' | 'csv') => void;
  size?: 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const sizeClasses = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

const chartTypeConfig = {
  bar: {
    label: 'Graphique en barres',
    icon: BarChart3,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  line: {
    label: 'Graphique linéaire',
    icon: LineChart,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  pie: {
    label: 'Graphique circulaire',
    icon: PieChart,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  area: {
    label: 'Graphique en aires',
    icon: TrendingUp,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  table: {
    label: 'Tableau de données',
    icon: BarChart3,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  },
};

const periodConfig = {
  day: 'Jour',
  week: 'Semaine',
  month: 'Mois',
  year: 'Année',
};

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  title,
  description,
  chartType,
  data,
  period = 'month',
  filters,
  onExport,
  size = 'lg',
  className,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handlePeriodChange = useCallback((newPeriod: string) => {
    setSelectedPeriod(newPeriod as keyof typeof periodConfig);
    // Ici vous pourriez déclencher une nouvelle requête de données
  }, []);

  const handleExport = useCallback(async (format: 'pdf' | 'excel' | 'csv') => {
    if (!onExport) return;
    
    try {
      setExporting(true);
      await onExport(format);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    } finally {
      setExporting(false);
    }
  }, [onExport]);

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return renderBarChart();
      case 'line':
        return renderLineChart();
      case 'pie':
        return renderPieChart();
      case 'area':
        return renderAreaChart();
      case 'table':
        return renderTable();
      default:
        return renderBarChart();
    }
  };

  const renderBarChart = () => (
    <div className="space-y-4">
      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <BarChart3 className="w-16 h-16 mx-auto mb-2 text-gray-300" />
          <p>Graphique en barres</p>
          <p className="text-sm">Données: {data.datasets[0]?.data.length || 0} points</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-lg font-semibold text-blue-600">
            {data.datasets[0]?.data.reduce((sum, val) => sum + val, 0) || 0}
          </p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded">
          <p className="text-sm text-gray-600">Moyenne</p>
          <p className="text-lg font-semibold text-green-600">
            {data.datasets[0]?.data.length ? 
              (data.datasets[0].data.reduce((sum, val) => sum + val, 0) / data.datasets[0].data.length).toFixed(1) : 0
            }
          </p>
        </div>
      </div>
    </div>
  );

  const renderLineChart = () => (
    <div className="space-y-4">
      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <LineChart className="w-16 h-16 mx-auto mb-2 text-gray-300" />
          <p>Graphique linéaire</p>
          <p className="text-sm">Données: {data.datasets[0]?.data.length || 0} points</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded">
          <p className="text-sm text-gray-600">Min</p>
          <p className="text-lg font-semibold text-blue-600">
            {data.datasets[0]?.data.length ? Math.min(...data.datasets[0].data) : 0}
          </p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded">
          <p className="text-sm text-gray-600">Max</p>
          <p className="text-lg font-semibold text-green-600">
            {data.datasets[0]?.data.length ? Math.max(...data.datasets[0].data) : 0}
          </p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded">
          <p className="text-sm text-gray-600">Tendance</p>
          <p className="text-lg font-semibold text-purple-600">
            {data.datasets[0]?.data.length > 1 ? 
              (data.datasets[0].data[data.datasets[0].data.length - 1] > data.datasets[0].data[0] ? '↗️' : '↘️') : '→'
            }
          </p>
        </div>
      </div>
    </div>
  );

  const renderPieChart = () => (
    <div className="space-y-4">
      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <PieChart className="w-16 h-16 mx-auto mb-2 text-gray-300" />
          <p>Graphique circulaire</p>
          <p className="text-sm">Données: {data.datasets[0]?.data.length || 0} segments</p>
        </div>
      </div>
      
      <div className="space-y-2">
        {data.labels.map((label, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: data.datasets[0]?.backgroundColor?.[index] || '#6b7280' }}
              />
              <span className="text-sm font-medium">{label}</span>
            </div>
            <span className="text-sm text-gray-600">
              {data.datasets[0]?.data[index] || 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAreaChart = () => (
    <div className="space-y-4">
      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <TrendingUp className="w-16 h-16 mx-auto mb-2 text-gray-300" />
          <p>Graphique en aires</p>
          <p className="text-sm">Données: {data.datasets[0]?.data.length || 0} points</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-orange-50 rounded">
          <p className="text-sm text-gray-600">Croissance</p>
          <p className="text-lg font-semibold text-orange-600">
            {data.datasets[0]?.data.length > 1 ? 
              (((data.datasets[0].data[data.datasets[0].data.length - 1] - data.datasets[0].data[0]) / data.datasets[0].data[0] * 100) || 0).toFixed(1) + '%' : '0%'
            }
          </p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded">
          <p className="text-sm text-gray-600">Volume</p>
          <p className="text-lg font-semibold text-blue-600">
            {data.datasets[0]?.data.reduce((sum, val) => sum + val, 0) || 0}
          </p>
        </div>
      </div>
    </div>
  );

  const renderTable = () => (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2 font-medium">Label</th>
              {data.datasets.map((dataset, index) => (
                <th key={index} className="text-right p-2 font-medium">
                  {dataset.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.labels.map((label, rowIndex) => (
              <tr key={rowIndex} className="border-b hover:bg-gray-50">
                <td className="p-2 font-medium">{label}</td>
                {data.datasets.map((dataset, colIndex) => (
                  <td key={colIndex} className="text-right p-2">
                    {dataset.data[rowIndex] || 0}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="text-center text-sm text-gray-500">
        {data.labels.length} lignes × {data.datasets.length} colonnes
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Filtres</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(false)}
        >
          ×
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Période
          </label>
          <select
            value={selectedPeriod}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          >
            {Object.entries(periodConfig).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Type de graphique
          </label>
          <select
            value={chartType}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            disabled
          >
            {Object.entries(chartTypeConfig).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(false)}
        >
          Fermer
        </Button>
      </div>
    </div>
  );

  return (
    <div className={cn('p-0 overflow-hidden', sizeClasses[size], className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {chartTypeConfig[chartType] && (
                <div className={cn(
                  "p-2 rounded-full",
                  chartTypeConfig[chartType].bgColor
                )}>
                  <div className={chartTypeConfig[chartType].color}>
                    {React.createElement(chartTypeConfig[chartType].icon, { className: "w-4 h-4" })}
                  </div>
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold">{title}</h2>
                {description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(showFilters && "bg-blue-50 border-blue-200")}
            >
              <Filter className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && renderFilters()}

      {/* Content */}
      <div className="px-6 py-4 flex-1 overflow-y-auto">
        <div className="space-y-4">
          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Visualisation des données</span>
                <Badge variant="outline">
                  {periodConfig[selectedPeriod]}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderChart()}
            </CardContent>
          </Card>

          {/* Data Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Résumé des données</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Points de données:</span>
                  <span className="ml-2 font-medium">
                    {data.datasets[0]?.data.length || 0}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Datasets:</span>
                  <span className="ml-2 font-medium">
                    {data.datasets.length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Labels:</span>
                  <span className="ml-2 font-medium">
                    {data.labels.length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Type:</span>
                  <span className="ml-2 font-medium">
                    {chartTypeConfig[chartType]?.label}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 bg-muted/30 border-t">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Dernière mise à jour: {new Date().toLocaleString('fr-FR')}
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
              disabled={exporting}
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              CSV
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('excel')}
              disabled={exporting}
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Excel
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('pdf')}
              disabled={exporting}
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};