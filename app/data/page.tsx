"use client";

import { useEffect, useState } from "react";
import { UserRecord } from "@/lib/types";

export default function DataPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/users", { cache: "no-store" });
    if (res.ok) {
      const { users } = await res.json();
      setUsers(users);
    }
    setLoading(false);
  }

  // Fetch on mount. Because this reads from the DB every time the page loads,
  // a manual browser refresh always reflects the latest submitted data.
  useEffect(() => {
    load();
  }, []);

  function stepBadge(step: number) {
    if (step >= 4)
      return <span className="badge">Completed</span>;
    return <span className="badge gray">Step {step} of 3</span>;
  }

  return (
    <div className="data-wrap">
      <div className="topbar" style={{ marginBottom: 28 }}>
        <a className="link" href="/">← Onboarding</a>
        <a className="link" href="/admin">Admin →</a>
      </div>

      <div className="data-head">
        <h1>User data</h1>
        <button className="btn btn-ghost" onClick={load}>
          Refresh
        </button>
      </div>
      <p className="data-sub">
        Live view of the users table. Refresh the page to see newly entered data.
      </p>

      <div className="table-scroll">
        {loading ? (
          <div className="empty">Loading…</div>
        ) : users.length === 0 ? (
          <div className="empty">
            No users yet. Complete the onboarding flow to see records here.
          </div>
        ) : (
          <table className="data">
            <thead>
              <tr>
                <th>Email</th>
                <th>Progress</th>
                <th>About me</th>
                <th>Address</th>
                <th>City</th>
                <th>State</th>
                <th>ZIP</th>
                <th>Birthdate</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>{stepBadge(u.current_step)}</td>
                  <td className="about-cell">
                    <ExpandableText text={u.about_me} />
                  </td>
                  <td>{u.street_address || "—"}</td>
                  <td>{u.city || "—"}</td>
                  <td>{u.state || "—"}</td>
                  <td>{u.zip || "—"}</td>
                  <td>{u.birthdate || "—"}</td>
                  <td className="mono">
                    {new Date(u.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function ExpandableText({ text }: { text: string | null }) {
  const [expanded, setExpanded] = useState(false);
  const value = text?.trim();

  if (!value) return <span className="muted-dash">—</span>;

  const isLong = value.length > 180;

  return (
    <div className="about-preview">
      <p className={expanded ? "about-text expanded" : "about-text"}>
        {value}
      </p>
      {isLong && (
        <button
          className="text-toggle"
          type="button"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
