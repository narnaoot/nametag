import { useState, useEffect } from 'react';

// Breakpoints: phone < 768 ≤ tablet < 1180 ≤ desktop.
// The design is phone-first; tablet and desktop are "the same board, more room".
export function useViewport() {
  const get = () => (typeof window === 'undefined' ? 1024 : window.innerWidth);
  const [width, setWidth] = useState(get);
  useEffect(() => {
    const onResize = () => setWidth(get());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const kind = width >= 1180 ? 'desktop' : width >= 768 ? 'tablet' : 'phone';
  return { width, kind, isPhone: kind === 'phone', isTablet: kind === 'tablet', isDesktop: kind === 'desktop' };
}

export default useViewport;
