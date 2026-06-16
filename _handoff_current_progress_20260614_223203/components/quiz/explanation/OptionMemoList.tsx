import type { ExplanationMeta } from '../../../data/explanation_meta_types';

type OptionMemoListProps = {
  optionMemos?: ExplanationMeta['optionMemos'];
};

const OPTION_LABELS = ['①', '②', '③', '④', '⑤'] as const;

export function OptionMemoList({ optionMemos }: OptionMemoListProps) {
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
    <section
      aria-label="間違いやすい選択肢メモ"
      style={{
        marginTop: 14,
        padding: 13,
        borderRadius: 16,
        border: '1px solid #E8DDCD',
        background: '#FFFDF8',
      }}
    >
      <div
        style={{
          marginBottom: 9,
          color: '#1A2238',
          fontSize: 14,
          fontWeight: 900,
          lineHeight: 1.4,
        }}
      >
        間違いやすい選択肢メモ
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        {entries.map((entry) => {
          const label = OPTION_LABELS[entry.index as 0 | 1 | 2 | 3 | 4] ?? `${entry.index + 1}`;

          return (
            <div
              key={entry.index}
              style={{
                display: 'grid',
                gridTemplateColumns: '78px 1fr',
                gap: 8,
                alignItems: 'start',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: 24,
                  padding: '4px 8px',
                  borderRadius: 999,
                  border: '1px solid #D8C8B3',
                  background: '#FFF8EE',
                  color: '#6D5540',
                  fontSize: 12,
                  fontWeight: 900,
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                }}
              >
                選択肢{label}
              </div>

              <div
                style={{
                  color: '#1A2238',
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                {entry.text}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default OptionMemoList;
