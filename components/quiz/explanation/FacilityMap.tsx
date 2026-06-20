import type { CSSProperties } from 'react';
import type { FacilityMapItem } from '../../../data/explanation_meta_types';

type FacilityMapProps = {
  facilityItems?: FacilityMapItem[];
};

export function FacilityMap({ facilityItems }: FacilityMapProps) {
  if (!facilityItems || facilityItems.length === 0) {
    return null;
  }

  const targetItems = facilityItems.filter((item) => item.status !== 'excluded');
  const excludedItems = facilityItems.filter((item) => item.status === 'excluded');

  return (
    <div style={wrapStyle}>
      <div style={titleStyle}>保安距離</div>

      <table style={tableStyle}>
        <tbody>
          <tr>
            <th style={headLeftStyle}>必要な施設</th>
            <td style={headRightStyle}>
              製造所、屋内貯蔵所、屋外貯蔵所、屋外タンク貯蔵所、一般取扱所
            </td>
          </tr>

          {targetItems.map((item) => {
            const isKey = item.isKey === true;
            const facilityStyle: CSSProperties = isKey
              ? {
                  ...facilityCellStyle,
                  background: '#FFF7DF',
                  borderColor: '#C9A55A',
                  boxShadow: 'inset 4px 0 0 #C9A55A',
                }
              : facilityCellStyle;
            const distanceStyle: CSSProperties = isKey
              ? {
                  ...distanceCellStyle,
                  background: '#FFF7DF',
                  borderColor: '#C9A55A',
                  color: '#7A4D0B',
                }
              : distanceCellStyle;

            return (
              <tr key={`${item.label}-${item.distance}`}>
                <td style={facilityStyle}>{item.label}</td>
                <td style={distanceStyle}>{item.distance}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {excludedItems.length > 0 ? (
        <div style={excludedWrapStyle}>
          <div style={excludedTitleStyle}>対象外でひっかけ</div>
          <div style={excludedListStyle}>
            {excludedItems.map((item) => (
              <span key={item.label} style={excludedChipStyle}>
                {item.label}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

const wrapStyle: CSSProperties = {
  display: 'grid',
  gap: 8,
};

const titleStyle: CSSProperties = {
  color: '#31271f',
  fontSize: 14,
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

const headLeftStyle: CSSProperties = {
  width: '30%',
  border: '1px solid #9f9284',
  padding: '7px 6px',
  background: '#f1e7d8',
  color: '#49392d',
  fontSize: 11,
  fontWeight: 900,
  textAlign: 'center',
  verticalAlign: 'middle',
  lineHeight: 1.35,
};

const headRightStyle: CSSProperties = {
  width: '70%',
  border: '1px solid #9f9284',
  padding: '7px 7px',
  color: '#31271f',
  fontSize: 11,
  fontWeight: 700,
  lineHeight: 1.45,
  verticalAlign: 'middle',
};

const facilityCellStyle: CSSProperties = {
  width: '68%',
  border: '1px solid #9f9284',
  padding: '8px 7px',
  color: '#31271f',
  fontSize: 11,
  fontWeight: 700,
  lineHeight: 1.45,
  verticalAlign: 'middle',
  wordBreak: 'keep-all',
  overflowWrap: 'break-word',
};

const distanceCellStyle: CSSProperties = {
  width: '32%',
  border: '1px solid #9f9284',
  padding: '8px 7px',
  color: '#31271f',
  fontSize: 13,
  fontWeight: 900,
  lineHeight: 1.4,
  textAlign: 'center',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
};

const excludedWrapStyle: CSSProperties = {
  display: 'grid',
  gap: 5,
  padding: '7px 8px',
  border: '1px solid #eadfce',
  borderRadius: 10,
  background: '#f9f2e8',
};

const excludedTitleStyle: CSSProperties = {
  color: '#6d5540',
  fontSize: 11,
  fontWeight: 900,
};

const excludedListStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 5,
};

const excludedChipStyle: CSSProperties = {
  border: '1px solid #d8cbbd',
  borderRadius: 999,
  padding: '3px 7px',
  background: '#fffdf8',
  color: '#49392d',
  fontSize: 10,
  fontWeight: 800,
};
