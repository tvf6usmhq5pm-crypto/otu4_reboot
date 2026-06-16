'use client';

import Link from 'next/link';
import { useMemo, type CSSProperties } from 'react';
import { useSearchParams } from 'next/navigation';

import BottomTabBar from '../home/BottomTabBar';

import {
  loadExamDate,
  loadResults,
} from '../../lib/storage';

import {
  calcExamDays as calcExamDaysFromAnalytics,
  calcTotalGapTo60,
  getResultById,
  getSubjectAccuracySummary,
  getWeakestSubject,
  getWrongQuestionIdsFromResult,
} from '../../lib/analytics';
import { requireQuestionById } from '../../lib/questions';

type StoredResult = ReturnType<typeof loadResults>[number];
type SubjectKey = 'law' | 'phys' | 'prop';

type SubjectSummary = {
  total: number;
  answered?: number;
  correct: number;
};

const SUBJECTS: SubjectKey[] = ['law', 'phys', 'prop'];

function subjectLabel(subject: SubjectKey): string {
  if (subject === 'law') {
    return '法令';
  }

  if (subject === 'phys') {
    return '物理・化学';
  }

  return '性質・消火';
}

function shortSubjectLabel(subject: SubjectKey): string {
  if (subject === 'law') {
    return '法令';
  }

  if (subject === 'phys') {
    return '物化';
  }

  return '性消';
}

function calcExamDays(examDate: string | null): number | null {
  if (!examDate) {
    return null;
  }

  const target = new Date(`${examDate}T00:00:00`);
  const now = new Date();

  if (Number.isNaN(target.getTime())) {
    return null;
  }

  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));
}

function percent(correct: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.round((correct / total) * 100);
}

function normalizeSubjectSummary(
  bySubject: StoredResult['bySubject'] | undefined,
): Record<SubjectKey, SubjectSummary> {
  return {
    law: bySubject?.law ?? { total: 0, correct: 0 },
    phys: bySubject?.phys ?? { total: 0, correct: 0 },
    prop: bySubject?.prop ?? { total: 0, correct: 0 },
  };
}

function weakestSubject(
  summaries: Record<SubjectKey, SubjectSummary>,
): SubjectKey {
  return SUBJECTS
    .slice()
    .sort((a, b) => {
      const aRate = percent(summaries[a].correct, summaries[a].total);
      const bRate = percent(summaries[b].correct, summaries[b].total);
      return aRate - bRate;
    })[0];
}

function gapTo60(item: SubjectSummary): number {
  if (item.total <= 0) {
    return 0;
  }

  const target = Math.ceil(item.total * 0.6);
  return Math.max(0, target - item.correct);
}

function totalGapTo60(summaries: Record<SubjectKey, SubjectSummary>): number {
  return SUBJECTS.reduce((sum, subject) => sum + gapTo60(summaries[subject]), 0);
}

function statusText(rate: number): string {
  if (rate >= 70) {
    return '安定';
  }

  if (rate >= 60) {
    return 'もう少し';
  }

  return '要強化';
}

function statusColor(rate: number): string {
  if (rate >= 70) {
    return '#4F765E';
  }

  if (rate >= 60) {
    return '#B8944D';
  }

  return '#8F1B25';
}

function resultMessage(correct: number, total: number): {
  title: string;
  body: string;
} {
  const rate = total <= 0 ? 0 : correct / total;

  if (rate >= 0.9) {
    return {
      title: '素晴らしい結果です',
      body: 'この調子で、合格ラインを安定させていきましょう。',
    };
  }

  if (rate >= 0.7) {
    return {
      title: '今日の学習は順調です',
      body: 'この調子で、合格に一歩ずつ近づいています。',
    };
  }

  if (rate >= 0.5) {
    return {
      title: '今日も一歩前進です',
      body: '間違えた問題を復習して、確実に力に変えましょう。',
    };
  }

  return {
    title: '今日は復習の日です',
    body: 'つまずきを丁寧に戻せば、次の10問で伸ばせます。',
  };
}

