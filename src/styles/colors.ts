/**
 * SongDrive Brand Color Palette
 *
 * These exact colors must be used throughout the application.
 * Do not deviate from these values.
 */

export const colors = {
  whiteNoise: '#FFFFFF',      // Primary text
  midnightCruise: '#2D2C80',  // Accent text/icons
  bridgeDrop: '#142A4C',      // Accent/background
  melodyMist: '#ABCED6',      // Social button backgrounds
  cloudSync: '#59A6DB',       // SongDrive logo only
} as const;

export const opacity = {
  socialContainer: 0.25,  // Melody Mist container
  socialButton: 0.88,     // White Noise buttons
  arrow: 0.90,            // Arrow icons
} as const;

/**
 * Helper function to convert hex color to rgba with opacity
 */
export function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
