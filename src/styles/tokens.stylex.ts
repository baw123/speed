import * as stylex from '@stylexjs/stylex';

// Dark only, following inshadow.uk: a near-black base, and ink that recedes by opacity rather
// than by separate hues. The page no longer ships a light scheme.
export const colors = stylex.defineVars({
  surface: '#06080B',
  raised: 'rgba(214, 220, 227, 0.03)',
  ink: '#D6DCE3',
  inkMuted: 'rgba(214, 220, 227, 0.62)',
  inkFaint: 'rgba(214, 220, 227, 0.34)',
  line: 'rgba(214, 220, 227, 0.12)',
  control: 'rgba(214, 220, 227, 0.06)',
  download: '#BFD3E8',
  upload: '#C9B49C'
});

export const fonts = stylex.defineVars({
  // Cormorant Light is the only face on the page, exactly as on the inshadow.uk homepage.
  sans: 'var(--font-serif), "Cormorant Garamond", Garamond, "Iowan Old Style", Georgia, serif',
  condensed: 'var(--font-serif), "Cormorant Garamond", Garamond, "Iowan Old Style", Georgia, serif'
});
