import { cn } from '@/lib/utils';

interface LoadingShimmerProps {
  className?: string;
  count?: number;
  variant?: 'card' | 'text' | 'circle' | 'button';
}

const LoadingShimmer = ({ className, count = 1, variant = 'card' }: LoadingShimmerProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'circle':
        return 'w-12 h-12 rounded-full';
      case 'button':
        return 'h-10 rounded-lg';
      case 'card':
      default:
        return 'h-24 rounded-xl';
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'shimmer bg-muted animate-pulse',
            getVariantClasses(),
            className
          )}
        />
      ))}
    </>
  );
};

export default LoadingShimmer;