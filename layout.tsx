--- src/components/layout.tsx (原始)
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useApp, logout } from "../lib/db";
import { Avatar, Btn, cx } from "./ui";
import { IcMenu, IcMoon, IcSun, IcX, Logo } from "./icons";

/* ── theme hook (shared) ─────────────────────────────────────────────────── */
export function useTheme() {
  const [dark, setDark] = useState(() => {
    try { const s = localStorage.getItem("ssgt-theme"); if (s) return s === "dark"; } catch { /* ignore */ }
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try { localStorage.setItem("ssgt-theme", dark ? "dark" : "light"); } catch { /* ignore */ }
  }, [dark]);
  return { dark, toggle: () => setDark((d) => !d) };
}

const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/courses", label: "Courses" },
  { to: "/subjects", label: "Subjects" },
  { to: "/resources", label: "Resources" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function PublicLayout() {
  const { user } = useApp();
  const { dark, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    h(); window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  useEffect(() => { setOpen(false); window.scrollTo({ top: 0 }); }, [loc.pathname]);

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-sun-500 focus:px-4 focus:py-2 focus:font-bold focus:text-pine-950">Skip to content</a>
      <header className={cx("fixed inset-x-0 top-0 z-[70] transition-all duration-300",
        scrolled || open ? "border-b border-pine-700/10 bg-paper/92 shadow-sm backdrop-blur-md dark:border-pine-200/10 dark:bg-night-900/92" : "bg-transparent")}>
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5" aria-label="School Smart Guide Tutors — home">
            <Logo size={36} />
            <span className="leading-none">
              <span className="block font-display text-[15px] font-black tracking-tight">School Smart</span>
              <span className="block text-[10px] font-extrabold uppercase tracking-[0.22em] text-sun-700 dark:text-sun-400">Guide Tutors</span>
            </span>
          </Link>
          <nav className="ml-6 hidden items-center gap-5 lg:flex" aria-label="Main">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end}
                className={({ isActive }) => cx("link-sweep text-[14px] font-bold transition-colors", isActive ? "text-pine-800 dark:text-sun-400" : "text-ink-2 hover:text-pine-800 dark:text-pine-200/80 dark:hover:text-paper")}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={toggle} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              className="grid h-9.5 w-9.5 cursor-pointer place-items-center rounded-lg border border-pine-700/15 text-ink-2 transition-all hover:rotate-12 hover:border-sun-500/60 hover:text-sun-600 dark:border-pine-200/15 dark:text-pine-200 dark:hover:text-sun-400">
              {dark ? <IcSun size={17} /> : <IcMoon size={17} />}
            </button>
            {user ? (
              <Btn size="sm" variant="accent" onClick={() => nav("/app/dashboard")}>My Dashboard</Btn>
            ) : (
              <>
                <Link to="/login" className="hidden text-[14px] font-bold text-ink-2 transition-colors hover:text-pine-800 sm:block dark:text-pine-200/80 dark:hover:text-paper">Login</Link>
                <Link to="/register"><Btn size="sm" variant="primary">Get Started</Btn></Link>
              </>
            )}
            <button onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}
              className="grid h-9.5 w-9.5 cursor-pointer place-items-center rounded-lg border border-pine-700/15 lg:hidden dark:border-pine-200/15">
              {open ? <IcX /> : <IcMenu />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="fade-up border-t border-pine-700/10 bg-paper px-4 py-4 lg:hidden dark:border-pine-200/10 dark:bg-night-900" aria-label="Mobile">
            <div className="grid gap-1">
              {NAV.map((n) => (
                <NavLink key={n.to} to={n.to} end={n.end}
                  className={({ isActive }) => cx("rounded-lg px-3 py-2.5 text-[15px] font-bold", isActive ? "bg-pine-700/10 text-pine-800 dark:bg-pine-200/10 dark:text-sun-400" : "text-ink-2 dark:text-pine-200/80")}>
                  {n.label}
                </NavLink>
              ))}
              {!user && <Link to="/login" className="rounded-lg px-3 py-2.5 text-[15px] font-bold text-ink-2 dark:text-pine-200/80">Login</Link>}
            </div>
          </nav>
        )}
      </header>

      <main id="main"><Outlet /></main>
      <Footer />
    </div>
  );
}

