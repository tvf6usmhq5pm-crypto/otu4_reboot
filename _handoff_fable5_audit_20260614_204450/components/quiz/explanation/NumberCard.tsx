import type { CSSProperties } from 'react';
import type { NumberHighlight } from '../../../data/explanation_meta_types';

type NumberCardProps = {
  numberHighlight?: NumberHighlight;
};

export function NumberCard({ numberHighlight }: NumberCardProps) {
  if (!numberHighlight) {
    return null;
  }

  return (
    <div style={wrapStyle}>
      <div style={titleStyle}>覚える数字</div>

      <div style={numberBoxStyle}>
        <div style={numberLineStyle}>
          <span style={valueStyle}>{numberHighlight.value}</span>
          <span style={unitStyle}>{numberHighlight.unit}</span>
        </div>

        <div style={labelStyle}>{numberHighlight.label}</div>

        {numberHighlight.danger ? (
          <div style={dangerStyle}>{numberHighlight.danger}</div>
        ) : null}
      </div>
    </div>
  );
}

const wrapStyle: CSSProperties = {
  display: 'grid',
  gap: 7,
};

const titleStyle: CSSProperties = {
  color: '#31271f',
  fontSize: 13,
  fontWeight: 900,
  fontFamily: '"Hiragino Mincho ProN", "Yu Mincho", "YuMincho", serif',
};

const numberBoxStyle: CSSProperties = {
  border: '1px solid #c8a96f',
  borderRadius: 14,
  padding: '14px 12px',
  background: '#fff8e8',
  boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.6)',
};

const numberLineStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'center',
  gap: 5,
  marginBottom: 8,
};

const valueStyle: CSSProperties = {
  color: '#6f3f00',
  fontSize: 42,
  fontWeight: 900,
  lineHeight: 1,
  fontFamily: 'Georgia, "Times New Roman", serif',
};

const unitStyle: CSSProperties = {
  color: '#6f3f00',
  fontSize: 20,
  fontWeight: 900,
};

const labelStyle: CSSProperties = {
  color: '#31271f',
  fontSize: 13,
  fontWeight: 800,
  lineHeight: 1.6,
  textAlign: 'center',
};

const dangerStyle: CSSProperties = {
  marginTop: 8,
  padding: '7px 8px',
  borderRadius: 10,
  background: '#f7efe2',
  color: '#6d5540',
  fontSize: 11,
  fontWeight: 700,
  lineHeight: 1.5,
};
