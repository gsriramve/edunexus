'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Handshake,
  Calendar,
  Award,
  Star,
} from 'lucide-react';

interface AlumniDashboardStats {
  activeMentees: number;
  upcomingEvents: number;
  contributions: number;
  testimonials: number;
}

interface AlumniStatsRowProps {
  stats: AlumniDashboardStats | undefined;
  isLoading: boolean;
}

export function AlumniStatsRow({ stats, isLoading }: AlumniStatsRowProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: 'Active Mentees',
      value: stats?.activeMentees || 0,
      description: 'students you\'re mentoring',
      icon: Handshake,
      iconColor: 'text-green-500',
    },
    {
      title: 'Upcoming Events',
      value: stats?.upcomingEvents || 0,
      description: 'events this quarter',
      icon: Calendar,
      iconColor: 'text-blue-500',
    },
    {
      title: 'Contributions',
      value: stats?.contributions || 0,
      description: 'total contributions',
      icon: Award,
      iconColor: 'text-purple-500',
    },
    {
      title: 'Testimonials',
      value: stats?.testimonials || 0,
      description: 'success stories shared',
      icon: Star,
      iconColor: 'text-yellow-500',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {statsData.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.iconColor}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default AlumniStatsRow;
