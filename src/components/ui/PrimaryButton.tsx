import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '../../theme';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'ghost';
  style?: ViewStyle;
}

/** Einheitlicher Aktions-Button. Primär mit Farbverlauf und dezentem Leuchten. */
export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  style,
}: Props) {
  const isGhost = variant === 'ghost';
  const dim = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={dim}
      style={({ pressed }) => [
        styles.wrap,
        !isGhost && !dim && theme.shadow.glow,
        dim && styles.disabled,
        pressed && !dim && styles.pressed,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {isGhost ? (
        <View style={[styles.base, styles.ghost]}>
          <Text style={[styles.label, styles.ghostLabel]}>{label}</Text>
        </View>
      ) : (
        <LinearGradient
          colors={theme.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.base}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.text} />
          ) : (
            <Text style={styles.label}>{label}</Text>
          )}
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: theme.radius.pill,
  },
  base: {
    minHeight: 56,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing(3),
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  label: {
    color: theme.colors.text,
    fontSize: theme.font.body,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  ghostLabel: {
    color: theme.colors.textMuted,
    fontWeight: '700',
  },
});
