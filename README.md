# LingoScroll

Sprachen lernen wie beim Scrollen: ein TikTok-artiger, vertikaler Feed, in dem
jede „Karte" eine kurze, interaktive Sprachlektion ist.

Dies ist das **MVP** (erste lauffähige Version). Es entstand aus einer
Schritt-für-Schritt definierten Anforderungsliste – siehe
[`docs/ANFORDERUNGEN.md`](docs/ANFORDERUNGEN.md).

## Was das MVP kann

- **Onboarding**: Lernsprache + Niveau (Anfänger / Fortgeschritten) auswählen.
- **Adaptiver Feed**: vertikal scrollbarer Lektionen-Feed. Die Reihenfolge wählt
  eine Spaced-Repetition-Logik passend zu Niveau und bisherigem Können.
- **Drei Aufgabentypen**: Multiple-Choice, Satz bauen, Zuordnen (Matching).
- **Fortschritt**: wird per Spaced Repetition **lokal auf dem Gerät** gespeichert
  (kein Konto nötig).
- **Sprachrichtung im MVP**: aus dem **Deutschen** **Englisch** lernen. Weitere
  Sprachen sind vorbereitet (Architektur: Sprache = austauschbarer Inhalt).

Bewusst **noch nicht** enthalten (siehe Roadmap in den Anforderungen): Konto &
Cloud-Sync, Audio/Aussprache, Werbung, Live-KI-Generierung, Gamification.

## Technik

- **Expo / React Native** – eine Codebasis für **iOS, Android und Web/Desktop**.
- TypeScript, keine Backend-Abhängigkeit (Fortschritt via AsyncStorage).

## Starten

Voraussetzung: Node ≥ 18.

```bash
npm install

# im Browser (am schnellsten zum Ausprobieren)
npm run web

# auf iOS / Android (Expo Go App oder Simulator/Emulator)
npm run ios
npm run android

# oder allgemein den Dev-Server starten (QR-Code für Expo Go)
npm start
```

Prüfungen:

```bash
npm run typecheck   # TypeScript ohne Fehler?
```

## Projektstruktur

```
src/
  App.tsx                     App-Wurzel: Onboarding oder Feed
  theme.ts                    Design-Tokens (Farben, Abstände …)
  types.ts                    Datenmodell (Lektionen, Fortschritt)
  i18n/de.ts                  Alle deutschen UI-Texte
  data/
    courses.ts                Sprachrichtungen (de-en aktiv)
    lessons.ts                Geprüfter Lektionspool (DE→EN)
  logic/
    spacedRepetition.ts       Leitner-basierte Wiederholungslogik
    feed.ts                   Adaptive Feed-Reihenfolge
  storage/store.ts            Lokale Persistenz (AsyncStorage)
  state/AppStateContext.tsx   Globaler App-Zustand + Aktionen
  screens/
    OnboardingScreen.tsx      Sprache + Niveau
    FeedScreen.tsx            Vertikaler Paging-Feed
  components/
    LessonCard.tsx            Eine Feed-Karte
    SettingsModal.tsx         Niveau ändern, Statistik, Reset
    exercises/                Die drei Aufgabentypen + gemeinsame Hülle
    ui/PrimaryButton.tsx      Wiederverwendbarer Button
```

## Neue Lektionen hinzufügen

Neue Einträge einfach im gleichen Format in `src/data/lessons.ts` ergänzen.
Genau dieses Format kann später eine KI automatisch befüllen (der „geprüfte Pool"
aus den Anforderungen), ohne dass sich am Rest der App etwas ändert.
