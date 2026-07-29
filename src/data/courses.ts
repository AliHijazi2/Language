import { Course } from '../types';

/**
 * Verfügbare Sprachrichtungen. Für das MVP ist nur 'de-en' aktiv; die übrigen
 * sind als "bald verfügbar" sichtbar, damit die Erweiterbarkeit klar wird und
 * das Auswahl-UI schon realistisch aussieht.
 */
export const COURSES: Course[] = [
  {
    id: 'de-en',
    fromLanguage: 'Deutsch',
    targetLanguage: 'Englisch',
    flag: '🇬🇧',
    available: true,
  },
  {
    id: 'de-es',
    fromLanguage: 'Deutsch',
    targetLanguage: 'Spanisch',
    flag: '🇪🇸',
    available: false,
  },
  {
    id: 'de-fr',
    fromLanguage: 'Deutsch',
    targetLanguage: 'Französisch',
    flag: '🇫🇷',
    available: false,
  },
  {
    id: 'de-ar',
    fromLanguage: 'Deutsch',
    targetLanguage: 'Arabisch (Libanesisch)',
    flag: '🇱🇧',
    available: true,
  },
];

export const getCourse = (id: string | null): Course | undefined =>
  COURSES.find((c) => c.id === id);
