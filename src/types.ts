/**
 * Kern-Datenmodell der App.
 *
 * Grundsatz aus den Anforderungen: Die *Sprache* ist nur austauschbarer "Inhalt".
 * Eine Lektion kennt daher ihre Ziel-/Ausgangssprache über `courseId`, nicht fest
 * verdrahtet. So lassen sich später beliebige Sprachrichtungen ergänzen.
 */

export type Level = 'beginner' | 'advanced';

/** Für das MVP freigeschaltete Aufgabentypen. */
export type ExerciseType = 'multipleChoice' | 'sentenceBuilder' | 'matching';

/** Eine Sprachrichtung, z. B. "aus dem Deutschen Englisch lernen". */
export interface Course {
  id: string; // z. B. 'de-en'
  fromLanguage: string; // Menü-/Erklärsprache, z. B. 'Deutsch'
  targetLanguage: string; // Lernsprache, z. B. 'Englisch'
  flag: string; // Emoji-Flagge für die Auswahl
  available: boolean; // Im MVP nur 'de-en' = true
}

interface LessonBase {
  id: string;
  courseId: string;
  level: Level;
  type: ExerciseType;
  topic: string; // z. B. 'Restaurant' – für spätere thematische Steuerung
  /** Kurzer Titel auf der Karte, in der Menüsprache. */
  title: string;
}

export interface MultipleChoiceLesson extends LessonBase {
  type: 'multipleChoice';
  prompt: string; // Frage in der Menüsprache
  options: string[]; // Antwortmöglichkeiten (Lernsprache)
  correctIndex: number;
  explanation?: string; // optionaler Merksatz nach dem Lösen
}

export interface SentenceBuilderLesson extends LessonBase {
  type: 'sentenceBuilder';
  prompt: string; // z. B. 'Baue den Satz: „Kann ich bitte die Rechnung haben?"'
  solution: string[]; // korrekte Wortreihenfolge (Lernsprache)
  distractors?: string[]; // zusätzliche, falsche Wörter zum Erschweren
  explanation?: string;
}

export interface MatchingPair {
  target: string; // Lernsprache, z. B. 'bill'
  from: string; // Menüsprache, z. B. 'Rechnung'
}

export interface MatchingLesson extends LessonBase {
  type: 'matching';
  prompt: string;
  pairs: MatchingPair[]; // 3–4 Paare pro Lektion
  explanation?: string;
}

export type Lesson = MultipleChoiceLesson | SentenceBuilderLesson | MatchingLesson;

/** Persistierter Spaced-Repetition-Zustand pro Lektion (Leitner-Box-Modell). */
export interface LessonProgress {
  lessonId: string;
  box: number; // 0 = neu/schwer … höher = besser beherrscht
  dueAt: number; // Zeitstempel (ms), ab wann die Lektion wieder fällig ist
  lastResult: 'correct' | 'wrong' | null;
  seenCount: number;
}

/** Gesamter persistierter App-Zustand. */
export interface AppState {
  courseId: string | null;
  level: Level | null;
  onboarded: boolean;
  progress: Record<string, LessonProgress>;
  /** Ausgewählte Themen-Filter. Leer = alle Themen anzeigen. */
  topics: string[];
}
