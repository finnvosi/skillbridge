// Reactive translation hook. Reads locale from the app store so the UI
// re-renders when the language changes. Bound to i18n.t with explicit locale.
import { useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { t, formatDate } from '../i18n';
import { Locale } from '../types';

export function useT() {
  const locale = useAppStore((s) => s.locale);
  const translate = useCallback(
    (key: string, vars?: Record<string, string | number>) => t(key, vars, locale),
    [locale]
  );
  const fmtDate = useCallback(
    (iso: string) => formatDate(iso, locale),
    [locale]
  );
  return { t: translate, locale, formatDate: fmtDate } as {
    t: (key: string, vars?: Record<string, string | number>) => string;
    locale: Locale;
    formatDate: (iso: string) => string;
  };
}
