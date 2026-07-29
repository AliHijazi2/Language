/**
 * Kern-Datenmodell der App (Story-Lektionsformat).
 *
 * Eine Lektion besteht aus mehreren Karten, durch die man Schritt für Schritt
 * geht: Intro → Erklärung → Quiz → Sprechen → Tipp.
 */

export type Level = 'beginner' | 'advanced';

/** Niveaustufen nach europäischem Referenzrahmen. */
export type Cefr = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

/** Sprachrichtung (im MVP nur Deutsch → Englisch). */
export interface Course {
  id: string;
  fromLanguage: string;
  targetLanguage: string;
  flag: string;
  available: boolean;
}

// ── Kartentypen einer Lektion ──
export interface IntroCard {
  type: 'lesson';
  title: string;
  emoji: string;
  /** Satz in der Lernsprache. */
  target: string;
  /** Optionale Umschrift (z. B. für Arabisch). */
  latin?: string;
  /** Übersetzung in der Menüsprache (Deutsch). */
  native: string;
  audio?: string;
}

export interface ExplanationCard {
  type: 'explanation';
  word: string;
  /** Optionale Umschrift des Wortes. */
  latin?: string;
  meaning: string;
  description: string;
}

export interface QuizAnswer {
  text: string;
  correct: boolean;
}

export interface QuizCard {
  type: 'quiz';
  question: string;
  answers: QuizAnswer[];
  explanation: string;
}

export interface SpeakingCard {
  type: 'speaking';
  text: string;
  /** Optionale Umschrift des zu sprechenden Satzes. */
  latin?: string;
}

export interface TipCard {
  type: 'tip';
  title: string;
  text: string;
}

export type LessonCard = IntroCard | ExplanationCard | QuizCard | SpeakingCard | TipCard;

/** Eine vollständige Lektion (mehrere Karten). */
export interface StoryLesson {
  id: number;
  language: string;
  level: Cefr;
  category: string;
  topic: string;
  duration: number;
  xp: number;
  cards: LessonCard[];
}

/** Für die adaptive Feed-Logik normalisierte Lektion. */
export interface FeedItem {
  id: string;
  courseId: string;
  level: Level;
  topic: string;
  lesson: StoryLesson;
}

/** Persistierter Spaced-Repetition-Zustand pro Lektion (Leitner-Box-Modell). */
export interface LessonProgress {
  lessonId: string;
  box: number;
  dueAt: number;
  lastResult: 'correct' | 'wrong' | null;
  seenCount: number;
}

/** Gesamter persistierter App-Zustand. */
export interface AppState {
  courseId: string | null;
  level: Level | null;
  onboarded: boolean;
  progress: Record<string, LessonProgress>;
  /** Ausgewählte Themen-Filter (Kategorien). Leer = alle. */
  topics: string[];
  /** Gesammelte Erfahrungspunkte. */
  xp: number;
}
