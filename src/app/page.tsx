import * as stylex from '@stylexjs/stylex';
import { Speedtest } from './components/speedtest';
import { loadTargets } from '@/lib/targets';

const PAGE_PADDING = 'clamp(28px, 6vw, 96px)';

const styles = stylex.create({
  main: {
    position: 'relative',
    zIndex: 1,
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 0,
    paddingRight: PAGE_PADDING,
    paddingBottom: 0,
    paddingLeft: PAGE_PADDING
  }
});

export default function Home() {
  const targets = loadTargets();

  return (
    <main {...stylex.props(styles.main)}>
      <Speedtest targets={targets} />
    </main>
  );
}
