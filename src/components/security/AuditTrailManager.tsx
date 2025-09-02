import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePagination } from '@/hooks/usePagination';
import { StandardPagination } from '@/components/common/StandardPagination';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  User, 
  Clock, 
  Search, 
  Filter,
  Eye,
  Download,
  Activity,
  Database,
  Lock,
  Unlock,
  FileText,
  Settings,
  LogIn,
  LogOut,
  UserPlus
} from 'lucide-react';

export function AuditTrailManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const auditLogs = [
    {
      id: 1,
      timestamp: '2025-02-19 14:30:15',
      user: 'admin@dalil.dz',
      action: 'LOGIN',
      resource: 'System',
      details: 'Connexion réussie depuis IP 192.168.1.100',
      severity: 'INFO',
      category: 'Authentication',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      status: 'Success'
    },
    {
      id: 2,
      timestamp: '2025-02-19 14:25:42',
      user: 'marie.dubois@justice.dz',
      action: 'DELETE_DOCUMENT',
      resource: 'Legal Text #12345',
      details: 'Suppression du document "Loi sur les investissements"',
      severity: 'HIGH',
      category: 'Data Modification',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (macOS Intel)',
      status: 'Success'
    },
    {
      id: 3,
      timestamp: '2025-02-19 14:20:33',
      user: 'ahmed.benali@interieur.dz',
      action: 'FAILED_LOGIN',
      resource: 'System',
      details: 'Tentative de connexion échouée - mot de passe incorrect',
      severity: 'MEDIUM',
      category: 'Authentication',
      ipAddress: '203.45.67.89',
      userAgent: 'Mozilla/5.0 (Android)',
      status: 'Failed'
    },
    {
      id: 4,
      timestamp: '2025-02-19 14:15:20',
      user: 'system@dalil.dz',
      action: 'BACKUP_COMPLETE',
      resource: 'Database',
      details: 'Sauvegarde automatique de la base de données terminée',
      severity: 'INFO',
      category: 'System',
      ipAddress: 'localhost',
      userAgent: 'System Process',
      status: 'Success'
    },
    {
      id: 5,
      timestamp: '2025-02-19 14:10:55',
      user: 'sophie.martin@finances.dz',
      action: 'EXPORT_DATA',
      resource: 'Financial Reports',
      details: 'Export de 1,250 rapports financiers au format Excel',
      severity: 'MEDIUM',
      category: 'Data Export',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Windows NT)',
      status: 'Success'
    },
    {
      id: 6,
      timestamp: '2025-02-19 14:05:12',
      user: 'unknown',
      action: 'INTRUSION_ATTEMPT',
      resource: 'Admin Panel',
      details: 'Tentative d\'accès non autorisé au panneau d\'administration',
      severity: 'CRITICAL',
      category: 'Security',
      ipAddress: '85.123.45.67',
      userAgent: 'curl/7.68.0',
      status: 'Blocked'
    },
    {
      id: 7,
      timestamp: '2025-02-19 14:00:08',
      user: 'karim.hadj@travail.dz',
      action: 'UPDATE_PERMISSIONS',
      resource: 'User Role: Editor',
      details: 'Modification des permissions pour le rôle Éditeur',
      severity: 'HIGH',
      category: 'Permission Management',
      ipAddress: '192.168.1.110',
      userAgent: 'Mozilla/5.0 (Linux)',
      status: 'Success'
    },
    {
      id: 8,
      timestamp: '2025-02-19 13:55:33',
      user: 'fatima.zohra@education.dz',
      action: 'CREATE_USER',
      resource: 'User Account',
      details: 'Création d\'un nouveau compte utilisateur: nouvel.utilisateur@education.dz',
      severity: 'MEDIUM',
      category: 'User Management',
      ipAddress: '192.168.1.115',
      userAgent: 'Mozilla/5.0 (macOS)',
      status: 'Success'
    }
  ];

  const intrusionDetections = [
    {
      id: 1,
      timestamp: '2025-02-19 14:30:00',
      type: 'Brute Force Attack',
      source: '85.123.45.67',
      target: '/admin/login',
      attempts: 15,
      severity: 'CRITICAL',
      status: 'Blocked',
      details: '15 tentatives de connexion en 2 minutes'
    },
    {
      id: 2,
      timestamp: '2025-02-19 14:15:00',
      type: 'Suspicious API Calls',
      source: '192.168.1.200',
      target: '/api/users',
      attempts: 50,
      severity: 'HIGH',
      status: 'Monitoring',
      details: 'Taux d\'appels API anormalement élevé'
    },
    {
      id: 3,
      timestamp: '2025-02-19 14:00:00',
      type: 'Unusual Data Access',
      source: '192.168.1.150',
      target: '/documents/sensitive',
      attempts: 1,
      severity: 'MEDIUM',
      status: 'Investigating',
      details: 'Accès à des documents sensibles en dehors des heures normales'
    },
    {
      id: 4,
      timestamp: '2025-02-19 13:45:00',
      type: 'SQL Injection Attempt',
      source: '203.45.67.123',
      target: '/search?q=',
      attempts: 3,
      severity: 'HIGH',
      status: 'Blocked',
      details: 'Tentatives d\'injection SQL détectées'
    },
    {
      id: 5,
      timestamp: '2025-02-19 13:30:00',
      type: 'Port Scanning',
      source: '95.87.123.45',
      target: 'Multiple Ports',
      attempts: 100,
      severity: 'MEDIUM',
      status: 'Blocked',
      details: 'Scan de ports détecté depuis une IP externe'
    }
  ];

  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    
    return matchesSearch && matchesAction && matchesSeverity;
  });

  const {
    currentData: paginatedAuditLogs,
    currentPage: auditCurrentPage,
    totalPages: auditTotalPages,
    itemsPerPage: auditItemsPerPage,
    totalItems: auditTotalItems,
    setCurrentPage: setAuditCurrentPage,
    setItemsPerPage: setAuditItemsPerPage
  } = usePagination({
    data: filteredAuditLogs,
    itemsPerPage: 5
  });

  const {
    currentData: paginatedIntrusions,
    currentPage: intrusionCurrentPage,
    totalPages: intrusionTotalPages,
    itemsPerPage: intrusionItemsPerPage,
    totalItems: intrusionTotalItems,
    setCurrentPage: setIntrusionCurrentPage,
    setItemsPerPage: setIntrusionItemsPerPage
  } = usePagination({
    data: intrusionDetections,
    itemsPerPage: 5
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'INFO': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Failed': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'Blocked': return <Shield className="w-4 h-4 text-red-600" />;
      case 'Monitoring': return <Eye className="w-4 h-4 text-yellow-600" />;
      case 'Investigating': return <Search className="w-4 h-4 text-orange-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN': return <LogIn className="w-4 h-4 text-green-600" />;
      case 'LOGOUT': return <LogOut className="w-4 h-4 text-blue-600" />;
      case 'FAILED_LOGIN': return <Lock className="w-4 h-4 text-red-600" />;
      case 'DELETE_DOCUMENT': return <FileText className="w-4 h-4 text-red-600" />;
      case 'CREATE_USER': return <UserPlus className="w-4 h-4 text-green-600" />;
      case 'UPDATE_PERMISSIONS': return <Settings className="w-4 h-4 text-orange-600" />;
      case 'EXPORT_DATA': return <Download className="w-4 h-4 text-blue-600" />;
      case 'BACKUP_COMPLETE': return <Database className="w-4 h-4 text-green-600" />;
      case 'INTRUSION_ATTEMPT': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{auditLogs.length}</p>
              <p className="text-sm text-gray-600">Événements audit</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {auditLogs.filter(log => log.severity === 'CRITICAL').length}
              </p>
              <p className="text-sm text-gray-600">Critiques</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {intrusionDetections.length}
              </p>
              <p className="text-sm text-gray-600">Intrusions détectées</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {auditLogs.filter(log => log.status === 'Success').length}
              </p>
              <p className="text-sm text-gray-600">Actions réussies</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Trail Complet */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Audit Trail Complet
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtres */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher dans les logs d'audit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Toutes les actions</option>
                <option value="LOGIN">Connexions</option>
                <option value="DELETE_DOCUMENT">Suppressions</option>
                <option value="CREATE_USER">Créations utilisateur</option>
                <option value="EXPORT_DATA">Exports de données</option>
                <option value="INTRUSION_ATTEMPT">Tentatives d'intrusion</option>
              </select>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Toutes les sévérités</option>
                <option value="CRITICAL">Critique</option>
                <option value="HIGH">Élevée</option>
                <option value="MEDIUM">Moyenne</option>
                <option value="INFO">Information</option>
              </select>
            </div>
          </div>

          {/* Liste des logs d'audit */}
          <div className="space-y-4">
            {paginatedAuditLogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-gray-50">
                      {getActionIcon(log.action)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{log.action}</h4>
                        <Badge className={getSeverityColor(log.severity)}>
                          {log.severity}
                        </Badge>
                        <Badge variant="outline">{log.category}</Badge>
                        {getStatusIcon(log.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{log.details}</p>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs text-gray-500">
                        <span><strong>Utilisateur:</strong> {log.user}</span>
                        <span><strong>Ressource:</strong> {log.resource}</span>
                        <span><strong>IP:</strong> {log.ipAddress}</span>
                        <span><strong>Horodatage:</strong> {log.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      Détails
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination pour les logs d'audit */}
          {filteredAuditLogs.length > 0 && (
            <div className="mt-6">
              <StandardPagination
                currentPage={auditCurrentPage}
                totalPages={auditTotalPages}
                totalItems={auditTotalItems}
                itemsPerPage={auditItemsPerPage}
                onPageChange={setAuditCurrentPage}
                onItemsPerPageChange={setAuditItemsPerPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Détection d'Intrusion Comportementale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Détection d'Intrusion Comportementale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedIntrusions.map((intrusion) => (
              <div key={intrusion.id} className="border rounded-lg p-4 bg-red-50 border-red-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-red-800">{intrusion.type}</h4>
                      <Badge className={getSeverityColor(intrusion.severity)}>
                        {intrusion.severity}
                      </Badge>
                      {getStatusIcon(intrusion.status)}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{intrusion.details}</p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs text-gray-600">
                      <span><strong>Source:</strong> {intrusion.source}</span>
                      <span><strong>Cible:</strong> {intrusion.target}</span>
                      <span><strong>Tentatives:</strong> {intrusion.attempts}</span>
                      <span><strong>Horodatage:</strong> {intrusion.timestamp}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Bloquer IP
                    </Button>
                    <Button size="sm" variant="outline">
                      Enquêter
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination pour les intrusions */}
          {intrusionDetections.length > 0 && (
            <div className="mt-6">
              <StandardPagination
                currentPage={intrusionCurrentPage}
                totalPages={intrusionTotalPages}
                totalItems={intrusionTotalItems}
                itemsPerPage={intrusionItemsPerPage}
                onPageChange={setIntrusionCurrentPage}
                onItemsPerPageChange={setIntrusionItemsPerPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}