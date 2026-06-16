'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { CSSProperties } from 'react';

type TabType = 'home' | 'practice' | 'mock' | 'review' | 'settings';

const TABS: {
  href: string;
  label: string;
  type: TabType;
  match: (pathname: string) => boolean;
}[] = [
  {
    href: '/',
    label: 'ホーム',
    type: 'home',
    match: (pathname) => pathname === '/',
  },
  {
    href: '/quiz?mode=daily-10',
    label: '演習',
    type: 'practice',
    match: (pathname) => pathname === '/quiz',
  },
  {
    href: '/result',
    label: '成績',
    type: 'mock',
    match: (pathname) => pathname === '/result',
  },
  {
    href: '/quiz?mode=star3',
    label: '復習',
    type: 'review',
    match: () => false,
  },
  {
    href: '/settings',
    label: '設定',
    type: 'settings',
    match: (pathname) => pathname === '/settings',
  },
];

function TabIcon({
  active,
  type,
}: {
  active: boolean;
  type: TabType;
}) {
  const color = active ? '#8F1B25' : '#7E766A';

  if (type === 'home') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 11.2 12 5l7 6.2V19a1 1 0 0 1-1 1h-4v-5h-4v5H6a1 1 0 0 1-1-1v-7.8Z" fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === 'practice') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 18 17.5 6.5l2 2L8 20H6v-2Z" fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M14.8 9.2 16.8 11.2" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'mock') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 18V9M12 18V5M18 18v-7" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'review') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7.5 8.5A6 6 0 1 1 6.8 15" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M7.5 5v3.5H4" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 8h12M6 16h12" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="9" cy="8" r="2" fill="#F6F1E8" stroke={color} strokeWidth="1.8" />
      <circle cx="15" cy="16" r="2" fill="#F6F1E8" stroke={color} strokeWidth="1.8" />
    </svg>
  );
}

export default function BottomTabBar() {
  const pathname = usePathname() ?? '';

  return (
    <nav style={navStyle} aria-label="bottom navigation">
      <div style={innerStyle}>
        {TABS.map((tab) => {
          const active = tab.match(pathname);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              style={{
                ...tabStyle,
                color: active ? '#8F1B25' : '#6E665B',
                textDecoration: 'none',
              }}
            >
              <TabIcon active={active} type={tab.type} />
              <span style={labelStyle}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

const navStyle: CSSProperties = {
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 40,
  padding: '10px 14px 14px',
  background: 'rgba(246, 241, 232, 0.94)',
  borderTop: '1px solid rgba(21, 26, 36, 0.08)',
  backdropFilter: 'blur(12px)',
};

const innerStyle: CSSProperties = {
  maxWidth: 430,
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
  gap: 4,
};

const tabStyle: CSSProperties = {
  minHeight: 48,
  display: 'grid',
  placeItems: 'center',
  gap: 2,
  paddingTop: 2,
  textAlign: 'center',
};

const labelStyle: CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  lineHeight: 1.2,
};