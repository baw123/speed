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
  secondary: {
    marginLeft: 'clamp(12px, 2vw, 22px)',
    borderBottomStyle: 'dotted'
  },
  icon: {
    width: 14,
    height: 14,
    stroke: 'currentColor',
    fill: 'none',
    strokeWidth: 1.4
  },
  labelFlash: {
    color: colors.gold
  },
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
const downloadName = () =>
  `speed.inshadow.uk-${new Date().toISOString().slice(0, 19).replaceAll(RE_TIMESTAMP_SEPARATORS, '-')}.png`;

// ── Runtime capability probes ────────────────────────────────────────────────

/** True on touch-first devices where the user wants to save/share, not paste. */
function detectMobile() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(pointer: coarse)').matches;
}

function supportsImageClipboard() {
  if (typeof ClipboardItem === 'undefined') return false;
  if (!navigator.clipboard || typeof navigator.clipboard.write !== 'function') return false;
  return true;
}

function supportsWebShareFiles() {
  const n: unknown = navigator;
  const share = (n as { share?: unknown }).share;
  if (typeof share !== 'function') return false;
  const canShare = (n as { canShare?: (data: Record<string, unknown>) => boolean }).canShare;
  if (typeof canShare !== 'function') return false;
  try { return canShare({ files: [new File([], 'x.png', { type: 'image/png' })] }); } catch { return false; }
}

// ── Image pipeline ──────────────────────────────────────────────────────────

function render(node: HTMLElement) {
  return import(/* webpackPrefetch: true */ 'modern-screenshot').then(({ domToBlob }) => domToBlob(node, {
    scale: 2,
    width: node.offsetWidth + SCREENSHOT_MARGIN * 2,
    height: node.offsetHeight + SCREENSHOT_MARGIN * 2,
    style: { padding: `${SCREENSHOT_MARGIN}px` },
    backgroundColor: colors.surface,
    filter: (el) => !(el instanceof HTMLElement) || el.dataset.screenshot !== 'hide'
  }));
}

