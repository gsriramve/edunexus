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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  MapPin,
  Video,
  Users,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Star,
  ExternalLink,
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";
import {
  useUpcomingAlumniEvents,
  useAlumniEvents,
  useMyEventRegistrations,
  useRegisterForEvent,
  useCancelEventRegistration,
  useSubmitEventFeedback,
  type AlumniEvent,
  type EventAttendance,
  type EventType,
} from "@/hooks/use-alumni";

const eventTypeLabels: Record<EventType, string> = {
  reunion: "Reunion",
  networking: "Networking",
  guest_lecture: "Guest Lecture",
  workshop: "Workshop",
  homecoming: "Homecoming",
};

const eventTypeColors: Record<EventType, string> = {
  reunion: "bg-purple-100 text-purple-800",
  networking: "bg-blue-100 text-blue-800",
  guest_lecture: "bg-green-100 text-green-800",
  workshop: "bg-yellow-100 text-yellow-800",
  homecoming: "bg-pink-100 text-pink-800",
};

export default function AlumniEventsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<AlumniEvent | null>(null);
  const [feedbackEvent, setFeedbackEvent] = useState<EventAttendance | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");

  const tenantId = useTenantId();

  const { data: upcomingEvents, isLoading: upcomingLoading } = useUpcomingAlumniEvents(tenantId || "");
  const { data: allEventsData, isLoading: allLoading } = useAlumniEvents(tenantId || "");
  const { data: myRegistrations, isLoading: registrationsLoading, refetch: refetchRegistrations } = useMyEventRegistrations(tenantId || "");

  const registerForEvent = useRegisterForEvent(tenantId || "");
  const cancelRegistration = useCancelEventRegistration(tenantId || "");
  const submitFeedback = useSubmitEventFeedback(tenantId || "");

  const isLoading = upcomingLoading || allLoading;

  // Filter events
  const filteredEvents = (allEventsData?.data || []).filter((event) => {
    const matchesSearch = searchQuery === "" ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === "all" || event.eventType === typeFilter;

    return matchesSearch && matchesType;
  });

  // Get registered event IDs
  const registeredEventIds = new Set(myRegistrations?.map((r) => r.eventId) || []);

  const handleRegister = (eventId: string) => {
    registerForEvent.mutate(eventId, {
      onSuccess: () => {
        setSelectedEvent(null);
        refetchRegistrations();
      },
    });
  };

  const handleCancelRegistration = (eventId: string) => {
    cancelRegistration.mutate(eventId, {
      onSuccess: () => {
        setSelectedEvent(null);
        refetchRegistrations();
      },
    });
  };

  const handleSubmitFeedback = () => {
    if (feedbackEvent && feedbackRating > 0) {
      submitFeedback.mutate(
        {
          eventId: feedbackEvent.eventId,
          rating: feedbackRating,
          feedback: feedbackText || undefined,
        },
        {
          onSuccess: () => {
            setFeedbackEvent(null);
            setFeedbackRating(0);
            setFeedbackText("");
            refetchRegistrations();
          },
        }
      );
    }
  };

  // Find past events that need feedback
  const pastEventsNeedingFeedback = myRegistrations?.filter(
    (r) => r.attended && !r.rating
  ) || [];

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Alumni Events</h1>
        <p className="text-muted-foreground">
          Stay connected with fellow alumni through events and reunions
        </p>
      </div>

      {/* Past Events Needing Feedback Alert */}
      {pastEventsNeedingFeedback.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium">Share your feedback!</p>
                  <p className="text-sm text-muted-foreground">
                    You have {pastEventsNeedingFeedback.length} event(s) awaiting your feedback
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFeedbackEvent(pastEventsNeedingFeedback[0])}
              >
                Give Feedback
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">
            <Calendar className="h-4 w-4 mr-2" />
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="all">
            <Filter className="h-4 w-4 mr-2" />
            All Events
          </TabsTrigger>
          <TabsTrigger value="registered">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            My Registrations ({myRegistrations?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Upcoming Events */}
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingEvents && upcomingEvents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isRegistered={registeredEventIds.has(event.id)}
                  onSelect={() => setSelectedEvent(event)}
                />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Upcoming Events</h3>
                <p className="text-muted-foreground text-center">
                  Check back later for new events
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* All Events */}
        <TabsContent value="all" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(eventTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Events Grid */}
          {filteredEvents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isRegistered={registeredEventIds.has(event.id)}
                  onSelect={() => setSelectedEvent(event)}
                />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Events Found</h3>
                <p className="text-muted-foreground text-center">
                  Try adjusting your search filters
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* My Registrations */}
        <TabsContent value="registered" className="space-y-4">
          {registrationsLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : myRegistrations && myRegistrations.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {myRegistrations.map((registration) => (
                <Card key={registration.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">
                          {registration.event?.title || "Event"}
                        </CardTitle>
                        <CardDescription>
                          {registration.event?.startDate &&
                            new Date(registration.event.startDate).toLocaleDateString("en-IN", {
                              weekday: "long",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                        </CardDescription>
                      </div>
                      <Badge variant={registration.attended ? "default" : "secondary"}>
                        {registration.attended ? "Attended" : "Registered"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {registration.event?.venue && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {registration.event.venue}
                        </div>
                      )}

                      {registration.rating ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Your rating:</span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= registration.rating!
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      ) : registration.attended ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setFeedbackEvent(registration)}
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Give Feedback
                        </Button>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Registrations</h3>
                <p className="text-muted-foreground text-center mb-4">
                  You haven't registered for any events yet
                </p>
                <Button onClick={() => setActiveTab("upcoming")}>
                  Browse Events
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Event Details Dialog */}
      <Dialog open={selectedEvent !== null} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-lg">
          {selectedEvent && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <Badge className={eventTypeColors[selectedEvent.eventType]}>
                    {eventTypeLabels[selectedEvent.eventType]}
                  </Badge>
                </div>
                <DialogTitle className="text-xl">{selectedEvent.title}</DialogTitle>
                <DialogDescription>
                  {selectedEvent.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {new Date(selectedEvent.startDate).toLocaleDateString("en-IN", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    {selectedEvent.endDate &&
                      ` - ${new Date(selectedEvent.endDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                      })}`}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {new Date(selectedEvent.startDate).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {selectedEvent.isVirtual ? (
                  <div className="flex items-center gap-3 text-sm">
                    <Video className="h-4 w-4 text-muted-foreground" />
                    <span>Virtual Event</span>
                    {selectedEvent.meetLink && registeredEventIds.has(selectedEvent.id) && (
                      <a
                        href={selectedEvent.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary flex items-center gap-1 hover:underline"
                      >
                        Join <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ) : selectedEvent.venue ? (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedEvent.venue}</span>
                  </div>
                ) : null}

                {selectedEvent._count && (
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {selectedEvent._count.attendances} registered
                      {selectedEvent.maxAttendees && ` / ${selectedEvent.maxAttendees} max`}
                    </span>
                  </div>
                )}

                {selectedEvent.registrationDeadline && (
                  <div className="flex items-center gap-3 text-sm text-yellow-600">
                    <Clock className="h-4 w-4" />
                    <span>
                      Registration deadline:{" "}
                      {new Date(selectedEvent.registrationDeadline).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {selectedEvent.registrationFee && selectedEvent.registrationFee > 0 && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">
                      Registration Fee: ₹{selectedEvent.registrationFee}
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                {registeredEventIds.has(selectedEvent.id) ? (
                  <div className="flex w-full gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleCancelRegistration(selectedEvent.id)}
                      disabled={cancelRegistration.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {cancelRegistration.isPending ? "Cancelling..." : "Cancel Registration"}
                    </Button>
                    <Button className="flex-1" disabled>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Registered
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => handleRegister(selectedEvent.id)}
                    disabled={registerForEvent.isPending}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {registerForEvent.isPending ? "Registering..." : "Register for Event"}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={feedbackEvent !== null} onOpenChange={() => setFeedbackEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your Feedback</DialogTitle>
            <DialogDescription>
              How was your experience at {feedbackEvent?.event?.title}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    onClick={() => setFeedbackRating(star)}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= feedbackRating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      }`}
                    />
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Comments (Optional)</label>
              <Textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share your thoughts about the event..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackEvent(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitFeedback}
              disabled={feedbackRating === 0 || submitFeedback.isPending}
            >
              {submitFeedback.isPending ? "Submitting..." : "Submit Feedback"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Event Card Component
function EventCard({
  event,
  isRegistered,
  onSelect,
}: {
  event: AlumniEvent;
  isRegistered: boolean;
  onSelect: () => void;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onSelect}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <Badge className={eventTypeColors[event.eventType]}>
            {eventTypeLabels[event.eventType]}
          </Badge>
          {isRegistered && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Registered
            </Badge>
          )}
        </div>
        <CardTitle className="text-base mt-2">{event.title}</CardTitle>
        {event.description && (
          <CardDescription className="line-clamp-2">
            {event.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {new Date(event.startDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>

          {event.isVirtual ? (
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Virtual Event
            </div>
          ) : event.venue ? (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {event.venue}
            </div>
          ) : null}

          {event._count && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {event._count.attendances} registered
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
