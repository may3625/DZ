import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState([
    { field: '', operator: 'equals', value: '' }
  ]);

  const addFilter = () => {
    setFilters([...filters, { field: '', operator: 'equals', value: '' }]);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, field: string, value: string) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], [field]: value };
    setFilters(newFilters);
  };

  const handleApply = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({ title: 'Filters applied successfully' });
      onClose();
    } catch (error) {
      toast({ title: 'Error applying filters', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search Filters
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {filters.map((filter, index) => (
            <div key={index} className="grid grid-cols-3 gap-2 items-end">
              <div className="space-y-2">
                <Label>Field</Label>
                <Input
                  value={filter.field}
                  onChange={(e) => updateFilter(index, 'field', e.target.value)}
                  placeholder="e.g., title"
                />
              </div>
              <div className="space-y-2">
                <Label>Operator</Label>
                <Select value={filter.operator} onValueChange={(value) => updateFilter(index, 'operator', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="starts_with">Starts with</SelectItem>
                    <SelectItem value="ends_with">Ends with</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Value</Label>
                <div className="flex gap-2">
                  <Input
                    value={filter.value}
                    onChange={(e) => updateFilter(index, 'value', e.target.value)}
                    placeholder="Enter value"
                  />
                  {filters.length > 1 && (
                    <Button variant="outline" size="sm" onClick={() => removeFilter(index)}>
                      ×
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addFilter}>
            <Plus className="h-4 w-4 mr-1" />
            Add Filter
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleApply} disabled={isLoading}>
            {isLoading ? 'Applying...' : 'Apply Filters'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};