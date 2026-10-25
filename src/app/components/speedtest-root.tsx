'use client';

import * as stylex from '@stylexjs/stylex';
import { useSetRoot } from '@/context/speedtest';

const styles = stylex.create({
  // A plain left-aligned column; the frameless layout divides rows with space, not boxes.
  root: {
    width: '100%',
    maxWidth: 1120
  }
});

/** The captured block; the element is published so the screenshot button can reach it. */
export function SpeedtestRoot({ children }: React.PropsWithChildren) {
  return <div ref={useSetRoot()} {...stylex.props(styles.root)}>{children}</div>;
}
