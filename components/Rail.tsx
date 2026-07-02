"use client";

const STEP_LABELS = ["Account", "Details", "Almost there"];

export function Rail({ step }: { step: number }) {
  // step is 1, 2, or 3 (4 = complete)
  return (
    <aside className="rail">
      <div>
        <div className="brand">
          <span className="brand-mark">S</span>
          SupportIQ
        </div>
        <div className="rail-lede">Set up your workspace.</div>
        <div className="rail-sub">
          A few quick details and your AI support desk is ready to go.
        </div>

        <div className="steps">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            const state =
              step > n ? "done" : step === n ? "active" : "";
            return (
              <div key={label} className={`step-row ${state}`}>
                <span className="step-dot">{step > n ? "✓" : n}</span>
                {label}
              </div>
            );
          })}
        </div>
      </div>
      <div className="rail-foot">SupportIQ · Onboarding</div>
    </aside>
  );
}

export function MobileSteps({ step }: { step: number }) {
  return (
    <div className="mobile-progress">
      <div className="mobile-brand">
        <span className="brand-mark">S</span>
        <span>SupportIQ</span>
      </div>
      <div className="mobile-steps" aria-label={`Step ${Math.min(step, 3)} of 3`}>
        {[1, 2, 3].map((n) => (
          <span key={n} className={`pill ${step >= n ? "on" : ""}`} />
        ))}
      </div>
    </div>
  );
}
