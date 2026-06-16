import type { ProcessStep } from '../../../data/explanation_meta_types';

type ProcessDiagramProps = {
  steps?: ProcessStep[];
};

export function ProcessDiagram({ steps = [] }: ProcessDiagramProps) {
  if (steps.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="流れで理解"
      style={{
        marginTop: 16,
        marginBottom: 16,
        padding: 14,
        borderRadius: 18,
        background: '#FFFDF8',
        border: '1px solid #E7DCCB',
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 800,
          color: '#1A2238',
          marginBottom: 10,
          letterSpacing: '0.02em',
        }}
      >
        流れで理解
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        {steps.map((step, index) => (
          <div key={`${step.label}-${index}`}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '72px 1fr',
                gap: 10,
                alignItems: 'start',
                padding: 12,
                borderRadius: 14,
                border: '1px solid #E6DDCF',
                background: '#FFFCF7',
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  display: 'grid',
                  justifyItems: 'center',
                  alignContent: 'start',
                }}
              >
                <div
                  style={{
                    minWidth: 58,
                    padding: '6px 8px',
                    borderRadius: 999,
                    background: '#1A2238',
                    color: '#FFFFFF',
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: '0.04em',
                    textAlign: 'center',
                    lineHeight: 1,
                  }}
                >
                  STEP {index + 1}
                </div>
              </div>

              <div>
                <div
                  style={{
                    color: '#1A2238',
                    fontSize: 14,
                    fontWeight: 800,
                    lineHeight: 1.55,
                  }}
                >
                  {step.label}
                </div>

                {step.note ? (
                  <div
                    style={{
                      marginTop: 4,
                      color: '#5F6673',
                      fontSize: 12,
                      lineHeight: 1.6,
                    }}
                  >
                    {step.note}
                  </div>
                ) : null}
              </div>
            </div>

            {index < steps.length - 1 ? (
              <div
                aria-hidden="true"
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  color: '#C18A2C',
                  fontSize: 18,
                  fontWeight: 900,
                  lineHeight: 1,
                  marginTop: 4,
                  marginBottom: 2,
                }}
              >
                ↓
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export default ProcessDiagram;
