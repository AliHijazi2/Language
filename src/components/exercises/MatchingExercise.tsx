import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { t } from '../../i18n/de';
import { MatchingLesson } from '../../types';
import { theme } from '../../theme';
import { shuffle } from '../../utils/shuffle';
import { ExerciseShell } from './ExerciseShell';

interface Props {
  lesson: MatchingLesson;
  onResult: (correct: boolean) => void;
  onContinue: () => void;
}

// Farben, um verbundene Paare vor dem Auflösen sichtbar zu machen.
const PAIR_COLORS = ['#5B8DEF', '#3DD68C', '#E0A458', '#B072E8'];

/** Aufgabentyp "Zuordnen": links antippen, dann rechts die passende Bedeutung. */
export function MatchingExercise({ lesson, onResult, onContinue }: Props) {
  // Jede Zeile hat eine stabile ID = Index im Original. Ein Paar gilt als richtig,
  // wenn targetId === fromId.
  const targets = useMemo(
    () => lesson.pairs.map((p, i) => ({ id: i, text: p.target })),
    [lesson.id],
  );
  const froms = useMemo(
    () => shuffle(lesson.pairs.map((p, i) => ({ id: i, text: p.from }))),
    [lesson.id],
  );

  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>({});

  const fromForTarget = (targetId: number): number | undefined => matches[targetId];
  const targetForFrom = (fromId: number): number | undefined => {
    const entry = Object.entries(matches).find(([, fVal]) => fVal === fromId);
    return entry ? Number(entry[0]) : undefined;
  };

  const colorForTarget = (targetId: number) => PAIR_COLORS[targetId % PAIR_COLORS.length];

  const pickFrom = (fromId: number) => {
    if (selectedTarget === null) return;
    setMatches((prev) => {
      const next: Record<number, number> = {};
      // Bestehende Zuordnungen übernehmen, aber Konflikte (gleicher Ziel-/From-Wert) lösen.
      for (const [tKey, fVal] of Object.entries(prev)) {
        const tId = Number(tKey);
        if (tId === selectedTarget) continue; // altes Ziel neu setzen
        if (fVal === fromId) continue; // From war anderweitig belegt → freigeben
        next[tId] = fVal;
      }
      next[selectedTarget] = fromId;
      return next;
    });
    setSelectedTarget(null);
  };

  const allMatched = Object.keys(matches).length === lesson.pairs.length;
  const evaluate = () => lesson.pairs.every((_, i) => matches[i] === i);
  const solutionText = lesson.pairs.map((p) => `${p.target} = ${p.from}`).join(', ');

  return (
    <ExerciseShell
      prompt={lesson.prompt}
      hint={t.feed.matchHint}
      canCheck={allMatched}
      evaluate={evaluate}
      solutionText={solutionText}
      explanation={lesson.explanation}
      onResult={onResult}
      onContinue={onContinue}
    >
      {({ revealed }) => (
        <View style={styles.columns}>
          {/* Linke Spalte: Lernsprache */}
          <View style={styles.column}>
            {targets.map((target) => {
              const matchedFrom = fromForTarget(target.id);
              const isMatched = matchedFrom !== undefined;
              const isSelected = selectedTarget === target.id;
              const correct = revealed && matches[target.id] === target.id;
              const wrong = revealed && isMatched && matches[target.id] !== target.id;

              return (
                <Pressable
                  key={target.id}
                  disabled={revealed}
                  onPress={() => setSelectedTarget(target.id)}
                  style={[
                    styles.item,
                    isSelected && styles.itemSelected,
                    isMatched && !revealed && { borderColor: colorForTarget(target.id) },
                    correct && styles.itemCorrect,
                    wrong && styles.itemWrong,
                  ]}
                >
                  <Text style={styles.itemText}>{target.text}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Rechte Spalte: Menüsprache */}
          <View style={styles.column}>
            {froms.map((from) => {
              const owningTarget = targetForFrom(from.id);
              const isMatched = owningTarget !== undefined;
              const correct = revealed && isMatched && owningTarget === from.id;
              const wrong = revealed && isMatched && owningTarget !== from.id;

              return (
                <Pressable
                  key={from.id}
                  disabled={revealed}
                  onPress={() => pickFrom(from.id)}
                  style={[
                    styles.item,
                    isMatched &&
                      !revealed &&
                      owningTarget !== undefined && {
                        borderColor: colorForTarget(owningTarget),
                      },
                    correct && styles.itemCorrect,
                    wrong && styles.itemWrong,
                  ]}
                >
                  <Text style={styles.itemText}>{from.text}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </ExerciseShell>
  );
}

const styles = StyleSheet.create({
  columns: {
    flexDirection: 'row',
    gap: theme.spacing(1.5),
  },
  column: {
    flex: 1,
    gap: theme.spacing(1.5),
  },
  item: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing(1.75),
    paddingHorizontal: theme.spacing(1.5),
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 52,
    justifyContent: 'center',
  },
  itemSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceAlt,
  },
  itemCorrect: {
    backgroundColor: theme.colors.successBg,
    borderColor: theme.colors.success,
  },
  itemWrong: {
    backgroundColor: theme.colors.errorBg,
    borderColor: theme.colors.error,
  },
  itemText: {
    color: theme.colors.text,
    fontSize: theme.font.body,
    fontWeight: '600',
    textAlign: 'center',
  },
});
