import AsyncStorage from '@react-native-async-storage/async-storage';

import { AppState } from '../types';

/**
 * Persistenz des App-Zustands im lokalen Speicher des Geräts (AsyncStorage).
 *
 * Bewusst lokal gehalten: Das MVP speichert den Fortschritt nur auf dem Gerät
 * (kein Konto, keine Cloud-Synchronisation). Der Umstieg auf ein Backend später
 * betrifft nur diese Datei.
 */

const STORAGE_KEY = 'lingoscroll.state.v1';

export const emptyState: AppState = {
  courseId: null,
  level: null,
  onboarded: false,
  progress: {},
  topics: [],
  xp: 0,
};

export async function loadState(): Promise<AppState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...emptyState };
    const parsed = JSON.parse(raw) as Partial<AppState>;
    // Defensiv zusammenführen, falls sich das Schema erweitert hat.
    return {
      ...emptyState,
      ...parsed,
      progress: parsed.progress ?? {},
      topics: parsed.topics ?? [],
      xp: parsed.xp ?? 0,
    };
  } catch {
    return { ...emptyState };
  }
}

export async function saveState(state: AppState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Speichern darf den Lernfluss nie blockieren – Fehler still ignorieren.
  }
}

export async function clearState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignorieren
  }
}
