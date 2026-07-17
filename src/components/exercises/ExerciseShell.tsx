import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { t } from '../../i18n/de';
import { theme } from '../../theme';
import { PrimaryButton } from '../ui/PrimaryButton';

interface Props {
  prompt: string;
  hint?: string;
  /** Interaktiver Bereich; erhält, ob bereits aufgelöst wurde. */
  children: (args: { revealed: boolean }) => React.ReactNode;
  /** Ist eine Antwort abgegeben und kann geprüft werden? */
  canCheck: boolean;
  /** Wird beim Prüfen aufgerufen und liefert richtig/falsch. */
  evaluate: () => boolean;
  /** Text der Musterlösung (bei falscher Antwort angezeigt). */
  solutionText?: string;
  explanation?: string;
  /** Meldet das Ergebnis nach oben (für Spaced Repetition). */
  onResult: (correct: boolean) => void;
  /** Nutzer möchte zur nächsten Lektion. */
  onContinue: () => void;
}

/**
 * Gemeinsame Hülle aller Aufgabentypen: rendert Frage, den interaktiven Bereich,
 * den "Antwort prüfen"-Button, das Feedback und den "Weiter"-Button. So bleibt
 * der Ablauf über alle Übungen identisch und jede Übung kümmert sich nur um ihre
 * eigene Interaktion.
 */
export function ExerciseShell({
  prompt,
  hint,
  children,
  canCheck,
  evaluate,
  solutionText,
  explanation,
  onResult,
  onContinue,
}: Props) {
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(false);

  const handleCheck = () => {
    const result = evaluate();
    setCorrect(result);
    setRevealed(true);
    onResult(result);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.prompt}>{prompt}</Text>
      {hint && !revealed ? <Text style={styles.hint}>{hint}</Text> : null}

      <View style={styles.interactive}>{children({ revealed })}</View>

      {revealed ? (
        <View
          style={[
            styles.feedback,
            { backgroundColor: correct ? theme.colors.successBg : theme.colors.errorBg },
          ]}
        >
          <Text
            style={[
              styles.feedbackTitle,
              { color: correct ? theme.colors.success : theme.colors.error },
            ]}
          >
            {correct ? t.feed.correct : t.feed.wrong}
          </Text>
          {!correct && solutionText ? (
            <Text style={styles.solution}>
              {t.feed.solutionWas} {solutionText}
            </Text>
          ) : null}
          {explanation ? <Text style={styles.explanation}>{explanation}</Text> : null}
        </View>
      ) : null}

      <View style={styles.actions}>
        {revealed ? (
          <PrimaryButton label={t.feed.continue} onPress={onContinue} />
        ) : (
          <PrimaryButton label={t.feed.checkAnswer} onPress={handleCheck} disabled={!canCheck} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  prompt: {
    color: theme.colors.text,
    fontSize: theme.font.heading,
    fontWeight: '700',
    lineHeight: 30,
    marginBottom: theme.spacing(1),
  },
  hint: {
    color: theme.colors.textMuted,
    fontSize: theme.font.small,
    marginBottom: theme.spacing(1),
  },
  interactive: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  feedback: {
    borderRadius: theme.radius.md,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  feedbackTitle: {
    fontSize: theme.font.body,
    fontWeight: '800',
    marginBottom: 2,
  },
  solution: {
    color: theme.colors.text,
    fontSize: theme.font.body,
    marginTop: 2,
  },
  explanation: {
    color: theme.colors.textMuted,
    fontSize: theme.font.small,
    marginTop: theme.spacing(1),
  },
  actions: {
    marginTop: theme.spacing(1),
  },
});
