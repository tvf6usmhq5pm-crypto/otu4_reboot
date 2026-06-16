import type { CSSProperties } from 'react';

type HomeHeaderProps = {
  examDays: number | null;
};

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3.2 18.4 5.6v5.7c0 4.1-2.6 7.7-6.4 9.1-3.8-1.4-6.4-5-6.4-9.1V5.6L12 3.2Z"
        fill="none"
        stroke="#B8944D"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M8.8 12.1 11 14.2l4.2-5"
        fill="none"
        stroke="#B8944D"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HomeHeader({ examDays }: HomeHeaderProps) {
  return (
    <header style={headerStyle}>
      <div style={brandRowStyle}>
        <span style={brandStyle}>
          <span>Z</span>
          <span style={brandFourStyle}>4</span>
        </span>

        <div>
          <p style={titleStyle}>危険物乙4</p>
          <p style={subTitleStyle}>合格への最短ルートを、あなたに。</p>
        </div>
      </div>

      <div style={rightGroupStyle}>
        <div style={shieldWrapStyle}>
          <ShieldIcon />
        </div>

        <div style={examCardStyle}>
          <span style={examLabelStyle}>試験まで</span>
          <strong style={examDaysStyle}>
            {examDays === null ? '—' : examDays}
            {examDays !== null && <span style={examDaysUnitStyle}>日</span>}
          </strong>
        </div>
      </div>
    </header>
  );
}

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: '18px 18px 10px',
};

const brandRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  minWidth: 0,
};

const brandStyle: CSSProperties = {
  fontFamily: 'var(--font-serif-en)',
  color: '#101827',
  fontSize: 46,
  fontWeight: 700,
  letterSpacing: -1.2,
  lineHeight: 1,
  fontFeatureSettings: '"lnum", "tnum"',
};

const brandFourStyle: CSSProperties = {
  color: '#B8944D',
  marginLeft: 1,
};

const titleStyle: CSSProperties = {
  margin: 0,
  color: '#101827',
  fontSize: 15,
  fontWeight: 600,
  lineHeight: 1.2,
};

const subTitleStyle: CSSProperties = {
  margin: '3px 0 0',
  color: '#6E665B',
  fontSize: 11,
  fontWeight: 400,
  lineHeight: 1.35,
};

const rightGroupStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

const shieldWrapStyle: CSSProperties = {
  width: 38,
  height: 38,
  border: '1px solid rgba(21, 26, 36, 0.08)',
  borderRadius: 999,
  background: 'rgba(255, 253, 248, 0.92)',
  display: 'grid',
  placeItems: 'center',
  boxShadow: 'var(--shadow-soft)',
};

const examCardStyle: CSSProperties = {
  minWidth: 72,
  padding: '9px 10px 8px',
  borderRadius: 16,
  background: 'rgba(255, 253, 248, 0.92)',
  border: '1px solid rgba(21, 26, 36, 0.08)',
  textAlign: 'center',
  boxShadow: 'var(--shadow-soft)',
};

const examLabelStyle: CSSProperties = {
  display: 'block',
  color: '#6E665B',
  fontSize: 11,
  fontWeight: 500,
  lineHeight: 1.2,
};

const examDaysStyle: CSSProperties = {
  fontFamily: 'var(--font-serif-en)',
  display: 'block',
  marginTop: 3,
  color: '#8F1B25',
  fontSize: 32,
  lineHeight: 1,
  fontWeight: 600,
  fontFeatureSettings: '"lnum", "tnum"',
};

const examDaysUnitStyle: CSSProperties = {
  marginLeft: 2,
  fontSize: 12,
  fontWeight: 500,
};