import type { ExplanationRow } from '../../../data/explanation_meta_types';

type ComparisonTableProps = {
  tableHeader?: string[];
  rows?: ExplanationRow[];
};

type BadgeKind = 'ok' | 'danger' | 'warning';

function getBadgeKind(value: string): BadgeKind | null {
  const normalized = value.trim();

  if (['◎', '○', 'OK', 'ok', '適切', '有効', '正しい'].includes(normalized)) {
    return 'ok';
  }

  if (['NG', 'ng', '×', '✕', '不適切', '誤り', '危険'].includes(normalized)) {
    return 'danger';
  }

  if (['△', '注意', '要注意'].includes(normalized)) {
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

function getRowStyle(variant?: ExplanationRow['variant']) {
  if (variant === 'correct') {
    return {
      backgroundColor: '#F4F8F5',
      borderColor: '#91B79F',
    };
  }

  if (variant === 'danger') {
    return {
      backgroundColor: '#FFF6F3',
      borderColor: '#D9A19A',
    };
  }

  return {
    backgroundColor: '#FFFDF8',
    borderColor: '#EFE4D6',
  };
}

function renderCell(cell: string) {
  const badgeKind = getBadgeKind(cell);

  if (!badgeKind) {
    return cell;
  }

  const badgeStyle = getBadgeStyle(badgeKind);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 42,
        padding: '4px 9px',
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
      {cell}
    </span>
  );
}

export function ComparisonTable({ tableHeader = [], rows = [] }: ComparisonTableProps) {
  if (rows.length === 0) {
    return null;
  }

  const columnCount = Math.max(
    tableHeader.length,
    ...rows.map((row) => row.cells.length),
  );

  return (
    <section
      aria-label="比較一覧"
      style={{
        marginTop: 16,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          marginBottom: 8,
          color: '#1A2238',
          fontSize: 13,
          fontWeight: 900,
          lineHeight: 1.4,
        }}
      >
        比較一覧
      </div>

      <div
        style={{
          overflowX: 'auto',
          border: '1px solid #E8DDCD',
          borderRadius: 16,
          background: '#FFFDF8',
        }}
      >
        <table
          style={{
            width: '100%',
            minWidth: 520,
            borderCollapse: 'separate',
            borderSpacing: 0,
          }}
        >
          {tableHeader.length > 0 ? (
            <thead>
              <tr>
                {tableHeader.map((header) => (
                  <th
                    key={header}
                    style={{
                      padding: '10px 11px',
                      borderBottom: '1px solid #E8DDCD',
                      background: '#F6EDDF',
                      color: '#4B3828',
                      fontSize: 12,
                      fontWeight: 900,
                      lineHeight: 1.45,
                      textAlign: 'left',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
          ) : null}

          <tbody>
            {rows.map((row, rowIndex) => {
              const rowStyle = getRowStyle(row.variant);

              return (
                <tr key={`${row.cells.join('-')}-${rowIndex}`}>
                  {Array.from({ length: columnCount }).map((_, cellIndex) => {
                    const cell = row.cells[cellIndex] ?? '';

                    return (
                      <td
                        key={`${rowIndex}-${cellIndex}`}
                        style={{
                          padding: '10px 11px',
                          borderBottom: rowIndex === rows.length - 1 ? 'none' : '1px solid #EFE4D6',
                          borderLeft: cellIndex === 0 ? `4px solid ${rowStyle.borderColor}` : 'none',
                          background: rowStyle.backgroundColor,
                          color: '#1A2238',
                          fontSize: 13,
                          fontWeight: row.variant === 'correct' && cellIndex === 0 ? 900 : 600,
                          lineHeight: 1.55,
                          verticalAlign: 'top',
                        }}
                      >
                        {renderCell(cell)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ComparisonTable;
