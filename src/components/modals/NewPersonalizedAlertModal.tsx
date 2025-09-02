import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Bell, Plus, Settings, Users, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NewPersonalizedAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PersonalizedAlert {
  name: string;
  description: string;
  type: 'custom' | 'threshold' | 'pattern' | 'schedule';
  severity: 'low' | 'medium' | 'high' | 'critical';
  conditions: {
    field: string;
    operator: string;
    value: string;
    timeWindow: string;
  }[];
  actions: {
    type: string;
    config: Record<string, any>;
  }[];
  recipients: string[];
  enabled: boolean;
}

export const NewPersonalizedAlertModal: React.FC<NewPersonalizedAlertModalProps> = ({
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<PersonalizedAlert>({
    name: '',
    description: '',
    type: 'custom',
    severity: 'medium',
    conditions: [{
      field: '',
      operator: 'equals',
      value: '',
      timeWindow: '5m'
    }],
    actions: [{
      type: 'email',
      config: { recipients: [] }
    }],
    recipients: [],
    enabled: true
  });

  const handleAddCondition = () => {
    setAlert({
      ...alert,
      conditions: [...alert.conditions, {
        field: '',
        operator: 'equals',
        value: '',
        timeWindow: '5m'
      }]
    });
  };

  const handleRemoveCondition = (index: number) => {
    setAlert({
      ...alert,
      conditions: alert.conditions.filter((_, i) => i !== index)
    });
  };

  const handleConditionChange = (index: number, field: string, value: string) => {
    const newConditions = [...alert.conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setAlert({ ...alert, conditions: newConditions });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Alert created',
        description: 'Personalized alert has been created successfully.',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create personalized alert.',
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
            Create Personalized Alert
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="recipients">Recipients</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Alert Name</Label>
                <Input
                  id="name"
                  value={alert.name}
                  onChange={(e) => setAlert({ ...alert, name: e.target.value })}
                  placeholder="Enter alert name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Alert Type</Label>
                <Select value={alert.type} onValueChange={(value: any) => setAlert({ ...alert, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom</SelectItem>
                    <SelectItem value="threshold">Threshold</SelectItem>
                    <SelectItem value="pattern">Pattern</SelectItem>
                    <SelectItem value="schedule">Schedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={alert.description}
                onChange={(e) => setAlert({ ...alert, description: e.target.value })}
                placeholder="Enter alert description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity Level</Label>
              <Select value={alert.severity} onValueChange={(value: any) => setAlert({ ...alert, severity: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="conditions" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Alert Conditions</Label>
              <Button variant="outline" size="sm" onClick={handleAddCondition}>
                <Plus className="h-4 w-4 mr-1" />
                Add Condition
              </Button>
            </div>

            {alert.conditions.map((condition, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Condition {index + 1}</Badge>
                  {alert.conditions.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveCondition(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Field</Label>
                    <Input
                      value={condition.field}
                      onChange={(e) => handleConditionChange(index, 'field', e.target.value)}
                      placeholder="e.g., temperature, count"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Operator</Label>
                    <Select value={condition.operator} onValueChange={(value) => handleConditionChange(index, 'operator', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="greater_than">Greater than</SelectItem>
                        <SelectItem value="less_than">Less than</SelectItem>
                        <SelectItem value="contains">Contains</SelectItem>
                        <SelectItem value="not_equals">Not equals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Value</Label>
                    <Input
                      value={condition.value}
                      onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                      placeholder="Enter value"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time Window</Label>
                    <Select value={condition.timeWindow} onValueChange={(value) => handleConditionChange(index, 'timeWindow', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1m">1 minute</SelectItem>
                        <SelectItem value="5m">5 minutes</SelectItem>
                        <SelectItem value="15m">15 minutes</SelectItem>
                        <SelectItem value="1h">1 hour</SelectItem>
                        <SelectItem value="1d">1 day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <div className="space-y-2">
              <Label>Alert Actions</Label>
              <div className="space-y-4">
                {['email', 'webhook', 'slack', 'sms'].map((actionType) => (
                  <div key={actionType} className="flex items-center space-x-2">
                    <Checkbox
                      id={actionType}
                      checked={alert.actions.some(a => a.type === actionType)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setAlert({
                            ...alert,
                            actions: [...alert.actions, { type: actionType, config: {} }]
                          });
                        } else {
                          setAlert({
                            ...alert,
                            actions: alert.actions.filter(a => a.type !== actionType)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={actionType} className="capitalize">{actionType}</Label>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recipients" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipients">Recipients (comma-separated emails)</Label>
              <Textarea
                id="recipients"
                value={alert.recipients.join(', ')}
                onChange={(e) => setAlert({ ...alert, recipients: e.target.value.split(',').map(r => r.trim()).filter(r => r) })}
                placeholder="user1@example.com, user2@example.com"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="enabled"
                checked={alert.enabled}
                onCheckedChange={(checked) => setAlert({ ...alert, enabled: Boolean(checked) })}
              />
              <Label htmlFor="enabled">Enable alert immediately</Label>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Alert'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};