import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';

const FloatingActionButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Show FAB on specific pages
  const showOnPages = ['/home', '/my-teams', '/search'];
  const shouldShow = showOnPages.includes(location.pathname);

  if (!shouldShow) return null;

  const handleClick = () => {
    if (location.pathname === '/home' || location.pathname === '/search') {
      navigate('/teams/create');
    } else if (location.pathname === '/my-teams') {
      navigate('/teams/create');
    }
  };

  return (
    <Button
      onClick={handleClick}
      className="fab flex items-center justify-center text-white hover:scale-110 active:scale-95"
      size="icon"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
};

export default FloatingActionButton;