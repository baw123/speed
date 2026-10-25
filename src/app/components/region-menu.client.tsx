'use client';

import * as stylex from '@stylexjs/stylex';
import { Menu } from '@base-ui/react/menu';
import { ChevronDownIcon } from 'lucide-react';
import { menuStyles } from '../../styles/menu.stylex';
import { useRunning, useSetChoice } from '@/context/speedtest';
import { useTargetIndex } from '@/hooks/use-target';
import type { Target } from '@/lib/targets';
import { bp } from '../../styles/breakpoints.stylex';
import { colors } from '../../styles/tokens.stylex';

const styles = stylex.create({
  note: {
    marginLeft: 6,
    fontSize: 11,
    fontWeight: 400,
    letterSpacing: '0.04em',
    color: colors.inkFaint
  },
  // A quiet label at the header's right end rather than a control.
  trigger: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    paddingBlock: 4,
    paddingInline: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    color: { default: colors.inkMuted, ':hover': colors.ink },
    fontFamily: 'inherit',
    fontSize: { default: 12, [bp.large]: 13 },
    fontWeight: 400,
    fontVariantCaps: 'all-small-caps',
    letterSpacing: '0.16em',
    cursor: { default: 'pointer', ':disabled': 'default' },
    opacity: { default: 1, ':disabled': 0.5 },
    outlineStyle: { default: 'none', ':focus-visible': 'solid' },
    outlineWidth: 2,
    outlineColor: colors.ink,
    outlineOffset: 2,
    transitionProperty: 'color',
    transitionDuration: '150ms'
  },
  chevron: { width: 10, height: 10, marginTop: 1 }
});

interface RegionMenuClientProps {
  targets: readonly Target[],
  checkSlot: React.ReactNode
}

export function RegionMenuClient({ targets, checkSlot }: RegionMenuClientProps) {
  const index = useTargetIndex(targets);
  const value = targets[index];
  const setChoice = useSetChoice();
  const running = useRunning();

  return (
    <Menu.Root modal={false}>
      <Menu.Trigger
        disabled={running}
        aria-label={`Region: ${value.name}`}
        title="Region"
        {...stylex.props(styles.trigger)}
      >
        <span>{value.name}</span>
        <ChevronDownIcon aria-hidden {...stylex.props(styles.chevron)} />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={10} {...stylex.props(menuStyles.positioner)}>
          <Menu.Popup {...stylex.props(menuStyles.popup)}>
            <Menu.RadioGroup value={index} onValueChange={setChoice}>
              {targets.map((target, i) => (
                <Menu.RadioItem key={target.name} value={i} closeOnClick {...stylex.props(menuStyles.item)}>
                  <span>
                    {target.name}
                    {target.upload.length === 0 && <span {...stylex.props(styles.note)}>Upload not supported</span>}
                  </span>
                  <Menu.RadioItemIndicator {...stylex.props(menuStyles.check)}>
                    {checkSlot}
                  </Menu.RadioItemIndicator>
                </Menu.RadioItem>
              ))}
            </Menu.RadioGroup>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
