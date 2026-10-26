'use client';

import * as stylex from '@stylexjs/stylex';
import { useSetRoot } from '@/context/speedtest';

const styles = stylex.create({
  // The captured block; mirrors the reference wrap: 1400px wide, left-aligned column.
  root: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: 1400
  }
});

/** The captured block; the element is published so the screenshot button can reach it. */
export function SpeedtestRoot({ children }: React.PropsWithChildren) {
  return <div ref={useSetRoot()} {...stylex.props(styles.root)}>{children}</div>;
}
