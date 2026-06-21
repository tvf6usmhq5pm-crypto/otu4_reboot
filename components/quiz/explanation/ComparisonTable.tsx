import type { ExplanationRow } from '../../../data/explanation_meta_types';

type ComparisonTableProps = {
  ariaLabel?: string;
  tableHeader?: string[];
  rows?: ExplanationRow[];
};

type BadgeKind = 'ok' | 'danger' | 'warning';

function getBadgeKind(value: string): BadgeKind | null {
  const normalized = value.trim();

  if (['◎', '○', 'OK', 'ok', '適切', '有効', '正しい', '対象'].includes(normalized)) {
    return 'ok';
  }

  if (['NG', 'ng', '×', '✕', '不適切', '誤り', '危険', '対象外'].includes(normalized)) {
    return 'danger';
  }

  if (['△', '注意', '要注意', '条件付き'].includes(normalized)) {
    return 'warning';
  }

  return null;
}

function getBadgeStyle(kind: BadgeKind) {
  if (kind === 'ok') {
    return {
      borderColor: '#8DB69B',
      backgroundColor: '#EEF7F1',
      color: '#2F7D57',
    };
  }

  if (kind === 'danger') {
    return {
      borderColor: '#D9A19A',
      backgroundColor: '#FFF1EE',
      color: '#A9473C',
    };
  }

  return {
    borderColor: '#D8BD7C',
    backgroundColor: '#FFF8E6',
    color: '#8A6415',
  };
}

function getRowStyle(row: ExplanationRow) {
  if (row.isKey) {
    return {
      backgroundColor: row.variant === 'danger' ? '#FFF3EF' : '#FFF8E8',
      borderColor: row.variant === 'danger' ? '#C75C4D' : '#C9A55A',
      shadow: '0 8px 18px rgba(74, 55, 28, 0.08)',
    };
  }

  if (row.variant === 'correct') {
    return {
      backgroundColor: '#F7FBF8',
      borderColor: '#BBD4C3',
      shadow: 'none',
    };
  }

  if (row.variant === 'danger') {
    return {
      backgroundColor: '#FFF7F4',
      borderColor: '#E5B7AE',
      shadow: 'none',
    };
  }

  return {
    backgroundColor: '#FFFDF8',
    borderColor: '#EFE4D6',
    shadow: 'none',
  };
}

function renderBadge(value: string) {
  const badgeKind = getBadgeKind(value);

  if (!badgeKind) {
    return null;
  }

  const badgeStyle = getBadgeStyle(badgeKind);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 48,
        padding: '5px 10px',
        borderRadius: 999,
        border: `1px solid ${badgeStyle.borderColor}`,
        background: badgeStyle.backgroundColor,
        color: badgeStyle.color,
        fontSize: 12,
        fontWeight: 900,
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      {value}
    </span>
  );
}

function getCardParts(row: ExplanationRow) {
  const cells = row.cells.filter((cell) => cell.trim().length > 0);
  const title = cells[0] ?? '';
  const lastCell = cells[cells.length - 1] ?? '';
  const lastCellIsBadge = cells.length >= 3 && getBadgeKind(lastCell) !== null;
  const badge = lastCellIsBadge ? lastCell : '';
  const detailCells = lastCellIsBadge ? cells.slice(1, -1) : cells.slice(1);

  return {
    title,
    badge,
    detailCells,
  };
}

export function ComparisonTable({
  ariaLabel = '比較表',
  tableHeader = [],
  rows = [],
}: ComparisonTableProps) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <section
      aria-label={ariaLabel}
      style={{
        marginTop: 16,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: 'grid',
          gap: 10,
        }}
      >
        {rows.map((row, rowIndex) => {
          const rowStyle = getRowStyle(row);
          const { title, badge, detailCells } = getCardParts(row);
          const badgeNode = badge ? renderBadge(badge) : null;

          return (
            <article
              key={`${row.cells.join('-')}-${rowIndex}`}
              style={{
                border: `1px solid ${rowStyle.borderColor}`,
                borderLeft: `5px solid ${rowStyle.borderColor}`,
                borderRadius: 15,
                background: rowStyle.backgroundColor,
                boxShadow: rowStyle.shadow,
                padding: '11px 12px',
                color: '#1A2238',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    minWidth: 0,
                    display: 'grid',
                    gap: 5,
                  }}
                >

                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 900,
                      lineHeight: 1.45,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {title}
                  </div>
                </div>

                {badgeNode}
              </div>

              {detailCells.length > 0 ? (
                <div
                  style={{
                    display: 'grid',
                    gap: 6,
                    marginTop: 9,
                  }}
                >
                  {detailCells.map((cell, detailIndex) => {
                    const header = tableHeader[detailIndex + 1];

                    return (
                      <div
                        key={`${rowIndex}-detail-${detailIndex}`}
                        style={{
                          display: 'grid',
                          gap: 2,
                        }}
                      >
                        {header ? (
                          <div
                            style={{
                              color: '#7C6B5A',
                              fontSize: 11,
                              fontWeight: 900,
                              lineHeight: 1.35,
                            }}
                          >
                            {header}
                          </div>
                        ) : null}

                        <div
                          style={{
                            color: '#2E2A24',
                            fontSize: 13,
                            fontWeight: 600,
                            lineHeight: 1.6,
                            overflowWrap: 'anywhere',
                          }}
                        >
                          {cell}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {row.note ? (
                <div
                  style={{
                    marginTop: 9,
                    borderTop: '1px dashed rgba(124, 107, 90, 0.25)',
                    paddingTop: 8,
                    color: '#5E5144',
                    fontSize: 12,
                    fontWeight: 600,
                    lineHeight: 1.55,
                  }}
                >
                  {row.note}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default ComparisonTable;
