import type { CSSProperties } from 'react';
import type { CalculationLine, ExplanationRow } from '../../../data/explanation_meta_types';

type CalculationStepProps = {
  tableHeader?: string[];
  rows?: ExplanationRow[];
  calcLines?: CalculationLine[];
  fontSize?: number;
};

export function CalculationStep({ tableHeader, rows, calcLines, fontSize = 14 }: CalculationStepProps) {
  const hasRows = rows && rows.length > 0;
  const hasLines = calcLines && calcLines.length > 0;

  if (!hasRows && !hasLines) {
    return null;
  }

  return (
    <div style={wrapStyle}>
      {hasRows ? (
        <div style={tableWrapStyle}>
          <div style={{ ...titleStyle, fontSize }}>指定数量倍数の整理</div>

          <table style={tableStyle}>
            <thead>
              <tr>
                {(tableHeader ?? ['危険物', '指定数量', '計算', '倍数']).map((header) => (
                  <th key={header} style={{ ...thStyle, fontSize }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`${row.cells.join('-')}-${rowIndex}`}>
                  {row.cells.map((cell, cellIndex) => (
                    <td key={`${rowIndex}-${cellIndex}`} style={{ ...(cellIndex === 0 ? nameTdStyle : tdStyle), fontSize }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {hasLines ? (
        <div style={lineListStyle}>
          {calcLines.map((line, index) => (
            <div key={`${line.step}-${index}`} style={lineCardStyle}>
              <div style={{ ...lineStepStyle, fontSize }}>{line.step}</div>

              {line.formula ? <div style={{ ...formulaStyle, fontSize }}>{line.formula}</div> : null}

              {line.result ? <div style={{ ...resultStyle, fontSize }}>{line.result}</div> : null}

              {line.note ? <div style={{ ...noteStyle, fontSize }}>{line.note}</div> : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const wrapStyle: CSSProperties = {
  display: 'grid',
  gap: 9,
};

const tableWrapStyle: CSSProperties = {
  display: 'grid',
  gap: 7,
};

const titleStyle: CSSProperties = {
  color: '#31271f',
  fontWeight: 900,
  fontFamily: '"Hiragino Mincho ProN", "Yu Mincho", "YuMincho", serif',
};

const tableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  tableLayout: 'fixed',
  border: '1px solid #9f9284',
  background: '#fffdf8',
};

const thStyle: CSSProperties = {
  border: '1px solid #9f9284',
  padding: '7px 5px',
  background: '#f1e7d8',
  color: '#49392d',
  fontWeight: 900,
  textAlign: 'center',
  lineHeight: 1.35,
};

const tdStyle: CSSProperties = {
  border: '1px solid #9f9284',
  padding: '8px 5px',
  color: '#31271f',
  fontWeight: 800,
  lineHeight: 1.45,
  textAlign: 'center',
  verticalAlign: 'middle',
  whiteSpace: 'pre-line',
  wordBreak: 'keep-all',
  overflowWrap: 'break-word',
};

const nameTdStyle: CSSProperties = {
  ...tdStyle,
  textAlign: 'left',
  fontWeight: 800,
};

const lineListStyle: CSSProperties = {
  display: 'grid',
  gap: 7,
};

const lineCardStyle: CSSProperties = {
  border: '1px solid #eadfce',
  borderRadius: 12,
  padding: 10,
  background: '#fffdf8',
};

const lineStepStyle: CSSProperties = {
  color: '#6d5540',
  fontWeight: 900,
};

const formulaStyle: CSSProperties = {
  marginTop: 5,
  padding: '7px 8px',
  borderRadius: 8,
  background: '#f7efe2',
  color: '#49392d',
  fontWeight: 800,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  overflowX: 'auto',
};

const resultStyle: CSSProperties = {
  marginTop: 5,
  color: '#31271f',
  fontWeight: 900,
};

const noteStyle: CSSProperties = {
  marginTop: 4,
  color: '#7a6658',
  lineHeight: 1.5,
};
