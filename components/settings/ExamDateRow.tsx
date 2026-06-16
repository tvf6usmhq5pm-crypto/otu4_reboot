import type { CSSProperties } from 'react';

type ExamDateRowProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function ExamDateRow({ value, onChange }: ExamDateRowProps) {
  return (
    <div style={rowStyle}>
      <div>
        <strong style={labelStyle}>試験日</strong>
        <p style={helpStyle}>ホームの「試験まで」に反映されます</p>
      </div>

      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={inputStyle}
      />
    </div>
  );
}

const rowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 14,
  minHeight: 56,
};

const labelStyle: CSSProperties = {
  display: 'block',
  color: '#151A24',
  fontSize: 14,
  fontWeight: 600,
};

const helpStyle: CSSProperties = {
  margin: '4px 0 0',
  color: '#6E665B',
  fontSize: 11,
  fontWeight: 400,
  lineHeight: 1.4,
};

const inputStyle: CSSProperties = {
  minWidth: 145,
  padding: '9px 10px',
  borderRadius: 12,
  border: '1px solid rgba(21, 26, 36, 0.12)',
  background: '#FFFFFF',
  color: '#151A24',
  fontSize: 13,
  fontWeight: 500,
};