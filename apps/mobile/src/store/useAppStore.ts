// Local UI/session store for the worker vertical slice.
// Persists only the language choice. Demo applications, Passport details, and
// sharing state remain in memory and reset when the prototype reloads.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Locale, DemoApplication, DemoPassport, ApplicationStatus } from '../types';
import { DEMO_PASSPORT } from '../data/fixtures';

// Demo status progression: a submitted application advances through the tracker
// based on elapsed time since submission. Deriving status from submittedAt (instead
// of mutating stored state) keeps the tracker alive — it visibly moves — and stays
// consistent across reloads, because the same timestamp always yields the same stage.
export const APPLICATION_STAGE_MS = {
  under_review: 15_000,
  interview: 45_000,
  accepted: 90_000,
} as const;

export function effectiveStatus(app: DemoApplication): ApplicationStatus {
  const elapsed = Date.now() - new Date(app.submittedAt).getTime();
  if (elapsed >= APPLICATION_STAGE_MS.accepted) return 'accepted';
  if (elapsed >= APPLICATION_STAGE_MS.interview) return 'interview';
  if (elapsed >= APPLICATION_STAGE_MS.under_review) return 'under_review';
  return 'submitted';
}

interface AppState {
  locale: Locale;
  hasChosenLanguage: boolean;
  applications: DemoApplication[];
  passport: DemoPassport;
  setLocale: (locale: Locale) => void;
  chooseLanguage: (locale: Locale) => void;
  submitApplication: (app: DemoApplication) => void;
  hasAppliedToJob: (jobId: string) => boolean;
  setShareEnabled: (enabled: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      locale: 'km',
      hasChosenLanguage: false,
      applications: [],
      passport: DEMO_PASSPORT,

      setLocale: (locale) => set({ locale }),
      chooseLanguage: (locale) => set({ locale, hasChosenLanguage: true }),

      submitApplication: (app) => {
        // Demo only: avoid duplicate applications for the same job.
        const existing = get().applications.find((a) => a.jobId === app.jobId);
        if (existing) {
          set((s) => ({
            applications: s.applications.map((a) =>
              a.jobId === app.jobId ? app : a
            ),
          }));
          return;
        }
        set((s) => ({ applications: [app, ...s.applications] }));
      },

      hasAppliedToJob: (jobId) => get().applications.some((a) => a.jobId === jobId),

      setShareEnabled: (enabled) =>
        set((s) => ({ passport: { ...s.passport, shareEnabled: enabled } })),
    }),
    {
      name: 'worker-app-preferences-v2',
      storage: createJSONStorage(() => AsyncStorage),
      // Persist the language choice AND demo applications so the core loop
      // survives a reload. Worker/profile data must use an explicitly secured
      // storage design in production; for this local prototype, persisting the
      // demo applications array is safe and prevents "Applications" from wiping.
      partialize: (state) => ({
        locale: state.locale,
        hasChosenLanguage: state.hasChosenLanguage,
        applications: state.applications,
      }),
    }
  )
);
