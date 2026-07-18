import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '../../theme';

interface Props {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Bildschirmfüllender, sanfter Verlaufshintergrund. Wird hinter Onboarding und
 * Feed gelegt, um dem dunklen Look mehr Tiefe zu geben.
 */
export function GradientBackground({ children, style }: Props) {
  return (
    <View style={[styles.root, style]}>
      <LinearGradient
        colors={theme.gradients.background}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* dezenter Akzent-Schimmer oben */}
      <LinearGradient
        colors={['rgba(51,201,189,0.10)', 'rgba(51,201,189,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.glow}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 260,
  },
});
