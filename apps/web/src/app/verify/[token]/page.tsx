"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Shield,
  Calendar,
  Building2,
  GraduationCap,
  User,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { idCardsApi, type IdCardVerification } from "@/lib/api";

export default function VerifyIdCardPage() {
  const params = useParams();
  const token = params.token as string;

  const [verification, setVerification] = useState<IdCardVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyCard() {
      if (!token) {
        setError("No verification token provided");
        setLoading(false);
        return;
      }

      try {
        const result = await idCardsApi.verify(token);
        setVerification(result);
      } catch (err: any) {
        setError(err.message || "Failed to verify ID card");
      } finally {
        setLoading(false);
      }
    }

    verifyCard();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            <p className="text-muted-foreground">Verifying ID card...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
            <CardTitle className="text-red-600">Verification Failed</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!verification) {
    return null;
  }

  const { valid, message, card, collegeName } = verification;

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${
        valid
          ? "bg-gradient-to-br from-green-50 to-emerald-100 dark:from-slate-900 dark:to-slate-800"
          : "bg-gradient-to-br from-red-50 to-orange-100 dark:from-slate-900 dark:to-slate-800"
      }`}
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div
            className={`mx-auto mb-4 h-16 w-16 rounded-full flex items-center justify-center ${
              valid
                ? "bg-green-100 dark:bg-green-900/20"
                : "bg-red-100 dark:bg-red-900/20"
            }`}
          >
            {valid ? (
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            ) : (
              <AlertCircle className="h-10 w-10 text-red-500" />
            )}
          </div>
          <CardTitle className={valid ? "text-green-600" : "text-red-600"}>
            {valid ? "ID Card Verified" : "Verification Failed"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>

        {card && (
          <CardContent className="space-y-6">
            {/* College Name */}
            {collegeName && (
              <div className="text-center">
                <Badge variant="outline" className="text-sm px-3 py-1">
                  <Building2 className="h-3 w-3 mr-1" />
                  {collegeName}
                </Badge>
              </div>
            )}

            {/* Student Info */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={card.photoUrl} />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-bold">
                  {card.studentName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{card.studentName}</h3>
                <p className="text-sm text-muted-foreground font-mono">
                  {card.rollNo}
                </p>
              </div>
            </div>

            {/* Card Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Card Number
                </p>
                <p className="font-mono font-medium">{card.cardNumber}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Status
                </p>
                <Badge
                  className={
                    card.status === "active"
                      ? "bg-green-500"
                      : card.status === "expired"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }
                >
                  {card.status.toUpperCase()}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  Department
                </p>
                <p className="font-medium text-sm">{card.department}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" />
                  Batch
                </p>
                <p className="font-medium text-sm">{card.batch}</p>
              </div>
              <div className="space-y-1 col-span-2">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Valid Until
                </p>
                <p className="font-medium">
                  {new Date(card.validUntil).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Verification timestamp */}
            <div className="pt-4 border-t text-center">
              <p className="text-xs text-muted-foreground">
                Verified on {new Date().toLocaleString("en-IN")}
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
