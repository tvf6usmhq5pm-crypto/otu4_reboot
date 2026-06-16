import type { CSSProperties } from 'react';

type ReasonItem = {
  icon: string;
  text: string;
};

type HomeReasonPanelProps = {
  items: ReasonItem[];
};

export default function HomeReasonPanel({ items }: HomeReasonPanelProps) {
  return (
    <section style={panelStyle}>
      <h2 style={titleStyle}>なぜこの10問？</h2>

      <div style={listStyle}>
        {items.map((item, index) => (
          <div key={`${index}-${item.text}`} style={rowStyle}>
            <span style={markerStyle} />
            <span style={textStyle}>{item.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

const panelStyle: CSSProperties = {
  margin: '0 18px 14px',
  padding: '16px 16px 10px',
  borderRadius: 22,
  background: 'rgba(255, 253, 248, 0.92)',
  border: '1px solid rgba(21, 26, 36, 0.08)',
  boxShadow: 'var(--shadow-soft)',
};

const titleStyle: CSSProperties = {
  margin: '0 0 8px',
  color: '#101827',
  fontSize: 17,
  fontWeight: 700,
};

const listStyle: CSSProperties = {
  display: 'grid',
};

const rowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '10px 1fr',
  alignItems: 'start',
  gap: 12,
  padding: '11px 0',
  borderTop: '1px solid rgba(21, 26, 36, 0.06)',
};

const markerStyle: CSSProperties = {
  width: 6,
  height: 6,
  marginTop: 7,
  borderRadius: 999,
  background: '#B8944D',
};

const textStyle: CSSProperties = {
  color: '#2F3441',
  fontSize: 14,
  fontWeight: 400,
  lineHeight: 1.48,
};