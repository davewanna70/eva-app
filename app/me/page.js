"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const GREEN = "#22C55E";

// Until login is built, this is a fixed sample user
const ME = { name: "Ben", username: "davewanna", role: "ADMIN" };

const supabase =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
    : null;

const TABS = ["My Movies", "My Shorts", "Saved", "Liked"];

export default function MePage() {
  const photoRef = useRef(null);
  const uploadRef = useRef(null);

  const [photo, setPhoto] = useState("");
  const [bio, setBio] = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const [tab, setTab] = useState("My Movies"); // default
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    async function load() {
      if (!supabase) return;
      const { data } = await supabase
        .from("movies")
        .select("*")
        .eq("username", ME.username)
        .order("created_at", { ascending: false });
      setMovies(data || []);
    }
    load();
  }, []);

  function pickPhoto(e) {
    const f = e.target.files && e.target.files[0];
    if (f) setPhoto(URL.createObjectURL(f));
    e.target.value = "";
  }

  function onUpload(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    // Next step: after picking, show "Post as Short" or "Submit as Movie"
    e.target.value = "";
  }

  async function onShare() {
    const url = `${window.location.origin}/u/${ME.username}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: ME.name, url });
      } catch (e) {}
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    }
  }

  const stat = "flex flex-1 flex-col items-center rounded-2xl bg-white/10 py-5";

  return (
    <main className="px-4">
      {/* Top: Me + Settings. No banner. */}
      <header className="relative flex items-center justify-center rounded-2xl bg-white/10 py-4">
        <h1 className="text-3xl font-extrabold">Me</h1>
        <button type="button" aria-label="Settings" className="absolute right-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
          </svg>
        </button>
      </header>

      {/* Left: big photo + green + . Right: name and username */}
      <div className="mt-6 flex items-center gap-5">
        <div className="relative h-32 w-32 shrink-0">
          <div className="h-32 w-32 overflow-hidden rounded-full bg-white/15">
            {photo ? (
              <img src={photo} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-5xl font-extrabold">
                {ME.name[0]}
              </div>
            )}
          </div>
          <button
            type="button"
            aria-label="Change photo"
            onClick={() => photoRef.current && photoRef.current.click()}
            className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: GREEN, boxShadow: "0 0 0 3px #000" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={pickPhoto} />
        </div>

        <div className="min-w-0">
          <p className="flex items-center gap-2 text-3xl font-extrabold">
            {ME.name}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#3B82F6">
              <circle cx="12" cy="12" r="11" />
              <path d="M7 12.5l3.5 3.5L17 9" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </p>
          <p className="mt-1 text-lg text-gray-400">@{ME.username}</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex gap-3">
        <button type="button" className="flex-1 rounded-full border-2 border-white py-3 text-base font-bold">
          Edit Profile
        </button>
        <button type="button" onClick={onShare} className="flex-1 rounded-full border-2 border-white py-3 text-base font-bold">
          Share
        </button>
        <button
          type="button"
          onClick={() => uploadRef.current && uploadRef.current.click()}
          className="flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-base font-bold text-white"
          style={{ background: GREEN }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 15V3M7 8l5-5 5 5" />
            <path d="M5 13v6a2 2 0 0 0 2 2h14" />
          </svg>
          Upload
        </button>
        {/* Gallery straight, Photo + Video together, no menu */}
        <input ref={uploadRef} type="file" accept="image/*,video/*" className="hidden" onChange={onUpload} />
      </div>

      {/* Stats */}
      <div className="mt-5 flex gap-3">
        <div className={stat}>
          <span className="text-4xl font-extrabold">109</span>
          <span className="mt-1 text-base text-gray-300">My People</span>
        </div>
        <div className={stat}>
          <span className="text-4xl font-extrabold">7</span>
          <span className="mt-1 text-base text-gray-300">My Fans</span>
        </div>
        <div className={stat}>
          <span className="text-4xl font-extrabold">0</span>
          <span className="mt-1 text-base text-gray-300">My Love</span>
        </div>
      </div>

      {/* Bio */}
      <div className="mt-4">
        {editingBio ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write your bio"
              className="flex-1 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-base outline-none placeholder:text-gray-500"
            />
            <button
              type="button"
              onClick={() => setEditingBio(false)}
              className="rounded-xl px-4 py-3 font-bold text-black"
              style={{ background: GREEN }}
            >
              Save
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setEditingBio(true)} className="text-base text-gray-300">
            {bio ? bio : "+ Add bio"}
          </button>
        )}
      </div>

      {/* Admin Dashboard - only for ADMIN */}
      {ME.role === "ADMIN" && (
        <Link
          href="/admin"
          className="mt-4 block rounded-xl border-2 py-3 text-center text-base font-bold"
          style={{ borderColor: GREEN, color: GREEN }}
        >
          Admin Dashboard
        </Link>
      )}

      {/* Tabs */}
      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="shrink-0 rounded-xl px-4 py-3 text-base font-bold"
            style={{
              background: tab === t ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.07)",
              color: tab === t ? "#fff" : "#9CA3AF",
              borderBottom: tab === t ? "3px solid #fff" : "3px solid transparent",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {tab === "My Movies" &&
          (movies.length === 0 ? (
            <p className="py-10 text-center text-gray-400">No movies yet</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {movies.map((m) => (
                <div key={m.id} className="overflow-hidden rounded-2xl bg-white/10">
                  <div className="relative aspect-[3/4] w-full bg-white/10">
                    {m.cover_url ? (
                      <img src={m.cover_url} alt={m.title} className="h-full w-full object-cover" />
                    ) : null}
                    {m.status !== "approved" && (
                      <span
                        className="absolute left-2 top-2 rounded-full px-2 py-1 text-xs font-bold text-black"
                        style={{ background: m.status === "rejected" ? "#F87171" : "#FBBF24" }}
                      >
                        {m.status === "rejected" ? "Rejected" : "Pending"}
                      </span>
                    )}
                  </div>
                  <div className="p-3 text-center">
                    <p className="truncate text-base font-bold">{m.title}</p>
                    <p className="text-sm text-gray-400">{m.plays || 0} plays</p>
                  </div>
                </div>
              ))}
            </div>
          ))}

        {tab === "My Shorts" && <p className="py-10 text-center text-gray-400">No shorts yet</p>}
        {tab === "Saved" && <p className="py-10 text-center text-gray-400">Nothing saved yet</p>}
        {tab === "Liked" && <p className="py-10 text-center text-gray-400">Nothing liked yet</p>}
      </div>
    </main>
  );
    }
