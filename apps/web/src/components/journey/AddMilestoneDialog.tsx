'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Calendar, Plus, Star } from 'lucide-react';
import type { CreateMilestoneInput, MilestoneCategory, MilestoneType } from '@/hooks/use-student-journey';

interface AddMilestoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  onSubmit: (data: CreateMilestoneInput) => void;
  isLoading?: boolean;
}

const milestoneTypes: { value: MilestoneType; label: string }[] = [
  { value: 'award', label: 'Award / Achievement' },
  { value: 'certification', label: 'Certification' },
  { value: 'project_completion', label: 'Project Completion' },
  { value: 'event_participation', label: 'Event / Competition' },
  { value: 'club_leadership', label: 'Club Leadership' },
  { value: 'internship_start', label: 'Internship Started' },
  { value: 'internship_end', label: 'Internship Completed' },
  { value: 'dean_list', label: "Dean's List" },
  { value: 'backlog_cleared', label: 'Backlog Cleared' },
  { value: 'custom', label: 'Other' },
];

const milestoneCategories: { value: MilestoneCategory; label: string }[] = [
  { value: 'academic', label: 'Academic' },
  { value: 'career', label: 'Career' },
  { value: 'extracurricular', label: 'Extracurricular' },
  { value: 'achievement', label: 'Achievement' },
  { value: 'administrative', label: 'Administrative' },
];

const academicYears = [
  '2025-26',
  '2024-25',
  '2023-24',
  '2022-23',
];

const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

export function AddMilestoneDialog({
  open,
  onOpenChange,
  studentId,
  onSubmit,
  isLoading,
}: AddMilestoneDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    milestoneType: 'custom' as MilestoneType,
    category: 'achievement' as MilestoneCategory,
    occurredAt: new Date().toISOString().split('T')[0],
    academicYear: '2025-26',
    semester: 1,
    isPositive: true,
  });

  useEffect(() => {
    if (open) {
      // Reset form when opening
      setFormData({
        title: '',
        description: '',
        milestoneType: 'custom' as MilestoneType,
        category: 'achievement' as MilestoneCategory,
        occurredAt: new Date().toISOString().split('T')[0],
        academicYear: '2025-26',
        semester: 1,
        isPositive: true,
      });
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) return;

    const milestoneData: CreateMilestoneInput = {
      studentId,
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      milestoneType: formData.milestoneType,
      category: formData.category,
      occurredAt: new Date(formData.occurredAt).toISOString(),
      academicYear: formData.academicYear,
      semester: formData.semester,
      isPositive: formData.isPositive,
    };

    onSubmit(milestoneData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Add Milestone
          </DialogTitle>
          <DialogDescription>
            Record a new achievement or milestone in your journey
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Won first place in hackathon"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add more details about this milestone..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={3}
            />
          </div>

          {/* Type and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={formData.milestoneType}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    milestoneType: value as MilestoneType,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {milestoneTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: value as MilestoneCategory,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {milestoneCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="occurredAt">Date</Label>
            <Input
              id="occurredAt"
              type="date"
              value={formData.occurredAt}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, occurredAt: e.target.value }))
              }
            />
          </div>

          {/* Academic Year and Semester */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Academic Year</Label>
              <Select
                value={formData.academicYear}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, academicYear: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Semester</Label>
              <Select
                value={formData.semester.toString()}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, semester: parseInt(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((sem) => (
                    <SelectItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Positive toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <Label htmlFor="isPositive" className="text-sm font-medium">
                Positive Milestone
              </Label>
              <p className="text-xs text-muted-foreground">
                Mark as a positive achievement or accomplishment
              </p>
            </div>
            <Switch
              id="isPositive"
              checked={formData.isPositive}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isPositive: checked }))
              }
            />
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
            <Button type="submit" disabled={isLoading || !formData.title.trim()}>
              {isLoading ? (
                'Adding...'
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Milestone
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddMilestoneDialog;
