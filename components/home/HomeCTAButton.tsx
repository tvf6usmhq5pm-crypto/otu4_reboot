import Link from 'next/link';
import type { CSSProperties } from 'react';

type HomeCTAButtonProps = {
  href: string;
  focusLabel: string;
  reason: string;
  questionCount: number;
  gapToGoal: number;
};

type HeroCopy = {
  eyebrow: string;
  titleTop: string;
  metric: string;
  titleTail: string;
  reason: string;
  buttonText: string;
  metricKind: 'number' | 'text';
};

function cleanFocusLabel(focusLabel: string): string {
  return focusLabel
    .replace('を中心に出題', '')
    .replace('を優先', '')
    .replace('を10問解く', '')
    .trim();
}

function buildHeroCopy({
  focusLabel,
  reason,
  questionCount,
  gapToGoal,
}: HomeCTAButtonProps): HeroCopy {
  if (focusLabel.includes('未復習')) {
    return {
      eyebrow: '今日の最優先',
      titleTop: '未復習ミスが',
      metric: `${questionCount}`,
      titleTail: '問あります',
      reason,
      buttonText: `${questionCount}問を復習する`,
      metricKind: 'number',
    };
  }

  if (focusLabel.includes('35問') || questionCount >= 35) {
    return {
      eyebrow: '本番形式で確認',
      titleTop: '35問実践で',
      metric: '60%',
      titleTail: 'ライン確認',
      reason,
      buttonText: '35問を解く',
      metricKind: 'number',
    };
  }

  if (focusLabel.includes('3科目')) {
    return {
      eyebrow: '今日の最優先',
      titleTop: '3科目を',
      metric: 'バランスよく',
      titleTail: '10問',
      reason,
      buttonText: `${questionCount}問を始める`,
      metricKind: 'text',
    };
  }

  const subject = cleanFocusLabel(focusLabel);
  const tail = gapToGoal > 0 ? `まであと${gapToGoal}問` : 'ライン到達';

  return {
    eyebrow: '今日の最優先',
    titleTop: `${subject}が`,
    metric: '60%',
    titleTail: tail,
    reason,
    buttonText: `${questionCount}問を始める`,
    metricKind: 'number',
  };
}

function Z4Watermark() {
  return (
    <div style={watermarkStyle} aria-hidden="true">
      <svg viewBox="0 0 180 210" width="180" height="210" style={watermarkSvgStyle}>
        <path
          d="M90 8 L158 34 V92 C158 142 130 181 90 199 C50 181 22 142 22 92 V34 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
        />
        <path
          d="M48 62 C62 42 118 42 132 62"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <text
          x="90"
          y="88"
          textAnchor="middle"
          fontSize="46"
          fontFamily="Cormorant Garamond, Georgia, Times New Roman, serif"
          fontWeight="600"
          fill="currentColor"
        >
          Z4
        </text>
        <path
          d="M73 104 H107"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M82 104 V138 C82 149 74 156 65 161 H115 C106 156 98 149 98 138 V104"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M90 130 C99 141 104 149 104 158 C104 167 98 173 90 173 C82 173 76 167 76 158 C76 149 81 141 90 130 Z"
          fill="currentColor"
        />
        <path
          d="M52 148 C40 134 36 116 39 98"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M128 148 C140 134 144 116 141 98"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export default function HomeCTAButton(props: HomeCTAButtonProps) {
  const { href, gapToGoal } = props;
  const copy = buildHeroCopy(props);

  return (
    <section style={cardStyle}>
      <Z4Watermark />

      <div style={ribbonStyle}>
        <span style={starStyle}>★</span>
      </div>

      <div style={textBlockStyle}>
        <p style={eyebrowStyle}>{copy.eyebrow}</p>

        <h1 style={titleStyle}>
          <span style={titleTopStyle}>{copy.titleTop}</span>
          <span style={titleSecondLineStyle}>
            <span
              style={
                copy.metricKind === 'number'
                  ? metricNumberStyle
                  : metricTextStyle
              }
            >
              {copy.metric}
            </span>
            <span style={titleTailStyle}>{copy.titleTail}</span>
          </span>
        </h1>

        <p style={reasonStyle}>{copy.reason}</p>
      </div>

      <Link href={href} style={buttonStyle}>
        <span>{copy.buttonText}</span>
        <span style={buttonArrowStyle}>→</span>
      </Link>

      <div style={subNoteStyle}>
        合格ラインまであと <strong style={subNoteNumberStyle}>{gapToGoal}</strong> 問
      </div>
    </section>
  );
}

const cardStyle: CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
  margin: '12px 18px 16px',
  minHeight: 292,
  padding: '26px 22px 20px',
  borderRadius: 18,
  background:
    'linear-gradient(135deg, rgba(255,255,255,0.985) 0%, rgba(253,249,240,0.985) 100%)',
  border: '1px solid rgba(221, 212, 196, 0.9)',
  boxShadow:
    '0 2px 6px rgba(14,26,43,0.035), 0 12px 28px rgba(14,26,43,0.055)',
  color: '#0E1A2B',
};

