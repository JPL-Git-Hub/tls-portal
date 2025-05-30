import { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import SkeletonLoader from './SkeletonLoader';
import { useLoadingState } from '../hooks/useLoadingState';

// Example component showing how to handle loading states
export default function DataFetchExample() {
  const { isLoading, error, startLoading, stopLoading, setError } = useLoadingState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Simulate data fetching
    const fetchData = async () => {
      startLoading();
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate success or failure
        if (Math.random() > 0.8) {
          throw new Error('Failed to fetch data');
        }
        
        setData({
          title: 'Example Data',
          description: 'This is example data that was fetched',
          items: ['Item 1', 'Item 2', 'Item 3']
        });
      } catch (err) {
        setError(err as Error);
      } finally {
        stopLoading();
      }
    };

    fetchData();
  }, [startLoading, stopLoading, setError]);

  // Show skeleton loader while loading
  if (isLoading) {
    return (
      <div className="p-6">
        <SkeletonLoader variant="card" />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-semibold">Error Loading Data</h3>
        <p className="text-red-600 mt-1">{error.message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-3 text-red-600 underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show data
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold">{data?.title}</h3>
      <p className="text-gray-600 mt-2">{data?.description}</p>
      <ul className="mt-4 space-y-2">
        {data?.items.map((item: string, index: number) => (
          <li key={index} className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}