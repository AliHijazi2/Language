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

/** Läuft die App auf einem iPhone/iPad (Safari-Spracherkennung ist dort tückisch)? */
export function isIOS(): boolean {
  return typeof navigator !== 'undefined' && /iP(hone|ad|od)/.test(navigator.userAgent);
}

export interface SpeechSession {
  /** Aufnahme beenden und das Ergebnis auswerten. */
  stop: () => void;
  /** Aufnahme abbrechen (ohne Ergebnis). */
  abort: () => void;
}

interface StartOptions {
  lang?: string;
  /** Erwarteter Satz – biast die Erkennung (wo unterstützt). */
  phrase?: string;
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

  // Erwarteten Satz als Grammatik hinterlegen, um die Erkennung darauf zu lenken
  // (wird nicht von jeder Engine unterstützt – dann einfach ignoriert).
  const SGL = (window as any).SpeechGrammarList || (window as any).webkitSpeechGrammarList;
  if (SGL && opts.phrase) {
    try {
      const words = opts.phrase.replace(/[^\p{L}\p{N}\s]/gu, '').trim();
      const grammar = `#JSGF V1.0; grammar phrase; public <phrase> = ${words} ;`;
      const list = new SGL();
      list.addFromString(grammar, 1);
      rec.grammars = list;
    } catch {
      /* Grammatik nicht unterstützt – ignorieren */
    }
  }

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
 * Soundex-Code eines Wortes (grobe Klang-Signatur). Damit gelten klanglich
 * ähnliche Wörter als gleich – wichtig, weil die Erkennungs-Engine oft ein
 * ähnlich klingendes, falsch geschriebenes Wort ausgibt (z. B. "copy" für
 * "coffee").
 */
function soundex(word: string): string {
  const a = word.toUpperCase().replace(/[^A-Z]/g, '');
  if (!a) return '';
  const code: Record<string, number> = {
    B: 1, F: 1, P: 1, V: 1,
    C: 2, G: 2, J: 2, K: 2, Q: 2, S: 2, X: 2, Z: 2,
    D: 3, T: 3,
    L: 4,
    M: 5, N: 5,
    R: 6,
  };
  let result = a[0];
  let prev = code[a[0]] ?? 0;
  for (let i = 1; i < a.length && result.length < 4; i++) {
    const c = code[a[i]] ?? 0;
    if (c !== 0 && c !== prev) result += c;
    prev = 'AEIOUY'.includes(a[i]) ? 0 : c;
  }
  return (result + '000').slice(0, 4);
}

/**
 * Sprachübergreifender Klang-Schlüssel: kodiert alle Konsonanten grob nach Laut
 * (c/k/q gleich, s/z gleich, umlaute vereinfacht …), Vokale/h/y fallen weg.
 * Damit passt auch ein deutsch-verhörtes Wort auf das englische Ziel
 * (z. B. "coffee" ~ "kaffee", "card" ~ "kart").
 */
function phoneticKey(word: string): string {
  const mapped = word
    .toLowerCase()
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ß/g, 's')
    .replace(/[^a-z]/g, '');
  const code: Record<string, string> = {
    b: '1', p: '1', f: '1', v: '1', w: '1',
    c: '2', k: '2', g: '2', j: '2', q: '2', x: '2', s: '2', z: '2',
    d: '3', t: '3',
    l: '4',
    m: '5', n: '5',
    r: '6',
  };
  let out = '';
  let prev = '';
  for (const ch of mapped) {
    const c = code[ch] ?? '';
    if (c && c !== prev) out += c;
    prev = c;
  }
  return out;
}

/** Ähnlichkeit zweier Wörter (1 = identisch): Buchstaben + Klang (2 Verfahren). */
function wordSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const dist = levenshtein(a, b);
  const letterSim = 1 - dist / Math.max(a.length, b.length, 1);

  // Klang-Abgleich, fängt Verhörer (auch sprachübergreifend) ab.
  const sa = soundex(a);
  const soundexSim = sa && sa === soundex(b) ? 0.9 : 0;
  const ka = phoneticKey(a);
  const keySim = ka && ka === phoneticKey(b) ? 0.85 : 0;

  return Math.max(letterSim, soundexSim, keySim);
}

/**
 * Bewertet, wie gut das Gesagte zum Zielsatz passt (0 = gar nicht, 1 = perfekt).
 *
 * Bewusst nachsichtig: Für jedes Zielwort wird das ähnlichste gesagte Wort
 * gesucht (unscharfer Abgleich, damit z. B. "how's" ~ "hows" oder kleine
 * Erkennungsfehler nicht sofort als falsch gelten). Zusätzlich fließt die
 * Zeichen-Ähnlichkeit der ganzen Phrase ein; bei mehreren erkannten Varianten
 * zählt die beste.
 */
export function scorePronunciation(target: string, saidVariants: string[]): number {
  const t = normalize(target);
  const tWords = t.split(' ').filter(Boolean);

  let best = 0;
  for (const raw of saidVariants) {
    const s = normalize(raw);
    if (!s) continue;

    const saidWords = s.split(' ').filter(Boolean);

    // Unscharfe Wort-Überdeckung: pro Zielwort das beste passende gesagte Wort.
    let coverage = 0;
    for (const w of tWords) {
      let bestWord = 0;
      for (const p of saidWords) bestWord = Math.max(bestWord, wordSimilarity(w, p));
      // Wörter, die "nah genug" sind, zählen voll; sonst anteilig.
      coverage += bestWord >= 0.7 ? 1 : bestWord;
    }
    const fuzzyRatio = tWords.length ? coverage / tWords.length : 0;

    // Zeichen-Ähnlichkeit über die ganze Phrase (fängt andere Wortreihenfolge ab).
    const dist = levenshtein(t, s);
    const charSim = 1 - dist / Math.max(t.length, s.length, 1);

    best = Math.max(best, fuzzyRatio, charSim);
  }
  return best;
}

/** Schwelle, ab der die Aussprache als korrekt gilt (nachsichtig für Akzente). */
export const PRONUNCIATION_THRESHOLD = 0.5;
