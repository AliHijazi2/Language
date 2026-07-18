/**
 * Mikrofon-Aufnahme im Browser und Aufbereitung für die Spracherkennung.
 *
 * Nimmt Audio auf, dekodiert es und rechnet es auf 16 kHz Mono herunter – genau
 * das Format, das das Whisper-Modell erwartet.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Recording {
  /** Aufnahme beenden und die Audiodaten (16 kHz Mono) liefern. */
  stop: () => Promise<Float32Array>;
  /** Aufnahme abbrechen (ohne Ergebnis). */
  cancel: () => void;
}

/** Kann in dieser Umgebung überhaupt aufgenommen werden? */
export function canRecord(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof (window as any).MediaRecorder !== 'undefined' &&
    (typeof (window as any).OfflineAudioContext !== 'undefined' ||
      typeof (window as any).webkitOfflineAudioContext !== 'undefined')
  );
}

function pickMimeType(): string | undefined {
  const MR: any = (window as any).MediaRecorder;
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/aac'];
  for (const type of candidates) {
    if (MR.isTypeSupported && MR.isTypeSupported(type)) return type;
  }
  return undefined;
}

/** Audio-Blob dekodieren und auf 16 kHz Mono resamplen. */
async function decodeTo16kMono(bytes: ArrayBuffer): Promise<Float32Array> {
  const AC: any = (window as any).AudioContext || (window as any).webkitAudioContext;
  const ac = new AC();
  const audioBuffer: AudioBuffer = await new Promise((resolve, reject) => {
    // decodeAudioData unterstützt Promise- und Callback-Form (iOS mag Callback).
    const p = ac.decodeAudioData(bytes.slice(0), resolve, reject);
    if (p && typeof p.then === 'function') p.then(resolve, reject);
  });
  try {
    ac.close?.();
  } catch {
    /* ignorieren */
  }

  const OAC: any =
    (window as any).OfflineAudioContext || (window as any).webkitOfflineAudioContext;
  const frames = Math.max(1, Math.ceil(audioBuffer.duration * 16000));
  const offline = new OAC(1, frames, 16000);
  const source = offline.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offline.destination);
  source.start(0);
  const rendered: AudioBuffer = await offline.startRendering();
  return rendered.getChannelData(0).slice();
}

/** Startet die Aufnahme und gibt eine Steuerung zurück. */
export async function startRecording(): Promise<Recording> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const MR: any = (window as any).MediaRecorder;
  const mimeType = pickMimeType();
  const recorder = new MR(stream, mimeType ? { mimeType } : undefined);
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e: any) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };
  recorder.start();

  const cleanup = () => stream.getTracks().forEach((t) => t.stop());

  return {
    stop: () =>
      new Promise<Float32Array>((resolve, reject) => {
        recorder.onstop = async () => {
          cleanup();
          try {
            const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
            const bytes = await blob.arrayBuffer();
            resolve(await decodeTo16kMono(bytes));
          } catch (err) {
            reject(err);
          }
        };
        try {
          recorder.stop();
        } catch (err) {
          cleanup();
          reject(err);
        }
      }),
    cancel: () => {
      try {
        recorder.stop();
      } catch {
        /* ignorieren */
      }
      cleanup();
    },
  };
}
