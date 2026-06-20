
import type { CSSProperties } from 'react';

const TEXT = {
  title: '\u68d2\u72b6\u653e\u5c04\u3068\u9727\u72b6\u653e\u5c04\u306e\u9055\u3044',
  lead: '\u5f37\u5316\u6db2\u306f\u300c\u68d2\u72b6\u300d\u304b\u300c\u9727\u72b6\u300d\u304b\u3067\u5224\u65ad\u3057\u307e\u3059\u3002',
  jet: '\u68d2\u72b6\u653e\u5c04',
  mist: '\u9727\u72b6\u653e\u5c04',
  ng: 'NG',
  ok: 'OK',
  jetCaption: '\u6cb9\u9762\u3092\u5f37\u304f\u53e9\u304d\u3001\u98db\u6563\u30fb\u62e1\u5927\u306e\u304a\u305d\u308c',
  mistCaption: '\u6cb9\u9762\u3092\u5f37\u304f\u53e9\u304d\u306b\u304f\u304f\u3001\u68d2\u72b6\u653e\u5c04\u3068\u306f\u533a\u5225',
  point: '\u898b\u308b\u3079\u304d\u70b9\u306f\u300c\u5f37\u5316\u6db2\u304b\u300d\u3067\u306f\u306a\u304f\u3001\u68d2\u72b6\u304b\u9727\u72b6\u304b\u3002',
} as const;

export function Type4FireSprayDiagram() {
  return (
    <section style={wrapStyle} aria-label={TEXT.title}>
      <div style={headerStyle}>
        <div>
          <div style={smallLabelStyle}>SVG</div>
          <div style={titleStyle}>{TEXT.title}</div>
        </div>
      </div>

      <p style={leadStyle}>{TEXT.lead}</p>

      <div style={gridStyle}>
        <SprayPanel
          title={TEXT.jet}
          verdict={TEXT.ng}
          tone="danger"
          mode="jet"
          caption={TEXT.jetCaption}
        />

        <SprayPanel
          title={TEXT.mist}
          verdict={TEXT.ok}
          tone="safe"
          mode="mist"
          caption={TEXT.mistCaption}
        />
      </div>

      <div style={pointStyle}>{TEXT.point}</div>
    </section>
  );
}

function SprayPanel({
  title,
  verdict,
  tone,
  mode,
  caption,
}: {
  title: string;
  verdict: string;
  tone: 'danger' | 'safe';
  mode: 'jet' | 'mist';
  caption: string;
}) {
  const danger = tone === 'danger';

  return (
    <div
      style={{
        ...panelStyle,
        borderColor: danger ? '#E8A39E' : '#BFD7C2',
        background: danger ? '#FFF5F3' : '#F5FFF7',
      }}
    >
      <div style={panelHeaderStyle}>
        <span style={panelTitleStyle}>{title}</span>
        <span
          style={{
            ...verdictStyle,
            color: danger ? '#B4232D' : '#2D765A',
            borderColor: danger ? '#E16D71' : '#7CB98A',
            background: danger ? '#FFF1F1' : '#F1FFF4',
          }}
        >
          {verdict}
        </span>
      </div>

      <svg viewBox="0 0 260 154" style={svgStyle} role="img" aria-label={title}>
        <OilPan />
        <Fire />
        {mode === 'jet' ? <JetSpray /> : <MistSpray />}
      </svg>

      <p style={captionStyle}>{caption}</p>
    </div>
  );
}

function OilPan() {
  return (
    <>
      <ellipse cx="132" cy="124" rx="82" ry="17" fill="#29251F" />
      <ellipse cx="132" cy="118" rx="75" ry="12" fill="#D18A21" />
      <path
        d="M62 119 C95 128 162 128 202 119"
        stroke="#F4BE58"
        strokeWidth="4"
        fill="none"
      />
    </>
  );
}

function Fire() {
  return (
    <>
      <path d="M126 113 C105 92 120 75 128 56 C134 78 158 83 146 113 Z" fill="#F97316" />
      <path d="M145 114 C129 95 146 85 151 67 C158 86 176 95 165 114 Z" fill="#DC2626" />
      <path d="M118 114 C107 101 114 91 119 81 C124 95 137 100 130 114 Z" fill="#FDBA3C" />
    </>
  );
}

