import rawLessons from './lessons.json';
import { Cefr, FeedItem, Level, StoryLesson } from '../types';

/**
 * Geprüfter Lektionspool im Story-Format (Deutsch → Englisch). Die Inhalte
 * liegen als JSON (`lessons.json`) – genau in dem Format, das später auch eine
 * KI befüllen kann.
 */
export const STORY_LESSONS = rawLessons as unknown as StoryLesson[];

/** CEFR-Stufe auf Anfänger/Fortgeschritten abbilden. */
export function cefrToLevel(cefr: Cefr | string): Level {
  return cefr === 'A1' || cefr === 'A2' ? 'beginner' : 'advanced';
}

/** Für die Feed-Logik normalisierte Lektionen (id/level/topic + volle Lektion). */
export const FEED_ITEMS: FeedItem[] = STORY_LESSONS.map((lesson) => ({
  id: String(lesson.id),
  level: cefrToLevel(lesson.level),
  topic: lesson.category,
  lesson,
}));

/** Alle Kategorien in Reihenfolge des ersten Auftretens. */
export const ALL_TOPICS: string[] = FEED_ITEMS.reduce<string[]>((acc, item) => {
  if (!acc.includes(item.topic)) acc.push(item.topic);
  return acc;
}, []);
