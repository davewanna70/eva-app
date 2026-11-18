"use client";

import { useEffect, useRef, useState } from "react";

const GREEN = "#22C55E";
const B = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/";

// SAMPLE DATA - replace with Supabase later
const SHORTS = [
  {
    id: "1", username: "RealRose", caption: "Real Rose Challenge, no filter! Day 7 of my natural routine",
    sound: "Original sound - RealRose", video_url: B + "ForBiggerBlazes.mp4",
    love: 12300, comment: 482, share: 1200, save: 2100,
    facts: {
      entertainment: false,
      sources: [
        { name: "BBC", detail: "Report confirms the main claim in this video.", pct: 100 },
        { name: "Punch", detail: "Local coverage supports most details.", pct: 90 },
        { name: "EVA Fact Team", detail: "Checked and verified by our team.", pct: 95 },
      ],
    },
  },
  {
    id: "2", username: "Chinedu", caption: "Lagos traffic comedy",
    sound: "Original sound - Chinedu", video_url: B + "ForBiggerEscapes.mp4",
    love: 8400, comment: 120, share: 300, save: 900,
    facts: { entertainment: true, sources: [] },
  },
  {
    id: "3", username: "Adaeze", caption: "Sunday vibes",
    sound: "Amapiano Groove", video_url: B + "ForBiggerFun.mp4",
    love: 5100, comment: 90, share: 150, save: 400,
    facts: { entertainment: true, sources: [] },
  },
  {
    id: "4", username: "Funke", caption: "Weekend trip",
    sound: "Original sound - Funke", video_url: B + "ForBiggerJoyrides.mp4",
    love: 2200, comment: 40, share: 60, save: 100,
    facts: { entertainment: true, sources: [] },
  },
];

const fmt = (n) => (n >= 1000 ? (n / 1000).toFixed(1).replace(".0", "") + "K" : String(n));

