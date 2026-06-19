export type ExplanationStyle =
  | 'short'
  | 'procedure_table'
  | 'comparison_table'
  | 'number_card'
  | 'process_diagram'
  | 'adaptation_matrix'
  | 'calculation_step'
  | 'facility_map'
  | 'intuition_fix'
  | 'diagram';

export type LossCategory =
  | 'number_confusion'
  | 'classification_confusion'
  | 'procedure_confusion'
  | 'scope_confusion'
  | 'direction_confusion'
  | 'property_confusion';

export type RowVariant = 'correct' | 'danger' | 'neutral';

export type OptionIndex = 0 | 1 | 2 | 3 | 4;

export type ExplanationRow = {
  cells: string[];
  variant?: RowVariant;
  note?: string;
  isKey?: boolean;
};

export type ProcessStep = {
  label: string;
  icon?: string;
  note?: string;
  variant?: RowVariant;
};

export type AdaptationVerdict = 'ok' | 'ng' | 'partial';

export type AdaptationMatrixItem = {
  label: string;
  verdict: AdaptationVerdict;
  note?: string;
};

export type CalculationLine = {
  step: string;
  formula?: string;
  result?: string;
  note?: string;
};

export type NumberHighlight = {
  value: string;
  unit: string;
  label: string;
  danger?: string;
};

export type FacilityMapStatus = 'target' | 'excluded' | 'conditional';

export type FacilityMapItem = {
  label: string;
  status: FacilityMapStatus;
  distance?: string;
  note?: string;
  variant?: RowVariant;
};

export type DiagramNode = {
  label: string;
  note?: string;
  variant?: RowVariant;
};

export type ExplanationMeta = {
  questionId: string;
  schemaVersion: number;
  misconceptionId: string;
  lossCategory: LossCategory;
  lossTitle: string;
  style: ExplanationStyle;
  shortExplanation: string;
  visualKey?: string;
  highlightTerms?: string[];

  tableHeader?: string[];
  rows?: ExplanationRow[];

  steps?: ProcessStep[];

  matrix?: AdaptationMatrixItem[];

  calcLines?: CalculationLine[];

  numberHighlight?: NumberHighlight;

  facilityItems?: FacilityMapItem[];

  diagramTitle?: string;
  diagramNodes?: DiagramNode[];

  optionMemos?: Partial<Record<OptionIndex, string>>;

  reviewCtaLabel?: string;
};

export type ExplanationMetaMap = Record<string, ExplanationMeta>;

