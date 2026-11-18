"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const GREEN = "#22C55E";

const supabase =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
    : null;

function SearchIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}

function LoveIcon({ on }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={on ? GREEN : "none"} stroke={on ? GREEN : "#fff"} strokeWidth="2" strokeLinejoin="round">
      <path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round">
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12M7 8l5-5 5 5" />
      <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
    </svg>
  );
}

function MovieCard({ movie }) {
  const [loved, setLoved] = useState(false);

  async function onShare() {
    const url = `${window.location.origin}/movie/${movie.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: movie.title, url });
      } catch (e) {}
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    }
  }

  return (
    <div className="mb-6">
      <Link href={`/movie/${movie.id}`} className="block">
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-white/10">
          {movie.cover_url ? (
            <img
              src={movie.cover_url}
              alt={movie.title}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
      </Link>

      <div className="mt-3 px-1">
        <Link href={`/movie/${movie.id}`}>
          <h2 className="text-lg font-bold leading-tight">{movie.title}</h2>
        </Link>
        <p className="mt-1 text-sm text-gray-400">
          {movie.genre} • {movie.plays || 0} plays
        </p>
        <Link href={`/u/${movie.username}`} className="mt-1 inline-block text-sm" style={{ color: GREEN }}>
          @{movie.username}
        </Link>

        <div className="mt-3 flex items-center gap-6">
          <button type="button" onClick={() => setLoved(!loved)} className="flex items-center gap-2 text-sm">
            <LoveIcon on={loved} />
            <span>Love</span>
          </button>
          <Link href={`/movie/${movie.id}`} className="flex items-center gap-2 text-sm">
            <CommentIcon />
            <span>Comment</span>
          </Link>
          <button type="button" onClick={onShare} className="flex items-center gap-2 text-sm">
            <ShareIcon />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("movies")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      setMovies(data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <main className="px-4">
      <header className="flex items-center justify-between py-4">
        <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: GREEN }}>
          EVA
        </h1>
        <div className="flex items-center gap-5">
          <button type="button" aria-label="Search">
            <SearchIcon />
          </button>
          <button type="button" aria-label="Notifications">
            <BellIcon />
          </button>
        </div>
      </header>

      {loading ? (
        <p className="py-10 text-center text-gray-400">Loading...</p>
      ) : movies.length === 0 ? (
        <p className="py-10 text-center text-gray-400">No movies yet</p>
      ) : (
        movies.map((m) => <MovieCard key={m.id} movie={m} />)
      )}
    </main>
  );
    }
