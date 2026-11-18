"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";

const GREEN = "#22C55E";

function HomeIcon({ active }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill={active ? GREEN : "none"} stroke={active ? GREEN : "#9CA3AF"} strokeWidth="2" strokeLinejoin="round">
      <path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V11z" />
    </svg>
  );
}

function ShortIcon({ active }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={active ? GREEN : "#9CA3AF"} strokeWidth="2" strokeLinejoin="round">
      <rect x="6" y="2" width="12" height="20" rx="3" fill={active ? GREEN : "none"} />
      <path d="M10 10l5 2-5 2z" fill={active ? "#000" : "#9CA3AF"} stroke="none" />
    </svg>
  );
}

function ChatIcon({ active }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill={active ? GREEN : "none"} stroke={active ? GREEN : "#9CA3AF"} strokeWidth="2" strokeLinejoin="round">
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
    </svg>
  );
}

function MeIcon({ active }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill={active ? GREEN : "none"} stroke={active ? GREEN : "#9CA3AF"} strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

function NavItem({ href, label, active, children }) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center gap-1 py-2">
      {children}
      <span className="text-[11px] font-medium" style={{ color: active ? GREEN : "#9CA3AF" }}>
        {label}
      </span>
    </Link>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const fileRef = useRef(null);

  const is = (p) => (p === "/" ? pathname === "/" : pathname.startsWith(p));

  function onPick(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // Next step: after picking, show "Post as Short" or "Submit as Movie"
    e.target.value = "";
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black">
      <div className="mx-auto grid max-w-md grid-cols-5 items-center px-2 pb-2">
        <NavItem href="/" label="Home" active={is("/")}>
          <HomeIcon active={is("/")} />
        </NavItem>

        <NavItem href="/short" label="Short" active={is("/short")}>
          <ShortIcon active={is("/short")} />
        </NavItem>

        <div className="flex items-center justify-center">
          <button
            type="button"
            aria-label="Add"
            onClick={() => fileRef.current && fileRef.current.click()}
            className="-mt-7 flex h-16 w-16 items-center justify-center rounded-full shadow-lg active:scale-95"
            style={{ background: GREEN, boxShadow: "0 0 0 4px #000" }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={onPick}
          />
        </div>

        <NavItem href="/chat" label="Chat" active={is("/chat")}>
          <ChatIcon active={is("/chat")} />
        </NavItem>

        <NavItem href="/me" label="Me" active={is("/me")}>
          <MeIcon active={is("/me")} />
        </NavItem>
      </div>
    </nav>
  );
}
