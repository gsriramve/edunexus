"use client";

import { useState } from "react";
import {
  Download,
  QrCode,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Building2,
  GraduationCap,
  Droplets,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface IdCardData {
  id: string;
  cardNumber: string;
  status: "active" | "expired" | "revoked";
  issueDate: string;
  validUntil: string;
  qrVerificationToken: string;
  cachedName: string;
  cachedRollNo: string;
  cachedDepartment: string;
  cachedBatch: string;
  cachedBloodGroup?: string | null;
  cachedPhotoUrl?: string | null;
}

interface StudentIDCardProps {
  idCard: IdCardData | null;
  collegeName?: string;
  collegeLogo?: string;
  isLoading?: boolean;
  onGenerateCard?: () => void;
  onDownloadPdf?: () => void;
  isGenerating?: boolean;
  isDownloading?: boolean;
}

export function StudentIDCard({
  idCard,
  collegeName = "EduNexus College",
  collegeLogo,
  isLoading = false,
  onGenerateCard,
  onDownloadPdf,
  isGenerating = false,
  isDownloading = false,
}: StudentIDCardProps) {
  const [showQrDialog, setShowQrDialog] = useState(false);

  if (isLoading) {
    return <StudentIDCardSkeleton />;
  }

  // No card exists yet
  if (!idCard) {
    return (
      <div className="relative w-full max-w-md mx-auto">
        <div className="aspect-[1.586/1] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center p-6">
          <GraduationCap className="h-12 w-12 text-slate-400 mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-center mb-4">
            No ID card generated yet
          </p>
          {onGenerateCard && (
            <Button onClick={onGenerateCard} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate ID Card
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    );
  }

  const isExpired = new Date(idCard.validUntil) < new Date();
  const isActive = idCard.status === "active" && !isExpired;
  const initials = idCard.cachedName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const statusConfig = {
    active: {
      label: "Active",
      color: "bg-green-500",
      icon: CheckCircle2,
    },
    expired: {
      label: "Expired",
      color: "bg-yellow-500",
      icon: AlertCircle,
    },
    revoked: {
      label: "Revoked",
      color: "bg-red-500",
      icon: AlertCircle,
    },
  };

  const displayStatus = isExpired && idCard.status === "active" ? "expired" : idCard.status;
  const status = statusConfig[displayStatus];
  const StatusIcon = status.icon;

  // Generate QR code URL (using a public QR API for display)
  const verificationUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/verify/${idCard.qrVerificationToken}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}`;

  return (
    <div className="w-full max-w-md mx-auto space-y-3">
      {/* ID Card Front */}
      <div className="relative aspect-[1.586/1] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-xl shadow-xl overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,white_1px,transparent_1px)] bg-[length:20px_20px]" />
        </div>

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 bg-white/10 backdrop-blur-sm px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {collegeLogo ? (
              <img src={collegeLogo} alt="College" className="h-8 w-8 object-contain" />
            ) : (
              <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
            )}
            <span className="text-white font-semibold text-sm truncate max-w-[180px]">
              {collegeName}
            </span>
          </div>
          <Badge className={`${status.color} text-white text-xs`}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>
        </div>

        {/* Main Content */}
        <div className="absolute inset-0 pt-14 pb-4 px-4 flex">
          {/* Left - Photo */}
          <div className="flex flex-col items-center justify-center pr-4">
            <Avatar className="h-20 w-20 border-2 border-white/50 shadow-lg">
              <AvatarImage src={idCard.cachedPhotoUrl || undefined} />
              <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Right - Details */}
          <div className="flex-1 flex flex-col justify-center text-white space-y-1">
            <h3 className="font-bold text-lg leading-tight truncate">{idCard.cachedName}</h3>
            <p className="text-white/80 text-sm font-mono">{idCard.cachedRollNo}</p>
            <p className="text-white/70 text-xs truncate">{idCard.cachedDepartment}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-white/70 text-xs flex items-center gap-1">
                <GraduationCap className="h-3 w-3" />
                {idCard.cachedBatch}
              </span>
              {idCard.cachedBloodGroup && (
                <span className="text-white/70 text-xs flex items-center gap-1">
                  <Droplets className="h-3 w-3" />
                  {idCard.cachedBloodGroup}
                </span>
              )}
            </div>
          </div>

          {/* QR Code (small preview) */}
          <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
            <DialogTrigger asChild>
              <button className="absolute bottom-3 right-3 bg-white rounded-lg p-1.5 shadow-lg hover:scale-105 transition-transform cursor-pointer">
                <img src={qrCodeUrl} alt="QR Code" className="h-14 w-14" />
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>ID Card Verification QR</DialogTitle>
                <DialogDescription>
                  Scan this QR code to verify the authenticity of this ID card
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center py-4">
                <img src={qrCodeUrl.replace("200x200", "300x300")} alt="QR Code" className="h-64 w-64" />
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Card Number: <span className="font-mono font-medium">{idCard.cardNumber}</span>
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm px-4 py-1.5 flex items-center justify-between text-xs">
          <span className="text-white/70 font-mono">{idCard.cardNumber}</span>
          <span className="text-white/70 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Valid until {new Date(idCard.validUntil).toLocaleDateString("en-IN", {
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQrDialog(true)}
              >
                <QrCode className="h-4 w-4 mr-2" />
                View QR
              </Button>
            </TooltipTrigger>
            <TooltipContent>View verification QR code</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {onDownloadPdf && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDownloadPdf}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Download PDF
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download printable ID card</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {!isActive && onGenerateCard && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  onClick={onGenerateCard}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Renew Card
                </Button>
              </TooltipTrigger>
              <TooltipContent>Generate a new ID card</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}

function StudentIDCardSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto space-y-3">
      <div className="aspect-[1.586/1] rounded-xl overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="flex gap-2 justify-center">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  );
}

export default StudentIDCard;
