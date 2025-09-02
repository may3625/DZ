import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Bell, Settings, Users, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AlertsConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AlertConfig {
  id: string;
  name: string;
  description: string;
  type: 'info' | 'warning' | 'error' | 'success';
  channels: string[];
  schedule: {
    enabled: boolean;
    frequency: string;
    time: string;
  };
  conditions: {
    threshold: number;
    operator: string;
    field: string;
  };
  recipients: string[];
  enabled: boolean;
}

export const AlertsConfigurationModal: React.FC<AlertsConfigurationModalProps> = ({
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<AlertConfig>({
    id: '',
    name: '',
    description: '',
    type: 'info',
    channels: ['email'],
    schedule: {
      enabled: false,
      frequency: 'daily',
      time: '09:00'
    },
    conditions: {
      threshold: 0,
      operator: 'greater_than',
      field: 'value'
    },
    recipients: [],
    enabled: true
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Configuration saved',
        description: 'Alert configuration has been updated successfully.',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save alert configuration.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alert Configuration
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="recipients">Recipients</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Alert Name</Label>
                <Input
                  id="name"
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  placeholder="Enter alert name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Alert Type</Label>
                <Select value={config.type} onValueChange={(value: any) => setConfig({ ...config, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={config.description}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                placeholder="Enter alert description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Notification Channels</Label>
              <div className="flex gap-4">
                {['email', 'sms', 'webhook', 'slack'].map((channel) => (
                  <div key={channel} className="flex items-center space-x-2">
                    <Checkbox
                      id={channel}
                      checked={config.channels.includes(channel)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setConfig({ ...config, channels: [...config.channels, channel] });
                        } else {
                          setConfig({ ...config, channels: config.channels.filter(c => c !== channel) });
                        }
                      }}
                    />
                    <Label htmlFor={channel} className="capitalize">{channel}</Label>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="conditions" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="field">Field</Label>
                <Select value={config.conditions.field} onValueChange={(value) => setConfig({ ...config, conditions: { ...config.conditions, field: value } })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="value">Value</SelectItem>
                    <SelectItem value="count">Count</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="operator">Operator</Label>
                <Select value={config.conditions.operator} onValueChange={(value) => setConfig({ ...config, conditions: { ...config.conditions, operator: value } })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="greater_than">Greater than</SelectItem>
                    <SelectItem value="less_than">Less than</SelectItem>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="threshold">Threshold</Label>
                <Input
                  id="threshold"
                  type="number"
                  value={config.conditions.threshold}
                  onChange={(e) => setConfig({ ...config, conditions: { ...config.conditions, threshold: Number(e.target.value) } })}
                  placeholder="0"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="schedule-enabled"
                checked={config.schedule.enabled}
                onCheckedChange={(checked) => setConfig({ ...config, schedule: { ...config.schedule, enabled: Boolean(checked) } })}
              />
              <Label htmlFor="schedule-enabled">Enable scheduled alerts</Label>
            </div>

            {config.schedule.enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select value={config.schedule.frequency} onValueChange={(value) => setConfig({ ...config, schedule: { ...config.schedule, frequency: value } })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={config.schedule.time}
                    onChange={(e) => setConfig({ ...config, schedule: { ...config.schedule, time: e.target.value } })}
                  />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recipients" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipients">Recipients (comma-separated emails)</Label>
              <Textarea
                id="recipients"
                value={config.recipients.join(', ')}
                onChange={(e) => setConfig({ ...config, recipients: e.target.value.split(',').map(r => r.trim()).filter(r => r) })}
                placeholder="user1@example.com, user2@example.com"
                rows={3}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};