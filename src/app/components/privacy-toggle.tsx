'use client';

import * as stylex from '@stylexjs/stylex';
import { Toggle } from '@base-ui/react/toggle';
import { useRedacted, useSetRedacted } from '@/context/speedtest';
import { colors } from '../../styles/tokens.stylex';

const styles = stylex.create({
  // A text link rather than a button, matching the footnote it sits in.
  privacyToggle: {
    display: 'inline',
    padding: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    color: { default: colors.inkMuted, ':hover': colors.ink },
    fontFamily: 'inherit',
    fontSize: 'inherit',
    fontWeight: 400,
    fontVariantCaps: 'inherit',
    letterSpacing: 'inherit',
    textDecorationLine: 'underline',
    textDecorationColor: { default: colors.line, ':hover': colors.ink },
    textUnderlineOffset: 3,
    cursor: 'pointer',
    outlineStyle: { default: 'none', ':focus-visible': 'solid' },
    outlineWidth: 2,
    outlineColor: colors.ink,
    outlineOffset: 2,
    transitionProperty: 'color, text-decoration-color',
    transitionDuration: '150ms'
  }
});

interface PrivacyToggleProps {
  /** Label while details are hidden. */
  showSlot: React.ReactNode,
  /** Label while details are visible. */
  hideSlot: React.ReactNode
}

export function PrivacyToggle({ showSlot, hideSlot }: PrivacyToggleProps) {
  const redacted = useRedacted();
  return (
    <Toggle pressed={redacted} onPressedChange={useSetRedacted()} {...stylex.props(styles.privacyToggle)}>
      {redacted ? showSlot : hideSlot}
    </Toggle>
  );
}
