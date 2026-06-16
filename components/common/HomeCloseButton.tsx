'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { CSSProperties } from 'react';

export default function HomeCloseButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (!pathname || pathname === '/') {
    return null;
  }

  function handleClick() {
    router.push('/');
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Home"
      title="Home"
      style={buttonStyle}
    >
      {'\u00d7'}
    </button>
  );
}

const buttonStyle: CSSProperties = {
  position: 'fixed',
  top: 12,
  right: 12,
  zIndex: 1000,
  width: 42,
  height: 42,
  borderRadius: '50%',
  border: '1px solid #e7e4de',
  background: '#ffffff',
  color: '#1a2a4f',
  boxShadow: '0 8px 24px rgba(26, 42, 79, 0.14)',
  cursor: 'pointer',
  fontSize: 28,
  fontWeight: 900,
  lineHeight: 1,
};