import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COURSES } from '../data/courses';
import { t } from '../i18n/de';
import { Level } from '../types';
import { theme } from '../theme';
import { PrimaryButton } from '../components/ui/PrimaryButton';

interface Props {
  onFinish: (courseId: string, level: Level) => void;
}

/**
 * Geführtes Onboarding VOR dem Feed (Anforderung): erst Sprache, dann Niveau.
 * Zwei kurze Schritte, danach startet das Scrollen.
 */
export function OnboardingScreen({ onFinish }: Props) {
  const [step, setStep] = useState<'language' | 'level'>('language');
  const [courseId, setCourseId] = useState<string | null>(null);
  const [level, setLevel] = useState<Level | null>(null);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.brand}>{t.appName}</Text>

        {step === 'language' ? (
          <>
            <Text style={styles.title}>{t.onboarding.languageTitle}</Text>
            <Text style={styles.subtitle}>{t.onboarding.languageSubtitle}</Text>

            <View style={styles.list}>
              {COURSES.map((course) => {
                const selected = courseId === course.id;
                return (
                  <Pressable
                    key={course.id}
                    disabled={!course.available}
                    onPress={() => setCourseId(course.id)}
                    style={[
                      styles.card,
                      selected && styles.cardSelected,
                      !course.available && styles.cardDisabled,
                    ]}
                    accessibilityRole="button"
                  >
                    <Text style={styles.flag}>{course.flag}</Text>
                    <View style={styles.cardTextWrap}>
                      <Text style={styles.cardTitle}>{course.targetLanguage}</Text>
                      <Text style={styles.cardHint}>
                        {course.available
                          ? `${course.fromLanguage} → ${course.targetLanguage}`
                          : t.onboarding.comingSoon}
                      </Text>
                    </View>
                    {selected && <Text style={styles.check}>✓</Text>}
                  </Pressable>
                );
              })}
            </View>

            <PrimaryButton
              label={t.onboarding.next}
              onPress={() => setStep('level')}
              disabled={!courseId}
            />
          </>
        ) : (
          <>
            <Text style={styles.title}>{t.onboarding.levelTitle}</Text>
            <Text style={styles.subtitle}>{t.onboarding.levelSubtitle}</Text>

            <View style={styles.list}>
              {(
                [
                  { key: 'beginner', label: t.onboarding.beginner, hint: t.onboarding.beginnerHint, emoji: '🌱' },
                  { key: 'advanced', label: t.onboarding.advanced, hint: t.onboarding.advancedHint, emoji: '🚀' },
                ] as const
              ).map((opt) => {
                const selected = level === opt.key;
                return (
                  <Pressable
                    key={opt.key}
                    onPress={() => setLevel(opt.key)}
                    style={[styles.card, selected && styles.cardSelected]}
                    accessibilityRole="button"
                  >
                    <Text style={styles.flag}>{opt.emoji}</Text>
                    <View style={styles.cardTextWrap}>
                      <Text style={styles.cardTitle}>{opt.label}</Text>
                      <Text style={styles.cardHint}>{opt.hint}</Text>
                    </View>
                    {selected && <Text style={styles.check}>✓</Text>}
                  </Pressable>
                );
              })}
            </View>

            <PrimaryButton
              label={t.onboarding.start}
              onPress={() => courseId && level && onFinish(courseId, level)}
              disabled={!level}
            />
            <PrimaryButton
              label={t.onboarding.back}
              onPress={() => setStep('language')}
              variant="ghost"
              style={{ marginTop: theme.spacing(1.5) }}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    padding: theme.spacing(3),
    paddingTop: theme.spacing(4),
    flexGrow: 1,
    justifyContent: 'center',
  },
  brand: {
    color: theme.colors.primary,
    fontSize: theme.font.small,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: theme.spacing(2),
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.font.title,
    fontWeight: '800',
    marginBottom: theme.spacing(1),
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.font.body,
    marginBottom: theme.spacing(3),
  },
  list: {
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(3),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing(2),
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceAlt,
  },
  cardDisabled: {
    opacity: 0.4,
  },
  flag: {
    fontSize: 30,
    marginRight: theme.spacing(2),
  },
  cardTextWrap: {
    flex: 1,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: theme.font.heading,
    fontWeight: '700',
  },
  cardHint: {
    color: theme.colors.textMuted,
    fontSize: theme.font.small,
    marginTop: 2,
  },
  check: {
    color: theme.colors.primary,
    fontSize: 22,
    fontWeight: '900',
    marginLeft: theme.spacing(1),
  },
});
