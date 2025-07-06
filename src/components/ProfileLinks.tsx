import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Github, 
  Linkedin, 
  Code, 
  Trophy, 
  Globe, 
  ExternalLink,
  Plus,
  X 
} from 'lucide-react';
import { Profile } from '@/types';

interface ProfileLinksProps {
  profile: Profile;
  isEditing?: boolean;
  onLinksChange?: (links: Partial<Profile>) => void;
}

const PLATFORM_CONFIGS = {
  github_url: {
    name: 'GitHub',
    icon: Github,
    placeholder: 'https://github.com/username',
    color: 'bg-gray-900 text-white'
  },
  linkedin_url: {
    name: 'LinkedIn',
    icon: Linkedin,
    placeholder: 'https://linkedin.com/in/username',
    color: 'bg-blue-600 text-white'
  },
  leetcode_url: {
    name: 'LeetCode',
    icon: Code,
    placeholder: 'https://leetcode.com/username',
    color: 'bg-orange-500 text-white'
  },
  codeforces_url: {
    name: 'Codeforces',
    icon: Trophy,
    placeholder: 'https://codeforces.com/profile/username',
    color: 'bg-blue-700 text-white'
  },
  geeksforgeeks_url: {
    name: 'GeeksforGeeks',
    icon: Code,
    placeholder: 'https://auth.geeksforgeeks.org/user/username',
    color: 'bg-green-600 text-white'
  },
  codingame_url: {
    name: 'CodinGame',
    icon: Trophy,
    placeholder: 'https://www.codingame.com/profile/username',
    color: 'bg-purple-600 text-white'
  },
  portfolio_url: {
    name: 'Portfolio',
    icon: Globe,
    placeholder: 'https://yourportfolio.com',
    color: 'bg-indigo-600 text-white'
  }
};

const ProfileLinks: React.FC<ProfileLinksProps> = ({ profile, isEditing = false, onLinksChange }) => {
  const [links, setLinks] = useState({
    github_url: profile.github_url || '',
    linkedin_url: profile.linkedin_url || '',
    leetcode_url: profile.leetcode_url || '',
    codeforces_url: profile.codeforces_url || '',
    geeksforgeeks_url: profile.geeksforgeeks_url || '',
    codingame_url: profile.codingame_url || '',
    portfolio_url: profile.portfolio_url || ''
  });

  const handleLinkChange = (platform: keyof typeof links, value: string) => {
    const updatedLinks = { ...links, [platform]: value };
    setLinks(updatedLinks);
    onLinksChange?.(updatedLinks);
  };

  const hasAnyLinks = Object.values(links).some(link => link.trim() !== '');

  if (isEditing) {
    return (
      <div className="space-y-4">
        <Label className="text-base font-semibold">Profile Links</Label>
        <div className="grid gap-4">
          {Object.entries(PLATFORM_CONFIGS).map(([key, config]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key} className="flex items-center gap-2 text-sm">
                <config.icon className="h-4 w-4" />
                {config.name}
              </Label>
              <Input
                id={key}
                value={links[key as keyof typeof links]}
                onChange={(e) => handleLinkChange(key as keyof typeof links, e.target.value)}
                placeholder={config.placeholder}
                className="text-sm"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!hasAnyLinks) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Links</h3>
      <div className="flex flex-wrap gap-2">
        {Object.entries(links).map(([key, url]) => {
          if (!url.trim()) return null;
          
          const config = PLATFORM_CONFIGS[key as keyof typeof PLATFORM_CONFIGS];
          const Icon = config.icon;
          
          return (
            <Badge
              key={key}
              variant="secondary"
              className={`${config.color} hover:opacity-80 cursor-pointer transition-opacity`}
              onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
            >
              <Icon className="h-3 w-3 mr-1" />
              <span>{config.name}</span>
              <ExternalLink className="h-3 w-3 ml-1" />
            </Badge>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileLinks;