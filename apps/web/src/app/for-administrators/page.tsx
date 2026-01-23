import { PersonaPageTemplate } from "@/components/marketing";
import {
  Briefcase,
  CreditCard,
  FileText,
  Search,
  Upload,
  Bell,
  Building2,
  Bus,
  Library,
} from "lucide-react";

export const metadata = {
  title: "EduNexus for Administrators | Operations Hub",
  description:
    "35% faster fee collection, one-click certificates, bulk imports, and AI-powered smart search for all records.",
};

export default function ForAdministratorsPage() {
  return (
    <PersonaPageTemplate
      persona={{
        title: "Administrator",
        subtitle: "Administrative Operations",
        description: "Automate the routine, focus on students",
        icon: Briefcase,
        color: "text-emerald-500",
        gradient: "from-emerald-600 to-teal-600",
        email: "admin@nexus-ec.edu",
      }}
      heroHeadline="Give Yourself"
      heroHighlight="20 Hours Back Weekly"
      heroDescription="Automate fee collection, generate certificates instantly, import thousands of records in minutes, and find any student file in milliseconds."
      metrics={[
        { value: "35%", label: "Faster Fee Collection" },
        { value: "1-Click", label: "Certificates" },
        { value: "Bulk", label: "Data Import" },
        { value: "Instant", label: "Record Search" },
      ]}
      painPoints={[
        "Chasing fee defaulters with phone calls and spreadsheets",
        "Manual certificate generation takes hours",
        "Data entry from Excel takes days",
        "Finding old student records is a nightmare",
        "Managing transport, hostel, library separately",
        "No automated reminders for fee deadlines",
      ]}
      features={[
        {
          title: "Smart Fee Collection",
          description:
            "Online payments, automated reminders, and AI-predicted defaulter alerts.",
          icon: CreditCard,
        },
        {
          title: "One-Click Certificates",
          description:
            "Generate TC, Bonafide, Character certificates instantly with digital signatures.",
          icon: FileText,
        },
        {
          title: "AI-Powered Search",
          description:
            "Find any student, record, or document in milliseconds with natural language search.",
          icon: Search,
        },
        {
          title: "Bulk Import/Export",
          description:
            "Import thousands of records from Excel. Export any report with one click.",
          icon: Upload,
        },
        {
          title: "Smart Reminders",
          description:
            "Automated fee reminders, deadline alerts, and parent notifications.",
          icon: Bell,
        },
        {
          title: "Facility Management",
          description:
            "Transport routes, hostel rooms, library - all managed from one dashboard.",
          icon: Building2,
        },
      ]}
      ahaFeatures={[
        {
          title: "Fee Risk Predictor",
          description:
            "AI identifies students likely to default on fees based on payment history patterns. Proactive outreach increases collection by 5-10%.",
          metric: "5-10% better collection",
        },
        {
          title: "Natural Language Search",
          description:
            "Type 'students from Chennai with fee pending' and get instant results. No more clicking through menus.",
          metric: "Millisecond search",
        },
        {
          title: "Auto-Personalized Reminders",
          description:
            "Fee reminders customized based on parent communication preferences and payment history. Right message, right time.",
          metric: "Smart automation",
        },
      ]}
    />
  );
}
