/**
 * Aussprache-Erkennung über die Web Speech API (Browser).
 *
 * Die App nimmt über das Mikrofon auf, wandelt die Aussprache in Text um und
 * vergleicht diesen mit dem Zielsatz. Funktioniert im Web (am besten in Chrome /
 * Android; auf iPhone je nach Browser eingeschränkt). Auf nativen Builds ist die
 * API nicht verfügbar – dort greift ein Fallback.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

function getRecognition(): any {
  if (typeof window === 'undefined') return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

/** Ist Spracherkennung in dieser Umgebung verfügbar? */
export function isSpeechSupported(): boolean {
  return getRecognition() !== null;
}

/**
 * Hört einmalig zu und liefert die erkannten Textvarianten (Alternativen).
 * Wirft einen Fehler, wenn nichts verstanden wurde oder abgebrochen wird.
 */
export function recognizeOnce(lang = 'en-US'): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const SR = getRecognition();
    if (!SR) {
      reject(new Error('unsupported'));
      return;
    }
    const rec = new SR();
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 5;
    let settled = false;

    rec.onresult = (event: any) => {
      settled = true;
      const result = event.results[0];
      const alternatives: string[] = [];
      for (let i = 0; i < result.length; i++) alternatives.push(result[i].transcript);
      resolve(alternatives);
    };
    rec.onerror = (event: any) => {
      if (!settled) reject(new Error(event.error || 'error'));
    };
    rec.onend = () => {
      if (!settled) reject(new Error('no-speech'));
    };

    try {
      rec.start();
    } catch (err) {
      reject(err as Error);
    }
  });
}

/** Text vereinheitlichen: klein, ohne Satzzeichen, einfache Leerzeichen. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s']/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Levenshtein-Distanz (Anzahl der Änderungen zwischen zwei Strings). */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const row = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = row[j];
      row[j] = Math.min(
        row[j] + 1, // Löschen
        row[j - 1] + 1, // Einfügen
        prev + (a[i - 1] === b[j - 1] ? 0 : 1), // Ersetzen
      );
      prev = temp;
    }
  }
  return row[n];
}

/**
 * Bewertet, wie gut das Gesagte zum Zielsatz passt (0 = gar nicht, 1 = perfekt).
 * Kombiniert Wort-Überdeckung und Zeichen-Ähnlichkeit und nimmt bei mehreren
 * erkannten Varianten die beste.
 */
export function scorePronunciation(target: string, saidVariants: string[]): number {
  const t = normalize(target);
  const tWords = t.split(' ').filter(Boolean);

  let best = 0;
  for (const raw of saidVariants) {
    const s = normalize(raw);
    if (!s) continue;

    // Wort-Überdeckung (Reihenfolge egal, Mehrfachvorkommen berücksichtigt).
    const pool = s.split(' ').filter(Boolean);
    let matched = 0;
    for (const w of tWords) {
      const idx = pool.indexOf(w);
      if (idx !== -1) {
        matched++;
        pool.splice(idx, 1);
      }
    }
    const wordRatio = tWords.length ? matched / tWords.length : 0;

    // Zeichen-Ähnlichkeit über die ganze Phrase.
    const dist = levenshtein(t, s);
    const charSim = 1 - dist / Math.max(t.length, s.length, 1);

    best = Math.max(best, Math.max(wordRatio, charSim));
  }
  return best;
}

/** Schwelle, ab der die Aussprache als korrekt gilt (etwas nachsichtig). */
export const PRONUNCIATION_THRESHOLD = 0.6;
