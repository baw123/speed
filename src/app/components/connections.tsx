'use client';

import * as stylex from '@stylexjs/stylex';
import { useMode, useRunning, useSetMode } from '@/context/speedtest';
import { colors, fonts } from '../../styles/tokens.stylex';

const styles = stylex.create({
  connections: {
    display: 'flex',
    alignItems: 'baseline',
    transitionProperty: 'opacity',
    transitionDuration: '150ms'
  },
  connectionsDisabled: { opacity: 0.55 },
  // Serif toggle: the active mode is lit, the other recedes to faint.
  option: {
    padding: '6px 0',
    borderStyle: 'none',
    backgroundColor: 'transparent',
    color: { default: colors.inkFaint, ':hover': colors.inkMuted },
    fontFamily: fonts.condensed,
    fontSize: { default: 28, '@media (max-width: 760px)': 26 },
    fontWeight: 300,
    lineHeight: 1.2,
    cursor: { default: 'pointer', ':disabled': 'default' },
    outlineStyle: { default: 'none', ':focus-visible': 'solid' },
    outlineWidth: 1,
    outlineColor: colors.gold,
    outlineOffset: 3,
    transitionProperty: 'color',
    transitionDuration: '300ms'
  },
  optionActive: { color: colors.lit },
  separator: {
    display: 'inline-block',
    width: 1,
    height: 16,
    backgroundColor: colors.mid,
    margin: '0 14px'
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
      <span aria-hidden {...stylex.props(styles.separator)} />
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
