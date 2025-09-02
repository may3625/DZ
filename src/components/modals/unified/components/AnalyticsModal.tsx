/**
 * Modal d'analytics et reporting pour l'écosystème juridique algérien
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  Download, 
  Filter, 
  Calendar,
  TrendingUp,
  Users,
  FileText,
  Activity,
  DollarSign
} from 'lucide-react';
import { AnalyticsModalConfig } from '../types';

interface AnalyticsModalProps {
  config: AnalyticsModalConfig;
  onClose: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ config, onClose }) => {
  const [selectedPeriod, setSelectedPeriod] = useState(config.period || 'month');
  const [selectedFilters, setSelectedFilters] = useState(config.filters || {});
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');

  // Données de démonstration pour différents types de graphiques
  const barData = [
    { name: 'Jan', value: 400, lois: 240, decrets: 100, arretes: 60 },
    { name: 'Fév', value: 300, lois: 139, decrets: 110, arretes: 51 },
    { name: 'Mar', value: 200, lois: 980, decrets: 120, arretes: 80 },
    { name: 'Avr', value: 278, lois: 390, decrets: 140, arretes: 148 },
    { name: 'Mai', value: 189, lois: 480, decrets: 160, arretes: 249 },
    { name: 'Jun', value: 239, lois: 380, decrets: 180, arretes: 350 }
  ];

  const lineData = [
    { name: 'Sem 1', procedures: 4000, validations: 2400 },
    { name: 'Sem 2', procedures: 3000, validations: 1398 },
    { name: 'Sem 3', procedures: 2000, validations: 9800 },
    { name: 'Sem 4', procedures: 2780, validations: 3908 }
  ];

  const pieData = [
    { name: 'Lois', value: 400, color: '#0088FE' },
    { name: 'Décrets', value: 300, color: '#00C49F' },
    { name: 'Arrêtés', value: 300, color: '#FFBB28' },
    { name: 'Circulaires', value: 200, color: '#FF8042' }
  ];

  const areaData = [
    { name: 'Jan', visites: 4000, telechargements: 2400 },
    { name: 'Fév', visites: 3000, telechargements: 1398 },
    { name: 'Mar', visites: 2000, telechargements: 9800 },
    { name: 'Avr', visites: 2780, telechargements: 3908 },
    { name: 'Mai', visites: 1890, telechargements: 4800 },
    { name: 'Jun', visites: 2390, telechargements: 3800 }
  ];

  const tableData = [
    { 
      institution: 'Présidence', 
      textes: 45, 
      procedures: 12, 
      validations: 38,
      taux: '84%'
    },
    { 
      institution: 'Gouvernement', 
      textes: 156, 
      procedures: 89, 
      validations: 134,
      taux: '86%'
    },
    { 
      institution: 'APN', 
      textes: 23, 
      procedures: 5, 
      validations: 20,
      taux: '87%'
    },
    { 
      institution: 'Conseil Nation', 
      textes: 18, 
      procedures: 3, 
      validations: 15,
      taux: '83%'
    }
  ];

  const periods = [
    { value: 'day', label: 'Jour' },
    { value: 'week', label: 'Semaine' },
    { value: 'month', label: 'Mois' },
    { value: 'year', label: 'Année' }
  ];

  const handleExport = () => {
    if (config.onExport) {
      config.onExport(exportFormat);
    }
    
    // Simulation de l'export
    const filename = `analytics_${config.title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.${exportFormat}`;
    console.log(`Exporting ${filename}...`);
  };

  const renderChart = () => {
    const data = config.data.length > 0 ? config.data : barData;
    
    switch (config.chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="lois" stackId="a" fill="#0088FE" />
              <Bar dataKey="decrets" stackId="a" fill="#00C49F" />
              <Bar dataKey="arretes" stackId="a" fill="#FFBB28" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="procedures" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="validations" stroke="#82ca9d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={areaData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="visites" stackId="1" stroke="#8884d8" fill="#8884d8" />
              <Area type="monotone" dataKey="telechargements" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'table':
        return (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Institution</th>
                  <th className="text-left p-2">Textes</th>
                  <th className="text-left p-2">Procédures</th>
                  <th className="text-left p-2">Validations</th>
                  <th className="text-left p-2">Taux</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{row.institution}</td>
                    <td className="p-2">{row.textes}</td>
                    <td className="p-2">{row.procedures}</td>
                    <td className="p-2">{row.validations}</td>
                    <td className="p-2">
                      <Badge variant={parseFloat(row.taux) > 85 ? 'default' : 'secondary'}>
                        {row.taux}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Type de graphique non supporté
          </div>
        );
    }
  };

  const getMetrics = () => [
    {
      title: 'Total Documents',
      value: '1,234',
      change: '+12%',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      title: 'Procédures Actives',
      value: '89',
      change: '+5%',
      icon: Activity,
      color: 'text-green-600'
    },
    {
      title: 'Validations',
      value: '456',
      change: '+8%',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Taux de Conformité',
      value: '94.5%',
      change: '+2%',
      icon: TrendingUp,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="w-full max-h-[90vh] flex flex-col">
      <Tabs defaultValue="chart" className="flex-1">
        <div className="border-b p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">{config.title}</h2>
              <p className="text-sm text-muted-foreground">
                Analyse des données juridiques algériennes
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtrer
              </Button>
            </div>
          </div>
          
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chart">Graphiques</TabsTrigger>
            <TabsTrigger value="metrics">Métriques</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chart" className="p-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                {config.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderChart()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {getMetrics().map((metric, index) => {
              const Icon = metric.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{metric.title}</p>
                        <p className="text-2xl font-bold">{metric.value}</p>
                        <p className="text-xs text-green-600">{metric.change}</p>
                      </div>
                      <Icon className={`w-8 h-8 ${metric.color}`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Répartition par institution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Évolution mensuelle</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={lineData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="procedures" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="export" className="p-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exporter les données
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Format d'export
                </label>
                <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel (XLSX)</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-lg p-4 bg-muted/50">
                <h4 className="font-medium mb-2">Aperçu de l'export</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>• Période: {periods.find(p => p.value === selectedPeriod)?.label}</p>
                  <p>• Type de graphique: {config.chartType}</p>
                  <p>• Nombre de points de données: {config.data.length || barData.length}</p>
                  <p>• Format: {exportFormat.toUpperCase()}</p>
                </div>
              </div>

              <Button onClick={handleExport} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Télécharger le rapport
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="border-t p-4">
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
};