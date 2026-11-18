"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const GREEN = "#22C55E";
const GENRES = ["Action", "Comedy", "Drama", "Horror", "Romance", "Sci-Fi", "Thriller"];

const supabase =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
    : null;

export default function SubmitMoviePage() {
  const videoRef = useRef(null);
  const coverRef = useRef(null);

  const [video, setVideo] = useState(null);
  const [cover, setCover] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState(false);

  function pickVideo(e) {
    const f = e.target.files && e.target.files[0];
    if (f) setVideo(f);
    e.target.value = "";
  }

  function pickCover(e) {
    const f = e.target.files && e.target.files[0];
    if (f) {
      setCover(f);
      setCoverPreview(URL.createObjectURL(f));
    }
    e.target.value = "";
  }

  async function upload(file, folder) {
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("movies").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("movies").getPublicUrl(path);
    return data.publicUrl;
  }

  async function sendMovie() {
    setMsg("");
    if (!video) return setMsg("Pick your movie first");
    if (!cover) return setMsg("Add a movie cover");
    if (!title.trim()) return setMsg("Enter movie title");
    if (!description.trim()) return setMsg("Write a short description");
    if (!genre) return setMsg("Select genre");
    if (!supabase) return setMsg("Supabase is not connected yet");

    setSending(true);
    try {
      const video_url = await upload(video, "videos");
      const cover_url = await upload(cover, "covers");

      const { error } = await supabase.from("movies").insert({
        username: "davewanna",
        title: title.trim(),
        description: description.trim(),
        genre,
        video_url,
        cover_url,
        status: "pending",
      });
      if (error) throw error;

      setDone(true);
    } catch (e) {
      setMsg("Failed to send. Try again.");
    }
    setSending(false);
  }

  if (done) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <svg width="72" height="72" viewBox="0 0 24 24" fill={GREEN}>
          <circle cx="12" cy="12" r="11" />
          <path d="M7 12.5l3.5 3.5L17 9" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h1 className="mt-4 text-2xl font-extrabold">Movie sent!</h1>
        <p className="mt-2 text-gray-400">Wait for the Bell. We will tell you when it is approved.</p>
        <Link href="/chat" className="mt-6 rounded-xl px-8 py-3 font-bold text-black" style={{ background: GREEN }}>
          Done
        </Link>
      </main>
    );
  }

  const field = "w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-base text-white outline-none placeholder:text-gray-500";

  return (
    <main className="px-4">
      {/* Header */}
      <header className="flex items-center justify-between py-4">
        <Link href="/chat" aria-label="Back">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </Link>
        <h1 className="flex items-center gap-2 text-xl font-extrabold">
          EVA Submit Movie
          <svg width="20" height="20" viewBox="0 0 24 24" fill={GREEN}>
            <circle cx="12" cy="12" r="11" />
            <path d="M7 12.5l3.5 3.5L17 9" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </h1>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
          <path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7z" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        </svg>
      </header>

      {/* + Submit Your Movie -> Gallery */}
      <button
        type="button"
        onClick={() => videoRef.current && videoRef.current.click()}
        className="flex w-full items-center justify-center gap-3 rounded-xl py-4 text-xl font-extrabold text-black active:scale-[0.98]"
        style={{ background: GREEN }}
      >
        <span className="text-3xl leading-none">+</span>
        {video ? "Movie picked" : "Submit Your Movie"}
      </button>
      <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={pickVideo} />
      {video && <p className="mt-2 truncate text-sm text-gray-400">{video.name}</p>}

      {/* + Add Movie Cover -> Gallery */}
      <h2 className="mt-6 text-xl font-bold text-gray-300">Add Movie Cover</h2>
      <button
        type="button"
        onClick={() => coverRef.current && coverRef.current.click()}
        className="mt-2 flex w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-white/40 py-4 text-base font-semibold"
        style={{ minHeight: 64 }}
      >
        {coverPreview ? (
          <img src={coverPreview} alt="Cover" className="h-40 w-auto rounded-lg object-cover" />
        ) : (
          "+ Add Movie Cover"
        )}
      </button>
      <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={pickCover} />

      {/* Details */}
      <h2 className="mt-6 text-xl font-extrabold">Type your movie details</h2>

      <label className="mt-4 block text-base font-semibold text-gray-300">Title</label>
      <input className={field} placeholder="Enter movie title" value={title} onChange={(e) => setTitle(e.target.value)} />

      <label className="mt-4 block text-base font-semibold text-gray-300">Description</label>
      <input className={field} placeholder="Write a short description" value={description} onChange={(e) => setDescription(e.target.value)} />

      <label className="mt-4 block text-base font-semibold text-gray-300">Genre</label>
      <select className={field} value={genre} onChange={(e) => setGenre(e.target.value)}>
        <option value="" className="bg-black">Select genre</option>
        {GENRES.map((g) => (
          <option key={g} value={g} className="bg-black">{g}</option>
        ))}
      </select>

      {msg && <p className="mt-3 text-center text-sm font-semibold text-red-400">{msg}</p>}

      {/* Send Movie - big green under Genre */}
      <button
        type="button"
        onClick={sendMovie}
        disabled={sending}
        className="mt-5 w-full rounded-xl py-4 text-xl font-extrabold text-black active:scale-[0.98] disabled:opacity-60"
        style={{ background: GREEN }}
      >
        {sending ? "Sending..." : "Send Movie"}
      </button>
    </main>
  );
      }
