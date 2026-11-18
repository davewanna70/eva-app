"use client";

import Link from "next/link";
import { useState } from "react";

const GREEN = "#22C55E";

// SAMPLE DATA - replace with Supabase later
const GIST = [
  { id: 1, name: "Adaeze", text: "started following you", time: "2m ago" },
  { id: 2, name: "Chinedu", text: "liked your video", time: "15m ago" },
  { id: 3, name: "Funke", text: "liked your comment", time: "1h ago" },
  { id: 4, name: "Tunde", text: "replied to your comment", time: "2h ago", reply: "True talk" },
];

const REQUESTS = [
  { id: 1, name: "Kemi", note: "doesn't follow you" },
  { id: 2, name: "Ibrahim", note: "doesn't follow you" },
];

function Avatar({ name }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-base font-bold">
      {name[0]}
    </div>
  );
}

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={GREEN}>
      <circle cx="12" cy="12" r="11" />
      <path d="M7 12.5l3.5 3.5L17 9" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ChatPage() {
  const [tab, setTab] = useState("gist"); // Your Gist is default
  const [requests, setRequests] = useState(REQUESTS);

  function removeRequest(id) {
    setRequests((r) => r.filter((x) => x.id !== id));
  }

  return (
    <main className="px-4">
      <h1 className="py-4 text-3xl font-extrabold">Chat</h1>

      {/* Always pinned on top */}
      <Link
        href="/chat/submit"
        className="mb-4 flex items-center justify-between rounded-2xl border border-white/15 bg-white/5 px-4 py-3"
      >
        <div>
          <div className="flex items-center gap-2 text-base font-bold">
            EVA Official <Check />
          </div>
          <p className="mt-1 text-lg font-bold">Submit Your Movie</p>
        </div>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </Link>

      {/* Tabs */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setTab("faces")}
          className="rounded-xl py-3 text-base font-bold"
          style={{
            background: tab === "faces" ? "rgba(255,255,255,0.12)" : "transparent",
            color: tab === "faces" ? GREEN : "#9CA3AF",
            borderBottom: tab === "faces" ? `2px solid ${GREEN}` : "2px solid transparent",
          }}
        >
          New Faces
        </button>
        <button
          type="button"
          onClick={() => setTab("gist")}
          className="rounded-xl py-3 text-base font-bold"
          style={{
            background: tab === "gist" ? "rgba(255,255,255,0.12)" : "transparent",
            color: tab === "gist" ? GREEN : "#9CA3AF",
            borderBottom: tab === "gist" ? `2px solid ${GREEN}` : "2px solid transparent",
          }}
        >
          Your Gist
        </button>
      </div>

      {/* Your Gist */}
      {tab === "gist" && (
        <div>
          {GIST.map((g) => (
            <div key={g.id} className="mb-4 flex items-center gap-3">
              <Avatar name={g.name} />
              <div className="min-w-0 flex-1 text-sm">
                <p>
                  <b>{g.name}</b> {g.text} <span className="text-gray-400">• {g.time}</span>
                </p>
                {g.reply && <p className="mt-0.5 font-semibold" style={{ color: GREEN }}>{g.reply}</p>}
              </div>
              {/* small thumbnail on the right */}
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M7 4l13 8-13 8z" /></svg>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Faces */}
      {tab === "faces" && (
        <div>
          {requests.length === 0 && (
            <p className="py-10 text-center text-gray-400">No message requests</p>
          )}
          {requests.map((r) => (
            <div key={r.id} className="mb-4 flex items-center gap-3">
              <Avatar name={r.name} />
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-bold">{r.name} wants to message you</p>
                <p className="text-gray-400">{r.note}</p>
              </div>
              <button
                type="button"
                onClick={() => removeRequest(r.id)}
                className="rounded-lg px-3 py-2 text-sm font-bold text-black"
                style={{ background: GREEN }}
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => removeRequest(r.id)}
                className="rounded-lg border border-white/25 px-3 py-2 text-sm font-bold"
              >
                Ignore
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
          }
