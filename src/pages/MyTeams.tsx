import { useState } from 'react';
import { useMyTeams, useDeleteTeam, useManageApplication } from '@/hooks/useTeams';
import { useMyApplications } from '@/hooks/useTeams';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  Settings, 
  Trash2,
  Plus,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import ClickableAvatar from '@/components/ClickableAvatar';

const MyTeams = () => {
  const { data: myTeams, isLoading: teamsLoading } = useMyTeams();
  const { data: applications, isLoading: applicationsLoading } = useMyApplications();
  const deleteTeam = useDeleteTeam();
  const manageApplication = useManageApplication();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (window.confirm(`Are you sure you want to delete "${teamName}"? This action cannot be undone.`)) {
      try {
        await deleteTeam.mutateAsync(teamId);
        toast({
          title: "Team Deleted",
          description: "Your team has been deleted successfully."
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete team. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (teamsLoading || applicationsLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const createdTeams = myTeams?.created || [];
  const joinedTeams = myTeams?.joined || [];

  const handleManageApplicant = async (applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      await manageApplication.mutateAsync({ applicationId, status });
      toast({
        title: status === 'accepted' ? 'Application Accepted' : 'Application Rejected',
        description: `The application has been ${status}.`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update application status. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Collect all pending applicants for teams created by the user
  const pendingApplicants = createdTeams
    .flatMap(team =>
      (team.applicants || [])
        .filter(app => app.status === 'pending')
        .map(app => ({ ...app, team }))
    );

  return (
    <div className="container mx-auto px-4 py-6 flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Teams</h1>
          <p className="text-muted-foreground">Manage your teams and applications</p>
        </div>
        <Link to="/teams/create">
          <Button className="btn-gradient">
            <Plus className="h-4 w-4 mr-2" />
            Create Team
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="created" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="manageApplicants">
            Manage Applicants{pendingApplicants.length > 0 && ` (${pendingApplicants.length})`}
          </TabsTrigger>
          <TabsTrigger value="created">Created ({createdTeams.length})</TabsTrigger>
          <TabsTrigger value="joined">Joined ({joinedTeams.length})</TabsTrigger>
          <TabsTrigger value="applications">Applications ({applications?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="manageApplicants" className="space-y-4 flex-1 flex flex-col">
          {pendingApplicants.length === 0 ? (
            <div className="full-height-content">
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No pending applicants</h3>
                  <p className="text-muted-foreground mb-4">
                    All caught up! No one has applied to your teams yet.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            pendingApplicants.map((application) => (
              <Card key={application.id} className="glass-card card-interactive transition-all duration-200 p-6">
                <CardHeader className="p-0">
                  <div className="flex items-center gap-4">
                    <ClickableAvatar profile={application.user} size="md" showName={false} className="hover:text-primary transition-colors" />
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
                      <Link to={`/user/${application.user?.user_id}`} className="font-semibold text-lg hover:underline focus:outline-none">
                        {application.user?.full_name}
                      </Link>
                      <span className="text-base text-muted-foreground">applied to <span className="font-semibold">{application.team.title}</span></span>
                    </div>
                    <div className="flex gap-3">
                      {application.status === 'pending' ? (
                        <>
                          <Button size="lg" className="btn-gradient text-base px-6 py-2" onClick={async () => {
                            await handleManageApplicant(application.id, 'accepted');
                          }} disabled={manageApplication.isPending}>
                            Accept
                          </Button>
                          <Button size="lg" variant="outline" className="text-destructive hover:text-destructive text-base px-6 py-2" onClick={async () => {
                            await handleManageApplicant(application.id, 'rejected');
                          }} disabled={manageApplication.isPending}>
                            Reject
                          </Button>
                        </>
                      ) : (
                        <Badge className={getStatusColor(application.status) + ' text-base px-4 py-2'}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(application.status)}
                            <span className="capitalize">{application.status}</span>
                          </div>
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2 ml-16">{formatDate(application.applied_at)}</div>
                </CardHeader>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="created" className="space-y-4 flex-1 flex flex-col">
          {createdTeams.length === 0 ? (
            <div className="full-height-content">
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No teams created yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first team and start building something amazing!
                  </p>
                  <Link to="/teams/create">
                    <Button className="btn-gradient">Create Your First Team</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          ) : (
            createdTeams.map((team) => (
              <Link key={team.id} to={`/teams/${team.id}`} className="block">
                <Card className="glass-card cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{team.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <span>Created {formatDate(team.created_at)}</span>
                          <span>•</span>
                          <Badge variant="secondary" className={`category-${team.category.toLowerCase()}`}>
                            {team.category}
                          </Badge>
                        </CardDescription>
                      </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/teams/${team.id}`)}>
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteTeam(team.id, team.title);
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {team.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{team.applicants?.filter((app: any) => app.status === 'accepted').length || 0}/{team.team_size - 1} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{team.applicants?.filter((app: any) => app.status === 'pending').length || 0} pending</span>
                      </div>
                    </div>
                      <Link to={`/chat/${team.id}`} className="block">
                        <Button className="btn-gradient w-full sm:w-auto">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Team Chat
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </TabsContent>

        <TabsContent value="joined" className="space-y-4 flex-1 flex flex-col">
          {joinedTeams.length === 0 ? (
            <div className="full-height-content">
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No teams joined yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Find and apply to teams that match your interests!
                  </p>
                  <Link to="/home">
                    <Button className="btn-gradient">Browse Teams</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          ) : (
            joinedTeams.map((team) => (
              <Link key={team.id} to={`/teams/${team.id}`} className="block">
                <Card className="glass-card cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{team.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <span>by {team.creator?.full_name}</span>
                          <span>•</span>
                          <Badge variant="secondary" className={`category-${team.category.toLowerCase()}`}>
                            {team.category}
                          </Badge>
                        </CardDescription>
                      </div>
                    <Link to={`/chat/${team.id}`} onClick={(e) => e.preventDefault()}>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Chat
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {team.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </TabsContent>

        <TabsContent value="applications" className="space-y-4 flex-1 flex flex-col">
          {!applications || applications.length === 0 ? (
            <div className="full-height-content">
              <Card className="text-center py-12">
                <CardContent>
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Apply to teams and track your application status here!
                  </p>
                  <Link to="/home">
                    <Button className="btn-gradient">Browse Teams</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          ) : (
            applications.map((application) => (
              <Card key={application.id} className="glass-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{application.team?.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span>Applied {formatDate(application.applied_at)}</span>
                        <span>•</span>
                        <span>by {application.team?.creator?.full_name}</span>
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(application.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(application.status)}
                        <span className="capitalize">{application.status}</span>
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {application.team?.description}
                  </p>
                  {application.status === 'accepted' && (
                    <div className="mt-4">
                      <Link to={`/chat/${application.team?.id}`}>
                        <Button size="sm" className="btn-gradient">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Join Team Chat
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyTeams;