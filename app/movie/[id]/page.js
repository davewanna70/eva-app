"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const GREEN = "#22C55E";

const supabase =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
    : null;

function fmt(t) {
  if (!t || isNaN(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export default function MoviePlayerPage() {
  const { id } = useParams();

  const boxRef = useRef(null);
  const vidRef = useRef(null);
  const last = useRef({ t: 0, zone: "" });
  const tapTimer = useRef(null);
  const flashTimer = useRef(null);

  const [movie, setMovie] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | missing
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [flash, setFlash] = useState(null);
  const [loved, setLoved] = useState(false);

  useEffect(() => {
    async function load() {
      if (!supabase) return setState("missing");
      const { data } = await supabase
        .from("movies")
        .select("*")
        .eq("id", id)
        .eq("status", "approved")
        .maybeSingle();
      if (!data) return setState("missing");
      setMovie(data);
      setState("ready");
    }
    load();
  }, [id]);

  function togglePlay() {
    const v = vidRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }

  function seekBy(sec) {
    const v = vidRef.current;
    if (!v) return;
    const max = v.duration || 0;
    v.currentTime = Math.max(0, Math.min(max, v.currentTime + sec));
    setFlash(sec > 0 ? "+10s >>" : "<< -10s");
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 1000);
  }

  // Movie gestures: tap centre = pause/play, double tap right = +10s, double tap left = -10s
  // Double tap centre does NOTHING (not Like - that is for Short only)
  function onScreenTap(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const zone = x < 0.33 ? "left" : x > 0.67 ? "right" : "center";
    const now = Date.now();

    if (now - last.current.t < 300 && last.current.zone === zone) {
      clearTimeout(tapTimer.current);
      last.current.t = 0;
      if (zone === "left") seekBy(-10);
      if (zone === "right") seekBy(10);
      return;
    }

    last.current = { t: now, zone };
    clearTimeout(tapTimer.current);
    if (zone === "center") {
      tapTimer.current = setTimeout(togglePlay, 300);
    }
  }

  function onScrub(e) {
    const v = vidRef.current;
    if (!v) return;
    v.currentTime = Number(e.target.value);
    setCur(v.currentTime);
  }

  function goFullscreen() {
    const v = vidRef.current;
    const box = boxRef.current;
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }
    if (box && box.requestFullscreen) box.requestFullscreen();
    else if (v && v.webkitEnterFullscreen) v.webkitEnterFullscreen();
  }

  async function onShare() {
    const url = `${window.location.origin}/movie/${id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: movie.title, url });
      } catch (e) {}
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    }
  }

  if (state === "loading") {
    return <p className="py-20 text-center text-gray-400">Loading...</p>;
  }

  if (state === "missing") {
    return <p className="py-20 text-center text-gray-400">Movie not found</p>;
  }

  return (
    <main>
      {/* Player */}
      <div ref={boxRef} className="relative aspect-video w-full bg-black">
        <video
          ref={vidRef}
          src={movie.video_url}
          poster={movie.cover_url || undefined}
          playsInline
          preload="auto"
          className="h-full w-full bg-black object-contain"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setCur(e.target.currentTime)}
          onLoadedMetadata={(e) => setDur(e.target.duration)}
        />

        {/* Title only on screen */}
        <p className="pointer-events-none absolute left-3 top-3 text-base font-bold drop-shadow">
          {movie.title}
        </p>

        {/* Gesture area (leaves room for the bottom controls) */}
        <div
          className="absolute left-0 right-0 top-0"
          style={{ bottom: 56, touchAction: "manipulation" }}
          onClick={onScreenTap}
        />

        {/* +10s / -10s flash */}
        {flash && (
          <div
            className="pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-4 py-2 text-lg font-extrabold"
            style={flash.startsWith("+") ? { right: "12%" } : { left: "12%" }}
          >
            {flash}
          </div>
        )}

        {/* Bottom controls: progress bar, time, play/pause, full screen */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-3 pb-2 pt-4">
          <input
            type="range"
            min="0"
            max={dur || 0}
            step="0.1"
            value={cur}
            onChange={onScrub}
            className="h-1 w-full"
            style={{ accentColor: GREEN }}
          />
          <div className="mt-1 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button type="button" aria-label="Play or pause" onClick={togglePlay}>
                {playing ? (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff">
                    <path d="M7 4l13 8-13 8z" />
                  </svg>
                )}
              </button>
              <span className="text-xs text-gray-200">
                {fmt(cur)} / {fmt(dur)}
              </span>
            </div>
            <button type="button" aria-label="Full screen" onClick={goFullscreen}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Under video: Title, Description, Genre, Love / Comment / Share */}
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-extrabold leading-tight">{movie.title}</h1>
        <p className="mt-2 text-sm text-gray-300">{movie.description}</p>
        <p className="mt-2 text-sm font-semibold" style={{ color: GREEN }}>
          {movie.genre}
        </p>

        <div className="mt-4 flex items-center gap-8">
          <button type="button" onClick={() => setLoved(!loved)} className="flex items-center gap-2 text-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill={loved ? GREEN : "none"} stroke={loved ? GREEN : "#fff"} strokeWidth="2" strokeLinejoin="round">
              <path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z" />
            </svg>
            Love
          </button>
          <button type="button" className="flex items-center gap-2 text-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round">
              <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
            </svg>
            Comment
          </button>
          <button type="button" onClick={onShare} className="flex items-center gap-2 text-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12M7 8l5-5 5 5" />
              <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
            </svg>
            Share
          </button>
        </div>
      </div>
    </main>
  );
      }
