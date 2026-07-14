'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from 'react';

export type ReviewQuestion = {
  id: string;
  subject:
    | 'law'
    | 'phys'
    | 'prop';
  star: 0 | 1 | 2 | 3;
  difficulty: 1 | 2 | 3;
  itemName: string;
  question: string;
  options: string[];
  explanation: string;
  optionDetails: string[];
  questionLength: number;
  optionLengths: number[];
  explanationLength: number;
  optionDetailLengths: number[];
  hasImage: boolean;
  metaKind:
    | 'explicit'
    | 'default';
};

type ReviewStatus =
  | 'unreviewed'
  | 'reviewed'
  | 'needs-fix';

type ReviewStatusMap =
  Record<string, ReviewStatus>;

type SubjectFilter =
  | 'all'
  | ReviewQuestion['subject'];

type StarFilter =
  | 'all'
  | '0'
  | '1'
  | '2'
  | '3';

type ImageFilter =
  | 'all'
  | 'with-image'
  | 'without-image';

type MetaFilter =
  | 'all'
  | ReviewQuestion['metaKind'];

type StatusFilter =
  | 'all'
  | ReviewStatus;

type WarningItem = {
  label: string;
  value: number;
  limit: number;
};

const STATUS_STORAGE_KEY =
  'z4-question-review-status-v1';

const QUESTION_WARNING_LIMIT = 100;
const OPTION_WARNING_LIMIT = 80;
const EXPLANATION_WARNING_LIMIT = 220;
const OPTION_DETAIL_WARNING_LIMIT = 120;

const SUBJECT_LABELS = {
  law: '法令',
  phys: '物理・化学',
  prop: '性質・消火',
} as const;

const STATUS_LABELS = {
  unreviewed: '未確認',
  reviewed: '確認済み',
  'needs-fix': '要修正',
} as const;

function isReviewStatus(
  value: unknown,
): value is ReviewStatus {
  return (
    value === 'unreviewed' ||
    value === 'reviewed' ||
    value === 'needs-fix'
  );
}

function readStoredStatuses(): ReviewStatusMap {
  if (
    typeof window ===
    'undefined'
  ) {
    return {};
  }

  const raw =
    window.localStorage.getItem(
      STATUS_STORAGE_KEY,
    );

  if (!raw) {
    return {};
  }

  try {
    const parsed: unknown =
      JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !==
        'object'
    ) {
      return {};
    }

    const result:
      ReviewStatusMap = {};

    for (
      const [
        questionId,
        value,
      ] of Object.entries(
        parsed as Record<
          string,
          unknown
        >,
      )
    ) {
      if (
        isReviewStatus(value)
      ) {
        result[questionId] =
          value;
      }
    }

    return result;
  } catch {
    return {};
  }
}

function getStatus(
  statusMap: ReviewStatusMap,
  questionId: string,
): ReviewStatus {
  return (
    statusMap[questionId] ??
    'unreviewed'
  );
}

function maximum(
  values: number[],
): number {
  if (values.length === 0) {
    return 0;
  }

  return Math.max(...values);
}

function buildWarnings(
  question: ReviewQuestion,
): WarningItem[] {
  const warnings:
    WarningItem[] = [];

  const maxOptionLength =
    maximum(
      question.optionLengths,
    );

  const maxDetailLength =
    maximum(
      question.optionDetailLengths,
    );

  if (
    question.questionLength >
    QUESTION_WARNING_LIMIT
  ) {
    warnings.push({
      label: '問題文',
      value:
        question.questionLength,
      limit:
        QUESTION_WARNING_LIMIT,
    });
  }

  if (
    maxOptionLength >
    OPTION_WARNING_LIMIT
  ) {
    warnings.push({
      label: '最長選択肢',
      value: maxOptionLength,
      limit:
        OPTION_WARNING_LIMIT,
    });
  }

  if (
    question.explanationLength >
    EXPLANATION_WARNING_LIMIT
  ) {
    warnings.push({
      label: '解説',
      value:
        question.explanationLength,
      limit:
        EXPLANATION_WARNING_LIMIT,
    });
  }

  if (
    maxDetailLength >
    OPTION_DETAIL_WARNING_LIMIT
  ) {
    warnings.push({
      label:
        '最長選択肢解説',
      value: maxDetailLength,
      limit:
        OPTION_DETAIL_WARNING_LIMIT,
    });
  }

  return warnings;
}

