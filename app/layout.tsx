import './globals.css';

import {
  Cormorant_Garamond,
  Noto_Sans_JP,
  Noto_Serif_JP,
} from 'next/font/google';

import HomeCloseButton from '../components/common/HomeCloseButton';

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
});

const notoSerifJP = Noto_Serif_JP({
  subsets: ['latin'],
  weight: ['500', '700', '900'],
  variable: '--font-noto-serif-jp',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

export const metadata = {
  title: 'Z4',
  description: '危険物乙4の今日やる10問がわかる',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} ${notoSerifJP.variable} ${cormorant.variable}`}
    >
      <body>
        <HomeCloseButton />
        {children}
      </body>
    </html>
  );
}