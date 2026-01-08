"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, BookOpen, Clock, Trophy, ArrowRight, Lock } from "lucide-react";

const practiceCategories = [
  {
    title: "Subject-wise Practice",
    description: "Practice questions from your enrolled subjects",
    icon: BookOpen,
    available: false,
    href: "/student/practice/subjects",
  },
  {
    title: "Mock Tests",
    description: "Full-length mock tests to prepare for exams",
    icon: Clock,
    available: false,
    href: "/student/practice/mock-tests",
  },
  {
    title: "Previous Year Papers",
    description: "Solve questions from previous years",
    icon: Brain,
    available: false,
    href: "/student/practice/previous-papers",
  },
  {
    title: "Competitive Exams",
    description: "Prepare for GATE, CAT, and other competitive exams",
    icon: Trophy,
    available: false,
    href: "/student/practice/competitive",
  },
];

export default function PracticeZonePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Practice Zone</h1>
        <p className="text-muted-foreground">
          Enhance your knowledge with practice questions and mock tests
        </p>
      </div>

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="rounded-full bg-amber-100 p-3">
            <Brain className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-900">Coming Soon!</h3>
            <p className="text-sm text-amber-700">
              We're building an AI-powered practice zone with adaptive questions,
              personalized recommendations, and detailed analytics. Stay tuned!
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {practiceCategories.map((category) => (
          <Card
            key={category.title}
            className={`relative ${!category.available ? "opacity-75" : ""}`}
          >
            {!category.available && (
              <div className="absolute right-4 top-4">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <category.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                disabled={!category.available}
              >
                {category.available ? (
                  <>
                    Start Practice
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  "Coming Soon"
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Practice Stats</CardTitle>
          <CardDescription>Track your progress and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-lg border p-4 text-center">
              <div className="text-2xl font-bold text-muted-foreground">--</div>
              <div className="text-sm text-muted-foreground">Questions Solved</div>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="text-2xl font-bold text-muted-foreground">--</div>
              <div className="text-sm text-muted-foreground">Mock Tests</div>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="text-2xl font-bold text-muted-foreground">--</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="text-2xl font-bold text-muted-foreground">--</div>
              <div className="text-sm text-muted-foreground">Study Hours</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
