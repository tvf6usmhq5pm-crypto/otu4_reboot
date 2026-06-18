import { type CSSProperties } from 'react';

type QuestionKind = 'correct' | 'wrong' | 'answered' | 'untouched';

interface QuestionListModalProps {
  questionIds: string[];
  currentIndex: number;
  getKind: (questionId: string) => QuestionKind;
  isExamMode: boolean;
  onJump: (index: number) => void;
  onClose: () => void;
}

export function QuestionListModal({
  questionIds,
  currentIndex,
  getKind,
  isExamMode,
  onJump,
  onClose,
}: QuestionListModalProps) {
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={sheetStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerRowStyle}>
          <span style={titleStyle}>問題一覧</span>
          <button
            type="button"
            onClick={onClose}
            style={closeButtonStyle}
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        <p style={subTextStyle}>
          {isExamMode
            ? '未回答や見直したい問題へ移動できます'
            : '番号をタップすると移動します'}
        </p>

        <div style={gridStyle}>
          {questionIds.map((questionId, index) => {
            const kind = getKind(questionId);
            const isCurrent = index === currentIndex;
            return (
              <button
                key={questionId}
                type="button"
                onClick={() => onJump(index)}
                style={{
                  ...cellStyle,
                  ...kindStyleMap[kind],
                  ...(isCurrent ? currentCellStyle : null),
                }}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 50,
  background: 'rgba(14, 26, 43, 0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
};

const sheetStyle: CSSProperties = {
  width: '100%',
  maxWidth: 430,
  maxHeight: '80vh',
  overflowY: 'auto',
  background: '#FAF7F2',
  borderRadius: 16,
  padding: 18,
  boxShadow: '0 20px 50px rgba(14, 26, 43, 0.28)',
};

const headerRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const titleStyle: CSSProperties = {
  color: '#0E1A2B',
  fontSize: 17,
  fontWeight: 700,
  fontFamily:
    '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", Georgia, serif',
};

const closeButtonStyle: CSSProperties = {
  border: 'none',
  background: 'transparent',
  color: '#0E1A2B',
  fontSize: 24,
  lineHeight: 1,
  padding: 0,
  cursor: 'pointer',
};

const subTextStyle: CSSProperties = {
  margin: '6px 0 14px',
  color: '#6B5B43',
  fontSize: 12.5,
  fontFamily:
    '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", Georgia, serif',
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 8,
};

const cellStyle: CSSProperties = {
  aspectRatio: '1 / 1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 8,
  fontSize: 16,
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily:
    '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", Georgia, serif',
};

const kindStyleMap: Record<QuestionKind, CSSProperties> = {
  correct: {
    background: '#E7F0EA',
    color: '#3B6B4D',
    border: '1px solid #CADBCE',
  },
  wrong: {
    background: '#F7E7E8',
    color: '#A71722',
    border: '1px solid #E6CBCD',
  },
  answered: {
    background: '#F0EDE7',
    color: '#5A5347',
    border: '1px solid #D8D2C6',
  },
  untouched: {
    background: '#FBF9F5',
    color: '#9A9384',
    border: '1px solid #EAE4DA',
  },
};

// current は常に黒枠最優先（背景は正誤色を保ったまま枠だけ上書き）
const currentCellStyle: CSSProperties = {
  border: '2px solid #0E1A2B',
};
