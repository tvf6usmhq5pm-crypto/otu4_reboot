import type { CSSProperties } from 'react';

type ResetDataButtonProps = {
  onClick: () => void;
};

export default function ResetDataButton({ onClick }: ResetDataButtonProps) {
  return (
    <button type="button" onClick={onClick} style={buttonStyle}>
      学習データをリセット
    </button>
  );
}

const buttonStyle: CSSProperties = {
  width: '100%',
  minHeight: 48,
  border: '1px solid rgba(143, 27, 37, 0.18)',
  borderRadius: 14,
  background: '#FCEEF0',
  color: '#8F1B25',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
};