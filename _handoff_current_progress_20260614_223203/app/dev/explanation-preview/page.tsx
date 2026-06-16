import { notFound } from 'next/navigation';
import { ExplanationCard } from '../../../components/quiz/explanation/ExplanationCard';
import { explanationMetaPilotLawV1 } from '../../../data/explanation_meta_pilot_law_v1';
import { explanationMetaPilotPhysV1 } from '../../../data/explanation_meta_pilot_phys_v1';
import { explanationMetaPilotPropV1 } from '../../../data/explanation_meta_pilot_prop_v1';
import questionsData from '../../../data/questions_all_700_v1.json';

type QuestionPreview = {
  id: string;
  question: string;
  options: string[];
  correct?: number | string;
  subject?: string;
  sectionKey?: string;
  card_id?: string;
  difficulty?: number;
  star?: number;
};

const OPTION_LABELS = ['①', '②', '③', '④', '⑤'] as const;

const PREVIEW_ORDER = [
  'LAW-006-002-V01',
  'LAW-011-001',
  'LAW-004-008',
  'LAW-020-002',
  'LAW-002-002',
  'PHYS-002-001',
  'PHYS-001-006',
  'PHYS-001-008',
  'PHYS-002-002',
  'PHYS-003-005',
  'PROP-003-001',
  'PROP-003-002-V02',
  'PROP-003-003',
  'PROP-003-007',
  'PROP-002-016',
] as const;

const questions = questionsData as QuestionPreview[];

const explanationMetaPreviewMap = {
  ...explanationMetaPilotLawV1,
  ...explanationMetaPilotPhysV1,
  ...explanationMetaPilotPropV1,
};

function findQuestion(questionId: string) {
  return questions.find((question) => question.id === questionId) ?? null;
}

function getCorrectLabel(correct: QuestionPreview['correct']) {
  if (typeof correct === 'number') {
    if (correct >= 0 && correct <= 4) {
      return OPTION_LABELS[correct];
    }

    if (correct >= 1 && correct <= 5) {
      return OPTION_LABELS[correct - 1];
    }

    return String(correct);
  }

  if (typeof correct === 'string') {
    return correct;
  }

  return '未設定';
}

function splitQuestionText(text: string) {
  const normalized = text.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();

  if (!normalized.includes('・')) {
    return {
      lead: normalized,
      bullets: [] as string[],
    };
  }

  const parts = normalized
    .split(/(?=・)/g)
    .map((part) => part.trim())
    .filter(Boolean);

  const lead = parts[0]?.startsWith('・') ? '' : parts[0] ?? '';

  const bullets = parts
    .filter((part) => part.startsWith('・'))
    .map((part) => part.replace(/^・/, '').trim())
    .filter(Boolean);

  return { lead, bullets };
}

