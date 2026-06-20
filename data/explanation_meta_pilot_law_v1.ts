import type { ExplanationMetaMap } from './explanation_meta_types';

/**
 * otu4 explanation meta pilot law v1
 *
 * 法令5問パイロット
 *
 * 目的:
 * - 700問展開前に、共通schemaで5型を確認する
 * - 元JSONは変更しない
 * - star / difficulty はmetaに入れない
 * - optionMemosのkeyは options 配列の元index 0〜4
 *
 * 型カバレッジ:
 * - procedure_table    LAW-006-002-V01
 * - number_card        LAW-011-001
 * - calculation_step   LAW-004-008
 * - facility_map       LAW-020-002
 * - comparison_table   LAW-002-002
 */

export const explanationMetaPilotLawV1: ExplanationMetaMap = {
    'LAW-006-002-V01': {
    questionId: 'LAW-006-002-V01',
    schemaVersion: 1,
    misconceptionId: 'law.permit.authority_mixup',
    lossCategory: 'procedure_confusion',
    lossTitle: '手続き区分と相手先の混同',
    style: 'procedure_table',
    shortExplanation:
      '製造所等の設置・変更は市町村長等の許可です。仮貯蔵・仮取扱いは消防長等の承認、完成検査と仮使用も相手先を混同しやすいので整理します。',
    tableHeader: ['区分', '相手', '手続き'],
    rows: [
      {
        cells: ['設置・変更', '市町村長等', '許可'],
        variant: 'correct',
      },
      {
        cells: ['仮貯蔵・仮取扱い', '消防長又は消防署長', '承認'],
        variant: 'neutral',
      },
      {
        cells: ['完成検査', '市町村長等', '検査'],
        variant: 'neutral',
      },
      {
        cells: ['仮使用', '市町村長等', '承認'],
        variant: 'neutral',
      },
    ],
    optionMemos: {
      1: '仮貯蔵・仮取扱いは、市町村長等の許可ではなく、消防長又は消防署長の承認。',
      2: '完成検査は、所轄消防長又は消防署長ではなく、市町村長等が行う。',
      3: '仮使用は、所轄消防長又は消防署長ではなく、市町村長等の承認。',
      4: '設置は都道府県知事への届出ではなく、市町村長等の許可。',
    },
    reviewCtaLabel: '手続き区分をもう1問',
  },

  'LAW-011-001': {
    questionId: 'LAW-011-001',
    schemaVersion: 1,
    misconceptionId: 'law.safety_course.interval_5y',
    lossCategory: 'number_confusion',
    lossTitle: '保安講習の期間を5年と混同',
    style: 'number_card',
    shortExplanation: '危険物の取扱作業に従事する危険物取扱者の保安講習は、5年に1回ではありません。継続して従事する場合は、免状交付日または前回講習日以後の最初の4月1日から3年以内ごとに受講します。',
    highlightTerms: ['3年以内', '5年'],
    numberHighlight: {
      value: '3',
      unit: '年以内',
      label: '保安講習の基本周期',
      danger: '5年ではない',
    },
    reviewCtaLabel: '保安講習をもう1問',
  },

  'LAW-004-008': {
    questionId: 'LAW-004-008',
    schemaVersion: 1,
    misconceptionId: 'law.designated_qty.water_soluble',
    lossCategory: 'classification_confusion',
    lossTitle: '指定数量倍数の計算ミス',
    style: 'calculation_step',
    shortExplanation:
      '指定数量の倍数は、貯蔵量を指定数量で割って、それぞれの倍数を合計します。水溶性と非水溶性で指定数量が変わる点に注意します。',
    tableHeader: ['危険物', '指定数量', '計算', '倍数'],
    rows: [
      {
        cells: ['ベンゼン\n第1石油類・非水溶性', '200L', '400÷200', '2'],
      },
      {
        cells: ['アセトン\n第1石油類・水溶性', '400L', '800÷400', '2'],
      },
      {
        cells: ['灯油\n第2石油類・非水溶性', '1,000L', '1,500÷1,000', '1.5'],
      },
    ],
    calcLines: [
      {
        step: '合計',
        formula: '2 + 2 + 1.5',
        result: '5.5倍',
      },
    ],
    optionMemos: {
      0: 'ベンゼンを水溶性として扱うと、指定数量を誤ります。',
      1: '灯油の1.5倍を切り捨てると、合計がズレます。',
      3: '灯油の1.5倍を切り上げると、合計がズレます。',
      4: 'アセトンを非水溶性として扱うと、指定数量を誤ります。',
    },
    reviewCtaLabel: '指定数量計算をもう1問',
  },

  'LAW-020-002': {
    questionId: 'LAW-020-002',
    schemaVersion: 1,
    misconceptionId: 'law.safety_distance.target_scope',
    lossCategory: 'scope_confusion',
    lossTitle: '保安距離の対象施設の混同',
    style: 'facility_map',
    shortExplanation:
      '保安距離は、対象施設と必要距離をセットで覚える問題です。特に、架空電線、敷地外の住居、学校・病院、重要文化財の距離を整理します。',
    facilityItems: [
      {
        label: '特別高圧架空電線（7,000V超〜35,000V以下）',
        status: 'target',
        distance: '3m以上',
      },
      {
        label: '特別高圧架空電線（35,000V超）',
        status: 'target',
        distance: '5m以上',
      },
      {
        label: '製造所等の敷地外にある住居',
        status: 'target',
        distance: '10m以上',
      },
      {
        label: '高圧ガス・液化石油ガスの施設',
        status: 'target',
        distance: '20m以上',
      },
      {
        label: '幼稚園・保育園〜高校・病院・劇場等',
        status: 'target',
        distance: '30m以上',
      },
      {
        label: '重要文化財等の建造物',
        status: 'target',
        distance: '50m以上',
      },
      {
        label: '大学',
        status: 'excluded',
      },
      {
        label: '同一敷地内の住居',
        status: 'excluded',
      },
      {
        label: '埋設電線',
        status: 'excluded',
      },
    ],
    reviewCtaLabel: '保安距離をもう1問',
  },

  'LAW-002-002': {
    questionId: 'LAW-002-002',
    schemaVersion: 1,
    misconceptionId: 'law.hazard_category.classification',
    lossCategory: 'classification_confusion',
    lossTitle: '類と性質名の混同',
    style: 'comparison_table',
    shortExplanation:
      '第3類は自然発火性物質及び禁水性物質です。可燃性固体は第2類の性質で、マグネシウムも第2類に分類されます。',
    highlightTerms: ['第3類', '自然発火性物質及び禁水性物質', '可燃性固体', '第2類', 'マグネシウム'],
    tableHeader: ['混同ポイント', '正しい分類', '見分け方'],
    rows: [
      {
        cells: ['マグネシウム', '第2類・可燃性固体', '第3類ではなく、第2類で切る'],
        variant: 'correct',
      },
      {
        cells: ['第3類', '自然発火性物質・禁水性物質', '可燃性固体ではない'],
        variant: 'danger',
        isKey: true,
      },
      {
        cells: ['判定ルート', '物質名 → 性質名 → 類', '今回は「マグネシウム → 可燃性固体 → 第2類」'],
        variant: 'neutral',
      },
    ],
    reviewCtaLabel: '類別をもう1問',
  },
};



