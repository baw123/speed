'use client';

import * as stylex from '@stylexjs/stylex';
import { useMode, useRunning, useSetMode } from '@/context/speedtest';
import { bp } from '../../styles/breakpoints.stylex';
import { colors, fonts } from '../../styles/tokens.stylex';

const styles = stylex.create({
  connections: {
    display: 'flex',
    alignItems: 'baseline',
    gap: { default: 12, [bp.large]: 14 },
    transitionProperty: 'opacity',
    transitionDuration: '150ms'
  },
  connectionsDisabled: { opacity: 0.55 },
  // Serif text toggle: the active mode is ink, the other recedes to faint; no underline.
  option: {
    padding: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    color: { default: colors.inkFaint, ':hover': colors.inkMuted },
    fontFamily: fonts.condensed,
    fontSize: { default: 18, [bp.large]: 20 },
    fontWeight: 400,
    lineHeight: 1.2,
    cursor: { default: 'pointer', ':disabled': 'default' },
    outlineStyle: { default: 'none', ':focus-visible': 'solid' },
    outlineWidth: 2,
    outlineColor: colors.ink,
    outlineOffset: 3,
    transitionProperty: 'color',
    transitionDuration: '150ms'
  },
  optionActive: { color: colors.ink },
  separator: {
    alignSelf: 'center',
    width: 1,
    height: 14,
    backgroundColor: colors.line
  }
});

/** Multi/single connection toggle; locked while a test runs. */
export function Connections() {
  const mode = useMode();
  const setMode = useSetMode();
  const running = useRunning();
  return (
    <div
      role="group"
      aria-label="Connections"
      {...stylex.props(styles.connections, running && styles.connectionsDisabled)}
    >
      <button
        type="button"
        aria-pressed={mode === 'multi'}
        disabled={running}
        onClick={() => setMode('multi')}
        {...stylex.props(styles.option, mode === 'multi' && styles.optionActive)}
      >
        Multi
      </button>
      <span aria-hidden {...stylex.props(styles.separator)}>·</span>
      <button
        type="button"
        aria-pressed={mode === 'single'}
        disabled={running}
        onClick={() => setMode('single')}
        {...stylex.props(styles.option, mode === 'single' && styles.optionActive)}
      >
        Single
      </button>
    </div>
  );
}
