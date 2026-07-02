"use client";

import { useEffect, useMemo, useState } from "react";
import { UserRecord } from "@/lib/types";

const PAGE_SIZE = 5;

export default function DataPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/users", { cache: "no-store" });
    if (res.ok) {
      const { users } = await res.json();
      setUsers(users);
      setPage(1);
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

  const pageCount = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageUsers = useMemo(
    () => users.slice(pageStart, pageStart + PAGE_SIZE),
    [pageStart, users]
  );
  const visibleStart = users.length === 0 ? 0 : pageStart + 1;
  const visibleEnd = Math.min(pageStart + PAGE_SIZE, users.length);

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
          <div className="table-inner">
            <div className="table-shell">
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
                  {pageUsers.map((u) => (
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
            </div>
            <div className="table-footer">
              <span>
                Showing {visibleStart}-{visibleEnd} of {users.length}
              </span>
              <div className="pager">
                <button
                  className="pager-btn"
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                >
                  Previous
                </button>
                <span className="pager-status">
                  Page {currentPage} of {pageCount}
                </span>
                <button
                  className="pager-btn"
                  type="button"
                  disabled={currentPage === pageCount}
                  onClick={() =>
                    setPage((value) => Math.min(pageCount, value + 1))
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </div>
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
