// Theme constants for the Shad mobile app
export const COLORS = {
  // Primary palette - romantic/elegant
  primary: '#E91E63',
  primaryDark: '#C2185B',
  primaryLight: '#F48FB1',
  primarySoft: '#FCE4EC',

  // Accent
  accent: '#FF4081',
  accentDark: '#F50057',

  // Backgrounds
  background: '#0D0D1A',
  surface: '#1A1A2E',
  surfaceLight: '#252542',
  card: '#16213E',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0C8',
  textMuted: '#6C6C8A',
  textOnPrimary: '#FFFFFF',

  // Status
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  online: '#4CAF50',
  offline: '#757575',

  // Chat
  sentBubble: '#E91E63',
  receivedBubble: '#252542',
  inputBackground: '#1A1A2E',

  // Borders
  border: '#2A2A4A',
  borderLight: '#3A3A5A',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const FONTS = {
  regular: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  small: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: COLORS.textPrimary,
  },
  caption: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};
