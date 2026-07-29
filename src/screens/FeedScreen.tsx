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

import { StoryLessonCard } from '../components/StoryLessonCard';
import { SettingsModal } from '../components/SettingsModal';
import { GradientBackground } from '../components/ui/GradientBackground';
import { getCourse } from '../data/courses';
import { feedItemsForCourse, topicsForCourse } from '../data/lessons';
import { t } from '../i18n/de';
import { buildFeed } from '../logic/feed';
import { useAppState } from '../state/AppStateContext';
import { FeedItem, Level } from '../types';
import { theme } from '../theme';

interface FeedEntry {
  key: string;
  item: FeedItem;
}

/**
 * Der Haupt-Feed: ein vertikaler, seitenweiser Scroll-Feed. Jede "Seite" ist
 * eine ganze Lektion (StoryLessonCard), durch deren Karten man steppt. Neue
 * Lektionen werden nachgeladen, sobald man sich dem Ende nähert. Die Reihenfolge
 * liefert die adaptive buildFeed-Logik (Spaced Repetition + Niveau).
 */
export function FeedScreen() {
  const { state, recordAnswer, addXp, setLevel, toggleTopic, clearTopics, resetProgress } =
    useAppState();
  const insets = useSafeAreaInsets();

  const level = state.level ?? 'beginner';
  const course = getCourse(state.courseId);

  // Lektionen + Themen des gewählten Kurses.
  const courseItems = useMemo(() => feedItemsForCourse(state.courseId), [state.courseId]);
  const allTopics = useMemo(() => topicsForCourse(state.courseId), [state.courseId]);

  // Auf die ausgewählten Themen eingegrenzte Lektionen (leer = alle).
  const activeItems = useMemo(() => {
    if (state.topics.length === 0) return courseItems;
    return courseItems.filter((i) => state.topics.includes(i.topic));
  }, [courseItems, state.topics]);

  const [height, setHeight] = useState(0);
  const [items, setItems] = useState<FeedEntry[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Refs, damit Callbacks stets die aktuellen Werte sehen (keine veralteten Closures).
  const flatListRef = useRef<FlatList<FeedEntry>>(null);
  const currentIndexRef = useRef(0);
  const keyCounter = useRef(0);
  const progressRef = useRef(state.progress);
  const levelRef = useRef(level);
  progressRef.current = state.progress;
  levelRef.current = level;

  const toEntries = (list: FeedItem[]): FeedEntry[] =>
    list.map((item) => ({ key: `${item.id}#${keyCounter.current++}`, item }));

  // (Neu-)Aufbau des Feeds bei Start, Höhenänderung, Niveau- oder Themenwechsel.
  useEffect(() => {
    if (height <= 0) return;
    const built = buildFeed(activeItems, level, progressRef.current, Date.now(), { size: 8 });
    setItems(toEntries(built));
    currentIndexRef.current = 0;
    requestAnimationFrame(() =>
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height, level, activeItems]);

  const appendMore = () => {
    setItems((prev) => {
      const recent = new Set(prev.slice(-6).map((e) => e.item.id));
      const more = buildFeed(activeItems, levelRef.current, progressRef.current, Date.now(), {
        exclude: recent,
        size: 6,
      });
      return [...prev, ...toEntries(more)];
    });
  };

  const goNext = () => {
    const next = currentIndexRef.current + 1;
    if (next >= items.length - 2) appendMore();
    const scroll = () => flatListRef.current?.scrollToIndex({ index: next, animated: true });
    if (next < items.length) scroll();
    else setTimeout(scroll, 60);
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0 && h !== height) setHeight(h);
  };

  const onViewRef = useRef((info: { viewableItems: Array<{ index: number | null }> }) => {
    const first = info.viewableItems[0];
    if (first && first.index != null) currentIndexRef.current = first.index;
  });
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
      <GradientBackground style={StyleSheet.absoluteFill} />
      {height > 0 && items.length > 0 ? (
        <FlatList
          ref={flatListRef}
          data={items}
          keyExtractor={(e) => e.key}
          renderItem={({ item: entry }) => {
            const progress = progressRef.current[entry.item.id];
            return (
              <StoryLessonCard
                lesson={entry.item.lesson}
                isReview={progress ? progress.seenCount > 0 : false}
                height={height}
                onComplete={(correct) => {
                  recordAnswer(entry.item.id, correct);
                  addXp(entry.item.lesson.xp);
                }}
                onNext={goNext}
              />
            );
          }}
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

      {/* XP-Anzeige (Overlay) */}
      <View style={[styles.xpPill, { top: insets.top + theme.spacing(1) }]}>
        <Text style={styles.xpText}>⚡ {state.xp} XP</Text>
      </View>

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
        xp={state.xp}
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
  xpPill: {
    position: 'absolute',
    left: theme.spacing(2),
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing(1.75),
    height: 40,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.soft,
  },
  xpText: {
    color: theme.colors.text,
    fontSize: theme.font.small,
    fontWeight: '800',
  },
  settingsButton: {
    position: 'absolute',
    right: theme.spacing(2),
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.soft,
  },
  settingsIcon: {
    color: theme.colors.text,
    fontSize: 20,
  },
});
