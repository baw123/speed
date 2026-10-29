'use client';

import * as stylex from '@stylexjs/stylex';
import { flushSync } from 'react-dom';
import { Button } from '@base-ui/react/button';
import { noop } from 'foxts/noop';
import { toast } from 'sonner';
import { useEffect, useRef, useState } from 'react';
import { useCapturing, usePhase, useRedacted, useRoot, useSetCapturing, useSetRedacted } from '@/context/speedtest';
import { colors } from '../../styles/tokens.stylex';

const styles = stylex.create({
  // A quiet uppercase label pinned to the header's top-right, underlined by a hairline.
  trigger: {
    position: 'absolute',
    right: 0,
    top: 'max(16px, 3vh)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 9,
    paddingTop: 10,
    paddingInline: 0,
    paddingBottom: 6,
    borderStyle: 'none',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.mid,
    backgroundColor: 'transparent',
    color: { default: colors.inkMuted, ':hover': colors.lit },
    fontFamily: 'inherit',
    fontSize: 11,
    fontWeight: 300,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    cursor: { default: 'pointer', ':disabled': 'default' },
    opacity: { default: 1, ':disabled': 0.4 },
    outlineStyle: { default: 'none', ':focus-visible': 'solid' },
    outlineWidth: 1,
    outlineColor: colors.gold,
    outlineOffset: 4,
    transitionProperty: 'color, border-color',
    transitionDuration: '300ms'
  },
  triggerHover: { borderBottomColor: colors.lit },
  // A subtle secondary action shown on desktop so the download path is always reachable.
  secondary: { borderBottomStyle: 'dotted' },
  icon: {
    width: 14,
    height: 14,
    stroke: 'currentColor',
    fill: 'none',
    strokeWidth: 1.4
  },
  // Gold flash for the 2-second feedback label.
  labelFlash: { color: colors.gold },
  // Reset trigger's absolute positioning when the button sits inside a flex wrapper.
  buttonRelative: {
    position: 'relative',
    top: 'auto',
    right: 'auto'
  }
});

const RE_TIMESTAMP_SEPARATORS = /[:T]/g;
/** CSS px of page background kept around the captured block. */
const SCREENSHOT_MARGIN = 24;
const SCALE = 2;
const downloadName = () =>
  `speed.inshadow.uk-${new Date().toISOString().slice(0, 19).replaceAll(RE_TIMESTAMP_SEPARATORS, '-')}.png`;

/** Yield a couple of frames so React has committed the capture state (masked values, tightened
 *  mobile header) and the browser has recomputed styles before the DOM is cloned. */
const nextFrame = () => new Promise<void>((resolve) => { requestAnimationFrame(() => { resolve(); }); });

function detectMobile() {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
}

function supportsImageClipboard() {
  return typeof ClipboardItem !== 'undefined'
    && typeof navigator.clipboard?.write === 'function';
}

function isShareable(file: File) {
  const n = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
  return typeof n.share === 'function' && typeof n.canShare === 'function' && n.canShare({ files: [file] });
}

async function render(node: HTMLElement) {
  // Let the capture state land in the DOM before it is cloned.
  await nextFrame();
  await nextFrame();
  const { domToBlob } = await import(/* webpackPrefetch: true */ 'modern-screenshot');
  return domToBlob(node, {
    scale: SCALE,
    width: node.offsetWidth + SCREENSHOT_MARGIN * 2,
    height: node.offsetHeight + SCREENSHOT_MARGIN * 2,
    style: { padding: `${SCREENSHOT_MARGIN}px` },
    backgroundColor: colors.surface,
    filter: (el) => !(el instanceof HTMLElement) || el.dataset.screenshot !== 'hide'
  });
}

