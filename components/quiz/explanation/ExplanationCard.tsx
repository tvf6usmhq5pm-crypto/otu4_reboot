'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import type { ExplanationMeta } from '../../../data/explanation_meta_types';
import { CalculationStep } from './CalculationStep';
import { ComparisonTable } from './ComparisonTable';
import { ExplanationImage } from './ExplanationImage';
import { FacilityMap } from './FacilityMap';
import { Type4FireSprayDiagram } from './Type4FireSprayDiagram';
import { NumberCard } from './NumberCard';
import { OptionMemoList } from './OptionMemoList';
import { ProcedureTable } from './ProcedureTable';
import { ProcessDiagram } from './ProcessDiagram';
import { InlineMarkdownText } from './MarkdownText';

type ExplanationCardProps = {
  meta: ExplanationMeta;
  selectedIndex?: number;
  correctIndex?: number;
  bodyFontSize?: number;
};

function renderVisualBlock(meta: ExplanationMeta) {
  if (meta.style === 'procedure_table') {
    return <ProcedureTable ariaLabel={meta.visualBlockTitle ?? '手順表'} tableHeader={meta.tableHeader} rows={meta.rows} />;
  }

  if (meta.style === 'comparison_table') {
    if (meta.questionId === 'PROP-003-001') {
      return <Type4FireSprayDiagram />;
    }

    return <ComparisonTable ariaLabel={meta.visualBlockTitle ?? '比較表'} tableHeader={meta.tableHeader} rows={meta.rows} />;
  }

  if (meta.style === 'number_card') {
    return <NumberCard numberHighlight={meta.numberHighlight} />;
  }

  if (meta.style === 'calculation_step') {
    return <CalculationStep tableHeader={meta.tableHeader} rows={meta.rows} calcLines={meta.calcLines} />;
  }

  if (meta.style === 'process_diagram') {
    return <ProcessDiagram steps={meta.steps ?? []} />;
  }

  if (meta.style === 'facility_map') {
    return <FacilityMap facilityItems={meta.facilityItems} />;
  }

  return null;
}

const renderInlineStrongText = (text: string) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} style={{ fontWeight: 800 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }

    return <span key={index}>{part}</span>;
  });

export function ExplanationCard({ meta, selectedIndex, correctIndex, bodyFontSize = 15 }: ExplanationCardProps) {
  const [isSupplementalImageOpen, setIsSupplementalImageOpen] = useState(false);

  useEffect(() => {
    setIsSupplementalImageOpen(false);
  }, [meta.questionId]);

  const supplementalImageId = `supplemental-image-${meta.questionId}`;
  const visualBlock = meta.visualImage?.replacesVisual ? null : renderVisualBlock(meta);

  return (
    <section style={cardStyle} aria-label="解説">
      {/* lossTitle（この問題の急所）は表示しない。間違えた理由は選んだ選択肢の解説で伝える。 */}
      {/* pilot段階では highlightTerms は赤表示しない。必要問題だけ後で限定導入する。 */}
      {meta.visualImage ? <ExplanationImage image={meta.visualImage} /> : null}

      <div style={explanationHeaderStyle}>
        <span style={iconStyle}>💡</span>
        <span style={explanationTitleStyle}>解説</span>
      </div>


      {meta.shortExplanation.trim() ? (
        <p style={{ ...shortExplanationStyle, fontSize: bodyFontSize }}>{renderInlineStrongText(meta.shortExplanation)}</p>
      ) : null}

      {meta.supplementalImage ? (
        <div style={supplementalImageSectionStyle}>
          <button
            type="button"
            style={supplementalImageButtonStyle}
            onClick={() => setIsSupplementalImageOpen((current) => !current)}
            aria-expanded={isSupplementalImageOpen}
            aria-controls={supplementalImageId}
          >
            <span>{meta.supplementalImageLabel ?? '補足資料を見る'}</span>
            <span aria-hidden="true">{isSupplementalImageOpen ? '▲' : '▼'}</span>
          </button>

          {isSupplementalImageOpen ? (
            <div id={supplementalImageId} style={supplementalImageContentStyle}>
              <ExplanationImage image={meta.supplementalImage} />
            </div>
          ) : null}
        </div>
      ) : null}

      {!meta.visualImage?.src && visualBlock ? (
        <div style={visualWrapStyle}>
          {meta.visualBlockTitle ? (
            <div style={visualBlockTitleStyle}>
              <InlineMarkdownText text={meta.visualBlockTitle} />
            </div>
          ) : null}

          {visualBlock}
        </div>
      ) : null}

      <OptionMemoList
        optionMemos={meta.optionMemos}
        selectedIndex={selectedIndex}
        correctIndex={correctIndex}
        bodyFontSize={bodyFontSize}
      />
    </section>
  );
}

const cardStyle: CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
  border: '1px solid #eadfce',
  borderRadius: 16,
  padding: 14,
  background: '#fffaf3',
  boxShadow: '0 8px 22px rgba(74, 52, 35, 0.08)',
};

const explanationHeaderStyle: CSSProperties = {
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  marginBottom: 6,
};

const iconStyle: CSSProperties = {
  fontSize: 16,
};

const explanationTitleStyle: CSSProperties = {
  color: '#31271f',
  fontSize: 15,
  fontWeight: 800,
  fontFamily: '"Hiragino Mincho ProN", "Yu Mincho", "YuMincho", serif',
};

const shortExplanationStyle: CSSProperties = {
  position: 'relative',
  zIndex: 1,
  margin: '0 0 10px',
  color: '#31271f',
  lineHeight: 1.75,
};

const supplementalImageSectionStyle: CSSProperties = {
  position: 'relative',
  zIndex: 1,
  margin: '2px 0 12px',
};

const supplementalImageButtonStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  minHeight: 44,
  border: '1px solid #d9b36a',
  borderRadius: 12,
  padding: '10px 12px',
  background: '#fff8e8',
  color: '#8a5200',
  fontSize: 13,
  fontWeight: 800,
  cursor: 'pointer',
  textAlign: 'left',
};

const supplementalImageContentStyle: CSSProperties = {
  marginTop: 4,
};
const visualBlockTitleStyle: CSSProperties = {
  position: 'relative',
  zIndex: 1,
  margin: '0 0 8px',
  color: '#1A2238',
  fontSize: 13,
  fontWeight: 900,
  lineHeight: 1.4,
};
const visualWrapStyle: CSSProperties = {
  position: 'relative',
  zIndex: 1,
  marginBottom: 10,
};









