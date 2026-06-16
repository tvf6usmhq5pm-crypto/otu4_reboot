import type { CSSProperties } from 'react';

export default function AboutSection() {
  return (
    <div style={wrapStyle}>
      <InfoRow label="問題データ" value="独自作問700問" />
      <InfoRow label="確認方針" value="全問手作業で確認" />
      <InfoRow label="バージョン" value="1.0.0" />

      <p style={noteStyle}>
        本アプリは特定の団体・出版社による監修、公認、認定を受けたものではありません。
        学習データはお使いの端末内に保存されます。
      </p>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div style={rowStyle}>
      <span style={labelStyle}>{label}</span>
      <strong style={valueStyle}>{value}</strong>
    </div>
  );
}

const wrapStyle: CSSProperties = {
  display: 'grid',
};

const rowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  minHeight: 42,
  borderTop: '1px solid rgba(21, 26, 36, 0.06)',
};

const labelStyle: CSSProperties = {
  color: '#6E665B',
  fontSize: 13,
  fontWeight: 400,
};

const valueStyle: CSSProperties = {
  color: '#151A24',
  fontSize: 13,
  fontWeight: 600,
  textAlign: 'right',
};

const noteStyle: CSSProperties = {
  margin: '12px 0 0',
  padding: 12,
  borderRadius: 14,
  background: '#F6F1E8',
  color: '#6E665B',
  fontSize: 11,
  fontWeight: 400,
  lineHeight: 1.7,
};