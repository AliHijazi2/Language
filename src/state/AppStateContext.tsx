import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { AppState, Level } from '../types';
import { applyAnswer, createProgress } from '../logic/spacedRepetition';
import { emptyState, loadState, saveState } from '../storage/store';

interface AppStateContextValue {
  state: AppState;
  ready: boolean; // true, sobald der gespeicherte Zustand geladen wurde
  completeOnboarding: (courseId: string, level: Level) => void;
  recordAnswer: (lessonId: string, correct: boolean) => void;
  setLevel: (level: Level) => void;
  toggleTopic: (topic: string) => void;
  clearTopics: () => void;
  resetProgress: () => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(emptyState);
  const [ready, setReady] = useState(false);

  // Gespeicherten Zustand beim Start einmalig laden.
  useEffect(() => {
    let active = true;
    loadState().then((loaded) => {
      if (active) {
        setState(loaded);
        setReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Zustand nach jeder Änderung persistieren (aber nicht vor dem ersten Laden).
  const readyRef = useRef(ready);
  readyRef.current = ready;
  useEffect(() => {
    if (readyRef.current) {
      void saveState(state);
    }
  }, [state]);

  const completeOnboarding = useCallback((courseId: string, level: Level) => {
    setState((prev) => ({ ...prev, courseId, level, onboarded: true }));
  }, []);

  const setLevel = useCallback((level: Level) => {
    setState((prev) => ({ ...prev, level }));
  }, []);

  const toggleTopic = useCallback((topic: string) => {
    setState((prev) => {
      const active = prev.topics.includes(topic);
      return {
        ...prev,
        topics: active ? prev.topics.filter((t) => t !== topic) : [...prev.topics, topic],
      };
    });
  }, []);

  const clearTopics = useCallback(() => {
    setState((prev) => ({ ...prev, topics: [] }));
  }, []);

  const recordAnswer = useCallback((lessonId: string, correct: boolean) => {
    setState((prev) => {
      const now = Date.now();
      const current = prev.progress[lessonId] ?? createProgress(lessonId, now);
      const updated = applyAnswer(current, correct, now);
      return {
        ...prev,
        progress: { ...prev.progress, [lessonId]: updated },
      };
    });
  }, []);

  const resetProgress = useCallback(() => {
    // Kurs/Niveau bleiben erhalten; nur der Lernfortschritt wird geleert.
    // Der Save-Effekt persistiert den neuen (leeren) Fortschritt automatisch.
    setState((prev) => ({ ...prev, progress: {} }));
  }, []);

  const value = useMemo<AppStateContextValue>(
    () => ({
      state,
      ready,
      completeOnboarding,
      recordAnswer,
      setLevel,
      toggleTopic,
      clearTopics,
      resetProgress,
    }),
    [
      state,
      ready,
      completeOnboarding,
      recordAnswer,
      setLevel,
      toggleTopic,
      clearTopics,
      resetProgress,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState muss innerhalb von AppStateProvider genutzt werden.');
  return ctx;
}
