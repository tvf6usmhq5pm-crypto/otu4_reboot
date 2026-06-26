import type { CSSProperties } from 'react';
import type { ExplanationVisualImage } from '../../../data/explanation_meta_types';

type ExplanationImageProps = {
  image: ExplanationVisualImage;
};

export function ExplanationImage({ image }: ExplanationImageProps) {
  const isTall = image.aspectRatio === '4:5';

  const figureStyle: CSSProperties = {
    ...baseFigureStyle,
    width: '100%',
    maxWidth: isTall ? 430 : 460,
  };

  const imageStyle: CSSProperties = {
    ...baseImageStyle,
    maxHeight: isTall ? 560 : 430,
  };

  return (
    <figure style={figureStyle}>
      {image.caption ? <figcaption style={captionStyle}>{image.caption}</figcaption> : null}

      <div style={frameStyle}>
        <img
          src={image.src}
          alt={image.alt}
          loading="lazy"
          decoding="async"
          style={imageStyle}
        />
      </div>
    </figure>
  );
}

const baseFigureStyle: CSSProperties = {
  margin: '14px auto 16px',
};

const frameStyle: CSSProperties = {
  border: '1px solid #E7DDCF',
  borderRadius: 16,
  background: '#FFFDF8',
  overflow: 'hidden',
  boxShadow: '0 4px 14px rgba(80, 52, 20, 0.06)',
};

const baseImageStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  height: 'auto',
  objectFit: 'contain',
};

const captionStyle: CSSProperties = {
  margin: '0 0 7px',
  color: '#4F463A',
  fontSize: 12,
  lineHeight: 1.55,
  fontWeight: 800,
  textAlign: 'center',
};
