/**
 * Alle sichtbaren UI-Texte an einem Ort. Aktuell nur Deutsch (Menüsprache des MVP).
 * Später lässt sich dies zu einem echten i18n-Objekt { de: {...}, en: {...}, ... }
 * erweitern, ohne die Komponenten anzufassen.
 */
export const t = {
  appName: 'Paly',
  tagline: 'Sprachen lernen wie beim Scrollen.',

  onboarding: {
    languageTitle: 'Welche Sprache möchtest du lernen?',
    languageSubtitle: 'Weitere Sprachen kommen bald dazu.',
    comingSoon: 'Bald verfügbar',
    levelTitle: 'Wie gut kannst du schon?',
    levelSubtitle: 'Wir passen die Lektionen an dein Niveau an.',
    beginner: 'Anfänger',
    beginnerHint: 'Ich fange ganz neu an.',
    advanced: 'Fortgeschritten',
    advancedHint: 'Ich kann schon einiges.',
    start: 'Los geht’s',
    next: 'Weiter',
    back: 'Zurück',
  },

  feed: {
    newBadge: 'Neu',
    reviewBadge: 'Wiederholung',
    loading: 'Lektionen werden geladen …',
    settings: 'Einstellungen',
    swipeHint: 'Nach oben wischen für die nächste Lektion',
  },

  lesson: {
    continue: 'Weiter',
    finish: 'Fertig',
    correct: 'Richtig!',
    wrong: 'Nicht ganz.',
    speakPrompt: 'Sprich den Satz laut nach',
    speakTapRecord: 'Zum Aufnehmen tippen',
    speakRecording: '● Aufnahme … zum Stoppen tippen',
    speakProcessing: 'Wird ausgewertet …',
    speakLoadingModel: 'Sprachmodell wird geladen …',
    speakGood: 'Super ausgesprochen! 👏',
    speakClose: 'Fast! Ich habe gehört:',
    speakRetry: 'Nochmal versuchen',
    speakError: 'Ich habe nichts verstanden. Nochmal?',
    speakAllow: 'Bitte den Mikrofon-Zugriff erlauben.',
    speakUnsupported: 'Spracherkennung ist in diesem Browser nicht verfügbar – tippe zum Weitermachen.',
    speakIosTip:
      'iPhone-Tipp: Safari nutzt die Diktatsprache deines Handys. Stelle sie auf Englisch (Einstellungen → Allgemein → Tastatur → Diktatsprachen → Englisch), dann erkennt es dein Englisch viel besser.',
    meaning: 'Bedeutung',
    tipLabel: 'Tipp',
    xp: 'XP',
  },

  settings: {
    title: 'Einstellungen',
    level: 'Niveau',
    topics: 'Themen',
    topicsHint: 'Wähle Themen, um den Feed einzugrenzen.',
    allTopics: 'Alle Themen',
    resetProgress: 'Fortschritt zurücksetzen',
    resetConfirm: 'Wirklich den gesamten Lernfortschritt löschen?',
    cancel: 'Abbrechen',
    close: 'Schließen',
    learned: 'Gelernt',
    dueToday: 'Fällig',
    xp: 'Punkte',
  },
} as const;
