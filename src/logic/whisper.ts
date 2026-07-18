/**
 * Spracherkennung mit Whisper direkt im Browser (transformers.js).
 *
 * Läuft komplett auf dem Gerät – WIR bestimmen die Sprache (nicht das Handy).
 * Damit funktioniert die Aussprache-Erkennung für alle Nutzer gleich, ohne
 * Einstellungen, ohne Server, dauerhaft kostenlos.
 *
 * Die Bibliothek wird zur Laufzeit per CDN geladen (nur im Web), damit sie den
 * App-Bundle nicht aufbläht. Auf nativen Builds greift ein Fallback.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { canRecord } from './recorder';

const CDN_URL = 'https://esm.sh/@huggingface/transformers@3.3.0';
// Kleines, schnelles, mehrsprachiges Modell (Sprache wird beim Aufruf gesetzt).
const MODEL = 'Xenova/whisper-tiny';

let modulePromise: Promise<any> | null = null;
let transcriberPromise: Promise<any> | null = null;

/** Ist die Whisper-Erkennung hier grundsätzlich möglich? */
export function isWhisperCapable(): boolean {
  return canRecord();
}

async function loadModule(): Promise<any> {
  if (!modulePromise) {
    // Dynamischer Import per Function, damit der Bundler die URL nicht anfasst.
    const dynamicImport = new Function('u', 'return import(u)');
    modulePromise = dynamicImport(CDN_URL).then((mod: any) => {
      if (mod?.env) {
        mod.env.allowLocalModels = false;
        // Modelle/WASM aus dem Netz laden (nicht aus lokalem Ordner).
        mod.env.useBrowserCache = true;
      }
      return mod;
    });
  }
  return modulePromise;
}

/**
 * Lädt (einmalig) das Whisper-Modell. onProgress liefert 0..1 während des
 * Downloads; danach ist das Modell im Browser-Cache und startet schnell.
 */
export function ensureTranscriber(onProgress?: (fraction: number) => void): Promise<any> {
  if (!transcriberPromise) {
    transcriberPromise = (async () => {
      const mod = await loadModule();
      return mod.pipeline('automatic-speech-recognition', MODEL, {
        progress_callback: (info: any) => {
          if (info && info.status === 'progress' && typeof info.progress === 'number') {
            onProgress?.(Math.max(0, Math.min(1, info.progress / 100)));
          }
        },
      });
    })().catch((err) => {
      transcriberPromise = null; // erneuten Versuch erlauben
      throw err;
    });
  }
  return transcriberPromise;
}

/** Ist das Modell bereits geladen (kein Download mehr nötig)? */
export function isModelReady(): boolean {
  return transcriberPromise !== null;
}

/**
 * Wandelt Audio (16 kHz Mono) in Text um. `language` steuert die Erkennungs-
 * sprache (z. B. 'english') – unabhängig von den Geräteeinstellungen.
 */
export async function transcribe(
  audio: Float32Array,
  language = 'english',
  onProgress?: (fraction: number) => void,
): Promise<string> {
  const transcriber = await ensureTranscriber(onProgress);
  const output = await transcriber(audio, { language, task: 'transcribe' });
  const text = Array.isArray(output) ? output[0]?.text : output?.text;
  return (text ?? '').trim();
}