function mockMessage(gap: number, weakSubject: SubjectKey): {
  title: string;
  body: string;
} {
  if (gap === 0) {
    return {
      title: '合格ラインに到達しています',
      body: '3科目とも60%ラインに届いています。この状態を維持しましょう。',
    };
  }

  if (gap <= 2) {
    return {
      title: '合格圏まであと一歩です',
      body: `${subjectLabel(weakSubject)}を補強すると、合格圏に近づきます。`,
    };
  }

  if (gap <= 5) {
    return {
      title: 'もう少しで合格圏です',
      body: `${subjectLabel(weakSubject)}を中心に、足りない科目を戻しましょう。`,
    };
  }

  return {
    title: '対策を集中させましょう',
    body: `まずは${subjectLabel(weakSubject)}から、60%ラインを目指します。`,
  };
}

function getWrongQuestionIds(result: StoredResult): string[] {
  return result.questionIds.filter((questionId) => {
    const question = requireQuestionById(questionId);
    const answer = result.answers[questionId];

    return answer === undefined || answer !== question.correct;
  });
}

export default function ResultClient() {
  const searchParams = useSearchParams();
  const resultId = searchParams?.get('resultId') ?? null;

  const result = useMemo(() => getResultById(resultId) as StoredResult | null, [resultId]);

  const examDays = useMemo(() => calcExamDaysFromAnalytics(loadExamDate()), []);

  if (!result) {
    return (
      <main style={pageStyle}>
        <Header examDays={examDays} />

        <section style={cardStyle}>
          <h1 style={emptyTitleStyle}>結果が見つかりません</h1>
          <p style={emptyTextStyle}>ホームに戻って、もう一度演習を開始してください。</p>

          <Link href="/" style={primaryLinkStyle}>
            ホームへ戻る
          </Link>
        </section>

        <BottomTabBar />
      </main>
    );
  }

  const isMock =
    result.sessionType === 'mock-exam' ||
    result.sessionType === 'mock-practice' ||
    result.total === 35;

  if (isMock) {
    return <MockResultView result={result} examDays={examDays} />;
  }

  return <DailyResultView result={result} examDays={examDays} />;
}

function DailyResultView({
  result,
  examDays,
}: {
  result: StoredResult;
  examDays: number | null;
}) {
  const summaries = getSubjectAccuracySummary(result);
  const weakSubject = getWeakestSubject(summaries);
  const message = resultMessage(result.correct, result.total);
  const wrongQuestionIds = getWrongQuestionIdsFromResult(result);
  const wrongCount = wrongQuestionIds.length;

  const mainCtaHref =
    wrongCount > 0
      ? `/quiz?mode=daily-10&subject=${weakSubject}`
      : '/quiz?mode=daily-10';

  return (
    <main style={pageStyle}>
      <Header examDays={examDays} />

      <section style={heroStyle}>
        <div style={heroLeftStyle}>
          <p style={eyebrowStyle}>今日の10問の結果</p>

          <div style={scoreLineStyle}>
            <span style={scoreNumberStyle}>{result.correct}</span>
            <span style={scoreSlashStyle}>/</span>
            <span style={scoreTotalStyle}>{result.total}</span>
            <span style={scoreLabelStyle}>正解</span>
          </div>

          <h1 style={messageTitleStyle}>{message.title}</h1>
          <p style={messageBodyStyle}>{message.body}</p>
        </div>

        <div style={growthCardStyle}>
          <span style={growthLabelStyle}>今回の到達度</span>
          <strong style={growthNumberStyle}>
            {percent(result.correct, result.total)}
            <span style={growthUnitStyle}>%</span>
          </strong>
        </div>
      </section>

      <section style={pointCardStyle}>
        <h2 style={sectionTitleStyle}>今回のポイント</h2>

        <div style={pointGridStyle}>
          <div style={pointItemStyle}>
            <span style={pointLabelStyle}>間違い</span>
            <strong style={pointNumberStyle}>{wrongCount}問</strong>
          </div>

          <div style={pointItemStyle}>
            <span style={pointLabelStyle}>優先科目</span>
            <strong style={pointSubjectStyle}>{subjectLabel(weakSubject)}</strong>
          </div>

          <div style={pointItemStyle}>
            <span style={pointLabelStyle}>次の行動</span>
            <strong style={pointActionStyle}>
              {wrongCount > 0 ? '復習' : '次の10問'}
            </strong>
          </div>
        </div>
      </section>

      <section style={actionWrapStyle}>
        <Link href={mainCtaHref} style={redCtaStyle}>
          <div>
            <strong style={redCtaTitleStyle}>
              {wrongCount > 0
                ? `間違えた${wrongCount}問を復習する`
                : '次の10問へ進む'}
            </strong>
            <p style={redCtaSubStyle}>
              {wrongCount > 0
                ? `${subjectLabel(weakSubject)}を中心に、つまずきを戻しましょう。`
                : 'このまま次の10問に進みましょう。'}
            </p>
          </div>

          <span style={redCtaArrowStyle}>→</span>
        </Link>

        <Link href="/quiz?mode=daily-10" style={whiteCtaStyle}>
          <div>
            <strong style={whiteCtaTitleStyle}>次の10問へ</strong>
            <p style={whiteCtaSubStyle}>さっそく次の問題にチャレンジ</p>
          </div>

          <span style={whiteCtaArrowStyle}>→</span>
        </Link>
      </section>

      <SubjectSummaryCard summaries={summaries} />

      <BottomTabBar />
    </main>
  );
}

