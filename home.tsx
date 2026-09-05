--- src/pages/home.tsx (原始)
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { lessonsOf, useApp } from "../lib/db";
import { Badge, Btn, Counter, Reveal, SectionHead, cx } from "../components/ui";
import { Donut } from "../components/charts";
import { CourseCard, SubjectIcon } from "./catalog";
import {
  IcArrowR, IcAward, IcBell, IcBookOpen, IcCap, IcChart, IcCheck, IcChevD, IcClipboard, IcDownload,
  IcFlame, IcMoney, IcPlay, IcSearch, IcShield, IcTarget, IcTrend, IcUsers, IcVideo,
} from "../components/icons";

const Scribble = () => (
  <svg viewBox="0 0 220 14" className="absolute -bottom-2 left-0 w-full text-sun-400" aria-hidden preserveAspectRatio="none">
    <path d="M3 10 C 40 2, 80 12, 118 7 S 190 4, 217 8" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" opacity="0.9" />
  </svg>
);

export function HomePage() {
  const { db, user } = useApp();
  const nav = useNavigate();
  const featured = db.settings.featuredCourseIds.map((id) => db.courses.find((c) => c.id === id)).filter(Boolean).slice(0, 3);
  const subjects = db.subjects.filter((s) => s.active);
  const totalLessons = db.courses.reduce((n, c) => n + lessonsOf(c.id).length, 0);
  const startTo = user ? "/app/dashboard" : "/register";
  const [openFaq, setOpenFaq] = useState(0);

  const levels = [
    { id: "lvl-pri", title: "CBC Primary", sub: "Grade 1 – 6", desc: "Foundational literacy, numeracy and science through play-rich, competency-based lessons.", accent: "#5C9C80" },
    { id: "lvl-jss", title: "Junior Secondary", sub: "Grade 7 – 9", desc: "The full JSS subject list — integrated science, pre-technical, agriculture and more.", accent: "#0C5A43" },
    { id: "lvl-sss", title: "Senior Secondary", sub: "Grade 10 – 12", desc: "Pathway-ready courses as the senior school curriculum rolls out nationwide.", accent: "#B56508" },
    { id: "lvl-844s", title: "8-4-4 / KCSE", sub: "Form 1 – 4", desc: "Exam-focused revision: past papers, marking schemes and timed drills.", accent: "#C4562E" },
  ];

  return (
    <div>
      {/* ═══ HERO — the chalkboard ═══ */}
      <section className="board-bg noise relative overflow-hidden pt-24 sm:pt-28">
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-16 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-8 lg:px-8 lg:pb-24">
          <div>
            <Reveal>
              <p className="inline-flex flex-wrap items-center gap-2 rounded-full border border-paper/15 bg-paper/5 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-sun-400 backdrop-blur-sm">
                <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-sun-400" /> Kenya's structured learning platform · CBC & 8-4-4
              </p>
            </Reveal>
            <h1 className="mt-6 font-display text-[42px] font-black leading-[1.04] text-paper sm:text-6xl lg:text-[64px]">
              <span className="lm"><span style={{ animationDelay: "0.05s" }}>Learn <span className="relative inline-block text-sun-400">Smarter.<Scribble /></span></span></span>
              <span className="lm"><span style={{ animationDelay: "0.22s" }}>Grow Stronger.</span></span>
              <span className="lm"><span style={{ animationDelay: "0.39s" }} className="text-pine-200">Succeed.</span></span>
            </h1>
            <Reveal delay={350}>
              <p className="mt-6 max-w-xl text-[15.5px] leading-relaxed text-pine-100/80">
                School Smart Guide Tutors puts a structured Kenyan curriculum in your pocket — mapped courses, video lessons,
                timed quizzes, marked assignments and honest progress tracking for learners, parents and teachers.
              </p>
            </Reveal>
            <Reveal delay={450}>
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Btn size="lg" variant="accent" onClick={() => nav(startTo)}>Start Learning <IcArrowR size={17} /></Btn>
                <Btn size="lg" variant="outline" className="border-paper/25 text-paper hover:border-sun-400 hover:bg-paper/5 hover:text-sun-400" onClick={() => nav("/courses")}>Explore Courses</Btn>
              </div>
            </Reveal>
            <Reveal delay={550}>
              <dl className="mt-11 grid max-w-lg grid-cols-3 gap-6 border-t border-paper/10 pt-6">
                {[
                  [<Counter key="1" to={2400} suffix="+" />, "active learners"],
                  [<Counter key="2" to={totalLessons} />, "structured lessons"],
                  [<Counter key="3" to={94} suffix="%" />, "quiz pass rate"],
                ].map(([v, l]) => (
                  <div key={l as string}>
                    <dt className="sr-only">{l as string}</dt>
                    <dd className="font-display text-[26px] font-black text-sun-400 sm:text-3xl">{v}</dd>
                    <dd className="mt-0.5 text-[11px] font-extrabold uppercase tracking-wider text-pine-100/55">{l}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          {/* live-learning snapshot */}
          <Reveal dir="rv-r" delay={200} className="relative hidden lg:block">
            <div className="relative">
              <div className="float-slow relative z-10 w-[380px] rounded-2xl border border-paper/12 bg-paper p-5 shadow-2xl shadow-pine-950/50">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-ink-2/60">Tonight's session · Amina, Grade 8</p>
                  <span className="flex items-center gap-1.5 rounded-full bg-pine-700/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-pine-800"><span className="pulse-dot h-1.5 w-1.5 rounded-full bg-pine-600" /> live</span>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="relative h-[86px] w-[86px] shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-pine-700 to-pine-950">
                    <img src={db.courses[0].image} alt="" className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-[15px] font-bold leading-snug text-ink">Linear Equations Mastery</p>
                    <p className="mt-1 text-[12px] font-semibold text-ink-2/70">Grade 8 Mathematics · Ms. Wanjiku</p>
                    <p className="mt-2 flex items-center gap-1.5 text-[12px] font-bold text-pine-700"><IcPlay size={13} /> Lesson 6 of 9 · Two-step equations</p>
                  </div>
                  <Donut value={56} size={72} stroke={8} sub="done" />
                </div>
                <div className="mt-4 space-y-2">
                  {[["Expressions & like terms", true], ["One-step equations", true], ["Two-step equations", false]].map(([t, done]) => (
                    <div key={t as string} className={cx("flex items-center gap-2.5 rounded-lg border px-3 py-2 text-[12.5px] font-bold", done ? "border-pine-700/10 bg-pine-700/5 text-ink-2/70" : "border-sun-500/40 bg-sun-500/10 text-ink")}>
                      <span className={cx("grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full", done ? "bg-pine-700 text-paper" : "border-2 border-sun-600 text-transparent")}><IcCheck size={11} /></span>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
              <div className="float-slower absolute -right-10 -top-8 z-20 rotate-3 rounded-xl border border-paper/12 bg-pine-800 px-4 py-3 shadow-xl">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-sun-400">Quiz scored</p>
                <p className="font-display text-xl font-black text-paper">88% · Pass ✓</p>
              </div>
              <div className="float-slower absolute -left-12 bottom-6 z-20 -rotate-2 rounded-xl border border-paper/12 bg-sun-500 px-4 py-3 shadow-xl">
                <p className="flex items-center gap-2 text-[12px] font-black text-pine-950"><IcMoney size={15} /> M-Pesa enrolment · KSh 0–500</p>
              </div>
              <div className="absolute -bottom-8 right-10 z-0 rotate-1 rounded-xl bg-paper/5 px-4 py-3 backdrop-blur-sm">
                <p className="flex items-center gap-2 text-[12px] font-bold text-pine-100/80"><IcAward size={15} className="text-sun-400" /> Badge unlocked: Quiz Ace</p>
              </div>
            </div>
          </Reveal>
        </div>
        <div className="weave weave-thin" aria-hidden />
      </section>

      {/* ═══ subject marquee ═══ */}
      <section aria-label="Subjects offered" className="overflow-hidden border-y border-sun-700/20 bg-sun-500 py-3.5">
        <div className="marquee items-center gap-8">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center gap-8" aria-hidden={dup === 1}>
              {subjects.map((s) => (
                <Link key={s.id + dup} to={`/courses?subject=${s.id}`} className="group flex items-center gap-2.5 text-pine-950">
                  <span className="transition-transform group-hover:scale-125"><SubjectIcon icon={s.icon} size={17} /></span>
                  <span className="whitespace-nowrap font-display text-[15px] font-bold">{s.name}</span>
                  <span className="ml-4 h-1.5 w-1.5 rotate-45 bg-pine-950/60" aria-hidden />
                </Link>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ learning paths ═══ */}
      <section className="dots-bg relative py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHead kicker="Learning paths" title={<>Pick your level. We know the way.</>} body="Four gates into the Kenyan curriculum — each one a tidy ladder of grades, subjects and courses." />
            <Reveal delay={150}><Link to="/subjects" className="link-sweep text-[14px] font-extrabold text-pine-700 dark:text-sun-400">Browse all subjects</Link></Reveal>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {levels.map((l, i) => {
              const gradeIds = db.grades.filter((g) => g.levelId === l.id).map((g) => g.id);
              const count = db.courses.filter((c) => c.published && gradeIds.includes(c.gradeId)).length;
              return (
                <Reveal key={l.id} delay={i * 90} className={cx(i % 2 === 1 && "lg:translate-y-6")}>
                  <Link to={`/courses?level=${l.id}`} className="lift group block h-full rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-[13px] font-black uppercase tracking-wider" style={{ color: l.accent }}>{l.sub}</span>
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-pine-700/8 text-pine-700 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 dark:bg-pine-200/10 dark:text-pine-300"><IcCap size={16} /></span>
                    </div>
                    <h3 className="mt-3 font-display text-xl font-bold">{l.title}</h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-ink-2/85 dark:text-pine-200/60">{l.desc}</p>
                    <p className="mt-4 flex items-center gap-1.5 border-t border-pine-700/8 pt-3.5 text-[12px] font-extrabold uppercase tracking-wider text-ink-2/60 dark:border-pine-200/8 dark:text-pine-200/50">
                      {count} courses <IcArrowR size={14} className="text-sun-600 transition-transform group-hover:translate-x-1 dark:text-sun-400" />
                    </p>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ featured courses ═══ */}
      <section className="relative bg-pine-950 py-20 dark:bg-night-900">
        <div className="noise pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHead light kicker="Featured this term" title={<>Courses learners keep coming back to.</>} body="Hand-picked by our academic team — mapped to the curriculum, assessed, and taught by specialists." />
            <Reveal delay={150}>
              <Link to="/courses"><Btn variant="accent">View all courses <IcArrowR size={16} /></Btn></Link>
            </Reveal>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c, i) => <CourseCard key={c!.id} c={c!} delay={i * 100} />)}
          </div>
        </div>
      </section>

      {/* ═══ how it works ═══ */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHead center kicker="How SSGT works" title={<>Four steps from curious to confident.</>} />
          <div className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="absolute left-0 right-0 top-7 hidden h-[2px] bg-gradient-to-r from-transparent via-pine-700/25 to-transparent lg:block" aria-hidden />
            {[
              { icon: <IcSearch size={20} />, t: "Find your course", b: "Filter by grade, subject and curriculum — CBC or 8-4-4 — and see exactly what you'll learn." },
              { icon: <IcBookOpen size={20} />, t: "Enrol in seconds", b: "Free courses open instantly. Paid ones take an M-Pesa STK push or card, receipt included." },
              { icon: <IcVideo size={20} />, t: "Learn lesson by lesson", b: "Notes, videos and worked examples — mark each lesson complete and watch your progress bar move." },
              { icon: <IcChart size={20} />, t: "Prove it with quizzes", b: "Timed, auto-marked quizzes and teacher-graded assignments turn effort into visible grades." },
            ].map((s, i) => (
              <Reveal key={s.t} delay={i * 110}>
                <div className="relative">
                  <span className="relative z-10 grid h-14 w-14 place-items-center rounded-xl border-2 border-sun-500 bg-paper text-pine-800 shadow-md dark:bg-night-800 dark:text-sun-400">{s.icon}</span>
                  <span className="absolute left-16 top-3 font-display text-4xl font-black text-pine-700/12 dark:text-pine-200/10">0{i + 1}</span>
                  <h3 className="mt-4 font-display text-lg font-bold">{s.t}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-ink-2/85 dark:text-pine-200/60">{s.b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ why SSGT ═══ */}
      <section className="dots-bg py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionHead kicker="Why families choose SSGT" title={<>A tuition centre that never closes.</>} />
            <ul className="mt-7 space-y-4">
              {[
                ["Mapped to CBC & 8-4-4", "Curriculum → level → grade → subject → course → lesson. No guessing what comes next."],
                ["Assessment you can trust", "Timed quizzes with instant marking, assignments with real teacher feedback and released results."],
                ["Parents see everything", "Link your child with a code and follow lessons, grades and payments from your phone."],
                ["Built for Kenyan connections", "Feather-light pages, optimised images and dashboards that run smoothly on modest bundles."],
              ].map(([t, b], i) => (
                <Reveal key={t} delay={i * 80} dir="rv-l">
                  <li className="flex gap-4 rounded-xl border border-pine-700/10 bg-white p-4.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sun-500/15 text-sun-700 dark:text-sun-400"><IcCheck size={16} /></span>
                    <span>
                      <span className="block font-display text-[15.5px] font-bold">{t}</span>
                      <span className="mt-1 block text-[13.5px] leading-relaxed text-ink-2/85 dark:text-pine-200/60">{b}</span>
                    </span>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
          <Reveal dir="rv-r">
            <div className="board-bg noise relative overflow-hidden rounded-2xl p-6 sm:p-8">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-sun-400">Parent dashboard · Hassan Yusuf</p>
              <div className="mt-4 rounded-xl bg-paper p-4 text-ink shadow-lg">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-clay-500 font-display text-sm font-black text-paper">AY</span>
                  <div>
                    <p className="font-display text-[15px] font-bold">Amina Yusuf · Grade 8</p>
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-2/60">3 courses · code SSGT-1001</p>
                  </div>
                  <Badge tone="pine" className="ml-auto">On track</Badge>
                </div>
                <div className="mt-4 space-y-3">
                  {[["Mathematics — Algebra", 56], ["Integrated Science", 25], ["Computer Science", 25]].map(([t, p]) => (
                    <div key={t as string}>
                      <div className="mb-1 flex justify-between text-[11.5px] font-bold text-ink-2/80"><span>{t}</span><span>{p}%</span></div>
                      <div className="h-2 overflow-hidden rounded-full bg-pine-700/10"><div className="bar-fill h-full rounded-full bg-pine-600" style={{ width: `${p}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[["B+", "avg grade"], ["3", "due tasks"], ["✓", "fees paid"]].map(([v, l]) => (
                  <div key={l} className="rounded-lg border border-paper/12 bg-paper/6 px-3 py-3 text-center">
                    <p className="font-display text-lg font-black text-sun-400">{v}</p>
                    <p className="mt-0.5 text-[10px] font-extrabold uppercase tracking-wider text-pine-100/60">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ testimonials — scattered postcards ═══ */}
      <section className="relative overflow-hidden bg-pine-950 py-20 dark:bg-night-900">
        <div className="noise pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHead light center kicker="Word on the street" title={<>From Nairobi to Nakuru to Mombasa.</>} />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {db.settings.testimonials.map((t, i) => (
              <Reveal key={t.id} delay={i * 120} className={cx(i === 0 && "md:-rotate-2 md:translate-y-4", i === 1 && "md:rotate-1 md:-translate-y-2", i === 2 && "md:-rotate-1 md:translate-y-6")}>
                <figure className="lift h-full rounded-xl border border-paper/10 bg-paper p-6 text-ink shadow-2xl">
                  <svg width="26" height="20" viewBox="0 0 26 20" fill="var(--color-sun-500)" aria-hidden><path d="M0 20V11.2C0 4.9 3.6 1 10.4 0l1.3 3.4c-3.7 1-5.6 3.1-5.9 6h5.4V20Zm14.8 0V11.2c0-6.3 3.6-10.2 10.4-11.2l1.3 3.4c-3.7 1-5.6 3.1-5.9 6H26V20Z" /></svg>
                  <blockquote className="mt-3 text-[14.5px] leading-relaxed">“{t.quote}”</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-pine-700/10 pt-4">
                    <span className="grid h-10 w-10 place-items-center rounded-full font-display text-sm font-black text-paper" style={{ background: t.color }}>
                      {t.name.split(" ").map((w) => w[0]).join("")}
                    </span>
                    <span>
                      <span className="block text-[13.5px] font-bold">{t.name}</span>
                      <span className="block text-[11.5px] font-bold uppercase tracking-wider text-ink-2/60">{t.role}</span>
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ resource strip ═══ */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHead kicker="Resource library" title={<>Past papers. Notes. Schemes.</>} body="Downloadable revision material, curated by teachers and organised by subject and grade." />
            <Reveal delay={150}><Link to="/resources" className="link-sweep text-[14px] font-extrabold text-pine-700 dark:text-sun-400">Open the library</Link></Reveal>
          </div>
          <div className="mt-9 grid gap-5 sm:grid-cols-3">
            {db.resources.filter((r) => r.active).slice(0, 3).map((r, i) => (
              <Reveal key={r.id} delay={i * 100}>
                <Link to="/resources" className="lift group flex h-full items-start gap-4 rounded-xl border border-pine-700/10 bg-white p-5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-pine-700/10 text-pine-700 transition-transform group-hover:-rotate-6 dark:bg-pine-200/10 dark:text-pine-300"><IcDownload size={19} /></span>
                  <span>
                    <span className="block font-display text-[15px] font-bold leading-snug group-hover:text-pine-700 dark:group-hover:text-sun-400">{r.title}</span>
                    <span className="mt-1 block text-[12px] font-bold uppercase tracking-wider text-ink-2/60 dark:text-pine-200/50">{r.kind.replace("-", " ")} · {r.downloads.toLocaleString()} downloads</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="dots-bg py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <SectionHead center kicker="Questions, answered" title={<>Before you ask the deputy principal…</>} />
          <div className="mt-10 space-y-3">
            {db.settings.faqs.map((f, i) => (
              <Reveal key={f.id} delay={i * 60}>
                <div className={cx("overflow-hidden rounded-xl border bg-white transition-colors dark:bg-night-800", openFaq === i ? "border-sun-500/50 shadow-[var(--shadow-card)]" : "border-pine-700/10 dark:border-pine-200/10")}>
                  <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)} aria-expanded={openFaq === i}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left">
                    <span className="font-display text-[15.5px] font-bold">{f.q}</span>
                    <span className={cx("grid h-7 w-7 shrink-0 place-items-center rounded-full bg-pine-700/8 text-pine-700 transition-transform duration-300 dark:bg-pine-200/10 dark:text-pine-300", openFaq === i && "rotate-180 bg-sun-500/20 text-sun-700 dark:text-sun-400")}><IcChevD size={15} /></span>
                  </button>
                  <div className={cx("grid transition-all duration-300", openFaq === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                    <div className="overflow-hidden"><p className="px-5 pb-5 text-[14px] leading-relaxed text-ink-2 dark:text-pine-200/70">{f.a}</p></div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative overflow-hidden bg-pine-950 dark:bg-night-900">
        <div className="weave weave-thin" aria-hidden />
        <div className="noise relative mx-auto flex max-w-7xl flex-col items-center px-4 py-18 text-center sm:px-6 lg:px-8">
          <Reveal>
            <IcCap size={44} className="mx-auto text-sun-400" />
            <h2 className="mx-auto mt-5 max-w-2xl font-display text-4xl font-black leading-tight text-paper sm:text-5xl">Your next grade is built tonight.</h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-pine-100/70">Join thousands of Kenyan learners revising smarter with structured courses, honest marks and parents cheering from the dashboard.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3.5">
              <Btn size="lg" variant="accent" onClick={() => nav(startTo)}>Start Learning — it's free <IcArrowR size={17} /></Btn>
              <Btn size="lg" variant="outline" className="border-paper/25 text-paper hover:border-sun-400 hover:bg-paper/5 hover:text-sun-400" onClick={() => nav("/courses")}>Explore Courses</Btn>
            </div>
            <p className="mt-6 text-[12px] font-bold uppercase tracking-wider text-pine-100/40">Free courses forever · Paid courses from KSh 350 · M-Pesa accepted</p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}


+++ src/pages/home.tsx (修改后)
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { lessonsOf, useApp } from "../lib/db";
import { Badge, Btn, Counter, Reveal, SectionHead, cx } from "../components/ui";
import { Donut } from "../components/charts";
import { CourseCard, SubjectIcon } from "./catalog";
import {
  IcArrowR, IcAward, IcBell, IcBookOpen, IcCap, IcChart, IcCheck, IcChevD, IcClipboard, IcDownload,
  IcFlame, IcMoney, IcPlay, IcSearch, IcShield, IcTarget, IcTrend, IcUsers, IcVideo,
} from "../components/icons";

const Scribble = () => (
  <svg viewBox="0 0 220 14" className="absolute -bottom-2 left-0 w-full text-sun-400" aria-hidden preserveAspectRatio="none">
    <path d="M3 10 C 40 2, 80 12, 118 7 S 190 4, 217 8" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" opacity="0.9" />
  </svg>
);

export function HomePage() {
  const { db, user } = useApp();
  const nav = useNavigate();
  const featured = db.settings.featuredCourseIds.map((id) => db.courses.find((c) => c.id === id)).filter(Boolean).slice(0, 3);
  const subjects = db.subjects.filter((s) => s.active);
  const totalLessons = db.courses.reduce((n, c) => n + lessonsOf(c.id).length, 0);
  const startTo = user ? "/app/dashboard" : "/register";
  const [openFaq, setOpenFaq] = useState(0);

  const levels = [
    { id: "lvl-pri", title: "CBC Primary", sub: "Grade 1 – 6", desc: "Foundational literacy, numeracy and science through play-rich, competency-based lessons.", accent: "#5C9C80" },
    { id: "lvl-jss", title: "Junior Secondary", sub: "Grade 7 – 9", desc: "The full JSS subject list — integrated science, pre-technical, agriculture and more.", accent: "#0C5A43" },
    { id: "lvl-sss", title: "Senior Secondary", sub: "Grade 10 – 12", desc: "Pathway-ready courses as the senior school curriculum rolls out nationwide.", accent: "#B56508" },
    { id: "lvl-844s", title: "8-4-4 / KCSE", sub: "Form 1 – 4", desc: "Exam-focused revision: past papers, marking schemes and timed drills.", accent: "#C4562E" },
  ];

  return (
    <div>
      {/* ═══ HERO — the chalkboard ═══ */}
      <section className="board-bg noise relative overflow-hidden pt-32 sm:pt-36">
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-16 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-8 lg:px-8 lg:pb-24">
          <div>
            <Reveal>
              <p className="inline-flex flex-wrap items-center gap-2 rounded-full border border-paper/15 bg-paper/5 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-sun-400 backdrop-blur-sm">
                <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-sun-400" /> Kenya's structured learning platform · CBC & 8-4-4
              </p>
            </Reveal>
            <h1 className="mt-6 font-display text-[42px] font-black leading-[1.04] text-paper sm:text-6xl lg:text-[64px]">
              <span className="lm"><span style={{ animationDelay: "0.05s" }}>Learn <span className="relative inline-block text-sun-400">Smarter.<Scribble /></span></span></span>
              <span className="lm"><span style={{ animationDelay: "0.22s" }}>Grow Stronger.</span></span>
              <span className="lm"><span style={{ animationDelay: "0.39s" }} className="text-pine-200">Succeed.</span></span>
            </h1>
            <Reveal delay={350}>
              <p className="mt-6 max-w-xl text-[15.5px] leading-relaxed text-pine-100/80">
                School Smart Guide Tutors puts a structured Kenyan curriculum in your pocket — mapped courses, video lessons,
                timed quizzes, marked assignments and honest progress tracking for learners, parents and teachers.
              </p>
            </Reveal>
            <Reveal delay={450}>
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Btn size="lg" variant="accent" onClick={() => nav(startTo)}>Start Learning <IcArrowR size={17} /></Btn>
                <Btn size="lg" variant="outline" className="border-paper/25 text-paper hover:border-sun-400 hover:bg-paper/5 hover:text-sun-400" onClick={() => nav("/courses")}>Explore Courses</Btn>
              </div>
            </Reveal>
            <Reveal delay={550}>
              <dl className="mt-11 grid max-w-lg grid-cols-3 gap-6 border-t border-paper/10 pt-6">
                {[
                  [<Counter key="1" to={2400} suffix="+" />, "active learners"],
                  [<Counter key="2" to={totalLessons} />, "structured lessons"],
                  [<Counter key="3" to={94} suffix="%" />, "quiz pass rate"],
                ].map(([v, l]) => (
                  <div key={l as string}>
                    <dt className="sr-only">{l as string}</dt>
                    <dd className="font-display text-[26px] font-black text-sun-400 sm:text-3xl">{v}</dd>
                    <dd className="mt-0.5 text-[11px] font-extrabold uppercase tracking-wider text-pine-100/55">{l}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          {/* live-learning snapshot */}
          <Reveal dir="rv-r" delay={200} className="relative hidden lg:block">
            <div className="relative">
              <div className="float-slow relative z-10 w-[380px] rounded-2xl border border-paper/12 bg-paper p-5 shadow-2xl shadow-pine-950/50">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-ink-2/60">Tonight's session · Amina, Grade 8</p>
                  <span className="flex items-center gap-1.5 rounded-full bg-pine-700/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-pine-800"><span className="pulse-dot h-1.5 w-1.5 rounded-full bg-pine-600" /> live</span>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="relative h-[86px] w-[86px] shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-pine-700 to-pine-950">
                    <img src={db.courses[0].image} alt="" className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-[15px] font-bold leading-snug text-ink">Linear Equations Mastery</p>
                    <p className="mt-1 text-[12px] font-semibold text-ink-2/70">Grade 8 Mathematics · Ms. Wanjiku</p>
                    <p className="mt-2 flex items-center gap-1.5 text-[12px] font-bold text-pine-700"><IcPlay size={13} /> Lesson 6 of 9 · Two-step equations</p>
                  </div>
                  <Donut value={56} size={72} stroke={8} sub="done" />
                </div>
                <div className="mt-4 space-y-2">
                  {[["Expressions & like terms", true], ["One-step equations", true], ["Two-step equations", false]].map(([t, done]) => (
                    <div key={t as string} className={cx("flex items-center gap-2.5 rounded-lg border px-3 py-2 text-[12.5px] font-bold", done ? "border-pine-700/10 bg-pine-700/5 text-ink-2/70" : "border-sun-500/40 bg-sun-500/10 text-ink")}>
                      <span className={cx("grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full", done ? "bg-pine-700 text-paper" : "border-2 border-sun-600 text-transparent")}><IcCheck size={11} /></span>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
              <div className="float-slower absolute -right-10 -top-8 z-20 rotate-3 rounded-xl border border-paper/12 bg-pine-800 px-4 py-3 shadow-xl">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-sun-400">Quiz scored</p>
                <p className="font-display text-xl font-black text-paper">88% · Pass ✓</p>
              </div>
              <div className="float-slower absolute -left-12 bottom-6 z-20 -rotate-2 rounded-xl border border-paper/12 bg-sun-500 px-4 py-3 shadow-xl">
                <p className="flex items-center gap-2 text-[12px] font-black text-pine-950"><IcMoney size={15} /> M-Pesa enrolment · KSh 0–500</p>
              </div>
              <div className="absolute -bottom-8 right-10 z-0 rotate-1 rounded-xl bg-paper/5 px-4 py-3 backdrop-blur-sm">
                <p className="flex items-center gap-2 text-[12px] font-bold text-pine-100/80"><IcAward size={15} className="text-sun-400" /> Badge unlocked: Quiz Ace</p>
              </div>
            </div>
          </Reveal>
        </div>
        <div className="weave weave-thin" aria-hidden />
      </section>

      {/* ═══ subject marquee ═══ */}
      <section aria-label="Subjects offered" className="overflow-hidden border-y border-sun-700/20 bg-sun-500 py-3.5">
        <div className="marquee items-center gap-8">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center gap-8" aria-hidden={dup === 1}>
              {subjects.map((s) => (
                <Link key={s.id + dup} to={`/courses?subject=${s.id}`} className="group flex items-center gap-2.5 text-pine-950">
                  <span className="transition-transform group-hover:scale-125"><SubjectIcon icon={s.icon} size={17} /></span>
                  <span className="whitespace-nowrap font-display text-[15px] font-bold">{s.name}</span>
                  <span className="ml-4 h-1.5 w-1.5 rotate-45 bg-pine-950/60" aria-hidden />
                </Link>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ learning paths ═══ */}
      <section className="dots-bg relative py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHead kicker="Learning paths" title={<>Pick your level. We know the way.</>} body="Four gates into the Kenyan curriculum — each one a tidy ladder of grades, subjects and courses." />
            <Reveal delay={150}><Link to="/subjects" className="link-sweep text-[14px] font-extrabold text-pine-700 dark:text-sun-400">Browse all subjects</Link></Reveal>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {levels.map((l, i) => {
              const gradeIds = db.grades.filter((g) => g.levelId === l.id).map((g) => g.id);
              const count = db.courses.filter((c) => c.published && gradeIds.includes(c.gradeId)).length;
              return (
                <Reveal key={l.id} delay={i * 90} className={cx(i % 2 === 1 && "lg:translate-y-6")}>
                  <Link to={`/courses?level=${l.id}`} className="lift group block h-full rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-[13px] font-black uppercase tracking-wider" style={{ color: l.accent }}>{l.sub}</span>
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-pine-700/8 text-pine-700 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 dark:bg-pine-200/10 dark:text-pine-300"><IcCap size={16} /></span>
                    </div>
                    <h3 className="mt-3 font-display text-xl font-bold">{l.title}</h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-ink-2/85 dark:text-pine-200/60">{l.desc}</p>
                    <p className="mt-4 flex items-center gap-1.5 border-t border-pine-700/8 pt-3.5 text-[12px] font-extrabold uppercase tracking-wider text-ink-2/60 dark:border-pine-200/8 dark:text-pine-200/50">
                      {count} courses <IcArrowR size={14} className="text-sun-600 transition-transform group-hover:translate-x-1 dark:text-sun-400" />
                    </p>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ featured courses ═══ */}
      <section className="relative bg-pine-950 py-20 dark:bg-night-900">
        <div className="noise pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHead light kicker="Featured this term" title={<>Courses learners keep coming back to.</>} body="Hand-picked by our academic team — mapped to the curriculum, assessed, and taught by specialists." />
            <Reveal delay={150}>
              <Link to="/courses"><Btn variant="accent">View all courses <IcArrowR size={16} /></Btn></Link>
            </Reveal>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c, i) => <CourseCard key={c!.id} c={c!} delay={i * 100} />)}
          </div>
        </div>
      </section>

      {/* ═══ how it works ═══ */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHead center kicker="How SSGT works" title={<>Four steps from curious to confident.</>} />
          <div className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="absolute left-0 right-0 top-7 hidden h-[2px] bg-gradient-to-r from-transparent via-pine-700/25 to-transparent lg:block" aria-hidden />
            {[
              { icon: <IcSearch size={20} />, t: "Find your course", b: "Filter by grade, subject and curriculum — CBC or 8-4-4 — and see exactly what you'll learn." },
              { icon: <IcBookOpen size={20} />, t: "Enrol in seconds", b: "Free courses open instantly. Paid ones take an M-Pesa STK push or card, receipt included." },
              { icon: <IcVideo size={20} />, t: "Learn lesson by lesson", b: "Notes, videos and worked examples — mark each lesson complete and watch your progress bar move." },
              { icon: <IcChart size={20} />, t: "Prove it with quizzes", b: "Timed, auto-marked quizzes and teacher-graded assignments turn effort into visible grades." },
            ].map((s, i) => (
              <Reveal key={s.t} delay={i * 110}>
                <div className="relative">
                  <span className="relative z-10 grid h-14 w-14 place-items-center rounded-xl border-2 border-sun-500 bg-paper text-pine-800 shadow-md dark:bg-night-800 dark:text-sun-400">{s.icon}</span>
                  <span className="absolute left-16 top-3 font-display text-4xl font-black text-pine-700/12 dark:text-pine-200/10">0{i + 1}</span>
                  <h3 className="mt-4 font-display text-lg font-bold">{s.t}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-ink-2/85 dark:text-pine-200/60">{s.b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ why SSGT ═══ */}
      <section className="dots-bg py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionHead kicker="Why families choose SSGT" title={<>A tuition centre that never closes.</>} />
            <ul className="mt-7 space-y-4">
              {[
                ["Mapped to CBC & 8-4-4", "Curriculum → level → grade → subject → course → lesson. No guessing what comes next."],
                ["Assessment you can trust", "Timed quizzes with instant marking, assignments with real teacher feedback and released results."],
                ["Parents see everything", "Link your child with a code and follow lessons, grades and payments from your phone."],
                ["Built for Kenyan connections", "Feather-light pages, optimised images and dashboards that run smoothly on modest bundles."],
              ].map(([t, b], i) => (
                <Reveal key={t} delay={i * 80} dir="rv-l">
                  <li className="flex gap-4 rounded-xl border border-pine-700/10 bg-white p-4.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sun-500/15 text-sun-700 dark:text-sun-400"><IcCheck size={16} /></span>
                    <span>
                      <span className="block font-display text-[15.5px] font-bold">{t}</span>
                      <span className="mt-1 block text-[13.5px] leading-relaxed text-ink-2/85 dark:text-pine-200/60">{b}</span>
                    </span>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
          <Reveal dir="rv-r">
            <div className="board-bg noise relative overflow-hidden rounded-2xl p-6 sm:p-8">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-sun-400">Parent dashboard · Hassan Yusuf</p>
              <div className="mt-4 rounded-xl bg-paper p-4 text-ink shadow-lg">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-clay-500 font-display text-sm font-black text-paper">AY</span>
                  <div>
                    <p className="font-display text-[15px] font-bold">Amina Yusuf · Grade 8</p>
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-2/60">3 courses · code SSGT-1001</p>
                  </div>
                  <Badge tone="pine" className="ml-auto">On track</Badge>
                </div>
                <div className="mt-4 space-y-3">
                  {[["Mathematics — Algebra", 56], ["Integrated Science", 25], ["Computer Science", 25]].map(([t, p]) => (
                    <div key={t as string}>
                      <div className="mb-1 flex justify-between text-[11.5px] font-bold text-ink-2/80"><span>{t}</span><span>{p}%</span></div>
                      <div className="h-2 overflow-hidden rounded-full bg-pine-700/10"><div className="bar-fill h-full rounded-full bg-pine-600" style={{ width: `${p}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[["B+", "avg grade"], ["3", "due tasks"], ["✓", "fees paid"]].map(([v, l]) => (
                  <div key={l} className="rounded-lg border border-paper/12 bg-paper/6 px-3 py-3 text-center">
                    <p className="font-display text-lg font-black text-sun-400">{v}</p>
                    <p className="mt-0.5 text-[10px] font-extrabold uppercase tracking-wider text-pine-100/60">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ testimonials — scattered postcards ═══ */}
      <section className="relative overflow-hidden bg-pine-950 py-20 dark:bg-night-900">
        <div className="noise pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHead light center kicker="Word on the street" title={<>From Nairobi to Nakuru to Mombasa.</>} />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {db.settings.testimonials.map((t, i) => (
              <Reveal key={t.id} delay={i * 120} className={cx(i === 0 && "md:-rotate-2 md:translate-y-4", i === 1 && "md:rotate-1 md:-translate-y-2", i === 2 && "md:-rotate-1 md:translate-y-6")}>
                <figure className="lift h-full rounded-xl border border-paper/10 bg-paper p-6 text-ink shadow-2xl">
                  <svg width="26" height="20" viewBox="0 0 26 20" fill="var(--color-sun-500)" aria-hidden><path d="M0 20V11.2C0 4.9 3.6 1 10.4 0l1.3 3.4c-3.7 1-5.6 3.1-5.9 6h5.4V20Zm14.8 0V11.2c0-6.3 3.6-10.2 10.4-11.2l1.3 3.4c-3.7 1-5.6 3.1-5.9 6H26V20Z" /></svg>
                  <blockquote className="mt-3 text-[14.5px] leading-relaxed">“{t.quote}”</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-pine-700/10 pt-4">
                    <span className="grid h-10 w-10 place-items-center rounded-full font-display text-sm font-black text-paper" style={{ background: t.color }}>
                      {t.name.split(" ").map((w) => w[0]).join("")}
                    </span>
                    <span>
                      <span className="block text-[13.5px] font-bold">{t.name}</span>
                      <span className="block text-[11.5px] font-bold uppercase tracking-wider text-ink-2/60">{t.role}</span>
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ resource strip ═══ */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHead kicker="Resource library" title={<>Past papers. Notes. Schemes.</>} body="Downloadable revision material, curated by teachers and organised by subject and grade." />
            <Reveal delay={150}><Link to="/resources" className="link-sweep text-[14px] font-extrabold text-pine-700 dark:text-sun-400">Open the library</Link></Reveal>
          </div>
          <div className="mt-9 grid gap-5 sm:grid-cols-3">
            {db.resources.filter((r) => r.active).slice(0, 3).map((r, i) => (
              <Reveal key={r.id} delay={i * 100}>
                <Link to="/resources" className="lift group flex h-full items-start gap-4 rounded-xl border border-pine-700/10 bg-white p-5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-pine-700/10 text-pine-700 transition-transform group-hover:-rotate-6 dark:bg-pine-200/10 dark:text-pine-300"><IcDownload size={19} /></span>
                  <span>
                    <span className="block font-display text-[15px] font-bold leading-snug group-hover:text-pine-700 dark:group-hover:text-sun-400">{r.title}</span>
                    <span className="mt-1 block text-[12px] font-bold uppercase tracking-wider text-ink-2/60 dark:text-pine-200/50">{r.kind.replace("-", " ")} · {r.downloads.toLocaleString()} downloads</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="dots-bg py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <SectionHead center kicker="Questions, answered" title={<>Before you ask the deputy principal…</>} />
          <div className="mt-10 space-y-3">
            {db.settings.faqs.map((f, i) => (
              <Reveal key={f.id} delay={i * 60}>
                <div className={cx("overflow-hidden rounded-xl border bg-white transition-colors dark:bg-night-800", openFaq === i ? "border-sun-500/50 shadow-[var(--shadow-card)]" : "border-pine-700/10 dark:border-pine-200/10")}>
                  <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)} aria-expanded={openFaq === i}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left">
                    <span className="font-display text-[15.5px] font-bold">{f.q}</span>
                    <span className={cx("grid h-7 w-7 shrink-0 place-items-center rounded-full bg-pine-700/8 text-pine-700 transition-transform duration-300 dark:bg-pine-200/10 dark:text-pine-300", openFaq === i && "rotate-180 bg-sun-500/20 text-sun-700 dark:text-sun-400")}><IcChevD size={15} /></span>
                  </button>
                  <div className={cx("grid transition-all duration-300", openFaq === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                    <div className="overflow-hidden"><p className="px-5 pb-5 text-[14px] leading-relaxed text-ink-2 dark:text-pine-200/70">{f.a}</p></div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative overflow-hidden bg-pine-950 dark:bg-night-900">
        <div className="weave weave-thin" aria-hidden />
        <div className="noise relative mx-auto flex max-w-7xl flex-col items-center px-4 py-18 text-center sm:px-6 lg:px-8">
          <Reveal>
            <IcCap size={44} className="mx-auto text-sun-400" />
            <h2 className="mx-auto mt-5 max-w-2xl font-display text-4xl font-black leading-tight text-paper sm:text-5xl">Your next grade is built tonight.</h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-pine-100/70">Join thousands of Kenyan learners revising smarter with structured courses, honest marks and parents cheering from the dashboard.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3.5">
              <Btn size="lg" variant="accent" onClick={() => nav(startTo)}>Start Learning — it's free <IcArrowR size={17} /></Btn>
              <Btn size="lg" variant="outline" className="border-paper/25 text-paper hover:border-sun-400 hover:bg-paper/5 hover:text-sun-400" onClick={() => nav("/courses")}>Explore Courses</Btn>
            </div>
            <p className="mt-6 text-[12px] font-bold uppercase tracking-wider text-pine-100/40">Free courses forever · Paid courses from KSh 350 · M-Pesa accepted</p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