function matchesSearch(
  question: ReviewQuestion,
  searchText: string,
): boolean {
  const normalized =
    searchText
      .trim()
      .toLocaleLowerCase();

  if (!normalized) {
    return true;
  }

  return [
    question.id,
    question.itemName,
    question.question,
    question.explanation,
    ...question.options,
    ...question.optionDetails,
  ].some(
    (value) =>
      value
        .toLocaleLowerCase()
        .includes(normalized),
  );
}

function statusButtonStyle(
  active: boolean,
  status: ReviewStatus,
): CSSProperties {
  const backgrounds = {
    unreviewed:
      active
        ? '#E8EEF7'
        : '#FFFFFF',
    reviewed:
      active
        ? '#DDF4E8'
        : '#FFFFFF',
    'needs-fix':
      active
        ? '#FCE2DE'
        : '#FFFFFF',
  };

  const borders = {
    unreviewed: '#9AA9BD',
    reviewed: '#5A9C76',
    'needs-fix': '#C7685F',
  };

  return {
    ...statusButtonBaseStyle,
    background:
      backgrounds[status],
    borderColor:
      borders[status],
    fontWeight:
      active
        ? 800
        : 600,
  };
}

export default function QuestionReviewClient({
  questions,
}: {
  questions:
    ReviewQuestion[];
}) {
  const [
    subjectFilter,
    setSubjectFilter,
  ] =
    useState<SubjectFilter>(
      'all',
    );

  const [
    starFilter,
    setStarFilter,
  ] =
    useState<StarFilter>(
      'all',
    );

  const [
    imageFilter,
    setImageFilter,
  ] =
    useState<ImageFilter>(
      'all',
    );

  const [
    metaFilter,
    setMetaFilter,
  ] =
    useState<MetaFilter>(
      'all',
    );

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<StatusFilter>(
      'all',
    );

  const [
    searchText,
    setSearchText,
  ] =
    useState('');

  const [
    statusMap,
    setStatusMap,
  ] =
    useState<ReviewStatusMap>(
      {},
    );

  const [
    storageReady,
    setStorageReady,
  ] =
    useState(false);

  const [
    selectedId,
    setSelectedId,
  ] =
    useState(
      questions[0]?.id ?? '',
    );

  useEffect(() => {
    setStatusMap(
      readStoredStatuses(),
    );

    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    window.localStorage.setItem(
      STATUS_STORAGE_KEY,
      JSON.stringify(
        statusMap,
      ),
    );
  }, [
    statusMap,
    storageReady,
  ]);

  useEffect(() => {
    const requestedId =
      new URLSearchParams(
        window.location.search,
      ).get('id');

    if (
      requestedId &&
      questions.some(
        (question) =>
          question.id ===
          requestedId,
      )
    ) {
      setSelectedId(
        requestedId,
      );
    }
  }, [questions]);

  const filteredQuestions =
    useMemo(
      () =>
        questions.filter(
          (question) => {
            if (
              subjectFilter !==
                'all' &&
              question.subject !==
                subjectFilter
            ) {
              return false;
            }

            if (
              starFilter !==
                'all' &&
              question.star !==
                Number(
                  starFilter,
                )
            ) {
              return false;
            }

            if (
              imageFilter ===
                'with-image' &&
              !question.hasImage
            ) {
              return false;
            }

            if (
              imageFilter ===
                'without-image' &&
              question.hasImage
            ) {
              return false;
            }

            if (
              metaFilter !==
                'all' &&
              question.metaKind !==
                metaFilter
            ) {
              return false;
            }

            const status =
              getStatus(
                statusMap,
                question.id,
              );

            if (
              statusFilter !==
                'all' &&
              status !==
                statusFilter
            ) {
              return false;
            }

            return matchesSearch(
              question,
              searchText,
            );
          },
        ),
      [
        questions,
        subjectFilter,
        starFilter,
        imageFilter,
        metaFilter,
        statusFilter,
        searchText,
        statusMap,
      ],
    );

  useEffect(() => {
    if (
      filteredQuestions.length ===
      0
    ) {
      setSelectedId('');
      return;
    }

    const stillVisible =
      filteredQuestions.some(
        (question) =>
          question.id ===
          selectedId,
      );

    if (!stillVisible) {
      setSelectedId(
        filteredQuestions[0].id,
      );
    }
  }, [
    filteredQuestions,
    selectedId,
  ]);

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    const url =
      new URL(
        window.location.href,
      );

    url.searchParams.set(
      'id',
      selectedId,
    );

    window.history.replaceState(
      null,
      '',
      url,
    );
  }, [selectedId]);

  const selectedIndex =
    Math.max(
      0,
      filteredQuestions.findIndex(
        (question) =>
          question.id ===
          selectedId,
      ),
    );

  const selectedQuestion =
    filteredQuestions[
      selectedIndex
    ];

  const globalIndex =
    selectedQuestion
      ? questions.findIndex(
          (question) =>
            question.id ===
            selectedQuestion.id,
        )
      : -1;

  const warnings =
    selectedQuestion
      ? buildWarnings(
          selectedQuestion,
        )
      : [];

  const statusCounts =
    useMemo(() => {
      const counts = {
        unreviewed: 0,
        reviewed: 0,
        'needs-fix': 0,
      };

      for (
        const question of questions
      ) {
        counts[
          getStatus(
            statusMap,
            question.id,
          )
        ]++;
      }

      return counts;
    }, [
      questions,
      statusMap,
    ]);

  const move = useCallback(
    (offset: number) => {
      if (
        filteredQuestions.length ===
        0
      ) {
        return;
      }

      const current =
        filteredQuestions.findIndex(
          (question) =>
            question.id ===
            selectedId,
        );

      const nextIndex =
        Math.min(
          filteredQuestions.length -
            1,
          Math.max(
            0,
            (
              current >= 0
                ? current
                : 0
            ) + offset,
          ),
        );

      setSelectedId(
        filteredQuestions[
          nextIndex
        ].id,
      );
    },
    [
      filteredQuestions,
      selectedId,
    ],
  );

  useEffect(() => {
    const onKeyDown = (
      event: KeyboardEvent,
    ) => {
      const target =
        event.target as
          | HTMLElement
          | null;

      const tagName =
        target?.tagName
          ?.toLowerCase();

      if (
        tagName === 'input' ||
        tagName === 'select' ||
        tagName ===
          'textarea'
      ) {
        return;
      }

      if (
        event.key ===
        'ArrowLeft'
      ) {
        event.preventDefault();
        move(-1);
      }

      if (
        event.key ===
        'ArrowRight'
      ) {
        event.preventDefault();
        move(1);
      }
    };

    window.addEventListener(
      'keydown',
      onKeyDown,
    );

    return () => {
      window.removeEventListener(
        'keydown',
        onKeyDown,
      );
    };
  }, [move]);

  function setQuestionStatus(
    status: ReviewStatus,
  ) {
    if (!selectedQuestion) {
      return;
    }

    setStatusMap(
      (current) => ({
        ...current,
        [selectedQuestion.id]:
          status,
      }),
    );
  }

  function clearFilters() {
    setSubjectFilter('all');
    setStarFilter('all');
    setImageFilter('all');
    setMetaFilter('all');
    setStatusFilter('all');
    setSearchText('');
  }

  function jumpToPosition(
    value: string,
  ) {
    const position =
      Number(value);

    if (
      !Number.isInteger(
        position,
      )
    ) {
      return;
    }

    const index =
      position - 1;

    if (
      index < 0 ||
      index >=
        filteredQuestions.length
    ) {
      return;
    }

    setSelectedId(
      filteredQuestions[
        index
      ].id,
    );
  }

  return (
    <main style={pageStyle}>
      <header style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>
            Z4 QUALITY REVIEW
          </p>

          <h1 style={titleStyle}>
            全701問レビュー
          </h1>

          <p style={subtitleStyle}>
            実際のクイズ表示を順番に確認し、長文・解説・表示崩れを記録します。
          </p>
        </div>

        <div style={progressSummaryStyle}>
          <strong>
            確認済み
            {' '}
            {statusCounts.reviewed}
            {' / '}
            {questions.length}
          </strong>

          <span>
            要修正
            {' '}
            {statusCounts['needs-fix']}
          </span>

          <span>
            未確認
            {' '}
            {statusCounts.unreviewed}
          </span>
        </div>
      </header>

      <section style={filterPanelStyle}>
        <label style={fieldStyle}>
          <span style={fieldLabelStyle}>
            科目
          </span>

          <select
            value={subjectFilter}
            onChange={(event) =>
              setSubjectFilter(
                event.target
                  .value as
                  SubjectFilter,
              )
            }
            style={controlStyle}
          >
            <option value="all">
              全科目
            </option>
            <option value="law">
              法令
            </option>
            <option value="phys">
              物理・化学
            </option>
            <option value="prop">
              性質・消火
            </option>
          </select>
        </label>

        <label style={fieldStyle}>
          <span style={fieldLabelStyle}>
            ★
          </span>

          <select
            value={starFilter}
            onChange={(event) =>
              setStarFilter(
                event.target
                  .value as
                  StarFilter,
              )
            }
            style={controlStyle}
          >
            <option value="all">
              すべて
            </option>
            <option value="3">
              ★★★
            </option>
            <option value="2">
              ★★
            </option>
            <option value="1">
              ★
            </option>
            <option value="0">
              星なし
            </option>
          </select>
        </label>

        <label style={fieldStyle}>
          <span style={fieldLabelStyle}>
            画像
          </span>

          <select
            value={imageFilter}
            onChange={(event) =>
              setImageFilter(
                event.target
                  .value as
                  ImageFilter,
              )
            }
            style={controlStyle}
          >
            <option value="all">
              すべて
            </option>
            <option value="with-image">
              画像あり
            </option>
            <option value="without-image">
              画像なし
            </option>
          </select>
        </label>

        <label style={fieldStyle}>
          <span style={fieldLabelStyle}>
            meta
          </span>

          <select
            value={metaFilter}
            onChange={(event) =>
              setMetaFilter(
                event.target
                  .value as
                  MetaFilter,
              )
            }
            style={controlStyle}
          >
            <option value="all">
              すべて
            </option>
            <option value="explicit">
              個別meta
            </option>
            <option value="default">
              標準meta
            </option>
          </select>
        </label>

        <label style={fieldStyle}>
          <span style={fieldLabelStyle}>
            確認状態
          </span>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target
                  .value as
                  StatusFilter,
              )
            }
            style={controlStyle}
          >
            <option value="all">
              すべて
            </option>
            <option value="unreviewed">
              未確認
            </option>
            <option value="reviewed">
              確認済み
            </option>
            <option value="needs-fix">
              要修正
            </option>
          </select>
        </label>

        <label style={searchFieldStyle}>
          <span style={fieldLabelStyle}>
            ID・文章検索
          </span>

          <input
            value={searchText}
            onChange={(event) =>
              setSearchText(
                event.target.value,
              )
            }
            placeholder="LAW-006、保安距離など"
            style={controlStyle}
          />
        </label>

        <button
          type="button"
          onClick={clearFilters}
          style={clearButtonStyle}
        >
          フィルター解除
        </button>
      </section>

      <section style={navigationStyle}>
        <button
          type="button"
          onClick={() =>
            move(-1)
          }
          disabled={
            selectedIndex <= 0
          }
          style={navigationButtonStyle}
        >
          ← 前の問題
        </button>

        <div style={positionStyle}>
          <label style={positionInputWrapStyle}>
            <input
              type="number"
              min={1}
              max={
                filteredQuestions.length
              }
              value={
                filteredQuestions.length
                  ? selectedIndex + 1
                  : ''
              }
              onChange={(event) =>
                jumpToPosition(
                  event.target.value,
                )
              }
              style={positionInputStyle}
            />

            <span>
              / {filteredQuestions.length}
            </span>
          </label>

          <span style={globalPositionStyle}>
            全体
            {' '}
            {globalIndex >= 0
              ? globalIndex + 1
              : 0}
            {' / '}
            {questions.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() =>
            move(1)
          }
          disabled={
            selectedIndex >=
            filteredQuestions.length -
              1
          }
          style={navigationButtonStyle}
        >
          次の問題 →
        </button>
      </section>

      {!selectedQuestion ? (
        <section style={emptyStyle}>
          条件に一致する問題がありません。
        </section>
      ) : (
        <>
          <section style={reviewPanelStyle}>
            <div style={questionMetaStyle}>
              <strong style={questionIdStyle}>
                {selectedQuestion.id}
              </strong>

              <span style={tagStyle}>
                {SUBJECT_LABELS[
                  selectedQuestion.subject
                ]}
              </span>

              <span style={tagStyle}>
                {'★'.repeat(
                  selectedQuestion.star,
                ) || '星なし'}
              </span>

              <span style={tagStyle}>
                難易度
                {' '}
                {selectedQuestion.difficulty}
              </span>

              <span style={tagStyle}>
                {selectedQuestion.metaKind ===
                'explicit'
                  ? '個別meta'
                  : '標準meta'}
              </span>

              <span style={tagStyle}>
                {selectedQuestion.hasImage
                  ? '画像あり'
                  : '画像なし'}
              </span>
            </div>

            <p style={itemNameStyle}>
              {selectedQuestion.itemName}
            </p>

            <div style={metricGridStyle}>
              <div style={metricStyle}>
                <span>問題文</span>
                <strong>
                  {selectedQuestion.questionLength}
                  字
                </strong>
              </div>

              <div style={metricStyle}>
                <span>最長選択肢</span>
                <strong>
                  {maximum(
                    selectedQuestion.optionLengths,
                  )}
                  字
                </strong>
              </div>

              <div style={metricStyle}>
                <span>解説</span>
                <strong>
                  {selectedQuestion.explanationLength}
                  字
                </strong>
              </div>

              <div style={metricStyle}>
                <span>最長選択肢解説</span>
                <strong>
                  {maximum(
                    selectedQuestion.optionDetailLengths,
                  )}
                  字
                </strong>
              </div>
            </div>

            <div style={optionLengthStyle}>
              {selectedQuestion.optionLengths.map(
                (
                  length,
                  index,
                ) => (
                  <span
                    key={index}
                    style={
                      length >
                      OPTION_WARNING_LIMIT
                        ? warningLengthStyle
                        : normalLengthStyle
                    }
                  >
                    選択肢
                    {index + 1}
                    ：
                    {length}
                    字
                  </span>
                ),
              )}
            </div>

            {warnings.length > 0 ? (
              <div style={warningBoxStyle}>
                <strong>
                  長文警告
                </strong>

                <div style={warningListStyle}>
                  {warnings.map(
                    (warning) => (
                      <span
                        key={warning.label}
                        style={warningPillStyle}
                      >
                        {warning.label}
                        {' '}
                        {warning.value}
                        字
                        {' / 基準 '}
                        {warning.limit}
                        字
                      </span>
                    ),
                  )}
                </div>
              </div>
            ) : (
              <div style={safeBoxStyle}>
                長文警告なし
              </div>
            )}

            <div style={statusActionsStyle}>
              {(
                [
                  'unreviewed',
                  'reviewed',
                  'needs-fix',
                ] as const
              ).map(
                (status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() =>
                      setQuestionStatus(
                        status,
                      )
                    }
                    style={statusButtonStyle(
                      getStatus(
                        statusMap,
                        selectedQuestion.id,
                      ) === status,
                      status,
                    )}
                  >
                    {STATUS_LABELS[
                      status
                    ]}
                  </button>
                ),
              )}

              <a
                href={
                  '/dev/explanation-preview?questionId=' +
                  encodeURIComponent(
                    selectedQuestion.id,
                  )
                }
                target="_blank"
                rel="noreferrer"
                style={openLinkStyle}
              >
                別タブで開く ↗
              </a>
            </div>
          </section>

          <section style={previewSectionStyle}>
            <div style={previewHeaderStyle}>
              <strong>
                実際のクイズ表示
              </strong>

              <span>
                ← / → キーでも移動できます
              </span>
            </div>

            <iframe
              key={selectedQuestion.id}
              title={
                selectedQuestion.id +
                ' review preview'
              }
              src={
                '/dev/explanation-preview?questionId=' +
                encodeURIComponent(
                  selectedQuestion.id,
                )
              }
              style={iframeStyle}
            />
          </section>
        </>
      )}
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  background: '#F4F7FA',
  color: '#203047',
  padding: '24px',
  fontFamily:
    '"Noto Sans JP", "Yu Gothic", "Hiragino Kaku Gothic ProN", sans-serif',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  justifyContent:
    'space-between',
  alignItems: 'flex-start',
  gap: 24,
  maxWidth: 1500,
  margin: '0 auto 20px',
};

