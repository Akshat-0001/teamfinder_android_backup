import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const AVATAR_ICONS = [
  '🦊', '🐱', '🐶', '🐼', '🐻', '🦁', '🐯', '🐸', '🐙', '🦄', 
  '🦋', '🐝', '🐧', '🦉', '🐺', '🦖', '🐲', '🎭', '🎨', '🎪',
  '🌟', '⚡', '🔥', '❄️', '🌙', '☀️', '🌈', '🎵', '🎯', '🎪',
  '🚀', '⭐', '💎', '🎈', '🎁', '🏆', '🎊', '🌸', '🌺', '🌻'
];

interface ProfileAvatarsProps {
  selectedAvatar?: string;
  onSelect: (avatar: string) => void;
  trigger?: React.ReactNode;
}

const ProfileAvatars = ({ selectedAvatar, onSelect, trigger }: ProfileAvatarsProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full">
            Choose Avatar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose Your Avatar</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-8 gap-2 p-4">
          {AVATAR_ICONS.map((icon, index) => (
            <Button
              key={index}
              variant={selectedAvatar === icon ? "default" : "ghost"}
              className={`aspect-square text-2xl p-2 ${
                selectedAvatar === icon ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onSelect(icon)}
            >
              {icon}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileAvatars;