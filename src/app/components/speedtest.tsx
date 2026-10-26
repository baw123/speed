'use client';

import * as stylex from '@stylexjs/stylex';
import { useEffect, useRef } from 'react';
import { ComposeContextProvider } from 'foxact/compose-context-provider';
import { Connections } from './connections';
import { DirectionSection } from './direction-section';
import { GeoValue } from './geo-value';
import { ScreenshotButton } from './screenshot-button';
import { SpeedReadout, SpeedTrend } from './speed-readout';
import { CapturingProvider, ChoiceProvider, DownloadProvider, JitterProvider, LatencyProvider, ModeProvider, PhaseProvider, RedactedProvider, RootProvider, UploadProvider, usePhase } from '@/context/speedtest';
import { SpeedtestRoot } from './speedtest-root';
import { StartButton } from './start-button';
import { StatValue } from './stat-value';
import type { StatKey } from './stat-value';
import { Wordmark } from './wordmark';
import { colors } from '../../styles/tokens.stylex';
import type { Target } from '@/lib/targets';

const styles = stylex.create({
  glow: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 0,
    background: 'radial-gradient(ellipse 60% 55% at var(--gx, 14%) var(--gy, 22%), rgba(120,135,155,calc(0.16 + var(--k, 0) * 0.14)), transparent 70%)'
  },
  header: {
    position: 'relative',
    paddingTop: 'clamp(112px, 18vh, 176px)',
    paddingBottom: 'clamp(28px, 6vh, 64px)'
  },
  hint: {
    marginTop: 'clamp(8px, 1.6vw, 20px)',
    fontStyle: 'italic',
    fontWeight: 300,
    fontSize: 'clamp(15px, 1.5vw, 19px)',
    color: colors.inkMuted,
    minHeight: '1.4em',
    transitionProperty: 'opacity',
    transitionDuration: '400ms'
  },
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    columnGap: { default: 64, '@media (max-width: 760px)': 40 },
    rowGap: { default: 28, '@media (max-width: 760px)': 24 },
    alignItems: 'flex-end',
    paddingTop: 28,
    paddingBottom: 8
  },
  lab: {
    fontSize: 11,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: colors.inkMuted,
    marginBottom: 8
  },
  res: {
    display: 'grid',
    gridTemplateColumns: { default: '1fr 1fr', '@media (max-width: 760px)': '1fr' },
    columnGap: 120,
    rowGap: { default: 0, '@media (max-width: 760px)': 44 },
    paddingTop: { default: 56, '@media (max-width: 760px)': 40 }
  },
  downloadLab: {
    '::before': { content: '"↓ "' }
  },
  uploadLab: {
    '::before': { content: '"↑ "', color: colors.gold }
  },
  sub: {
    display: 'flex',
    flexWrap: 'wrap',
    columnGap: { default: 56, '@media (max-width: 760px)': 24 },
    rowGap: { default: 24, '@media (max-width: 760px)': 28 },
    paddingTop: { default: 48, '@media (max-width: 760px)': 36 },
    paddingBottom: { default: 40, '@media (max-width: 760px)': 32 }
  },
  info: {
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.line,
    paddingTop: 36,
    display: 'flex',
    flexWrap: 'wrap',
    columnGap: { default: 64, '@media (max-width: 760px)': 40 },
    rowGap: 28,
    alignItems: 'flex-end'
  },
  footer: {
    marginTop: { default: 64, '@media (max-width: 760px)': 48 },
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.line,
    paddingTop: 24,
    paddingBottom: 48,
    fontSize: 11,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: colors.inkFaint,
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8
  },
  footerLink: {
    color: colors.inkMuted,
    textDecorationLine: 'none',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.mid
  }
});

/** One `createContextState` per concern, so a leaf re-renders only for the state it reads. */
const contexts = [
  <PhaseProvider key="phase" />,
  <LatencyProvider key="latency" />,
  <JitterProvider key="jitter" />,
  <DownloadProvider key="download" />,
  <UploadProvider key="upload" />,
  <ModeProvider key="mode" />,
  <ChoiceProvider key="choice" />,
  <RedactedProvider key="redacted" />,
  <CapturingProvider key="capturing" />,
  <RootProvider key="root" />
];

