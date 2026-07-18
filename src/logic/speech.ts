/**
 * Aussprache-Erkennung über die Web Speech API (Browser).
 *
 * Die App nimmt über das Mikrofon auf, wandelt die Aussprache live in Text um und
 * vergleicht ihn mit dem Zielsatz. Funktioniert im Web (am besten Chrome /
 * Android). Auf nativen Builds ist die API nicht verfügbar – dort greift ein
 * Fallback.
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

export interface SpeechSession {
  /** Aufnahme beenden und das Ergebnis auswerten. */
  stop: () => void;
  /** Aufnahme abbrechen (ohne Ergebnis). */
  abort: () => void;
}

interface StartOptions {
  lang?: string;
  /** Live-Zwischenstand während des Sprechens. */
  onInterim?: (text: string) => void;
  /** Endergebnis (erkannte Varianten, beste zuerst). */
  onResult: (alternatives: string[]) => void;
  onError: (error: string) => void;
}

/**
 * Startet eine Erkennungssitzung mit Live-Zwischenergebnissen. Gibt eine Sitzung
 * mit stop()/abort() zurück – so kann der Nutzer die Aufnahme selbst beenden,
 * ohne auf die automatische Sprechpause-Erkennung zu warten.
 */
export function startRecognition(opts: StartOptions): SpeechSession | null {
  const SR = getRecognition();
  if (!SR) {
    opts.onError('unsupported');
    return null;
  }

  const rec = new SR();
  rec.lang = opts.lang ?? 'en-US';
  rec.interimResults = true;
  rec.continuous = false;
  rec.maxAlternatives = 5;

  let finalAlts: string[] | null = null;
  let lastInterim = '';
  let stopped = false;

  rec.onresult = (event: any) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) {
        finalAlts = [];
        for (let j = 0; j < result.length; j++) finalAlts.push(result[j].transcript);
      } else {
        interim += result[0].transcript;
      }
    }
    if (finalAlts) {
      opts.onResult(finalAlts);
    } else if (interim) {
      lastInterim = interim;
      opts.onInterim?.(interim);
    }
  };

  rec.onerror = (event: any) => {
    if (!finalAlts) opts.onError(event.error || 'error');
  };

  rec.onend = () => {
    // Falls kein finales Ergebnis kam, aber ein Zwischenstand da ist: den werten.
    if (!finalAlts) {
      if (lastInterim.trim()) opts.onResult([lastInterim]);
      else if (!stopped) opts.onError('no-speech');
    }
  };

  try {
    rec.start();
  } catch (err) {
    opts.onError((err as Error)?.message ?? 'error');
    return null;
  }

  return {
    stop: () => {
      try {
        rec.stop();
      } catch {
        /* ignorieren */
      }
    },
    abort: () => {
      stopped = true;
      try {
        rec.abort();
      } catch {
        /* ignorieren */
      }
    },
  };
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
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
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

    const dist = levenshtein(t, s);
    const charSim = 1 - dist / Math.max(t.length, s.length, 1);

    best = Math.max(best, Math.max(wordRatio, charSim));
  }
  return best;
}

/** Schwelle, ab der die Aussprache als korrekt gilt (nachsichtig für Akzente). */
export const PRONUNCIATION_THRESHOLD = 0.5;
