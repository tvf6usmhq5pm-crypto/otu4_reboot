'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import type { ExplanationVisualImage } from '../../../data/explanation_meta_types';

type ExplanationImageProps = {
  image: ExplanationVisualImage;
};

type ImageZoomDialogProps = {
  image: ExplanationVisualImage;
  onClose: () => void;
};

// 画面に全体が収まる幅。4:5 の画像でも高さがはみ出さない。
const FIT_WIDTH = 'min(100vw, 80dvh)';

function ImageZoomDialog({ image, onClose }: ImageZoomDialogProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const imageButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      onClose();
      return;
    }

    // 押せるものは2つだけなので、Tab はその間で行き来させる。
    if (event.key === 'Tab') {
      event.preventDefault();
      const next =
        document.activeElement === closeButtonRef.current
          ? imageButtonRef.current
          : closeButtonRef.current;
      next?.focus();
    }
  }

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="拡大画像"
      style={dialogStyle}
      onKeyDown={handleKeyDown}
    >
      <div style={dialogScrollStyle} onClick={handleBackdropClick}>
        <button
          ref={imageButtonRef}
          type="button"
          aria-label={isZoomed ? '画像を縮小する' : '画像をさらに拡大する'}
          onClick={() => setIsZoomed((current) => !current)}
          style={{
            ...dialogImageButtonStyle,
            width: isZoomed ? `calc(${FIT_WIDTH} * 2)` : FIT_WIDTH,
            cursor: isZoomed ? 'zoom-out' : 'zoom-in',
          }}
        >
          <img src={image.src} alt={image.alt} style={dialogImageStyle} />
        </button>
      </div>

      <button
        ref={closeButtonRef}
        type="button"
        aria-label="拡大画像を閉じる"
        onClick={onClose}
        style={dialogCloseButtonStyle}
      >
        {'×'}
      </button>
    </div>,
    document.body,
  );
}

export function ExplanationImage({ image }: ExplanationImageProps) {
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const closeZoom = useCallback(() => setIsZoomOpen(false), []);
  const isTall = image.aspectRatio === '4:5';

  const figureStyle: CSSProperties = {
    ...baseFigureStyle,
    width: '100%',
    maxWidth: isTall ? 430 : 460,
  };

  const imageStyle: CSSProperties = {
    ...baseImageStyle,
    // 読み込み前から高さを確保し、読み込み後に下の内容が動かないようにする。
    aspectRatio: image.aspectRatio === '1:1' ? '1 / 1' : '4 / 5',
    maxHeight: isTall ? 560 : 430,
  };

  return (
    <figure style={figureStyle}>
      <div style={frameStyle}>
        <button
          type="button"
          aria-label={`画像を拡大する: ${image.alt}`}
          onClick={() => setIsZoomOpen(true)}
          style={imageButtonStyle}
        >
          <img
            src={image.src}
            alt={image.alt}
            loading="lazy"
            decoding="async"
            style={imageStyle}
          />
          <span aria-hidden="true" style={zoomHintStyle}>
            押すと拡大
          </span>
        </button>
      </div>

      {isZoomOpen ? <ImageZoomDialog image={image} onClose={closeZoom} /> : null}
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

const imageButtonStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  padding: 0,
  border: 0,
  background: 'transparent',
  cursor: 'zoom-in',
};

// 画像の下端に結論の文字がある画像が多いので、画像には重ねない。
const zoomHintStyle: CSSProperties = {
  display: 'block',
  padding: '3px 10px 4px',
  color: '#6B5B43',
  fontSize: 12,
  fontWeight: 700,
  lineHeight: 1.3,
  textAlign: 'right',
};

const dialogStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 1100,
  background: 'rgba(14, 26, 43, 0.94)',
};

const dialogScrollStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  overflow: 'auto',
};

const dialogImageButtonStyle: CSSProperties = {
  flexShrink: 0,
  margin: 'auto',
  padding: 0,
  border: 0,
  background: 'transparent',
};

const dialogImageStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  height: 'auto',
};

const dialogCloseButtonStyle: CSSProperties = {
  position: 'absolute',
  top: 8,
  right: 8,
  width: 44,
  height: 44,
  borderRadius: '50%',
  border: '1px solid #D8D2C6',
  background: '#FFFFFF',
  color: '#1A2A4F',
  padding: 0,
  fontSize: 26,
  fontWeight: 900,
  lineHeight: 1,
  cursor: 'pointer',
};

const captionStyle: CSSProperties = {
  margin: '0 0 9px',
  padding: '8px 10px',
  borderLeft: '4px solid #C9A55A',
  borderRadius: 12,
  background: '#FFF7E6',
  color: '#0E1A2B',
  fontSize: 14,
  lineHeight: 1.45,
  fontWeight: 900,
  textAlign: 'left',
};
