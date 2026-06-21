import type { ExplanationMetaMap } from './explanation_meta_types';

export const explanationMetaPilotPhysV1: ExplanationMetaMap = {
  'PHYS-002-001': {
    questionId: 'PHYS-002-001',
    schemaVersion: 1,
    misconceptionId: 'phys.combustion.liquid_evaporative',
    lossCategory: 'classification_confusion',
    visualKey: 'vapor_combustion_flow',
    lossTitle: '液体そのものが燃える、と考えてしまう',
    style: 'process_diagram',
    shortExplanation:
      '第4類危険物などの引火性液体は、液体そのものが直接燃えるのではありません。液面から蒸発した可燃性蒸気が空気と混ざり、その混合気が燃える蒸発燃焼です。',
    steps: [
      {
        label: '液面から可燃性蒸気が発生する',
        note: '液体そのものではなく、まず蒸気になることが重要です。',
      },
      {
        label: '可燃性蒸気が空気中の酸素と混合する',
        note: '燃える準備ができるのは、蒸気と空気が混ざった状態です。',
      },
      {
        label: '混合気が着火して燃焼する',
        note: 'これが引火性液体の蒸発燃焼です。',
        variant: 'correct',
      },
    ],
    optionMemos: {
      0: '液面が燃えているように見えても、液体表面が直接赤熱する表面燃焼ではありません。',
      2: '分解燃焼は、木材や紙などが熱分解して可燃性ガスを出す場合の考え方です。',
      3: '内部燃焼ではありません。空気中の酸素と混合した可燃性蒸気が燃えます。',
      4: '液体が固体に変化して表面燃焼するわけではありません。',
    },
  },

  'PHYS-001-006': {
    questionId: 'PHYS-001-006',
    schemaVersion: 1,
    misconceptionId: 'phys.combustion.liquid_evaporative',
    lossCategory: 'classification_confusion',
    visualKey: 'vapor_combustion_flow',
    lossTitle: '第4類の燃焼形態を物質ごとに別物と考えてしまう',
    style: 'process_diagram',
    shortExplanation:
      'ガソリン、灯油、軽油、重油などの引火性液体は、基本的に液面から発生した蒸気が空気と混ざって燃える蒸発燃焼です。液体そのものが表面燃焼・分解燃焼・内部燃焼するわけではありません。',
    steps: [
      {
        label: '第4類危険物は引火性液体',
        note: '試験では、まず「液体そのもの」ではなく「蒸気」に注目します。',
      },
      {
        label: '液面から蒸気が発生する',
        note: 'ガソリン・灯油・軽油・重油も、この発想で整理します。',
      },
      {
        label: '蒸気が空気と混合して燃える',
        note: '通常の燃焼形態は蒸発燃焼です。',
        variant: 'correct',
      },
    ],
    optionMemos: {
      0: 'ガソリンは表面燃焼ではありません。液面から発生した蒸気が燃える蒸発燃焼です。',
      1: '灯油は分解燃焼ではありません。引火性液体なので蒸発燃焼です。',
      2: '重油は内部燃焼ではありません。液体内部ではなく、発生した蒸気が燃えます。',
      4: '軽油は自己燃焼ではありません。第4類の引火性液体なので蒸発燃焼です。',
    },
  },

  'PHYS-001-008': {
    questionId: 'PHYS-001-008',
    schemaVersion: 1,
    misconceptionId: 'phys.combustion.wood_charcoal',
    lossCategory: 'classification_confusion',
    visualKey: 'solid_combustion_compare',
    visualImage: {
      src: '/explanations/wood-charcoal-combustion.png',
      alt: '\u6728\u6750\u306f\u767a\u751f\u3057\u305f\u53ef\u71c3\u6027\u30ac\u30b9\u304c\u71c3\u3048\u3001\u6728\u70ad\u306f\u56fa\u4f53\u8868\u9762\u304c\u8d64\u71b1\u3057\u3066\u71c3\u3048\u308b\u3053\u3068\u3092\u793a\u3059\u56f3',
      aspectRatio: '4:5',
      caption: '\u6728\u6750\u306f\u30ac\u30b9\u3001\u6728\u70ad\u306f\u8868\u9762\u304c\u71c3\u3048\u308b',
      replacesVisual: true,
    },
    lossTitle: '木材・紙と木炭・コークスの燃え方を混同している',
    style: 'comparison_table',
    shortExplanation:
      '木材や紙は、加熱により熱分解して発生した可燃性ガスが燃えるので分解燃焼です。木炭やコークスは、固体表面が直接酸素と反応して赤熱するので表面燃焼です。',
    tableHeader: ['対象', '燃焼形態', '理由'],
    rows: [
      {
        cells: ['木材・紙', '分解燃焼', '加熱により熱分解し、発生した可燃性ガスが燃える'],
        variant: 'correct',
      },
      {
        cells: ['木炭・コークス', '表面燃焼', '固体表面が直接酸素と反応し、赤熱して燃える'],
        variant: 'correct',
      },
    ],
    optionMemos: {
      0: '木材・紙は蒸発燃焼ではありません。液体のように蒸発して燃えるのではなく、熱分解で可燃性ガスが発生します。',
      1: 'AとBが逆です。木材・紙は分解燃焼、木炭・コークスは表面燃焼です。',
      3: 'Bは蒸発燃焼ではありません。木炭・コークスは表面燃焼です。',
      4: 'AもBも違います。木材・紙は分解燃焼、木炭・コークスは表面燃焼です。',
    },
  },

  'PHYS-002-002': {
    questionId: 'PHYS-002-002',
    schemaVersion: 1,
    misconceptionId: 'phys.combustion.wood_charcoal',
    lossCategory: 'classification_confusion',
    visualKey: 'solid_combustion_compare',
    visualImage: {
      src: '/explanations/wood-charcoal-combustion.png',
      alt: '\u6728\u6750\u306f\u767a\u751f\u3057\u305f\u53ef\u71c3\u6027\u30ac\u30b9\u304c\u71c3\u3048\u3001\u6728\u70ad\u306f\u56fa\u4f53\u8868\u9762\u304c\u8d64\u71b1\u3057\u3066\u71c3\u3048\u308b\u3053\u3068\u3092\u793a\u3059\u56f3',
      aspectRatio: '4:5',
      caption: '\u6728\u6750\u306f\u30ac\u30b9\u3001\u6728\u70ad\u306f\u8868\u9762\u304c\u71c3\u3048\u308b',
      replacesVisual: true,
    },
    lossTitle: '同じ「木」でも燃焼形態が同じだと思ってしまう',
    style: 'comparison_table',
    shortExplanation:
      '木材は、加熱で熱分解して可燃性ガスを発生し、そのガスが燃える分解燃焼です。一方、木炭はすでにガス成分が抜けた状態なので、固体表面が直接酸素と反応して燃える表面燃焼です。',
    tableHeader: ['物質', '燃焼形態', 'ポイント'],
    rows: [
      {
        cells: ['木材', '分解燃焼', '熱分解で可燃性ガスが出て燃える'],
        variant: 'correct',
      },
      {
        cells: ['木炭', '表面燃焼', '固体表面が直接酸素と反応して赤熱する'],
        variant: 'correct',
      },
    ],
    optionMemos: {
      0: '木炭は分解燃焼ではありません。固体表面が直接酸素と反応する表面燃焼です。',
      1: '木材は表面燃焼ではありません。熱分解で発生した可燃性ガスが燃える分解燃焼です。',
      3: '木材と木炭が逆です。木材は分解燃焼、木炭は表面燃焼です。',
      4: '木材は内部燃焼ではなく、木炭は蒸発燃焼でもありません。',
    },
  },

  'PHYS-003-005': {
    questionId: 'PHYS-003-005',
    schemaVersion: 1,
    misconceptionId: 'phys.hazard.magnitude_direction',
    lossCategory: 'direction_confusion',
    visualKey: 'hazard_indicator_table',
    lossTitle: '危険性の指標で「大きいほど危険」と「小さいほど危険」を逆にしている',
    style: 'comparison_table',
    shortExplanation:
      'この問題の正解は、火炎伝播速度です。火炎伝播速度は大きいほど炎が速く広がるため危険です。次に、温度系の引火点・沸点は低いほど危険、着火や静電気に関わる最小着火エネルギー・導電率は小さいほど危険と整理します。',
    tableHeader: ['危険な向き', '該当する指標', '理由'],
    rows: [
      {
        cells: ['大きいほど危険', '火炎伝播速度', '炎が速く広がる'],
        variant: 'correct',
        isKey: true,
      },
      {
        cells: ['低いほど危険', '引火点・沸点', '低温で引火しやすく、蒸発しやすい'],
        variant: 'neutral',
      },
      {
        cells: ['小さいほど危険', '最小着火エネルギー・導電率', '少ない火花で着火しやすく、静電気が逃げにくい'],
        variant: 'neutral',
      },
    ],
    optionMemos: {
      0: '引火点は高いほど安全側です。低いほど低温で引火しやすく危険です。',
      1: '最小着火エネルギーは小さいほど危険です。少ないエネルギーで着火します。',
      2: '導電率は小さいほど静電気が逃げにくく、蓄積しやすいため危険です。',
      4: '沸点は低いほど蒸発しやすく、可燃性蒸気をつくりやすいため危険です。',
    },
  },
};