function MockResultView({
  result,
  examDays,
}: {
  result: StoredResult;
  examDays: number | null;
}) {
  const summaries = getSubjectAccuracySummary(result);
  const weakSubject = getWeakestSubject(summaries);
  const gap = calcTotalGapTo60(summaries);
  const message = mockMessage(gap, weakSubject);
  const wrongCount = getWrongQuestionIdsFromResult(result).length;
  const weakHref = `/quiz?mode=daily-10&subject=${weakSubject}`;
  const reached = gap === 0;

  return (
    <main style={pageStyle}>
      <Header examDays={examDays} />

      <section style={mockHeroStyle}>
        <div>
          <p style={eyebrowStyle}>35問実践モードの結果</p>

          <div style={scoreLineStyle}>
            <span style={scoreNumberStyle}>{result.correct}</span>
            <span style={scoreSlashStyle}>/</span>
            <span style={scoreTotalStyle}>{result.total}</span>
            <span style={scoreLabelStyle}>正解</span>
          </div>

          <h1 style={messageTitleStyle}>{message.title}</h1>
          <p style={messageBodyStyle}>{message.body}</p>
        </div>

        <div style={mockSideStyle}>
          <span style={mockSideLabelStyle}>合格圏まで</span>
          <strong
            style={{
              ...mockGapStyle,
              color: reached ? '#4F765E' : '#8F1B25',
            }}
          >
            {reached ? '到達' : `あと${gap}問`}
          </strong>
          <span style={mockSideNoteStyle}>3科目60%判定</span>
        </div>
      </section>

      <section style={cardStyle}>
        <div style={sectionHeaderStyle}>
          <h2 style={sectionTitleStyle}>科目別の診断</h2>
          <span style={sectionSubStyle}>1科目でも60%未満なら要対策</span>
        </div>

        <SubjectRows summaries={summaries} />
      </section>

      <section style={pointCardStyle}>
        <h2 style={sectionTitleStyle}>今回の課題</h2>

        <ul style={challengeListStyle}>
          <li style={challengeItemStyle}>
            間違い{wrongCount}問のうち、まずは{subjectLabel(weakSubject)}を優先します。
          </li>
          <li style={challengeItemStyle}>
            60%ラインまでの不足を、次の10問で戻します。
          </li>
          <li style={challengeItemStyle}>
            模試は週1〜2回、弱点対策後に再挑戦しましょう。
          </li>
        </ul>
      </section>

      <section style={actionWrapStyle}>
        <Link href={weakHref} style={redCtaStyle}>
          <div>
            <strong style={redCtaTitleStyle}>弱点対策を開始する</strong>
            <p style={redCtaSubStyle}>
              {subjectLabel(weakSubject)}を10問。60%ラインまで戻します。
            </p>
          </div>

          <span style={redCtaArrowStyle}>→</span>
        </Link>

        <Link href="/quiz?mode=mock-exam" style={whiteCtaStyle}>
          <div>
            <strong style={whiteCtaTitleStyle}>もう一度テストを解く</strong>
            <p style={whiteCtaSubStyle}>35問実践モードに再挑戦</p>
          </div>

          <span style={whiteCtaArrowStyle}>→</span>
        </Link>
      </section>

      <section style={cardStyle}>
        <div style={sectionHeaderStyle}>
          <h2 style={sectionTitleStyle}>今回の結果で更新</h2>
          <span style={savedStyle}>保存済み</span>
        </div>

        <div style={updateGridStyle}>
          <div style={updateItemStyle}>
            <span style={pointLabelStyle}>正答率</span>
            <strong style={updateNumberStyle}>
              {percent(result.correct, result.total)}%
            </strong>
          </div>

          <div style={updateItemStyle}>
            <span style={pointLabelStyle}>合格圏まで</span>
            <strong
              style={{
                ...updateNumberStyle,
                color: reached ? '#4F765E' : '#8F1B25',
              }}
            >
              {reached ? '到達' : `${gap}問`}
            </strong>
          </div>

          <div style={updateItemStyle}>
            <span style={pointLabelStyle}>優先科目</span>
            <strong style={updateSubjectStyle}>
              {shortSubjectLabel(weakSubject)}
            </strong>
          </div>
        </div>
      </section>

      <BottomTabBar />
    </main>
  );
}

