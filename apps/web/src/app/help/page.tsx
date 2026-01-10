"use client";

import Link from "next/link";
import {
  HelpCircle,
  Mail,
  Phone,
  MessageSquare,
  Book,
  Video,
  FileQuestion,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do I reset my password?",
    answer: "Click on 'Forgot Password' on the sign-in page. Enter your registered email address and you'll receive a password reset link. Follow the instructions in the email to create a new password.",
  },
  {
    question: "How can I view my attendance records?",
    answer: "Navigate to the Dashboard and click on 'Attendance' in the sidebar. You can view your attendance history, percentage, and detailed records by subject.",
  },
  {
    question: "How do I download my ID card?",
    answer: "Go to 'ID Cards' section in the sidebar. Click on 'Download ID Card' button to get a PDF version of your student/staff ID card.",
  },
  {
    question: "How can I check my exam results?",
    answer: "Go to 'Academics' > 'Results' in the sidebar. Select the semester and exam type to view your detailed results and grade card.",
  },
  {
    question: "Who do I contact for fee-related queries?",
    answer: "For fee-related queries, please contact the Accounts department at accounts@edunexus.io or visit the fee counter during office hours (9 AM - 5 PM).",
  },
  {
    question: "How do I update my profile information?",
    answer: "Click on your profile icon in the top-right corner and select 'Profile Settings'. You can update your contact information, photo, and other personal details.",
  },
];

const quickLinks = [
  { title: "User Guide", icon: Book, href: "#", description: "Complete documentation" },
  { title: "Video Tutorials", icon: Video, href: "#", description: "Step-by-step guides" },
  { title: "FAQs", icon: FileQuestion, href: "#faqs", description: "Common questions" },
  { title: "Contact Support", icon: MessageSquare, href: "#contact", description: "Get help" },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
              <p className="text-muted-foreground">
                Find answers, tutorials, and contact support
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Quick Links */}
        <div className="grid gap-4 md:grid-cols-4">
          {quickLinks.map((link) => (
            <Card key={link.title} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <a href={link.href} className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-muted">
                    <link.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{link.title}</h3>
                    <p className="text-sm text-muted-foreground">{link.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQs Section */}
        <Card id="faqs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileQuestion className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Quick answers to common questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card id="contact">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Contact Support
            </CardTitle>
            <CardDescription>
              Need more help? Reach out to our support team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex items-start gap-4 p-4 rounded-lg border">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Email Support</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    For general inquiries
                  </p>
                  <a
                    href="mailto:support@edunexus.io"
                    className="text-sm text-primary hover:underline"
                  >
                    support@edunexus.io
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg border">
                <div className="p-2 rounded-lg bg-green-50">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Phone Support</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Mon-Fri, 9 AM - 6 PM
                  </p>
                  <a
                    href="tel:+919876543210"
                    className="text-sm text-primary hover:underline"
                  >
                    +91 98765 43210
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg border">
                <div className="p-2 rounded-lg bg-purple-50">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium">Live Chat</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Quick responses
                  </p>
                  <Button variant="outline" size="sm">
                    Start Chat
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                <strong>Response Time:</strong> We typically respond within 24 hours for email queries.
                For urgent issues, please use phone support during business hours.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back Link */}
        <div className="pt-4">
          <Link href="/" className="text-primary hover:underline inline-flex items-center gap-1">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
