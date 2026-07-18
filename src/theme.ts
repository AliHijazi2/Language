/**
 * Zentrales Design-Token-Set. Dunkles, „TikTok-artiges" Vollbild-Feed-Gefühl,
 * aufgewertet mit sanften Farbverläufen, mehr Tiefe (Schatten) und Akzentfarben,
 * die zum Paly-Logo passen (Blau/Türkis/Orange).
 */
export const theme = {
  colors: {
    background: '#0C0F17',
    surface: '#1A2130',
    surfaceAlt: '#232C3E',
    primary: '#5B8DEF',
    primaryDark: '#3E6FD1',
    accent: '#33C9BD', // Türkis aus dem Logo
    accentWarm: '#F6A14A', // Orange aus dem Logo
    success: '#37D399',
    successBg: '#102E24',
    error: '#F26D63',
    errorBg: '#331A19',
    text: '#F2F5FA',
    textMuted: '#94A1B6',
    border: '#2C3547',
  },
  // Farbverläufe (Arrays für expo-linear-gradient).
  gradients: {
    background: ['#182338', '#0C0F17'] as const,
    primary: ['#6BA0FF', '#4E74E8'] as const,
    accent: ['#3ED6C7', '#2E9FE0'] as const,
    badge: ['#4E74E8', '#33C9BD'] as const,
  },
  radius: {
    sm: 12,
    md: 18,
    lg: 26,
    xl: 32,
    pill: 999,
  },
  spacing: (n: number) => n * 8,
  font: {
    hero: 34,
    title: 30,
    heading: 22,
    body: 17,
    small: 14,
  },
  // Schatten für mehr Tiefe (funktioniert auf iOS/Android/Web).
  shadow: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 10,
    },
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 5,
    },
    glow: {
      shadowColor: '#4E74E8',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      elevation: 8,
    },
  },
} as const;

export type Theme = typeof theme;
