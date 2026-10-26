import * as stylex from '@stylexjs/stylex';
import { CurrentYear } from 'foxact/current-year';
import { Speedtest } from './components/speedtest';
import { loadTargets } from '@/lib/targets';
import { bp } from '../styles/breakpoints.stylex';
import { colors } from '../styles/tokens.stylex';

const PAGE_PADDING = 'clamp(20px, 4vw, 40px)';

const styles = stylex.create({
  main: {
    position: 'relative',
    zIndex: 1,
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: PAGE_PADDING,
    paddingRight: PAGE_PADDING,
    paddingBottom: PAGE_PADDING,
    paddingLeft: PAGE_PADDING
  },
  // Left-aligned under the column above, closed by the same hairline.
  footer: {
    width: '100%',
    maxWidth: 1120,
    marginTop: { default: 40, [bp.mobile]: 28, [bp.large]: 56 },
    paddingTop: { default: 16, [bp.large]: 22 },
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.line,
    fontSize: { default: 12, [bp.large]: 13 },
    lineHeight: 1.9,
    fontVariantCaps: 'all-small-caps',
    letterSpacing: '0.16em',
    color: colors.inkMuted
  },
  footerLink: {
    color: colors.ink,
    textDecorationLine: 'underline',
    textDecorationColor: { default: colors.line, ':hover': colors.ink },
    textUnderlineOffset: 3,
    transitionProperty: 'text-decoration-color',
    transitionDuration: '150ms'
  }
});

export default function Home() {
  const targets = loadTargets();

  return (
    <main {...stylex.props(styles.main)}>
      <Speedtest targets={targets} />
      <footer {...stylex.props(styles.footer)}>
        &copy;
        {' '}
        <CurrentYear defaultYear={2026} />
        {' '}
        <a href="https://inshadow.uk" target="_blank" rel="noreferrer noopener" {...stylex.props(styles.footerLink)}>inshadow.uk</a>.
        <br />
        Based on
        {' '}
        <a href="https://github.com/SukkaW/speed.skk.moe" target="_blank" rel="noreferrer noopener" {...stylex.props(styles.footerLink)}>speed.skk.moe</a>
        {' '}
        by Sukka
      </footer>
    </main>
  );
}
