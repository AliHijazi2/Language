/**
 * Zentrales Design-Token-Set – heller „Hellblau"-Stil passend zum Paly-Logo:
 * sanfter Himmelblau-Verlauf, weiße Karten, dunkelblaue Schrift, Akzente in
 * Logo-Blau/Türkis/Orange.
 */
export const theme = {
  colors: {
    background: '#CFE7FA', // Basis-Hellblau (Fallback)
    surface: '#FFFFFF',
    surfaceAlt: '#E8F2FB',
    primary: '#3B9BD8', // Logo-Blau
    primaryDark: '#2F82BC',
    accent: '#20B2A6', // Türkis aus dem Logo
    accentWarm: '#F39A3D', // Orange aus dem Logo
    success: '#2FAE7A',
    successBg: '#DCF2E8',
    error: '#E5564B',
    errorBg: '#FBE1DF',
    text: '#25374D', // Dunkles Marineblau (wie der Schriftzug)
    textMuted: '#5F748C',
    border: '#CBDDEE',
    onColor: '#FFFFFF', // Schrift auf farbigen Flächen (Buttons/Badges)
  },
  // Farbverläufe (Arrays für expo-linear-gradient).
  gradients: {
    background: ['#EAF5FD', '#B9DCF3'] as const, // weicher Himmelblau-Verlauf
    primary: ['#57B0E6', '#3B93D4'] as const,
    accent: ['#31C2B4', '#2AA3D8'] as const,
    badge: ['#3B9BD8', '#20B2A6'] as const,
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
  // Weiche, bläuliche Schatten für den hellen Look.
  shadow: {
    card: {
      shadowColor: '#20456B',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.14,
      shadowRadius: 18,
      elevation: 6,
    },
    soft: {
      shadowColor: '#20456B',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    glow: {
      shadowColor: '#3B9BD8',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 14,
      elevation: 6,
    },
  },
} as const;

export type Theme = typeof theme;
