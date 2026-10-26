import * as stylex from '@stylexjs/stylex';
import { useId } from 'react';
import { colors } from '../../styles/tokens.stylex';

const WIDTH = 100;
const HEIGHT = 40;
// Leaves headroom so the plateau never touches the top edge.
const PEAK_HEIGHT = HEIGHT * 0.9;
/** Every Nth sample becomes a curve point; fewer points means fewer wiggles to trace. */
const POINT_STRIDE = 2;

interface Point {
  x: number,
  y: number
}

/** Catmull-Rom spline through the points as cubic Béziers, so the line bends instead of cornering. */
function curvePath(points: readonly Point[]) {
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 0, last = points.length - 1; i < last; i++) {
    const before = points[Math.max(0, i - 1)];
    const from = points[i];
    const to = points[i + 1];
    const after = points[Math.min(last, i + 2)];
    d += ` C${from.x + (to.x - before.x) / 6},${from.y + (to.y - before.y) / 6}`
      + ` ${to.x - (after.x - from.x) / 6},${to.y - (after.y - from.y) / 6}`
      + ` ${to.x},${to.y}`;
  }
  return d;
}

const FILL: Record<'download' | 'upload', string> = {
  download: '#8fa3bd',
  upload: '#c9b387'
};

const STROKE: Record<'download' | 'upload', string> = {
  download: colors.download,
  upload: colors.upload
};

const styles = stylex.create({
  frame: {
    position: 'relative',
    height: 'clamp(64px, 9vw, 96px)',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.line
  },
  svg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    overflow: 'visible'
  },
  edge: {
    fill: 'none',
    strokeWidth: 1.4,
    strokeLinejoin: 'round',
    vectorEffect: 'non-scaling-stroke'
  },
  marker: {
    stroke: '#8a929e',
    strokeWidth: 1,
    strokeDasharray: '3 3',
    vectorEffect: 'non-scaling-stroke'
  },
  markerLabel: {
    position: 'absolute',
    right: 0,
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.inkMuted,
    opacity: 0,
    transitionProperty: 'opacity',
    transitionDuration: '500ms',
    pointerEvents: 'none'
  },
  markerLabelAt: (top: number) => ({ top: `calc(${top}% - 18px)`, opacity: 1 })
});

interface TrendChartProps {
  samples: readonly number[],
  capacity: number,
  marker: number | null,
  markerLabel: string,
  tone: 'download' | 'upload'
}

/** Unit-less area chart of one phase's live readings, normalised to the running peak. */
export function TrendChart({ samples, capacity, marker, markerLabel, tone }: TrendChartProps) {
  const gradientId = useId();
  const peak = Math.max(1, marker ?? 0, ...samples);
  const pointAt = (i: number): Point => ({ x: (i / (capacity - 1)) * WIDTH, y: HEIGHT - (samples[i] / peak) * PEAK_HEIGHT });
  const points: Point[] = [];
  for (let i = 0, len = samples.length; i < len; i += POINT_STRIDE) points.push(pointAt(i));
  if (samples.length > 1 && (samples.length - 1) % POINT_STRIDE !== 0) points.push(pointAt(samples.length - 1));
  const line = points.length > 1 ? curvePath(points) : null;
  const markerY = marker === null || marker <= 0 ? null : HEIGHT - (marker / peak) * PEAK_HEIGHT;

  return (
    <div {...stylex.props(styles.frame)}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        aria-hidden
        {...stylex.props(styles.svg)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={FILL[tone]} stopOpacity={tone === 'download' ? 0.6 : 0.55} />
            <stop offset="1" stopColor={FILL[tone]} stopOpacity="0" />
          </linearGradient>
        </defs>
        {line != null && (
          <>
            <path d={`${line} L${points.at(-1)?.x ?? 0},${HEIGHT} L0,${HEIGHT} Z`} fill={`url(#${gradientId})`} />
            <path d={line} stroke={STROKE[tone]} {...stylex.props(styles.edge)} />
          </>
        )}
        {markerY !== null && <line x1="0" y1={markerY} x2={WIDTH} y2={markerY} {...stylex.props(styles.marker)} />}
      </svg>
      {markerY !== null && (
        <span aria-hidden {...stylex.props(styles.markerLabel, styles.markerLabelAt((markerY / HEIGHT) * 100))}>{markerLabel}</span>
      )}
    </div>
  );
}
