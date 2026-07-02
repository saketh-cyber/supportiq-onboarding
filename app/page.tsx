"use client";

import { useEffect, useState } from "react";
import { Rail, MobileSteps } from "@/components/Rail";
import { ComponentBlock, ProfileData } from "@/components/ComponentBlock";
import {
  ComponentKey,
  DEFAULT_CONFIG,
  PageConfig,
} from "@/lib/types";

const EMPTY_PROFILE: ProfileData = {
  about_me: "",
  street_address: "",
  city: "",
  state: "",
  zip: "",
  birthdate: "",
};

// We remember the active user's id in a cookie so that if they leave mid-flow
// and come back, we can resume them at their saved step. (Per the spec, resume
// only applies once an email + password has been submitted.)
const USER_COOKIE = "siq_uid";

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${60 * 60 * 24 * 30}`;
}
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}
function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [config, setConfig] = useState<PageConfig>(DEFAULT_CONFIG);

  // On first load: fetch the admin config, and resume an in-progress user.
  useEffect(() => {
    (async () => {
      try {
        const cfgRes = await fetch("/api/config", { cache: "no-store" });
        if (cfgRes.ok) setConfig(await cfgRes.json());

        const uid = getCookie(USER_COOKIE);
        if (uid) {
          const res = await fetch("/api/users", { cache: "no-store" });
          if (res.ok) {
            const { users } = await res.json();
            const me = users.find((u: any) => u.id === uid);
            if (me) {
              setUserId(me.id);
              setEmail(me.email);
              setProfile({
                about_me: me.about_me ?? "",
                street_address: me.street_address ?? "",
                city: me.city ?? "",
                state: me.state ?? "",
                zip: me.zip ?? "",
                birthdate: me.birthdate ?? "",
              });
              // Resume at their saved step (2, 3, or 4 = done).
              setStep(me.current_step >= 4 ? 4 : me.current_step);
              setInfo("Welcome back — we picked up where you left off.");
            } else {
              clearCookie(USER_COOKIE);
            }
          }
        }
      } catch {
        // Non-fatal; user can still start fresh.
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function patchProfile(patch: Partial<ProfileData>) {
    setProfile((p) => ({ ...p, ...patch }));
  }

  // Step 1 — create or resume the account.
  async function submitAccount() {
    setError(null);
    if (!email.trim() || !password) {
      setError("Please enter both an email and a password.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", email, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Something went wrong.");
        return;
      }
      setUserId(json.user.id);
      setCookie(USER_COOKIE, json.user.id);
      if (json.resumed) {
        setProfile({
          about_me: json.user.about_me ?? "",
          street_address: json.user.street_address ?? "",
          city: json.user.city ?? "",
          state: json.user.state ?? "",
          zip: json.user.zip ?? "",
          birthdate: json.user.birthdate ?? "",
        });
        setStep(json.user.current_step >= 4 ? 4 : json.user.current_step);
        setInfo("Welcome back — we picked up where you left off.");
      } else {
        setStep(2);
      }
    } finally {
      setBusy(false);
    }
  }

  // Persist current profile + advance/retreat to a target step.
  async function saveAndGo(targetStep: number) {
    if (!userId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id: userId,
          about_me: profile.about_me || null,
          street_address: profile.street_address || null,
          city: profile.city || null,
          state: profile.state || null,
          zip: profile.zip || null,
          birthdate: profile.birthdate || null,
          current_step: targetStep,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Could not save your changes. Please try again.");
        return;
      }
      setStep(targetStep);
    } finally {
      setBusy(false);
    }
  }

  function startOver() {
    clearCookie(USER_COOKIE);
    setUserId(null);
    setEmail("");
    setPassword("");
    setProfile(EMPTY_PROFILE);
    setStep(1);
    setInfo(null);
    setError(null);
  }

  if (loading) {
    return <div className="center-load">Loading…</div>;
  }

  const activeComponents =
    step === 2 ? config.page2 : step === 3 ? config.page3 : [];
  const isCompactCard = activeComponents.length >= 3;

  return (
    <div className="shell">
      <Rail step={step} />
      <main className={isCompactCard ? "main main-compact" : "main"}>
        <div className={isCompactCard ? "card card-compact" : "card"}>
          <MobileSteps step={step} />

          {info && step !== 4 && <div className="alert alert-info">{info}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          {step === 1 && (
            <Step1
              email={email}
              password={password}
              setEmail={setEmail}
              setPassword={setPassword}
              onNext={submitAccount}
              busy={busy}
            />
          )}

          {step === 2 && (
            <StepComponents
              pageNumber={2}
              components={config.page2}
              profile={profile}
              patch={patchProfile}
              onBack={undefined}
              onNext={() => saveAndGo(3)}
              busy={busy}
            />
          )}

          {step === 3 && (
            <StepComponents
              pageNumber={3}
              components={config.page3}
              profile={profile}
              patch={patchProfile}
              onBack={() => saveAndGo(2)}
              onNext={() => saveAndGo(4)}
              busy={busy}
              isFinal
            />
          )}

          {step === 4 && <StepDone email={email} onReset={startOver} />}
        </div>
      </main>
    </div>
  );
}

/* ---------------- Step 1: account ---------------- */
function Step1({
  email,
  password,
  setEmail,
  setPassword,
  onNext,
  busy,
}: {
  email: string;
  password: string;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  onNext: () => void;
  busy: boolean;
}) {
  return (
    <>
      <div className="eyebrow">Step 1 of 3</div>
      <h1 className="title">Create your account</h1>
      <p className="subtitle">
        Start with your login. You can finish the rest in under a minute.
      </p>

      <div className="field">
        <label htmlFor="email">Work email</label>
        <input
          id="email"
          type="email"
          className="input"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onNext()}
        />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          className="input"
          placeholder="Choose a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onNext()}
        />
      </div>

      <div className="actions">
        <span className="spacer" />
        <button className="btn btn-primary" onClick={onNext} disabled={busy}>
          {busy ? "Setting up…" : "Continue"}
        </button>
      </div>
    </>
  );
}

/* ---------------- Steps 2 & 3: configurable components ---------------- */
function StepComponents({
  pageNumber,
  components,
  profile,
  patch,
  onBack,
  onNext,
  busy,
  isFinal,
}: {
  pageNumber: number;
  components: ComponentKey[];
  profile: ProfileData;
  patch: (p: Partial<ProfileData>) => void;
  onBack?: () => void;
  onNext: () => void;
  busy: boolean;
  isFinal?: boolean;
}) {
  return (
    <div className={components.length >= 3 ? "step-form step-form-compact" : "step-form"}>
      <div className="eyebrow">Step {pageNumber} of 3</div>
      <h1 className="title">
        {isFinal ? "Last few details" : "Fill in your details"}
      </h1>
      <p className="subtitle">
        These fields were configured by your workspace admin.
      </p>

      <div className={components.length >= 3 ? "component-list component-list-dense" : "component-list"}>
        {components.map((c) => (
          <ComponentBlock key={c} which={c} data={profile} onChange={patch} />
        ))}
      </div>

      <div className="actions">
        {onBack ? (
          <button className="btn btn-ghost" onClick={onBack} disabled={busy}>
            Back
          </button>
        ) : null}
        <span className="spacer" />
        <button className="btn btn-primary" onClick={onNext} disabled={busy}>
          {busy ? "Saving…" : isFinal ? "Finish setup" : "Continue"}
        </button>
      </div>
    </div>
  );
}

/* ---------------- Step 4: done ---------------- */
function StepDone({
  email,
  onReset,
}: {
  email: string;
  onReset: () => void;
}) {
  return (
    <div className="done-wrap">
      <div className="done-check">✓</div>
      <h1 className="title">You&apos;re all set</h1>
      <p className="subtitle">
        Your SupportIQ workspace is ready for {email}. Our team will reach out
        with next steps.
      </p>
      <button className="btn btn-ghost" onClick={onReset}>
        Start a new onboarding
      </button>
    </div>
  );
}