function JetSpray() {
  return (
    <>
      <rect x="18" y="24" width="48" height="18" rx="4" fill="#4B5563" transform="rotate(20 42 33)" />
      <rect x="58" y="34" width="29" height="9" rx="4" fill="#9CA3AF" transform="rotate(20 72 39)" />

      <path d="M82 43 L128 116" stroke="#38BDF8" strokeWidth="16" strokeLinecap="round" opacity="0.9" />
      <path d="M94 45 L145 114" stroke="#BAE6FD" strokeWidth="5" strokeLinecap="round" />

      <circle cx="85" cy="101" r="5" fill="#0EA5E9" />
      <circle cx="100" cy="111" r="4" fill="#38BDF8" />
      <circle cx="165" cy="101" r="5" fill="#0EA5E9" />
      <circle cx="178" cy="116" r="4" fill="#38BDF8" />

      <circle cx="88" cy="128" r="6" fill="#5B3417" />
      <circle cx="178" cy="126" r="6" fill="#5B3417" />
      <circle cx="202" cy="115" r="4" fill="#5B3417" />
    </>
  );
}

function MistSpray() {
  const dots = Array.from({ length: 32 }).map((_, i) => {
    const x = 70 + (i % 8) * 18 + (i % 2) * 5;
    const y = 42 + Math.floor(i / 8) * 17 + (i % 3) * 2;
    const r = i % 4 === 0 ? 3 : 2;
    return <circle key={i} cx={x} cy={y} r={r} fill="#7DD3FC" opacity="0.85" />;
  });

  return (
    <>
      <rect x="20" y="25" width="48" height="18" rx="4" fill="#4B5563" transform="rotate(18 44 34)" />
      <rect x="59" y="34" width="29" height="9" rx="4" fill="#9CA3AF" transform="rotate(18 73 39)" />

      <path
        d="M80 45 C105 58 135 70 172 99"
        stroke="#BAE6FD"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
      {dots}
    </>
  );
}

const wrapStyle: CSSProperties = {
  margin: '12px 0 14px',
  border: '1px solid #E8DDCD',
  borderRadius: 16,
  background: '#FFFDF8',
  padding: 12,
  boxShadow: '0 4px 14px rgba(80, 52, 20, 0.05)',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
};

const smallLabelStyle: CSSProperties = {
  display: 'inline-flex',
  border: '1px solid #E6CDAA',
  borderRadius: 999,
  padding: '3px 8px',
  background: '#FFF8E8',
  color: '#9B650D',
  fontSize: 10,
  fontWeight: 900,
  lineHeight: 1,
};

const titleStyle: CSSProperties = {
  marginTop: 7,
  color: '#0E1A2B',
  fontSize: 14,
  lineHeight: 1.45,
  fontWeight: 900,
};

const leadStyle: CSSProperties = {
  margin: '8px 0 10px',
  color: '#5A5347',
  fontSize: 12,
  lineHeight: 1.65,
  fontWeight: 700,
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(132px, 1fr))',
  gap: 9,
};

const panelStyle: CSSProperties = {
  minWidth: 0,
  border: '1px solid #E8DDCD',
  borderRadius: 14,
  padding: 9,
};

const panelHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 6,
  marginBottom: 6,
};

const panelTitleStyle: CSSProperties = {
  color: '#0E1A2B',
  fontSize: 13,
  fontWeight: 900,
};

const verdictStyle: CSSProperties = {
  minWidth: 38,
  border: '1px solid',
  borderRadius: 999,
  padding: '3px 7px',
  textAlign: 'center',
  fontSize: 11,
  fontWeight: 900,
  lineHeight: 1.15,
};

const svgStyle: CSSProperties = {
  width: '100%',
  height: 132,
  display: 'block',
  borderRadius: 12,
  background: '#FFF9EE',
};

const captionStyle: CSSProperties = {
  margin: '7px 0 0',
  color: '#2B2F3A',
  fontSize: 11.5,
  lineHeight: 1.55,
  fontWeight: 800,
};

const pointStyle: CSSProperties = {
  marginTop: 10,
  border: '1px solid #E8D5B9',
  borderRadius: 12,
  background: '#FFF8E8',
  padding: '8px 10px',
  color: '#7A4D0B',
  fontSize: 11.5,
  fontWeight: 900,
  lineHeight: 1.55,
};