function SubjectSummaryCard({
  summaries,
}: {
  summaries: Record<SubjectKey, SubjectSummary>;
}) {
  return (
    <section style={cardStyle}>
      <div style={sectionHeaderStyle}>
        <h2 style={sectionTitleStyle}>科目別の結果</h2>
        <span style={sectionSubStyle}>3科目60%ライン</span>
      </div>

      <SubjectRows summaries={summaries} />
    </section>
  );
}

function SubjectRows({
  summaries,
}: {
  summaries: Record<SubjectKey, SubjectSummary>;
}) {
  return (
    <div style={subjectListStyle}>
      {SUBJECTS.map((subject) => {
        const item = summaries[subject];
        const rate = percent(item.correct, item.total);
        const color = statusColor(rate);
        const gap = gapTo60(item);

        return (
          <div key={subject} style={subjectRowStyle}>
            <div style={subjectMainStyle}>
              <div>
                <strong style={subjectNameStyle}>{subjectLabel(subject)}</strong>
                <span style={subjectScoreStyle}>
                  {item.total > 0 ? `${item.correct}/${item.total}` : '未測定'}
                </span>
              </div>

              <div style={subjectValueStyle}>
                <strong style={{ ...subjectPercentStyle, color }}>
                  {rate}%
                </strong>
                <span
                  style={{
                    ...subjectBadgeStyle,
                    color,
                    background: rate >= 60 ? '#EAF3ED' : '#FCEEF0',
                  }}
                >
                  {gap > 0 ? `あと${gap}問` : statusText(rate)}
                </span>
              </div>
            </div>

            <div style={trackStyle}>
              <div
                style={{
                  ...fillStyle,
                  width: `${Math.max(0, Math.min(100, rate))}%`,
                  background: color,
                }}
              />
              <div style={line60Style} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Header({ examDays }: { examDays: number | null }) {
  return (
    <header style={headerStyle}>
      <div style={brandRowStyle}>
        <span style={brandStyle}>
          Z<span style={brandFourStyle}>4</span>
        </span>

        <div>
          <p style={headerTitleStyle}>危険物乙4</p>
          <p style={headerSubStyle}>合格への最短ルートを、あなたに。</p>
        </div>
      </div>

      <div style={examCardStyle}>
        <span style={examLabelStyle}>試験まで</span>
        <strong style={examDaysStyle}>
          {examDays === null ? '—' : examDays}
          {examDays !== null && <span style={examDaysUnitStyle}>日</span>}
        </strong>
      </div>
    </header>
  );
}

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  maxWidth: 430,
  margin: '0 auto',
  paddingBottom: 96,
};

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: '18px 18px 12px',
};

const brandRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
};

const brandStyle: CSSProperties = {
  fontFamily: 'var(--font-serif-en)',
  color: '#101827',
  fontSize: 46,
  fontWeight: 700,
  letterSpacing: -1,
  lineHeight: 1,
};

const brandFourStyle: CSSProperties = {
  color: '#B8944D',
};

const headerTitleStyle: CSSProperties = {
  margin: 0,
  color: '#101827',
  fontSize: 14,
  fontWeight: 600,
};

const headerSubStyle: CSSProperties = {
  margin: '3px 0 0',
  color: '#6E665B',
  fontSize: 10,
  fontWeight: 400,
};

const examCardStyle: CSSProperties = {
  minWidth: 72,
  padding: '9px 10px 8px',
  borderRadius: 15,
  background: 'rgba(255, 253, 248, 0.92)',
  border: '1px solid rgba(21, 26, 36, 0.08)',
  textAlign: 'center',
  boxShadow: 'var(--shadow-soft)',
};

const examLabelStyle: CSSProperties = {
  display: 'block',
  color: '#6E665B',
  fontSize: 11,
};

const examDaysStyle: CSSProperties = {
  fontFamily: 'var(--font-serif-en)',
  display: 'block',
  color: '#8F1B25',
  fontSize: 29,
  lineHeight: 1,
  fontWeight: 600,
};

const examDaysUnitStyle: CSSProperties = {
  marginLeft: 2,
  fontSize: 12,
};

const heroStyle: CSSProperties = {
  margin: '0 18px 14px',
  padding: 18,
  borderRadius: 24,
  background: 'rgba(255, 253, 248, 0.92)',
  border: '1px solid rgba(21, 26, 36, 0.08)',
  boxShadow: 'var(--shadow-soft)',
  display: 'grid',
  gridTemplateColumns: '1fr 118px',
  gap: 14,
  alignItems: 'center',
};

const mockHeroStyle: CSSProperties = {
  margin: '0 18px 14px',
  padding: 18,
  borderRadius: 24,
  background: 'rgba(255, 253, 248, 0.92)',
  border: '1px solid rgba(21, 26, 36, 0.08)',
  boxShadow: 'var(--shadow-soft)',
  display: 'grid',
  gridTemplateColumns: '1fr 118px',
  gap: 14,
  alignItems: 'center',
};

const heroLeftStyle: CSSProperties = {
  minWidth: 0,
};

const eyebrowStyle: CSSProperties = {
  margin: 0,
  color: '#6E665B',
  fontSize: 12,
  fontWeight: 500,
};

const scoreLineStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 5,
  marginTop: 7,
};

const scoreNumberStyle: CSSProperties = {
  fontFamily: 'var(--font-serif-en)',
  color: '#8F1B25',
  fontSize: 58,
  fontWeight: 600,
  lineHeight: 1,
};

const scoreSlashStyle: CSSProperties = {
  color: '#101827',
  fontSize: 30,
  fontWeight: 400,
};

const scoreTotalStyle: CSSProperties = {
  fontFamily: 'var(--font-serif-en)',
  color: '#101827',
  fontSize: 35,
  fontWeight: 500,
  lineHeight: 1,
};

const scoreLabelStyle: CSSProperties = {
  color: '#101827',
  fontSize: 13,
  fontWeight: 600,
  marginLeft: 2,
};

const messageTitleStyle: CSSProperties = {
  margin: '12px 0 4px',
  color: '#101827',
  fontFamily: 'var(--font-serif-jp)',
  fontSize: 20,
  fontWeight: 700,
  lineHeight: 1.45,
};

const messageBodyStyle: CSSProperties = {
  margin: 0,
  color: '#6E665B',
  fontSize: 12,
  fontWeight: 400,
  lineHeight: 1.6,
};

const growthCardStyle: CSSProperties = {
  minHeight: 112,
  borderLeft: '1px solid rgba(21, 26, 36, 0.08)',
  paddingLeft: 14,
  display: 'grid',
  alignContent: 'center',
  justifyItems: 'center',
};

const growthLabelStyle: CSSProperties = {
  color: '#6E665B',
  fontSize: 11,
  fontWeight: 400,
};

const growthNumberStyle: CSSProperties = {
  marginTop: 6,
  fontFamily: 'var(--font-serif-en)',
  color: '#101827',
  fontSize: 46,
  fontWeight: 600,
  lineHeight: 1,
};

const growthUnitStyle: CSSProperties = {
  marginLeft: 2,
  fontSize: 18,
};

const mockSideStyle: CSSProperties = {
  minHeight: 112,
  borderLeft: '1px solid rgba(21, 26, 36, 0.08)',
  paddingLeft: 14,
  display: 'grid',
  alignContent: 'center',
  justifyItems: 'center',
};

const mockSideLabelStyle: CSSProperties = {
  color: '#6E665B',
  fontSize: 11,
  fontWeight: 400,
};

const mockGapStyle: CSSProperties = {
  marginTop: 8,
  fontFamily: 'var(--font-serif-jp)',
  fontSize: 24,
  fontWeight: 700,
  lineHeight: 1.2,
  textAlign: 'center',
};

const mockSideNoteStyle: CSSProperties = {
  marginTop: 8,
  color: '#6E665B',
  fontSize: 10,
};

const pointCardStyle: CSSProperties = {
  margin: '0 18px 14px',
  padding: 16,
  borderRadius: 22,
  background: 'rgba(255, 253, 248, 0.92)',
  border: '1px solid rgba(21, 26, 36, 0.08)',
  boxShadow: 'var(--shadow-soft)',
};

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  color: '#101827',
  fontSize: 16,
  fontWeight: 700,
};

const pointGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 8,
  marginTop: 12,
};

