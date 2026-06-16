import type { CSSProperties, ReactNode } from 'react';

export type Z4EmbossMode = 'emboss' | 'ink';

type EmbossGroupProps = {
  children: ReactNode;
  strength?: number;
  mode?: Z4EmbossMode;
  dy?: number;
};

export function EmbossGroup({
  children,
  strength = 1,
  mode = 'emboss',
  dy = 1.7,
}: EmbossGroupProps) {
  if (mode === 'ink') {
    return (
      <g style={{ color: `rgba(28, 44, 78, ${0.085 * strength})` }}>
        {children}
      </g>
    );
  }

  return (
    <g>
      <g
        transform={`translate(0 ${-dy})`}
        style={{ color: `rgba(118, 100, 70, ${0.3 * strength})` }}
      >
        {children}
      </g>

      <g
        transform={`translate(0 ${dy})`}
        style={{ color: `rgba(255, 255, 255, ${0.92 * Math.min(1, strength)})` }}
      >
        {children}
      </g>

      <g style={{ color: `rgba(228, 219, 198, ${Math.min(1, 0.95 * strength)})` }}>
        {children}
      </g>
    </g>
  );
}

function LaurelBranch() {
  const cx = 130;
  const cy = 128;
  const r = 118;
  const a0 = 80;
  const a1 = 22;
  const n = 7;
  const leaves: ReactNode[] = [];

  for (let i = 0; i < n; i += 1) {
    const t = i / (n - 1);
    const a = ((a0 + (a1 - a0) * t) * Math.PI) / 180;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    const rot = (Math.atan2(y - cy, x - cx) * 180) / Math.PI + 90;
    const scale = 0.85 + 0.35 * Math.sin(t * Math.PI);

    leaves.push(
      <g
        key={i}
        transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(
          1,
        )}) scale(${scale.toFixed(2)})`}
      >
        <path
          d="M0 2 C7 -3 9 -13 4 -22 C-4 -15 -6 -4 0 2 Z"
          fill="currentColor"
        />
        <path
          d="M2 4 C11 1 16 -6 16 -16 C7 -12 2 -5 2 4 Z"
          fill="currentColor"
          opacity="0.85"
        />
      </g>,
    );
  }

  const p0x = cx + r * Math.cos((a0 * Math.PI) / 180);
  const p0y = cy + r * Math.sin((a0 * Math.PI) / 180);
  const p1x = cx + r * Math.cos((a1 * Math.PI) / 180);
  const p1y = cy + r * Math.sin((a1 * Math.PI) / 180);

  return (
    <g>
      <path
        d={`M${p0x.toFixed(1)} ${p0y.toFixed(1)} A${r} ${r} 0 0 0 ${p1x.toFixed(
          1,
        )} ${p1y.toFixed(1)}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {leaves}
    </g>
  );
}

type Z4EmblemArtProps = {
  displayFont?: string;
};

function Z4EmblemArt({ displayFont }: Z4EmblemArtProps) {
  return (
    <g>
      <path
        d="M48 40 L212 40 L212 130 C212 196 130 242 130 242 C130 242 48 196 48 130 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinejoin="round"
      />

      <path
        d="M60 52 L200 52 L200 128 C200 184 130 226 130 226 C130 226 60 184 60 128 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      <text
        x="130"
        y="142"
        textAnchor="middle"
        fontFamily={displayFont ?? "'Playfair Display', 'Times New Roman', serif"}
        fontWeight="600"
        fontSize="84"
        letterSpacing="3"
        fill="currentColor"
      >
        Z4
      </text>

      <rect
        x="125.5"
        y="153.5"
        width="9"
        height="9"
        transform="rotate(45 130 158)"
        fill="currentColor"
      />

      <g transform="translate(100 196)">
        <path
          d="M-6 -26 L-6 -10 L-19 9 A5 5 0 0 0 -15 17 L15 17 A5 5 0 0 0 19 9 L6 -10 L6 -26"
          fill="none"
          stroke="currentColor"
          strokeWidth="4.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <line
          x1="-10"
          y1="-26"
          x2="10"
          y2="-26"
          stroke="currentColor"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <line
          x1="-11"
          y1="5"
          x2="11"
          y2="5"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>

      <g transform="translate(163 198)">
        <path
          d="M0 -26 C9 -14 16 -7 16 3 A16 16 0 1 1 -16 3 C-16 -8 -7 -13 0 -26 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        <path
          d="M0 -6 C4 -1 7 2 7 7 A7 7 0 1 1 -7 7 C-7 2 -4 -1 0 -6 Z"
          fill="currentColor"
        />
      </g>

      <LaurelBranch />
      <g transform="translate(260 0) scale(-1 1)">
        <LaurelBranch />
      </g>
    </g>
  );
}

