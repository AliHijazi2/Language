import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { t } from '../../i18n/de';
import { SentenceBuilderLesson } from '../../types';
import { theme } from '../../theme';
import { arraysEqual, shuffle } from '../../utils/shuffle';
import { ExerciseShell } from './ExerciseShell';

interface Token {
  id: string;
  word: string;
}

interface Props {
  lesson: SentenceBuilderLesson;
  onResult: (correct: boolean) => void;
  onContinue: () => void;
}

/** Aufgabentyp "Satz bauen": vorgegebene Wörter in die richtige Reihenfolge tippen. */
export function SentenceBuilderExercise({ lesson, onResult, onContinue }: Props) {
  // Lösungswörter + optionale Ablenker, jeweils mit stabiler ID (Wörter können
  // sich wiederholen), einmal pro Lektion gemischt.
  const allTokens = useMemo<Token[]>(() => {
    const words = [...lesson.solution, ...(lesson.distractors ?? [])];
    return shuffle(words.map((word, index) => ({ id: `${index}-${word}`, word })));
  }, [lesson.id]);

  const [bank, setBank] = useState<Token[]>(allTokens);
  const [built, setBuilt] = useState<Token[]>([]);

  const moveToBuilt = (token: Token) => {
    setBank((b) => b.filter((x) => x.id !== token.id));
    setBuilt((b) => [...b, token]);
  };

  const moveToBank = (token: Token) => {
    setBuilt((b) => b.filter((x) => x.id !== token.id));
    setBank((b) => [...b, token]);
  };

  const reset = () => {
    setBank(allTokens);
    setBuilt([]);
  };

  const evaluate = () =>
    arraysEqual(built.map((tk) => tk.word), lesson.solution);

  return (
    <ExerciseShell
      prompt={lesson.prompt}
      hint={t.feed.tapWordsHint}
      canCheck={built.length === lesson.solution.length}
      evaluate={evaluate}
      solutionText={lesson.solution.join(' ')}
      explanation={lesson.explanation}
      onResult={onResult}
      onContinue={onContinue}
    >
      {({ revealed }) => (
        <View>
          {/* Gebauter Satz */}
          <View style={styles.answerRow}>
            {built.length === 0 ? (
              <Text style={styles.placeholder}>…</Text>
            ) : (
              built.map((token) => (
                <Pressable
                  key={token.id}
                  disabled={revealed}
                  onPress={() => moveToBank(token)}
                  style={[styles.chip, styles.chipBuilt]}
                >
                  <Text style={styles.chipText}>{token.word}</Text>
                </Pressable>
              ))
            )}
          </View>

          {/* Wortbank */}
          <View style={styles.bankRow}>
            {bank.map((token) => (
              <Pressable
                key={token.id}
                disabled={revealed}
                onPress={() => moveToBuilt(token)}
                style={[styles.chip, styles.chipBank]}
              >
                <Text style={styles.chipText}>{token.word}</Text>
              </Pressable>
            ))}
          </View>

          {!revealed && built.length > 0 ? (
            <Pressable onPress={reset} style={styles.reset}>
              <Text style={styles.resetText}>{t.feed.reset}</Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </ExerciseShell>
  );
}

const styles = StyleSheet.create({
  answerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    minHeight: 54,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: theme.colors.border,
    paddingBottom: theme.spacing(1),
    marginBottom: theme.spacing(2),
    gap: theme.spacing(1),
  },
  placeholder: {
    color: theme.colors.textMuted,
    fontSize: theme.font.heading,
  },
  bankRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
  },
  chip: {
    borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing(1.25),
    paddingHorizontal: theme.spacing(1.75),
    borderWidth: 1,
  },
  chipBank: {
    backgroundColor: theme.colors.surfaceAlt,
    borderColor: theme.colors.border,
  },
  chipBuilt: {
    backgroundColor: theme.colors.primaryDark,
    borderColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.text,
    fontSize: theme.font.body,
    fontWeight: '600',
  },
  reset: {
    marginTop: theme.spacing(2),
    alignSelf: 'flex-start',
  },
  resetText: {
    color: theme.colors.textMuted,
    fontSize: theme.font.small,
    textDecorationLine: 'underline',
  },
});
