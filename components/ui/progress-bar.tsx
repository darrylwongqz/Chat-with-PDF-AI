'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

export function ProgressBar() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [previousPathname, setPreviousPathname] = useState('');
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Skip animation on initial load of landing page
  useEffect(() => {
    // Only animate if we're not on the landing page
    if (pathname !== '/') {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Trigger on route changes, but not for initial landing page load
  useEffect(() => {
    // Store the previous pathname
    if (previousPathname !== pathname) {
      // Only animate if we're not navigating to the landing page as the first page
      if (!(previousPathname === '' && pathname === '/')) {
        setIsAnimating(true);
        const timer = setTimeout(() => {
          setIsAnimating(false);
        }, 800);
        return () => clearTimeout(timer);
      }
      setPreviousPathname(pathname);
    }
  }, [pathname, searchParams, previousPathname]);

  return (
    <>
      {isAnimating && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 z-[100] shadow-sm"
          initial={{ width: '0%', opacity: 0.7 }}
          animate={{ width: '100%', opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />
      )}
    </>
  );
}
