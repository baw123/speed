import * as stylex from '@stylexjs/stylex';

// Dark only, matching the speed-inshadow reference: a near-black base, ink that recedes through
// discrete steps rather than opacity, and a gold reserved for the upload direction.
export const colors = stylex.defineVars({
  surface: '#080a0d',
  raised: '#10141a',
  // Lit is the brightest ink, used for headline figures and the active toggle.
  lit: '#eef1f6',
  ink: '#c9ced6',
  inkMuted: '#6b7380',
  inkFaint: '#3a424d',
  line: '#171c23',
  // Hairlines between toggles and the screenshot underline sit one step above the base line.
  mid: '#2a323d',
  control: 'rgba(214, 220, 227, 0.06)',
  gold: '#d8c7a1',
  download: '#c3cfdf',
  upload: '#dccba5'
});

export const fonts = stylex.defineVars({
  // The page is set entirely in Cormorant Garamond Light, including the italic tagline.
  sans: 'var(--font-serif), "Cormorant Garamond", Garamond, "Iowan Old Style", Georgia, serif',
  condensed: 'var(--font-serif), "Cormorant Garamond", Garamond, "Iowan Old Style", Georgia, serif'
});
