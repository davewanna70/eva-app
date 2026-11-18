"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const GREEN = "#22C55E";

const supabase =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
    : null;

export default function LoginPage() {
  const [mode, setMode] = useState("login"); // login | signup
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setMsg("");
    if (!supabase) return setMsg("Supabase is not connected yet");
    if (!email.trim() || !password) return setMsg("Enter email and password");

    if (mode === "signup") {
      const u = username.trim().toLowerCase();
      if (!name.trim()) return setMsg("Enter your name");
      if (!/^[a-z0-9_]{3,20}$/.test(u)) {
        return setMsg("Username: 3-20 letters, numbers or _ only");
      }
      if (password.length < 6) return setMsg("Password must be at least 6 characters");
    }

    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        window.location.href = "/";
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (error) throw error;

      if (!data.session) {
        setMsg("Check your email to confirm, then log in.");
        setBusy(false);
        return;
      }

      const { error: pErr } = await supabase.from("profiles").insert({
        id: data.user.id,
        username: username.trim().toLowerCase(),
        name: name.trim(),
      });
      if (pErr) {
        await supabase.auth.signOut();
        setMsg(
          pErr.code === "23505"
            ? "Username already taken. Try another."
            : "Could not create profile. Try again."
        );
        setBusy(false);
        return;
      }

      window.location.href = "/";
    } catch (e) {
      setMsg(e && e.message ? e.message : "Something went wrong. Try again.");
    }
    setBusy(false);
  }

  const field =
    "w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-base text-white outline-none placeholder:text-gray-500";

  return (
    <main className="px-6 pt-10">
      <h1 className="text-center text-5xl font-extrabold tracking-tight" style={{ color: GREEN }}>
        EVA
      </h1>
      <p className="mt-2 text-center text-gray-400">
        {mode === "login" ? "Welcome back" : "Create your account"}
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {mode === "signup" && (
          <>
            <input className={field} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            <input
              className={field}
              placeholder="Username (example: davewanna)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
            />
          </>
        )}
        <input
          className={field}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoCapitalize="none"
        />
        <input
          className={field}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {msg && <p className="mt-3 text-center text-sm font-semibold text-red-400">{msg}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={busy}
        className="mt-5 w-full rounded-xl py-4 text-xl font-extrabold text-black active:scale-[0.98] disabled:opacity-60"
        style={{ background: GREEN }}
      >
        {busy ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
      </button>

      <button
        type="button"
        onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMsg(""); }}
        className="mt-5 w-full text-center text-base text-gray-300"
      >
        {mode === "login" ? "No account? Sign up" : "Have an account? Log in"}
      </button>
    </main>
  );
          }
