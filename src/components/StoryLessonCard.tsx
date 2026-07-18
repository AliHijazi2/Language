import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { t } from '../i18n/de';
import {
  ExplanationCard,
  IntroCard,
  QuizCard,
  SpeakingCard,
  StoryLesson,
  TipCard,
} from '../types';
import { theme } from '../theme';
import { shuffle } from '../utils/shuffle';
import { PrimaryButton } from './ui/PrimaryButton';

interface Props {
  lesson: StoryLesson;
  isReview: boolean;
  height: number;
  onComplete: (correct: boolean) => void;
  onNext: () => void;
}

/**
 * Eine bildschirmfüllende Lektion, durch deren Karten man Schritt für Schritt
 * geht: Intro → Erklärung → Quiz → Sprechen → Tipp. Am Ende gibt es XP und der
 * Feed springt zur nächsten Lektion.
 */
export function StoryLessonCard({ lesson, isReview, height, onComplete, onNext }: Props) {
  const cards = lesson.cards;
  const [step, setStep] = useState(0);
  const [allCorrect, setAllCorrect] = useState(true);
  const [answered, setAnswered] = useState<Record<number, boolean>>({});

  const card = cards[step];
  const isLast = step === cards.length - 1;
  const isQuiz = card.type === 'quiz';
  const canProceed = !isQuiz || answered[step];

  const handleQuizResult = (correct: boolean) => {
    setAnswered((prev) => ({ ...prev, [step]: true }));
    if (!correct) setAllCorrect(false);
  };

  const handleNext = () => {
    if (!canProceed) return;
    if (isLast) {
      onComplete(allCorrect);
      onNext();
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <View style={[styles.card, { height }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Kopfzeile */}
        <View style={styles.header}>
          {isReview ? (
            <View style={[styles.badge, styles.badgeReview]}>
              <Text style={[styles.badgeText, styles.badgeTextReview]}>{t.feed.reviewBadge}</Text>
            </View>
          ) : (
            <LinearGradient
              colors={theme.gradients.badge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.badge}
            >
              <Text style={styles.badgeText}>{t.feed.newBadge}</Text>
            </LinearGradient>
          )}
          <Text style={styles.topic}>{lesson.category}</Text>
        </View>

        {/* Fortschritts-Punkte */}
        <View style={styles.dots}>
          {cards.map((_, i) => (
            <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
          ))}
        </View>

        {/* Aktuelle Karte */}
        <View style={styles.cardBody}>
          {card.type === 'lesson' && <IntroView card={card} topic={lesson.topic} />}
          {card.type === 'explanation' && <ExplanationView card={card} />}
          {card.type === 'quiz' && (
            <QuizView key={step} card={card} onResult={handleQuizResult} />
          )}
          {card.type === 'speaking' && <SpeakingView key={step} card={card} />}
          {card.type === 'tip' && <TipView card={card} />}
        </View>

        <PrimaryButton
          label={
            isLast ? `${t.lesson.finish}  ·  +${lesson.xp} ${t.lesson.xp}` : t.lesson.continue
          }
          onPress={handleNext}
          disabled={!canProceed}
        />

        <Text style={styles.swipeHint}>{t.feed.swipeHint}</Text>
      </ScrollView>
    </View>
  );
}

// ─────────────────────────── Kartentypen ───────────────────────────

function IntroView({ card, topic }: { card: IntroCard; topic: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.emoji}>{card.emoji}</Text>
      <Text style={styles.introTopic}>{topic}</Text>
      <Text style={styles.english}>{card.english}</Text>
      <Text style={styles.german}>{card.german}</Text>
    </View>
  );
}

function ExplanationView({ card }: { card: ExplanationCard }) {
  return (
    <View>
      <Text style={styles.explWord}>{card.word}</Text>
      <View style={styles.meaningRow}>
        <Text style={styles.meaningLabel}>{t.lesson.meaning}:</Text>
        <Text style={styles.meaningText}>{card.meaning}</Text>
      </View>
      <Text style={styles.explDesc}>{card.description}</Text>
    </View>
  );
}

function QuizView({ card, onResult }: { card: QuizCard; onResult: (c: boolean) => void }) {
  const options = useMemo(() => shuffle(card.answers), [card]);
  const [picked, setPicked] = useState<number | null>(null);
  const revealed = picked !== null;

  const choose = (index: number) => {
    if (revealed) return;
    setPicked(index);
    onResult(options[index].correct);
  };

  return (
    <View>
      <Text style={styles.question}>{card.question}</Text>
      {options.map((answer, index) => {
        const isPicked = picked === index;
        return (
          <Pressable
            key={answer.text}
            disabled={revealed}
            onPress={() => choose(index)}
            style={[
              styles.option,
              !revealed && isPicked && styles.optionSelected,
              revealed && answer.correct && styles.optionCorrect,
              revealed && isPicked && !answer.correct && styles.optionWrong,
            ]}
          >
            <Text style={styles.optionText}>{answer.text}</Text>
          </Pressable>
        );
      })}
      {revealed ? (
        <View
          style={[
            styles.feedback,
            {
              backgroundColor: options[picked].correct
                ? theme.colors.successBg
                : theme.colors.errorBg,
              borderColor: options[picked].correct ? theme.colors.success : theme.colors.error,
            },
          ]}
        >
          <Text
            style={[
              styles.feedbackTitle,
              { color: options[picked].correct ? theme.colors.success : theme.colors.error },
            ]}
          >
            {options[picked].correct ? t.lesson.correct : t.lesson.wrong}
          </Text>
          <Text style={styles.feedbackText}>{card.explanation}</Text>
        </View>
      ) : null}
    </View>
  );
}

function SpeakingView({ card }: { card: SpeakingCard }) {
  const [spoken, setSpoken] = useState(false);
  return (
    <View style={styles.center}>
      <Text style={styles.speakPrompt}>{t.lesson.speakPrompt}</Text>
      <Text style={styles.speakText}>{card.text}</Text>
      <Pressable
        onPress={() => setSpoken(true)}
        style={[styles.micButton, spoken && styles.micButtonDone]}
      >
        <Text style={styles.micIcon}>{spoken ? '✓' : '🎤'}</Text>
      </Pressable>
      <Text style={styles.spokenHint}>{spoken ? t.lesson.spoken : t.lesson.speakButton}</Text>
    </View>
  );
}

function TipView({ card }: { card: TipCard }) {
  return (
    <View style={styles.tipBox}>
      <Text style={styles.tipEmoji}>💡</Text>
      <Text style={styles.tipTitle}>{card.title}</Text>
      <Text style={styles.tipText}>{card.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%', backgroundColor: 'transparent' },
  content: {
    padding: theme.spacing(3),
    paddingTop: theme.spacing(4),
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
  },
  badge: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing(1.5),
    paddingVertical: theme.spacing(0.5),
  },
  badgeReview: {
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  badgeText: {
    color: theme.colors.onColor,
    fontSize: theme.font.small - 2,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  badgeTextReview: { color: theme.colors.textMuted },
  topic: {
    color: theme.colors.accent,
    fontSize: theme.font.small,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: theme.spacing(3),
  },
  dot: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.border,
  },
  dotActive: { backgroundColor: theme.colors.primary },
  cardBody: { marginBottom: theme.spacing(3) },
  center: { alignItems: 'center' },

  // Intro
  emoji: { fontSize: 64, marginBottom: theme.spacing(1) },
  introTopic: {
    color: theme.colors.textMuted,
    fontSize: theme.font.small,
    fontWeight: '600',
    marginBottom: theme.spacing(2),
  },
  english: {
    color: theme.colors.text,
    fontSize: theme.font.title,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: theme.spacing(1.5),
  },
  german: {
    color: theme.colors.textMuted,
    fontSize: theme.font.body,
    textAlign: 'center',
  },

  // Explanation
  explWord: {
    color: theme.colors.primary,
    fontSize: theme.font.hero,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: theme.spacing(1.5),
  },
  meaningRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: theme.spacing(2) },
  meaningLabel: { color: theme.colors.textMuted, fontSize: theme.font.body, fontWeight: '700' },
  meaningText: { color: theme.colors.text, fontSize: theme.font.body, fontWeight: '700' },
  explDesc: { color: theme.colors.textMuted, fontSize: theme.font.body, lineHeight: 24 },

  // Quiz
  question: {
    color: theme.colors.text,
    fontSize: theme.font.heading,
    fontWeight: '800',
    marginBottom: theme.spacing(2),
    lineHeight: 30,
  },
  option: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1.5),
    borderWidth: 2,
    borderColor: theme.colors.border,
    ...theme.shadow.soft,
  },
  optionSelected: { borderColor: theme.colors.primary },
  optionCorrect: { backgroundColor: theme.colors.successBg, borderColor: theme.colors.success },
  optionWrong: { backgroundColor: theme.colors.errorBg, borderColor: theme.colors.error },
  optionText: { color: theme.colors.text, fontSize: theme.font.body, fontWeight: '600' },
  feedback: {
    borderRadius: theme.radius.md,
    padding: theme.spacing(2),
    borderWidth: 1,
    marginTop: theme.spacing(0.5),
  },
  feedbackTitle: { fontSize: theme.font.body, fontWeight: '800', marginBottom: 2 },
  feedbackText: { color: theme.colors.text, fontSize: theme.font.small, lineHeight: 20 },

  // Speaking
  speakPrompt: {
    color: theme.colors.textMuted,
    fontSize: theme.font.small,
    marginBottom: theme.spacing(2),
  },
  speakText: {
    color: theme.colors.text,
    fontSize: theme.font.title,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: theme.spacing(3),
  },
  micButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.soft,
  },
  micButtonDone: { backgroundColor: theme.colors.successBg, borderColor: theme.colors.success },
  micIcon: { fontSize: 32 },
  spokenHint: {
    color: theme.colors.textMuted,
    fontSize: theme.font.small,
    marginTop: theme.spacing(1.5),
    fontWeight: '600',
  },

  // Tip
  tipBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing(3),
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.soft,
  },
  tipEmoji: { fontSize: 40, marginBottom: theme.spacing(1) },
  tipTitle: {
    color: theme.colors.text,
    fontSize: theme.font.heading,
    fontWeight: '800',
    marginBottom: theme.spacing(1),
  },
  tipText: { color: theme.colors.textMuted, fontSize: theme.font.body, lineHeight: 24 },

  swipeHint: {
    color: theme.colors.textMuted,
    fontSize: theme.font.small - 1,
    textAlign: 'center',
    marginTop: theme.spacing(3),
  },
});
