import { Lesson, LessonProgress, Level } from '../types';
import { isDue } from './spacedRepetition';

/**
 * Baut die adaptive Reihenfolge des Feeds.
 *
 * Anforderung: "adaptive Mischung" – ein roter Faden im Hintergrund, aber das
 * System wählt die nächste Lektion passend zu Niveau und bisherigem Können.
 *
 * Umsetzung in Prioritäts-Ebenen (Tiers):
 *   0) passendes Niveau, fällige Wiederholung   (Spaced Repetition treibt)
 *   1) passendes Niveau, noch nie gesehen       (neuer Stoff)
 *   2) anderes Niveau, noch nie gesehen         (Fallback, damit es nie leer wird)
 *   3) anderes Niveau, fällige Wiederholung
 *   4) alles Übrige nach Fälligkeit             (endloser Feed)
 *
 * Fällige Wiederholungen (Tier 0) und neuer Stoff (Tier 1) werden verzahnt, damit
 * sich der Feed nicht wie "erst alle Wiederholungen, dann alles Neue" anfühlt.
 */

interface BuildOptions {
  exclude?: Set<string>; // zuletzt gezeigte IDs (nicht sofort wiederholen)
  size?: number; // gewünschte Anzahl
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

export function buildFeed(
  lessons: Lesson[],
  level: Level,
  progress: Record<string, LessonProgress>,
  now: number,
  options: BuildOptions = {},
): Lesson[] {
  const { exclude, size = 12 } = options;

  const preferredDue: Lesson[] = [];
  const preferredNew: Lesson[] = [];
  const otherNew: Lesson[] = [];
  const otherDue: Lesson[] = [];
  const rest: Lesson[] = [];

  for (const lesson of lessons) {
    const p = progress[lesson.id];
    const isPreferred = lesson.level === level;
    if (!p) {
      (isPreferred ? preferredNew : otherNew).push(lesson);
    } else if (isDue(p, now)) {
      (isPreferred ? preferredDue : otherDue).push(lesson);
    } else {
      rest.push(lesson);
    }
  }

  // Fällige Wiederholungen: die am längsten überfälligen zuerst.
  const byDue = (a: Lesson, b: Lesson) =>
    (progress[a.id]?.dueAt ?? 0) - (progress[b.id]?.dueAt ?? 0);
  preferredDue.sort(byDue);
  otherDue.sort(byDue);
  rest.sort(byDue);

  const ordered: Lesson[] = [
    ...interleave(preferredDue, preferredNew),
    ...otherNew,
    ...otherDue,
    ...rest,
  ];

  // Kürzlich gezeigte Lektionen möglichst überspringen – aber niemals einen
  // leeren Feed erzeugen (dann Ausschluss ignorieren).
  let result = ordered;
  if (exclude && exclude.size > 0) {
    const filtered = ordered.filter((l) => !exclude.has(l.id));
    if (filtered.length > 0) result = filtered;
  }

  return result.slice(0, size);
}
