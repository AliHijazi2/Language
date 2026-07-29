import { Course } from '../types';

/**
 * Verfügbare Sprachrichtungen. Aktuell nur 'de-ar' (Deutsch → libanesisches
 * Arabisch) aktiv; weitere sind als "bald verfügbar" sichtbar, damit die
 * Erweiterbarkeit klar wird.
 */
export const COURSES: Course[] = [
  {
    id: 'de-ar',
    fromLanguage: 'Deutsch',
    targetLanguage: 'Arabisch (Libanesisch)',
    flag: '🇱🇧',
    available: true,
  },
  {
    id: 'de-es',
    fromLanguage: 'Deutsch',
    targetLanguage: 'Spanisch',
    flag: '🇪🇸',
    available: false,
  },
];

export const getCourse = (id: string | null): Course | undefined =>
  COURSES.find((c) => c.id === id);
