/**
 * BackgroundLayout Component
 *
 * Wrapper component that applies the SongDrive blue gradient background.
 * Uses the background.svg asset for consistent branding across all pages.
 *
 * Usage:
 *   <BackgroundLayout>
 *     <YourPageContent />
 *   </BackgroundLayout>
 */

import { CSSProperties, ReactNode } from 'react';

interface BackgroundLayoutProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function BackgroundLayout({
  children,
  className = '',
  style = {},
}: BackgroundLayoutProps) {
  const containerStyle: CSSProperties = {
    minHeight: '100vh',
    width: '100vw',
    backgroundImage: 'url(/assets/background.svg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
    ...style,
  };

  return (
    <div style={containerStyle} className={className}>
      {children}
    </div>
  );
}