function QuestionText({ text }: { text: string }) {
  const { lead, bullets } = splitQuestionText(text);

  if (bullets.length === 0) {
    return <p style={questionTextStyle}>{lead}</p>;
  }

  return (
    <div style={questionTextBlockStyle}>
      {lead ? <p style={questionTextStyle}>{lead}</p> : null}

      <ul style={questionBulletListStyle}>
        {bullets.map((bullet) => (
          <li key={bullet} style={questionBulletItemStyle}>
            <span style={bulletDotStyle}>・</span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ExplanationPreviewPage() {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  const previewItems = PREVIEW_ORDER.map((questionId) => {
    const meta = explanationMetaPreviewMap[questionId];
    const question = findQuestion(questionId);

    return meta ? { meta, question } : null;
  }).filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <main style={pageStyle}>
      <section style={headerStyle}>
        <div style={eyebrowStyle}>DEV PREVIEW</div>
        <h1 style={titleStyle}>ExplanationCard 法令・物化・性消pilot確認</h1>
        <p style={leadStyle}>
          QuizClientに接続する前に、問題文・選択肢・ExplanationCardの対応を確認するページです。
        </p>
      </section>

      <section style={listStyle}>
        {previewItems.map(({ meta, question }) => (
          <div key={meta.questionId} style={cardWrapStyle}>
            <div style={metaLabelStyle}>
              <span>{meta.questionId}</span>
              <span>{meta.style}</span>
            </div>

            <section style={questionCardStyle}>
              <div style={questionMetaStyle}>
                <span>{question?.subject ?? 'subject不明'}</span>
                <span>{question?.sectionKey ?? 'sectionKey不明'}</span>
                <span>{question?.card_id ?? 'card_id不明'}</span>
              </div>

              <h2 style={questionTitleStyle}>問題文</h2>

              <QuestionText text={question?.question ?? '問題文が見つかりません。'} />

              <div style={answerMetaStyle}>
                <span>正解: {getCorrectLabel(question?.correct)}</span>
                {typeof question?.star === 'number' ? <span>star: {question.star}</span> : null}
                {typeof question?.difficulty === 'number' ? <span>difficulty: {question.difficulty}</span> : null}
              </div>

              <ol style={optionListStyle}>
                {(question?.options ?? []).map((option, index) => (
                  <li key={`${meta.questionId}-${index}`} style={optionItemStyle}>
                    <span style={optionLabelStyle}>{OPTION_LABELS[index as 0 | 1 | 2 | 3 | 4] ?? `${index + 1}.`}</span>
                    <span>{option}</span>
                  </li>
                ))}
              </ol>
            </section>

            <ExplanationCard meta={meta} />
          </div>
        ))}
      </section>
    </main>
  );
}

const pageStyle = {
  minHeight: '100vh',
  padding: '24px 14px 48px',
  background: '#f4eadb',
} as const;

const headerStyle = {
  width: 'min(760px, 100%)',
  margin: '0 auto 18px',
  padding: '18px 16px',
  border: '1px solid #eadfce',
  borderRadius: 18,
  background: '#fffaf3',
  boxShadow: '0 8px 22px rgba(74, 52, 35, 0.08)',
} as const;

const eyebrowStyle = {
  color: '#7a6658',
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '0.08em',
} as const;

const titleStyle = {
  margin: '6px 0 6px',
  color: '#31271f',
  fontSize: 22,
  fontFamily: '"Hiragino Mincho ProN", "Yu Mincho", "YuMincho", serif',
} as const;

const leadStyle = {
  margin: 0,
  color: '#6d5540',
  fontSize: 13,
  lineHeight: 1.7,
} as const;

const listStyle = {
  display: 'grid',
  gap: 22,
  width: 'min(760px, 100%)',
  margin: '0 auto',
} as const;

const cardWrapStyle = {
  display: 'grid',
  gap: 8,
} as const;

const metaLabelStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 8,
  padding: '0 4px',
  color: '#7a6658',
  fontSize: 12,
  fontWeight: 700,
} as const;

const questionCardStyle = {
  border: '1px solid #eadfce',
  borderRadius: 16,
  padding: 14,
  background: '#fffdf8',
  boxShadow: '0 6px 16px rgba(74, 52, 35, 0.05)',
} as const;

const questionMetaStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
  marginBottom: 8,
  color: '#7a6658',
  fontSize: 11,
  fontWeight: 700,
} as const;

const questionTitleStyle = {
  margin: '0 0 6px',
  color: '#31271f',
  fontSize: 14,
  fontWeight: 800,
  fontFamily: '"Hiragino Mincho ProN", "Yu Mincho", "YuMincho", serif',
} as const;

const questionTextBlockStyle = {
  display: 'grid',
  gap: 8,
  marginBottom: 10,
} as const;

const questionTextStyle = {
  margin: 0,
  color: '#31271f',
  fontSize: 13,
  lineHeight: 1.7,
} as const;

const questionBulletListStyle = {
  display: 'grid',
  gap: 6,
  margin: 0,
  padding: '8px 10px',
  listStyle: 'none',
  border: '1px solid #f0e1cf',
  borderRadius: 12,
  background: '#fffaf3',
} as const;

const questionBulletItemStyle = {
  display: 'grid',
  gridTemplateColumns: '18px 1fr',
  gap: 4,
  color: '#31271f',
  fontSize: 13,
  lineHeight: 1.55,
} as const;

const bulletDotStyle = {
  color: '#8a5200',
  fontWeight: 900,
} as const;

const answerMetaStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  marginBottom: 10,
  color: '#6d5540',
  fontSize: 11,
  fontWeight: 800,
} as const;

const optionListStyle = {
  display: 'grid',
  gap: 7,
  margin: 0,
  padding: 0,
  listStyle: 'none',
} as const;

const optionItemStyle = {
  display: 'grid',
  gridTemplateColumns: '30px 1fr',
  gap: 7,
  padding: '8px 9px',
  border: '1px solid #f0e7da',
  borderRadius: 10,
  background: '#fffaf3',
  color: '#31271f',
  fontSize: 13,
  lineHeight: 1.55,
} as const;

const optionLabelStyle = {
  color: '#6d5540',
  fontWeight: 800,
} as const;









