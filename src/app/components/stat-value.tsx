'use client';

import * as stylex from '@stylexjs/stylex';
import { use } from 'react';
import { prettyTraffic } from 'xbits';
import { DownloadContext, JitterContext, LatencyContext, UploadContext } from '@/context/speedtest';
import { splitUnit } from '@/lib/split-unit';
import { bp } from '../../styles/breakpoints.stylex';
import { colors, fonts } from '../../styles/tokens.stylex';

const styles = stylex.create({
  statValue: {
    display: 'block',
    fontFamily: fonts.condensed,
    fontSize: { default: 22, [bp.large]: 24 },
    fontWeight: 300,
    lineHeight: 1.1,
    letterSpacing: '0',
    fontVariantNumeric: 'lining-nums tabular-nums',
    color: colors.ink
  },
  statUnit: {
    marginLeft: 4,
    fontFamily: fonts.sans,
    fontSize: { default: 11, [bp.large]: 12 },
    fontWeight: 400,
    letterSpacing: '0.02em',
    color: colors.inkMuted
  },
  empty: { color: colors.inkFaint }
});

const wholeNumber = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function formatOrDash(value: number | null, format: Intl.NumberFormat) {
  return value == null ? null : format.format(value);
}

export type StatKey = 'latency' | 'jitter' | 'downloadLatency' | 'uploadLatency' | 'downloaded' | 'uploaded';

/** Live reading while its phase runs, the settled result otherwise. */
function useStat(stat: StatKey): { value: string | null, unit: string } {
  switch (stat) {
    case 'latency':
      return { value: formatOrDash(use(LatencyContext), wholeNumber), unit: 'ms' };
    case 'jitter':
      return { value: formatOrDash(use(JitterContext), oneDecimal), unit: 'ms' };
    case 'downloadLatency':
      return { value: formatOrDash(use(DownloadContext).latency, wholeNumber), unit: 'ms' };
    case 'uploadLatency':
      return { value: formatOrDash(use(UploadContext).latency, wholeNumber), unit: 'ms' };
    case 'downloaded':
      return splitUnit(prettyTraffic(use(DownloadContext).bytes));
    case 'uploaded':
      return splitUnit(prettyTraffic(use(UploadContext).bytes));
    // no default
  }
}

interface StatValueProps {
  stat: StatKey
}

export function StatValue({ stat }: StatValueProps) {
  const { value, unit } = useStat(stat);
  return (
    <dd {...stylex.props(styles.statValue, value == null && styles.empty)}>
      {value ?? '—'}
      <span {...stylex.props(styles.statUnit)}>{unit}</span>
    </dd>
  );
}
