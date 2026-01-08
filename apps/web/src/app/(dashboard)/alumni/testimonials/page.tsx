"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MessageSquareQuote,
  Plus,
  Star,
  Briefcase,
  GraduationCap,
  Rocket,
  Heart,
  Video,
  Building2,
  Quote,
  ExternalLink,
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";
import {
  useCreateTestimonial,
  usePublicTestimonials,
  type Testimonial,
  type TestimonialCategory,
  type CreateTestimonialInput,
} from "@/hooks/use-alumni";

const categoryLabels: Record<TestimonialCategory, string> = {
  career_success: "Career Success",
  entrepreneurship: "Entrepreneurship",
  higher_studies: "Higher Studies",
  gratitude: "Gratitude",
};

const categoryIcons: Record<TestimonialCategory, React.ReactNode> = {
  career_success: <Briefcase className="h-5 w-5" />,
  entrepreneurship: <Rocket className="h-5 w-5" />,
  higher_studies: <GraduationCap className="h-5 w-5" />,
  gratitude: <Heart className="h-5 w-5" />,
};

const categoryColors: Record<TestimonialCategory, string> = {
  career_success: "bg-blue-100 text-blue-800",
  entrepreneurship: "bg-purple-100 text-purple-800",
  higher_studies: "bg-green-100 text-green-800",
  gratitude: "bg-pink-100 text-pink-800",
};

export default function AlumniTestimonialsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [testimonialForm, setTestimonialForm] = useState<CreateTestimonialInput>({
    title: "",
    content: "",
    category: "career_success",
    videoUrl: "",
  });

  const tenantId = useTenantId();

  const { data: testimonials, isLoading, refetch } = usePublicTestimonials(tenantId || "");
  const createTestimonial = useCreateTestimonial(tenantId || "");

  // Filter testimonials
  const filteredTestimonials = categoryFilter === "all"
    ? testimonials
    : testimonials?.filter((t) => t.category === categoryFilter);

  // Get featured testimonials
  const featuredTestimonials = testimonials?.filter((t) => t.isFeatured).slice(0, 3);

  const handleSubmitTestimonial = () => {
    if (!testimonialForm.title || !testimonialForm.content) return;

    createTestimonial.mutate(
      {
        ...testimonialForm,
        videoUrl: testimonialForm.videoUrl || undefined,
      },
      {
        onSuccess: () => {
          setShowCreateDialog(false);
          setTestimonialForm({
            title: "",
            content: "",
            category: "career_success",
            videoUrl: "",
          });
          refetch();
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Success Stories</h1>
          <p className="text-muted-foreground">
            Inspiring journeys from our alumni community
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Share Your Story
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Share Your Success Story</DialogTitle>
              <DialogDescription>
                Inspire current students and fellow alumni with your journey
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={testimonialForm.category}
                  onValueChange={(value: TestimonialCategory) =>
                    setTestimonialForm({ ...testimonialForm, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          {categoryIcons[value as TestimonialCategory]}
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={testimonialForm.title}
                  onChange={(e) =>
                    setTestimonialForm({ ...testimonialForm, title: e.target.value })
                  }
                  placeholder="e.g., From Campus to Google"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Your Story</label>
                <Textarea
                  value={testimonialForm.content}
                  onChange={(e) =>
                    setTestimonialForm({ ...testimonialForm, content: e.target.value })
                  }
                  placeholder="Share your journey, experiences, and how your alma mater helped shape your career..."
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Video URL (Optional)</label>
                <Input
                  value={testimonialForm.videoUrl || ""}
                  onChange={(e) =>
                    setTestimonialForm({ ...testimonialForm, videoUrl: e.target.value })
                  }
                  placeholder="https://youtube.com/watch?v=..."
                />
                <p className="text-xs text-muted-foreground">
                  Add a YouTube or video link to make your story more impactful
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitTestimonial}
                disabled={
                  !testimonialForm.title ||
                  !testimonialForm.content ||
                  createTestimonial.isPending
                }
              >
                {createTestimonial.isPending ? "Submitting..." : "Submit Story"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Featured Testimonials */}
      {featuredTestimonials && featuredTestimonials.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            Featured Stories
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {featuredTestimonials.map((testimonial) => (
              <FeaturedTestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {filteredTestimonials?.length || 0} stories
        </span>
      </div>

      {/* All Testimonials */}
      {filteredTestimonials && filteredTestimonials.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredTestimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquareQuote className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Stories Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              {categoryFilter !== "all"
                ? `No ${categoryLabels[categoryFilter as TestimonialCategory]} stories yet`
                : "Be the first to share your success story"}
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Share Your Story
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10">
        <CardContent className="flex flex-col md:flex-row items-center justify-between py-8 gap-4">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-semibold mb-2">
              Your Story Could Inspire Thousands
            </h3>
            <p className="text-muted-foreground">
              Share your journey and help current students see what's possible
            </p>
          </div>
          <Button size="lg" onClick={() => setShowCreateDialog(true)}>
            <MessageSquareQuote className="h-5 w-5 mr-2" />
            Share Your Story
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Featured Testimonial Card
function FeaturedTestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={testimonial.alumni?.photoUrl} />
            <AvatarFallback>
              {testimonial.alumni?.firstName?.[0]}
              {testimonial.alumni?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">
              {testimonial.alumni?.firstName} {testimonial.alumni?.lastName}
            </CardTitle>
            <CardDescription>{testimonial.alumni?.batch}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Badge className={`${categoryColors[testimonial.category]} mb-3`}>
          {categoryLabels[testimonial.category]}
        </Badge>
        <h4 className="font-semibold mb-2">{testimonial.title}</h4>
        <p className="text-sm text-muted-foreground line-clamp-3">
          "{testimonial.content}"
        </p>
        {testimonial.videoUrl && (
          <Button variant="outline" size="sm" className="mt-3" asChild>
            <a href={testimonial.videoUrl} target="_blank" rel="noopener noreferrer">
              <Video className="h-4 w-4 mr-2" />
              Watch Video
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Regular Testimonial Card
function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = testimonial.content.length > 200;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={testimonial.alumni?.photoUrl} />
              <AvatarFallback>
                {testimonial.alumni?.firstName?.[0]}
                {testimonial.alumni?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">
                {testimonial.alumni?.firstName} {testimonial.alumni?.lastName}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <GraduationCap className="h-3 w-3" />
                {testimonial.alumni?.batch}
              </CardDescription>
            </div>
          </div>
          <Badge className={categoryColors[testimonial.category]}>
            {categoryIcons[testimonial.category]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <h4 className="font-semibold mb-2">{testimonial.title}</h4>
        <div className="relative">
          <Quote className="absolute -left-1 -top-1 h-4 w-4 text-muted-foreground/30" />
          <p
            className={`text-sm text-muted-foreground pl-4 ${
              !expanded && isLong ? "line-clamp-4" : ""
            }`}
          >
            {testimonial.content}
          </p>
        </div>

        <div className="flex items-center gap-2 mt-3">
          {isLong && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Show less" : "Read more"}
            </Button>
          )}
          {testimonial.videoUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={testimonial.videoUrl} target="_blank" rel="noopener noreferrer">
                <Video className="h-4 w-4 mr-2" />
                Watch
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
