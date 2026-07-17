import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { t } from '../i18n/de';
import { Course, Level, LessonProgress } from '../types';
import { theme } from '../theme';
import { isDue, isLearned } from '../logic/spacedRepetition';
import { PrimaryButton } from './ui/PrimaryButton';

interface Props {
  visible: boolean;
  course: Course | undefined;
  level: Level;
  progress: Record<string, LessonProgress>;
  onChangeLevel: (level: Level) => void;
  onReset: () => void;
  onClose: () => void;
}

/** Leichtgewichtige Einstellungen: Niveau umschalten, Statistik, Fortschritt löschen. */
export function SettingsModal({
  visible,
  course,
  level,
  progress,
  onChangeLevel,
  onReset,
  onClose,
}: Props) {
  const entries = Object.values(progress);
  const now = Date.now();
  const learned = entries.filter(isLearned).length;
  const due = entries.filter((p) => isDue(p, now)).length;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{t.settings.title}</Text>

          {course ? (
            <Text style={styles.course}>
              {course.flag} {course.fromLanguage} → {course.targetLanguage}
            </Text>
          ) : null}

          {/* Statistik */}
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{learned}</Text>
              <Text style={styles.statLabel}>{t.settings.learned}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{due}</Text>
              <Text style={styles.statLabel}>{t.settings.dueToday}</Text>
            </View>
          </View>

          {/* Niveau umschalten */}
          <Text style={styles.section}>{t.settings.level}</Text>
          <View style={styles.levelRow}>
            {(['beginner', 'advanced'] as const).map((lv) => {
              const selected = level === lv;
              return (
                <Pressable
                  key={lv}
                  onPress={() => onChangeLevel(lv)}
                  style={[styles.levelChip, selected && styles.levelChipSelected]}
                >
                  <Text style={[styles.levelText, selected && styles.levelTextSelected]}>
                    {lv === 'beginner' ? t.onboarding.beginner : t.onboarding.advanced}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <PrimaryButton
            label={t.settings.resetProgress}
            variant="ghost"
            onPress={onReset}
            style={{ marginTop: theme.spacing(3) }}
          />
          <PrimaryButton
            label={t.settings.close}
            onPress={onClose}
            style={{ marginTop: theme.spacing(1.5) }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    padding: theme.spacing(3),
    paddingBottom: theme.spacing(5),
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.font.heading,
    fontWeight: '800',
  },
  course: {
    color: theme.colors.textMuted,
    fontSize: theme.font.body,
    marginTop: theme.spacing(0.5),
  },
  stats: {
    flexDirection: 'row',
    gap: theme.spacing(2),
    marginTop: theme.spacing(3),
  },
  stat: {
    flex: 1,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    padding: theme.spacing(2),
    alignItems: 'center',
  },
  statValue: {
    color: theme.colors.primary,
    fontSize: theme.font.title,
    fontWeight: '800',
  },
  statLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.font.small,
    marginTop: 2,
    textAlign: 'center',
  },
  section: {
    color: theme.colors.text,
    fontSize: theme.font.body,
    fontWeight: '700',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1.5),
  },
  levelRow: {
    flexDirection: 'row',
    gap: theme.spacing(1.5),
  },
  levelChip: {
    flex: 1,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing(1.5),
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  levelChipSelected: {
    borderColor: theme.colors.primary,
  },
  levelText: {
    color: theme.colors.textMuted,
    fontSize: theme.font.body,
    fontWeight: '700',
  },
  levelTextSelected: {
    color: theme.colors.text,
  },
});
