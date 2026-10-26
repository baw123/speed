import type { Metadata, Viewport } from 'next';
import type { WebApplication, WithContext } from 'schema-dts';
import { Cormorant } from 'next/font/google';
import * as stylex from '@stylexjs/stylex';
import { stylexPropsWithClassName } from 'stylex-webpack/utils';
import 'minireset.css';
import '@/styles/globals.css';
import 'stylex-webpack/stylex.css';
import { colors, fonts } from '../styles/tokens.stylex';
import { Toasts } from '@/components/toasts';

// The inshadow.uk homepage sets everything in Cormorant Light; the family (not just Garamond) keeps
// the letterforms and metrics identical to it.
const serif = Cormorant({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap'
});

const styles = stylex.create({
  html: {
    backgroundColor: colors.surface
  },
  body: {
    position: 'relative',
    minHeight: '100dvh',
    backgroundColor: colors.surface,
    color: colors.ink,
    fontFamily: fonts.sans,
    fontWeight: 300,
    fontKerning: 'normal'
  }
});

const SITE_NAME = 'Speedtest';
const APP_NAME = 'speed.inshadow.uk';
const DESCRIPTION = 'Measure your download and upload speed, latency and jitter.';

const jsonLd: WithContext<WebApplication> = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: APP_NAME,
  url: 'https://speed.inshadow.uk/',
  description: DESCRIPTION,
  image: '/icon-512.png',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  isAccessibleForFree: true,
  author: {
    '@type': 'Person',
    name: 'Sukka',
    url: 'https://skk.moe'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
};

export const metadata: Metadata = {
  metadataBase: new URL('https://speed.inshadow.uk'),
  title: SITE_NAME,
  description: DESCRIPTION,
  applicationName: APP_NAME,
  authors: [{ name: 'Sukka', url: 'https://skk.moe' }],
  creator: 'Sukka',
  icons: {
    shortcut: {
      type: 'image/ico',
      url: '/favicon.ico'
    },
    icon: [
      {
        type: 'image/ico',
        sizes: 'any',
        rel: 'icon',
        url: '/favicon.ico'
      },
      {
        type: 'image/svg+xml',
        rel: 'icon',
        url: '/favicon.svg'
      },
      {
        type: 'image/png',
        sizes: '512x512',
        rel: 'icon',
        url: '/icon-512.png'
      },
      {
        type: 'image/png',
        sizes: '192x192',
        rel: 'icon',
        url: '/icon-192.png'
      }
    ],
    apple: {
      type: 'image/png',
      sizes: '180x180',
      url: '/apple-touch-icon.png'
    }
  },
  formatDetection: {
    telephone: false
  },
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: 'default'
  },
  openGraph: {
    type: 'website',
    url: 'https://speed.inshadow.uk/',
    title: SITE_NAME,
    siteName: APP_NAME,
    description: DESCRIPTION,
    images: {
      url: '/link-preview-v2-1200x630.png',
      width: 1200,
      height: 630
    }
  },
  twitter: {
    card: 'summary',
    site: '@isukkaw',
    creator: '@isukkaw'
  },
  robots: {
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1
  },
  other: {
    'fediverse:creator': '@sukka@acg.mn'
  }
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" suppressHydrationWarning {...stylexPropsWithClassName(stylex.props(styles.html), serif.variable)}>
      <body suppressHydrationWarning {...stylex.props(styles.body)}>
        {children}
        <Toasts />
        <script
          type="application/ld+json"
          // eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- json ld
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
