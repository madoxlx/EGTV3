import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Feature {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  active?: boolean;
}

interface InlineFeatureManagerProps {
  featureType: 'facilities' | 'highlights' | 'cleanliness-features' | 'categories';
  selectedFeatures: number[];
  onSelectionChange: (selectedIds: number[]) => void;
  label: string;
}

export default function InlineFeatureManager({ 
  featureType, 
  selectedFeatures, 
  onSelectionChange, 
  label 
}: InlineFeatureManagerProps) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newFeature, setNewFeature] = useState({ name: '', description: '', icon: '' });
  const { toast } = useToast();

  const apiEndpoint = featureType === 'cleanliness-features' 
    ? `/api/admin/cleanliness-features`
    : `/api/admin/hotel-${featureType}`;

  useEffect(() => {
    fetchFeatures();
  }, [featureType]);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const response = await fetch(apiEndpoint, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        console.log(`Loaded ${featureType}:`, data);
        setFeatures(data);
      } else {
        console.error(`Failed to fetch ${featureType}, status:`, response.status);
      }
    } catch (error) {
      console.error(`Error fetching ${featureType}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureToggle = (featureId: number, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedFeatures, featureId]);
    } else {
      onSelectionChange(selectedFeatures.filter(id => id !== featureId));
    }
  };

  const handleCreateFeature = async () => {
    if (!newFeature.name.trim()) {
      toast({
        title: "Error",
        description: "Feature name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFeature.name,
          description: newFeature.description,
          icon: newFeature.icon,
          active: true
        })
      });

      if (response.ok) {
        const createdFeature = await response.json();
        setFeatures([...features, createdFeature]);
        onSelectionChange([...selectedFeatures, createdFeature.id]);
        setNewFeature({ name: '', description: '', icon: '' });
        setIsCreating(false);
        toast({
          title: "Success",
          description: `${label} created successfully`
        });
      }
    } catch (error) {
      console.error(`Error creating ${featureType}:`, error);
      toast({
        title: "Error",
        description: `Failed to create ${label ? label.toLowerCase() : 'feature'}`,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div>Loading {label ? label.toLowerCase() : 'features'}...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">{label}</Label>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New {label}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={newFeature.name}
                  onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
                  placeholder={`Enter ${label ? label.toLowerCase() : 'feature'} name`}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newFeature.description}
                  onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                  placeholder={`Enter ${label ? label.toLowerCase() : 'feature'} description`}
                />
              </div>
              <div>
                <Label htmlFor="icon">Icon</Label>
                <Input
                  id="icon"
                  value={newFeature.icon}
                  onChange={(e) => setNewFeature({ ...newFeature, icon: e.target.value })}
                  placeholder="Icon name or emoji"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={handleCreateFeature}>
                  Create
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
        {features.map((feature) => (
          <div key={feature.id} className="flex items-center space-x-2 p-2 border rounded">
            <Checkbox
              id={`feature-${feature.id}`}
              checked={selectedFeatures.includes(feature.id)}
              onCheckedChange={(checked) => handleFeatureToggle(feature.id, !!checked)}
            />
            <label
              htmlFor={`feature-${feature.id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
            >
              {feature.icon && <span className="mr-1">{feature.icon}</span>}
              {feature.name}
            </label>
          </div>
        ))}
      </div>

      {features.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No {label.toLowerCase()} available. Create your first one above.
        </p>
      )}
    </div>
  );
}

