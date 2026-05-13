# Theme System Usage Examples

## Importing Theme Modules

```typescript
// Import all at once
import { colors, opacity, spacing, qrSizes, getBandNameStyle, getTypographyStyle } from './styles';

// Or import individually
import { colors } from './styles/colors';
import { getBandNameStyle } from './styles/typography';
import { spacing } from './styles/layout';
```

## Using Colors

```typescript
import { colors, opacity, hexToRgba } from './styles';

// Solid colors
<div style={{ color: colors.whiteNoise, backgroundColor: colors.bridgeDrop }}>
  Text content
</div>

// With opacity
<div style={{ 
  backgroundColor: hexToRgba(colors.melodyMist, opacity.socialContainer) 
}}>
  Social links container
</div>

// Button with opacity
<button style={{ 
  backgroundColor: hexToRgba(colors.whiteNoise, opacity.socialButton),
  color: colors.midnightCruise
}}>
  Click me
</button>
```

## Using Typography

```typescript
import { getBandNameStyle, getTypographyStyle } from './styles';

// Automatic sizing based on name length
function BandNameDisplay({ name }: { name: string }) {
  return (
    <h1 style={getBandNameStyle(name, 'kiosk')}>
      {name}
    </h1>
  );
}

// Explicit typography variant
function Heading() {
  return (
    <h2 style={getTypographyStyle('headingLarge', 'kiosk')}>
      Now Performing!
    </h2>
  );
}

// Mobile context
function MobileBandName({ name }: { name: string }) {
  return (
    <h1 style={getBandNameStyle(name, 'mobile')}>
      {name}
    </h1>
  );
}
```

## Using Layout

```typescript
import { spacing, qrSizes, safeZones } from './styles';

// Spacing
<div style={{ 
  padding: spacing.md,
  marginTop: spacing.xl,
  gap: spacing.sm 
}}>
  Content
</div>

// QR Code sizing
<QRCode 
  value={url}
  size={qrSizes.display}
/>

// Safe zones for kiosk
<div style={{
  padding: `${safeZones.kiosk.top}px ${safeZones.kiosk.right}px ${safeZones.kiosk.bottom}px ${safeZones.kiosk.left}px`
}}>
  Content with safe margins
</div>
```

## Using BackgroundLayout

```typescript
import { BackgroundLayout } from './components/BackgroundLayout';
import { spacing } from './styles';

function MyPage() {
  return (
    <BackgroundLayout>
      <div style={{ padding: spacing.xl }}>
        Your page content here
      </div>
    </BackgroundLayout>
  );
}

// With custom styles
function CustomPage() {
  return (
    <BackgroundLayout 
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div>Centered content</div>
    </BackgroundLayout>
  );
}
```

## Complete Example: Display Page Header

```typescript
import { BackgroundLayout } from './components/BackgroundLayout';
import { colors, spacing, getBandNameStyle, getTypographyStyle } from './styles';

function DisplayPageHeader({ bandName }: { bandName: string }) {
  return (
    <BackgroundLayout>
      <div style={{ 
        padding: spacing.xl,
        color: colors.whiteNoise 
      }}>
        {/* "Now Performing!" heading */}
        <h2 style={{
          ...getTypographyStyle('headingLarge', 'kiosk'),
          marginBottom: spacing.md
        }}>
          Now Performing!
        </h2>

        {/* Band name - automatically sized */}
        <h1 style={getBandNameStyle(bandName, 'kiosk')}>
          {bandName}
        </h1>

        {/* Description */}
        <p style={{
          ...getTypographyStyle('bodySmall', 'kiosk'),
          marginTop: spacing.sm
        }}>
          1 line description
        </p>
      </div>
    </BackgroundLayout>
  );
}
```

## Type Safety

All theme values are strongly typed:

```typescript
// This will show autocomplete
const color = colors. // whiteNoise | midnightCruise | bridgeDrop | melodyMist | cloudSync

// Type checking prevents typos
const style = getTypographyStyle('heading', 'kiosk'); // TS Error: Invalid variant
const style = getTypographyStyle('headingLarge', 'tablet'); // TS Error: Invalid context

// Correct usage
const style = getTypographyStyle('headingLarge', 'kiosk'); // ✓
```
