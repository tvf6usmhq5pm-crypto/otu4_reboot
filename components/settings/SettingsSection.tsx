import type { CSSProperties, ReactNode } from 'react';

type SettingsSectionProps = {
  title: string;
  children: ReactNode;
};

export default function SettingsSection({
  title,
  children,
}: SettingsSectionProps) {
  return (
    <section style={sectionStyle}>
      <h2 style={titleStyle}>{title}</h2>
      <div style={bodyStyle}>{children}</div>
    </section>
  );
}

const sectionStyle: CSSProperties = {
  margin: '0 18px 14px',
  padding: '15px 16px',
  borderRadius: 22,
  background: 'rgba(255, 253, 248, 0.92)',
  border: '1px solid rgba(21, 26, 36, 0.08)',
  boxShadow: 'var(--shadow-soft)',
};

const titleStyle: CSSProperties = {
  margin: '0 0 12px',
  color: '#101827',
  fontSize: 16,
  fontWeight: 700,
};

const bodyStyle: CSSProperties = {
  display: 'grid',
};