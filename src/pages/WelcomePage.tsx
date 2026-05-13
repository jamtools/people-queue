/**
 * WelcomePage Component
 *
 * Pre-event landing page that displays before any performer is selected.
 * Shows a static welcome screen SVG with all text embedded in the image.
 *
 * Route: /
 * Condition: Shown when currentPerformerId is null
 *
 * Reference: assets/Welcome Screen.png (mockup)
 */

import { BackgroundLayout } from '../components/BackgroundLayout';

export function WelcomePage() {
  return (
    <BackgroundLayout>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          minWidth: '100vw',
          padding: 0,
          margin: 0,
        }}
      >
        <img
          src="/assets/Welcome_Screen.svg"
          alt="Welcome to the show"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>
    </BackgroundLayout>
  );
}
