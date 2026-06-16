import Link from 'next/link';
import type { CSSProperties } from 'react';

type IconType = 'target' | 'brain' | 'star' | 'shuffle';

type StudyMode = {
  key: string;
  label: string;
  description: string;
  href: string;
  icon: IconType;
};

const STUDY_MODES: StudyMode[] = [
  {
    key: 'auto',
    label: 'おまかせ',
    description: 'バランスよく出題',
    href: '/quiz?mode=daily-10',
    icon: 'target',
  },
  {
    key: 'smart',
    label: 'スマート',
    description: '弱点を分析して出題',
    href: '/quiz?mode=smart',
    icon: 'brain',
  },
  {
    key: 'frequent',
    label: '頻出',
    description: '★★★を優先して出題',
    href: '/quiz?mode=star3',
    icon: 'star',
  },
  {
    key: 'random',
    label: 'ランダム',
    description: '幅広くランダムに出題',
    href: '/quiz?mode=random',
    icon: 'shuffle',
  },
];

function StudyIcon({ type }: { type: IconType }) {
  if (type === 'target') {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" fill="none" stroke="#8F1B25" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4.2" fill="none" stroke="#8F1B25" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="1.4" fill="#8F1B25" />
        <path d="M16.5 7.5 20 4" fill="none" stroke="#B8944D" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'brain') {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M9.2 5.2c-2 0-3.4 1.4-3.4 3.2 0 .5.1.9.3 1.3-1 .6-1.6 1.7-1.6 2.9 0 1.9 1.5 3.4 3.4 3.4h1.3V5.2Z"
          fill="none"
          stroke="#0E1A2B"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M14.8 5.2c2 0 3.4 1.4 3.4 3.2 0 .5-.1.9-.3 1.3 1 .6 1.6 1.7 1.6 2.9 0 1.9-1.5 3.4-3.4 3.4h-1.3V5.2Z"
          fill="none"
          stroke="#0E1A2B"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M9.2 9.2H7.8M14.8 9.2h1.4M9.2 13H7.6M14.8 13h1.6" fill="none" stroke="#B8944D" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'star') {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="m12 4.3 2.1 4.3 4.7.7-3.4 3.3.8 4.7-4.2-2.2-4.2 2.2.8-4.7-3.4-3.3 4.7-.7L12 4.3Z"
          fill="none"
          stroke="#B8944D"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 7h3.2c2.8 0 3.8 10 6.6 10H19" fill="none" stroke="#4F765E" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16.4 14.4 19 17l-2.6 2.6" fill="none" stroke="#4F765E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 17h3.2c1.1 0 1.9-1.3 2.6-2.9" fill="none" stroke="#4F765E" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M13.3 9.8c.5-1.5 1-2.8 1.8-2.8H19" fill="none" stroke="#4F765E" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16.4 4.4 19 7l-2.6 2.6" fill="none" stroke="#4F765E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HomeStudyModeGrid() {
  return (
    <section style={sectionStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>学習モード</h2>
        <span style={subStyle}>目的に合わせて選ぶ</span>
      </div>

      <div style={gridStyle}>
        {STUDY_MODES.map((mode) => (
          <Link key={mode.key} href={mode.href} style={cardStyle}>
            <div style={iconWrapStyle}>
              <StudyIcon type={mode.icon} />
            </div>

            <strong style={labelStyle}>{mode.label}</strong>
            <span style={descriptionStyle}>{mode.description}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

const sectionStyle: CSSProperties = {
  margin: '0 18px 14px',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 10,
};

const titleStyle: CSSProperties = {
  margin: 0,
  color: '#101827',
  fontSize: 16,
  fontWeight: 700,
};

const subStyle: CSSProperties = {
  color: '#6E665B',
  fontSize: 11,
  fontWeight: 400,
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: 8,
};

const cardStyle: CSSProperties = {
  minHeight: 112,
  padding: '12px 8px 10px',
  borderRadius: 18,
  background: 'rgba(255, 253, 248, 0.92)',
  border: '1px solid rgba(21, 26, 36, 0.06)',
  boxShadow: '0 2px 8px rgba(14, 26, 43, 0.025)',
  display: 'grid',
  justifyItems: 'center',
  alignContent: 'start',
  gap: 6,
  color: '#151A24',
  textAlign: 'center',
  textDecoration: 'none',
};

const iconWrapStyle: CSSProperties = {
  width: 38,
  height: 38,
  display: 'grid',
  placeItems: 'center',
};

const labelStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  lineHeight: 1.25,
};

const descriptionStyle: CSSProperties = {
  color: '#6E665B',
  fontSize: 10,
  fontWeight: 400,
  lineHeight: 1.35,
};