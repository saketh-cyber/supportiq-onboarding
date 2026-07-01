"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ComponentKey } from "@/lib/types";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

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
  if (which === "about_me") {
    return (
      <div className="group group-about">
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
      <div className="group group-address">
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
  return <BirthdateSelector value={data.birthdate} onChange={onChange} />;
}

function BirthdateSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (patch: Partial<ProfileData>) => void;
}) {
  const today = useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();
  const selectedDate = value ? parseDate(value) : null;
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [viewMonth, setViewMonth] = useState(
    selectedDate?.getMonth() ?? today.getMonth()
  );
  const [viewYear, setViewYear] = useState(
    selectedDate?.getFullYear() ?? currentYear
  );
  const years = Array.from({ length: 121 }, (_, index) => currentYear - index);
  const days = getCalendarDays(viewYear, viewMonth);

  useEffect(() => {
    if (!isOpen) return;

    function closeOnOutsideClick(event: MouseEvent) {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  function chooseDate(day: number) {
    const next = new Date(viewYear, viewMonth, day);
    if (next > today) return;
    onChange({ birthdate: toDateValue(next) });
    setIsOpen(false);
  }

  return (
    <div className="group group-birthdate">
      <div className="group-head">Date of birth</div>
      <div className="field" style={{ marginBottom: 0 }}>
        <label>Select your birthdate</label>
        <div className="date-picker" ref={pickerRef}>
          <button
            type="button"
            className={`date-trigger ${value ? "selected" : ""}`}
            onClick={() => setIsOpen((open) => !open)}
          >
            <span>{selectedDate ? formatDate(selectedDate) : "Choose a date"}</span>
            <span className="chevron" aria-hidden="true" />
          </button>

          {isOpen && (
            <div className="date-panel">
              <div className="date-panel-head">
                <select
                  className="date-panel-select"
                  aria-label="Birth month"
                  value={viewMonth}
                  onChange={(e) => setViewMonth(Number(e.target.value))}
                >
                  {MONTHS.map((name, index) => (
                    <option key={name} value={index}>
                      {name}
                    </option>
                  ))}
                </select>

                <select
                  className="date-panel-select"
                  aria-label="Birth year"
                  value={viewYear}
                  onChange={(e) => setViewYear(Number(e.target.value))}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="date-weekdays" aria-hidden="true">
                {["S", "M", "T", "W", "T", "F", "S"].map((label, index) => (
                  <span key={`${label}-${index}`}>{label}</span>
                ))}
              </div>

              <div className="date-days">
                {days.map((day, index) => {
                  if (!day) return <span key={`blank-${index}`} />;
                  const date = new Date(viewYear, viewMonth, day);
                  const isSelected =
                    selectedDate &&
                    selectedDate.getFullYear() === viewYear &&
                    selectedDate.getMonth() === viewMonth &&
                    selectedDate.getDate() === day;
                  const isFuture = date > today;

                  return (
                    <button
                      key={day}
                      type="button"
                      className={isSelected ? "date-day selected" : "date-day"}
                      disabled={isFuture}
                      onClick={() => chooseDate(day)}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <div className="date-panel-foot">
                <button
                  type="button"
                  className="date-clear"
                  onClick={() => {
                    onChange({ birthdate: "" });
                    setIsOpen(false);
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
        <input type="hidden" name="birthdate" value={value} />
      </div>
    </div>
  );
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  return [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: totalDays }, (_, index) => index + 1),
  ];
}
