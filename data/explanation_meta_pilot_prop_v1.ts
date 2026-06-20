import type { ExplanationMetaMap } from './explanation_meta_types';

export const explanationMetaPilotPropV1: ExplanationMetaMap = {
  'PROP-003-001': {
    questionId: 'PROP-003-001',
    schemaVersion: 1,
    misconceptionId: 'prop.extinguish.type4_water_jet',
    lossCategory: 'procedure_confusion',
    lossTitle: '第4類火災に棒状放射を使ってしまう',
    style: 'comparison_table',
    shortExplanation:
      '非水溶性の第4類危険物火災では、油面を強く叩く棒状放射は火災を広げるおそれがあります。泡は油面を覆う窒息作用、粉末は抑制作用、二酸化炭素は窒息作用で有効です。',
    tableHeader: ['強化液の放射方法', '油面への影響', '判断'],
    rows: [
      {
        cells: ['棒状放射', '油面を直接叩き、飛散・拡大のおそれ', '不適切'],
        variant: 'danger',
        isKey: true,
      },
      {
        cells: ['霧状放射', '油面を叩きにくい', '棒状放射とは区別する'],
        variant: 'correct',
      },
    ],
    optionMemos: {
      0: '泡消火剤は窒息作用で有効です。適切な方法なので、本問の正解（不適切なもの）ではありません。',
      1: '粉末消火剤は抑制作用で有効です。適切な方法なので、本問の正解ではありません。',
      2: '二酸化炭素消火剤は窒息作用で有効です。適切な方法なので、本問の正解ではありません。',
      3: '棒状放射は油面を叩いて飛散させるおそれがあるため不適切です。これが本問の正解です。',
      4: '霧状放射は油面を叩きにくいため、棒状放射とは区別します。本問の正解ではありません。',
    },
  },

  'PROP-003-002-V02': {
    questionId: 'PROP-003-002-V02',
    schemaVersion: 1,
    misconceptionId: 'prop.extinguish.type4_water_jet',
    lossCategory: 'procedure_confusion',
    lossTitle: '第4類火災に水を棒状注水してしまう',
    style: 'process_diagram',
    shortExplanation:
      '第4類危険物には水より軽く水面に浮くものが多く、棒状に注水すると燃えている液体が広がったり、火炎とともに流れたりするおそれがあります。',
    steps: [
      {
        label: '水を棒状に注水する',
        note: '強い水流が油面を叩きます。',
      },
      {
        label: '危険物が水面に浮いて広がる',
        note: 'ガソリンなどは水より軽く、流されやすいです。',
      },
      {
        label: '火炎とともに流れて火災範囲が拡大する',
        note: 'だから棒状注水は不適切になりやすいです。',
        variant: 'danger',
      },
    ],
    optionMemos: {
      1: '第4類危険物が水と接触して必ず酸素を大量発生するわけではありません。',
      2: '第4類危険物には水より軽いものが多く、水に浮くものがあります。',
      3: '水が可燃性蒸気を必ず完全に吸収するわけではありません。',
      4: '水が引火点を必ず大きく下げるという説明は不適切です。',
    },
  },

  'PROP-003-003': {
    questionId: 'PROP-003-003',
    schemaVersion: 1,
    misconceptionId: 'prop.extinguish.water_soluble_foam',
    lossCategory: 'classification_confusion',
    lossTitle: '水溶性液体にも一般泡を使えると思っている',
    style: 'comparison_table',
    shortExplanation:
      'エタノールやアセトンのような水溶性液体では、一般の泡が液体に水分を奪われて壊れやすくなります。そのため、水溶性液体用泡消火剤を使う必要があります。',
    tableHeader: ['対象', '一般泡の問題', '必要な対応'],
    rows: [
      {
        cells: ['非水溶性液体', '泡が油面を覆いやすい', '一般泡が使える場合がある'],
      },
      {
        cells: ['水溶性液体', '泡の水分が奪われ、泡が消えやすい', '水溶性液体用泡を使う'],
        variant: 'correct',
      },
    ],
    optionMemos: {
      0: '主な原因は燃焼温度ではなく、水溶性液体による泡の消滅です。',
      2: '一般泡が有毒ガスを発生するからではありません。',
      3: '泡の比重が主な理由ではありません。',
      4: '蒸気が泡を化学分解するという説明ではありません。',
    },
  },

  'PROP-003-007': {
    questionId: 'PROP-003-007',
    schemaVersion: 1,
    misconceptionId: 'prop.extinguish.agent_mechanism',
    lossCategory: 'classification_confusion',
    lossTitle: '消火剤と主たる消火作用を取り違えている',
    style: 'comparison_table',
    shortExplanation:
      '泡と二酸化炭素は主に窒息作用、粉末とハロゲン化物は主に抑制作用で整理します。霧状強化液は冷却・抑制が中心であり、除去作用ではありません。',
    tableHeader: ['作用の型', '代表例', '見分け方'],
    rows: [
      {
        cells: ['窒息作用', '泡消火剤・二酸化炭素消火剤', '空気を遮断する／酸素濃度を下げる'],
        variant: 'correct',
      },
      {
        cells: ['抑制作用', '粉末消火剤・ハロゲン化物消火剤', '燃焼の連鎖反応を抑える'],
        variant: 'correct',
      },
      {
        cells: ['強化液消火剤（霧状）', '除去作用ではない', '冷却・抑制が中心'],
        variant: 'danger',
        isKey: true,
      },
    ],
    optionMemos: {
      0: '泡消火剤は油面を覆るため、窒息作用で正しい組合せです。',
      1: '二酸化炭素消火剤は酸素濃度を下げるため、窒息作用で正しい組合せです。',
      2: '粉末消火剤は燃焼の連鎖反応を抑えるため、抑制作用で正しい組合せです。',
      3: 'ハロゲン化物消火剤も抑制作用で正しい組合せです。',
    },
  },

  'PROP-002-016': {
    questionId: 'PROP-002-016',
    schemaVersion: 1,
    misconceptionId: 'prop.static.accumulation',
    lossCategory: 'property_confusion',
    lossTitle: '第4類危険物が電気をよく通すと思っている',
    style: 'process_diagram',
    shortExplanation:
      '第4類危険物には電気を通しにくい不良導体のものが多く、流動や摩擦で発生した静電気が逃げにくく蓄積しやすい点が重要です。',
    steps: [
      {
        label: '流動・摩擦・撹拌で静電気が発生する',
        note: '液体を移す、流す、ろ過する場面で起こりやすいです。',
      },
      {
        label: '不良導体なので電荷が逃げにくい',
        note: '電気をよく通すのではなく、逃げにくいことが危険です。',
      },
      {
        label: '放電火花が可燃性蒸気に着火するおそれ',
        note: '接地、流速制限、湿度管理などが対策になります。',
        variant: 'danger',
      },
    ],
    optionMemos: {
      1: '第4類危険物は必ず電気をよく通すわけではありません。むしろ不良導体が多い点が重要です。',
      2: '蒸気比重と静電気の発生しやすさは別の論点です。',
      3: '第4類危険物は引火性液体です。常温で固体になることが理由ではありません。',
      4: '第4類危険物はすべて水溶性ではありません。非水溶性のものも多くあります。',
    },
  },
};