interface SpeedtestProps {
  targets: readonly Target[]
}

/** A single soft glow follows the dot of the "i"; its intensity rises while a run is active. */
function Glow() {
  const ref = useRef<HTMLDivElement>(null);
  const phase = usePhase();
  const running = phase === 'latency' || phase === 'download' || phase === 'upload';

  useEffect(() => {
    const update = () => {
      const node = ref.current;
      if (node === null) return;
      const btn = document.querySelector<HTMLElement>('[aria-label="Start speed test"], [aria-label="Stop speed test"], [aria-label="Test again"]');
      if (btn === null) return;
      const r = btn.getBoundingClientRect();
      node.style.setProperty('--gx', `${((r.left + r.width / 2) / window.innerWidth) * 100}%`);
      node.style.setProperty('--gy', `${((r.top + r.height / 2) / window.innerHeight) * 100}%`);
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      style={{ '--k': running ? 1 : 0 } as React.CSSProperties}
      {...stylex.props(styles.glow)}
    />
  );
}

/** The static layout; every live value is a small client leaf reading the provider. */
export function Speedtest({ targets }: SpeedtestProps) {
  return (
    <ComposeContextProvider contexts={contexts}>
      <SpeedtestRoot>
        <Glow />
        <header {...stylex.props(styles.header)}>
          <Wordmark button={<StartButton targets={targets} />} />
          <p {...stylex.props(styles.hint)}>Speed, in the quiet.</p>
          <ScreenshotButton>Screenshot</ScreenshotButton>
        </header>

        <div {...stylex.props(styles.row)}>
          <div>
            <div {...stylex.props(styles.lab)}>Connections</div>
            <Connections />
          </div>
          <Stat label="Latency" stat="latency" />
          <Stat label="Jitter" stat="jitter" />
        </div>

        <section {...stylex.props(styles.res)}>
          <Direction label="Download" tone="download" targets={targets} />
          <Direction label="Upload" tone="upload" targets={targets} />
        </section>

        <div {...stylex.props(styles.sub)}>
          <Stat label="Download latency" stat="downloadLatency" size="sub" />
          <Stat label="Downloaded" stat="downloaded" size="sub" />
          <Stat label="Upload latency" stat="uploadLatency" size="sub" />
          <Stat label="Uploaded" stat="uploaded" size="sub" />
        </div>

        <dl {...stylex.props(styles.info)}>
          <Info label="IP address" field="ip" />
          <Info label="Location" field="location" />
          <Info label="Provider" field="isp" />
        </dl>

        <footer {...stylex.props(styles.footer)}>
          <span>
            &copy; 2026
            {' '}
            <a href="https://inshadow.uk" {...stylex.props(styles.footerLink)}>inshadow.uk</a>
          </span>
          <span>
            Based on
            {' '}
            <a href="https://speed.skk.moe" target="_blank" rel="noopener noreferrer" {...stylex.props(styles.footerLink)}>speed.skk.moe</a>
            {' '}
            by Sukka
          </span>
        </footer>
      </SpeedtestRoot>
    </ComposeContextProvider>
  );
}

interface DirectionProps {
  label: string,
  tone: 'download' | 'upload',
  targets: readonly Target[]
}

function Direction({ label, tone, targets }: DirectionProps) {
  // DirectionSection still gates the upload block when the region has no upload endpoint.
  return (
    <DirectionSection direction={tone} targets={targets}>
      <div {...stylex.props(styles.lab, tone === 'download' ? styles.downloadLab : styles.uploadLab)}>{label}</div>
      <SpeedReadout direction={tone} />
      <SpeedTrend direction={tone} />
    </DirectionSection>
  );
}

interface StatProps {
  label: string,
  stat: StatKey,
  size?: 'row' | 'sub'
}

function Stat({ label, stat, size }: StatProps) {
  return (
    <div>
      <dt {...stylex.props(styles.lab)}>{label}</dt>
      <StatValue stat={stat} size={size} />
    </div>
  );
}

function Info({ label, ...value }: { label: string } & React.ComponentProps<typeof GeoValue>) {
  return (
    <div>
      <dt {...stylex.props(styles.lab)}>{label}</dt>
      <GeoValue {...value} />
    </div>
  );
}
