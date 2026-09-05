--- src/pages/catalog.tsx (原始)
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  addContact, courseProgress, downloadResource, enrollmentFor,
  gradeName, isBookmarked, levelName, lessonsOf, subjectName, toggleBookmark, useApp, userById,
} from "../lib/db";
import type { Course, Resource } from "../lib/types";
import { Avatar, Badge, Btn, Counter, Empty, Field, Pager, Progress, Reveal, SectionHead, Select, Stars, TextInput, TextArea, cx, ksh, useLoad, Skel, useToast } from "../components/ui";
import { PageHero } from "../components/layout";
import {
  IcArrowR, IcBookOpen, IcBookmark, IcCap, IcCheckC, IcClipboard, IcCode, IcDownload, IcDrum, IcFileText,
  IcFlame, IcGlobe, IcLeaf, IcLock, IcMail, IcMoney, IcPhone, IcSearch, IcShield, IcSpark, IcSun, IcTarget, IcUsers, IcVideo, IcX,
} from "../components/icons";

/* ── subject icon mapping (db-driven subjects pick an icon key) ──────────── */
export function SubjectIcon({ icon, size = 20 }: { icon: string; size?: number }) {
  const map: Record<string, React.ReactNode> = {
    target: <IcTarget size={size} />, book: <IcBookOpen size={size} />, drum: <IcDrum size={size} />,
    spark: <IcSpark size={size} />, globe: <IcGlobe size={size} />, money: <IcMoney size={size} />,
    leaf: <IcLeaf size={size} />, code: <IcCode size={size} />, sun: <IcSun size={size} />,
    flame: <IcFlame size={size} />, shield: <IcShield size={size} />,
  };
  return <>{map[icon] ?? <IcBookOpen size={size} />}</>;
}

/* ── Course card ─────────────────────────────────────────────────────────── */
export function CourseCard({ c, progress, delay = 0 }: { c: Course; progress?: number; delay?: number }) {
  const teacher = userById(c.teacherId);
  const lessonCount = lessonsOf(c.id).length;
  return (
    <Reveal delay={delay}>
      <Link to={`/courses/${c.id}`} className="lift group block overflow-hidden rounded-xl border border-pine-700/10 bg-white shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
        <div className="relative h-42 overflow-hidden bg-gradient-to-br from-pine-700 to-pine-950">
          <img src={c.image} alt="" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            className="h-full w-full object-cover transition-transform duration-[2.5s] ease-out group-hover:scale-110" />
          <div className="absolute left-3 top-3">
            {c.price === 0
              ? <Badge tone="sun" className="bg-sun-500 text-pine-950">Free</Badge>
              : <Badge tone="night" className="bg-pine-950/85 text-sun-400 backdrop-blur-sm">{ksh(c.price)}</Badge>}
          </div>
          <div className="absolute right-3 top-3"><Badge tone="gray" className="bg-pine-950/70 text-paper backdrop-blur-sm">{gradeName(c.gradeId)}</Badge></div>
        </div>
        <div className="p-4.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider" style={{ color: "#0C5A43" }}>
              <span className="dark:text-pine-300">{subjectName(c.subjectId)}</span>
            </span>
            <span className="flex items-center gap-1 text-[12px] font-bold text-ink-2 dark:text-pine-200/70"><Stars value={c.rating} size={11} /> {c.rating.toFixed(1)}</span>
          </div>
          <h3 className="mt-1.5 line-clamp-2 font-display text-[17px] font-bold leading-snug transition-colors group-hover:text-pine-700 dark:group-hover:text-sun-400">{c.title}</h3>
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink-2/85 dark:text-pine-200/60">{c.description}</p>
          {teacher && (
            <div className="mt-3 flex items-center gap-2">
              <Avatar name={teacher.name} color={teacher.color} size={26} />
              <span className="text-[12.5px] font-bold text-ink-2 dark:text-pine-200/70">{teacher.name}</span>
            </div>
          )}
          <div className="mt-3 flex items-center gap-4 border-t border-pine-700/8 pt-3 text-[12px] font-bold text-ink-2/75 dark:border-pine-200/8 dark:text-pine-200/55">
            <span className="flex items-center gap-1.5"><IcBookOpen size={14} /> {lessonCount} lessons</span>
            <span className="flex items-center gap-1.5"><IcUsers size={14} /> {c.enrolledCount.toLocaleString()}</span>
          </div>
          {typeof progress === "number" && (
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-[11px] font-extrabold uppercase tracking-wider text-ink-2/60 dark:text-pine-200/50">
                <span>Your progress</span><span className="text-pine-700 dark:text-sun-400">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </div>
      </Link>
    </Reveal>
  );
}

/* ── Courses catalogue ───────────────────────────────────────────────────── */
export function CoursesPage() {
  const { db, user } = useApp();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [subject, setSubject] = useState(params.get("subject") ?? "");
  const [level, setLevel] = useState(params.get("level") ?? "");
  const [grade, setGrade] = useState(params.get("grade") ?? "");
  const [curriculum, setCurriculum] = useState(params.get("curriculum") ?? "");
  const [pricing, setPricing] = useState(params.get("pricing") ?? "");
  const [teacher, setTeacher] = useState(params.get("teacher") ?? "");
  const [sort, setSort] = useState("popular");
  const [page, setPage] = useState(1);
  const loading = useLoad(350);

  useEffect(() => {
    const next = new URLSearchParams();
    if (q) next.set("q", q); if (subject) next.set("subject", subject); if (level) next.set("level", level);
    if (grade) next.set("grade", grade); if (curriculum) next.set("curriculum", curriculum);
    if (pricing) next.set("pricing", pricing); if (teacher) next.set("teacher", teacher);
    setParams(next, { replace: true });
    setPage(1);
  }, [q, subject, level, grade, curriculum, pricing, teacher]); // eslint-disable-line react-hooks/exhaustive-deps

  const teachers = db.users.filter((u) => u.role === "teacher" && u.active);
  const list = useMemo(() => {
    let out = db.courses.filter((c) => c.published);
    if (q.trim()) out = out.filter((c) => (c.title + " " + c.description + " " + subjectName(c.subjectId)).toLowerCase().includes(q.toLowerCase()));
    if (subject) out = out.filter((c) => c.subjectId === subject);
    if (grade) out = out.filter((c) => c.gradeId === grade);
    if (curriculum) out = out.filter((c) => c.curriculumId === curriculum);
    if (pricing) out = out.filter((c) => (pricing === "free" ? c.price === 0 : c.price > 0));
    if (teacher) out = out.filter((c) => c.teacherId === teacher);
    if (level) {
      const gradeIds = db.grades.filter((g) => g.levelId === level).map((g) => g.id);
      out = out.filter((c) => gradeIds.includes(c.gradeId));
    }
    out = [...out].sort((a, b) => sort === "popular" ? b.enrolledCount - a.enrolledCount : sort === "rating" ? b.rating - a.rating : sort === "newest" ? b.createdAt - a.createdAt : a.price - b.price);
    return out;
  }, [db, q, subject, level, grade, curriculum, pricing, teacher, sort]);

  const pages = Math.max(1, Math.ceil(list.length / 9));
  const shown = list.slice((page - 1) * 9, page * 9);
  const activeFilters = [subject, level, grade, curriculum, pricing, teacher].filter(Boolean).length;

  return (
    <div className="pb-20">
      <PageHero kicker="Course catalogue" title={<>Find the course that moves you <em className="not-italic text-sun-400">forward</em>.</>}
        body="Every course is mapped to a curriculum, level and grade — from CBC Grade 5 to KCSE revision. Filter until it fits.">
        <div className="flex max-w-xl items-center gap-2 rounded-xl border border-paper/15 bg-paper/8 p-1.5 backdrop-blur-sm">
          <IcSearch size={18} className="ml-2.5 shrink-0 text-sun-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search courses, e.g. algebra, Kiswahili, KCSE…" aria-label="Search courses"
            className="w-full bg-transparent text-[15px] font-semibold text-paper outline-none placeholder:text-pine-100/50" />
          {q && <button onClick={() => setQ("")} aria-label="Clear search" className="mr-1 cursor-pointer rounded-md p-1 text-pine-100/60 hover:text-paper"><IcX size={15} /></button>}
        </div>
      </PageHero>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* filters */}
        <Reveal className="-mt-7 relative z-10">
          <div className="rounded-xl border border-pine-700/10 bg-white p-4 shadow-[var(--shadow-lift)] dark:border-pine-200/10 dark:bg-night-800">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
              <Select value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Subject">
                <option value="">All subjects</option>
                {db.subjects.filter((s) => s.active).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
              <Select value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Level">
                <option value="">All levels</option>
                {db.levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </Select>
              <Select value={grade} onChange={(e) => setGrade(e.target.value)} aria-label="Grade or form">
                <option value="">All grades</option>
                {db.grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </Select>
              <Select value={curriculum} onChange={(e) => setCurriculum(e.target.value)} aria-label="Curriculum">
                <option value="">All curricula</option>
                {db.curricula.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
              <Select value={pricing} onChange={(e) => setPricing(e.target.value)} aria-label="Pricing">
                <option value="">Free & paid</option>
                <option value="free">Free only</option>
                <option value="paid">Paid only</option>
              </Select>
              <Select value={teacher} onChange={(e) => setTeacher(e.target.value)} aria-label="Teacher">
                <option value="">All teachers</option>
                {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </Select>
              <Select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
                <option value="popular">Most popular</option>
                <option value="rating">Highest rated</option>
                <option value="newest">Newest</option>
                <option value="price">Price: low → high</option>
              </Select>
            </div>
            {(activeFilters > 0 || q) && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button onClick={() => { setSubject(""); setLevel(""); setGrade(""); setCurriculum(""); setPricing(""); setTeacher(""); setQ(""); }}
                  className="cursor-pointer text-[12px] font-extrabold uppercase tracking-wider text-clay-600 hover:underline">Clear all filters</button>
                <span className="text-[12px] font-semibold text-ink-2/60 dark:text-pine-200/50">·</span>
                <span className="text-[12px] font-bold text-ink-2/80 dark:text-pine-200/60">{list.length} course{list.length === 1 ? "" : "s"} found</span>
              </div>
            )}
          </div>
        </Reveal>

        {loading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skel key={i} className="h-80" />)}
          </div>
        ) : shown.length === 0 ? (
          <div className="mt-10">
            <Empty icon={<IcSearch size={26} />} title="No courses match" body="Try a different subject or clear some filters — new courses are added every term."
              action={<Btn variant="outline" onClick={() => { setSubject(""); setLevel(""); setGrade(""); setCurriculum(""); setPricing(""); setTeacher(""); setQ(""); }}>Clear filters</Btn>} />
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((c, i) => {
                const en = user?.role === "student" ? enrollmentFor(user.id, c.id) : undefined;
                return <CourseCard key={c.id} c={c} delay={(i % 3) * 90} progress={en && en.status !== "pending" ? courseProgress(user!.id, c.id).percent : undefined} />;
              })}
            </div>
            <div className="mt-10"><Pager page={page} pages={pages} onPage={setPage} /></div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Subjects ────────────────────────────────────────────────────────────── */
export function SubjectsPage() {
  const { db } = useApp();
  const loading = useLoad(300);
  const subjects = db.subjects.filter((s) => s.active);
  return (
    <div className="pb-20">
      <PageHero kicker="Subjects" title={<>Every subject, <em className="not-italic text-sun-400">one ladder</em>.</>}
        body="Subjects are organised by curriculum and level, so you always know exactly where a course sits in your learning path." />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skel key={i} className="h-48" />)}</div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((s, i) => {
              const courses = db.courses.filter((c) => c.subjectId === s.id && c.published);
              const resources = db.resources.filter((r) => r.subjectId === s.id && r.active);
              return (
                <Reveal key={s.id} delay={(i % 3) * 80}>
                  <Link to={`/courses?subject=${s.id}`} className="lift group relative block overflow-hidden rounded-xl border border-pine-700/10 bg-white p-5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
                    <span className="absolute inset-y-0 left-0 w-1.5 transition-all duration-300 group-hover:w-2.5" style={{ background: s.color }} aria-hidden />
                    <div className="flex items-start justify-between">
                      <span className="grid h-12 w-12 place-items-center rounded-xl text-paper transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" style={{ background: s.color }}>
                        <SubjectIcon icon={s.icon} size={22} />
                      </span>
                      <Badge tone="gray">{courses.length} course{courses.length === 1 ? "" : "s"}</Badge>
                    </div>
                    <h3 className="mt-4 font-display text-lg font-bold transition-colors group-hover:text-pine-700 dark:group-hover:text-sun-400">{s.name}</h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2/85 dark:text-pine-200/60">{s.description}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {s.levelIds.map((l) => <Badge key={l} tone="pine" className="normal-case tracking-normal">{levelName(l).split(" (")[0]}</Badge>)}
                    </div>
                    <p className="mt-4 flex items-center gap-1.5 text-[13px] font-extrabold text-sun-700 dark:text-sun-400">
                      Browse courses <IcArrowR size={15} className="transition-transform group-hover:translate-x-1" />
                    </p>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Resources library ───────────────────────────────────────────────────── */
export function ResourcesPage({ embedded = false }: { embedded?: boolean }) {
  const { db, user } = useApp();
  const toast = useToast();
  const [params] = useSearchParams();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState(params.get("kind") ?? "");
  const [subject, setSubject] = useState(params.get("subject") ?? "");
  const [grade, setGrade] = useState(params.get("grade") ?? "");
  const [page, setPage] = useState(1);
  const loading = useLoad(300);

  const kinds = ["notes", "past-paper", "marking-scheme", "worksheet", "study-guide", "practice", "video"];
  const list = useMemo(() => {
    let out = db.resources.filter((r) => r.active);
    if (q.trim()) out = out.filter((r) => (r.title + " " + r.description).toLowerCase().includes(q.toLowerCase()));
    if (kind) out = out.filter((r) => r.kind === kind);
    if (subject) out = out.filter((r) => r.subjectId === subject);
    if (grade) out = out.filter((r) => r.gradeId === grade);
    return out;
  }, [db, q, kind, subject, grade]);
  const pages = Math.max(1, Math.ceil(list.length / 8));
  const shown = list.slice((page - 1) * 8, page * 8);

  const doDownload = (r: Resource) => {
    if (!r.downloadEnabled) { toast.push("Downloads are restricted for this resource by the administrator.", "err"); return; }
    downloadResource(r.id);
    const blob = new Blob([`${r.title}\n${"=".repeat(40)}\n\n${r.description}\n\nSubject: ${subjectName(r.subjectId)} · ${gradeName(r.gradeId)}\nKind: ${r.kind}\n\nThis is a demo download from School Smart Guide Tutors. In production this file is served from secure object storage with authorization checks.`], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${r.title.replace(/[^\w\d]+/g, "-").toLowerCase()}.txt`;
    a.click(); URL.revokeObjectURL(a.href);
    toast.push(`Downloading “${r.title}”`);
  };

  const grid = loading ? (
    <div className="grid gap-5 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skel key={i} className="h-44" />)}</div>
  ) : shown.length === 0 ? (
    <Empty icon={<IcFileText size={26} />} title="No resources found" body="Adjust your filters or check back soon — teachers add new materials weekly." />
  ) : (
    <div className="grid gap-5 sm:grid-cols-2">
      {shown.map((r, i) => {
        const bm = user ? isBookmarked(user.id, "resource", r.id) : false;
        return (
          <Reveal key={r.id} delay={(i % 2) * 80}>
            <div className="lift group flex h-full flex-col rounded-xl border border-pine-700/10 bg-white p-5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
              <div className="flex items-start gap-3.5">
                <span className={cx("grid h-11 w-11 shrink-0 place-items-center rounded-lg", r.downloadEnabled ? "bg-pine-700/10 text-pine-700 dark:bg-pine-200/10 dark:text-pine-300" : "bg-clay-500/10 text-clay-600")}>
                  {r.kind === "video" ? <IcVideo size={20} /> : r.kind === "past-paper" || r.kind === "marking-scheme" ? <IcClipboard size={20} /> : <IcFileText size={20} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge tone="sun" className="capitalize">{r.kind.replace("-", " ")}</Badge>
                    {!r.downloadEnabled && <Badge tone="clay"><IcLock size={10} /> restricted</Badge>}
                  </div>
                  <h3 className="mt-1.5 font-display text-[15.5px] font-bold leading-snug">{r.title}</h3>
                </div>
                {user && (
                  <button onClick={() => { toggleBookmark(user.id, "resource", r.id); toast.push(bm ? "Removed from bookmarks" : "Saved to bookmarks", "info"); }}
                    aria-label={bm ? "Remove bookmark" : "Bookmark resource"} aria-pressed={bm}
                    className={cx("cursor-pointer rounded-md p-1.5 transition-all hover:scale-110", bm ? "text-sun-600 dark:text-sun-400" : "text-ink-2/40 hover:text-sun-600 dark:text-pine-200/40")}>
                    <IcBookmark size={17} filled={bm} />
                  </button>
                )}
              </div>
              <p className="mt-3 flex-1 text-[13px] leading-relaxed text-ink-2/85 dark:text-pine-200/60">{r.description}</p>
              <div className="mt-4 flex items-center justify-between border-t border-pine-700/8 pt-3.5 dark:border-pine-200/8">
                <span className="text-[11.5px] font-bold text-ink-2/70 dark:text-pine-200/50">
                  {subjectName(r.subjectId)} · {gradeName(r.gradeId)} · {(r.sizeKB / 1024).toFixed(1)} MB{r.pages ? ` · ${r.pages} pp` : ""}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-[11.5px] font-bold text-ink-2/60 dark:text-pine-200/50">{r.downloads.toLocaleString()} downloads</span>
                  <Btn size="sm" variant={r.downloadEnabled ? "primary" : "outline"} onClick={() => doDownload(r)} title={r.downloadEnabled ? undefined : "Downloads disabled by admin"}>
                    <IcDownload size={14} /> {r.downloadEnabled ? "Download" : "Locked"}
                  </Btn>
                </div>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );

  const inner = (
    <div className={cx(!embedded && "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8")}>
      <Reveal>
        <div className="mb-6 grid gap-3 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <IcSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-2/50 dark:text-pine-200/50" />
            <TextInput value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search notes, past papers, worksheets…" className="pl-10" aria-label="Search resources" />
          </div>
          <Select value={kind} onChange={(e) => { setKind(e.target.value); setPage(1); }} aria-label="Resource type">
            <option value="">All types</option>
            {kinds.map((k) => <option key={k} value={k}>{k.replace("-", " ")}</option>)}
          </Select>
          <Select value={subject} onChange={(e) => { setSubject(e.target.value); setPage(1); }} aria-label="Subject">
            <option value="">All subjects</option>
            {db.subjects.filter((s) => s.active).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </div>
      </Reveal>
      {grid}
      <div className="mt-8"><Pager page={page} pages={pages} onPage={setPage} /></div>
    </div>
  );

  if (embedded) return inner;
  return (
    <div className="pb-20">
      <PageHero kicker="Resource library" title={<>Revision gold, <em className="not-italic text-sun-400">ready to download</em>.</>}
        body="Notes, past papers, marking schemes and worksheets — curated by Kenyan teachers and organised by subject and grade." />
      <div className="mt-10">{inner}</div>
    </div>
  );
}

/* ── About ───────────────────────────────────────────────────────────────── */
export function AboutPage() {
  const { db } = useApp();
  const teachers = db.users.filter((u) => u.role === "teacher" && u.active);
  return (
    <div className="pb-20">
      <PageHero kicker="About SSGT" title={<>A study companion built for the <em className="not-italic text-sun-400">Kenyan classroom</em>.</>}
        body="School Smart Guide Tutors exists because talent is everywhere, but structured revision is not. We put a patient, rigorous tutor in every learner's pocket." />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-14 grid items-start gap-10 lg:grid-cols-[1.1fr_1fr]">
          <Reveal dir="rv-l">
            <SectionHead kicker="Our story" title="From tuition centres to every phone" />
            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-ink-2 dark:text-pine-200/75">
              <p>SSGT began in 2023 as a weekend tuition circle in Nairobi, where four teachers marked exercise books by torchlight and wished every question could give instant, kind feedback.</p>
              <p>Today the platform carries the full Kenyan curriculum — CBC from Grade 1 through Junior and Senior Secondary, plus 8-4-4 revision and KCSE practice. Courses are written lesson by lesson, assessed quiz by quiz, and tracked so that a parent in Lodwar sees the same progress chart as a teacher in Mombasa.</p>
              <p>We stay deliberately light: pages load on 3G, dashboards work on entry-level Android phones, and payments ride M-Pesa — because that is how Kenya actually learns.</p>
            </div>
            <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[["Curriculum-mapped", "Every lesson sits in a CBC or 8-4-4 path"], ["Assessment-first", "Quizzes, assignments and marked results"], ["Parent visibility", "Linked accounts, honest progress"], ["Teacher-powered", "Built and marked by TSC teachers"], ["Mobile-first", "Fast on modest phones and bundles"], ["Privacy-minded", "Learner data is guarded, audited, minimal"]].map(([t, b]) => (
                <div key={t} className="rounded-xl border border-pine-700/10 bg-white p-4 dark:border-pine-200/10 dark:bg-night-800">
                  <p className="font-display text-[14.5px] font-bold text-pine-800 dark:text-pine-200">{t}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink-2/75 dark:text-pine-200/55">{b}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal dir="rv-r" className="lg:sticky lg:top-24">
            <div className="board-bg noise relative overflow-hidden rounded-2xl p-7">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-sun-400">The tutors</p>
              <div className="mt-4 space-y-3">
                {teachers.map((t) => (
                  <div key={t.id} className="flex items-center gap-3.5 rounded-xl bg-paper/6 p-3 backdrop-blur-sm transition-colors hover:bg-paper/10">
                    <Avatar name={t.name} color={t.color} size={44} />
                    <div className="min-w-0">
                      <p className="font-display text-[15px] font-bold text-paper">{t.name}</p>
                      <p className="truncate text-[12px] text-pine-100/70">{t.subjectIds?.map(subjectName).join(" · ")}</p>
                    </div>
                    <IcCap size={18} className="ml-auto shrink-0 text-sun-400" />
                  </div>
                ))}
              </div>
              <p className="mt-5 border-t border-paper/10 pt-4 text-[12px] leading-relaxed text-pine-100/60">Every teacher is vetted, registered and subject-specialised. Their courses, grading and announcements are fully audited on the platform.</p>
            </div>
          </Reveal>
        </div>

        <div className="mt-20">
          <SectionHead kicker="By the numbers" title="Small platform, serious outcomes" center />
          <div className="mt-9 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {[
              [<Counter key="a" to={2400} suffix="+" />, "active learners"],
              [<Counter key="b" to={db.courses.length * 9} />, "structured lessons"],
              [<Counter key="c" to={94} suffix="%" />, "quiz pass rate"],
              [<Counter key="d" to={21} />, "counties reached"],
            ].map(([v, l], i) => (
              <Reveal key={l as string} delay={i * 90}>
                <div className="rounded-xl border border-pine-700/10 bg-white px-5 py-7 text-center shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
                  <p className="font-display text-3xl font-black text-pine-800 sm:text-4xl dark:text-sun-400">{v}</p>
                  <p className="mt-2 text-[12px] font-extrabold uppercase tracking-wider text-ink-2/70 dark:text-pine-200/55">{l}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className="mt-20">
          <div className="relative overflow-hidden rounded-2xl bg-pine-800 px-6 py-12 text-center sm:px-12">
            <div className="weave weave-thin absolute inset-x-0 top-0" aria-hidden />
            <h2 className="font-display text-3xl font-black text-paper sm:text-4xl">Come learn with us.</h2>
            <p className="mx-auto mt-3 max-w-xl text-[15px] text-pine-100/75">Create a free account, join a course, and see your first progress bar move tonight.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link to="/register"><Btn size="lg" variant="accent">Start Learning <IcArrowR size={17} /></Btn></Link>
              <Link to="/contact"><Btn size="lg" variant="outline" className="border-paper/30 text-paper hover:border-sun-400 hover:bg-paper/5">Talk to the team</Btn></Link>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

/* ── Contact ─────────────────────────────────────────────────────────────── */
export function ContactPage() {
  const { db } = useApp();
  const s = db.settings;
  const toast = useToast();
  const [f, setF] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.name.trim().length < 2) er.name = "Please enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) er.email = "Enter a valid email address.";
    if (f.subject.trim().length < 3) er.subject = "Give your message a subject.";
    if (f.message.trim().length < 12) er.message = "Tell us a little more (at least 12 characters).";
    setErrs(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    setTimeout(() => { addContact(f); setBusy(false); setSent(true); toast.push("Message sent — we reply within one school day."); }, 700);
  };

  return (
    <div className="pb-20">
      <PageHero kicker="Contact" title={<>Karibu — <em className="not-italic text-sun-400">talk to a human</em>.</>}
        body="Questions about enrolment, school partnerships, payments or the curriculum? Write to us — a real teacher answers every message." />
      <div className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <Reveal dir="rv-l">
            {sent ? (
              <div className="pop-in rounded-xl border border-pine-700/10 bg-white p-10 text-center shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-pine-700/10 text-pine-700 dark:bg-pine-200/10 dark:text-pine-300"><IcCheckC size={30} /></span>
                <h2 className="mt-5 font-display text-2xl font-bold">Asante! Message received.</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-2 dark:text-pine-200/70">We've logged your message and our team will reply to <strong>{f.email}</strong> within one school day. Urgent payment issue? WhatsApp us with your reference number.</p>
                <Btn className="mt-6" variant="outline" onClick={() => { setSent(false); setF({ name: "", email: "", phone: "", subject: "", message: "" }); }}>Send another message</Btn>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="rounded-xl border border-pine-700/10 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8 dark:border-pine-200/10 dark:bg-night-800">
                <h2 className="font-display text-xl font-bold">Send us a message</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" error={errs.name}><TextInput value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Wanjiru Kamau" autoComplete="name" /></Field>
                  <Field label="Email" error={errs.email}><TextInput type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="you@example.com" autoComplete="email" /></Field>
                  <Field label="Phone (optional)"><TextInput value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+254 7XX XXX XXX" autoComplete="tel" /></Field>
                  <Field label="Subject" error={errs.subject}><TextInput value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} placeholder="e.g. School partnership" /></Field>
                </div>
                <div className="mt-4">
                  <Field label="Message" error={errs.message}><TextArea rows={6} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} placeholder="How can we help?" /></Field>
                </div>
                <Btn size="lg" className="mt-6 w-full sm:w-auto" disabled={busy}>{busy ? "Sending…" : <>Send message <IcArrowR size={16} /></>}</Btn>
              </form>
            )}
          </Reveal>
          <Reveal dir="rv-r">
            <div className="board-bg noise relative overflow-hidden rounded-xl p-7">
              <h3 className="font-display text-lg font-bold text-paper">Reach us directly</h3>
              <ul className="mt-5 space-y-4 text-sm">
                <li className="flex items-start gap-3.5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-sun-500/15 text-sun-400"><IcMail size={18} /></span>
                  <span><span className="block text-[11px] font-extrabold uppercase tracking-wider text-pine-100/50">Email</span><a className="font-bold text-paper hover:text-sun-400" href={`mailto:${s.contactEmail}`}>{s.contactEmail}</a></span></li>
                <li className="flex items-start gap-3.5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-sun-500/15 text-sun-400"><IcPhone size={18} /></span>
                  <span><span className="block text-[11px] font-extrabold uppercase tracking-wider text-pine-100/50">Phone / WhatsApp</span><a className="font-bold text-paper hover:text-sun-400" href={`tel:${s.contactPhone.replace(/\s/g, "")}`}>{s.contactPhone}</a></span></li>
                <li className="flex items-start gap-3.5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-sun-500/15 text-sun-400"><IcGlobe size={18} /></span>
                  <span><span className="block text-[11px] font-extrabold uppercase tracking-wider text-pine-100/50">Office</span><span className="font-bold leading-relaxed text-paper">{s.address}</span></span></li>
              </ul>
              <div className="mt-6 rounded-lg border border-paper/10 bg-paper/5 p-4 text-[13px] leading-relaxed text-pine-100/75">
                <p className="font-display font-bold text-sun-400">School partnerships</p>
                <p className="mt-1">Running a school or tuition centre? We set up whole-cohort accounts with teacher dashboards and parent reporting — ask for a partnership quote.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

/* ── Legal pages ─────────────────────────────────────────────────────────── */
export function LegalPage() {
  const { slug } = useParams();
  const privacy = slug !== "terms";
  return (
    <div className="pb-20">
      <PageHero kicker="Legal" title={privacy ? "Privacy Policy" : "Terms of Service"} body={privacy ? "How School Smart Guide Tutors collects, guards and limits the use of learner data." : "The agreement between you and School Smart Guide Tutors when using the platform."} />
      <div className="mx-auto mt-10 max-w-3xl px-4 sm:px-6">
        <Reveal>
          <div className="space-y-6 rounded-xl border border-pine-700/10 bg-white p-7 shadow-[var(--shadow-card)] sm:p-9 dark:border-pine-200/10 dark:bg-night-800">
            {(privacy ? [
              ["Data we collect", "Account details (name, email, phone), grade and curriculum, learning activity (lessons completed, quiz attempts, submissions) and payment references. We collect the minimum needed to teach and report progress."],
              ["Learners are often minors", "Student records are visible only to the learner, their linked parent/guardian, their teachers and school administrators. Parents link children using a student code — never the reverse. No learner data is sold, shared for advertising, or used to profile children."],
              ["Payments", "We never store card numbers. M-Pesa transactions are recorded as references and statuses; card data is handled exclusively by PCI-DSS compliant payment providers."],
              ["Retention & rights", "You may request a copy of your data, correct it, or deactivate the account at any time from Profile settings or by writing to our office. Deactivated accounts are excluded from all dashboards immediately."],
              ["Audit trail", "Every sensitive operation — grading, result publication, account changes — is written to an audit log reviewed by administrators."],
            ] : [
              ["The service", "SSGT provides structured courses, assessments and progress tools for the Kenyan curriculum. Content is educational support, not a substitute for school attendance or official KNEC certification."],
              ["Accounts & conduct", "Accounts are personal. Learners must not share answers during timed assessments, and teachers must only manage content and students within their authorisation. Breaches may lead to deactivation."],
              ["Paid courses", "Paid courses are licensed per learner, are non-transferable, and refunds are considered within 7 days if less than 20% of the course has been consumed. Receipts are stored in your payment history."],
              ["Intellectual property", "Course materials, quizzes and resources remain the property of SSGT and its teachers. Downloads are licensed for personal study only."],
              ["Liability", "The platform is provided as-is. We work hard for accuracy and uptime but do not guarantee specific exam outcomes."],
            ]).map(([t, b]) => (
              <section key={t}>
                <h2 className="font-display text-lg font-bold text-pine-800 dark:text-pine-200">{t}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-2 dark:text-pine-200/70">{b}</p>
              </section>
            ))}
            <p className="border-t border-pine-700/10 pt-5 text-[12px] font-semibold text-ink-2/60 dark:border-pine-200/10 dark:text-pine-200/50">Last updated January 2026 · Questions? Write to {db_contact()}.</p>
          </div>
        </Reveal>
      </div>
    </div>
  );
  function db_contact() { return "hello@ssgt.ac.ke"; }
}


+++ src/pages/catalog.tsx (修改后)
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  addContact, courseProgress, downloadResource, enrollmentFor,
  gradeName, isBookmarked, levelName, lessonsOf, subjectName, toggleBookmark, useApp, userById,
} from "../lib/db";
import type { Course, Resource } from "../lib/types";
import { Avatar, Badge, Btn, Counter, Empty, Field, Pager, Progress, Reveal, SectionHead, Select, Stars, TextInput, TextArea, cx, ksh, useLoad, Skel, useToast } from "../components/ui";
import { PageHero } from "../components/layout";
import {
  IcArrowR, IcBookOpen, IcBookmark, IcCap, IcCheckC, IcClipboard, IcCode, IcDownload, IcDrum, IcFileText,
  IcFlame, IcGlobe, IcLeaf, IcLock, IcMail, IcMoney, IcPhone, IcSearch, IcShield, IcSpark, IcSun, IcTarget, IcUsers, IcVideo, IcX,
} from "../components/icons";

/* ── subject icon mapping (db-driven subjects pick an icon key) ──────────── */
export function SubjectIcon({ icon, size = 20 }: { icon: string; size?: number }) {
  const map: Record<string, React.ReactNode> = {
    target: <IcTarget size={size} />, book: <IcBookOpen size={size} />, drum: <IcDrum size={size} />,
    spark: <IcSpark size={size} />, globe: <IcGlobe size={size} />, money: <IcMoney size={size} />,
    leaf: <IcLeaf size={size} />, code: <IcCode size={size} />, sun: <IcSun size={size} />,
    flame: <IcFlame size={size} />, shield: <IcShield size={size} />,
  };
  return <>{map[icon] ?? <IcBookOpen size={size} />}</>;
}

/* ── Course card ─────────────────────────────────────────────────────────── */
export function CourseCard({ c, progress, delay = 0 }: { c: Course; progress?: number; delay?: number }) {
  const teacher = userById(c.teacherId);
  const lessonCount = lessonsOf(c.id).length;
  return (
    <Reveal delay={delay}>
      <Link to={`/courses/${c.id}`} className="lift group block overflow-hidden rounded-xl border border-pine-700/10 bg-white shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
        <div className="relative h-42 overflow-hidden bg-gradient-to-br from-pine-700 to-pine-950">
          <img src={c.image} alt="" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            className="h-full w-full object-cover transition-transform duration-[2.5s] ease-out group-hover:scale-110" />
          <div className="absolute left-3 top-3">
            {c.price === 0
              ? <Badge tone="sun" className="bg-sun-500 text-pine-950">Free</Badge>
              : <Badge tone="night" className="bg-pine-950/85 text-sun-400 backdrop-blur-sm">{ksh(c.price)}</Badge>}
          </div>
          <div className="absolute right-3 top-3"><Badge tone="gray" className="bg-pine-950/70 text-paper backdrop-blur-sm">{gradeName(c.gradeId)}</Badge></div>
        </div>
        <div className="p-4.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider" style={{ color: "#0C5A43" }}>
              <span className="dark:text-pine-300">{subjectName(c.subjectId)}</span>
            </span>
            <span className="flex items-center gap-1 text-[12px] font-bold text-ink-2 dark:text-pine-200/70"><Stars value={c.rating} size={11} /> {c.rating.toFixed(1)}</span>
          </div>
          <h3 className="mt-1.5 line-clamp-2 font-display text-[17px] font-bold leading-snug transition-colors group-hover:text-pine-700 dark:group-hover:text-sun-400">{c.title}</h3>
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink-2/85 dark:text-pine-200/60">{c.description}</p>
          {teacher && (
            <div className="mt-3 flex items-center gap-2">
              <Avatar name={teacher.name} color={teacher.color} size={26} />
              <span className="text-[12.5px] font-bold text-ink-2 dark:text-pine-200/70">{teacher.name}</span>
            </div>
          )}
          <div className="mt-3 flex items-center gap-4 border-t border-pine-700/8 pt-3 text-[12px] font-bold text-ink-2/75 dark:border-pine-200/8 dark:text-pine-200/55">
            <span className="flex items-center gap-1.5"><IcBookOpen size={14} /> {lessonCount} lessons</span>
            <span className="flex items-center gap-1.5"><IcUsers size={14} /> {c.enrolledCount.toLocaleString()}</span>
          </div>
          {typeof progress === "number" && (
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-[11px] font-extrabold uppercase tracking-wider text-ink-2/60 dark:text-pine-200/50">
                <span>Your progress</span><span className="text-pine-700 dark:text-sun-400">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </div>
      </Link>
    </Reveal>
  );
}

/* ── Courses catalogue ───────────────────────────────────────────────────── */
export function CoursesPage() {
  const { db, user } = useApp();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [subject, setSubject] = useState(params.get("subject") ?? "");
  const [level, setLevel] = useState(params.get("level") ?? "");
  const [grade, setGrade] = useState(params.get("grade") ?? "");
  const [curriculum, setCurriculum] = useState(params.get("curriculum") ?? "");
  const [pricing, setPricing] = useState(params.get("pricing") ?? "");
  const [teacher, setTeacher] = useState(params.get("teacher") ?? "");
  const [sort, setSort] = useState("popular");
  const [page, setPage] = useState(1);
  const loading = useLoad(350);

  useEffect(() => {
    const next = new URLSearchParams();
    if (q) next.set("q", q); if (subject) next.set("subject", subject); if (level) next.set("level", level);
    if (grade) next.set("grade", grade); if (curriculum) next.set("curriculum", curriculum);
    if (pricing) next.set("pricing", pricing); if (teacher) next.set("teacher", teacher);
    setParams(next, { replace: true });
    setPage(1);
  }, [q, subject, level, grade, curriculum, pricing, teacher]); // eslint-disable-line react-hooks/exhaustive-deps

  const teachers = db.users.filter((u) => u.role === "teacher" && u.active);
  const list = useMemo(() => {
    let out = db.courses.filter((c) => c.published);
    if (q.trim()) out = out.filter((c) => (c.title + " " + c.description + " " + subjectName(c.subjectId)).toLowerCase().includes(q.toLowerCase()));
    if (subject) out = out.filter((c) => c.subjectId === subject);
    if (grade) out = out.filter((c) => c.gradeId === grade);
    if (curriculum) out = out.filter((c) => c.curriculumId === curriculum);
    if (pricing) out = out.filter((c) => (pricing === "free" ? c.price === 0 : c.price > 0));
    if (teacher) out = out.filter((c) => c.teacherId === teacher);
    if (level) {
      const gradeIds = db.grades.filter((g) => g.levelId === level).map((g) => g.id);
      out = out.filter((c) => gradeIds.includes(c.gradeId));
    }
    out = [...out].sort((a, b) => sort === "popular" ? b.enrolledCount - a.enrolledCount : sort === "rating" ? b.rating - a.rating : sort === "newest" ? b.createdAt - a.createdAt : a.price - b.price);
    return out;
  }, [db, q, subject, level, grade, curriculum, pricing, teacher, sort]);

  const pages = Math.max(1, Math.ceil(list.length / 9));
  const shown = list.slice((page - 1) * 9, page * 9);
  const activeFilters = [subject, level, grade, curriculum, pricing, teacher].filter(Boolean).length;

  return (
    <div className="pb-20">
      <PageHero kicker="Course catalogue" title={<>Find the course that moves you <em className="not-italic text-sun-400">forward</em>.</>}
        body="Every course is mapped to a curriculum, level and grade — from CBC Grade 5 to KCSE revision. Filter until it fits.">
        <div className="flex max-w-xl items-center gap-2 rounded-xl border border-paper/15 bg-paper/8 p-1.5 backdrop-blur-sm">
          <IcSearch size={18} className="ml-2.5 shrink-0 text-sun-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search courses, e.g. algebra, Kiswahili, KCSE…" aria-label="Search courses"
            className="w-full bg-transparent text-[15px] font-semibold text-paper outline-none placeholder:text-pine-100/50" />
          {q && <button onClick={() => setQ("")} aria-label="Clear search" className="mr-1 cursor-pointer rounded-md p-1 text-pine-100/60 hover:text-paper"><IcX size={15} /></button>}
        </div>
      </PageHero>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* filters */}
        <Reveal className="-mt-7 relative z-10">
          <div className="rounded-xl border border-pine-700/10 bg-white p-4 shadow-[var(--shadow-lift)] dark:border-pine-200/10 dark:bg-night-800">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
              <Select value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Subject">
                <option value="">All subjects</option>
                {db.subjects.filter((s) => s.active).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
              <Select value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Level">
                <option value="">All levels</option>
                {db.levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </Select>
              <Select value={grade} onChange={(e) => setGrade(e.target.value)} aria-label="Grade or form">
                <option value="">All grades</option>
                {db.grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </Select>
              <Select value={curriculum} onChange={(e) => setCurriculum(e.target.value)} aria-label="Curriculum">
                <option value="">All curricula</option>
                {db.curricula.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
              <Select value={pricing} onChange={(e) => setPricing(e.target.value)} aria-label="Pricing">
                <option value="">Free & paid</option>
                <option value="free">Free only</option>
                <option value="paid">Paid only</option>
              </Select>
              <Select value={teacher} onChange={(e) => setTeacher(e.target.value)} aria-label="Teacher">
                <option value="">All teachers</option>
                {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </Select>
              <Select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
                <option value="popular">Most popular</option>
                <option value="rating">Highest rated</option>
                <option value="newest">Newest</option>
                <option value="price">Price: low → high</option>
              </Select>
            </div>
            {(activeFilters > 0 || q) && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button onClick={() => { setSubject(""); setLevel(""); setGrade(""); setCurriculum(""); setPricing(""); setTeacher(""); setQ(""); }}
                  className="cursor-pointer text-[12px] font-extrabold uppercase tracking-wider text-clay-600 hover:underline">Clear all filters</button>
                <span className="text-[12px] font-semibold text-ink-2/60 dark:text-pine-200/50">·</span>
                <span className="text-[12px] font-bold text-ink-2/80 dark:text-pine-200/60">{list.length} course{list.length === 1 ? "" : "s"} found</span>
              </div>
            )}
          </div>
        </Reveal>

        {loading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skel key={i} className="h-80" />)}
          </div>
        ) : shown.length === 0 ? (
          <div className="mt-10">
            <Empty icon={<IcSearch size={26} />} title="No courses match" body="Try a different subject or clear some filters — new courses are added every term."
              action={<Btn variant="outline" onClick={() => { setSubject(""); setLevel(""); setGrade(""); setCurriculum(""); setPricing(""); setTeacher(""); setQ(""); }}>Clear filters</Btn>} />
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((c, i) => {
                const en = user?.role === "student" ? enrollmentFor(user.id, c.id) : undefined;
                return <CourseCard key={c.id} c={c} delay={(i % 3) * 90} progress={en && en.status !== "pending" ? courseProgress(user!.id, c.id).percent : undefined} />;
              })}
            </div>
            <div className="mt-10"><Pager page={page} pages={pages} onPage={setPage} /></div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Subjects ────────────────────────────────────────────────────────────── */
export function SubjectsPage() {
  const { db } = useApp();
  const loading = useLoad(300);
  const subjects = db.subjects.filter((s) => s.active);
  return (
    <div className="pb-20">
      <PageHero kicker="Subjects" title={<>Every subject, <em className="not-italic text-sun-400">one ladder</em>.</>}
        body="Subjects are organised by curriculum and level, so you always know exactly where a course sits in your learning path." />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skel key={i} className="h-48" />)}</div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((s, i) => {
              const courses = db.courses.filter((c) => c.subjectId === s.id && c.published);
              const resources = db.resources.filter((r) => r.subjectId === s.id && r.active);
              return (
                <Reveal key={s.id} delay={(i % 3) * 80}>
                  <Link to={`/courses?subject=${s.id}`} className="lift group relative block overflow-hidden rounded-xl border border-pine-700/10 bg-white p-5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
                    <span className="absolute inset-y-0 left-0 w-1.5 transition-all duration-300 group-hover:w-2.5" style={{ background: s.color }} aria-hidden />
                    <div className="flex items-start justify-between">
                      <span className="grid h-12 w-12 place-items-center rounded-xl text-paper transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" style={{ background: s.color }}>
                        <SubjectIcon icon={s.icon} size={22} />
                      </span>
                      <Badge tone="gray">{courses.length} course{courses.length === 1 ? "" : "s"}</Badge>
                    </div>
                    <h3 className="mt-4 font-display text-lg font-bold transition-colors group-hover:text-pine-700 dark:group-hover:text-sun-400">{s.name}</h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2/85 dark:text-pine-200/60">{s.description}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {s.levelIds.map((l) => <Badge key={l} tone="pine" className="normal-case tracking-normal">{levelName(l).split(" (")[0]}</Badge>)}
                    </div>
                    <p className="mt-4 flex items-center gap-1.5 text-[13px] font-extrabold text-sun-700 dark:text-sun-400">
                      Browse courses <IcArrowR size={15} className="transition-transform group-hover:translate-x-1" />
                    </p>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Resources library ───────────────────────────────────────────────────── */
export function ResourcesPage({ embedded = false }: { embedded?: boolean }) {
  const { db, user } = useApp();
  const toast = useToast();
  const [params] = useSearchParams();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState(params.get("kind") ?? "");
  const [subject, setSubject] = useState(params.get("subject") ?? "");
  const [grade, setGrade] = useState(params.get("grade") ?? "");
  const [page, setPage] = useState(1);
  const loading = useLoad(300);

  const kinds = ["notes", "past-paper", "marking-scheme", "worksheet", "study-guide", "practice", "video"];
  const list = useMemo(() => {
    let out = db.resources.filter((r) => r.active);
    if (q.trim()) out = out.filter((r) => (r.title + " " + r.description).toLowerCase().includes(q.toLowerCase()));
    if (kind) out = out.filter((r) => r.kind === kind);
    if (subject) out = out.filter((r) => r.subjectId === subject);
    if (grade) out = out.filter((r) => r.gradeId === grade);
    return out;
  }, [db, q, kind, subject, grade]);
  const pages = Math.max(1, Math.ceil(list.length / 8));
  const shown = list.slice((page - 1) * 8, page * 8);

  const doDownload = (r: Resource) => {
    if (!r.downloadEnabled) { toast.push("Downloads are restricted for this resource by the administrator.", "err"); return; }
    downloadResource(r.id);
    const blob = new Blob([`${r.title}\n${"=".repeat(40)}\n\n${r.description}\n\nSubject: ${subjectName(r.subjectId)} · ${gradeName(r.gradeId)}\nKind: ${r.kind}\n\nThis is a demo download from School Smart Guide Tutors. In production this file is served from secure object storage with authorization checks.`], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${r.title.replace(/[^\w\d]+/g, "-").toLowerCase()}.txt`;
    a.click(); URL.revokeObjectURL(a.href);
    toast.push(`Downloading “${r.title}”`);
  };

  const grid = loading ? (
    <div className="grid gap-5 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skel key={i} className="h-44" />)}</div>
  ) : shown.length === 0 ? (
    <Empty icon={<IcFileText size={26} />} title="No resources found" body="Adjust your filters or check back soon — teachers add new materials weekly." />
  ) : (
    <div className="grid gap-5 sm:grid-cols-2">
      {shown.map((r, i) => {
        const bm = user ? isBookmarked(user.id, "resource", r.id) : false;
        return (
          <Reveal key={r.id} delay={(i % 2) * 80}>
            <div className="lift group flex h-full flex-col rounded-xl border border-pine-700/10 bg-white p-5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
              <div className="flex items-start gap-3.5">
                <span className={cx("grid h-11 w-11 shrink-0 place-items-center rounded-lg", r.downloadEnabled ? "bg-pine-700/10 text-pine-700 dark:bg-pine-200/10 dark:text-pine-300" : "bg-clay-500/10 text-clay-600")}>
                  {r.kind === "video" ? <IcVideo size={20} /> : r.kind === "past-paper" || r.kind === "marking-scheme" ? <IcClipboard size={20} /> : <IcFileText size={20} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge tone="sun" className="capitalize">{r.kind.replace("-", " ")}</Badge>
                    {!r.downloadEnabled && <Badge tone="clay"><IcLock size={10} /> restricted</Badge>}
                  </div>
                  <h3 className="mt-1.5 font-display text-[15.5px] font-bold leading-snug">{r.title}</h3>
                </div>
                {user && (
                  <button onClick={() => { toggleBookmark(user.id, "resource", r.id); toast.push(bm ? "Removed from bookmarks" : "Saved to bookmarks", "info"); }}
                    aria-label={bm ? "Remove bookmark" : "Bookmark resource"} aria-pressed={bm}
                    className={cx("cursor-pointer rounded-md p-1.5 transition-all hover:scale-110", bm ? "text-sun-600 dark:text-sun-400" : "text-ink-2/40 hover:text-sun-600 dark:text-pine-200/40")}>
                    <IcBookmark size={17} filled={bm} />
                  </button>
                )}
              </div>
              <p className="mt-3 flex-1 text-[13px] leading-relaxed text-ink-2/85 dark:text-pine-200/60">{r.description}</p>
              <div className="mt-4 flex items-center justify-between border-t border-pine-700/8 pt-3.5 dark:border-pine-200/8">
                <span className="text-[11.5px] font-bold text-ink-2/70 dark:text-pine-200/50">
                  {subjectName(r.subjectId)} · {gradeName(r.gradeId)} · {(r.sizeKB / 1024).toFixed(1)} MB{r.pages ? ` · ${r.pages} pp` : ""}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-[11.5px] font-bold text-ink-2/60 dark:text-pine-200/50">{r.downloads.toLocaleString()} downloads</span>
                  <Btn size="sm" variant={r.downloadEnabled ? "primary" : "outline"} onClick={() => doDownload(r)} title={r.downloadEnabled ? undefined : "Downloads disabled by admin"}>
                    <IcDownload size={14} /> {r.downloadEnabled ? "Download" : "Locked"}
                  </Btn>
                </div>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );

  const inner = (
    <div className={cx(!embedded && "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8")}>
      <Reveal>
        <div className="mb-6 grid gap-3 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <IcSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-2/50 dark:text-pine-200/50" />
            <TextInput value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search notes, past papers, worksheets…" className="pl-10" aria-label="Search resources" />
          </div>
          <Select value={kind} onChange={(e) => { setKind(e.target.value); setPage(1); }} aria-label="Resource type">
            <option value="">All types</option>
            {kinds.map((k) => <option key={k} value={k}>{k.replace("-", " ")}</option>)}
          </Select>
          <Select value={subject} onChange={(e) => { setSubject(e.target.value); setPage(1); }} aria-label="Subject">
            <option value="">All subjects</option>
            {db.subjects.filter((s) => s.active).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </div>
      </Reveal>
      {grid}
      <div className="mt-8"><Pager page={page} pages={pages} onPage={setPage} /></div>
    </div>
  );

  if (embedded) return inner;
  return (
    <div className="pb-20">
      <PageHero kicker="Resource library" title={<>Revision gold, <em className="not-italic text-sun-400">ready to download</em>.</>}
        body="Notes, past papers, marking schemes and worksheets — curated by Kenyan teachers and organised by subject and grade." />
      <div className="mt-10">{inner}</div>
    </div>
  );
}

/* ── About ───────────────────────────────────────────────────────────────── */
export function AboutPage() {
  const { db } = useApp();
  const teachers = db.users.filter((u) => u.role === "teacher" && u.active);
  return (
    <div className="pb-20">
      <PageHero kicker="About SSGT" title={<>A study companion built for the <em className="not-italic text-sun-400">Kenyan classroom</em>.</>}
        body="School Smart Guide Tutors exists because talent is everywhere, but structured revision is not. We put a patient, rigorous tutor in every learner's pocket." />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-14 grid items-start gap-10 lg:grid-cols-[1.1fr_1fr]">
          <Reveal dir="rv-l">
            <SectionHead kicker="Our story" title="From tuition centres to every phone" />
            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-ink-2 dark:text-pine-200/75">
              <p>SSGT began in 2023 as a weekend tuition circle in Nairobi, where four teachers marked exercise books by torchlight and wished every question could give instant, kind feedback.</p>
              <p>Today the platform carries the full Kenyan curriculum — CBC from Grade 1 through Junior and Senior Secondary, plus 8-4-4 revision and KCSE practice. Courses are written lesson by lesson, assessed quiz by quiz, and tracked so that a parent in Lodwar sees the same progress chart as a teacher in Mombasa.</p>
              <p>We stay deliberately light: pages load on 3G, dashboards work on entry-level Android phones, and payments ride M-Pesa — because that is how Kenya actually learns.</p>
            </div>
            <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[["Curriculum-mapped", "Every lesson sits in a CBC or 8-4-4 path"], ["Assessment-first", "Quizzes, assignments and marked results"], ["Parent visibility", "Linked accounts, honest progress"], ["Teacher-powered", "Built and marked by TSC teachers"], ["Mobile-first", "Fast on modest phones and bundles"], ["Privacy-minded", "Learner data is guarded, audited, minimal"]].map(([t, b]) => (
                <div key={t} className="rounded-xl border border-pine-700/10 bg-white p-4 dark:border-pine-200/10 dark:bg-night-800">
                  <p className="font-display text-[14.5px] font-bold text-pine-800 dark:text-pine-200">{t}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink-2/75 dark:text-pine-200/55">{b}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal dir="rv-r" className="lg:sticky lg:top-24">
            <div className="board-bg noise relative overflow-hidden rounded-2xl p-7">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-sun-400">The tutors</p>
              <div className="mt-4 space-y-3">
                {teachers.map((t) => (
                  <div key={t.id} className="flex items-center gap-3.5 rounded-xl bg-paper/6 p-3 backdrop-blur-sm transition-colors hover:bg-paper/10">
                    <Avatar name={t.name} color={t.color} size={44} />
                    <div className="min-w-0">
                      <p className="font-display text-[15px] font-bold text-paper">{t.name}</p>
                      <p className="truncate text-[12px] text-pine-100/70">{t.subjectIds?.map(subjectName).join(" · ")}</p>
                    </div>
                    <IcCap size={18} className="ml-auto shrink-0 text-sun-400" />
                  </div>
                ))}
              </div>
              <p className="mt-5 border-t border-paper/10 pt-4 text-[12px] leading-relaxed text-pine-100/60">Every teacher is vetted, registered and subject-specialised. Their courses, grading and announcements are fully audited on the platform.</p>
            </div>
          </Reveal>
        </div>

        <div className="mt-20">
          <SectionHead kicker="By the numbers" title="Small platform, serious outcomes" center />
          <div className="mt-9 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {[
              [<Counter key="a" to={2400} suffix="+" />, "active learners"],
              [<Counter key="b" to={db.courses.length * 9} />, "structured lessons"],
              [<Counter key="c" to={94} suffix="%" />, "quiz pass rate"],
              [<Counter key="d" to={21} />, "counties reached"],
            ].map(([v, l], i) => (
              <Reveal key={l as string} delay={i * 90}>
                <div className="rounded-xl border border-pine-700/10 bg-white px-5 py-7 text-center shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
                  <p className="font-display text-3xl font-black text-pine-800 sm:text-4xl dark:text-sun-400">{v}</p>
                  <p className="mt-2 text-[12px] font-extrabold uppercase tracking-wider text-ink-2/70 dark:text-pine-200/55">{l}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className="mt-16">
          <div className="board-bg noise relative overflow-hidden rounded-2xl px-6 py-8 sm:px-10">
            <div className="weave weave-thin absolute inset-x-0 top-0" aria-hidden />
            <div className="relative flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-sun-400">Official academy contact</p>
                <h3 className="mt-1.5 font-display text-2xl font-black text-paper sm:text-3xl">{db.settings.academyName}</h3>
                {db.settings.address && <p className="mt-1 text-[13px] text-pine-100/70">{db.settings.address}</p>}
              </div>
              <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
                <a href={`tel:${db.settings.contactPhone.replace(/\s/g, "")}`}
                  className="flex items-center gap-2.5 rounded-lg bg-sun-500 px-5 py-3 font-display text-[15px] font-black text-pine-950 shadow-md transition-all hover:-translate-y-0.5 hover:bg-sun-400">
                  <IcPhone size={17} /> {db.settings.contactPhone}
                </a>
                <a href={`mailto:${db.settings.contactEmail}`}
                  className="flex items-center gap-2.5 rounded-lg border-[1.5px] border-paper/25 px-5 py-3 text-[13.5px] font-bold text-paper transition-all hover:-translate-y-0.5 hover:border-sun-400 hover:text-sun-400">
                  <IcMail size={16} /> {db.settings.contactEmail}
                </a>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-16">
          <div className="relative overflow-hidden rounded-2xl bg-pine-800 px-6 py-12 text-center sm:px-12">
            <div className="weave weave-thin absolute inset-x-0 top-0" aria-hidden />
            <h2 className="font-display text-3xl font-black text-paper sm:text-4xl">Come learn with us.</h2>
            <p className="mx-auto mt-3 max-w-xl text-[15px] text-pine-100/75">Create a free account, join a course, and see your first progress bar move tonight.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link to="/register"><Btn size="lg" variant="accent">Start Learning <IcArrowR size={17} /></Btn></Link>
              <Link to="/contact"><Btn size="lg" variant="outline" className="border-paper/30 text-paper hover:border-sun-400 hover:bg-paper/5">Talk to the team</Btn></Link>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

/* ── Contact ─────────────────────────────────────────────────────────────── */
export function ContactPage() {
  const { db } = useApp();
  const s = db.settings;
  const toast = useToast();
  const [f, setF] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.name.trim().length < 2) er.name = "Please enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) er.email = "Enter a valid email address.";
    if (f.subject.trim().length < 3) er.subject = "Give your message a subject.";
    if (f.message.trim().length < 12) er.message = "Tell us a little more (at least 12 characters).";
    setErrs(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    setTimeout(() => { addContact(f); setBusy(false); setSent(true); toast.push("Message sent — we reply within one school day."); }, 700);
  };

  return (
    <div className="pb-20">
      <PageHero kicker="Contact" title={<>Karibu — <em className="not-italic text-sun-400">talk to a human</em>.</>}
        body="Questions about enrolment, school partnerships, payments or the curriculum? Write to us — a real teacher answers every message." />
      <div className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <Reveal dir="rv-l">
            {sent ? (
              <div className="pop-in rounded-xl border border-pine-700/10 bg-white p-10 text-center shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-pine-700/10 text-pine-700 dark:bg-pine-200/10 dark:text-pine-300"><IcCheckC size={30} /></span>
                <h2 className="mt-5 font-display text-2xl font-bold">Asante! Message received.</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-2 dark:text-pine-200/70">We've logged your message and our team will reply to <strong>{f.email}</strong> within one school day. Urgent payment issue? WhatsApp us with your reference number.</p>
                <Btn className="mt-6" variant="outline" onClick={() => { setSent(false); setF({ name: "", email: "", phone: "", subject: "", message: "" }); }}>Send another message</Btn>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="rounded-xl border border-pine-700/10 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8 dark:border-pine-200/10 dark:bg-night-800">
                <h2 className="font-display text-xl font-bold">Send us a message</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" error={errs.name}><TextInput value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Wanjiru Kamau" autoComplete="name" /></Field>
                  <Field label="Email" error={errs.email}><TextInput type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="you@example.com" autoComplete="email" /></Field>
                  <Field label="Phone (optional)"><TextInput value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+254 7XX XXX XXX" autoComplete="tel" /></Field>
                  <Field label="Subject" error={errs.subject}><TextInput value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} placeholder="e.g. School partnership" /></Field>
                </div>
                <div className="mt-4">
                  <Field label="Message" error={errs.message}><TextArea rows={6} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} placeholder="How can we help?" /></Field>
                </div>
                <Btn size="lg" className="mt-6 w-full sm:w-auto" disabled={busy}>{busy ? "Sending…" : <>Send message <IcArrowR size={16} /></>}</Btn>
              </form>
            )}
          </Reveal>
          <Reveal dir="rv-r">
            <div className="board-bg noise relative overflow-hidden rounded-xl p-7">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-sun-400">Official academy contact</p>
              <h3 className="mt-1.5 font-display text-xl font-bold text-paper">{s.academyName}</h3>
              <p className="mt-1 text-[12.5px] text-pine-100/60">Reach us directly — a real teacher answers every call and message.</p>
              <ul className="mt-5 space-y-4 text-sm">
                <li className="flex items-start gap-3.5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-sun-500/15 text-sun-400"><IcPhone size={18} /></span>
                  <span><span className="block text-[11px] font-extrabold uppercase tracking-wider text-pine-100/50">Phone</span><a className="font-display text-[17px] font-black text-paper hover:text-sun-400" href={`tel:${s.contactPhone.replace(/\s/g, "")}`}>{s.contactPhone}</a></span></li>
                <li className="flex items-start gap-3.5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-sun-500/15 text-sun-400"><IcMail size={18} /></span>
                  <span><span className="block text-[11px] font-extrabold uppercase tracking-wider text-pine-100/50">Email</span><a className="font-bold break-all text-paper hover:text-sun-400" href={`mailto:${s.contactEmail}`}>{s.contactEmail}</a></span></li>
                {s.address && (
                  <li className="flex items-start gap-3.5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-sun-500/15 text-sun-400"><IcGlobe size={18} /></span>
                    <span><span className="block text-[11px] font-extrabold uppercase tracking-wider text-pine-100/50">Office</span><span className="font-bold leading-relaxed text-paper">{s.address}</span></span></li>
                )}
              </ul>
              <div className="mt-6 rounded-lg border border-paper/10 bg-paper/5 p-4 text-[13px] leading-relaxed text-pine-100/75">
                <p className="font-display font-bold text-sun-400">School partnerships</p>
                <p className="mt-1">Running a school or tuition centre? We set up whole-cohort accounts with teacher dashboards and parent reporting — ask for a partnership quote.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

/* ── Legal pages ─────────────────────────────────────────────────────────── */
export function LegalPage() {
  const { slug } = useParams();
  const { db } = useApp();
  const privacy = slug !== "terms";
  return (
    <div className="pb-20">
      <PageHero kicker="Legal" title={privacy ? "Privacy Policy" : "Terms of Service"} body={privacy ? "How School Smart Guide Tutors collects, guards and limits the use of learner data." : "The agreement between you and School Smart Guide Tutors when using the platform."} />
      <div className="mx-auto mt-10 max-w-3xl px-4 sm:px-6">
        <Reveal>
          <div className="space-y-6 rounded-xl border border-pine-700/10 bg-white p-7 shadow-[var(--shadow-card)] sm:p-9 dark:border-pine-200/10 dark:bg-night-800">
            {(privacy ? [
              ["Data we collect", "Account details (name, email, phone), grade and curriculum, learning activity (lessons completed, quiz attempts, submissions) and payment references. We collect the minimum needed to teach and report progress."],
              ["Learners are often minors", "Student records are visible only to the learner, their linked parent/guardian, their teachers and school administrators. Parents link children using a student code — never the reverse. No learner data is sold, shared for advertising, or used to profile children."],
              ["Payments", "We never store card numbers. M-Pesa transactions are recorded as references and statuses; card data is handled exclusively by PCI-DSS compliant payment providers."],
              ["Retention & rights", "You may request a copy of your data, correct it, or deactivate the account at any time from Profile settings or by writing to our office. Deactivated accounts are excluded from all dashboards immediately."],
              ["Audit trail", "Every sensitive operation — grading, result publication, account changes — is written to an audit log reviewed by administrators."],
            ] : [
              ["The service", "SSGT provides structured courses, assessments and progress tools for the Kenyan curriculum. Content is educational support, not a substitute for school attendance or official KNEC certification."],
              ["Accounts & conduct", "Accounts are personal. Learners must not share answers during timed assessments, and teachers must only manage content and students within their authorisation. Breaches may lead to deactivation."],
              ["Paid courses", "Paid courses are licensed per learner, are non-transferable, and refunds are considered within 7 days if less than 20% of the course has been consumed. Receipts are stored in your payment history."],
              ["Intellectual property", "Course materials, quizzes and resources remain the property of SSGT and its teachers. Downloads are licensed for personal study only."],
              ["Liability", "The platform is provided as-is. We work hard for accuracy and uptime but do not guarantee specific exam outcomes."],
            ]).map(([t, b]) => (
              <section key={t}>
                <h2 className="font-display text-lg font-bold text-pine-800 dark:text-pine-200">{t}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-2 dark:text-pine-200/70">{b}</p>
              </section>
            ))}
            <p className="border-t border-pine-700/10 pt-5 text-[12px] font-semibold text-ink-2/60 dark:border-pine-200/10 dark:text-pine-200/50">
              Last updated January 2026 · Questions? Call {db.settings.contactPhone} or write to{" "}
              <a className="font-bold text-pine-700 hover:underline dark:text-sun-400" href={`mailto:${db.settings.contactEmail}`}>{db.settings.contactEmail}</a>.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
