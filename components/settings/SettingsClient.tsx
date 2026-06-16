'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

import BottomTabBar from '../home/BottomTabBar';
import AboutSection from './AboutSection';
import ExamDateRow from './ExamDateRow';
import ResetDataButton from './ResetDataButton';
import SettingsSection from './SettingsSection';

import {
  loadExamDate,
  saveExamDate,
} from '../../lib/storage';

export default function SettingsClient() {
  const [examDate, setExamDate] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    setExamDate(loadExamDate() ?? '');
  }, []);

  const handleExamDateChange = (value: string) => {
    setExamDate(value);
    saveExamDate(value);
    setSavedMessage('試験日を保存しました');
    window.setTimeout(() => setSavedMessage(''), 1800);
  };

  const resetLearningData = () => {
    const keys = Object.keys(window.localStorage);

    keys.forEach((key) => {
      if (key.startsWith('otu4.')) {
        window.localStorage.removeItem(key);
      }
    });

    setExamDate('');
    setSavedMessage('学習データをリセットしました');
    setShowResetConfirm(false);
  };

  return (
    <main style={pageStyle}>
      <header style={headerStyle}>
        <div style={brandStyle}>
          <span style={brandTextStyle}>
            Z<span style={brandFourStyle}>4</span>
          </span>
          <span style={dividerStyle} />
          <div>
            <h1 style={titleStyle}>設定</h1>
            <p style={subTitleStyle}>学習環境を整える</p>
          </div>
        </div>
      </header>

      {savedMessage && <p style={toastStyle}>{savedMessage}</p>}

      <SettingsSection title="試験日">
        <ExamDateRow value={examDate} onChange={handleExamDateChange} />
      </SettingsSection>

      <SettingsSection title="データ管理">
        <div style={dataTextBlockStyle}>
          <strong style={dataTitleStyle}>学習データ</strong>
          <p style={dataTextStyle}>
            保存済みのセッション、結果、誤答、試験日を端末から削除します。
          </p>
        </div>

        <ResetDataButton onClick={() => setShowResetConfirm(true)} />
      </SettingsSection>

      <SettingsSection title="このアプリについて">
        <AboutSection />
      </SettingsSection>

      {showResetConfirm && (
        <div style={modalBackdropStyle}>
          <div style={modalStyle}>
            <h2 style={modalTitleStyle}>学習データをリセットしますか？</h2>
            <p style={modalTextStyle}>
              この操作は取り消せません。保存された学習履歴、結果、誤答、試験日が削除されます。
            </p>

            <div style={modalActionsStyle}>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                style={cancelButtonStyle}
              >
                キャンセル
              </button>

              <button
                type="button"
                onClick={resetLearningData}
                style={dangerButtonStyle}
              >
                リセット
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomTabBar />
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  maxWidth: 430,
  margin: '0 auto',
  paddingBottom: 96,
};

const headerStyle: CSSProperties = {
  padding: '22px 22px 16px',
};

const brandStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
};

const brandTextStyle: CSSProperties = {
  fontFamily: 'var(--font-serif-en)',
  color: '#101827',
  fontSize: 48,
  fontWeight: 700,
  letterSpacing: -1,
  lineHeight: 1,
};

const brandFourStyle: CSSProperties = {
  color: '#B8944D',
};

const dividerStyle: CSSProperties = {
  width: 1,
  height: 46,
  background: 'rgba(21, 26, 36, 0.16)',
};

const titleStyle: CSSProperties = {
  margin: 0,
  color: '#101827',
  fontFamily: 'var(--font-serif-jp)',
  fontSize: 25,
  fontWeight: 700,
  lineHeight: 1.3,
};

const subTitleStyle: CSSProperties = {
  margin: '4px 0 0',
  color: '#6E665B',
  fontSize: 12,
  fontWeight: 400,
};

const toastStyle: CSSProperties = {
  margin: '0 18px 12px',
  padding: '10px 12px',
  borderRadius: 12,
  background: '#EAF3ED',
  color: '#4F765E',
  fontSize: 12,
  fontWeight: 600,
};

const dataTextBlockStyle: CSSProperties = {
  marginBottom: 12,
};

const dataTitleStyle: CSSProperties = {
  color: '#151A24',
  fontSize: 14,
  fontWeight: 600,
};

const dataTextStyle: CSSProperties = {
  margin: '5px 0 0',
  color: '#6E665B',
  fontSize: 12,
  fontWeight: 400,
  lineHeight: 1.6,
};

const modalBackdropStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 80,
  display: 'grid',
  placeItems: 'center',
  padding: 22,
  background: 'rgba(16, 24, 39, 0.38)',
};

const modalStyle: CSSProperties = {
  width: '100%',
  maxWidth: 360,
  padding: 20,
  borderRadius: 22,
  background: '#FFFDF8',
  border: '1px solid rgba(21, 26, 36, 0.08)',
  boxShadow: '0 24px 60px rgba(16, 24, 39, 0.22)',
};

const modalTitleStyle: CSSProperties = {
  margin: 0,
  color: '#101827',
  fontSize: 18,
  fontWeight: 700,
};

const modalTextStyle: CSSProperties = {
  margin: '10px 0 18px',
  color: '#6E665B',
  fontSize: 13,
  fontWeight: 400,
  lineHeight: 1.7,
};

const modalActionsStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 10,
};

const cancelButtonStyle: CSSProperties = {
  minHeight: 46,
  border: '1px solid rgba(21, 26, 36, 0.1)',
  borderRadius: 14,
  background: '#FFFFFF',
  color: '#101827',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
};

const dangerButtonStyle: CSSProperties = {
  minHeight: 46,
  border: '1px solid rgba(143, 27, 37, 0.2)',
  borderRadius: 14,
  background: '#8F1B25',
  color: '#FFFFFF',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
};