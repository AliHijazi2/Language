# Anforderungen – LingoScroll

Dieses Dokument hält die gemeinsam Schritt für Schritt erarbeiteten Anforderungen
fest. Es dient als Grundlage für das MVP und die weitere Entwicklung.

## Vision

Eine App, mit der man Sprachen lernt, indem man – ähnlich wie bei TikTok – durch
einen Feed scrollt. Jede „Karte" (jedes „Video") ist eine kurze, **interaktive**
Sprachlektion. Außen TikTok-Gefühl, innen ein echter, adaptiver Lernpfad.

## Zielgruppe

- Nutzer wählen selbst ihre **Lernsprache**.
- Nutzer geben ihr **Niveau** an (Anfänger / Fortgeschritten); die Lektionen
  passen sich dem Können an.
- Perspektivisch für Lernende **weltweit** (beliebige Ausgangs- und
  Zielsprachen). Im MVP: aus dem Deutschen Englisch lernen.

## Kernentscheidungen

| # | Thema | Entscheidung |
|---|-------|--------------|
| 1 | Zielgruppe | Nutzer wählt Lernsprache + Niveau; Lektionen adaptiv |
| 2 | Lektionsformat | Kurze Lektion: Inhalt + aktive Übung; Aufgabentyp wechselt von Lektion zu Lektion |
| 3 | Feed | Adaptive Mischung: roter Faden im Hintergrund, System wählt die nächste passende Lektion |
| 4 | Fortschritt | Spaced Repetition; Richtig/Falsch nur als Treibstoff der Wiederholungslogik (keine Benotung) |
| 5 | Inhalte | Start: KI-generiert; später Community; irgendwann Redaktion |
| 6 | Audio | Stufe 1: ohne Ton → vor Release: Vorlesen → danach: Aussprache-Prüfung |
| 7 | Plattform | iOS + Android + Desktop/Web aus einer Codebasis |
| 8 | Konto | Erst anonym; Konto optional zum Sichern/Synchronisieren (E-Mail/Google/Apple) |
| 9 | Geschäftsmodell | Start: Werbung; später evtl. Freemium |
| 10 | Motivation | Start: minimal; Gamification (Streak, Punkte, Erinnerungen) später |
| 11 | Aufgabentypen (v1) | Multiple-Choice, Satz bauen, Zuordnen |
| 12 | Onboarding | Kurze geführte Abfrage vor dem Feed: Sprache + Niveau (+ optional Lernziel) |
| 13 | KI-Qualität | Geprüfter Grundpool + Live-Nachgenerierung, wenn der Pool erschöpft ist |
| 14 | MVP-Schnitt | Schlanker Kern-Loop, eine Sprache, ohne Konto/Ads/Audio |
| 15 | MVP-Sprache | Aus dem Deutschen Englisch; deutsche Menüsprache |

## Funktionsprinzip einer Lektion

1. Ein kurzer Inhalt wird vermittelt (z. B. ein Satz, eine Vokabel, eine
   Redewendung).
2. Der Nutzer wird **aktiv**: je nach Aufgabentyp antippen, Satz bauen oder
   zuordnen. Der Aufgabentyp variiert von Lektion zu Lektion.
3. Feedback (richtig/falsch + ggf. Erklärung).
4. Das Ergebnis speist die **Spaced-Repetition-Logik**: schwere Lektionen kommen
   bald wieder, gut gekonnte erst viel später.

## MVP – Umfang der ersten lauffähigen Version

**Enthalten:**

- Onboarding: Sprache + Niveau.
- Adaptiver, endlos wirkender Feed aus einem geprüften Lektionspool.
- Aufgabentypen: Multiple-Choice, Satz bauen, Zuordnen.
- Spaced Repetition mit lokal gespeichertem Fortschritt.
- Sprachrichtung Deutsch → Englisch, deutsche Oberfläche.

**Bewusst nicht im MVP (→ Roadmap):**

- Konto & geräteübergreifende Synchronisation.
- Audio (Vorlesen) und Aussprache-Prüfung.
- Werbung / Freemium.
- Live-KI-Generierung von Lektionen.
- Gamification (Streak, Punkte, Erinnerungen, Soziales).

## Roadmap (nach dem MVP)

1. **Audio – Vorlesen** (vor dem geplanten Release fest eingeplant): jede Lektion
   erhält Audio (KI- oder Muttersprachler-Stimme).
2. **Konto & Sync**: anonym starten, optional Konto anlegen (E-Mail/Google/Apple),
   Fortschritt geräteübergreifend synchronisieren.
3. **Live-KI-Generierung**: Nachgenerierung neuer Lektionen, wenn der geprüfte
   Pool zu einem Thema/Niveau erschöpft ist.
4. **Weitere Sprachen**: zusätzliche Sprachrichtungen und Menüsprachen (für
   Lernende weltweit), inkl. Sonderfälle wie Arabisch (Schrift/Leserichtung).
5. **Aussprache-Prüfung**: Mikrofon-Feedback zur Aussprache; Aufgabentyp
   „Nachsprechen".
6. **Werbung**, später ggf. **Freemium-Abo**.
7. **Gamification**: Streak, Punkte/Level, Push-Erinnerungen, optional Soziales.
8. **Community-Inhalte**: Nutzer erstellen eigene Lektionen (mit Moderation).

## Architektur-Leitplanken

- **Sprache = austauschbarer Inhalt.** Lektionen hängen an einer `courseId`
  (Sprachrichtung), nicht an fest verdrahteten Sprachen. Neue Sprachrichtungen
  ergänzt man als Daten, nicht als Code-Umbau.
- **Lektionsformat als stabiler Vertrag.** Der geprüfte Pool und die spätere
  KI-Generierung nutzen dasselbe Format – der Rest der App bleibt unberührt.
- **Persistenz gekapselt.** Lokaler Speicher liegt hinter einer schmalen
  Schnittstelle; der spätere Umstieg auf ein Backend betrifft nur diese Stelle.
