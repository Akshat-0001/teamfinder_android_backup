import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Profile } from '@/types';

interface ClickableAvatarProps {
  profile: Profile;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

const ClickableAvatar: React.FC<ClickableAvatarProps> = ({ 
  profile, 
  size = 'md', 
  showName = false,
  className = '' 
}) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const content = (
    <div className={`flex items-center gap-2 ${className}`}>
      <Avatar className={sizeClasses[size]}>
        {profile.avatar_url ? (
          <div className="w-full h-full flex items-center justify-center text-xl bg-gradient-to-br from-primary to-secondary rounded-full">
            {profile.avatar_url}
          </div>
        ) : (
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(profile.full_name)}
          </AvatarFallback>
        )}
      </Avatar>
      {showName && (
        <span className="text-sm font-medium hover:text-primary transition-colors">
          {profile.full_name}
        </span>
      )}
    </div>
  );

  return (
    <Link 
      to={`/user/${profile.user_id}`}
      className="hover:opacity-80 transition-opacity cursor-pointer"
      onClick={(e) => e.stopPropagation()}
    >
      {content}
    </Link>
  );
};

export default ClickableAvatar;