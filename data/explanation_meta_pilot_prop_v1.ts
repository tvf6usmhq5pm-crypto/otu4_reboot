import type { ExplanationMetaMap } from './explanation_meta_types';

export const explanationMetaPilotPropV1: ExplanationMetaMap = {
      'PROP-003-001': {
    questionId: 'PROP-003-001',
    schemaVersion: 1,
    misconceptionId: 'rod-shaped-reinforced-liquid-fire-spread',
    lossCategory: 'classification_confusion',
    lossTitle: '',
    correctAnswerLine: '正解：② 棒状の強化液を放射する消火器',
    style: 'short',
    shortExplanation: "この問題は「強化液がダメ」ではなく、「棒状放射で燃えている液体を飛散させるのがダメ」と見る問題です。粉末・二酸化炭素・泡は液面を飛び散らせにくい消火方法で、強化液も霧状なら使えます。棒状強化液は、液面に強く当たり、ベンゼン・トルエンを飛散させるおそれがあるため不適切です。",
    visualImage: {
      src: '/explanations/PROP-003-001.webp',
      alt: 'ベンゼンやトルエンの火災で棒状の強化液は液体を飛散させるため不適切で、粉末・二酸化炭素・霧状強化液・泡は使えることを示す教育図',
      aspectRatio: '4:5',
      caption: '',
    },
    optionMemos: {
      0: '消火粉末は、燃焼の連鎖反応を抑えて火を消します。液面に強い放射を当てる方法ではないため、ベンゼンやトルエン火災で使えます。',
      1: '棒状の強化液を放射すると、燃えているベンゼンやトルエンを飛散させ、火災を広げるおそれがあります。これが不適切な消火器です。',
      2: '二酸化炭素は、燃えている場所の酸素を少なくして火を消します。液体を飛散させずに消火できるため、ベンゼンやトルエン火災で使えます。',
      3: '強化液でも、霧状に放射すれば液面に強く当たりにくく、飛散を抑えられます。棒状ではなく霧状にすることがポイントです。',
      4: '泡は液面を覆って空気を遮り、可燃性蒸気が出るのを抑えます。ベンゼンやトルエンのような液体火災に有効です。',
    },
  },

    'PROP-003-002-V02': {
    questionId: 'PROP-003-002-V02',
    schemaVersion: 1,
    misconceptionId: 'prop-type4-water-jet-spreads-burning-liquid',
    lossCategory: 'classification_confusion',
    lossTitle: '',
    correctAnswerLine: "正解：① 危険物が水面に浮いて広がったり、火炎とともに流れたりするおそれがあるため。",
    style: 'short',
    shortExplanation: "この問題は、「水が使えるかどうか」ではなく、「棒状の水で燃えている液体をどう動かしてしまうか」を見る問題です。第4類危険物の多くは水より軽く、水に溶けにくいため、水をかけると水面に浮いて燃えたまま広がります。したがって、棒状注水は火災を広げるおそれがあり、不適切です。",
    visualImage: {
      src: '/explanations/PROP-003-002-V02.webp',
      alt: '第4類危険物火災で棒状の水をかけると、燃えている液体が水に浮いて広がるため不適切であることを示す図',
      aspectRatio: '4:5',
      caption: '',
    },
    optionMemos: {
      0: "危険物が水面に浮いて広がったり、火炎とともに流れたりするためです。第4類危険物の火災で棒状注水が不適切となりやすい中心理由です。",
      1: "第4類危険物すべてが水と激しく反応するわけではありません。この問題では、水との反応ではなく、燃えている液体が水面に浮いて広がる危険を見ます。",
      2: "見るべきなのは蒸気の重さではなく、液体危険物が水の上に浮いて燃えたまま広がることです。棒状注水ではこの広がりが問題になります。",
      3: "見るべきなのは蒸気の重さではなく、液体危険物が水の上に浮いて燃えたまま広がることです。棒状注水ではこの広がりが問題になります。",
      4: "この選択肢は中心理由ではありません。第4類危険物火災で棒状注水が問題になるのは、燃えている液体が水面に浮いて広がるおそれがあるためです。",
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
  'PROP-003-005': {
    questionId: 'PROP-003-005',
    schemaVersion: 1,
    misconceptionId: 'road-gasoline-fire-water-runoff-spreads',
    lossCategory: 'classification_confusion',
    lossTitle: '',
    correctAnswerLine: "正解：③ ガソリンが水に浮いたまま広がり、さらに水が側溝等を伝って油を遠方へ押し流すため。",
    style: 'short',
    shortExplanation: "この問題は、「水で冷やせるか」ではなく、「水が燃えているガソリンをどこへ運んでしまうか」を見る問題です。舗装道路では、水は低い方や側溝へ流れます。ガソリンは水に浮くため、水の流れに乗って遠方へ押し流され、火災を広げるおそれがあります。",
    visualImage: {
      src: '/explanations/PROP-003-005.webp',
      alt: '舗装道路上のガソリン火災で水をかけると、ガソリンが水に浮いて側溝へ流れ、火災を遠方へ広げる危険を示す図',
      aspectRatio: '4:5',
      caption: '',
    },
    optionMemos: {
      0: "ガソリンが水と激しく反応するという問題ではありません。水に浮いたガソリンが、燃えたまま流されることが問題です。",
      1: "道路上では水が低い方や側溝へ流れます。ガソリンは水に浮くため、その流れに乗って火災範囲を広げます。",
      2: "ガソリンは水に浮くため、水が道路や側溝へ流れると、燃えているガソリンも一緒に遠方へ押し流されます。",
      3: "ガソリンは水に溶けやすい物質ではなく、水に浮きます。水で薄まって消えるのではなく、流れに乗って広がる点で判断します。",
      4: "道路上では水が低い方や側溝へ流れます。ガソリンは水に浮くため、その流れに乗って火災範囲を広げます。",
    },
  },
  'PROP-003-006-V01': {
    questionId: 'PROP-003-006-V01',
    schemaVersion: 1,
    misconceptionId: 'water-soluble-liquid-special-foam-remains',
    lossCategory: 'classification_confusion',
    lossTitle: '',
    correctAnswerLine: "正解：① 一般の泡は消泡しやすいため、水溶性液体用泡消火剤を用いる。",
    style: 'short',
    shortExplanation: "普通の泡は、水溶性液体にふれると消えやすいです。水溶性液体用泡は、液体との間に膜を作って泡を残すため、液面を覆って火を抑えられます。",
    visualImage: {
      src: '/explanations/PROP-003-006-V01.webp',
      alt: '水溶性液体では普通の泡が消えやすく、水溶性液体用泡は膜を作って泡を残し液面を覆えることを示す図',
      aspectRatio: '4:5',
      caption: '',
    },
    optionMemos: {
      0: "普通の泡は水溶性液体で消えやすくなります。水溶性液体用泡は、液体との間に膜を作って泡を残し、液面を覆えます。",
      1: "水溶性液体では普通の泡が消えやすくなります。泡を液面に残すため、水溶性液体用泡を使います。",
      2: "泡なら何でもよいわけではありません。水溶性液体では普通の泡が消えやすいため、専用泡を使います。",
      3: "粉末や二酸化炭素の話ではありません。泡消火剤を使う場合に、普通の泡ではなく専用泡を選びます。",
      4: "水溶性液体では普通の泡が消えやすくなります。泡を液面に残すため、水溶性液体用泡を使います。",
    },
  },
  'PROP-003-006': {
    questionId: 'PROP-003-006',
    schemaVersion: 1,
    misconceptionId: 'acetone-ethyl-methyl-ketone-special-foam',
    lossCategory: 'classification_confusion',
    lossTitle: '',
    correctAnswerLine: "正解：④ アセトンやエチルメチルケトンの火災に泡消火剤を使用する場合は、水溶性液体用のものが必要である。",
    style: 'short',
    shortExplanation: "アセトンやエチルメチルケトンは、水に混ざる液体です。普通の泡はそこで消えやすいため、液面を覆い続けられません。水溶性液体用泡は膜を作って泡を残すため、火を抑えられます。",
    visualImage: {
      src: '/explanations/PROP-003-006.webp',
      alt: 'アセトンやエチルメチルケトンは水に混ざる液体で、普通の泡は消えやすく、水溶性液体用泡が必要であることを示す図',
      aspectRatio: '4:5',
      caption: '',
    },
    optionMemos: {
      0: "水に混ざる液体では普通の泡が消えやすくなります。泡を液面に残すため、水溶性液体用泡を使います。",
      1: "アセトンやエチルメチルケトンは水に混ざる液体です。普通の泡ではなく、水溶性液体用泡を選びます。",
      2: "水に混ざる液体では普通の泡が消えやすくなります。泡を液面に残すため、水溶性液体用泡を使います。",
      3: "アセトンやエチルメチルケトンは水に混ざる液体です。普通の泡は消えやすいため、水溶性液体用泡を使います。",
      4: "水に混ざる液体では普通の泡が消えやすくなります。泡を液面に残すため、水溶性液体用泡を使います。",
    },
  },
};
