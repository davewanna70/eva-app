"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const GREEN = "#22C55E";

// Until login is built, this is a fixed sample user
const ME = { username: "davewanna", role: "ADMIN" };

const supabase =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
    : null;

const TABS = ["pending", "approved", "rejected"];

export default function AdminPage() {
  const [tab, setTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState(null);
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("movies")
      .select("*")
      .eq("status", tab)
      .order("created_at", { ascending: false });
    setMovies(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [tab]);

  async function approve(id) {
    setMsg("");
    const { error } = await supabase
      .from("movies")
      .update({ status: "approved", reject_reason: null })
      .eq("id", id);
    if (error) return setMsg("Failed. Try again.");
    setMovies((m) => m.filter((x) => x.id !== id));
  }

  async function reject(id) {
    setMsg("");
    if (!reason.trim()) return setMsg("Type the reason first");
    const { error } = await supabase
      .from("movies")
      .update({ status: "rejected", reject_reason: reason.trim() })
      .eq("id", id);
    if (error) return setMsg("Failed. Try again.");
    setMovies((m) => m.filter((x) => x.id !== id));
    setRejectId(null);
    setReason("");
  }

  // Only admin can see this page
  if (ME.role !== "ADMIN") {
    return <p className="py-20 text-center text-gray-400">Page not found</p>;
  }

  const q = search.trim().toLowerCase();
  const shown = movies.filter(
    (m) =>
      !q ||
      (m.title || "").toLowerCase().includes(q) ||
      (m.username || "").toLowerCase().includes(q)
  );

  return (
    <main className="px-4">
      <h1 className="py-4 text-3xl font-extrabold">Admin Dashboard</h1>

      {/* Search by title or username */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by title or username"
        className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-base outline-none placeholder:text-gray-500"
      />

      {/* Tabs */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="rounded-xl py-3 text-base font-bold capitalize"
            style={{
              background: tab === t ? "rgba(255,255,255,0.12)" : "transparent",
              color: tab === t ? GREEN : "#9CA3AF",
              borderBottom: tab === t ? `2px solid ${GREEN}` : "2px solid transparent",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {msg && <p className="mt-3 text-center text-sm font-semibold text-red-400">{msg}</p>}

      <div className="mt-4">
        {loading ? (
          <p className="py-10 text-center text-gray-400">Loading...</p>
        ) : shown.length === 0 ? (
          <p className="py-10 text-center text-gray-400">No {tab} movies</p>
        ) : (
          shown.map((m) => (
            <div key={m.id} className="mb-6 rounded-2xl bg-white/5 p-3">
              <div className="flex gap-3">
                <div className="h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-white/10">
                  {m.cover_url ? (
                    <img src={m.cover_url} alt={m.title} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold leading-tight">{m.title}</p>
                  <p className="mt-1 text-sm font-semibold" style={{ color: GREEN }}>{m.genre}</p>
                  <p className="mt-1 text-sm text-gray-400">By @{m.username}</p>
                  <p className="text-xs text-gray-500">
                    {m.created_at ? new Date(m.created_at).toLocaleString() : ""}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-sm text-gray-300">{m.description}</p>

              {/* Video to watch */}
              <video
                src={m.video_url}
                controls
                playsInline
                preload="metadata"
                className="mt-3 aspect-video w-full rounded-xl bg-black"
              />

              {tab === "rejected" && m.reject_reason && (
                <p className="mt-3 text-sm text-red-400">Reason: {m.reject_reason}</p>
              )}

              {/* Pending: Approve / Reject */}
              {tab === "pending" && (
                <div className="mt-3">
                  {rejectId === m.id ? (
                    <div>
                      <input
                        autoFocus
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Type reason"
                        className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-base outline-none placeholder:text-gray-500"
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => reject(m.id)}
                          className="flex-1 rounded-xl bg-red-500 py-3 font-bold text-white"
                        >
                          Send Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => { setRejectId(null); setReason(""); }}
                          className="flex-1 rounded-xl border border-white/25 py-3 font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => approve(m.id)}
                        className="flex-1 rounded-xl py-3 text-base font-extrabold text-black"
                        style={{ background: GREEN }}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => { setRejectId(m.id); setReason(""); setMsg(""); }}
                        className="flex-1 rounded-xl border-2 border-red-500 py-3 text-base font-extrabold text-red-400"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
          }
