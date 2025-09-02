import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  Settings, 
  Share2, 
  BarChart3, 
  Calendar,
  Download,
  RefreshCw,
  Clock,
  Users,
  Mail,
  Link,
  Shield,
  FileText
} from 'lucide-react';

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

export function DashboardViewModal({ isOpen, onClose, data }: DashboardModalProps) {
  if (!data?.dashboard) return null;

  const { dashboard, widgets, metrics } = data;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            {dashboard.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Vues totales</div>
              <div className="text-2xl font-bold text-primary">{metrics.views}</div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Dernière modification</div>
              <div className="text-2xl font-bold text-primary">{metrics.lastModified}</div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Statut</div>
              <div className="text-2xl font-bold text-primary">
                {metrics.isDefault ? 'Principal' : 'Personnalisé'}
              </div>
            </div>
          </div>

          {/* Widgets actifs */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Widgets actifs ({widgets.length})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {widgets.map((widget: string, index: number) => (
                <Badge key={index} variant="outline" className="justify-center p-2">
                  {widget}
                </Badge>
              ))}
            </div>
          </div>

          {/* Aperçu des données */}
          <div>
            <h4 className="font-semibold mb-3">Aperçu des données</h4>
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Données simulées du tableau de bord</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>Recherches aujourd'hui: <span className="font-medium">47</span></div>
                <div>Documents consultés: <span className="font-medium">23</span></div>
                <div>Notifications non lues: <span className="font-medium">5</span></div>
                <div>Activité cette semaine: <span className="font-medium">156</span></div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button onClick={() => {
            const event = new CustomEvent('show-toast', {
              detail: {
                type: 'info',
                title: 'Ouverture du tableau de bord',
                description: 'Le tableau de bord s\'ouvre dans un nouvel onglet'
              }
            });
            window.dispatchEvent(event);
            onClose();
          }}>
            <Eye className="w-4 h-4 mr-2" />
            Ouvrir le tableau de bord
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DashboardEditModal({ isOpen, onClose, data }: DashboardModalProps) {
  const [formData, setFormData] = useState({
    name: data?.dashboard?.name || '',
    description: data?.dashboard?.description || '',
    selectedWidgets: data?.dashboard?.widgets || []
  });

  if (!data?.dashboard) return null;

  const { availableWidgets } = data;

  const handleSave = () => {
    const event = new CustomEvent('show-toast', {
      detail: {
        type: 'success',
        title: 'Tableau de bord modifié',
        description: 'Les modifications ont été sauvegardées avec succès'
      }
    });
    window.dispatchEvent(event);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Modifier le tableau de bord
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nom du tableau de bord</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nom du tableau de bord"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description du tableau de bord"
              rows={3}
            />
          </div>

          <div>
            <Label>Widgets disponibles</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {availableWidgets?.map((widget: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`widget-${index}`}
                    checked={formData.selectedWidgets.includes(widget)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          selectedWidgets: [...prev.selectedWidgets, widget]
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          selectedWidgets: prev.selectedWidgets.filter(w => w !== widget)
                        }));
                      }
                    }}
                  />
                  <Label htmlFor={`widget-${index}`} className="text-sm">
                    {widget}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            Sauvegarder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DashboardSettingsModal({ isOpen, onClose, data }: DashboardModalProps) {
  const [settings, setSettings] = useState(data?.settings || {});

  if (!data?.dashboard) return null;

  const handleSave = () => {
    const event = new CustomEvent('show-toast', {
      detail: {
        type: 'success',
        title: 'Paramètres sauvegardés',
        description: 'Les paramètres du tableau de bord ont été mis à jour'
      }
    });
    window.dispatchEvent(event);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Paramètres: {data.dashboard.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="refresh">Actualisation</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Sauvegarde automatique</Label>
                <p className="text-sm text-muted-foreground">
                  Sauvegarder automatiquement les modifications
                </p>
              </div>
              <Switch 
                checked={settings.autoSave}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, autoSave: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir des notifications pour ce tableau de bord
                </p>
              </div>
              <Switch 
                checked={settings.notifications}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, notifications: checked }))
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="refresh" className="space-y-4">
            <div>
              <Label>Intervalle d'actualisation</Label>
              <Select 
                value={settings.refreshInterval}
                onValueChange={(value) => 
                  setSettings(prev => ({ ...prev, refreshInterval: value }))
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Sélectionner un intervalle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1min">1 minute</SelectItem>
                  <SelectItem value="5min">5 minutes</SelectItem>
                  <SelectItem value="15min">15 minutes</SelectItem>
                  <SelectItem value="30min">30 minutes</SelectItem>
                  <SelectItem value="1h">1 heure</SelectItem>
                  <SelectItem value="manual">Manuel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <div>
              <Label>Formats d'export disponibles</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {settings.export?.formats?.map((format: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {format}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Planification d'export</Label>
              <Select 
                value={settings.export?.schedule}
                onValueChange={(value) => 
                  setSettings(prev => ({ 
                    ...prev, 
                    export: { ...prev.export, schedule: value }
                  }))
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Planification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manuel</SelectItem>
                  <SelectItem value="daily">Quotidien</SelectItem>
                  <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  <SelectItem value="monthly">Mensuel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            Sauvegarder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DashboardShareModal({ isOpen, onClose, data }: DashboardModalProps) {
  const [shareSettings, setShareSettings] = useState(data?.shareOptions || {});
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  if (!data?.dashboard) return null;

  const { users, shareOptions } = data;

  const handleShare = () => {
    const event = new CustomEvent('show-toast', {
      detail: {
        type: 'success',
        title: 'Tableau de bord partagé',
        description: `Partagé avec ${selectedUsers.length} utilisateur(s)`
      }
    });
    window.dispatchEvent(event);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Partager: {data.dashboard.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <div>
              <Label>Sélectionner les utilisateurs</Label>
              <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
                {users?.map((user: any) => (
                  <div key={user.id} className="flex items-center space-x-3 p-2 border rounded">
                    <input
                      type="checkbox"
                      id={`user-${user.id}`}
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(prev => [...prev, user.id]);
                        } else {
                          setSelectedUsers(prev => prev.filter(id => id !== user.id));
                        }
                      }}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      <div className="text-xs text-muted-foreground">{user.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div>
              <Label>Permissions</Label>
              <div className="space-y-2 mt-2">
                {shareOptions.permissions?.map((permission: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`perm-${index}`}
                      defaultChecked
                    />
                    <Label htmlFor={`perm-${index}`} className="text-sm">
                      {permission === 'view' ? 'Consulter' : 
                       permission === 'comment' ? 'Commenter' : 
                       permission === 'edit' ? 'Modifier' : permission}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Lien public</Label>
                <p className="text-sm text-muted-foreground">
                  Créer un lien public accessible sans connexion
                </p>
              </div>
              <Switch 
                checked={shareSettings.publicLink}
                onCheckedChange={(checked) => 
                  setShareSettings(prev => ({ ...prev, publicLink: checked }))
                }
              />
            </div>

            {shareOptions.expiration && (
              <div className="flex items-center justify-between">
                <div>
                  <Label>Expiration</Label>
                  <p className="text-sm text-muted-foreground">
                    Le partage expire automatiquement
                  </p>
                </div>
                <Switch 
                  checked={shareSettings.expiration?.enabled}
                  onCheckedChange={(checked) => 
                    setShareSettings(prev => ({ 
                      ...prev, 
                      expiration: { ...prev.expiration, enabled: checked }
                    }))
                  }
                />
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleShare} disabled={selectedUsers.length === 0}>
            <Share2 className="w-4 h-4 mr-2" />
            Partager ({selectedUsers.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}