type Z4EmblemProps = {
  size?: number;
  strength?: number;
  mode?: Z4EmbossMode;
  displayFont?: string;
  style?: CSSProperties;
};

export function Z4Emblem({
  size = 215,
  strength = 1,
  mode = 'emboss',
  displayFont,
  style,
}: Z4EmblemProps) {
  return (
    <svg
      width={size}
      height={size * (268 / 264)}
      viewBox="-2 14 264 268"
      style={style}
      aria-hidden="true"
    >
      <EmbossGroup strength={strength} mode={mode}>
        <Z4EmblemArt displayFont={displayFont} />
      </EmbossGroup>
    </svg>
  );
}

type SmallMarkProps = {
  size?: number;
  strength?: number;
  mode?: Z4EmbossMode;
  style?: CSSProperties;
};

export function ClipboardMark({
  size = 92,
  strength = 1,
  mode = 'emboss',
  style,
}: SmallMarkProps) {
  return (
    <svg
      width={size}
      height={size * 1.18}
      viewBox="0 0 100 118"
      style={style}
      aria-hidden="true"
    >
      <EmbossGroup strength={strength} mode={mode} dy={1.3}>
        <g transform="rotate(8 50 59)">
          <rect
            x="14"
            y="14"
            width="72"
            height="92"
            rx="8"
            fill="none"
            stroke="currentColor"
            strokeWidth="4.5"
          />
          <rect
            x="34"
            y="6"
            width="32"
            height="16"
            rx="5"
            fill="none"
            stroke="currentColor"
            strokeWidth="4.5"
          />
          <path
            d="M26 42 l5 5 9 -10"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="48"
            y1="42"
            x2="74"
            y2="42"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M26 62 l5 5 9 -10"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="48"
            y1="62"
            x2="74"
            y2="62"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <line
            x1="26"
            y1="84"
            x2="62"
            y2="84"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>
      </EmbossGroup>
    </svg>
  );
}

export function DocumentMark({
  size = 88,
  strength = 1,
  mode = 'emboss',
  style,
}: SmallMarkProps) {
  return (
    <svg
      width={size}
      height={size * 1.22}
      viewBox="0 0 100 122"
      style={style}
      aria-hidden="true"
    >
      <EmbossGroup strength={strength} mode={mode} dy={1.3}>
        <g transform="rotate(-7 50 61)">
          <path
            d="M22 10 L62 10 L82 30 L82 108 L22 108 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="4.5"
            strokeLinejoin="round"
          />
          <path
            d="M62 10 L62 30 L82 30"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <line
            x1="32"
            y1="46"
            x2="72"
            y2="46"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <line
            x1="32"
            y1="60"
            x2="72"
            y2="60"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <line
            x1="32"
            y1="74"
            x2="56"
            y2="74"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M64 78 l4.2 8.5 9.4 1.4 -6.8 6.6 1.6 9.3 -8.4 -4.4 -8.4 4.4 1.6 -9.3 -6.8 -6.6 9.4 -1.4 Z"
            fill="currentColor"
          />
        </g>
      </EmbossGroup>
    </svg>
  );
}