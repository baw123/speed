import * as stylex from '@stylexjs/stylex';
import { colors } from './tokens.stylex';

/** Shared look of the header menus (region). Hairlines and flat ink, no rounded cards. */
export const menuStyles = stylex.create({
  trigger: {
    display: 'grid',
    placeItems: 'center',
    width: 34,
    height: 34,
    padding: 0,
    borderRadius: 2,
    borderStyle: 'none',
    boxShadow: `inset 0 0 0 1px ${colors.line}`,
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.control
    },
    color: {
      default: colors.inkMuted,
      ':hover': colors.ink
    },
    cursor: { default: 'pointer', ':disabled': 'default' },
    opacity: { default: 1, ':disabled': 0.5 },
    outlineStyle: { default: 'none', ':focus-visible': 'solid' },
    outlineWidth: 2,
    outlineColor: colors.ink,
    outlineOffset: 2,
    transitionProperty: 'background-color, color',
    transitionDuration: '150ms'
  },
  positioner: {
    zIndex: 10,
    outlineStyle: 'none'
  },
  popup: {
    minWidth: 170,
    padding: 4,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.line,
    borderRadius: 2,
    backgroundColor: '#0B0F14',
    boxShadow: '0 18px 40px -12px rgba(0, 0, 0, 0.75)',
    outlineStyle: 'none'
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    height: 34,
    paddingInline: 10,
    borderStyle: 'none',
    borderRadius: 2,
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.control,
      ':focus-visible': colors.control
    },
    color: {
      default: colors.inkMuted,
      ':hover': colors.ink,
      ':focus-visible': colors.ink
    },
    fontFamily: 'inherit',
    fontSize: 13,
    fontWeight: 400,
    outlineStyle: 'none',
    userSelect: 'none',
    cursor: 'pointer'
  },
  check: {
    display: 'flex',
    color: colors.ink
  }
});
