'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Star, CheckCircle2 } from 'lucide-react';
import type { PendingFeedback, SubmitFeedbackInput, EvaluatorType } from '@/hooks/use-feedback';

interface FeedbackFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedback: PendingFeedback | null;
  evaluatorType: EvaluatorType;
  onSubmit: (data: SubmitFeedbackInput) => void;
  isLoading?: boolean;
}

const ratingCategories = [
  { key: 'academicRating', label: 'Academic Performance', description: 'Understanding of concepts, grades, assignments' },
  { key: 'participationRating', label: 'Class Participation', description: 'Engagement in discussions, asking questions' },
  { key: 'teamworkRating', label: 'Teamwork', description: 'Collaboration, group project contributions' },
  { key: 'communicationRating', label: 'Communication', description: 'Clarity, presentation skills, writing' },
  { key: 'leadershipRating', label: 'Leadership', description: 'Initiative, guiding peers, responsibility' },
  { key: 'punctualityRating', label: 'Punctuality & Discipline', description: 'Attendance, timeliness, classroom behavior' },
];

const ratingLabels = [
  { value: 1, label: 'Poor', color: 'text-red-500' },
  { value: 2, label: 'Below Avg', color: 'text-orange-500' },
  { value: 3, label: 'Average', color: 'text-yellow-500' },
  { value: 4, label: 'Good', color: 'text-blue-500' },
  { value: 5, label: 'Excellent', color: 'text-green-500' },
];

interface FormState {
  academicRating: number;
  participationRating: number;
  teamworkRating: number;
  communicationRating: number;
  leadershipRating: number;
  punctualityRating: number;
  strengths: string;
  improvements: string;
}

const initialFormState: FormState = {
  academicRating: 0,
  participationRating: 0,
  teamworkRating: 0,
  communicationRating: 0,
  leadershipRating: 0,
  punctualityRating: 0,
  strengths: '',
  improvements: '',
};

export function FeedbackFormDialog({
  open,
  onOpenChange,
  feedback,
  evaluatorType,
  onSubmit,
  isLoading,
}: FeedbackFormDialogProps) {
  const [form, setForm] = useState<FormState>(initialFormState);

  useEffect(() => {
    if (open) {
      setForm(initialFormState);
    }
  }, [open, feedback?.targetStudentId]);

  if (!feedback) return null;

  const handleRatingClick = (key: keyof FormState, value: number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    const data: SubmitFeedbackInput = {
      targetStudentId: feedback.targetStudentId,
      evaluatorType,
      academicRating: form.academicRating || undefined,
      participationRating: form.participationRating || undefined,
      teamworkRating: form.teamworkRating || undefined,
      communicationRating: form.communicationRating || undefined,
      leadershipRating: form.leadershipRating || undefined,
      punctualityRating: form.punctualityRating || undefined,
      strengths: form.strengths || undefined,
      improvements: form.improvements || undefined,
    };
    onSubmit(data);
  };

  // Calculate completion progress
  const filledRatings = ratingCategories.filter(
    (cat) => (form[cat.key as keyof FormState] as number) > 0
  ).length;
  const hasText = form.strengths.trim().length > 0 || form.improvements.trim().length > 0;
  const progress = Math.round(((filledRatings + (hasText ? 1 : 0)) / 7) * 100);

  const getInitials = (name?: string) => {
    if (!name) return 'S';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(feedback.targetStudentName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <span>Feedback for {feedback.targetStudentName}</span>
              <p className="text-sm font-normal text-muted-foreground">
                {feedback.cycleName}
              </p>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Submit feedback for this student
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Completion</span>
            <span className={progress === 100 ? 'text-green-500' : ''}>
              {progress}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-6 py-4">
          {/* Rating Categories */}
          <div className="space-y-4">
            {ratingCategories.map(({ key, label, description }) => (
              <div key={key} className="space-y-2">
                <div>
                  <Label className="text-sm font-medium">{label}</Label>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => {
                    const isSelected = form[key as keyof FormState] === rating;
                    const isFilled = (form[key as keyof FormState] as number) >= rating;
                    return (
                      <Button
                        key={rating}
                        type="button"
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleRatingClick(key as keyof FormState, rating)}
                        className={`flex-1 ${isSelected ? '' : isFilled ? 'bg-primary/10' : ''}`}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            isFilled ? 'fill-current' : ''
                          }`}
                        />
                      </Button>
                    );
                  })}
                </div>
                {(form[key as keyof FormState] as number) > 0 && (
                  <p className={`text-xs text-right ${
                    ratingLabels.find((r) => r.value === form[key as keyof FormState])?.color
                  }`}>
                    {ratingLabels.find((r) => r.value === form[key as keyof FormState])?.label}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Text Feedback */}
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="strengths">
                Strengths
                <span className="text-muted-foreground font-normal"> (What does this student do well?)</span>
              </Label>
              <Textarea
                id="strengths"
                value={form.strengths}
                onChange={(e) => setForm((prev) => ({ ...prev, strengths: e.target.value }))}
                placeholder="e.g., Strong analytical skills, good at problem-solving, helps classmates..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="improvements">
                Areas for Improvement
                <span className="text-muted-foreground font-normal"> (Where can they grow?)</span>
              </Label>
              <Textarea
                id="improvements"
                value={form.improvements}
                onChange={(e) => setForm((prev) => ({ ...prev, improvements: e.target.value }))}
                placeholder="e.g., Could participate more in discussions, time management, presentation skills..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || filledRatings === 0}>
            {isLoading ? (
              'Submitting...'
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Submit Feedback
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default FeedbackFormDialog;
