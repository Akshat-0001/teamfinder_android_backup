import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Save } from 'lucide-react';
import { COMMON_SKILLS, UNIVERSITIES, COMMON_ROLES } from '@/types';
import ProfileAvatars from '@/components/ProfileAvatars';
import ProfileLinks from '@/components/ProfileLinks';
import { X } from 'lucide-react';
import { TypeaheadSelect } from '@/components/ui/TypeaheadSelect';

const ProfileSetup = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    university: '',
    bio: '',
    interests: [] as string[],
    skills: [] as string[],
    avatar_url: '',
    github_url: '',
    linkedin_url: '',
    leetcode_url: '',
    codeforces_url: '',
    geeksforgeeks_url: '',
    codingame_url: '',
    portfolio_url: '',
    gender: '',
    roles: [] as string[],
  });
  const [newInterest, setNewInterest] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [universitySearch, setUniversitySearch] = useState('');
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    if (user && !user.email_confirmed_at) {
      navigate('/verify-email', { replace: true });
    }
  }, [user, navigate]);

  const filteredUniversities = useMemo(() => {
    if (!universitySearch) return UNIVERSITIES;
    return UNIVERSITIES.filter(uni =>
      uni.toLowerCase().includes(universitySearch.toLowerCase())
    );
  }, [universitySearch]);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const updates = { ...formData, avatar_url: formData.avatar_url ? formData.avatar_url : null };
      await updateProfile(updates);
      setSuccess('Profile setup complete! Redirecting...');
      setTimeout(() => navigate('/home'), 1200);
    } catch (err) {
      setError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const addSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
      <div className="max-w-2xl mx-auto">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold mb-2">Set Up Your Profile</CardTitle>
            <p className="text-muted-foreground mb-2">Complete your profile to get the best experience. You can skip for now and edit later.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  {formData.avatar_url ? (
                    <AvatarImage src={`/avatars/${formData.avatar_url}`} alt="Avatar" />
                  ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(formData.full_name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="ml-2">
                  <ProfileAvatars
                    selectedAvatar={formData.avatar_url}
                    onSelect={(avatar) => setFormData(prev => ({ ...prev, avatar_url: avatar }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="university">University</Label>
                <TypeaheadSelect
                  options={UNIVERSITIES}
                  value={formData.university}
                  onValueChange={university => setFormData(prev => ({ ...prev, university: university as string }))}
                  placeholder="Select your university"
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell others about yourself..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Roles (up to 3)</Label>
                <TypeaheadSelect
                  options={COMMON_ROLES.filter(role => !formData.roles.includes(role))}
                  value={formData.roles}
                  onValueChange={roles => setFormData(prev => ({ ...prev, roles: roles as string[] }))}
                  placeholder="Add a role"
                  multiSelect
                  maxSelect={3}
                />
              </div>
              <div>
                <Label>Skills</Label>
                <TypeaheadSelect
                  options={COMMON_SKILLS.filter(skill => !formData.skills.includes(skill))}
                  value={formData.skills}
                  onValueChange={skills => setFormData(prev => ({ ...prev, skills: skills as string[] }))}
                  placeholder="Add a skill"
                  multiSelect
                  maxSelect={99}
                />
              </div>

              <div>
                <Label>Interests</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Add an interest"
                    onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                  />
                  <Button type="button" variant="outline" onClick={addInterest}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.interests.map((interest) => (
                    <Badge key={interest} variant="outline" className="cursor-pointer" onClick={() => removeInterest(interest)}>
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Gender</Label>
                <div className="flex gap-2 mt-2">
                  {['male', 'female', 'others'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`px-4 py-2 rounded-full border font-medium transition-colors duration-150 focus:outline-none ${
                        formData.gender === option
                          ? 'bg-primary text-primary-foreground border-primary shadow'
                          : 'bg-muted text-muted-foreground border-border hover:bg-accent/10'
                      }`}
                      onClick={() => setFormData((prev) => ({ ...prev, gender: option }))}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Profile Links */}
              <ProfileLinks
                profile={{
                  id: '',
                  user_id: user?.id || '',
                  email: user?.email || '',
                  created_at: '',
                  updated_at: '',
                  ...formData
                }}
                isEditing={true}
                onLinksChange={(links) => setFormData(prev => ({ ...prev, ...links }))}
              />
            </div>

            {error && <div className="text-destructive text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}

            <div className="flex flex-col gap-2 mt-6">
              <Button onClick={handleSave} className="w-full btn-gradient" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save and Continue'}
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => navigate('/home')}>
                Skip for now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSetup; 