function triggerDownload(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = downloadName();
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Safari rule: ClipboardItem must be constructed inside the click task; it may hold a
 *  Promise<Blob> so the async render still counts as user-triggered. */
function writeClipboard(image: Promise<Blob>) {
  if (!supportsImageClipboard()) return Promise.reject(new Error('no clipboard'));
  // eslint-disable-next-line vibe-proof/react-prefer-foxact-use-clipboard -- writes an image, not text
  return navigator.clipboard.write([new ClipboardItem({ 'image/png': image as unknown as Blob })]);
}

type Feedback = null | 'Copied' | 'Saved' | 'Try again';
const FEEDBACK_MS = 2000;

interface ScreenshotButtonProps {
  children: React.ReactNode;
  /** Desktop-only secondary entry that always downloads instead of copying. */
  alwaysSave?: boolean;
  /** The buttons sit in a flex wrapper; drop the standalone absolute positioning. */
  relative?: boolean;
}

/** One image, three exits: system share sheet on mobile, clipboard on desktop, download as the
 *  universal fallback. The PNG is pre-rendered the moment a run finishes, because iOS rejects
 *  navigator.share called after any await — the file must already exist inside the click. */
export function ScreenshotButton({ children, alwaysSave = false, relative = false }: ScreenshotButtonProps) {
  const phase = usePhase();
  const capturing = useCapturing();
  const setCapturing = useSetCapturing();
  const redacted = useRedacted();
  const setRedacted = useSetRedacted();
  const root = useRoot();

  const [feedback, setFeedback] = useState<Feedback>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileRef = useRef<File | null>(null);
  const busy = useRef(false);

  const flash = (label: NonNullable<Feedback>) => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setFeedback(label);
    feedbackTimer.current = setTimeout(() => setFeedback(null), FEEDBACK_MS);
  };

  // Pre-render the share image as soon as a run completes (and once the webfont is settled),
  // with personal details masked — the file handed to the share sheet must never carry the IP.
  useEffect(() => {
    if (phase !== 'done') {
      fileRef.current = null;
      return;
    }
    const node = root;
    if (node === null) return;
    let cancelled = false;
    setRedacted(true);
    setCapturing(true);
    const done = () => {
      if (cancelled) return;
      setRedacted(false);
      setCapturing(false);
    };
    (document.fonts?.ready ?? Promise.resolve())
      .then(() => render(node))
      .then((blob) => {
        if (!cancelled) fileRef.current = new File([blob], downloadName(), { type: 'image/png' });
      })
      .catch(noop)
      .finally(done);
    return () => {
      cancelled = true;
      setRedacted(false);
      setCapturing(false);
    };
  }, [phase, root, setCapturing, setRedacted]);

  const trigger = async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      const file = fileRef.current;
      const mobile = detectMobile();

      // The iOS share sheet needs the pre-rendered file inside this click.
      if (mobile && !alwaysSave && file !== null && isShareable(file)) {
        try {
          await navigator.share({ files: [file] });
          return; // Silent: the sheet itself is the feedback.
        } catch (err) {
          if ((err as { name?: string })?.name === 'AbortError') return;
          // Fall through to clipboard/download.
        }
      }

      // Copy from the pre-rendered file; re-render synchronously inside the click only if
      // the pre-render never finished (e.g. the user clicked before the background task ran).
      if (!alwaysSave) {
        try {
          const image = file !== null
            ? Promise.resolve(file as Blob)
            : (() => {
                if (root === null) throw new Error('no root');
                // eslint-disable-next-line @eslint-react/dom-no-flush-sync -- clipboard needs the masked DOM now
                flushSync(() => { setRedacted(true); setCapturing(true); });
                const p = render(root);
                p.catch(noop).finally(() => { setRedacted(false); setCapturing(false); });
                return p;
              })();
          await writeClipboard(image);
          flash('Copied');
          return;
        } catch { /* fall through to download */ }
      }

      try {
        const blob = file ?? await render(root!);
        triggerDownload(blob);
        flash('Saved');
      } catch {
        flash('Try again');
        toast.error('Screenshot failed');
      }
    } finally {
      busy.current = false;
    }
  };

  const label = feedback ?? children;
  const disabled = phase !== 'done' || capturing;

  return (
    <Button
      disabled={disabled}
      onClick={trigger}
      aria-label={typeof label === 'string' ? label : 'Screenshot'}
      title="Screenshot"
      data-screenshot="hide"
      {...stylex.props(
        styles.trigger,
        feedback && styles.labelFlash,
        alwaysSave && styles.secondary,
        relative && styles.buttonRelative
      )}
    >
      {!alwaysSave && (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...stylex.props(styles.icon)}>
          <path d="M4 8h3l1.5-2h7L17 8h3v11H4z" />
          <circle cx="12" cy="13.5" r="3.2" />
        </svg>
      )}
      {label}
    </Button>
  );
}
