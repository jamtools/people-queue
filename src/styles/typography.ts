/**
 * Typography System
 *
 * Font families, sizes, and helpers for the People Queue app.
 * Provides separate sizing for Kiosk (1080p projection) and Mobile (phone portrait) contexts.
 */

import { CSSProperties } from 'react';

/**
 * Font Families
 */
export const fontFamilies = {
  fredoka: "'Fredoka', sans-serif",
  poppins: "'Poppins', sans-serif",
} as const;

/**
 * Character threshold for determining "long" band names
 * Names longer than this will use smaller font size and two-line layout
 */
export const LONG_NAME_THRESHOLD = 15;

/**
 * Kiosk (1080p Projection Screen) Typography Sizes
 */
export const kioskSizes = {
  // Band Names (Fredoka Semi-Bold 600)
  bandNameShort: {
    fontSize: '140px',
    lineHeight: '1.1',
    fontWeight: 600,
    fontFamily: fontFamilies.fredoka,
  },
  bandNameLong: {
    fontSize: '90px',
    lineHeight: '1.05', // Tighter line spacing for two-line names
    fontWeight: 600,
    fontFamily: fontFamilies.fredoka,
  },

  // Poppins Text
  headingLarge: {
    fontSize: '40px',
    lineHeight: '1.2',
    fontWeight: 700,
    fontFamily: fontFamilies.poppins,
  },
  headingMedium: {
    fontSize: '28px',
    lineHeight: '1.3',
    fontWeight: 700,
    fontFamily: fontFamilies.poppins,
  },
  body: {
    fontSize: '24px',
    lineHeight: '1.4',
    fontWeight: 500,
    fontFamily: fontFamilies.poppins,
  },
  bodySmall: {
    fontSize: '24px',
    lineHeight: '1.4',
    fontWeight: 500,
    fontFamily: fontFamilies.poppins,
  },
  socialHandle: {
    fontSize: '28px',
    lineHeight: '1.2',
    fontWeight: 700,
    fontFamily: fontFamilies.poppins,
  },
  footerText: {
    fontSize: '20px',
    lineHeight: '1.4',
    fontWeight: 500,
    fontFamily: fontFamilies.poppins,
  },
} as const;

/**
 * Mobile (Phone Portrait) Typography Sizes
 */
export const mobileSizes = {
  // Band Names (Fredoka Semi-Bold 600)
  bandNameShort: {
    fontSize: '64px',
    lineHeight: '1.1',
    fontWeight: 600,
    fontFamily: fontFamilies.fredoka,
  },
  bandNameLong: {
    fontSize: '48px',
    lineHeight: '1.05', // Tighter line spacing for two-line names
    fontWeight: 600,
    fontFamily: fontFamilies.fredoka,
  },

  // Poppins Text
  headingLarge: {
    fontSize: '32px',
    lineHeight: '1.2',
    fontWeight: 700,
    fontFamily: fontFamilies.poppins,
  },
  headingMedium: {
    fontSize: '22px',
    lineHeight: '1.3',
    fontWeight: 700,
    fontFamily: fontFamilies.poppins,
  },
  body: {
    fontSize: '18px',
    lineHeight: '1.4',
    fontWeight: 500,
    fontFamily: fontFamilies.poppins,
  },
  bodySmall: {
    fontSize: '18px',
    lineHeight: '1.4',
    fontWeight: 500,
    fontFamily: fontFamilies.poppins,
  },
  socialHandle: {
    fontSize: '22px',
    lineHeight: '1.2',
    fontWeight: 700,
    fontFamily: fontFamilies.poppins,
  },
  footerText: {
    fontSize: '16px',
    lineHeight: '1.4',
    fontWeight: 500,
    fontFamily: fontFamilies.poppins,
  },
} as const;

/**
 * Context type for typography
 */
export type TypographyContext = 'kiosk' | 'mobile';

/**
 * Typography variant keys
 */
export type TypographyVariant =
  | 'bandNameShort'
  | 'bandNameLong'
  | 'headingLarge'
  | 'headingMedium'
  | 'body'
  | 'bodySmall'
  | 'socialHandle'
  | 'footerText';

/**
 * Get typography style for a given variant and context
 */
export function getTypographyStyle(
  variant: TypographyVariant,
  context: TypographyContext = 'kiosk'
): CSSProperties {
  const sizes = context === 'kiosk' ? kioskSizes : mobileSizes;
  return sizes[variant] as CSSProperties;
}

/**
 * Determine if a band name is "long" and should use smaller font size
 */
export function isLongBandName(name: string): boolean {
  return name.length > LONG_NAME_THRESHOLD;
}

/**
 * Get the appropriate band name typography style based on name length
 */
export function getBandNameStyle(
  name: string,
  context: TypographyContext = 'kiosk'
): CSSProperties {
  const variant = isLongBandName(name) ? 'bandNameLong' : 'bandNameShort';
  return getTypographyStyle(variant, context);
}