const textBlockStyle: CSSProperties = {
  position: 'relative',
  zIndex: 2,
  maxWidth: 215,
  minHeight: 176,
};

const watermarkStyle: CSSProperties = {
  position: 'absolute',
  right: -6,
  top: 28,
  width: 188,
  height: 220,
  color: '#D8D0C4',
  opacity: 0.36,
  pointerEvents: 'none',
  transform: 'rotate(-3deg)',
  filter: 'drop-shadow(0 1px 0 rgba(255,255,255,0.72))',
};

const watermarkSvgStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'block',
};

const ribbonStyle: CSSProperties = {
  position: 'absolute',
  left: 0,
  top: 0,
  width: 44,
  height: 44,
  background: 'linear-gradient(135deg, #B9974D 0%, #E4C979 100%)',
  clipPath: 'polygon(0 0, 100% 0, 0 100%)',
  zIndex: 4,
};

const starStyle: CSSProperties = {
  position: 'absolute',
  left: 9,
  top: 7,
  color: '#FFFFFF',
  fontSize: 13,
  fontWeight: 800,
};

const eyebrowStyle: CSSProperties = {
  margin: '0 0 14px 32px',
  color: '#9B7A3D',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.04em',
  fontFamily:
    '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", system-ui, sans-serif',
};

const titleStyle: CSSProperties = {
  margin: '0 0 12px',
  color: '#071426',
  fontFamily:
    '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", Georgia, serif',
  fontWeight: 700,
  lineHeight: 1.18,
  letterSpacing: '0.01em',
};

const titleTopStyle: CSSProperties = {
  display: 'block',
  fontSize: 28,
};

const titleSecondLineStyle: CSSProperties = {
  display: 'block',
  marginTop: 2,
  whiteSpace: 'nowrap',
};

const metricNumberStyle: CSSProperties = {
  color: '#B51F2A',
  fontSize: 34,
  fontWeight: 700,
  fontFamily: '"Cormorant Garamond", Georgia, "Times New Roman", serif',
  letterSpacing: '-0.02em',
};

const metricTextStyle: CSSProperties = {
  color: '#071426',
  fontSize: 27,
  fontWeight: 700,
};

const titleTailStyle: CSSProperties = {
  marginLeft: 2,
  color: '#071426',
  fontSize: 25,
  fontWeight: 700,
};

const reasonStyle: CSSProperties = {
  margin: '0',
  maxWidth: 205,
  color: '#534C42',
  fontSize: 13,
  fontWeight: 500,
  lineHeight: 1.65,
  fontFamily:
    '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", system-ui, sans-serif',
};

const buttonStyle: CSSProperties = {
  position: 'relative',
  zIndex: 3,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  minHeight: 50,
  marginTop: 18,
  padding: '0 20px',
  borderRadius: 8,
  background: 'linear-gradient(180deg, #C92932 0%, #A71722 100%)',
  color: '#FFFFFF',
  fontSize: 15,
  fontWeight: 700,
  textDecoration: 'none',
  boxShadow: '0 8px 16px rgba(172, 25, 34, 0.20)',
  fontFamily:
    '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", system-ui, sans-serif',
};

const buttonArrowStyle: CSSProperties = {
  fontSize: 20,
  lineHeight: 1,
};

const subNoteStyle: CSSProperties = {
  position: 'relative',
  zIndex: 3,
  marginTop: 10,
  color: '#8A8174',
  fontSize: 12,
  fontWeight: 600,
  lineHeight: 1,
  fontFamily:
    '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", system-ui, sans-serif',
};

const subNoteNumberStyle: CSSProperties = {
  color: '#B51F2A',
  fontSize: 14,
  fontWeight: 700,
  fontFamily: '"Cormorant Garamond", Georgia, "Times New Roman", serif',
};