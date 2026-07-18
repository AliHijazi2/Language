import { LessonProgress, Level } from '../types';
import { isDue } from './spacedRepetition';

/**
 * Baut die adaptive Reihenfolge des Feeds.
 *
 * Anforderung: "adaptive Mischung" – ein roter Faden im Hintergrund, aber das
 * System wählt die nächste Lektion passend zu Niveau und bisherigem Können.
 *
 * Arbeitet generisch mit allem, was id/level/topic hat (z. B. FeedItem).
 *
 * Prioritäts-Ebenen:
 *   0) passendes Niveau, fällige Wiederholung   (Spaced Repetition treibt)
 *   1) passendes Niveau, noch nie gesehen       (neuer Stoff)
 *   2) anderes Niveau, noch nie gesehen         (Fallback, damit es nie leer wird)
 *   3) anderes Niveau, fällige Wiederholung
 *   4) alles Übrige nach Fälligkeit             (endloser Feed)
 */

interface FeedLike {
  id: string;
  level: Level;
  topic: string;
}

interface BuildOptions {
  exclude?: Set<string>;
  size?: number;
}

/** Verzahnt zwei Listen abwechselnd (a[0], b[0], a[1], b[1], …). */
function interleave<T>(a: T[], b: T[]): T[] {
  const out: T[] = [];
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i++) {
    if (i < a.length) out.push(a[i]);
    if (i < b.length) out.push(b[i]);
  }
  return out;
}

export function buildFeed<T extends FeedLike>(
  items: T[],
  level: Level,
  progress: Record<string, LessonProgress>,
  now: number,
  options: BuildOptions = {},
): T[] {
  const { exclude, size = 12 } = options;

  const preferredDue: T[] = [];
  const preferredNew: T[] = [];
  const otherNew: T[] = [];
  const otherDue: T[] = [];
  const rest: T[] = [];

  for (const item of items) {
    const p = progress[item.id];
    const isPreferred = item.level === level;
    if (!p) {
      (isPreferred ? preferredNew : otherNew).push(item);
    } else if (isDue(p, now)) {
      (isPreferred ? preferredDue : otherDue).push(item);
    } else {
      rest.push(item);
    }
  }

  const byDue = (a: T, b: T) => (progress[a.id]?.dueAt ?? 0) - (progress[b.id]?.dueAt ?? 0);
  preferredDue.sort(byDue);
  otherDue.sort(byDue);
  rest.sort(byDue);

  const ordered: T[] = [
    ...interleave(preferredDue, preferredNew),
    ...otherNew,
    ...otherDue,
    ...rest,
  ];

  let result = ordered;
  if (exclude && exclude.size > 0) {
    const filtered = ordered.filter((item) => !exclude.has(item.id));
    if (filtered.length > 0) result = filtered;
  }

  return result.slice(0, size);
}
