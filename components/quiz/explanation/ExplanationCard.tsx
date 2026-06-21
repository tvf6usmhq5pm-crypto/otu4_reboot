'use client';

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
  onNext?: () => void;
};

function renderVisualBlock(meta: ExplanationMeta) {
  if (meta.style === 'procedure_table') {
    return <ProcedureTable tableHeader={meta.tableHeader} rows={meta.rows} />;
  }

  if (meta.style === 'comparison_table') {
    if (meta.questionId === 'PROP-003-001') {
      return <Type4FireSprayDiagram />;
    }

    return <ComparisonTable tableHeader={meta.tableHeader} rows={meta.rows} />;
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

export function ExplanationCard({ meta, onNext }: ExplanationCardProps) {
  const visualBlock = meta.visualImage?.replacesVisual ? null : renderVisualBlock(meta);

  return (
    <section style={cardStyle} aria-label="解説">
      <div style={watermarkStyle}>Z4</div>

      <div style={lossHeaderStyle}>
        <div style={redBarStyle} />
        <div>
          <div style={lossCaptionStyle}>この問題の急所</div>
          <div style={lossTitleStyle}>{meta.lossTitle}</div>
        </div>
      </div>

      <div style={explanationHeaderStyle}>
        <span style={iconStyle}>💡</span>
        <span style={explanationTitleStyle}>解説</span>
      </div>

      {/* pilot段階では highlightTerms は赤表示しない。必要問題だけ後で限定導入する。 */}
      <p style={shortExplanationStyle}><InlineMarkdownText text={meta.shortExplanation} /></p>

      {meta.visualImage ? <ExplanationImage image={meta.visualImage} /> : null}

      {visualBlock ? <div style={visualWrapStyle}>{visualBlock}</div> : null}

      <OptionMemoList optionMemos={meta.optionMemos} />

      <div style={ctaRowStyle}>
        <button type="button" style={nextButtonStyle} onClick={onNext}>
          次の問題へ
        </button>

        {meta.reviewCtaLabel ? (
          <button type="button" style={reviewButtonStyle}>
            {meta.reviewCtaLabel}
          </button>
        ) : null}
      </div>
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

const watermarkStyle: CSSProperties = {
  position: 'absolute',
  right: 18,
  top: 18,
  color: 'rgba(150, 110, 70, 0.08)',
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: 42,
  fontWeight: 800,
  pointerEvents: 'none',
};

const lossHeaderStyle: CSSProperties = {
  position: 'relative',
  zIndex: 1,
  display: 'grid',
  gridTemplateColumns: '4px 1fr',
  gap: 9,
  alignItems: 'center',
  marginBottom: 10,
};

const redBarStyle: CSSProperties = {
  width: 4,
  height: 32,
  borderRadius: 999,
  background: '#d11616',
};

const lossCaptionStyle: CSSProperties = {
  color: '#7a6658',
  fontSize: 11,
  fontWeight: 800,
};

const lossTitleStyle: CSSProperties = {
  marginTop: 2,
  color: '#31271f',
  fontSize: 14,
  fontWeight: 800,
  fontFamily: '"Hiragino Mincho ProN", "Yu Mincho", "YuMincho", serif',
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
  fontSize: 13,
  lineHeight: 1.75,
};

const visualWrapStyle: CSSProperties = {
  position: 'relative',
  zIndex: 1,
  marginBottom: 10,
};

const ctaRowStyle: CSSProperties = {
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  gap: 8,
  marginTop: 12,
};

const nextButtonStyle: CSSProperties = {
  flex: '1 1 auto',
  border: '1px solid #d11616',
  borderRadius: 12,
  padding: '10px 12px',
  background: '#d11616',
  color: '#fff',
  fontSize: 13,
  fontWeight: 800,
  cursor: 'pointer',
};

const reviewButtonStyle: CSSProperties = {
  flex: '1 1 auto',
  border: '1px solid #d9b36a',
  borderRadius: 12,
  padding: '10px 12px',
  background: '#fff8e8',
  color: '#8a5200',
  fontSize: 13,
  fontWeight: 800,
  cursor: 'pointer',
};