const eyebrowStyle: CSSProperties = {
  margin: 0,
  color: '#58708D',
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '0.12em',
};

const titleStyle: CSSProperties = {
  margin: '6px 0',
  fontSize: 30,
  lineHeight: 1.25,
};

const subtitleStyle: CSSProperties = {
  margin: 0,
  color: '#617187',
  lineHeight: 1.7,
};

const progressSummaryStyle: CSSProperties = {
  display: 'grid',
  gap: 6,
  minWidth: 210,
  padding: '14px 16px',
  border: '1px solid #CCD7E4',
  borderRadius: 14,
  background: '#FFFFFF',
  fontSize: 14,
};

const filterPanelStyle: CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 10,
  display: 'grid',
  gridTemplateColumns:
    'repeat(auto-fit, minmax(130px, 1fr))',
  gap: 10,
  maxWidth: 1500,
  margin: '0 auto 14px',
  padding: 14,
  border: '1px solid #C8D3E0',
  borderRadius: 16,
  background:
    'rgba(255, 255, 255, 0.97)',
  boxShadow:
    '0 8px 24px rgba(44, 63, 86, 0.08)',
};

const fieldStyle: CSSProperties = {
  display: 'grid',
  gap: 5,
};

const searchFieldStyle: CSSProperties = {
  ...fieldStyle,
  gridColumn:
    'span 2',
};

const fieldLabelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  color: '#62748B',
};

const controlStyle: CSSProperties = {
  width: '100%',
  minHeight: 40,
  boxSizing: 'border-box',
  border: '1px solid #B9C7D7',
  borderRadius: 9,
  background: '#FFFFFF',
  color: '#203047',
  padding: '7px 10px',
  fontSize: 14,
};

const clearButtonStyle: CSSProperties = {
  alignSelf: 'end',
  minHeight: 40,
  border: '1px solid #879BB2',
  borderRadius: 9,
  background: '#EDF2F7',
  color: '#334B68',
  fontWeight: 700,
  cursor: 'pointer',
};

const navigationStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns:
    'minmax(120px, 1fr) auto minmax(120px, 1fr)',
  alignItems: 'center',
  gap: 12,
  maxWidth: 1500,
  margin: '0 auto 14px',
};

const navigationButtonStyle: CSSProperties = {
  minHeight: 44,
  border: '1px solid #7890AA',
  borderRadius: 11,
  background: '#FFFFFF',
  color: '#294563',
  fontWeight: 800,
  cursor: 'pointer',
};

const positionStyle: CSSProperties = {
  display: 'grid',
  justifyItems: 'center',
  gap: 3,
};

const positionInputWrapStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontWeight: 800,
};