/* ── Footer ──────────────────────────────────────────────────────────────── */
const Fb = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M13.5 21v-7h2.6l.4-3h-3V9.1c0-.9.3-1.6 1.7-1.6h1.5V4.8c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8V11H8v3h2.8v7Z" /></svg>;
const Xs = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M17.8 3h3l-6.6 7.6L22 21h-6.1l-4.8-6.3L5.6 21h-3l7.1-8.1L2 3h6.3l4.3 5.7Zm-1.1 16.2h1.7L7.4 4.7H5.6Z" /></svg>;
const Yt = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3Z" /></svg>;
const Wa = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1-.2.2-.7.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.6-1.2.1-.2 0-.4 0-.5l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.9 2.9 4.6 4 1.7.7 2.4.8 3.2.7.5-.1 1.4-.6 1.6-1.2.2-.6.2-1.1.1-1.2Z" /></svg>;

export function Footer() {
  const { db } = useApp();
  const s = db.settings;
  return (
    <footer className="relative mt-auto">
      <div className="weave weave-thin" aria-hidden />
      <div className="board-bg noise relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
            <div>
              <Link to="/" className="flex items-center gap-2.5">
                <Logo size={40} />
                <span className="leading-none">
                  <span className="block font-display text-lg font-black text-paper">School Smart</span>
                  <span className="block text-[10px] font-extrabold uppercase tracking-[0.22em] text-sun-400">Guide Tutors</span>
                </span>
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-pine-100/70">
                Structured learning for Kenya — CBC and 8-4-4 courses, revision materials, assessments and progress tracking for learners, parents, teachers and schools.
              </p>
              <div className="mt-5 flex gap-2">
                {([["Facebook", s.socials.facebook, <Fb key="f" />], ["X", s.socials.x, <Xs key="x" />], ["YouTube", s.socials.youtube, <Yt key="y" />], ["WhatsApp", s.socials.whatsapp, <Wa key="w" />]] as const).map(([label, href, icon]) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
                    className="grid h-9 w-9 place-items-center rounded-lg bg-paper/8 text-pine-100/80 transition-all hover:-translate-y-0.5 hover:bg-sun-500 hover:text-pine-950">
                    {icon}
                  </a>
                ))}
              </div>
            </div>
            <nav aria-label="Platform">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-sun-400">Platform</h3>
              <ul className="mt-4 space-y-2.5 text-sm font-semibold text-pine-100/75">
                {[["About SSGT", "/about"], ["Course catalogue", "/courses"], ["Subjects", "/subjects"], ["Resource library", "/resources"], ["Contact us", "/contact"], ["Create account", "/register"]].map(([l, to]) => (
                  <li key={l}><Link to={to} className="transition-colors hover:text-sun-400">{l}</Link></li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Curriculum">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-sun-400">Curriculum</h3>
              <ul className="mt-4 space-y-2.5 text-sm font-semibold text-pine-100/75">
                {[["CBC Primary", "/courses?level=lvl-pri"], ["Junior Secondary (JSS)", "/courses?level=lvl-jss"], ["Senior Secondary", "/courses?level=lvl-sss"], ["8-4-4 / KCSE Revision", "/courses?curriculum=curr-844"], ["Past papers", "/resources?kind=past-paper"], ["Marking schemes", "/resources?kind=marking-scheme"]].map(([l, to]) => (
                  <li key={l}><Link to={to} className="transition-colors hover:text-sun-400">{l}</Link></li>
                ))}
              </ul>
            </nav>
            <div>
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-sun-400">Get in touch</h3>
              <ul className="mt-4 space-y-2.5 text-sm font-semibold text-pine-100/75">
                <li><a href={`mailto:${s.contactEmail}`} className="transition-colors hover:text-sun-400">{s.contactEmail}</a></li>
                <li><a href={`tel:${s.contactPhone.replace(/\s/g, "")}`} className="transition-colors hover:text-sun-400">{s.contactPhone}</a></li>
                <li className="leading-relaxed">{s.address}</li>
              </ul>
              <div className="mt-5 rounded-lg border border-paper/10 bg-paper/5 px-3.5 py-2.5 text-[12px] font-semibold text-pine-100/70">
                Payments: M-Pesa &amp; cards · Receipts in your dashboard
              </div>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-paper/10 pt-6 text-[12px] font-semibold text-pine-100/50 sm:flex-row">
            <p>© 2026 School Smart Guide Tutors. Built for Kenyan learners.</p>
            <div className="flex gap-5">
              <Link to="/legal/privacy" className="transition-colors hover:text-sun-400">Privacy Policy</Link>
              <Link to="/legal/terms" className="transition-colors hover:text-sun-400">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PageHero({ kicker, title, body, children }: { kicker: string; title: React.ReactNode; body?: string; children?: React.ReactNode }) {
  return (
    <section className="board-bg noise relative overflow-hidden pt-28 pb-14 sm:pt-32">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.2em] text-sun-400">
          <span className="inline-block h-[2px] w-7 bg-sun-400" />{kicker}
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-black leading-[1.08] text-paper sm:text-5xl">{title}</h1>
        {body && <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-pine-100/75">{body}</p>}
        {children && <div className="mt-7">{children}</div>}
      </div>
    </section>
  );
}

export function AvatarChip({ name, color, size = 34 }: { name: string; color: string; size?: number }) {
  return <Avatar name={name} color={color} size={size} />;
}


+++ src/components/layout.tsx (修改后)
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useApp, logout } from "../lib/db";
import { Avatar, Btn, cx } from "./ui";
import { IcMail, IcMenu, IcMoon, IcPhone, IcSun, IcX, Logo } from "./icons";

/* ── theme hook (shared) ─────────────────────────────────────────────────── */
export function useTheme() {
  const [dark, setDark] = useState(() => {
    try { const s = localStorage.getItem("ssgt-theme"); if (s) return s === "dark"; } catch { /* ignore */ }
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try { localStorage.setItem("ssgt-theme", dark ? "dark" : "light"); } catch { /* ignore */ }
  }, [dark]);
  return { dark, toggle: () => setDark((d) => !d) };
}

const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/courses", label: "Courses" },
  { to: "/subjects", label: "Subjects" },
  { to: "/resources", label: "Resources" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function PublicLayout() {
  const { db, user } = useApp();
  const s = db.settings;
  const { dark, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    h(); window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  useEffect(() => { setOpen(false); window.scrollTo({ top: 0 }); }, [loc.pathname]);

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-sun-500 focus:px-4 focus:py-2 focus:font-bold focus:text-pine-950">Skip to content</a>
      <header className={cx("fixed inset-x-0 top-0 z-[70] transition-all duration-300",
        scrolled || open ? "border-b border-pine-700/10 bg-paper/92 shadow-sm backdrop-blur-md dark:border-pine-200/10 dark:bg-night-900/92" : "bg-transparent")}>
        {/* official contact strip */}
        <div className="bg-pine-950 text-paper">
          <div className="mx-auto flex h-7 max-w-7xl items-center justify-between gap-4 px-4 text-[11.5px] font-bold sm:px-6 lg:px-8">
            <a href={`tel:${s.contactPhone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 transition-colors hover:text-sun-400">
              <IcPhone size={12} className="text-sun-400" /> <span className="hidden sm:inline">Call Us:</span> {s.contactPhone}
            </a>
            <a href={`mailto:${s.contactEmail}`} className="hidden items-center gap-1.5 truncate transition-colors hover:text-sun-400 md:flex">
              <IcMail size={12} className="text-sun-400" /> {s.contactEmail}
            </a>
            <span className="hidden text-pine-100/50 lg:inline">{s.academyName}</span>
          </div>
        </div>
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5" aria-label="School Smart Guide Tutors — home">
            <Logo size={36} />
            <span className="leading-none">
              <span className="block font-display text-[15px] font-black tracking-tight">School Smart</span>
              <span className="block text-[10px] font-extrabold uppercase tracking-[0.22em] text-sun-700 dark:text-sun-400">Guide Tutors</span>
            </span>
          </Link>
          <nav className="ml-6 hidden items-center gap-5 lg:flex" aria-label="Main">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end}
                className={({ isActive }) => cx("link-sweep text-[14px] font-bold transition-colors", isActive ? "text-pine-800 dark:text-sun-400" : "text-ink-2 hover:text-pine-800 dark:text-pine-200/80 dark:hover:text-paper")}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={toggle} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              className="grid h-9.5 w-9.5 cursor-pointer place-items-center rounded-lg border border-pine-700/15 text-ink-2 transition-all hover:rotate-12 hover:border-sun-500/60 hover:text-sun-600 dark:border-pine-200/15 dark:text-pine-200 dark:hover:text-sun-400">
              {dark ? <IcSun size={17} /> : <IcMoon size={17} />}
            </button>
            {user ? (
              <Btn size="sm" variant="accent" onClick={() => nav("/app/dashboard")}>My Dashboard</Btn>
            ) : (
              <>
                <Link to="/login" className="hidden text-[14px] font-bold text-ink-2 transition-colors hover:text-pine-800 sm:block dark:text-pine-200/80 dark:hover:text-paper">Login</Link>
                <Link to="/register"><Btn size="sm" variant="primary">Get Started</Btn></Link>
              </>
            )}
            <button onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}
              className="grid h-9.5 w-9.5 cursor-pointer place-items-center rounded-lg border border-pine-700/15 lg:hidden dark:border-pine-200/15">
              {open ? <IcX /> : <IcMenu />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="fade-up border-t border-pine-700/10 bg-paper px-4 py-4 lg:hidden dark:border-pine-200/10 dark:bg-night-900" aria-label="Mobile">
            <div className="grid gap-1">
              {NAV.map((n) => (
                <NavLink key={n.to} to={n.to} end={n.end}
                  className={({ isActive }) => cx("rounded-lg px-3 py-2.5 text-[15px] font-bold", isActive ? "bg-pine-700/10 text-pine-800 dark:bg-pine-200/10 dark:text-sun-400" : "text-ink-2 dark:text-pine-200/80")}>
                  {n.label}
                </NavLink>
              ))}
              {!user && <Link to="/login" className="rounded-lg px-3 py-2.5 text-[15px] font-bold text-ink-2 dark:text-pine-200/80">Login</Link>}
            </div>
          </nav>
        )}
      </header>

      <main id="main"><Outlet /></main>
      <Footer />
    </div>
  );
}

/* ── Footer ──────────────────────────────────────────────────────────────── */
const Fb = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M13.5 21v-7h2.6l.4-3h-3V9.1c0-.9.3-1.6 1.7-1.6h1.5V4.8c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8V11H8v3h2.8v7Z" /></svg>;
const Xs = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M17.8 3h3l-6.6 7.6L22 21h-6.1l-4.8-6.3L5.6 21h-3l7.1-8.1L2 3h6.3l4.3 5.7Zm-1.1 16.2h1.7L7.4 4.7H5.6Z" /></svg>;
const Yt = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3Z" /></svg>;
const Wa = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1-.2.2-.7.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.6-1.2.1-.2 0-.4 0-.5l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.9 2.9 4.6 4 1.7.7 2.4.8 3.2.7.5-.1 1.4-.6 1.6-1.2.2-.6.2-1.1.1-1.2Z" /></svg>;

export function Footer() {
  const { db } = useApp();
  const s = db.settings;
  return (
    <footer className="relative mt-auto">
      <div className="weave weave-thin" aria-hidden />
      <div className="board-bg noise relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
            <div>
              <Link to="/" className="flex items-center gap-2.5">
                <Logo size={40} />
                <span className="leading-none">
                  <span className="block font-display text-lg font-black text-paper">School Smart</span>
                  <span className="block text-[10px] font-extrabold uppercase tracking-[0.22em] text-sun-400">Guide Tutors</span>
                </span>
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-pine-100/70">
                Structured learning for Kenya — CBC and 8-4-4 courses, revision materials, assessments and progress tracking for learners, parents, teachers and schools.
              </p>
              {([["Facebook", s.socials.facebook, <Fb key="f" />], ["X", s.socials.x, <Xs key="x" />], ["YouTube", s.socials.youtube, <Yt key="y" />], ["WhatsApp", s.socials.whatsapp, <Wa key="w" />]] as const).some(([, href]) => href) && (
                <div className="mt-5 flex gap-2">
                  {([["Facebook", s.socials.facebook, <Fb key="f" />], ["X", s.socials.x, <Xs key="x" />], ["YouTube", s.socials.youtube, <Yt key="y" />], ["WhatsApp", s.socials.whatsapp, <Wa key="w" />]] as const).filter(([, href]) => href).map(([label, href, icon]) => (
                    <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
                      className="grid h-9 w-9 place-items-center rounded-lg bg-paper/8 text-pine-100/80 transition-all hover:-translate-y-0.5 hover:bg-sun-500 hover:text-pine-950">
                      {icon}
                    </a>
                  ))}
                </div>
              )}
            </div>
            <nav aria-label="Platform">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-sun-400">Platform</h3>
              <ul className="mt-4 space-y-2.5 text-sm font-semibold text-pine-100/75">
                {[["Home", "/"], ["About SSGT", "/about"], ["Course catalogue", "/courses"], ["Subjects", "/subjects"], ["Resource library", "/resources"], ["Contact us", "/contact"], ["Create account", "/register"]].map(([l, to]) => (
                  <li key={l}><Link to={to} className="transition-colors hover:text-sun-400">{l}</Link></li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Curriculum">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-sun-400">Curriculum</h3>
              <ul className="mt-4 space-y-2.5 text-sm font-semibold text-pine-100/75">
                {[["CBC Primary", "/courses?level=lvl-pri"], ["Junior Secondary (JSS)", "/courses?level=lvl-jss"], ["Senior Secondary", "/courses?level=lvl-sss"], ["8-4-4 / KCSE Revision", "/courses?curriculum=curr-844"], ["Past papers", "/resources?kind=past-paper"], ["Marking schemes", "/resources?kind=marking-scheme"]].map(([l, to]) => (
                  <li key={l}><Link to={to} className="transition-colors hover:text-sun-400">{l}</Link></li>
                ))}
              </ul>
            </nav>
            <div>
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-sun-400">Get in touch</h3>
              <ul className="mt-4 space-y-2.5 text-sm font-semibold text-pine-100/75">
                <li className="flex items-center gap-2"><IcPhone size={14} className="shrink-0 text-sun-400" /><span><span className="text-pine-100/50">Phone:</span> <a href={`tel:${s.contactPhone.replace(/\s/g, "")}`} className="transition-colors hover:text-sun-400">{s.contactPhone}</a></span></li>
                <li className="flex items-start gap-2"><IcMail size={14} className="mt-0.5 shrink-0 text-sun-400" /><span className="min-w-0"><span className="text-pine-100/50">Email:</span> <a href={`mailto:${s.contactEmail}`} className="break-all transition-colors hover:text-sun-400">{s.contactEmail}</a></span></li>
                {s.address && <li className="leading-relaxed">{s.address}</li>}
              </ul>
              <div className="mt-5 rounded-lg border border-paper/10 bg-paper/5 px-3.5 py-2.5 text-[12px] font-semibold text-pine-100/70">
                Payments: M-Pesa &amp; cards · Receipts in your dashboard
              </div>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-paper/10 pt-6 text-[12px] font-semibold text-pine-100/50 sm:flex-row">
            <p>© 2026 {s.academyName}. Built for Kenyan learners.</p>
            <div className="flex gap-5">
              <Link to="/legal/privacy" className="transition-colors hover:text-sun-400">Privacy Policy</Link>
              <Link to="/legal/terms" className="transition-colors hover:text-sun-400">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PageHero({ kicker, title, body, children }: { kicker: string; title: React.ReactNode; body?: string; children?: React.ReactNode }) {
  return (
    <section className="board-bg noise relative overflow-hidden pt-32 pb-14 sm:pt-36">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.2em] text-sun-400">
          <span className="inline-block h-[2px] w-7 bg-sun-400" />{kicker}
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-black leading-[1.08] text-paper sm:text-5xl">{title}</h1>
        {body && <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-pine-100/75">{body}</p>}
        {children && <div className="mt-7">{children}</div>}
      </div>
    </section>
  );
}

export function AvatarChip({ name, color, size = 34 }: { name: string; color: string; size?: number }) {
  return <Avatar name={name} color={color} size={size} />;
}
