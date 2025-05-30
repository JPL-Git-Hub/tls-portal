import { Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LazyLoadWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  text?: string;
}

export default function LazyLoadWrapper({ 
  children, 
  fallback,
  text = 'Loading...'
}: LazyLoadWrapperProps) {
  return (
    <Suspense fallback={fallback || <LoadingSpinner text={text} />}>
      {children}
    </Suspense>
  );
}