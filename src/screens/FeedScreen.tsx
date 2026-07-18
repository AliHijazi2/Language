import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LessonCard } from '../components/LessonCard';
import { SettingsModal } from '../components/SettingsModal';
import { getCourse } from '../data/courses';
import { LESSONS } from '../data/lessons';
import { t } from '../i18n/de';
import { buildFeed } from '../logic/feed';
import { useAppState } from '../state/AppStateContext';
import { Lesson, Level } from '../types';
import { theme } from '../theme';

interface FeedItem {
  key: string;
  lesson: Lesson;
}

/**
 * Der Haupt-Feed: ein vertikaler, seitenweiser Scroll-Feed. Jede "Seite" ist
 * eine Lektion (LessonCard). Neue Lektionen werden nachgeladen, sobald man sich
 * dem Ende nähert – so fühlt sich der Feed endlos an. Die Reihenfolge liefert
 * die adaptive buildFeed-Logik (Spaced Repetition + Niveau).
 */
export function FeedScreen() {
  const { state, recordAnswer, setLevel, toggleTopic, clearTopics, resetProgress } =
    useAppState();
  const insets = useSafeAreaInsets();

  const level = state.level ?? 'beginner';
  const course = getCourse(state.courseId);

  // Nur Lektionen der gewählten Sprachrichtung.
  const courseLessons = useMemo(
    () => LESSONS.filter((l) => l.courseId === state.courseId),
    [state.courseId],
  );

  // Alle Themen dieser Sprachrichtung (in Reihenfolge des ersten Auftretens).
  const allTopics = useMemo(() => {
    const seen: string[] = [];
    for (const l of courseLessons) if (!seen.includes(l.topic)) seen.push(l.topic);
    return seen;
  }, [courseLessons]);

  // Auf die ausgewählten Themen eingegrenzte Lektionen (leer = alle).
  const activeLessons = useMemo(() => {
    if (state.topics.length === 0) return courseLessons;
    return courseLessons.filter((l) => state.topics.includes(l.topic));
  }, [courseLessons, state.topics]);

  const [height, setHeight] = useState(0);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Refs, damit Callbacks stets die aktuellen Werte sehen (keine veralteten Closures).
  const flatListRef = useRef<FlatList<FeedItem>>(null);
  const currentIndexRef = useRef(0);
  const keyCounter = useRef(0);
  const progressRef = useRef(state.progress);
  const levelRef = useRef(level);
  progressRef.current = state.progress;
  levelRef.current = level;

  const toItems = (lessons: Lesson[]): FeedItem[] =>
    lessons.map((lesson) => ({ key: `${lesson.id}#${keyCounter.current++}`, lesson }));

  // (Neu-)Aufbau des Feeds bei Start, Höhenänderung, Niveau- oder Themenwechsel.
  useEffect(() => {
    if (height <= 0) return;
    const built = buildFeed(activeLessons, level, progressRef.current, Date.now(), {
      size: 8,
    });
    setItems(toItems(built));
    currentIndexRef.current = 0;
    requestAnimationFrame(() =>
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height, level, activeLessons]);

  const appendMore = () => {
    setItems((prev) => {
      const recent = new Set(prev.slice(-6).map((i) => i.lesson.id));
      const more = buildFeed(activeLessons, levelRef.current, progressRef.current, Date.now(), {
        exclude: recent,
        size: 6,
      });
      return [...prev, ...toItems(more)];
    });
  };

  const goNext = () => {
    const next = currentIndexRef.current + 1;
    if (next >= items.length - 2) appendMore();
    const scroll = () => flatListRef.current?.scrollToIndex({ index: next, animated: true });
    if (next < items.length) scroll();
    else setTimeout(scroll, 60); // auf das Nachladen warten
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0 && h !== height) setHeight(h);
  };

  const onViewRef = useRef(
    (info: { viewableItems: Array<{ index: number | null }> }) => {
      const first = info.viewableItems[0];
      if (first && first.index != null) currentIndexRef.current = first.index;
    },
  );
  const viewConfigRef = useRef({ itemVisiblePercentThreshold: 60 });

  const handleChangeLevel = (lv: Level) => {
    setLevel(lv);
    setSettingsOpen(false);
  };

  const handleReset = () => {
    resetProgress();
    setSettingsOpen(false);
  };

  return (
    <View style={styles.container} onLayout={onLayout}>
      {height > 0 && items.length > 0 ? (
        <FlatList
          ref={flatListRef}
          data={items}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <LessonCard
              lesson={item.lesson}
              progress={progressRef.current[item.lesson.id]}
              height={height}
              onResult={(correct) => recordAnswer(item.lesson.id, correct)}
              onContinue={goNext}
            />
          )}
          pagingEnabled
          snapToInterval={height}
          snapToAlignment="start"
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
          onEndReached={appendMore}
          onEndReachedThreshold={0.6}
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={viewConfigRef.current}
          onScrollToIndexFailed={(info) => {
            setTimeout(
              () => flatListRef.current?.scrollToIndex({ index: info.index, animated: true }),
              100,
            );
          }}
        />
      ) : (
        <View style={styles.loading}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={styles.loadingText}>{t.feed.loading}</Text>
        </View>
      )}

      {/* Einstellungen-Button (Overlay) */}
      <Pressable
        onPress={() => setSettingsOpen(true)}
        style={[styles.settingsButton, { top: insets.top + theme.spacing(1) }]}
        accessibilityRole="button"
        accessibilityLabel={t.feed.settings}
        hitSlop={10}
      >
        <Text style={styles.settingsIcon}>⚙︎</Text>
      </Pressable>

      <SettingsModal
        visible={settingsOpen}
        course={course}
        level={level}
        progress={state.progress}
        allTopics={allTopics}
        selectedTopics={state.topics}
        onChangeLevel={handleChangeLevel}
        onToggleTopic={toggleTopic}
        onClearTopics={clearTopics}
        onReset={handleReset}
        onClose={() => setSettingsOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(1.5),
  },
  loadingText: {
    color: theme.colors.textMuted,
    fontSize: theme.font.small,
  },
  settingsButton: {
    position: 'absolute',
    right: theme.spacing(2),
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(23,27,34,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    color: theme.colors.text,
    fontSize: 20,
  },
});