function Btn({ label, onClick, children }) {
  return (
    <button type="button" onClick={onClick} className="pointer-events-auto flex flex-col items-center gap-1">
      {children}
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
}

export default function ShortPage() {
  const [cur, setCur] = useState(0);
  const [paused, setPaused] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [liked, setLiked] = useState({});
  const [saved, setSaved] = useState({});
  const [comments, setComments] = useState({});
  const [text, setText] = useState("");
  const [sheet, setSheet] = useState(null); // null | "comments" | "bars" | "source"
  const [toast, setToast] = useState("");
  const [heart, setHeart] = useState(false);

  const vids = useRef({});
  const g = useRef({ y: 0, press: null, long: false, moved: false, last: 0, tap: null });

  const s = SHORTS[cur];

  useEffect(() => {
    SHORTS.forEach((x, i) => {
      const v = vids.current[x.id];
      if (!v) return;
      v.muted = !soundOn;
      if (i === cur && !paused && !sheet) v.play().catch(() => {});
      else v.pause();
    });
  }, [cur, paused, soundOn, sheet]);

  function showToast(t) {
    setToast(t);
    setTimeout(() => setToast(""), 1500);
  }

  function next() { setCur((c) => Math.min(c + 1, SHORTS.length - 1)); setPaused(false); }
  function prev() { setCur((c) => Math.max(c - 1, 0)); setPaused(false); }

  function likeIt() {
    setLiked((l) => ({ ...l, [s.id]: true }));
    setHeart(true);
    setTimeout(() => setHeart(false), 700);
  }

  function down(e) {
    g.current.y = e.clientY;
    g.current.moved = false;
    g.current.long = false;
    g.current.press = setTimeout(() => {
      g.current.long = true;
      setSheet("comments");
    }, 500);
  }
  function move(e) {
    if (Math.abs(e.clientY - g.current.y) > 12) {
      g.current.moved = true;
      clearTimeout(g.current.press);
    }
  }
  function up(e) {
    clearTimeout(g.current.press);
    const dy = e.clientY - g.current.y;
    if (Math.abs(dy) > 50) { dy < 0 ? next() : prev(); return; }
    if (g.current.long || g.current.moved) return;
    setSoundOn(true);
    const now = Date.now();
    if (now - g.current.last < 260) {
      clearTimeout(g.current.tap);
      g.current.last = 0;
      likeIt();
    } else {
      g.current.last = now;
      g.current.tap = setTimeout(() => setPaused((p) => !p), 260);
    }
  }

  function copyLink() {
    const url = `${window.location.origin}/short/${s.id}`;
    if (navigator.clipboard) navigator.clipboard.writeText(url);
    setSheet(null);
    showToast("Link copied!");
  }

  function sendComment() {
    if (!text.trim()) return;
    setComments((c) => ({ ...c, [s.id]: [...(c[s.id] || []), { user: "davewanna", text: text.trim() }] }));
    setText("");
  }

  const list = comments[s.id] || [];
  const avg = s.facts.sources.length
    ? Math.round(s.facts.sources.reduce((a, b) => a + b.pct, 0) / s.facts.sources.length)
    : 0;

  return (
    <div className="fixed left-0 right-0 top-0 z-10 bg-black" style={{ bottom: 104 }}>
      <div className="relative mx-auto h-full w-full max-w-md overflow-hidden">
        {/* Videos: current + 2 next preloaded, 1 previous */}
        <div
          className="absolute inset-0"
          style={{ touchAction: "none" }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={() => clearTimeout(g.current.press)}
        >
          {SHORTS.map((x, i) =>
            i >= cur - 1 && i <= cur + 2 ? (
              <video
                key={x.id}
                ref={(el) => (vids.current[x.id] = el)}
                src={x.video_url}
                preload="auto"
                loop
                playsInline
                muted
                className="absolute inset-0 h-full w-full object-cover"
                style={{ transform: `translateY(${(i - cur) * 100}%)`, transition: "transform 0.25s" }}
              />
            ) : null
          )}
        </div>

        {/* Top tabs (visual) */}
        <div className="pointer-events-none absolute left-0 right-0 top-0 flex justify-center gap-6 pt-4 text-base font-semibold">
          <span className="text-gray-300">Following</span>
          <span className="text-gray-300">Friends</span>
          <span style={{ color: GREEN, borderBottom: `2px solid ${GREEN}` }}>For You</span>
        </div>

        {paused && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <svg width="72" height="72" viewBox="0 0 24 24" fill="#fff" opacity="0.8"><path d="M7 4l13 8-13 8z" /></svg>
          </div>
        )}
        {heart && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <svg width="110" height="110" viewBox="0 0 24 24" fill={GREEN}><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z" /></svg>
          </div>
        )}

        {/* Right buttons */}
        <div className="pointer-events-none absolute bottom-24 right-3 flex flex-col items-center gap-5">
          <Btn label={fmt(s.love + (liked[s.id] ? 1 : 0))} onClick={() => setLiked((l) => ({ ...l, [s.id]: !l[s.id] }))}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill={liked[s.id] ? GREEN : "none"} stroke={liked[s.id] ? GREEN : "#fff"} strokeWidth="2" strokeLinejoin="round"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z" /></svg>
          </Btn>
          <Btn label={fmt(s.comment + list.length)} onClick={() => setSheet("comments")}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></svg>
          </Btn>
          <Btn
            label={fmt(s.share)}
            onClick={async () => {
              const url = `${window.location.origin}/short/${s.id}`;
              if (navigator.share) { try { await navigator.share({ url }); } catch (e) {} }
              else { if (navigator.clipboard) navigator.clipboard.writeText(url); showToast("Link copied!"); }
            }}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M7 8l5-5 5 5" /><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" /></svg>
          </Btn>
          <Btn label="Source" onClick={() => setSheet("bars")}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M8.5 12l2.5 2.5 4.5-5" strokeLinecap="round" /></svg>
          </Btn>
          <Btn label={fmt(s.save + (saved[s.id] ? 1 : 0))} onClick={() => setSaved((v) => ({ ...v, [s.id]: !v[s.id] }))}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill={saved[s.id] ? GREEN : "none"} stroke={saved[s.id] ? GREEN : "#fff"} strokeWidth="2" strokeLinejoin="round"><path d="M6 3h12v18l-6-4-6 4z" /></svg>
          </Btn>
        </div>

        {/* Bottom left info */}
        <div className="pointer-events-none absolute bottom-16 left-3 right-20">
          <p className="text-lg font-bold">@{s.username}</p>
          <p className="mt-1 text-sm">{s.caption}</p>
          <p className="mt-1 text-xs text-gray-300">♫ {s.sound}</p>
        </div>

        {/* Comment bar - always there */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendComment()}
            placeholder="Add a comment..."
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-300"
          />
          <button type="button" onClick={sendComment} className="text-sm font-bold" style={{ color: GREEN }}>Send</button>
        </div>

        {/* Sheets */}
        {sheet && (
          <div className="absolute inset-0 z-20 flex items-end bg-black/50" onClick={() => setSheet(null)}>
            <div className="max-h-[75%] w-full overflow-y-auto rounded-t-3xl bg-[#111] p-4" onClick={(e) => e.stopPropagation()}>
              {sheet === "comments" && (
                <>
                  <p className="mb-3 text-center font-bold">{fmt(s.comment + list.length)} comments</p>
                  {list.length === 0 && <p className="py-6 text-center text-sm text-gray-400">No comments yet</p>}
                  {list.map((c, i) => (
                    <p key={i} className="mb-3 text-sm"><b>{c.user}</b> {c.text}</p>
                  ))}
                  <div className="mt-2 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
                    <input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendComment()}
                      placeholder="Add a comment..."
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                    />
                    <button type="button" onClick={sendComment} className="text-sm font-bold" style={{ color: GREEN }}>Send</button>
                  </div>
                </>
              )}

              {sheet === "bars" && (
                <div className="flex flex-col gap-3">
                  <button type="button" onClick={() => setSheet("source")} className="rounded-2xl bg-white/10 py-4 text-center font-bold">Source</button>
                  <button type="button" onClick={copyLink} className="rounded-2xl py-4 text-center font-bold text-black" style={{ background: GREEN }}>Copy</button>
                </div>
              )}

              {sheet === "source" && (
                s.facts.entertainment ? (
                  <div className="py-6 text-center">
                    <p className="text-lg font-bold">No fact to check - Entertainment</p>
                    <p className="mt-2 text-5xl font-extrabold" style={{ color: GREEN }}>100%</p>
                    <p className="mt-1 text-sm text-gray-400">Entertainment</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-center text-6xl font-extrabold" style={{ color: GREEN }}>{avg}%</p>
                    <p className="mb-4 text-center text-sm text-gray-400">True</p>
                    {s.facts.sources.map((f, i) => (
                      <div key={i} className="mb-3 rounded-2xl bg-white/10 p-3">
                        <div className="flex items-center justify-between">
                          <p className="font-bold">{f.name}</p>
                          <p className="font-bold" style={{ color: GREEN }}>{f.pct}% True</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-300">{f.detail}</p>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {toast && (
          <div className="absolute left-1/2 top-20 z-30 -translate-x-1/2 rounded-full bg-white px-4 py-2 text-sm font-bold text-black">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
  }
