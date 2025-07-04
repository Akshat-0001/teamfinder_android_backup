import { useState } from 'react';
import { useTeams } from '@/hooks/useTeams';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { Plus, Search, Users, Calendar } from 'lucide-react';
import { TEAM_CATEGORIES } from '@/types';

const Home = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  
  const { data: teams, isLoading } = useTeams({
    search: search || undefined,
    category: category || undefined
  });

  const filteredTeams = teams || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getOpenSpots = (team: any) => {
    const acceptedApplicants = team.applicants?.filter((app: any) => app.status === 'accepted').length || 0;
    return team.team_size - acceptedApplicants - 1; // -1 for the creator
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
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

  return (
    <div className="container mx-auto px-4 py-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Find Your Team</h1>
          <p className="text-muted-foreground">Discover amazing teams to join</p>
        </div>
        <Link to="/teams/create">
          <Button className="btn-gradient">
            <Plus className="h-4 w-4 mr-2" />
            Create Team
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All categories</SelectItem>
            {TEAM_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Teams Grid */}
      <div className="space-y-4">
        {filteredTeams.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No teams found</h3>
              <p className="text-muted-foreground mb-4">
                {search || category 
                  ? "Try adjusting your search or filters" 
                  : "Be the first to create a team!"
                }
              </p>
              {!search && !category && (
                <Link to="/teams/create">
                  <Button className="btn-gradient">Create Your Team</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredTeams.map((team) => (
            <Link key={team.id} to={`/teams/${team.id}`}>
              <Card className="glass-card hover:shadow-lg transition-all duration-200 active:scale-[0.98]">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{team.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span>by {team.creator?.full_name}</span>
                        <span>•</span>
                        <span className="text-xs">{formatDate(team.created_at)}</span>
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className={`category-${team.category.toLowerCase()}`}>
                      {team.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {team.description}
                  </p>
                  
                  {team.required_skills && team.required_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {team.required_skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {team.required_skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{team.required_skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{getOpenSpots(team)} spots left</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Team of {team.team_size}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;