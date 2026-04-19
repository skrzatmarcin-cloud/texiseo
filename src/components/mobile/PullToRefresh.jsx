import { useState, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PullToRefresh({ onRefresh, children }) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e) => {
      if (container.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
        setPulling(true);
      }
    };

    const handleTouchMove = (e) => {
      if (!pulling) return;
      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - startY.current);
      setPullDistance(distance);

      if (distance > 80 && !refreshing) {
        setRefreshing(true);
        onRefresh?.().finally(() => {
          setRefreshing(false);
          setPulling(false);
          setPullDistance(0);
        });
      }
    };

    const handleTouchEnd = () => {
      setPulling(false);
      setPullDistance(0);
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pulling, refreshing, onRefresh]);

  return (
    <div ref={containerRef} className="relative overflow-y-auto">
      {(pulling || refreshing) && (
        <div
          className={cn(
            'absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-300',
            refreshing ? 'h-12 bg-primary/10' : 'bg-transparent'
          )}
          style={{ height: Math.min(pullDistance, 60) }}
        >
          {(pulling || refreshing) && (
            <RefreshCw className={cn('h-5 w-5 text-primary', refreshing && 'animate-spin')} />
          )}
        </div>
      )}
      {children}
    </div>
  );
}