const pointItemStyle: CSSProperties = {
  minHeight: 76,
  padding: 10,
  borderRadius: 15,
  background: '#FFFFFF',
  border: '1px solid rgba(21, 26, 36, 0.06)',
  display: 'grid',
  alignContent: 'center',
  gap: 5,
};

const pointLabelStyle: CSSProperties = {
  color: '#6E665B',
  fontSize: 11,
  fontWeight: 400,
};

const pointNumberStyle: CSSProperties = {
  color: '#8F1B25',
  fontSize: 18,
  fontWeight: 700,
};

const pointSubjectStyle: CSSProperties = {
  color: '#8F1B25',
  fontSize: 13,
  fontWeight: 700,
  lineHeight: 1.35,
};

const pointActionStyle: CSSProperties = {
  color: '#101827',
  fontSize: 14,
  fontWeight: 700,
};

const actionWrapStyle: CSSProperties = {
  display: 'grid',
  gap: 10,
  margin: '0 18px 14px',
};

const redCtaStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  minHeight: 72,
  padding: '14px 16px',
  borderRadius: 18,
  background: 'linear-gradient(145deg, #5E1118 0%, #8F1B25 55%, #68131B 100%)',
  color: '#FFFFFF',
  boxShadow: '0 14px 26px rgba(80, 25, 30, 0.16)',
};

