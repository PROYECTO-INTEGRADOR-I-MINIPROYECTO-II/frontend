import { useEffect } from 'react';

// WCAG 2.4.2: cada página tiene un título distinto.
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · Synk`;
  }, [title]);
}
