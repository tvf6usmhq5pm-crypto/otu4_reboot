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
    lossTitle: '',
    correctAnswerLine: '正解：③ 危険物の取扱作業に従事する危険物取扱者は、5年に1回、保安講習を受けなければならない。',
    style: 'short',
    shortExplanation: '保安講習は、5年に1回ではありません。見るのは受講の周期で、危険物取扱作業に従事する危険物取扱者は3年以内に1回受講します。基準は免状交付日または前回講習受講日以後の最初の4月1日です。',
    visualImage: {
      src: '/explanations/LAW-011-001.webp',
      alt: '保安講習は5年ではなく3年以内に1回であることを示す法令カード画像',
      aspectRatio: '4:5',
      caption: '',
    },
    optionMemos: {
      0: '保安講習は都道府県をまたいで受講でき、免状の交付都道府県に限定されません。',
      1: '免状を持たない所有者は危険物取扱者ではないため、保安講習の受講義務者には含まれません。',
      2: '受講周期は5年ではなく、免状交付日または前回講習受講日後の最初の4月1日から3年以内です。',
      3: '丙種でも、製造所等で危険物の取扱作業に従事していれば保安講習の対象です。',
      4: '受講義務がある危険物取扱者が正当な理由なく受講しないと、免状返納命令の対象になることがあります。',
    },
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
    correctAnswerLine: '正解：③ 病院',
    style: 'facility_map',
    visualImage: {
      src: '/explanations/LAW-020-002-trap.webp',
      alt: '保安距離の対象施設と、対象外になりやすい選択肢を示す解説画像',
      aspectRatio: '4:5',
      caption: '',
    },
    supplementalImage: {
      src: '/explanations/LAW-020-002.webp',
      alt: '保安距離の対象施設と必要距離を3mから50mまで整理した一覧表',
      aspectRatio: '4:5',
      caption: '',
    },
    supplementalImageLabel: '保安距離画像を見る',
    shortExplanation:
      '保安距離は、名称の似た施設ではなく、法令が指定する対象範囲で切り分けます。架空か埋設か、敷地外か同一敷地内か、学校の範囲はどこまでかを条件まで確認します。',
    facilityItems: [
      {
        label: '病院・幼稚園・保育園〜高校・劇場等',
        status: 'target',
        distance: '30m以上',
        isKey: true,
      },
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
    optionMemos: {
      0: '保安距離50m以上の対象は、重要文化財等そのものに当たる建造物です。',
      1: '保安距離の対象となる電線は、7,000Vを超える特別高圧架空電線です。',
      2: '病院は、多人数を収容する施設として30m以上の保安距離が必要です。',
      3: '住居は、製造所等の敷地外にあるものが10m以上の保安距離の対象です。',
      4: '学校の30m対象は幼稚園から高等学校までで、大学・短期大学は対象範囲の外です。',
    },
    reviewCtaLabel: '保安距離をもう1問',
  },

  'LAW-010-010': {
    questionId: 'LAW-010-010',
    schemaVersion: 1,
    misconceptionId: 'law.license.return_order_authority',
    lossCategory: 'procedure_confusion',
    lossTitle: '',
    correctAnswerLine: '正解：② 都道府県知事',
    visualImage: {
      src: '/explanations/LAW-010-010.webp',
      alt: '免状返納命令は都道府県知事が行うことを示す法令カード画像',
      aspectRatio: '4:5',
      caption: '',
    },
    style: 'short',
    shortExplanation:
      '危険物取扱者免状の交付者は都道府県知事です。したがって、免状の返納命令も都道府県知事が行います。',
    optionMemos: {
      0: '消防長は、消防本部の事務を統括する職です。',
      1: '都道府県知事は危険物取扱者免状を交付し、返納を命じることができます。',
      2: '消防庁長官は、消防行政を所管する国の機関です。',
      3: '消防署長は、免状返納命令を行う者ではありません。',
      4: '市町村長等は、製造所等の施設に関する権限を担います。',
    },
    reviewCtaLabel: '免状手続きをもう1問',
  },
  'LAW-028-005': {
    questionId: 'LAW-028-005',
    schemaVersion: 1,
    misconceptionId: 'law.mobile_tank.ignition_point',
    lossCategory: 'number_confusion',
    lossTitle: '',
    correctAnswerLine: '正解：③ 40℃未満',
    style: 'short',
    visualImage: {
      src: '/explanations/LAW-028-005.webp',
      alt: '引火点40℃未満の危険物を注入するとき原動機停止することを示す法令カード画像',
      aspectRatio: '4:5',
      caption: '',
    },
    shortExplanation:
      '引火点が低い危険物ほど、蒸気に引火する危険があります。移動タンク貯蔵所から注入するときは、引火点40℃未満の危険物で原動機を停止します。',
    optionMemos: {
      0: '引火点30℃は40℃未満に含まれる温度です。',
      1: '引火点35℃は40℃未満に含まれる温度です。',
      2: '引火点40℃未満の危険物を注入するときは原動機を停止します。',
      3: '引火点45℃は40℃未満の基準には該当しません。',
      4: '引火点50℃は40℃未満の基準には該当しません。',
    },
    reviewCtaLabel: '移動タンク貯蔵所をもう1問',
  },
  'LAW-036-010': {
    questionId: 'LAW-036-010',
    schemaVersion: 1,
    misconceptionId: 'law.transport.mixed_loading_prohibition',
    lossCategory: 'classification_confusion',
    lossTitle: '',
    correctAnswerLine: '正解：④ 第1類危険物と第4類危険物',
    style: 'short',
    visualImage: {
      src: '/explanations/LAW-036-010.webp',
      alt: '第1類の酸化性固体と第4類の引火性液体を同じ車両に混載できないことを示す画像',
      aspectRatio: '4:5',
      caption: '',
    },
    shortExplanation:
      '第1類は燃焼を助ける酸化性固体、第4類は蒸気が燃える引火性液体です。燃焼を助ける側と燃える側を同じ車両に積むと火災が拡大しやすいため、この組合せは混載禁止です。',
    optionMemos: {
      0: '第5類は自己反応性物質で、加熱や衝撃による反応に注意します。',
      1: '第4類は引火性液体で、液体から発生する蒸気が燃えます。',
      2: '第2類は可燃性固体で、火気による着火に注意する危険物です。',
      3: '第1類は酸化性固体、第4類は引火性液体で、この組合せは混載禁止です。',
      4: '第3類には、自然発火性物質や禁水性物質が含まれます。',
    },
  },

  'LAW-037-006': {
    questionId: 'LAW-037-006',
    schemaVersion: 1,
    misconceptionId: 'law.extinguisher.class4.water',
    lossCategory: 'classification_confusion',
    lossTitle: '',
    correctAnswerLine: '正解：⑤ 第4類、第5類、第6類の危険物 ── 水消火器（棒状）',
    style: 'short',
    visualImage: {
      src: '/explanations/LAW-037-006.webp',
      alt: '第4類危険物火災に棒状の水を使用すると危険であることを示す画像',
      aspectRatio: '4:5',
      caption: '',
    },
    shortExplanation:
      '第4類危険物の多くは水より軽く、水をかけると燃えている液体が広がる危険があります。そのため棒状の水は適応しません。',
    optionMemos: {
      0: '強化液消火器（霧状）は第4類、第5類、第6類の火災に適応します。',
      1: '二酸化炭素消火器は第4類危険物の火災に適応します。',
      2: '泡消火器は第4類、第5類、第6類の火災に適応します。',
      3: '粉末消火器（炭酸水素塩類等）は第4類危険物の火災に適応します。',
      4: '棒状の水は第4類危険物の火災には使用しません。',
    },
    reviewCtaLabel: '消火設備をもう1問',
  },


  'LAW-037-010': {
    questionId: 'LAW-037-010',
    schemaVersion: 1,
    misconceptionId: 'law.extinguisher.required_unit',
    lossCategory: 'classification_confusion',
    lossTitle: '',
    correctAnswerLine: '正解：⑤ 危険物は、指定数量の100倍を1所要単位とする。',
    highlightTerms: ['消火能力の量'],
    style: 'short',
    visualImage: {
      src: '/explanations/LAW-037-010.webp',
      alt: '危険物の指定数量10倍を1所要単位として必要な消火能力を考える画像',
      aspectRatio: '4:5',
      caption: '',
    },
    shortExplanation:
      '所要単位とは、火災に備えて必要となる「消火能力の量」です。危険物の量が増えるほど必要な消火能力も増えるため、危険物は指定数量10倍を1所要単位として計算します。',
    optionMemos: {
      0: '耐火構造の製造所の建築物は、延べ面積100㎡を1所要単位として計算します。',
      1: '耐火構造でない製造所の建築物は、延べ面積50㎡を1所要単位として計算します。',
      2: '耐火構造の貯蔵所の建築物は、延べ面積150㎡を1所要単位として計算します。',
      3: '耐火構造でない貯蔵所の建築物は、延べ面積75㎡を1所要単位として計算します。',
      4: '危険物は指定数量10倍を1所要単位として計算します。',
    },
    reviewCtaLabel: '消火設備計算をもう1問',
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
    optionMemos: {
      0: '第4類は引火性液体で、動植物油類も第4類です。正しい組合せなので、誤りではありません。',
      1: '第5類は自己反応性物質で、硝酸エステル類も第5類です。正しい組合せです。',
      3: '第1類は酸化性固体で、過塩素酸塩類も第1類です。正しい組合せです。',
      4: '第6類は酸化性液体で、過酸化水素も第6類です。正しい組合せです。',
    },
    reviewCtaLabel: '類別をもう1問',
  },
  'LAW-015-005': {
    questionId: 'LAW-015-005',
    schemaVersion: 1,
    misconceptionId: 'law.prevention-regulation.supervisor-author-confusion',
    lossCategory: 'scope_confusion',
    lossTitle: '',
    correctAnswerLine: '正解：③ 予防規程は、当該製造所等の危険物保安監督者が作成し、認可を受けなければならない。',
    style: 'short',
    shortExplanation: '予防規程を作成するのは、危険物保安監督者ではなく所有者等です。見るのは「だれが作るか」で、認可を受ける相手は市町村長等です。保安監督者は現場の監督役であり、予防規程の作成者ではありません。',
    visualImage: {
      src: '/explanations/LAW-015-005.webp',
      alt: '予防規程は所有者等が作成し市町村長等が認可することを示す法令カード画像',
      aspectRatio: '4:5',
      caption: '',
    },
    optionMemos: {
      0: '地震発生時の施設・設備の点検や応急措置は、予防規程に定める事項に含まれます。',
      1: '予防規程を定める場合や変更する場合は、市町村長等の認可を受けなければなりません。',
      2: '予防規程の作成者は所有者等であり、危険物保安監督者ではありません。',
      3: '災害その他の非常時に取るべき措置も、予防規程に定める事項です。',
      4: '火災予防上必要があるときは、市町村長等から予防規程の変更を命ぜられることがあります。',
    },
  },
  'LAW-006-002': {
    questionId: 'LAW-006-002',
    schemaVersion: 1,
    misconceptionId: 'law.permission_authority_area_confusion',
    lossCategory: 'scope_confusion',
    lossTitle: '',
    correctAnswerLine: '正解：③ A:市町村長 ／ B:都道府県知事 ／ C:完成検査',
    style: 'short',
    shortExplanation: '設置許可を出す者は、消防体制が整った地域かどうかで変わります。消防本部及び消防署を置く市町村では市町村長、それ以外の区域では都道府県知事が許可します。工事完了後は完成検査を受けます。',
    visualImage: {
      src: '/explanations/LAW-006-002.webp',
      alt: '消防本部の有無による許可権者と完成検査を示す法令カード画像',
      aspectRatio: '4:5',
      caption: '',
    },
    optionMemos: {
      0: '消防本部及び消防署を置く市町村では、市町村長が設置許可を行います。',
      1: '消防体制がないその他の区域では、都道府県知事が許可します。',
      2: '工事完了後は、技術上の基準に適合しているか完成検査を受けます。',
      3: '消防署長は設置許可を行う権者ではありません。',
      4: '許可権者は施設の種類や区域によって確認します。',
    },
  },
  'LAW-006-005': {
    questionId: 'LAW-006-005',
    schemaVersion: 1,
    misconceptionId: 'law.temporary_use_condition_confusion',
    lossCategory: 'scope_confusion',
    lossTitle: '',
    correctAnswerLine: '正解：④ 変更工事に係る部分以外の部分について市町村長等の承認を受け、完成検査前に使用すること。',
    style: 'short',
    shortExplanation: '仮使用は、変更工事に係る部分以外を市町村長等の承認を受けて完成検査前に使用する制度です。工事中の部分を使用する制度ではありません。工事していない部分を使う条件として整理します。',
    visualImage: {
      src: '/explanations/LAW-006-005.webp',
      alt: '変更工事部分と仮使用できる部分を示す法令カード画像',
      aspectRatio: '4:5',
      caption: '',
    },
    optionMemos: {
      0: '変更工事に係る部分以外は、承認を受けることで仮使用できます。',
      1: '変更工事中の部分は、完成検査前に使用することはできません。',
      2: '仮使用は完成検査前の一時的な使用を認める制度です。',
      3: '仮使用は施設変更時の制度で、仮貯蔵や仮取扱いとは異なります。',
      4: '市町村長等の承認を受けることが仮使用の条件です。',
    },
  },
  'LAW-006-002-V02': {
    questionId: 'LAW-006-002-V02',
    schemaVersion: 1,
    misconceptionId: 'law.permission_authority_scope_case_confusion',
    lossCategory: 'scope_confusion',
    lossTitle: '',
    correctAnswerLine: '正解：② A:市町村長 B:都道府県知事 C:都道府県知事',
    style: 'short',
    shortExplanation: '消防本部及び消防署を置く市町村では市町村長、消防本部等を置かない区域や複数市町村にまたがる移送取扱所では都道府県知事が許可します。消防体制が地域対応か広域対応かで判断します。',
    visualImage: {
      src: '/explanations/LAW-006-002-V02.webp',
      alt: '消防体制と設置許可権者の判断を示す法令カード画像',
      aspectRatio: '4:5',
      caption: '',
    },
    optionMemos: {
      0: '消防本部及び消防署を置く市の区域では市町村長です。',
      1: '消防本部及び消防署を置かない区域では都道府県知事です。',
      2: '複数市町村にまたがる移送取扱所は都道府県知事です。',
      3: '消防長や消防署長は設置許可権者ではありません。',
      4: '総務大臣ではありません。',
    },
  },

};



