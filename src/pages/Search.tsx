import { useState } from 'react';
import { useTeams } from '@/hooks/useTeams';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search as SearchIcon, Users, Calendar, Filter } from 'lucide-react';
import { TEAM_CATEGORIES, COMMON_SKILLS } from '@/types';

const Search = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const { data: teams, isLoading } = useTeams({
    search: search || undefined,
    category: category || undefined,
    skills: selectedSkills.length > 0 ? selectedSkills : undefined
  });

  const filteredTeams = teams || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getOpenSpots = (team: any) => {
    const acceptedApplicants = team.applicants?.filter((app: any) => app.status === 'accepted').length || 0;
    return team.team_size - acceptedApplicants - 1; // -1 for the creator
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setSelectedSkills([]);
  };

  const hasActiveFilters = search || category || selectedSkills.length > 0;

  return (
    <div className="container mx-auto px-4 py-6 pb-20">
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
        <div>
          <h1 className="text-2xl font-bold">Search Teams</h1>
          <p className="text-muted-foreground">Find the perfect team for you</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search teams by name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters Toggle */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1">
              {[category, ...selectedSkills].filter(Boolean).length}
            </Badge>
          )}
        </Button>
        
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="text-sm">
            Clear all
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
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

            {/* Skills Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Skills</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                {COMMON_SKILLS.map((skill) => (
                  <div key={skill} className="flex items-center space-x-2">
                    <Checkbox
                      id={skill}
                      checked={selectedSkills.includes(skill)}
                      onCheckedChange={() => toggleSkill(skill)}
                    />
                    <label
                      htmlFor={skill}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {skill}
                    </label>
                  </div>
                ))}
              </div>
              {selectedSkills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
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
        ) : filteredTeams.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No teams found</h3>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters 
                  ? "Try adjusting your search criteria or clearing some filters"
                  : "There are no teams available right now"
                }
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Found {filteredTeams.length} team{filteredTeams.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            {filteredTeams.map((team) => (
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
                          <Badge 
                            key={skill} 
                            variant={selectedSkills.includes(skill) ? "default" : "outline"} 
                            className="text-xs"
                          >
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
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;