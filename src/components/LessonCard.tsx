import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { t } from '../i18n/de';
import { Lesson, LessonProgress } from '../types';
import { theme } from '../theme';
import { MatchingExercise } from './exercises/MatchingExercise';
import { MultipleChoiceExercise } from './exercises/MultipleChoiceExercise';
import { SentenceBuilderExercise } from './exercises/SentenceBuilderExercise';

interface Props {
  lesson: Lesson;
  progress: LessonProgress | undefined;
  height: number;
  onResult: (correct: boolean) => void;
  onContinue: () => void;
}

/**
 * Eine bildschirmfüllende "Feed-Karte" (ein Video-Äquivalent). Zeigt Kopfzeile
 * mit Thema/Titel und darunter die zum Aufgabentyp passende Übung.
 */
export function LessonCard({ lesson, progress, height, onResult, onContinue }: Props) {
  // Badge einmalig beim Erscheinen der Karte festlegen, damit es nicht direkt
  // nach dem Beantworten von "Neu" auf "Wiederholung" umspringt.
  const [isReview] = useState(() => (progress ? progress.seenCount > 0 : false));

  return (
    <View style={[styles.card, { height }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View
            style={[
              styles.badge,
              { backgroundColor: isReview ? theme.colors.surfaceAlt : theme.colors.primaryDark },
            ]}
          >
            <Text style={styles.badgeText}>
              {isReview ? t.feed.reviewBadge : t.feed.newBadge}
            </Text>
          </View>
          <Text style={styles.topic}>{lesson.topic}</Text>
        </View>

        <Text style={styles.title}>{lesson.title}</Text>

        <View style={styles.exercise}>
          {lesson.type === 'multipleChoice' && (
            <MultipleChoiceExercise
              lesson={lesson}
              onResult={onResult}
              onContinue={onContinue}
            />
          )}
          {lesson.type === 'sentenceBuilder' && (
            <SentenceBuilderExercise
              lesson={lesson}
              onResult={onResult}
              onContinue={onContinue}
            />
          )}
          {lesson.type === 'matching' && (
            <MatchingExercise lesson={lesson} onResult={onResult} onContinue={onContinue} />
          )}
        </View>

        <Text style={styles.swipeHint}>{t.feed.swipeHint}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing(3),
    paddingTop: theme.spacing(4),
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing(1.5),
    gap: theme.spacing(1.5),
  },
  badge: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing(1.5),
    paddingVertical: theme.spacing(0.5),
  },
  badgeText: {
    color: theme.colors.text,
    fontSize: theme.font.small - 2,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  topic: {
    color: theme.colors.textMuted,
    fontSize: theme.font.small,
    fontWeight: '600',
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.font.title,
    fontWeight: '800',
    marginBottom: theme.spacing(3),
  },
  exercise: {
    flexShrink: 0,
  },
  swipeHint: {
    color: theme.colors.textMuted,
    fontSize: theme.font.small - 1,
    textAlign: 'center',
    marginTop: theme.spacing(4),
  },
});
