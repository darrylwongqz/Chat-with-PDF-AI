'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function useRouteChange() {
  const [isChanging, setIsChanging] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Trigger on initial load
  useEffect(() => {
    setIsChanging(true);
    const timer = setTimeout(() => {
      setIsChanging(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Trigger on route changes
  useEffect(() => {
    setIsChanging(true);
    const timer = setTimeout(() => {
      setIsChanging(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return isChanging;
}
