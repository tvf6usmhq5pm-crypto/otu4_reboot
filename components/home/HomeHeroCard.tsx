import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';

import { Z4Emblem } from '../brand/Z4Emblem';

type HomeHeroCardProps = {
  href: string;
  eyebrow?: string;
  title: string;
  goalText: string;
  emphasisText: string;
  description: string;
  subDescription?: string;
  ctaLabel: string;
  ribbonLabel?: ReactNode;
};

export function HomeHeroCard({
  href,
  eyebrow = '今日の最優先',
  title,
  goalText,
  emphasisText,
  description,
  subDescription,
  ctaLabel,
  ribbonLabel = '★',
}: HomeHeroCardProps) {
  return (
    <section style={heroCardStyle} aria-label="今日の最優先">
      <div style={ribbonStyle}>
        <span style={ribbonIconStyle}>{ribbonLabel}</span>
      </div>

      <div style={watermarkWrapStyle}>
        <Z4Emblem size={210} strength={0.92} />
      </div>

      <div style={heroContentStyle}>
        <p style={eyebrowStyle}>{eyebrow}</p>

        <h2 style={heroTitleStyle}>
          <span style={titleLineStyle}>{title}</span>
          <span style={goalLineStyle}>
            {goalText}
            <span style={emphasisStyle}>{emphasisText}</span>
          </span>
        </h2>

        <p style={descriptionStyle}>{description}</p>

        {subDescription && <p style={subDescriptionStyle}>{subDescription}</p>}

        <Link href={href} style={ctaStyle}>
          <span>{ctaLabel}</span>
          <span style={arrowStyle}>→</span>
        </Link>
      </div>
    </section>
  );
}

export default HomeHeroCard;

const heroCardStyle: CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
  minHeight: 286,
  borderRadius: 14,
  padding: '28px 34px 26px',
  background:
    'radial-gradient(circle at 78% 43%, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.46) 31%, rgba(255,252,248,0) 58%), #FFFCF8',
  border: '1px solid #E4DDD3',
  boxShadow:
    '0 1px 2px rgba(35, 28, 20, 0.04), 0 14px 34px rgba(35, 28, 20, 0.095)',
  color: '#0E1A2B',
};

const heroContentStyle: CSSProperties = {
  position: 'relative',
  zIndex: 2,
  maxWidth: 296,
};

const ribbonStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: 76,
  height: 76,
  background:
    'linear-gradient(135deg, #CFA04D 0%, #F1D38A 34%, #AF762B 100%)',
  clipPath: 'polygon(0 0, 100% 0, 0 100%)',
  boxShadow: '0 8px 16px rgba(130, 85, 26, 0.18)',
  zIndex: 3,
};

const ribbonIconStyle: CSSProperties = {
  position: 'absolute',
  top: 18,
  left: 18,
  color: '#FFFFFF',
  fontSize: 18,
  lineHeight: 1,
  textShadow: '0 1px 2px rgba(91, 54, 15, 0.28)',
};

const watermarkWrapStyle: CSSProperties = {
  position: 'absolute',
  right: -20,
  top: 28,
  width: 226,
  height: 230,
  pointerEvents: 'none',
  zIndex: 1,
};

const eyebrowStyle: CSSProperties = {
  margin: '0 0 14px 58px',
  color: '#A36E38',
  fontSize: 15,
  fontWeight: 700,
  letterSpacing: '0.12em',
  fontFamily:
    '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", Georgia, serif',
};

const heroTitleStyle: CSSProperties = {
  margin: 0,
  color: '#0E1A2B',
  fontFamily:
    '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", Georgia, serif',
};

const titleLineStyle: CSSProperties = {
  display: 'block',
  fontSize: 34,
  fontWeight: 700,
  letterSpacing: '0.04em',
  lineHeight: 1.25,
};

const goalLineStyle: CSSProperties = {
  display: 'block',
  marginTop: 6,
  fontSize: 42,
  fontWeight: 600,
  lineHeight: 1.12,
  letterSpacing: '0.02em',
  fontFamily: 'Cormorant Garamond, "Noto Serif JP", Georgia, serif',
};

const emphasisStyle: CSSProperties = {
  marginLeft: 7,
  color: '#B72A32',
  fontFamily:
    '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", Georgia, serif',
  fontSize: 31,
  fontWeight: 700,
  letterSpacing: '0.03em',
};

const descriptionStyle: CSSProperties = {
  margin: '18px 0 0',
  color: '#0E1A2B',
  fontSize: 22,
  fontWeight: 700,
  lineHeight: 1.45,
  letterSpacing: '0.05em',
  fontFamily:
    '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", Georgia, serif',
};

const subDescriptionStyle: CSSProperties = {
  margin: '6px 0 0',
  color: '#A36E38',
  fontSize: 14,
  fontWeight: 700,
  lineHeight: 1.5,
  letterSpacing: '0.08em',
  fontFamily:
    '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", Georgia, serif',
};

const ctaStyle: CSSProperties = {
  marginTop: 22,
  minHeight: 58,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 24,
  borderRadius: 8,
  border: '1px solid rgba(126, 14, 22, 0.22)',
  background: 'linear-gradient(180deg, #C92932 0%, #A71722 100%)',
  color: '#FFFFFF',
  textDecoration: 'none',
  fontSize: 21,
  fontWeight: 700,
  letterSpacing: '0.08em',
  boxShadow:
    '0 2px 0 rgba(255,255,255,0.16) inset, 0 10px 18px rgba(155, 22, 30, 0.24)',
  fontFamily:
    '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", Georgia, serif',
};

const arrowStyle: CSSProperties = {
  fontSize: 32,
  lineHeight: 1,
  transform: 'translateY(-1px)',
};