'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Calendar, Target, Sparkles } from 'lucide-react';
import {
  Goal,
  GoalCategory,
  CreateGoalInput,
  UpdateGoalInput,
  Milestone,
} from '@/hooks/use-ai-guidance';

interface GoalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: Goal | null;
  studentId: string;
  onSubmit: (data: CreateGoalInput | UpdateGoalInput) => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

interface FormData {
  title: string;
  description: string;
  category: GoalCategory;
  targetDate: string;
  targetValue: string;
  currentValue: string;
  unit: string;
  milestones: Milestone[];
}

const initialFormData: FormData = {
  title: '',
  description: '',
  category: GoalCategory.ACADEMIC,
  targetDate: '',
  targetValue: '',
  currentValue: '',
  unit: '',
  milestones: [],
};

export function GoalForm({
  open,
  onOpenChange,
  goal,
  studentId,
  onSubmit,
  isLoading,
  mode,
}: GoalFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [newMilestone, setNewMilestone] = useState('');
  const [showMilestones, setShowMilestones] = useState(false);

  // Initialize form with goal data when editing
  useEffect(() => {
    if (mode === 'edit' && goal) {
      setFormData({
        title: goal.title,
        description: goal.description || '',
        category: goal.category as GoalCategory,
        targetDate: goal.targetDate ? goal.targetDate.split('T')[0] : '',
        targetValue: goal.targetValue?.toString() || '',
        currentValue: goal.currentValue?.toString() || '',
        unit: goal.unit || '',
        milestones: goal.milestones || [],
      });
      setShowMilestones((goal.milestones?.length || 0) > 0);
    } else {
      setFormData(initialFormData);
      setShowMilestones(false);
    }
  }, [mode, goal, open]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value as GoalCategory }));
  };

  const handleAddMilestone = () => {
    if (newMilestone.trim()) {
      setFormData((prev) => ({
        ...prev,
        milestones: [
          ...prev.milestones,
          { title: newMilestone.trim(), completed: false },
        ],
      }));
      setNewMilestone('');
    }
  };

  const handleRemoveMilestone = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'create') {
      const createData: CreateGoalInput = {
        studentId,
        title: formData.title,
        description: formData.description || undefined,
        category: formData.category,
        targetDate: formData.targetDate || undefined,
        targetValue: formData.targetValue ? parseFloat(formData.targetValue) : undefined,
        currentValue: formData.currentValue ? parseFloat(formData.currentValue) : undefined,
        unit: formData.unit || undefined,
        milestones: formData.milestones.length > 0 ? formData.milestones : undefined,
      };
      onSubmit(createData);
    } else {
      const updateData: UpdateGoalInput = {
        title: formData.title,
        description: formData.description || undefined,
        targetDate: formData.targetDate || undefined,
        targetValue: formData.targetValue ? parseFloat(formData.targetValue) : undefined,
        currentValue: formData.currentValue ? parseFloat(formData.currentValue) : undefined,
        milestones: formData.milestones.length > 0 ? formData.milestones : undefined,
      };
      onSubmit(updateData);
    }
  };

  const isValid = formData.title.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {mode === 'create' ? 'Create New Goal' : 'Edit Goal'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create'
                ? 'Set a new goal to track your progress'
                : 'Update your goal details'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Complete AWS Certification"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your goal and why it matters"
                rows={2}
              />
            </div>

            {/* Category & Target Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={handleCategoryChange}
                  disabled={mode === 'edit'}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={GoalCategory.ACADEMIC}>Academic</SelectItem>
                    <SelectItem value={GoalCategory.CAREER}>Career</SelectItem>
                    <SelectItem value={GoalCategory.SKILL}>Skill</SelectItem>
                    <SelectItem value={GoalCategory.EXTRACURRICULAR}>
                      Extracurricular
                    </SelectItem>
                    <SelectItem value={GoalCategory.PERSONAL}>Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetDate">Target Date</Label>
                <div className="relative">
                  <Input
                    id="targetDate"
                    name="targetDate"
                    type="date"
                    value={formData.targetDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>

            {/* Target Value & Unit */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetValue">Target Value</Label>
                <Input
                  id="targetValue"
                  name="targetValue"
                  type="number"
                  value={formData.targetValue}
                  onChange={handleInputChange}
                  placeholder="e.g., 100"
                  min="0"
                  step="any"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  placeholder="e.g., problems, hours"
                />
              </div>
            </div>

            {/* Current Value (for editing) */}
            {mode === 'edit' && formData.targetValue && (
              <div className="space-y-2">
                <Label htmlFor="currentValue">Current Progress</Label>
                <Input
                  id="currentValue"
                  name="currentValue"
                  type="number"
                  value={formData.currentValue}
                  onChange={handleInputChange}
                  placeholder="e.g., 50"
                  min="0"
                  step="any"
                />
              </div>
            )}

            {/* Milestones Toggle */}
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label>Add Milestones</Label>
                <p className="text-xs text-muted-foreground">
                  Break your goal into smaller steps
                </p>
              </div>
              <Switch
                checked={showMilestones}
                onCheckedChange={setShowMilestones}
              />
            </div>

            {/* Milestones */}
            {showMilestones && (
              <div className="space-y-3 p-3 rounded-lg border bg-muted/30">
                <div className="flex gap-2">
                  <Input
                    value={newMilestone}
                    onChange={(e) => setNewMilestone(e.target.value)}
                    placeholder="Add a milestone"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddMilestone();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleAddMilestone}
                    disabled={!newMilestone.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.milestones.length > 0 && (
                  <div className="space-y-2">
                    {formData.milestones.map((milestone, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded bg-background"
                      >
                        <span className="text-sm">{milestone.title}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleRemoveMilestone(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {formData.milestones.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No milestones added yet
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || isLoading}>
              {isLoading
                ? mode === 'create'
                  ? 'Creating...'
                  : 'Saving...'
                : mode === 'create'
                  ? 'Create Goal'
                  : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default GoalForm;
