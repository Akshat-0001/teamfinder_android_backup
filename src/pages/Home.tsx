import { useState, useEffect } from 'react';
import { useTeams } from '@/hooks/useTeams';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import ClickableAvatar from '@/components/ClickableAvatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { Plus, Search, Users, Calendar, ArrowUpDown } from 'lucide-react';
import { TEAM_CATEGORIES } from '@/types';
import { TypeaheadSelect } from '@/components/ui/TypeaheadSelect';

const Home = () => {
  const { user, profile } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('');
  
  // Debounce search to avoid excessive API calls
  const debouncedSearch = useDebounce(search, 500);
  
  const { data: teams, isLoading } = useTeams({
    search: debouncedSearch || undefined,
    category: category || undefined
  });

  useEffect(() => {
    console.debug('[Home] TEAM_CATEGORIES:', TEAM_CATEGORIES);
    console.debug('[Home] Selected category:', category);
  }, [category]);

  useEffect(() => {
    if (teams) {
      console.debug('[Home] Teams returned:', teams);
      if (teams.length === 0) {
        console.warn('[Home] No teams found for category:', category);
      }
    }
  }, [teams, category]);

  // Sort teams based on user preference
  const getFilteredTeams = (teams: any[]) => {
    if (!profile) return teams;
    if (sortBy === 'university') {
      return teams.filter(team => team.creator?.university === profile.university);
    }
    if (sortBy === 'skills') {
      return teams.filter(team =>
        team.required_skills?.some((skill: string) => profile.skills?.includes(skill))
      );
    }
    return teams;
  };
  const filteredTeams = getFilteredTeams(teams || []);

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
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="glass-card">
              <CardHeader>
                <div className="shimmer h-6 bg-muted rounded w-3/4"></div>
                <div className="shimmer h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="shimmer h-4 bg-muted rounded w-full mb-2"></div>
                <div className="shimmer h-4 bg-muted rounded w-3/4 mb-4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="shimmer h-6 bg-muted rounded w-16"></div>
                  <div className="shimmer h-6 bg-muted rounded w-16"></div>
                </div>
                <div className="flex justify-between">
                  <div className="shimmer h-4 bg-muted rounded w-20"></div>
                  <div className="shimmer h-4 bg-muted rounded w-20"></div>
                </div>
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
        
        <div className="flex gap-4 items-center justify-between w-full">
          <Select value={category || 'all'} onValueChange={val => {
            console.debug('[Home] Category changed to:', val);
            setCategory(val === 'all' ? '' : val);
          }}>
            <SelectTrigger className="min-w-[180px] max-w-[220px] w-[200px] text-center mx-0">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {TEAM_CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="flex-[1] max-w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="ending">Ending Soon</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="flex flex-col space-y-4">
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
              <Card className="glass-card card-interactive">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{team.title}</CardTitle>
                      <CardDescription className="flex flex-col gap-0 mt-1">
                        <div className="flex items-center gap-2">
                          {team.creator && (
                            // Fix: Render ClickableAvatar as a non-link to avoid <a> inside <a>
                            <ClickableAvatar 
                              profile={team.creator} 
                              size="sm" 
                              showName 
                              className="hover:text-primary transition-colors"
                              asChild // pass a prop to render as a span or div instead of a Link
                            />
                          )}
                          <span>•</span>
                          <span className="text-xs">{formatDate(team.created_at)}</span>
                        </div>
                        {team.creator?.university && (
                          <span className="text-xs text-muted-foreground ml-8">{team.creator.university}</span>
                        )}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className={`category-${team.category.toLowerCase()} badge-premium`}>
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
                        <span key={skill} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                      {team.required_skills.length > 3 && (
                        <span className="skill-tag">
                          +{team.required_skills.length - 3} more
                        </span>
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