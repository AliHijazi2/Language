import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { FeedScreen } from './screens/FeedScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { AppStateProvider, useAppState } from './state/AppStateContext';
import { theme } from './theme';

/** Entscheidet anhand des gespeicherten Zustands, welcher Screen gezeigt wird. */
function Root() {
  const { state, ready, completeOnboarding } = useAppState();

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (!state.onboarded) {
    return <OnboardingScreen onFinish={completeOnboarding} />;
  }

  return <FeedScreen />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={styles.app}>
        <AppStateProvider>
          <Root />
        </AppStateProvider>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
});
