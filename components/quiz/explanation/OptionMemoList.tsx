import type { CSSProperties } from 'react';
import type { ExplanationMeta } from '../../../data/explanation_meta_types';
import { InlineMarkdownText } from './MarkdownText';

type OptionMemoListProps = {
  optionMemos?: ExplanationMeta['optionMemos'];
  selectedIndex?: number;
  correctIndex?: number;
  title?: string;
};

type EntryKind = 'correctSelected' | 'correct' | 'selectedWrong' | 'neutral';

const OPTION_LABELS = ['1', '2', '3', '4', '5'] as const;

function getEntryKind(index: number, selectedIndex?: number, correctIndex?: number): EntryKind {
  const isSelected = selectedIndex === index;
  const isCorrect = correctIndex === index;

  if (isSelected && isCorrect) {
    return 'correctSelected';
  }

  if (isCorrect) {
    return 'correct';
  }

  if (isSelected) {
    return 'selectedWrong';
  }

  return 'neutral';
}

function getMarkerLabel(kind: EntryKind): string {
  if (kind === 'correctSelected') {
    return '正解・あなたの回答';
  }

  if (kind === 'correct') {
    return '正解';
  }

  if (kind === 'selectedWrong') {
    return 'あなたの回答';
  }

  return '';
}

function getRowStyle(kind: EntryKind): CSSProperties {
  if (kind === 'correct' || kind === 'correctSelected') {
    return {
      ...rowStyle,
      borderColor: '#CADBCE',
      borderLeftColor: '#4C7A5D',
      background: '#F2FAF5',
    };
  }

  if (kind === 'selectedWrong') {
    return {
      ...rowStyle,
      borderColor: '#E6CBCD',
      borderLeftColor: '#B01F2E',
      background: '#FFF4F3',
    };
  }

  return rowStyle;
}

function getChoicePillStyle(kind: EntryKind): CSSProperties {
  if (kind === 'correct' || kind === 'correctSelected') {
    return {
      ...choicePillStyle,
      borderColor: '#4C7A5D',
      background: '#4C7A5D',
      color: '#FFFFFF',
    };
  }

  if (kind === 'selectedWrong') {
    return {
      ...choicePillStyle,
      borderColor: '#B01F2E',
      background: '#B01F2E',
      color: '#FFFFFF',
    };
  }

  return choicePillStyle;
}

function getMarkerStyle(kind: EntryKind): CSSProperties {
  if (kind === 'correct' || kind === 'correctSelected') {
    return {
      ...markerStyle,
      borderColor: '#CADBCE',
      background: '#FFFFFF',
      color: '#315E3D',
    };
  }

  if (kind === 'selectedWrong') {
    return {
      ...markerStyle,
      borderColor: '#E6CBCD',
      background: '#FFFFFF',
      color: '#9C1825',
    };
  }

  return markerStyle;
}

export function OptionMemoList({
  optionMemos,
  selectedIndex,
  correctIndex,
  title = '選択肢ごとの解説',
}: OptionMemoListProps) {
  const entries = Object.entries(optionMemos ?? {})
    .map(([key, value]) => ({
      index: Number(key),
      text: typeof value === 'string' ? value : '',
    }))
    .filter((entry) => Number.isInteger(entry.index) && entry.index >= 0 && entry.index <= 4 && entry.text.trim().length > 0)
    .sort((a, b) => a.index - b.index);

  if (entries.length === 0) {
    return null;
  }

  return (
    <section aria-label={title} style={sectionStyle}>
      <div style={titleStyle}>{title}</div>

      <div style={listStyle}>
        {entries.map((entry) => {
          const label = OPTION_LABELS[entry.index as 0 | 1 | 2 | 3 | 4] ?? `${entry.index + 1}`;
          const kind = getEntryKind(entry.index, selectedIndex, correctIndex);
          const markerLabel = getMarkerLabel(kind);

          return (
            <div key={entry.index} style={getRowStyle(kind)}>
              <div style={labelRowStyle}>
                <div style={getChoicePillStyle(kind)}>{label}</div>
                {markerLabel ? <div style={getMarkerStyle(kind)}>{markerLabel}</div> : null}
              </div>

              <div style={textStyle}>
                <InlineMarkdownText text={entry.text} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const sectionStyle: CSSProperties = {
  marginTop: 12,
  padding: 10,
  borderRadius: 14,
  border: '1px solid #E8DDCD',
  background: '#FFFDF8',
};

const titleStyle: CSSProperties = {
  marginBottom: 7,
  color: '#1A2238',
  fontSize: 14,
  fontWeight: 900,
  lineHeight: 1.35,
};

const listStyle: CSSProperties = {
  display: 'grid',
  gap: 7,
};

const rowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: 6,
  alignItems: 'start',
  padding: '8px 9px',
  border: '1px solid #E8DDCD',
  borderLeft: '5px solid #D8C8B3',
  borderRadius: 12,
  background: '#FFFFFF',
};

const labelRowStyle: CSSProperties = {
  display: 'flex',
  gap: 6,
  alignItems: 'center',
  flexWrap: 'wrap',
};

const choicePillStyle: CSSProperties = {
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: 24,
  height: 24,
  minWidth: 24,
  padding: 0,
  borderRadius: 999,
  border: '1px solid #D8C8B3',
  background: '#FFF8EE',
  color: '#6D5540',
  fontSize: 12,
  fontWeight: 900,
  lineHeight: 1,
  whiteSpace: 'nowrap',
};

const markerStyle: CSSProperties = {
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: 22,
  padding: '3px 7px',
  borderRadius: 999,
  border: '1px solid #E8DDCD',
  background: '#FFFFFF',
  color: '#6D5540',
  fontSize: 11,
  fontWeight: 900,
  lineHeight: 1,
  whiteSpace: 'nowrap',
};

const textStyle: CSSProperties = {
  color: '#1A2238',
  fontSize: 13,
  lineHeight: 1.6,
};

export default OptionMemoList;
