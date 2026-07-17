/**
 * Zentrales Design-Token-Set. Bewusst schlicht gehalten (dunkles, "TikTok-artiges"
 * Vollbild-Feed-Gefühl). Wird von allen Komponenten genutzt, damit das Aussehen
 * an einer Stelle änderbar bleibt.
 */
export const theme = {
  colors: {
    background: '#0E1116',
    surface: '#171B22',
    surfaceAlt: '#1F2530',
    primary: '#5B8DEF',
    primaryDark: '#3E6FD1',
    success: '#3DD68C',
    successBg: '#123227',
    error: '#F0655C',
    errorBg: '#3A1C1A',
    text: '#F5F7FA',
    textMuted: '#9BA6B4',
    border: '#2A313C',
  },
  radius: {
    sm: 10,
    md: 16,
    lg: 24,
    pill: 999,
  },
  spacing: (n: number) => n * 8,
  font: {
    title: 30,
    heading: 22,
    body: 17,
    small: 14,
  },
} as const;

export type Theme = typeof theme;
