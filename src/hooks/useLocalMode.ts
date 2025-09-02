import { useEffect, useState } from 'react';
import { isLocalOnlyActive } from '@/utils/activateLocalMode';

export const useLocalMode = () => {
  const [isLocalMode, setIsLocalMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize local mode check
    const checkLocalMode = () => {
      setIsLocalMode(isLocalOnlyActive());
      setIsLoading(false);
    };

    // Check immediately
    checkLocalMode();

    // Listen for local mode activation
    const handleLocalModeActivated = () => {
      setIsLocalMode(true);
    };

    window.addEventListener('local-mode-activated', handleLocalModeActivated);

    return () => {
      window.removeEventListener('local-mode-activated', handleLocalModeActivated);
    };
  }, []);

  return { isLocalMode, isLoading };
};