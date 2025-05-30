interface SkeletonLoaderProps {
  variant?: 'text' | 'card' | 'form' | 'custom';
  lines?: number;
  className?: string;
}

export default function SkeletonLoader({ 
  variant = 'text', 
  lines = 1,
  className = ''
}: SkeletonLoaderProps) {
  const baseClass = "animate-pulse bg-gray-200 rounded";

  if (variant === 'text') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div 
            key={index} 
            className={`${baseClass} h-4 ${index === lines - 1 ? 'w-3/4' : 'w-full'}`}
          />
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className={`${baseClass} h-6 w-3/4 mb-4`} />
        <div className="space-y-2">
          <div className={`${baseClass} h-4 w-full`} />
          <div className={`${baseClass} h-4 w-full`} />
          <div className={`${baseClass} h-4 w-2/3`} />
        </div>
      </div>
    );
  }

  if (variant === 'form') {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Name fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className={`${baseClass} h-4 w-20 mb-2`} />
            <div className={`${baseClass} h-10 w-full`} />
          </div>
          <div>
            <div className={`${baseClass} h-4 w-20 mb-2`} />
            <div className={`${baseClass} h-10 w-full`} />
          </div>
        </div>
        
        {/* Email field */}
        <div>
          <div className={`${baseClass} h-4 w-24 mb-2`} />
          <div className={`${baseClass} h-10 w-full`} />
        </div>
        
        {/* Phone field */}
        <div>
          <div className={`${baseClass} h-4 w-20 mb-2`} />
          <div className={`${baseClass} h-10 w-full`} />
        </div>
        
        {/* Submit button */}
        <div className={`${baseClass} h-12 w-full`} />
      </div>
    );
  }

  // Custom variant - just return the base class for custom usage
  return <div className={`${baseClass} ${className}`} />;
}