'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar,
  MapPin,
  Video,
  Users,
  ArrowRight,
} from 'lucide-react';
import type { AlumniEvent } from '@/hooks/use-alumni';

interface EventCardProps {
  event: AlumniEvent;
  compact?: boolean;
  showRegisterButton?: boolean;
  onRegister?: () => void;
  isRegistered?: boolean;
}

const eventTypeLabels: Record<string, string> = {
  reunion: 'Reunion',
  networking: 'Networking',
  guest_lecture: 'Guest Lecture',
  workshop: 'Workshop',
  homecoming: 'Homecoming',
};

const eventTypeColors: Record<string, string> = {
  reunion: 'bg-purple-100 text-purple-800',
  networking: 'bg-blue-100 text-blue-800',
  guest_lecture: 'bg-green-100 text-green-800',
  workshop: 'bg-orange-100 text-orange-800',
  homecoming: 'bg-pink-100 text-pink-800',
};

export function EventCard({
  event,
  compact = false,
  showRegisterButton = false,
  onRegister,
  isRegistered,
}: EventCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg border">
        <div>
          <p className="font-medium">{event.title}</p>
          <p className="text-sm text-muted-foreground">
            {formatDate(event.startDate)}
          </p>
        </div>
        <Badge
          variant="outline"
          className={eventTypeColors[event.eventType] || 'bg-gray-100 text-gray-800'}
        >
          {eventTypeLabels[event.eventType] || event.eventType}
        </Badge>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{event.title}</CardTitle>
            {event.description && (
              <CardDescription className="mt-1 line-clamp-2">
                {event.description}
              </CardDescription>
            )}
          </div>
          <Badge
            className={eventTypeColors[event.eventType] || 'bg-gray-100 text-gray-800'}
          >
            {eventTypeLabels[event.eventType] || event.eventType}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(event.startDate)}</span>
            <span className="text-muted-foreground/60">at {formatTime(event.startDate)}</span>
          </div>

          {event.isVirtual ? (
            <div className="flex items-center gap-1">
              <Video className="h-4 w-4" />
              <span>Virtual Event</span>
            </div>
          ) : event.venue ? (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{event.venue}</span>
            </div>
          ) : null}

          {event._count?.attendances !== undefined && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>
                {event._count.attendances}
                {event.maxAttendees && ` / ${event.maxAttendees}`} registered
              </span>
            </div>
          )}
        </div>

        {showRegisterButton && (
          <Button
            className="w-full"
            variant={isRegistered ? 'secondary' : 'default'}
            onClick={onRegister}
            disabled={isRegistered}
          >
            {isRegistered ? 'Registered' : 'Register'}
            {!isRegistered && <ArrowRight className="h-4 w-4 ml-2" />}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function EventCardSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg border">
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-5 w-20" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>
          <Skeleton className="h-5 w-24" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

export function EventsEmptyState() {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p>No upcoming events</p>
    </div>
  );
}

export default EventCard;