const redCtaTitleStyle: CSSProperties = {
  display: 'block',
  fontSize: 17,
  fontWeight: 700,
};

const redCtaSubStyle: CSSProperties = {
  margin: '5px 0 0',
  color: '#F5E6C8',
  fontSize: 12,
  lineHeight: 1.45,
};

const redCtaArrowStyle: CSSProperties = {
  flexShrink: 0,
  width: 38,
  height: 38,
  borderRadius: '50%',
  display: 'grid',
  placeItems: 'center',
  background: '#FFFFFF',
  color: '#8F1B25',
  fontSize: 22,
  fontWeight: 700,
};

const whiteCtaStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  minHeight: 62,
  padding: '13px 16px',
  borderRadius: 18,
  background: 'rgba(255, 253, 248, 0.92)',
  border: '1px solid rgba(184, 148, 77, 0.35)',
  color: '#101827',
};

const whiteCtaTitleStyle: CSSProperties = {
  display: 'block',
  fontSize: 16,
  fontWeight: 700,
};

const whiteCtaSubStyle: CSSProperties = {
  margin: '4px 0 0',
  color: '#6E665B',
  fontSize: 12,
};

const whiteCtaArrowStyle: CSSProperties = {
  color: '#B8944D',
  fontSize: 22,
};

