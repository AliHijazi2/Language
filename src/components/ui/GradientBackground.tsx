import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '../../theme';

interface Props {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Bildschirmfüllender, weicher Himmelblau-Verlauf (passend zum Logo). Ein
 * einziger durchgehender Verlauf von oben nach unten – ohne harte Kanten.
 */
export function GradientBackground({ children, style }: Props) {
  return (
    <View style={[styles.root, style]}>
      <LinearGradient
        colors={theme.gradients.background}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
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
});
