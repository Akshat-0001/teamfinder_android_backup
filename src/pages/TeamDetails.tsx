import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useApplyToTeam, useManageApplication, useLeaveTeam, useKickMember } from '@/hooks/useTeams';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
  Trash2
} from 'lucide-react';

const TeamDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const applyToTeam = useApplyToTeam();
  const manageApplication = useManageApplication();
  const leaveTeam = useLeaveTeam();
  const kickMember = useKickMember();
  const { toast } = useToast();

  const { data: team, isLoading } = useQuery({
    queryKey: ['team', id],
    queryFn: async () => {
      if (!id) throw new Error('Team ID required');
      
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          creator:profiles!teams_created_by_fkey(*),
          applicants:team_applicants(*, user:profiles(*))
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const handleApply = async () => {
    if (!id) return;
    
    try {
      await applyToTeam.mutateAsync(id);
      toast({
        title: "Application Sent",
        description: "Your application has been sent to the team creator."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send application. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleManageApplication = async (applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      await manageApplication.mutateAsync({ applicationId, status });
      toast({
        title: status === 'accepted' ? "Application Accepted" : "Application Rejected",
        description: `The application has been ${status}.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update application status.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const isCreator = team && user && team.created_by === user.id;
  const userApplication = team?.applicants?.find((app: any) => app.user_id === user?.id);
  const acceptedMembers = team?.applicants?.filter((app: any) => app.status === 'accepted') || [];
  const pendingApplications = team?.applicants?.filter((app: any) => app.status === 'pending') || [];
  const openSpots = team ? team.team_size - acceptedMembers.length - 1 : 0; // -1 for creator

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Team Not Found</h1>
          <p className="text-muted-foreground mb-6">The team you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/home')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="touch-target"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{team.title}</h1>
            <p className="text-muted-foreground">by {team.creator?.full_name}</p>
          </div>
          <Badge variant="secondary" className={`category-${team.category.toLowerCase()}`}>
            {team.category}
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>About This Team</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {team.description}
                </p>
                
                {team.required_skills && team.required_skills.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {team.required_skills.map((skill) => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Created {formatDate(team.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{acceptedMembers.length + 1}/{team.team_size} members</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Team Members ({acceptedMembers.length + 1})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Creator */}
                  <div className="flex items-center gap-3">
                    <Link to={team.creator?.user_id ? `/user/${team.creator.user_id}` : '#'} className="focus:outline-none">
                      <Avatar className="cursor-pointer hover:scale-105 transition-transform">
                        {team.creator?.avatar_url ? (
                          team.creator.avatar_url.startsWith('http') || team.creator.avatar_url.startsWith('data:') ? (
                            <AvatarImage src={team.creator.avatar_url} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-primary to-secondary rounded-full">
                              {team.creator.avatar_url}
                            </div>
                          )
                        ) : (
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(team.creator?.full_name || '')}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </Link>
                    <div className="flex-1">
                      <Link to={team.creator?.user_id ? `/user/${team.creator.user_id}` : '#'} className="font-medium hover:underline focus:outline-none">
                        {team.creator?.full_name}
                      </Link>
                      <p className="text-sm text-muted-foreground">Team Creator</p>
                    </div>
                    <Badge variant="outline">Creator</Badge>
                  </div>

                  {/* Accepted Members */}
                  {acceptedMembers.map((application: any) => (
                    <div key={application.id} className="flex items-center gap-3">
                      <Link to={application.user?.user_id ? `/user/${application.user.user_id}` : '#'} className="focus:outline-none">
                        <Avatar className="cursor-pointer hover:scale-105 transition-transform">
                          {application.user?.avatar_url ? (
                            application.user.avatar_url.startsWith('http') || application.user.avatar_url.startsWith('data:') ? (
                              <AvatarImage src={application.user.avatar_url} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-primary to-secondary rounded-full">
                                {application.user.avatar_url}
                              </div>
                            )
                          ) : (
                            <AvatarFallback className="bg-secondary text-secondary-foreground">
                              {getInitials(application.user?.full_name || '')}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </Link>
                      <div className="flex-1">
                        <Link to={application.user?.user_id ? `/user/${application.user.user_id}` : '#'} className="font-medium hover:underline focus:outline-none">
                          {application.user?.full_name}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          Joined {formatDate(application.applied_at)}
                        </p>
                      </div>
                      <Badge variant="secondary">Member</Badge>
                      {isCreator && application.user_id !== user?.id && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10 ml-2"
                          title="Remove Member"
                          onClick={async () => {
                            if (!window.confirm(`Remove ${application.user?.full_name || 'this member'} from the team?`)) return;
                            try {
                              await kickMember.mutateAsync({ teamId: team.id, userId: application.user_id });
                              toast({
                                title: 'Member Removed',
                                description: `${application.user?.full_name || 'Member'} was removed from the team.`,
                              });
                            } catch (error) {
                              toast({
                                title: 'Error',
                                description: 'Failed to remove member. Please try again.',
                                variant: 'destructive',
                              });
                            }
                          }}
                          disabled={kickMember.isPending}
                        >
                          {kickMember.isPending ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-destructive border-t-transparent" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  ))}

                  {/* Open Spots */}
                  {openSpots > 0 && (
                    <div className="text-center py-4 border-2 border-dashed border-muted rounded-lg">
                      <p className="text-muted-foreground">
                        {openSpots} open spot{openSpots > 1 ? 's' : ''} remaining
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pending Applications (Creator Only) */}
            {isCreator && pendingApplications.length > 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Pending Applications ({pendingApplications.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingApplications.map((application: any) => (
                      <div key={application.id} className="flex items-center gap-3 p-4 border rounded-lg">
                        <Link to={application.user?.user_id ? `/user/${application.user.user_id}` : '#'} className="focus:outline-none">
                          <Avatar className="cursor-pointer hover:scale-105 transition-transform">
                            {application.user?.avatar_url ? (
                              application.user.avatar_url.startsWith('http') || application.user.avatar_url.startsWith('data:') ? (
                                <AvatarImage src={application.user.avatar_url} />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-primary to-secondary rounded-full">
                                  {application.user.avatar_url}
                                </div>
                              )
                            ) : (
                              <AvatarFallback className="bg-muted">
                                {getInitials(application.user?.full_name || '')}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </Link>
                        <div className="flex-1">
                          <Link to={application.user?.user_id ? `/user/${application.user.user_id}` : '#'} className="font-medium hover:underline focus:outline-none">
                            {application.user?.full_name}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            Applied {formatDate(application.applied_at)}
                          </p>
                          {application.user?.bio && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {application.user.bio}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleManageApplication(application.id, 'accepted')}
                            disabled={manageApplication.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleManageApplication(application.id, 'rejected')}
                            disabled={manageApplication.isPending}
                            className="text-destructive hover:text-destructive"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card className="glass-card">
              <CardContent className="pt-6">
                {isCreator ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      You are the creator of this team
                    </p>
                    <Link to={`/chat/${team.id}`} className="block">
                      <Button className="w-full btn-gradient">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Team Chat
                      </Button>
                    </Link>
                  </div>
                ) : userApplication ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted">
                      {userApplication.status === 'pending' && (
                        <>
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium">Application Pending</span>
                        </>
                      )}
                      {userApplication.status === 'accepted' && (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Application Accepted</span>
                        </>
                      )}
                      {userApplication.status === 'rejected' && (
                        <>
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium">Application Rejected</span>
                        </>
                      )}
                    </div>
                    {userApplication.status === 'accepted' && (
                      <>
                        <Link to={`/chat/${team.id}`} className="block">
                          <Button className="w-full btn-gradient">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Team Chat
                          </Button>
                        </Link>
                        <Button
                          className="w-full btn-gradient-secondary"
                          onClick={async () => {
                            try {
                              await leaveTeam.mutateAsync(team.id);
                              toast({
                                title: 'Left Team',
                                description: 'You have left the team.',
                              });
                              navigate('/my-teams');
                            } catch (error) {
                              toast({
                                title: 'Error',
                                description: 'Failed to leave team. Please try again.',
                                variant: 'destructive',
                              });
                            }
                          }}
                          disabled={leaveTeam.isPending}
                        >
                          {leaveTeam.isPending ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                          ) : null}
                          Leave Team
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {openSpots > 0 ? (
                      <Button
                        className="w-full btn-gradient"
                        onClick={handleApply}
                        disabled={applyToTeam.isPending}
                      >
                        {applyToTeam.isPending ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        ) : (
                          <UserPlus className="h-4 w-4 mr-2" />
                        )}
                        Apply to Join
                      </Button>
                    ) : (
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          This team is currently full
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team Stats */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Team Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Team Size</span>
                  <span className="font-medium">{team.team_size} members</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Members</span>
                  <span className="font-medium">{acceptedMembers.length + 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Open Spots</span>
                  <span className="font-medium">{openSpots}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending Applications</span>
                  <span className="font-medium">{pendingApplications.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetails;