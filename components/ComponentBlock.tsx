"use client";

import { ComponentKey } from "@/lib/types";

// Shape of the profile data collected across the wizard.
export type ProfileData = {
  about_me: string;
  street_address: string;
  city: string;
  state: string;
  zip: string;
  birthdate: string;
};

type Props = {
  data: ProfileData;
  onChange: (patch: Partial<ProfileData>) => void;
};

// Renders a single data "component" (About Me / Address / Birthdate).
export function ComponentBlock({
  which,
  data,
  onChange,
}: Props & { which: ComponentKey }) {
  const today = new Date().toISOString().split("T")[0];

  if (which === "about_me") {
    return (
      <div className="group">
        <div className="group-head">About you</div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="about_me">Tell us a bit about yourself</label>
          <textarea
            id="about_me"
            className="textarea"
            placeholder="What do you do, and what brings you to SupportIQ?"
            value={data.about_me}
            onChange={(e) => onChange({ about_me: e.target.value })}
          />
        </div>
      </div>
    );
  }

  if (which === "address") {
    return (
      <div className="group">
        <div className="group-head">Mailing address</div>
        <div className="field">
          <label htmlFor="street">Street address</label>
          <input
            id="street"
            className="input"
            placeholder="123 Congress Ave"
            value={data.street_address}
            onChange={(e) => onChange({ street_address: e.target.value })}
          />
        </div>
        <div className="row-3">
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="city">City</label>
            <input
              id="city"
              className="input"
              placeholder="Austin"
              value={data.city}
              onChange={(e) => onChange({ city: e.target.value })}
            />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="state">State</label>
            <input
              id="state"
              className="input"
              placeholder="TX"
              value={data.state}
              onChange={(e) => onChange({ state: e.target.value })}
            />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="zip">ZIP</label>
            <input
              id="zip"
              className="input"
              placeholder="78701"
              value={data.zip}
              onChange={(e) => onChange({ zip: e.target.value })}
            />
          </div>
        </div>
      </div>
    );
  }

  // birthdate
  return (
    <div className="group">
      <div className="group-head">Date of birth</div>
      <div className="field" style={{ marginBottom: 0 }}>
        <label htmlFor="birthdate">Select your birthdate</label>
        <input
          id="birthdate"
          type="date"
          className="input"
          max={today}
          value={data.birthdate}
          onChange={(e) => onChange({ birthdate: e.target.value })}
        />
      </div>
    </div>
  );
}