const positionInputStyle: CSSProperties = {
  width: 76,
  padding: '7px 8px',
  border: '1px solid #AEBED0',
  borderRadius: 8,
  textAlign: 'center',
  fontWeight: 800,
};

const globalPositionStyle: CSSProperties = {
  color: '#6A7C92',
  fontSize: 12,
};

const reviewPanelStyle: CSSProperties = {
  maxWidth: 1500,
  margin: '0 auto 14px',
  padding: 18,
  border: '1px solid #C7D4E2',
  borderRadius: 16,
  background: '#FFFFFF',
};

const questionMetaStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 8,
};

const questionIdStyle: CSSProperties = {
  marginRight: 4,
  fontSize: 17,
};

const tagStyle: CSSProperties = {
  display: 'inline-flex',
  padding: '4px 8px',
  borderRadius: 999,
  background: '#EAF0F6',
  color: '#415B78',
  fontSize: 12,
  fontWeight: 700,
};

const itemNameStyle: CSSProperties = {
  margin: '10px 0 14px',
  color: '#53677E',
  fontWeight: 700,
};

const metricGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(auto-fit, minmax(130px, 1fr))',
  gap: 8,
};

const metricStyle: CSSProperties = {
  display: 'grid',
  gap: 3,
  padding: '10px 12px',
  borderRadius: 10,
  background: '#F4F7FA',
  fontSize: 12,
};

const optionLengthStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 7,
  marginTop: 10,
};

const normalLengthStyle: CSSProperties = {
  padding: '4px 8px',
  borderRadius: 999,
  background: '#EEF3F7',
  color: '#50647B',
  fontSize: 11,
};

const warningLengthStyle: CSSProperties = {
  ...normalLengthStyle,
  background: '#FCE3DE',
  color: '#A14C43',
  fontWeight: 800,
};

const warningBoxStyle: CSSProperties = {
  display: 'grid',
  gap: 8,
  marginTop: 12,
  padding: 12,
  border: '1px solid #E0A198',
  borderRadius: 10,
  background: '#FFF2EF',
  color: '#91483F',
};

const warningListStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 7,
};

const warningPillStyle: CSSProperties = {
  padding: '4px 8px',
  borderRadius: 999,
  background: '#FFFFFF',
  fontSize: 12,
  fontWeight: 700,
};

const safeBoxStyle: CSSProperties = {
  marginTop: 12,
  padding: 10,
  borderRadius: 10,
  background: '#EAF7F0',
  color: '#387A57',
  fontSize: 13,
  fontWeight: 700,
};

const statusActionsStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  alignItems: 'center',
  marginTop: 14,
};

const statusButtonBaseStyle: CSSProperties = {
  minHeight: 40,
  padding: '7px 14px',
  border: '1px solid',
  borderRadius: 9,
  color: '#29425E',
  cursor: 'pointer',
};

const openLinkStyle: CSSProperties = {
  marginLeft: 'auto',
  color: '#315F93',
  fontSize: 13,
  fontWeight: 800,
  textDecoration: 'none',
};

const previewSectionStyle: CSSProperties = {
  maxWidth: 1500,
  margin: '0 auto',
  overflow: 'hidden',
  border: '1px solid #BFCEDF',
  borderRadius: 16,
  background: '#FFFFFF',
};

const previewHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent:
    'space-between',
  gap: 12,
  padding: '11px 14px',
  borderBottom:
    '1px solid #D5DFEA',
  background: '#EAF0F6',
  color: '#405872',
  fontSize: 13,
};

const iframeStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  minHeight: 1200,
  border: 0,
  background: '#FFFFFF',
};

const emptyStyle: CSSProperties = {
  maxWidth: 1500,
  margin: '30px auto',
  padding: 30,
  borderRadius: 14,
  background: '#FFFFFF',
  textAlign: 'center',
  color: '#63768C',
};
