'use client';

import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, MessageSquare, Lightbulb, TrendingUp, Edit, Save, X, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRBAC } from '@/lib/use-rbac';

export default function ResidentIntelligencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { role } = useRBAC();

  const { data: resident } = useQuery({
    queryKey: ['resident', id],
    queryFn: () => apiClient.getResident(id),
  });

  const { data: pattern } = useQuery({
    queryKey: ['pattern', id],
    queryFn: () => apiClient.getResidentPattern(id),
    retry: false,
  });

  const { data: callStates } = useQuery({
    queryKey: ['callStates', id],
    queryFn: () => apiClient.getCallStates(id, 10),
  });

  const { data: events } = useQuery({
    queryKey: ['events', id],
    queryFn: () => apiClient.getAnticipatedEvents(id, 'upcoming'),
  });

  const { data: callbacks } = useQuery({
    queryKey: ['callbacks', id],
    queryFn: () => apiClient.getCallbacks(id, true),
  });

  const name = resident?.preferredName || resident?.firstName || 'Resident';

  // RBAC: Only ADMIN can access intelligence page
  if (role !== 'ADMIN') {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Lock className="h-16 w-16 text-muted-foreground" />
          <h1 className="text-2xl font-bold">Admin Access Only</h1>
          <p className="text-muted-foreground text-center max-w-md">
            The Conversational Intelligence page is currently restricted to administrators only.
            <br />
            This feature shows AI training data and system optimization insights.
          </p>
          <Link href={`/residents/${id}`}>
            <Button variant="outline">
              ← Back to Profile
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href={`/residents/${id}`}>
              <Button variant="ghost" size="sm">
                ← Back to Profile
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">{name}'s Conversational Intelligence</h1>
          <p className="text-muted-foreground">
            AI-powered insights from {pattern?.callsAnalyzed || 0} analyzed conversations
          </p>
        </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events & Follow-ups</TabsTrigger>
          <TabsTrigger value="callbacks">Callbacks & Jokes</TabsTrigger>
          <TabsTrigger value="history">Call History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {!pattern ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">
                  No pattern data yet. Needs at least 2 completed calls to generate insights.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Baseline Traits */}
              <Card>
                <CardHeader>
                  <CardTitle>Baseline Traits</CardTitle>
                  <CardDescription>Typical energy and receptiveness</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Energy</div>
                    <Badge variant={pattern.typicalEnergy === 'high' ? 'default' : 'secondary'}>
                      {pattern.typicalEnergy}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Tone</div>
                    <Badge variant={pattern.typicalTone === 'bright' ? 'default' : 'secondary'}>
                      {pattern.typicalTone}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Receptiveness</div>
                    <Badge variant={pattern.typicalReceptiveness === 'very_open' ? 'default' : 'secondary'}>
                      {pattern.typicalReceptiveness}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Warmup Pattern */}
              {pattern.usuallyNeedsWarmup && (
                <Card>
                  <CardHeader>
                    <CardTitle>Warmup Pattern</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Usually needs <strong>{pattern.typicalWarmupMinutes} minutes</strong> to open up
                    </p>
                    {pattern.warmupNotes && (
                      <p className="text-sm text-muted-foreground mt-2">{pattern.warmupNotes}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Personality Summary */}
              <PersonalitySummary pattern={pattern} residentId={id} />

              {/* What Works */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      What Works
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {pattern.approachesThatWork?.map((approach: string, i: number) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-green-500 mt-1">✓</span>
                          <span>{approach}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <X className="h-5 w-5" />
                      To Avoid
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pattern.approachesToAvoid && pattern.approachesToAvoid.length > 0 ? (
                      <ul className="space-y-2">
                        {pattern.approachesToAvoid.map((approach: string, i: number) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="text-red-500 mt-1">✗</span>
                            <span>{approach}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No specific approaches to avoid identified</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Topics */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Favorite Topics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {pattern.favoriteTopics?.map((topic: string, i: number) => (
                        <Badge key={i} variant="secondary">{topic}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sensitive Topics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pattern.sensitiveTopics && pattern.sensitiveTopics.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {pattern.sensitiveTopics.map((topic: string, i: number) => (
                          <Badge key={i} variant="outline">{topic}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">None identified</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Conversational Preferences */}
              {pattern.conversationalPreferences && Object.keys(pattern.conversationalPreferences).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Conversational Style</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(pattern.conversationalPreferences).map(([key, value]) => (
                        <div key={key}>
                          <div className="text-sm text-muted-foreground capitalize">{key}</div>
                          <div className="text-sm font-medium">{String(value).replace(/_/g, ' ')}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <EventsList events={events} residentId={id} />
        </TabsContent>

        <TabsContent value="callbacks" className="space-y-4">
          <CallbacksList callbacks={callbacks} residentId={id} />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <CallStateHistory callStates={callStates} />
        </TabsContent>
      </Tabs>
      </div>
    </DashboardLayout>
  );
}

function PersonalitySummary({ pattern, residentId }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState(pattern.personalitySummary || '');

  const handleSave = async () => {
    await apiClient.updateResidentPattern(residentId, {
      personalitySummary: editedSummary,
    });
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Personality Summary</CardTitle>
          {!isEditing ? (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            value={editedSummary}
            onChange={(e) => setEditedSummary(e.target.value)}
            rows={6}
            className="font-mono text-sm"
          />
        ) : (
          <p className="text-sm leading-relaxed">{pattern.personalitySummary}</p>
        )}
      </CardContent>
    </Card>
  );
}

function EventsList({ events, residentId }: any) {
  if (!events || events.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">No upcoming events</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event: any) => (
        <Card key={event.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{event.description}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'No specific date'}
                  <Badge variant="outline" className="ml-2">{event.eventType}</Badge>
                  {event.emotionalTone !== 'neutral' && (
                    <Badge variant={event.emotionalTone === 'positive' ? 'default' : 'secondary'}>
                      {event.emotionalTone}
                    </Badge>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          {event.askedAbout && event.outcomeNotes && (
            <CardContent>
              <div className="text-sm">
                <strong>Outcome:</strong> {event.outcomeNotes}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}

function CallbacksList({ callbacks, residentId }: any) {
  if (!callbacks || callbacks.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">No callbacks yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {callbacks.map((callback: any) => (
        <Card key={callback.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge>{callback.callbackType}</Badge>
                  <CardTitle className="text-lg">{callback.content}</CardTitle>
                </div>
                {callback.context && (
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>Context:</strong> {callback.context}
                  </p>
                )}
                {callback.usageNotes && (
                  <p className="text-sm text-muted-foreground mt-1">
                    <strong>Usage:</strong> {callback.usageNotes}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Used {callback.timesUsed} times
                  {callback.lastUsed && ` • Last: ${new Date(callback.lastUsed).toLocaleDateString()}`}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

function CallStateHistory({ callStates }: any) {
  if (!callStates || callStates.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">No call history yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {callStates.map((state: any) => (
        <Card key={state.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">
                  Call #{state.call.callNumber}
                </CardTitle>
                <CardDescription>
                  {new Date(state.recordedAt).toLocaleDateString()} • {state.call.durationSeconds}s
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant={state.energyLevel === 'high' ? 'default' : 'secondary'}>
                  {state.energyLevel}
                </Badge>
                <Badge variant={state.emotionalTone === 'bright' ? 'default' : 'secondary'}>
                  {state.emotionalTone}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {state.topicsEngaged && state.topicsEngaged.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Topics Engaged:</div>
                <div className="flex flex-wrap gap-2">
                  {state.topicsEngaged.map((topic: string, i: number) => (
                    <Badge key={i} variant="secondary">{topic}</Badge>
                  ))}
                </div>
              </div>
            )}
            {state.emotionalPeaks && state.emotionalPeaks.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Emotional Moments:</div>
                <ul className="space-y-1">
                  {state.emotionalPeaks.map((peak: any, i: number) => (
                    <li key={i} className="text-sm">
                      <strong>{peak.type}:</strong> {peak.context}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {state.notes && (
              <div>
                <div className="text-sm font-medium mb-2">Notes:</div>
                <p className="text-sm text-muted-foreground">{state.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
