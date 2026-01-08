/**
 * Layout System
 *
 * Defines spacing, dimensions, and layout constants for the People Queue app.
 */

/**
 * QR Code Sizes
 */
export const qrSizes = {
  signup: 512,    // Large QR codes for signup screen (easy to scan from distance)
  display: 384,   // Medium QR codes for display page (balanced with layout)
} as const;

/**
 * Standard spacing scale
 * Use these values for consistent spacing throughout the app
 */
export const spacing = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
  xxl: 64,
  xxxl: 96,
} as const;

/**
 * Safe zones (margins from screen edges)
 */
export const safeZones = {
  kiosk: {
    top: spacing.xl,
    right: spacing.xl,
    bottom: spacing.xl,
    left: spacing.xl,
  },
  mobile: {
    top: spacing.lg,
    right: spacing.md,
    bottom: spacing.lg,
    left: spacing.md,
  },
} as const;

/**
 * Border radius values
 */
export const borderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  qrContainer: 16, // White container for QR codes
  socialContainer: 16, // Social links container
  socialButton: 24, // Individual social buttons
} as const;

/**
 * Common dimensions
 */
export const dimensions = {
  // Logo sizes
  logoKiosk: {
    width: 200,
    height: 60,
  },
  logoMobile: {
    width: 120,
    height: 36,
  },

  // QR code container padding
  qrContainerPadding: spacing.md,

  // Social link button dimensions
  socialButton: {
    height: 72, // Mobile profile page button height
    iconSize: 32, // Platform icon size
    chevronSize: 28, // Chevron arrow size
  },

  // Footer logo size
  footerLogoHeight: 30,
} as const;

/**
 * Breakpoint for mobile detection
 * Note: In practice, kiosk and mobile are separate pages,
 * but this is useful for conditional rendering if needed
 */
export const MOBILE_BREAKPOINT = 768;

/**
 * Z-index layers
 */
export const zIndex = {
  background: 0,
  content: 1,
  overlay: 10,
  modal: 100,
} as const;
