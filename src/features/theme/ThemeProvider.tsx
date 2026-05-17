import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeMode = useSelector((state: RootState) => state.theme.mode);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(themeMode);
  }, [themeMode]);

  return <>{children}</>;
}
