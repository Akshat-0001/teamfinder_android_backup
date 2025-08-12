import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Profile } from '@/types';

interface ClickableAvatarProps {
  profile: Profile;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
  asChild?: boolean;
}

const ClickableAvatar: React.FC<ClickableAvatarProps> = ({ 
  profile, 
  size = 'md', 
  showName = false,
  className = '',
  asChild = false
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
          <AvatarImage src={`/avatars/${profile.avatar_url}`} alt="Avatar" />
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

  if (asChild) {
    return (
      <span className={`hover:opacity-80 transition-opacity cursor-pointer ${className}`}>{content}</span>
    );
  }
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