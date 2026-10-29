'use client';

import * as stylex from '@stylexjs/stylex';
import { useEffect, useRef, useState } from 'react';
import { ComposeContextProvider } from 'foxact/compose-context-provider';
import { Connections } from './connections';
import { DirectionSection } from './direction-section';
import { GeoValue } from './geo-value';
import { ScreenshotButton } from './screenshot-button';
import { SpeedReadout, SpeedTrend } from './speed-readout';
import { CapturingProvider, ChoiceProvider, DownloadProvider, JitterProvider, LatencyProvider, ModeProvider, PhaseProvider, RedactedProvider, RootProvider, UploadProvider, useCapturing, usePhase } from '@/context/speedtest';
import { SpeedtestRoot } from './speedtest-root';
import { StartButton } from './start-button';
import { StatValue } from './stat-value';
import type { StatKey } from './stat-value';
import { Wordmark } from './wordmark';
import { colors } from '../../styles/tokens.stylex';
import type { Target } from '@/lib/targets';

// The halo opens outward from the dot of the "i" on load, as if the dot were the light source.
const bloom = stylex.keyframes({
  '0%': { opacity: 0, transform: 'scale(0.05)' },
  '100%': { opacity: 1, transform: 'scale(1)' }
});

const styles = stylex.create({
  glow: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 0,
    background: 'radial-gradient(ellipse 60% 55% at var(--gx, 14%) var(--gy, 22%), rgba(120,135,155,calc(0.16 + var(--k, 0) * 0.14)), transparent 70%)',
    transformOrigin: 'var(--gx, 14%) var(--gy, 22%)',
    animationName: {
      default: bloom,
      '@media (prefers-reduced-motion: reduce)': 'none'
    },
    animationDuration: '2.8s',
    animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    animationDelay: '0.15s',
    animationFillMode: 'backwards'
  },
  header: {
    position: 'relative',
    paddingTop: 'clamp(112px, 18vh, 176px)',
    paddingBottom: 'clamp(28px, 6vh, 64px)'
  },
  // A portrait share card reads better with a shorter top pad. Gated to narrow screens so
  // desktop captures keep the generous header.
  headerCapturingMobile: {
    '@media (max-width: 760px)': {
      paddingTop: 'clamp(40px, 7vh, 72px)',
      paddingBottom: 'clamp(20px, 4vh, 40px)'
    }
  },
  hint: {
    marginTop: 'clamp(8px, 1.6vw, 20px)',
    fontStyle: 'italic',
    fontWeight: 300,
    fontSize: 'clamp(15px, 1.5vw, 19px)',
    color: colors.inkMuted,
    minHeight: '1.4em'
  },
  // The finished stamp is upright, so the address and time stay legible at a quiet size.
  hintStamp: {
    fontStyle: 'normal'
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
    marginBottom: 8,
    whiteSpace: 'nowrap'
  },
  // Flex items must keep their natural width; an overfull row wraps to the next line
  // instead of squeezing a label or value onto two lines.
  item: { flexShrink: 0 },
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
    columnGap: { default: 64, '@media (max-width: 760px)': 24 },
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
  },
  // The footer is dropped while capturing, so the screenshot ends after the info row.
  footerHidden: { display: 'none' },
  // Two action buttons stacked in the top-right corner on desktop; only Screenshot on mobile,
  // where Screenshot triggers the system share sheet (or a plain download as fallback).
  screenshotGroup: {
    position: 'absolute',
    right: 0,
    top: 'max(16px, 3vh)',
    display: 'inline-flex',
    alignItems: 'flex-end',
    gap: 'clamp(12px, 2vw, 22px)'
  },
  saveHideMobile: { display: { default: 'inline-flex', '@media (max-width: 760px)': 'none' } },
  // Both buttons are absolute inside the group — reset so flex can lay them out.
  buttonRelative: { position: 'relative', top: 'auto', right: 'auto' }
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

/** The wordmark sits at the top of the captured block. During a capture the start button is
 *  filtered out of the image (leaving the "i" dot) and — on mobile — the top pad tightens. */
function Header({ targets }: SpeedtestProps) {
  const capturing = useCapturing();
  return (
    <header {...stylex.props(styles.header, capturing && styles.headerCapturingMobile)}>
      <Wordmark button={<StartButton targets={targets} />} />
      <Hint />
      <div data-screenshot="hide" {...stylex.props(styles.screenshotGroup)}>
        <ScreenshotButton relative>Screenshot</ScreenshotButton>
        <span {...stylex.props(styles.saveHideMobile)}>
          <ScreenshotButton relative alwaysSave>Save</ScreenshotButton>
        </span>
      </div>
    </header>
  );
}

/** The static layout; every live value is a small client leaf reading the provider. */
export function Speedtest({ targets }: SpeedtestProps) {
  return (
    <ComposeContextProvider contexts={contexts}>
      <SpeedtestRoot>
        <Glow />
        <Header targets={targets} />

        <div {...stylex.props(styles.row)}>
          <div {...stylex.props(styles.item)}>
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
          <Info label="IP address" field="ip" hiddenSlot="HIDDEN" />
          <Info label="Location" field="location" />
          <Info label="Provider" field="isp" hiddenSlot="HIDDEN" />
        </dl>

        <Footer />
      </SpeedtestRoot>
    </ComposeContextProvider>
  );
}

/** The finished stamp reads "speed.inshadow.uk · 27 Oct 2026, 14:32". */
const stampFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
});

/** Under the wordmark: the tagline at rest; the address and finish time once a run completes,
 *  so every capture carries the site's signature without a trip to the footer. */
function Hint() {
  const phase = usePhase();
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  useEffect(() => {
    if (phase === 'done') {
      setFinishedAt(Date.now());
      return;
    }
    if (phase === 'idle') setFinishedAt(null);
  }, [phase]);
  const done = phase === 'done' && finishedAt !== null;
  return (
    <p {...stylex.props(styles.hint, done && styles.hintStamp)}>
      {done ? `speed.inshadow.uk · ${stampFormat.format(finishedAt)}` : 'Speed, in the quiet.'}
    </p>
  );
}

/** Site credits; hidden during capture so the screenshot stops at the info row. */
function Footer() {
  const capturing = useCapturing();
  return (
    <footer data-screenshot="hide" {...stylex.props(styles.footer, capturing && styles.footerHidden)}>
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
    <div {...stylex.props(styles.item)}>
      <dt {...stylex.props(styles.lab)}>{label}</dt>
      <StatValue stat={stat} size={size} />
    </div>
  );
}

function Info({ label, ...value }: { label: string } & React.ComponentProps<typeof GeoValue>) {
  return (
    <div {...stylex.props(styles.item)}>
      <dt {...stylex.props(styles.lab)}>{label}</dt>
      <GeoValue {...value} />
    </div>
  );
}
