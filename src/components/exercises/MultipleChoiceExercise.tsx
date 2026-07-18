import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { MultipleChoiceLesson } from '../../types';
import { theme } from '../../theme';
import { shuffle } from '../../utils/shuffle';
import { ExerciseShell } from './ExerciseShell';

interface Props {
  lesson: MultipleChoiceLesson;
  onResult: (correct: boolean) => void;
  onContinue: () => void;
}

/** Aufgabentyp "Antippen (Multiple-Choice)": eine von mehreren Optionen wählen. */
export function MultipleChoiceExercise({ lesson, onResult, onContinue }: Props) {
  const correctText = lesson.options[lesson.correctIndex];
  // Optionen einmal pro Lektion mischen, damit die richtige nicht immer oben steht.
  const options = useMemo(() => shuffle(lesson.options), [lesson.id]);
  const [selected, setSelected] = useState<number | null>(null);

  const evaluate = () => selected !== null && options[selected] === correctText;

  return (
    <ExerciseShell
      prompt={lesson.prompt}
      canCheck={selected !== null}
      evaluate={evaluate}
      solutionText={correctText}
      explanation={lesson.explanation}
      onResult={onResult}
      onContinue={onContinue}
    >
      {({ revealed }) =>
        options.map((option, index) => {
          const isSelected = selected === index;
          const isCorrect = option === correctText;

          return (
            <Pressable
              key={option}
              disabled={revealed}
              onPress={() => setSelected(index)}
              style={[
                styles.optionBase,
                styles.option,
                isSelected && !revealed && styles.optionSelected,
                revealed && isCorrect && styles.optionCorrect,
                revealed && isSelected && !isCorrect && styles.optionWrong,
              ]}
              accessibilityRole="button"
            >
              <Text style={styles.optionText}>{option}</Text>
            </Pressable>
          );
        })
      }
    </ExerciseShell>
  );
}

const styles = StyleSheet.create({
  optionBase: {
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing(2),
    paddingHorizontal: theme.spacing(2),
    marginBottom: theme.spacing(1.5),
    borderWidth: 2,
    ...theme.shadow.soft,
  },
  option: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  optionSelected: {
    backgroundColor: theme.colors.surfaceAlt,
    borderColor: theme.colors.primary,
  },
  optionCorrect: {
    backgroundColor: theme.colors.successBg,
    borderColor: theme.colors.success,
  },
  optionWrong: {
    backgroundColor: theme.colors.errorBg,
    borderColor: theme.colors.error,
  },
  optionText: {
    color: theme.colors.text,
    fontSize: theme.font.body,
    fontWeight: '600',
  },
});