/** Always works. Hand the blob to the browser's download. */
function triggerDownload(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = downloadName();
  link.click();
  // A frame after the click the browser has consumed the URL.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Copy to clipboard. Must be called inside the click callback (Safari rule).
 *  Takes a Promise<Blob> — the browser can await it internally when ClipboardItem is built here. */
function writeClipboard(imagePromise: Promise<Blob>) {
  if (!supportsImageClipboard()) return Promise.reject(new Error('no clipboard'));
  // Safari accepts a Promise<Blob> directly as ClipboardItem data (16.4+).
  // eslint-disable-next-line vibe-proof/react-prefer-foxact-use-clipboard
  return navigator.clipboard.write([new ClipboardItem({ 'image/png': imagePromise as unknown as Blob })]);
}

/** Web Share API with the rendered PNG file. */
async function shareViaSystem(imagePromise: Promise<Blob>) {
  const blob = await imagePromise;
  const file = new File([blob], downloadName(), { type: 'image/png' });
  // navigator.share is a function; canShare was already positive.
  await (navigator as Navigator & { share: (data: ShareData) => Promise<void> }).share({
    files: [file],
    title: 'speed.inshadow.uk',
    text: 'My speed test result'
  });
}

// ── Button feedback state machine ──────────────────────────────────────────

type Feedback = null | 'Copied' | 'Saved' | 'Try again';
const FEEDBACK_MS = 2000;

interface CaptureResult {
  /** Label to flash on the button for 2s. */
  label: NonNullable<Feedback>;
  /** Optional toast — only when downgrading or fully failing. */
  toast?: string;
}

/** Shared capture + mask setup. Returns the blob Promise; caller picks the delivery path. */
function prepareCapture(
  node: HTMLElement | null,
  wasRedacted: boolean,
  setRedacted: (v: boolean) => void,
  setCapturing: (v: boolean) => void
) {
  if (node === null) return null;
  // eslint-disable-next-line @eslint-react/dom-no-flush-sync -- clipboard / web-share both need this in the click path
  flushSync(() => {
    setRedacted(true);
    setCapturing(true);
  });
  const image = render(node);
  image.catch(noop).finally(() => {
    setRedacted(wasRedacted);
    setCapturing(false);
  });
  return image;
}

/** Mobile path: Web Share API first, fall back to download. */
async function mobileAction(imagePromise: Promise<Blob>): Promise<CaptureResult> {
  if (supportsWebShareFiles()) {
    try {
      await shareViaSystem(imagePromise);
      return { label: 'Saved' };
    } catch (err) {
      // User cancelled the sheet — that's not a failure.
      if ((err as { name?: string })?.name === 'AbortError') return { label: 'Saved' };
      // Web share failed for another reason — fall through to download.
    }
  }
  try {
    triggerDownload(await imagePromise);
    return { label: 'Saved' };
  } catch {
    return { label: 'Try again', toast: 'Screenshot failed' };
  }
}

/** Desktop path: clipboard first, fall back to download. */
async function desktopCopyAction(imagePromise: Promise<Blob>): Promise<CaptureResult> {
  // Must be called inside the click callback — the ClipboardItem holds the Promise directly,
  // so Safari (and Chrome) accept it even though the blob isn't ready yet.
  try {
    await writeClipboard(imagePromise);
    return { label: 'Copied' };
  } catch {
    try {
      triggerDownload(await imagePromise);
      return { label: 'Saved', toast: 'Clipboard unavailable — saved to Downloads' };
    } catch {
      return { label: 'Try again', toast: 'Screenshot failed' };
    }
  }
}

/** Always-download variant for the small secondary Save button on desktop. */
async function desktopSaveAction(imagePromise: Promise<Blob>): Promise<CaptureResult> {
  try {
    triggerDownload(await imagePromise);
    return { label: 'Saved' };
  } catch {
    return { label: 'Try again', toast: 'Screenshot failed' };
  }
}

// ── Component ───────────────────────────────────────────────────────────────

interface ScreenshotButtonProps {
  /** Static label. */
  children: React.ReactNode;
  /** If true, this instance always does a download (the secondary Save button). */
  alwaysSave?: boolean;
  /** When the button sits inside a flex wrapper (instead of being top-right absolute on its own),
   *  reset its absolute positioning so the wrapper can lay it out. */
  relative?: boolean;
}

export function ScreenshotButton({ children, alwaysSave = false, relative = false }: ScreenshotButtonProps) {
  const phase = usePhase();
  const capturing = useCapturing();
  const setCapturing = useSetCapturing();
  const redacted = useRedacted();
  const setRedacted = useSetRedacted();
  const root = useRoot();

  const [feedback, setFeedback] = useState<Feedback>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(detectMobile());
    const mq = window.matchMedia('(pointer: coarse)');
    const onChange = () => setIsMobile(mq.matches);
    mq.addEventListener?.('change', onChange) ?? mq.addListener?.(onChange);
    return () => mq.removeEventListener?.('change', onChange) ?? mq.removeListener?.(onChange);
  }, []);

  const trigger = async () => {
    if (capturing) return;
    const node = root;
    const wasRedacted = redacted;
    const image = prepareCapture(node, wasRedacted, setRedacted, setCapturing);
    if (image === null) return;

    // Reset any previous flash.
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setFeedback(null);

    let result: CaptureResult;
    try {
      if (alwaysSave) {
        result = await desktopSaveAction(image);
      } else if (isMobile) {
        result = await mobileAction(image);
      } else {
        result = await desktopCopyAction(image);
      }
    } catch {
      result = { label: 'Try again', toast: 'Screenshot failed' };
    }

    if (result.toast) toast.success(result.toast);
    setFeedback(result.label);
    feedbackTimer.current = setTimeout(() => setFeedback(null), FEEDBACK_MS);
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
