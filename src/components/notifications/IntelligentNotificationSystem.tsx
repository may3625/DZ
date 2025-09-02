import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Bell, BellOff, Settings, CheckCircle, XCircle, 
  AlertTriangle, Info, Clock, User, FileText,
  MessageSquare, Calendar, Star, Eye, EyeOff
} from "lucide-react";
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

interface NotificationConfig {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'urgent';
  title: string;
  message: string;
  category: 'workflow' | 'security' | 'system' | 'user' | 'legal' | 'procedure';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  actionable: boolean;
  actionUrl?: string;
  actionText?: string;
  createdAt: Date;
  expiresAt?: Date;
  sender?: string;
  senderAvatar?: string;
  metadata?: Record<string, any>;
  tags?: string[];
}

interface NotificationPreferences {
  enabled: boolean;
  email: boolean;
  push: boolean;
  inApp: boolean;
  categories: {
    workflow: boolean;
    security: boolean;
    system: boolean;
    user: boolean;
    legal: boolean;
    procedure: boolean;
  };
  priority: {
    low: boolean;
    medium: boolean;
    high: boolean;
    urgent: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

interface IntelligentNotificationSystemProps {
  notifications?: NotificationConfig[];
  preferences?: NotificationPreferences;
  onMarkAsRead?: (notificationId: string) => Promise<void>;
  onMarkAllAsRead?: () => Promise<void>;
  onDelete?: (notificationId: string) => Promise<void>;
  onAction?: (notificationId: string, action: string) => Promise<void>;
  onPreferencesChange?: (preferences: NotificationPreferences) => Promise<void>;
}

export function IntelligentNotificationSystem({
  notifications = [],
  preferences,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onAction,
  onPreferencesChange
}: IntelligentNotificationSystemProps) {
  const [localNotifications, setLocalNotifications] = useState<NotificationConfig[]>(notifications);
  const [localPreferences, setLocalPreferences] = useState<NotificationPreferences>(
    preferences || {
      enabled: true,
      email: true,
      push: true,
      inApp: true,
      categories: {
        workflow: true,
        security: true,
        system: true,
        user: true,
        legal: true,
        procedure: true
      },
      priority: {
        low: true,
        medium: true,
        high: true,
        urgent: true
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    }
  );
  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent' | 'workflow'>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLocalNotifications(notifications);
  }, [notifications]);

  const getNotificationIcon = (type: NotificationConfig['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'urgent':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getNotificationColor = (type: NotificationConfig['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'urgent':
        return 'border-red-200 bg-red-50';
      case 'info':
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getPriorityColor = (priority: NotificationConfig['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: NotificationConfig['category']) => {
    switch (category) {
      case 'workflow':
        return <FileText className="h-4 w-4" />;
      case 'security':
        return <AlertTriangle className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
      case 'legal':
        return <FileText className="h-4 w-4" />;
      case 'procedure':
        return <FileText className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const isInQuietHours = () => {
    if (!localPreferences.quietHours.enabled) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMinute] = localPreferences.quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = localPreferences.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Période qui traverse minuit
      return currentTime >= startTime || currentTime <= endTime;
    }
  };

  const shouldShowNotification = (notification: NotificationConfig) => {
    // Vérifier les préférences de catégorie
    if (!localPreferences.categories[notification.category]) return false;
    
    // Vérifier les préférences de priorité
    if (!localPreferences.priority[notification.priority]) return false;
    
    // Vérifier les heures silencieuses
    if (isInQuietHours() && notification.priority !== 'urgent') return false;
    
    // Vérifier l'expiration
    if (notification.expiresAt && new Date() > notification.expiresAt) return false;
    
    return true;
  };

  const filteredNotifications = localNotifications.filter(notification => {
    if (!shouldShowNotification(notification)) return false;
    
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'urgent':
        return notification.priority === 'urgent';
      case 'workflow':
        return notification.category === 'workflow';
      default:
        return true;
    }
  });

  const handleMarkAsRead = async (notificationId: string) => {
    setLoading(true);
    try {
      if (onMarkAsRead) {
        await onMarkAsRead(notificationId);
      }
      
      setLocalNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      
      logger.info('SYSTEM', 'Notification marquée comme lue', { notificationId }, 'IntelligentNotificationSystem');
    } catch (error) {
      logger.error('SYSTEM', 'Erreur lors du marquage comme lue', { notificationId, error }, 'IntelligentNotificationSystem');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      if (onMarkAllAsRead) {
        await onMarkAllAsRead();
      }
      
      setLocalNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      
      logger.info('SYSTEM', 'Toutes les notifications marquées comme lues', {}, 'IntelligentNotificationSystem');
    } catch (error) {
      logger.error('SYSTEM', 'Erreur lors du marquage de toutes les notifications', { error }, 'IntelligentNotificationSystem');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (notificationId: string) => {
    setLoading(true);
    try {
      if (onDelete) {
        await onDelete(notificationId);
      }
      
      setLocalNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      logger.info('SYSTEM', 'Notification supprimée', { notificationId }, 'IntelligentNotificationSystem');
    } catch (error) {
      logger.error('SYSTEM', 'Erreur lors de la suppression', { notificationId, error }, 'IntelligentNotificationSystem');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (notificationId: string, action: string) => {
    setLoading(true);
    try {
      if (onAction) {
        await onAction(notificationId, action);
      }
      
      // Marquer comme lue après action
      await handleMarkAsRead(notificationId);
      
      logger.info('SYSTEM', 'Action de notification exécutée', { notificationId, action }, 'IntelligentNotificationSystem');
    } catch (error) {
      logger.error('SYSTEM', 'Erreur lors de l\'action', { notificationId, action, error }, 'IntelligentNotificationSystem');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesChange = async (newPreferences: Partial<NotificationPreferences>) => {
    const updatedPreferences = { ...localPreferences, ...newPreferences };
    setLocalPreferences(updatedPreferences);
    
    try {
      if (onPreferencesChange) {
        await onPreferencesChange(updatedPreferences);
      }
      
      logger.info('SYSTEM', 'Préférences de notification mises à jour', { preferences: updatedPreferences }, 'IntelligentNotificationSystem');
    } catch (error) {
      logger.error('SYSTEM', 'Erreur lors de la mise à jour des préférences', { error }, 'IntelligentNotificationSystem');
    }
  };

  const unreadCount = localNotifications.filter(n => !n.read && shouldShowNotification(n)).length;
  const urgentCount = localNotifications.filter(n => n.priority === 'urgent' && shouldShowNotification(n)).length;

  return (
    <div className="space-y-4">
      {/* En-tête avec statistiques */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-lg">Notifications Intelligentes</CardTitle>
                <CardDescription>
                  {unreadCount} non lue{unreadCount > 1 ? 's' : ''} • {urgentCount} urgent{urgentCount > 1 ? 's' : ''}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={loading}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Tout marquer comme lu
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        {/* Filtres */}
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'Toutes', count: filteredNotifications.length },
              { key: 'unread', label: 'Non lues', count: unreadCount },
              { key: 'urgent', label: 'Urgentes', count: urgentCount },
              { key: 'workflow', label: 'Workflow', count: localNotifications.filter(n => n.category === 'workflow').length }
            ].map(({ key, label, count }) => (
              <Button
                key={key}
                size="sm"
                variant={filter === key ? 'default' : 'outline'}
                onClick={() => setFilter(key as any)}
                className="flex items-center space-x-1"
              >
                <span>{label}</span>
                {count > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Paramètres */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Paramètres des Notifications</CardTitle>
            <CardDescription>
              Personnalisez vos préférences de notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Canaux de notification</h4>
                <div className="space-y-2">
                  {[
                    { key: 'email', label: 'Email' },
                    { key: 'push', label: 'Push' },
                    { key: 'inApp', label: 'Dans l\'application' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={localPreferences[key as keyof typeof localPreferences] as boolean}
                        onChange={(e) => handlePreferencesChange({ [key]: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Catégories</h4>
                <div className="space-y-2">
                  {Object.entries(localPreferences.categories).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handlePreferencesChange({
                          categories: { ...localPreferences.categories, [key]: e.target.checked }
                        })}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{key}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Heures silencieuses</h4>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={localPreferences.quietHours.enabled}
                    onChange={(e) => handlePreferencesChange({
                      quietHours: { ...localPreferences.quietHours, enabled: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <span className="text-sm">Activer</span>
                </label>
                
                {localPreferences.quietHours.enabled && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={localPreferences.quietHours.start}
                      onChange={(e) => handlePreferencesChange({
                        quietHours: { ...localPreferences.quietHours, start: e.target.value }
                      })}
                      className="border rounded px-2 py-1 text-sm"
                    />
                    <span className="text-sm">à</span>
                    <input
                      type="time"
                      value={localPreferences.quietHours.end}
                      onChange={(e) => handlePreferencesChange({
                        quietHours: { ...localPreferences.quietHours, end: e.target.value }
                      })}
                      className="border rounded px-2 py-1 text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des notifications */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <BellOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune notification à afficher</p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`${getNotificationColor(notification.type)} ${
                !notification.read ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{notification.title}</h4>
                        <Badge className={getPriorityColor(notification.priority)}>
                          {notification.priority.toUpperCase()}
                        </Badge>
                        {getCategoryIcon(notification.category)}
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                        <span className="text-xs text-gray-500">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">{notification.message}</p>
                    
                    {notification.sender && (
                      <div className="flex items-center space-x-2 mb-3">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={notification.senderAvatar} />
                          <AvatarFallback>{notification.sender.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-500">
                          Par {notification.sender}
                        </span>
                      </div>
                    )}
                    
                    {notification.tags && notification.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {notification.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={loading}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Marquer comme lu
                          </Button>
                        )}
                        
                        {notification.actionable && notification.actionText && (
                          <Button
                            size="sm"
                            onClick={() => handleAction(notification.id, 'primary')}
                            disabled={loading}
                          >
                            {notification.actionText}
                          </Button>
                        )}
                      </div>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(notification.id)}
                        disabled={loading}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// Hook pour utiliser le système de notifications
export function useIntelligentNotifications() {
  const [notifications, setNotifications] = useState<NotificationConfig[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: true,
    email: true,
    push: true,
    inApp: true,
    categories: {
      workflow: true,
      security: true,
      system: true,
      user: true,
      legal: true,
      procedure: true
    },
    priority: {
      low: true,
      medium: true,
      high: true,
      urgent: true
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });

  const addNotification = useCallback((notification: Omit<NotificationConfig, 'id' | 'createdAt'>) => {
    const newNotification: NotificationConfig = {
      ...notification,
      id: `notification-${Date.now()}`,
      createdAt: new Date()
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    logger.info('SYSTEM', 'Notification ajoutée', { notificationId: newNotification.id }, 'IntelligentNotifications');
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  return {
    notifications,
    preferences,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    setPreferences
  };
}