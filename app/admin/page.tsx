"use client";

import { useEffect, useState } from "react";
import {
  ALL_COMPONENTS,
  COMPONENT_LABELS,
  ComponentKey,
  DEFAULT_CONFIG,
  PageConfig,
} from "@/lib/types";

export default function AdminPage() {
  const [config, setConfig] = useState<PageConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<
    { type: "ok" | "error"; msg: string } | null
  >(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/config", { cache: "no-store" });
      if (res.ok) setConfig(await res.json());
      setLoading(false);
    })();
  }, []);

  // Toggle a component's presence on a given page. Enforce >= 1 per page.
  function toggle(page: "page2" | "page3", comp: ComponentKey) {
    setStatus(null);
    setConfig((prev) => {
      const current = prev[page];
      const has = current.includes(comp);
      let next: ComponentKey[];
      if (has) {
        // Prevent removing the last component from a page.
        if (current.length === 1) {
          setStatus({
            type: "error",
            msg: "Each page must keep at least one component.",
          });
          return prev;
        }
        next = current.filter((c) => c !== comp);
      } else {
        next = [...current, comp];
      }
      return { ...prev, [page]: next };
    });
  }

  async function save() {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const json = await res.json();
      if (!res.ok) {
        setStatus({ type: "error", msg: json.error || "Could not save." });
      } else {
        setConfig(json);
        setStatus({ type: "ok", msg: "Saved. The onboarding flow is updated." });
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="center-load">Loading admin…</div>;

  return (
    <div className="admin-wrap">
      <div className="topbar" style={{ marginBottom: 32 }}>
        <a className="link" href="/">← Onboarding</a>
        <a className="link" href="/data">View data →</a>
      </div>

      <h1 className="admin-head">Onboarding layout</h1>
      <p className="admin-sub">
        Choose which fields appear on each step of the signup flow. Steps 2 and
        3 each need at least one field.
      </p>

      {status && (
        <div
          className={`alert ${status.type === "ok" ? "alert-info" : "alert-error"}`}
        >
          {status.msg}
        </div>
      )}

      <div className="assign-grid">
        <PageColumn
          title="Step 2"
          hint="Shown right after account creation."
          page="page2"
          selected={config.page2}
          onToggle={toggle}
        />
        <PageColumn
          title="Step 3"
          hint="The final step before finishing."
          page="page3"
          selected={config.page3}
          onToggle={toggle}
        />
      </div>

      <div className="admin-actions">
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save layout"}
        </button>
        <span className="refresh-note">
          Changes apply to new onboarding sessions immediately.
        </span>
      </div>
    </div>
  );
}

function PageColumn({
  title,
  hint,
  page,
  selected,
  onToggle,
}: {
  title: string;
  hint: string;
  page: "page2" | "page3";
  selected: ComponentKey[];
  onToggle: (page: "page2" | "page3", comp: ComponentKey) => void;
}) {
  return (
    <div className="page-col">
      <h3>{title}</h3>
      <p className="hint">{hint}</p>
      {ALL_COMPONENTS.map((comp) => {
        const checked = selected.includes(comp);
        return (
          <div
            key={comp}
            className={`check-row ${checked ? "checked" : ""}`}
            onClick={() => onToggle(page, comp)}
            role="checkbox"
            aria-checked={checked}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onToggle(page, comp);
              }
            }}
          >
            <span className="check-box">{checked ? "✓" : ""}</span>
            <span className="check-label">{COMPONENT_LABELS[comp]}</span>
          </div>
        );
      })}
    </div>
  );
}
