import type { CSSProperties } from 'react';
import type { ExplanationRow } from '../../../data/explanation_meta_types';

type ProcedureTableProps = {
  ariaLabel?: string;
  tableHeader?: string[];
  rows?: ExplanationRow[];
};

export function ProcedureTable({
  ariaLabel = '手順表',
  tableHeader, rows
}: ProcedureTableProps) {
  const headers = tableHeader && tableHeader.length > 0 ? tableHeader : ['区分', '相手', '手続き'];

  if (!rows || rows.length === 0) {
    return null;
  }

  return (
    <div style={wrapStyle}
      role="group"
      aria-label={ariaLabel}
    >
      

      <table style={tableStyle}>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} style={thStyle}>
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${row.cells.join('-')}-${rowIndex}`}>
              {headers.map((_, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`} style={tdStyle}>
                  {row.cells[cellIndex] ?? '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const wrapStyle: CSSProperties = {
  display: 'grid',
  gap: 7,
};

const titleStyle: CSSProperties = {
  color: '#31271f',
  fontSize: 13,
  fontWeight: 800,
  fontFamily: '"Hiragino Mincho ProN", "Yu Mincho", "YuMincho", serif',
};

const tableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  tableLayout: 'fixed',
  border: '1px solid #b9aa98',
  background: '#fffdf8',
};

const thStyle: CSSProperties = {
  border: '1px solid #b9aa98',
  padding: '7px 6px',
  background: '#f1e7d8',
  color: '#49392d',
  fontSize: 11,
  fontWeight: 900,
  textAlign: 'center',
  lineHeight: 1.35,
};

const tdStyle: CSSProperties = {
  border: '1px solid #b9aa98',
  padding: '8px 6px',
  color: '#31271f',
  fontSize: 11,
  fontWeight: 700,
  lineHeight: 1.45,
  textAlign: 'center',
  verticalAlign: 'middle',
  wordBreak: 'keep-all',
  overflowWrap: 'break-word',
};