const cardStyle: CSSProperties = {
  margin: '0 18px 14px',
  padding: 18,
  borderRadius: 22,
  background: 'rgba(255, 253, 248, 0.92)',
  border: '1px solid rgba(21, 26, 36, 0.08)',
  boxShadow: 'var(--shadow-soft)',
};

const primaryLinkStyle: CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  minHeight: 50,
  marginTop: 14,
  borderRadius: 999,
  background: '#101827',
  color: '#FFFFFF',
  fontWeight: 700,
};

const emptyTitleStyle: CSSProperties = {
  margin: 0,
  color: '#101827',
  fontSize: 18,
  fontWeight: 700,
};

const emptyTextStyle: CSSProperties = {
  color: '#6E665B',
  fontSize: 13,
  lineHeight: 1.6,
};

const sectionHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: 10,
  marginBottom: 12,
};

const sectionSubStyle: CSSProperties = {
  color: '#6E665B',
  fontSize: 11,
};

const subjectListStyle: CSSProperties = {
  display: 'grid',
  gap: 13,
};

const subjectRowStyle: CSSProperties = {
  display: 'grid',
  gap: 8,
};

const subjectMainStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
};

const subjectNameStyle: CSSProperties = {
  color: '#151A24',
  fontSize: 14,
  fontWeight: 700,
};

const subjectScoreStyle: CSSProperties = {
  color: '#6E665B',
  fontSize: 12,
};

const subjectValueStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

const subjectPercentStyle: CSSProperties = {
  fontFamily: 'var(--font-serif-en)',
  fontSize: 20,
  fontWeight: 600,
};

const subjectBadgeStyle: CSSProperties = {
  padding: '3px 8px',
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700,
};

const trackStyle: CSSProperties = {
  position: 'relative',
  height: 7,
  borderRadius: 999,
  background: '#E7E0D3',
};

const fillStyle: CSSProperties = {
  height: '100%',
  borderRadius: 999,
};

const line60Style: CSSProperties = {
  position: 'absolute',
  left: '60%',
  top: -2,
  width: 2,
  height: 11,
  borderRadius: 999,
  background: '#B8944D',
};

const challengeListStyle: CSSProperties = {
  display: 'grid',
  gap: 8,
  margin: '12px 0 0',
  padding: 0,
  listStyle: 'none',
};

const challengeItemStyle: CSSProperties = {
  color: '#151A24',
  fontSize: 13,
  lineHeight: 1.65,
};

const savedStyle: CSSProperties = {
  color: '#4F765E',
  fontSize: 12,
  fontWeight: 600,
};

const updateGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 8,
};

const updateItemStyle: CSSProperties = {
  minHeight: 68,
  padding: 10,
  borderRadius: 15,
  background: '#FFFFFF',
  border: '1px solid rgba(21, 26, 36, 0.06)',
  display: 'grid',
  gap: 4,
};

const updateNumberStyle: CSSProperties = {
  fontFamily: 'var(--font-serif-en)',
  color: '#101827',
  fontSize: 24,
  fontWeight: 600,
};

const updateSubjectStyle: CSSProperties = {
  color: '#8F1B25',
  fontSize: 18,
  fontWeight: 700,
};