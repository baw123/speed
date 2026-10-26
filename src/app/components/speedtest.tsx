import * as stylex from '@stylexjs/stylex';
import { ComposeContextProvider } from 'foxact/compose-context-provider';
import { PlayIcon, RotateCwIcon, SquareIcon } from 'lucide-react';
import { Connections } from './connections';
import { DirectionSection } from './direction-section';
import { GeoValue } from './geo-value';
import { PrivacyToggle } from './privacy-toggle';
import { ScreenshotButton } from './screenshot-button';
import { SpeedReadout, SpeedTrend } from './speed-readout';
import { CapturingProvider, ChoiceProvider, DownloadProvider, JitterProvider, LatencyProvider, ModeProvider, PhaseProvider, RedactedProvider, RootProvider, UploadProvider } from '@/context/speedtest';
import { SpeedtestRoot } from './speedtest-root';
import { StartButton } from './start-button';
import { StatValue } from './stat-value';
import type { StatKey } from './stat-value';
import { Wordmark } from './wordmark';
import { bp } from '../../styles/breakpoints.stylex';
import { colors } from '../../styles/tokens.stylex';
import type { Target } from '@/lib/targets';

const styles = stylex.create({
  // Frameless: nothing is boxed; rows are divided by space and a single hairline above the info.
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: { default: 40, [bp.mobile]: 32, [bp.large]: 64 }
  },
  // Start, the connection toggle and the two latency readings share one baseline.
  controls: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    columnGap: { default: 24, [bp.large]: 72 },
    rowGap: { default: 20, [bp.mobile]: 18 },
    marginBottom: { default: 40, [bp.mobile]: 32, [bp.large]: 72 }
  },
  capsLabel: {
    marginBottom: { default: 8, [bp.large]: 10 },
    fontSize: { default: 11, [bp.large]: 12 },
    fontWeight: 300,
    fontVariantCaps: 'all-small-caps',
    letterSpacing: '0.16em',
    lineHeight: 1.3,
    color: colors.inkMuted
  },
  // Latency and jitter stay together, so a narrow screen breaks before them, not between them.
  statPair: {
    display: 'flex',
    columnGap: { default: 24, [bp.large]: 64 }
  },
  directions: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(2, minmax(0, 1fr))',
      [bp.mobile]: 'minmax(0, 1fr)'
    },
    columnGap: { default: 48, [bp.large]: 96 },
    rowGap: { default: 40, [bp.mobile]: 32 },
    marginBottom: { default: 40, [bp.mobile]: 32, [bp.large]: 72 }
  },
  directionLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: { default: 12, [bp.large]: 14 },
    fontSize: { default: 12, [bp.large]: 13 },
    fontWeight: 300,
    fontVariantCaps: 'all-small-caps',
    letterSpacing: '0.16em',
    lineHeight: 1.25,
    color: colors.inkMuted
  },
  arrow: {
    width: 11,
    height: 11,
    flexShrink: 0
  },
  arrowDown: { color: colors.download },
  arrowUp: { color: colors.upload, transform: 'rotate(180deg)' },
  chart: {
    width: '100%',
    height: { default: 56, [bp.mobile]: 48 },
    marginTop: { default: 18, [bp.large]: 22 }
  },
  stats: {
    display: 'flex',
    flexWrap: 'wrap',
    columnGap: { default: 40, [bp.large]: 64 },
    rowGap: { default: 20, [bp.mobile]: 16 },
    marginBottom: { default: 40, [bp.mobile]: 32, [bp.large]: 72 }
  },
  info: {
    display: 'flex',
    flexWrap: 'wrap',
    columnGap: { default: 40, [bp.large]: 80 },
    rowGap: { default: 16, [bp.mobile]: 14 },
    paddingTop: { default: 20, [bp.large]: 28 },
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.line
  },
  infoLabel: {
    fontSize: { default: 11, [bp.large]: 12 },
    fontWeight: 300,
    fontVariantCaps: 'all-small-caps',
    letterSpacing: '0.16em',
    lineHeight: 1.3,
    color: colors.inkMuted
  },
  footnote: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: 8,
    marginTop: { default: 16, [bp.large]: 20 },
    fontSize: { default: 12, [bp.large]: 13 },
    fontWeight: 300,
    fontVariantCaps: 'all-small-caps',
    letterSpacing: '0.16em',
    lineHeight: 1.3,
    color: colors.inkMuted
  },
  footnoteLink: {
    color: colors.inkMuted,
    textDecorationLine: 'underline',
    textDecorationColor: { default: colors.line, ':hover': colors.ink },
    textUnderlineOffset: 3,
    transitionProperty: 'text-decoration-color',
    transitionDuration: '150ms'
  },
  hidden: {
    fontVariantCaps: 'all-small-caps',
    letterSpacing: '0.12em',
    color: colors.inkFaint
  }
});

