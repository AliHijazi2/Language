import { LessonProgress } from '../types';

/**
 * Leichtgewichtiges Spaced-Repetition-Verfahren nach dem Leitner-Box-Prinzip.
 *
 * Idee: Jede Lektion sitzt in einer "Box". Löst man sie richtig, wandert sie in
 * die nächsthöhere Box und wird erst nach einem längeren Intervall wieder fällig.
 * Löst man sie falsch, fällt sie zurück in Box 0 und taucht bald wieder auf.
 *
 * Richtig/Falsch dient hier ausschließlich als Treibstoff für die
 * Wiederholungslogik – nicht als Benotung (siehe Anforderungen).
 */

/** Intervalle je Box in Minuten. Box 0 = sehr bald wieder, danach zunehmend. */
const INTERVALS_MINUTES = [
  1, // Box 0: gleich in dieser Sitzung nochmal
  10 * 60, // Box 1: ~10 Stunden
  24 * 60, // Box 2: 1 Tag
  3 * 24 * 60, // Box 3: 3 Tage
  7 * 24 * 60, // Box 4: 1 Woche
  16 * 24 * 60, // Box 5: gut gelernt
];

export const MAX_BOX = INTERVALS_MINUTES.length - 1;

const MINUTE_MS = 60 * 1000;

/** Frischer Fortschritt für eine noch nie gesehene Lektion. */
export function createProgress(lessonId: string, now = Date.now()): LessonProgress {
  return {
    lessonId,
    box: 0,
    dueAt: now, // sofort fällig (= neu)
    lastResult: null,
    seenCount: 0,
  };
}

/**
 * Aktualisiert den Fortschritt einer Lektion nach einer Antwort und gibt einen
 * neuen (unveränderten Ausgangswert lassenden) Fortschritts-Datensatz zurück.
 */
export function applyAnswer(
  prev: LessonProgress,
  correct: boolean,
  now = Date.now(),
): LessonProgress {
  const box = correct ? Math.min(prev.box + 1, MAX_BOX) : 0;
  const intervalMinutes = INTERVALS_MINUTES[box];
  return {
    lessonId: prev.lessonId,
    box,
    dueAt: now + intervalMinutes * MINUTE_MS,
    lastResult: correct ? 'correct' : 'wrong',
    seenCount: prev.seenCount + 1,
  };
}

/** Ist die Lektion aktuell fällig (zur Wiederholung)? */
export function isDue(progress: LessonProgress, now = Date.now()): boolean {
  return progress.dueAt <= now;
}

/** Gilt eine Lektion als "gelernt" (mindestens einmal richtig, höhere Box)? */
export function isLearned(progress: LessonProgress): boolean {
  return progress.box >= 2;
}
