import React from 'react';

export default function StepIndicator({ steps, current }) {
  return (
    <div className="portal-steps">
      {steps.map((label, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'idle';
        return (
          <React.Fragment key={i}>
            <div className={`portal-step portal-step--${state}`}>
              <div className="portal-step__circle">
                {state === 'done' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span className="portal-step__label">{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`portal-step__line ${state === 'done' ? 'portal-step__line--done' : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
