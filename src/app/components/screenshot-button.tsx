'use client';

import * as stylex from '@stylexjs/stylex';
import { flushSync } from 'react-dom';
import { Button } from '@base-ui/react/button';
import { noop } from 'foxts/noop';
import { toast } from 'sonner';
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
  triggerHover: {
    borderBottomColor: colors.lit
  },
  icon: {
    width: 14,
    height: 14,
    stroke: 'currentColor',
    fill: 'none',
    strokeWidth: 1.4
  }
});

const RE_TIMESTAMP_SEPARATORS = /[:T]/g;
/** CSS px of page background kept around the captured block. */
const SCREENSHOT_MARGIN = 24;

/** Fallback when the clipboard refuses images: hand the file to the browser's download instead. */
function save(image: Promise<Blob>) {
  return image
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `speed.inshadow.uk-${new Date().toISOString().slice(0, 19).replaceAll(RE_TIMESTAMP_SEPARATORS, '-')}.png`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Screenshot saved');
    })
    .catch(() => toast.error('Screenshot failed'));
}

/** Copies a picture of the finished result with personal details masked. */
export function ScreenshotButton({ children }: React.PropsWithChildren) {
  const phase = usePhase();
  const capturing = useCapturing();
  const setCapturing = useSetCapturing();
  const redacted = useRedacted();
  const setRedacted = useSetRedacted();
  const root = useRoot();

  const screenshot = () => {
    const node = root;
    if (node === null) return;
    const wasRedacted = redacted;
    // The clone below has to see the masked details, and Safari only honours clipboard writes
    // issued inside the click itself, so the DOM is updated now rather than after a re-render.
    // eslint-disable-next-line @eslint-react/dom-no-flush-sync -- one flush per click, see above
    flushSync(() => {
      setRedacted(true);
      setCapturing(true);
    });
    // The renderer is only ever needed here, long after load, so it ships as its own chunk.
    const image = import(/* webpackPrefetch: true */ 'modern-screenshot').then(({ domToBlob }) => domToBlob(node, {
      scale: 2,
      width: node.offsetWidth + SCREENSHOT_MARGIN * 2,
      height: node.offsetHeight + SCREENSHOT_MARGIN * 2,
      style: { padding: `${SCREENSHOT_MARGIN}px` },
      backgroundColor: colors.surface,
      filter: (el) => !(el instanceof HTMLElement) || el.dataset.screenshot !== 'hide'
    }));
    image.catch(noop).finally(() => {
      setRedacted(wasRedacted);
      setCapturing(false);
    });
    const copy = typeof ClipboardItem === 'undefined'
      ? Promise.reject(new Error('Clipboard images are not supported'))
      // eslint-disable-next-line vibe-proof/react-prefer-foxact-use-clipboard -- foxact/use-clipboard copies text; this writes an image
      : navigator.clipboard.write([new ClipboardItem({ 'image/png': image })]);
    copy
      .then(() => toast.success('Screenshot copied to clipboard'))
      .catch(() => save(image));
  };

  return (
    <Button
      disabled={phase !== 'done' || capturing}
      onClick={screenshot}
      aria-label="Screenshot"
      title="Screenshot"
      data-screenshot="hide"
      {...stylex.props(styles.trigger)}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" {...stylex.props(styles.icon)}>
        <path d="M4 8h3l1.5-2h7L17 8h3v11H4z" />
        <circle cx="12" cy="13.5" r="3.2" />
      </svg>
      {children}
    </Button>
  );
}
