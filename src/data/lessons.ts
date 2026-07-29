import englishRaw from './lessons.json';
import arabicRaw from './lessons-ar.json';
import { Cefr, FeedItem, Level, StoryLesson } from '../types';

/**
 * Geprüfte Lektionspools im Story-Format. Pro Lernsprache eine JSON-Datei –
 * genau das Format, das später auch eine KI befüllen kann.
 */
const ENGLISH = englishRaw as unknown as StoryLesson[];
const ARABIC = arabicRaw as unknown as StoryLesson[];

/** CEFR-Stufe auf Anfänger/Fortgeschritten abbilden. */
export function cefrToLevel(cefr: Cefr | string): Level {
  return cefr === 'A1' || cefr === 'A2' ? 'beginner' : 'advanced';
}

/** Whisper-Erkennungssprache je Lernsprache. */
export function recognitionLanguage(courseId: string): string {
  return courseId === 'de-ar' ? 'arabic' : 'english';
}

function toFeedItems(lessons: StoryLesson[], courseId: string): FeedItem[] {
  return lessons.map((lesson) => ({
    // ID enthält den Kurs, damit der Fortschritt pro Kurs eindeutig bleibt.
    id: `${courseId}-${lesson.id}`,
    courseId,
    level: cefrToLevel(lesson.level),
    topic: lesson.category,
    lesson,
  }));
}

/** Alle Lektionen aller Kurse, für die Feed-Logik normalisiert. */
export const FEED_ITEMS: FeedItem[] = [
  ...toFeedItems(ENGLISH, 'de-en'),
  ...toFeedItems(ARABIC, 'de-ar'),
];

/** Lektionen eines bestimmten Kurses. */
export function feedItemsForCourse(courseId: string | null): FeedItem[] {
  return FEED_ITEMS.filter((i) => i.courseId === courseId);
}

/** Kategorien eines Kurses (in Reihenfolge des ersten Auftretens). */
export function topicsForCourse(courseId: string | null): string[] {
  const seen: string[] = [];
  for (const item of FEED_ITEMS) {
    if (item.courseId === courseId && !seen.includes(item.topic)) seen.push(item.topic);
  }
  return seen;
}
