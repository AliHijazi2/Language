/**
 * Alle sichtbaren UI-Texte an einem Ort. Aktuell nur Deutsch (Menüsprache des MVP).
 * Später lässt sich dies zu einem echten i18n-Objekt { de: {...}, en: {...}, ... }
 * erweitern, ohne die Komponenten anzufassen.
 */
export const t = {
  appName: 'LingoScroll',
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
    checkAnswer: 'Antwort prüfen',
    correct: 'Richtig!',
    wrong: 'Nicht ganz.',
    solutionWas: 'Richtig wäre:',
    continue: 'Weiter',
    swipeHint: 'Nach oben wischen für die nächste Lektion',
    tapWordsHint: 'Tippe die Wörter in der richtigen Reihenfolge an.',
    matchHint: 'Ordne jedem englischen Wort die deutsche Bedeutung zu.',
    reset: 'Zurücksetzen',
    newBadge: 'Neu',
    reviewBadge: 'Wiederholung',
    loading: 'Lektionen werden geladen …',
    settings: 'Einstellungen',
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
    learned: 'Gelernte Lektionen',
    dueToday: 'Heute fällig',
  },
} as const;
