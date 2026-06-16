import type { CSSProperties } from 'react';

export type SubjectStatus = {
  key: 'law' | 'phys' | 'prop';
  label: string;
  percent: number;
  state: 'reached' | 'need' | 'unknown';
  correct?: number;
  total?: number;
  gapTo60?: number;
};

type SubjectStatusCardProps = {
  statuses: SubjectStatus[];
};

function colorFor(state: SubjectStatus['state']): string {
  if (state === 'reached') {
    return '#4F765E';
  }

  if (state === 'need') {
    return '#8F1B25';
  }

  return '#A99F91';
}

function bgFor(state: SubjectStatus['state']): string {
  if (state === 'reached') {
    return '#EAF3ED';
  }

  if (state === 'need') {
    return '#FCEEF0';
  }

  return '#F3EFE8';
}

function statusText(status: SubjectStatus): string {
  if (status.state === 'unknown') {
    return '未測定';
  }

  if (status.state === 'need') {
    return status.gapTo60 && status.gapTo60 > 0
      ? `あと${status.gapTo60}問`
      : '要強化';
  }

  return '到達';
}

function scoreText(status: SubjectStatus): string {
  if (!status.total || status.total <= 0) {
    return 'まだ判定できません';
  }

  return `${status.total}問中${status.correct ?? 0}問正解`;
}

export default function SubjectStatusCard({ statuses }: SubjectStatusCardProps) {
  return (
    <section style={cardStyle}>
      <div style={headerStyle}>
        <div>
          <h2 style={titleStyle}>3科目の60%ライン</h2>
          <p style={subTitleStyle}>足りない科目から出題します</p>
        </div>

        <span style={detailStyle}>詳細</span>
      </div>

      <div style={listStyle}>
        {statuses.map((status) => {
          const color = colorFor(status.state);
          const width = Math.max(0, Math.min(100, status.percent));

          return (
            <div key={status.key} style={subjectRowStyle}>
              <div style={subjectMainStyle}>
                <div>
                  <strong style={subjectNameStyle}>{status.label}</strong>
                  <p style={scoreStyle}>{scoreText(status)}</p>
                </div>

                <div style={subjectValueStyle}>
                  <strong style={{ ...percentStyle, color }}>
                    {status.percent}%
                  </strong>

                  <span
                    style={{
                      ...badgeStyle,
                      color,
                      background: bgFor(status.state),
                    }}
                  >
                    {statusText(status)}
                  </span>
                </div>
              </div>

              <div style={trackStyle}>
                <div
                  style={{
                    ...fillStyle,
                    background: color,
                    width: `${width}%`,
                  }}
                />
                <div style={line60Style} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const cardStyle: CSSProperties = {
  margin: '0 18px 14px',
  padding: '16px 16px 14px',
  borderRadius: 22,
  background: 'rgba(255, 253, 248, 0.92)',
  border: '1px solid rgba(21, 26, 36, 0.08)',
  boxShadow: 'var(--shadow-soft)',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 10,
  marginBottom: 12,
};

const titleStyle: CSSProperties = {
  margin: 0,
  color: '#101827',
  fontSize: 16,
  fontWeight: 700,
};

const subTitleStyle: CSSProperties = {
  margin: '3px 0 0',
  color: '#6E665B',
  fontSize: 11,
  fontWeight: 400,
};

const detailStyle: CSSProperties = {
  color: '#6E665B',
  fontSize: 11,
  fontWeight: 500,
  whiteSpace: 'nowrap',
};

const listStyle: CSSProperties = {
  display: 'grid',
  gap: 14,
};

const subjectRowStyle: CSSProperties = {
  padding: '4px 0 0',
};

const subjectMainStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 12,
};

const subjectNameStyle: CSSProperties = {
  color: '#151A24',
  fontSize: 14,
  fontWeight: 600,
  lineHeight: 1.3,
};

const scoreStyle: CSSProperties = {
  margin: '4px 0 0',
  color: '#6E665B',
  fontSize: 11,
  fontWeight: 400,
};

const subjectValueStyle: CSSProperties = {
  display: 'grid',
  justifyItems: 'end',
  gap: 4,
  flexShrink: 0,
};

const percentStyle: CSSProperties = {
  fontFamily: 'var(--font-serif-en)',
  fontSize: 26,
  fontWeight: 600,
  lineHeight: 1,
  fontFeatureSettings: '"lnum", "tnum"',
};

const badgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '3px 8px',
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700,
};

const trackStyle: CSSProperties = {
  position: 'relative',
  height: 7,
  marginTop: 9,
  borderRadius: 999,
  background: '#E7E0D3',
  overflow: 'visible',
};

const fillStyle: CSSProperties = {
  height: '100%',
  borderRadius: 999,
};

const line60Style: CSSProperties = {
  position: 'absolute',
  left: '60%',
  top: -2,
  width: 2,
  height: 11,
  borderRadius: 999,
  background: '#B8944D',
};