/** Stands in for a masked value so a screenshot reads as deliberate redaction. */
const hiddenJsx = <span {...stylex.props(styles.hidden)}>Hidden</span>;

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
  /** Regions to test against, in menu order; parsed from the environment on the server. */
  targets: readonly Target[]
}

/** The static layout; every live value is a small client leaf reading the provider. */
export function Speedtest({ targets }: SpeedtestProps) {
  return (
    <ComposeContextProvider contexts={contexts}>
      <SpeedtestRoot>
        <header {...stylex.props(styles.header)}>
          <h1>
            <Wordmark />
          </h1>
          <ScreenshotButton>Screenshot</ScreenshotButton>
        </header>

        <div {...stylex.props(styles.controls)}>
          <StartButton
            targets={targets}
            idleSlot={<><PlayIcon size={11} strokeWidth={2} fill="currentColor" aria-hidden />Start test</>}
            runningSlot={<><SquareIcon size={10} strokeWidth={2} fill="currentColor" aria-hidden />Stop</>}
            doneSlot={<><RotateCwIcon size={12} strokeWidth={2} aria-hidden />Test again</>}
          />
          <div>
            <div {...stylex.props(styles.capsLabel)}>Connections</div>
            <Connections />
          </div>
          <div {...stylex.props(styles.statPair)}>
            <dl>
              <Stat label="Latency" stat="latency" />
            </dl>
            <dl>
              <Stat label="Jitter" stat="jitter" />
            </dl>
          </div>
        </div>

        <div {...stylex.props(styles.directions)}>
          <Direction direction="download" label="Download" targets={targets} />
          <Direction direction="upload" label="Upload" targets={targets} />
        </div>

        <dl {...stylex.props(styles.stats)}>
          <Stat label="Download latency" stat="downloadLatency" />
          <Stat label="Downloaded" stat="downloaded" />
          <Stat label="Upload latency" stat="uploadLatency" />
          <Stat label="Uploaded" stat="uploaded" />
        </dl>

        <dl {...stylex.props(styles.info)}>
          <Info label="IP address" field="ip" hiddenSlot={hiddenJsx} />
          <Info label="Location" field="location" />
          <Info label="Provider" field="isp" hiddenSlot={hiddenJsx} />
        </dl>
        <p data-screenshot="hide" {...stylex.props(styles.footnote)}>
          <span>
            Learn more about your IP at
            {' '}
            {/* eslint-disable-next-line @eslint-react/dom-no-unsafe-target-blank -- our own site; the referrer is wanted */}
            <a href="https://ip.skk.moe" target="_blank" {...stylex.props(styles.footnoteLink)}>ip.skk.moe</a>
          </span>
          <PrivacyToggle showSlot="Show details" hideSlot="Hide details" />
        </p>
      </SpeedtestRoot>
    </ComposeContextProvider>
  );
}

interface DirectionProps {
  direction: 'download' | 'upload',
  label: string,
  targets: readonly Target[]
}

function Direction({ direction, label, targets }: DirectionProps) {
  return (
    <DirectionSection direction={direction} targets={targets}>
      <h2 {...stylex.props(styles.directionLabel)}>
        <svg
          viewBox="0 0 12 12"
          aria-hidden
          {...stylex.props(styles.arrow, direction === 'download' ? styles.arrowDown : styles.arrowUp)}
        >
          <path d="M6 1.5v9M2.5 7l3.5 3.5L9.5 7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {label}
      </h2>
      <SpeedReadout direction={direction} />
      <div {...stylex.props(styles.chart)}>
        <SpeedTrend direction={direction} />
      </div>
    </DirectionSection>
  );
}

interface StatProps {
  label: string,
  stat: StatKey
}

function Stat({ label, stat }: StatProps) {
  return (
    <div>
      <dt {...stylex.props(styles.capsLabel)}>{label}</dt>
      <StatValue stat={stat} />
    </div>
  );
}

function Info({ label, ...value }: { label: string } & React.ComponentProps<typeof GeoValue>) {
  return (
    <div>
      <dt {...stylex.props(styles.infoLabel)}>{label}</dt>
      <GeoValue {...value} />
    </div>
  );
}
