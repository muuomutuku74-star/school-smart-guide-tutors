--- src/pages/student.tsx (原始)
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  assignmentById, changePassword, courseById, courseProgress, enrollmentFor, gradeName, isBookmarked,
  lessonById, lessonsOf, markAllRead, markRead, resolveAudience, subjectName, submitAssignment, toggleBookmark,
  updateProfile, useApp, userById,
} from "../lib/db";
import type { Assignment, Submission } from "../lib/types";
import { Avatar, Badge, Btn, Confirm, Empty, Field, Modal, Progress, Reveal, Skel, Stat, Tabs, TextArea, TextInput, cx, daysUntil, fmtDate, timeAgo, useLoad, useToast } from "../components/ui";
import { Bars, Donut, HBars, Line } from "../components/charts";
import {
  IcArrowR, IcAward, IcBookOpen, IcBookmark, IcCalendar, IcCheck, IcCheckC, IcClipboard, IcClock, IcDownload,
  IcFileText, IcFlame, IcLock, IcMail, IcMoney, IcSearch, IcSpark, IcTarget, IcTrend, IcUpload, IcVideo, IcX,
} from "../components/icons";

/* ── helpers ─────────────────────────────────────────────────────────────── */
function myEnrollments(userId: string, db: ReturnType<typeof useApp>["db"]) {
  return db.enrollments.filter((e) => e.studentId === userId && e.status !== "cancelled");
}
function streakOf(userId: string, db: ReturnType<typeof useApp>["db"]) {
  const day = (t: number) => new Date(t).toDateString();
  const days = new Set([
    ...db.lessonProgress.filter((p) => p.studentId === userId).map((p) => day(p.completedAt)),
    ...db.attempts.filter((a) => a.studentId === userId).map((a) => day(a.submittedAt)),
  ]);
  let s = 0; const d = new Date();
  if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1); // grace: streak counts from yesterday
  while (days.has(d.toDateString())) { s++; d.setDate(d.getDate() - 1); }
  return s;
}

/* ── Dashboard ───────────────────────────────────────────────────────────── */
export function StudentDashboard() {
  const { db, user } = useApp();
  const nav = useNavigate();
  const loading = useLoad(400);
  if (!user) return null;
  const ens = myEnrollments(user.id, db).filter((e) => e.status === "active");
  const allLessons = ens.flatMap((e) => lessonsOf(e.courseId));
  const doneLessons = allLessons.filter((l) => db.lessonProgress.some((p) => p.studentId === user.id && p.lessonId === l.id));
  const overall = allLessons.length ? Math.round((doneLessons.length / allLessons.length) * 100) : 0;
  const attempts = db.attempts.filter((a) => a.studentId === user.id);
  const quizAvg = attempts.length ? Math.round(attempts.reduce((n, a) => n + a.percent, 0) / attempts.length) : 0;
  const graded = db.submissions.filter((s) => s.studentId === user.id && s.status === "graded");
  const asgAvg = graded.length ? Math.round(graded.reduce((n, s) => n + ((s.marks ?? 0) / (assignmentById(s.assignmentId)?.maxMarks ?? 1)) * 100, 0) / graded.length) : 0;
  const streak = streakOf(user.id, db);

  const upcoming = db.assignments
    .filter((a) => ens.some((e) => e.courseId === a.courseId) && a.dueAt > Date.now())
    .filter((a) => !db.submissions.some((s) => s.assignmentId === a.id && s.studentId === user.id))
    .sort((a, b) => a.dueAt - b.dueAt).slice(0, 3);
  const quizList = db.quizzes.filter((q) => q.active && ens.some((e) => e.courseId === q.courseId)).slice(0, 2);
  const results = db.results.filter((r) => r.studentId === user.id).sort((a, b) => b.date - a.date).slice(0, 4);
  const earnedDefs = db.achievementDefs.filter((d) => db.earned.some((e) => e.studentId === user.id && e.defId === d.id));
  const announcements = db.announcements.filter((a) => ["all-students", "everyone", "grade"].includes(a.audience) && (!a.expiresAt || a.expiresAt > Date.now())).slice(0, 2);

  const firstName = user.name.split(" ")[0];
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Habari ya asubuhi" : hour < 17 ? "Habari ya mchana" : "Habari ya jioni";

  if (loading) return <div className="grid gap-5 lg:grid-cols-3"><Skel className="h-44 lg:col-span-2" /><Skel className="h-44" /><Skel className="h-64 lg:col-span-2" /><Skel className="h-64" /></div>;

  return (
    <div className="space-y-6">
      {/* welcome banner */}
      <Reveal>
        <div className="board-bg noise relative overflow-hidden rounded-2xl p-6 sm:p-8">
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-sun-400">{greet} · {new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long" })}</p>
              <h2 className="mt-2 font-display text-3xl font-black text-paper sm:text-4xl">Welcome back, {firstName} 👋🏾</h2>
              <p className="mt-2 max-w-lg text-[14px] text-pine-100/75">You're <strong className="text-sun-400">{overall}%</strong> through your enrolled lessons{upcoming.length > 0 && <> with <strong className="text-sun-400">{upcoming.length} assignment{upcoming.length > 1 ? "s" : ""}</strong> due this week</>}. Small steps, every day.</p>
              <Btn variant="accent" className="mt-5" onClick={() => nav("/app/my-courses")}>Continue learning <IcArrowR size={15} /></Btn>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <Donut value={overall} size={110} stroke={11} sub="overall" />
              </div>
              <div className="hidden rounded-xl border border-paper/12 bg-paper/6 px-5 py-4 backdrop-blur-sm sm:block">
                <p className="flex items-center gap-2 font-display text-2xl font-black text-sun-400"><IcFlame size={22} /> {streak} day{streak === 1 ? "" : "s"}</p>
                <p className="mt-1 text-[11px] font-extrabold uppercase tracking-wider text-pine-100/60">study streak</p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={<IcBookOpen size={19} />} label="Lessons done" value={doneLessons.length} sub={`of ${allLessons.length} enrolled`} />
        <Stat icon={<IcTarget size={19} />} label="Quiz average" value={attempts.length ? `${quizAvg}%` : "—"} sub={`${attempts.length} attempt${attempts.length === 1 ? "" : "s"}`} tone="sun" />
        <Stat icon={<IcClipboard size={19} />} label="Assignment avg" value={graded.length ? `${asgAvg}%` : "—"} sub={`${graded.length} graded`} tone="night" />
        <Stat icon={<IcTrend size={19} />} label="Courses active" value={ens.length} sub={`${db.earned.filter((e) => e.studentId === user.id).length} badges earned`} tone="clay" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* continue learning */}
        <Reveal>
          <section className="rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Continue learning</h3>
              <Link to="/app/my-courses" className="link-sweep text-[13px] font-extrabold text-sun-700 dark:text-sun-400">All courses</Link>
            </div>
            <div className="mt-4 space-y-3.5">
              {ens.length === 0 && <Empty icon={<IcBookOpen size={24} />} title="No courses yet" body="Browse the catalogue and enrol in your first course." action={<Link to="/courses"><Btn size="sm">Browse courses</Btn></Link>} />}
              {ens.slice(0, 3).map((e) => {
                const c = courseById(e.courseId)!;
                const p = courseProgress(user.id, c.id);
                const nextLesson = lessonsOf(c.id).find((l) => !db.lessonProgress.some((x) => x.studentId === user.id && x.lessonId === l.id));
                return (
                  <Link key={e.id} to={`/app/learn/${c.id}`} className="group flex items-center gap-4 rounded-xl border border-pine-700/8 p-3 transition-all hover:-translate-y-0.5 hover:border-sun-500/50 hover:shadow-md dark:border-pine-200/8">
                    <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-pine-700 to-pine-950">
                      <img src={c.image} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" onError={(ev) => { (ev.currentTarget as HTMLImageElement).style.display = "none"; }} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-[15px] font-bold group-hover:text-pine-700 dark:group-hover:text-sun-400">{c.title}</span>
                      <span className="mt-0.5 block text-[12px] font-semibold text-ink-2/70 dark:text-pine-200/55">{nextLesson ? `Next: ${nextLesson.title}` : "Course complete 🎓"}</span>
                      <span className="mt-2 flex items-center gap-2.5"><Progress value={p.percent} className="flex-1" /><span className="text-[12px] font-black text-pine-700 dark:text-sun-400">{p.percent}%</span></span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        </Reveal>

        {/* upcoming */}
        <div className="space-y-6">
          <Reveal delay={100}>
            <section className="rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold"><IcCalendar size={18} className="text-sun-600 dark:text-sun-400" /> Upcoming</h3>
              <div className="mt-3.5 space-y-2.5">
                {upcoming.map((a) => (
                  <Link to="/app/assignments" key={a.id} className="flex items-center gap-3 rounded-lg border border-pine-700/8 px-3.5 py-2.5 transition-colors hover:border-sun-500/50 dark:border-pine-200/8">
                    <span className={cx("grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[12px] font-black", daysUntil(a.dueAt) <= 2 ? "bg-clay-500/12 text-clay-600" : "bg-pine-700/8 text-pine-700 dark:bg-pine-200/10 dark:text-pine-300")}>{daysUntil(a.dueAt)}d</span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13.5px] font-bold">{a.title}</span>
                      <span className="text-[11.5px] font-bold uppercase tracking-wider text-ink-2/55 dark:text-pine-200/45">{subjectName(courseById(a.courseId)?.subjectId ?? "")} · due {fmtDate(a.dueAt)}</span>
                    </span>
                  </Link>
                ))}
                {quizList.map((q) => (
                  <Link to={`/app/quiz/${q.id}`} key={q.id} className="flex items-center gap-3 rounded-lg border border-pine-700/8 px-3.5 py-2.5 transition-colors hover:border-sun-500/50 dark:border-pine-200/8">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sun-500/15 text-sun-700 dark:text-sun-400"><IcTarget size={16} /></span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13.5px] font-bold">{q.title}</span>
                      <span className="text-[11.5px] font-bold uppercase tracking-wider text-ink-2/55 dark:text-pine-200/45">{q.questions.length} questions · {q.timeLimitMin} min</span>
                    </span>
                  </Link>
                ))}
                {upcoming.length === 0 && quizList.length === 0 && <p className="px-1 py-2 text-[13px] font-semibold text-ink-2/60 dark:text-pine-200/50">Nothing due — enjoy the calm (or get ahead!).</p>}
              </div>
            </section>
          </Reveal>
          <Reveal delay={160}>
            <section className="rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
              <h3 className="font-display text-lg font-bold">Announcements</h3>
              <div className="mt-3 space-y-2.5">
                {announcements.map((a) => (
                  <div key={a.id} className="rounded-lg bg-pine-700/5 px-3.5 py-3 dark:bg-pine-200/6">
                    <p className="text-[13.5px] font-bold">{a.title}</p>
                    <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-ink-2/75 dark:text-pine-200/55">{a.content}</p>
                    <p className="mt-1.5 text-[10.5px] font-extrabold uppercase tracking-wider text-ink-2/50 dark:text-pine-200/40">{timeAgo(a.publishedAt)} · {userById(a.authorId)?.name}</p>
                  </div>
                ))}
                {announcements.length === 0 && <p className="text-[13px] font-semibold text-ink-2/60 dark:text-pine-200/50">No announcements right now.</p>}
              </div>
            </section>
          </Reveal>
        </div>
      </div>

      {/* recent results + achievements */}
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Reveal>
          <section className="rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Recent results</h3>
              <Link to="/app/results" className="link-sweep text-[13px] font-extrabold text-sun-700 dark:text-sun-400">All results</Link>
            </div>
            {results.length === 0 ? (
              <p className="mt-4 text-[13px] font-semibold text-ink-2/60 dark:text-pine-200/50">No results released yet — complete a quiz or assignment to see marks here.</p>
            ) : (
              <div className="mt-3.5 overflow-x-auto">
                <table className="w-full min-w-105 text-left text-[13px]">
                  <thead><tr className="border-b border-pine-700/10 text-[11px] font-extrabold uppercase tracking-wider text-ink-2/55 dark:border-pine-200/10 dark:text-pine-200/45">
                    <th className="py-2 pr-3">Assessment</th><th className="py-2 pr-3">Subject</th><th className="py-2 pr-3">Score</th><th className="py-2">Grade</th></tr></thead>
                  <tbody>
                    {results.map((r) => (
                      <tr key={r.id} className="border-b border-pine-700/6 last:border-0 dark:border-pine-200/6">
                        <td className="py-2.5 pr-3 font-bold">{r.assessment}</td>
                        <td className="py-2.5 pr-3 text-ink-2 dark:text-pine-200/70">{subjectName(r.subjectId)}</td>
                        <td className="py-2.5 pr-3 font-bold">{r.score}/{r.maxScore} <span className="text-ink-2/50 dark:text-pine-200/40">({Math.round((r.score / r.maxScore) * 100)}%)</span></td>
                        <td className="py-2.5"><Badge tone={r.score / r.maxScore >= 0.7 ? "pine" : r.score / r.maxScore >= 0.5 ? "sun" : "clay"}>{gradeLetter(r.score / r.maxScore * 100)}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </Reveal>
        <Reveal delay={120}>
          <section className="rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold"><IcAward size={18} className="text-sun-600 dark:text-sun-400" /> Achievements</h3>
              <Link to="/app/progress" className="link-sweep text-[13px] font-extrabold text-sun-700 dark:text-sun-400">View all</Link>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {db.achievementDefs.map((d) => {
                const got = db.earned.some((e) => e.studentId === user.id && e.defId === d.id);
                return (
                  <div key={d.id} title={`${d.name} — ${d.description}`} className={cx("flex flex-col items-center rounded-lg border px-2 py-3 text-center transition-all",
                    got ? "border-sun-500/50 bg-sun-500/10" : "border-pine-700/8 opacity-45 grayscale dark:border-pine-200/8")}>
                    <IcSpark size={20} className={got ? "text-sun-600 dark:text-sun-400" : ""} />
                    <span className="mt-1.5 text-[10.5px] font-black leading-tight">{d.name}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
const gradeLetter = (p: number) => p >= 80 ? "A" : p >= 75 ? "A-" : p >= 70 ? "B+" : p >= 65 ? "B" : p >= 60 ? "B-" : p >= 55 ? "C+" : p >= 50 ? "C" : p >= 45 ? "C-" : p >= 40 ? "D+" : "D";

/* ── My courses ──────────────────────────────────────────────────────────── */
export function MyCoursesPage() {
  const { db, user } = useApp();
  const [tab, setTab] = useState("active");
  if (!user) return null;
  const ens = myEnrollments(user.id, db);
  const shown = ens.filter((e) => tab === "all" ? true : e.status === tab);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs tabs={[{ id: "active", label: "In progress", count: ens.filter((e) => e.status === "active").length }, { id: "completed", label: "Completed", count: ens.filter((e) => e.status === "completed").length }, { id: "pending", label: "Pending", count: ens.filter((e) => e.status === "pending").length }, { id: "all", label: "All", count: ens.length }]} active={tab} onChange={setTab} />
        <Link to="/courses"><Btn variant="outline" size="sm">Browse catalogue <IcArrowR size={14} /></Btn></Link>
      </div>
      {shown.length === 0 ? (
        <div className="mt-8"><Empty icon={<IcBookOpen size={26} />} title="Nothing here yet" body="Courses you enrol in will appear here with live progress bars." action={<Link to="/courses"><Btn>Explore courses</Btn></Link>} /></div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((e) => {
            const c = courseById(e.courseId); if (!c) return null;
            const p = courseProgress(user.id, c.id);
            return (
              <div key={e.id} className="lift group overflow-hidden rounded-xl border border-pine-700/10 bg-white shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
                <Link to={e.status === "pending" ? `/courses/${c.id}` : `/app/learn/${c.id}`} className="relative block h-36 overflow-hidden bg-gradient-to-br from-pine-700 to-pine-950">
                  <img src={c.image} alt="" className="h-full w-full object-cover transition-transform duration-[2.5s] group-hover:scale-110" onError={(ev) => { (ev.currentTarget as HTMLImageElement).style.display = "none"; }} />
                  <span className="absolute right-3 top-3"><Badge tone={e.status === "completed" ? "pine" : e.status === "pending" ? "clay" : "sun"} className={cx(e.status === "active" && "bg-sun-500 text-pine-950")}>{e.status}</Badge></span>
                </Link>
                <div className="p-4.5">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-pine-700 dark:text-pine-300">{subjectName(c.subjectId)} · {gradeName(c.gradeId)}</p>
                  <Link to={e.status === "pending" ? `/courses/${c.id}` : `/app/learn/${c.id}`} className="mt-1 line-clamp-2 block font-display text-[15.5px] font-bold hover:text-pine-700 dark:hover:text-sun-400">{c.title}</Link>
                  <div className="mt-3 flex items-center gap-2.5"><Progress value={p.percent} className="flex-1" /><span className="text-[12px] font-black text-pine-700 dark:text-sun-400">{p.percent}%</span></div>
                  <p className="mt-2 text-[11.5px] font-bold text-ink-2/60 dark:text-pine-200/50">{p.done}/{p.total} lessons · enrolled {fmtDate(e.enrolledAt)}</p>
                  {e.status === "pending" && <p className="mt-2 text-[12px] font-bold text-clay-600">Payment pending — open the course to pay.</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Assignments (student) ───────────────────────────────────────────────── */
export function StudentAssignments() {
  const { db, user } = useApp();
  const toast = useToast();
  const [openAsg, setOpenAsg] = useState<Assignment | null>(null);
  const [text, setText] = useState("");
  const [file, setFile] = useState("");
  const [err, setErr] = useState("");
  if (!user) return null;
  const ens = myEnrollments(user.id, db).filter((e) => e.status !== "pending");
  const list = db.assignments.filter((a) => a.active && ens.some((e) => e.courseId === a.courseId)).sort((a, b) => a.dueAt - b.dueAt);
  const subFor = (a: Assignment): Submission | undefined => db.submissions.find((s) => s.assignmentId === a.id && s.studentId === user.id);

  const submit = () => {
    if (!openAsg) return;
    if (text.trim().length < 10 && !file) { setErr("Write your answer (or attach a file) before submitting."); return; }
    const e = submitAssignment(openAsg.id, user.id, text.trim(), file || undefined);
    if (e) { setErr(e); return; }
    toast.push("Assignment submitted — your teacher has been notified.");
    setOpenAsg(null); setText(""); setFile(""); setErr("");
  };

  return (
    <div>
      {list.length === 0 ? <Empty icon={<IcClipboard size={26} />} title="No assignments yet" body="Assignments from your enrolled courses will appear here with due dates." /> : (
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((a, i) => {
            const sub = subFor(a);
            const course = courseById(a.courseId);
            const overdue = a.dueAt < Date.now() && !sub;
            return (
              <Reveal key={a.id} delay={(i % 2) * 80}>
                <div className={cx("flex h-full flex-col rounded-xl border bg-white p-5 shadow-[var(--shadow-card)] dark:bg-night-800", overdue ? "border-clay-500/40" : "border-pine-700/10 dark:border-pine-200/10")}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-2/55 dark:text-pine-200/45">{course?.title}</p>
                      <h3 className="mt-1 font-display text-lg font-bold">{a.title}</h3>
                    </div>
                    {sub ? (sub.status === "graded"
                      ? <Badge tone="pine">Graded · {sub.marks}/{a.maxMarks}</Badge>
                      : <Badge tone="sun">Submitted</Badge>)
                      : overdue ? <Badge tone="clay">Overdue</Badge> : <Badge tone="gray">Due in {daysUntil(a.dueAt)}d</Badge>}
                  </div>
                  <p className="mt-2.5 line-clamp-3 whitespace-pre-line text-[13px] leading-relaxed text-ink-2/85 dark:text-pine-200/65">{a.instructions}</p>
                  <div className="mt-3 flex items-center gap-4 text-[12px] font-bold text-ink-2/60 dark:text-pine-200/50">
                    <span className="flex items-center gap-1.5"><IcCalendar size={14} /> {fmtDate(a.dueAt)}</span>
                    <span className="flex items-center gap-1.5"><IcClipboard size={14} /> {a.maxMarks} marks</span>
                    {a.allowsUpload && <span className="flex items-center gap-1.5"><IcUpload size={14} /> uploads allowed</span>}
                  </div>
                  {sub?.status === "graded" && sub.feedback && (
                    <div className="mt-3.5 rounded-lg border border-pine-700/12 bg-pine-700/5 p-3.5 dark:border-pine-200/12 dark:bg-pine-200/6">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-pine-700 dark:text-pine-300">Teacher feedback</p>
                      <p className="mt-1 text-[13px] leading-relaxed">{sub.feedback}</p>
                    </div>
                  )}
                  <div className="mt-auto pt-4">
                    {sub ? (
                      <Btn variant="outline" size="sm" onClick={() => { setOpenAsg(a); setText(sub.text); setFile(sub.fileName ?? ""); }} className="w-full">View submission</Btn>
                    ) : (
                      <Btn size="sm" onClick={() => { setOpenAsg(a); setText(""); setFile(""); setErr(""); }} className="w-full" disabled={overdue}>
                        {overdue ? "Deadline passed" : "Open & submit"}
                      </Btn>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}

      <Modal open={!!openAsg} onClose={() => setOpenAsg(null)} title={openAsg?.title ?? ""} wide>
        {openAsg && (
          <div>
            <p className="whitespace-pre-line rounded-lg bg-pine-700/5 p-4 text-[13px] leading-relaxed text-ink-2 dark:bg-pine-200/6 dark:text-pine-200/80">{openAsg.instructions}</p>
            <div className="mt-4 flex items-center justify-between text-[12.5px] font-bold text-ink-2/70 dark:text-pine-200/60">
              <span>Due {fmtDate(openAsg.dueAt)} · {openAsg.maxMarks} marks</span>
              {subFor(openAsg) && <Badge tone="sun">{subFor(openAsg)!.status}</Badge>}
            </div>
            {!subFor(openAsg) || subFor(openAsg)!.status === "returned" ? (
              <>
                <div className="mt-4">
                  <Field label="Your answer" error={err}><TextArea rows={7} value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your working / answer here. Show every step — method marks matter!" /></Field>
                </div>
                {openAsg.allowsUpload && (
                  <div className="mt-4">
                    <Field label="Attachment (optional)" hint="Photos or scans of your exercise book — PDF/JPG up to 5 MB.">
                      <div className="flex items-center gap-2">
                        <TextInput value={file} onChange={(e) => setFile(e.target.value)} placeholder="e.g. amina_q5_working.jpg" />
                        <Btn variant="outline" size="sm" onClick={() => setFile(`submission_${user.name.split(" ")[0].toLowerCase()}_${openAsg.id}.jpg`)}><IcUpload size={14} /> Attach</Btn>
                      </div>
                    </Field>
                  </div>
                )}
                <div className="mt-5 flex justify-end gap-2">
                  <Btn variant="ghost" onClick={() => setOpenAsg(null)}>Cancel</Btn>
                  <Btn onClick={submit}><IcCheck size={15} /> Submit for marking</Btn>
                </div>
              </>
            ) : (
              <div className="mt-4">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-2/55 dark:text-pine-200/45">Submitted {fmtDate(subFor(openAsg)!.submittedAt)}</p>
                <p className="mt-2 whitespace-pre-line rounded-lg border border-pine-700/12 p-4 text-[13.5px] leading-relaxed dark:border-pine-200/12">{subFor(openAsg)!.text}</p>
                {subFor(openAsg)!.fileName && <p className="mt-2 flex items-center gap-1.5 text-[12.5px] font-bold text-ink-2/70 dark:text-pine-200/60"><IcFileText size={14} /> {subFor(openAsg)!.fileName}</p>}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ── Quizzes (student) ───────────────────────────────────────────────────── */
export function StudentQuizzes() {
  const { db, user } = useApp();
  if (!user) return null;
  const ens = myEnrollments(user.id, db).filter((e) => e.status !== "pending");
  const quizzes = db.quizzes.filter((q) => q.active && ens.some((e) => e.courseId === q.courseId));
  const attempts = db.attempts.filter((a) => a.studentId === user.id).sort((a, b) => b.submittedAt - a.submittedAt);
  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <section>
        <h3 className="font-display text-lg font-bold">Available quizzes</h3>
        <div className="mt-4 space-y-3.5">
          {quizzes.length === 0 && <Empty icon={<IcTarget size={26} />} title="No quizzes yet" body="Quizzes appear when you enrol in assessed courses." />}
          {quizzes.map((q) => {
            const mine = db.attempts.filter((a) => a.quizId === q.id && a.studentId === user.id);
            const best = mine.length ? Math.max(...mine.map((a) => a.percent)) : null;
            const left = q.maxAttempts - mine.length;
            return (
              <div key={q.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-pine-700/10 bg-white p-4.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-sun-500/15 text-sun-700 dark:text-sun-400"><IcTarget size={22} /></span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[15.5px] font-bold">{q.title}</p>
                  <p className="mt-0.5 text-[12px] font-bold text-ink-2/60 dark:text-pine-200/50">
                    {courseById(q.courseId)?.title} · {q.questions.length} questions · {q.timeLimitMin} min · pass {q.passingPercent}%
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {best !== null && <Badge tone={best >= q.passingPercent ? "pine" : "clay"}>Best: {best}%</Badge>}
                    <Badge tone={left > 0 ? "gray" : "clay"}>{left > 0 ? `${left} attempt${left === 1 ? "" : "s"} left` : "No attempts left"}</Badge>
                  </div>
                </div>
                <Link to={`/app/quiz/${q.id}`}><Btn size="sm" variant={left > 0 ? "primary" : "outline"}>{left > 0 ? (mine.length ? "Retake" : "Start") : "Review"}</Btn></Link>
              </div>
            );
          })}
        </div>
      </section>
      <section>
        <h3 className="font-display text-lg font-bold">Attempt history</h3>
        <div className="mt-4 space-y-2.5">
          {attempts.length === 0 && <p className="text-[13px] font-semibold text-ink-2/60 dark:text-pine-200/50">No attempts yet.</p>}
          {attempts.map((a) => {
            const q = db.quizzes.find((x) => x.id === a.quizId);
            return (
              <Link to={`/app/quiz/${a.quizId}`} key={a.id} className="flex items-center gap-3.5 rounded-xl border border-pine-700/8 bg-white px-4 py-3 transition-colors hover:border-sun-500/50 dark:border-pine-200/8 dark:bg-night-800">
                <span className={cx("grid h-10 w-10 shrink-0 place-items-center rounded-lg font-display text-[13px] font-black", a.passed ? "bg-pine-700/10 text-pine-700 dark:bg-pine-200/10 dark:text-pine-300" : "bg-clay-500/12 text-clay-600")}>{a.percent}%</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-bold">{q?.title}</span>
                  <span className="text-[11.5px] font-bold text-ink-2/55 dark:text-pine-200/45">{a.score}/{a.total} · {Math.floor(a.timeSpentSec / 60)}m {a.timeSpentSec % 60}s · {fmtDate(a.submittedAt)}</span>
                </span>
                <Badge tone={a.passed ? "pine" : "clay"}>{a.passed ? "Pass" : "Fail"}</Badge>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/* ── Results table (shared with parents) ─────────────────────────────────── */
export function ResultsTable({ studentId, compact = false }: { studentId: string; compact?: boolean }) {
  const { db } = useApp();
  const results = db.results.filter((r) => r.studentId === studentId).sort((a, b) => b.date - a.date);
  if (results.length === 0) return <Empty icon={<IcSearch size={24} />} title="No results yet" body="Released results and graded assignments will appear here." />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-130 text-left text-[13px]">
        <thead><tr className="border-b-2 border-pine-700/15 text-[11px] font-extrabold uppercase tracking-wider text-ink-2/60 dark:border-pine-200/15 dark:text-pine-200/50">
          <th className="py-2.5 pr-3">Date</th><th className="py-2.5 pr-3">Subject</th><th className="py-2.5 pr-3">Assessment</th>
          <th className="py-2.5 pr-3">Score</th><th className="py-2.5 pr-3">%</th><th className="py-2.5 pr-3">Grade</th>{!compact && <th className="py-2.5">Comment</th>}</tr></thead>
        <tbody>
          {results.map((r) => {
            const pct = Math.round((r.score / r.maxScore) * 100);
            return (
              <tr key={r.id} className="border-b border-pine-700/6 transition-colors last:border-0 hover:bg-pine-700/3 dark:border-pine-200/6 dark:hover:bg-pine-200/4">
                <td className="py-3 pr-3 whitespace-nowrap font-semibold text-ink-2 dark:text-pine-200/70">{fmtDate(r.date)}</td>
                <td className="py-3 pr-3 font-bold">{subjectName(r.subjectId)}</td>
                <td className="py-3 pr-3 font-bold">{r.assessment}<span className="block text-[11px] font-semibold text-ink-2/55 dark:text-pine-200/45">{r.term}</span></td>
                <td className="py-3 pr-3 font-bold">{r.score}/{r.maxScore}</td>
                <td className="py-3 pr-3 font-bold">{pct}%</td>
                <td className="py-3 pr-3"><Badge tone={pct >= 70 ? "pine" : pct >= 50 ? "sun" : "clay"}>{gradeLetter(pct)}</Badge></td>
                {!compact && <td className="max-w-60 py-3 text-[12.5px] leading-relaxed text-ink-2/85 dark:text-pine-200/65">{r.comment}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function StudentResults() {
  const { db, user } = useApp();
  if (!user) return null;
  const results = db.results.filter((r) => r.studentId === user.id);
  const pcts = results.map((r) => (r.score / r.maxScore) * 100);
  const avg = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0;
  const bySubject = [...new Set(results.map((r) => r.subjectId))].map((sid) => {
    const rs = results.filter((r) => r.subjectId === sid).map((r) => (r.score / r.maxScore) * 100);
    return { label: subjectName(sid), value: Math.round(rs.reduce((a, b) => a + b, 0) / rs.length) };
  });
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Stat icon={<IcTrend size={19} />} label="Average" value={`${avg}%`} sub={gradeLetter(avg)} />
        <Stat icon={<IcCheckC size={19} />} label="Highest" value={pcts.length ? `${Math.round(Math.max(...pcts))}%` : "—"} tone="sun" />
        <Stat icon={<IcClipboard size={19} />} label="Lowest" value={pcts.length ? `${Math.round(Math.min(...pcts))}%` : "—"} tone="clay" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Reveal><section className="rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <h3 className="font-display text-lg font-bold">All results</h3>
          <div className="mt-3"><ResultsTable studentId={user.id} /></div>
        </section></Reveal>
        <Reveal delay={120}><section className="h-fit rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <h3 className="font-display text-lg font-bold">Subject performance</h3>
          <div className="mt-4"><HBars data={bySubject.map((s) => ({ ...s, value: s.value }))} format={(v) => `${v}%`} /></div>
        </section></Reveal>
      </div>
    </div>
  );
}

/* ── Progress ────────────────────────────────────────────────────────────── */
export function ProgressPage() {
  const { db, user } = useApp();
  const userId = user?.id ?? "";
  const series = useMemo(() => {
    const out: number[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setHours(0, 0, 0, 0); const start = d.getTime() - i * 86400000;
      out.push(db.lessonProgress.filter((p) => p.studentId === userId && p.completedAt >= start && p.completedAt < start + 86400000).length);
    }
    return out;
  }, [db, userId]);
  if (!user) return null;
  const ens = myEnrollments(user.id, db).filter((e) => e.status !== "pending");
  const all = ens.flatMap((e) => lessonsOf(e.courseId));
  const done = all.filter((l) => db.lessonProgress.some((p) => p.studentId === user.id && p.lessonId === l.id));
  const overall = all.length ? Math.round((done.length / all.length) * 100) : 0;
  const labels = Array.from({ length: 14 }, (_, i) => { const d = new Date(Date.now() - (13 - i) * 86400000); return d.toLocaleDateString("en-KE", { day: "numeric" }); });

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <Reveal><section className="flex flex-col items-center rounded-xl border border-pine-700/10 bg-white p-6 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <Donut value={overall} size={150} stroke={14} sub="complete" />
          <p className="mt-4 text-center text-[13.5px] font-bold text-ink-2 dark:text-pine-200/70">{done.length} of {all.length} enrolled lessons completed</p>
          <div className="mt-5 grid w-full grid-cols-2 gap-3">
            <div className="rounded-lg bg-pine-700/6 px-3 py-2.5 text-center dark:bg-pine-200/8"><p className="font-display text-lg font-black text-pine-800 dark:text-pine-200">{ens.filter((e) => e.status === "completed").length}</p><p className="text-[10.5px] font-extrabold uppercase tracking-wider text-ink-2/60 dark:text-pine-200/50">courses finished</p></div>
            <div className="rounded-lg bg-sun-500/10 px-3 py-2.5 text-center"><p className="font-display text-lg font-black text-sun-700 dark:text-sun-400">{db.earned.filter((e) => e.studentId === user.id).length}</p><p className="text-[10.5px] font-extrabold uppercase tracking-wider text-ink-2/60 dark:text-pine-200/50">badges earned</p></div>
          </div>
        </section></Reveal>
        <Reveal delay={100}><section className="rounded-xl border border-pine-700/10 bg-white p-6 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <h3 className="font-display text-lg font-bold">Lessons per day — last 14 days</h3>
          <div className="mt-4"><Line points={series} labels={labels} height={170} /></div>
        </section></Reveal>
      </div>
      <Reveal><section className="rounded-xl border border-pine-700/10 bg-white p-6 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
        <h3 className="font-display text-lg font-bold">Course progress</h3>
        <div className="mt-4 space-y-4">
          {ens.map((e) => {
            const c = courseById(e.courseId); if (!c) return null;
            const p = courseProgress(user.id, c.id);
            return (
              <div key={e.id}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <Link to={`/app/learn/${c.id}`} className="truncate font-display text-[15px] font-bold hover:text-pine-700 dark:hover:text-sun-400">{c.title}</Link>
                  <span className="shrink-0 text-[12.5px] font-black text-pine-700 dark:text-sun-400">{p.done}/{p.total} · {p.percent}%</span>
                </div>
                <Progress value={p.percent} color={p.percent === 100 ? "var(--color-sun-500)" : "var(--color-pine-600)"} />
              </div>
            );
          })}
          {ens.length === 0 && <p className="text-[13px] font-semibold text-ink-2/60 dark:text-pine-200/50">Enrol in a course to start tracking progress.</p>}
        </div>
      </section></Reveal>
      <Reveal><section className="rounded-xl border border-pine-700/10 bg-white p-6 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold"><IcAward size={18} className="text-sun-600 dark:text-sun-400" /> Badges & milestones</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {db.achievementDefs.map((d) => {
            const e = db.earned.find((x) => x.studentId === user.id && x.defId === d.id);
            return (
              <div key={d.id} className={cx("flex items-start gap-3.5 rounded-xl border p-4 transition-all", e ? "border-sun-500/50 bg-sun-500/8" : "border-pine-700/8 opacity-50 grayscale dark:border-pine-200/8")}>
                <span className={cx("grid h-11 w-11 shrink-0 place-items-center rounded-xl", e ? "bg-sun-500 text-pine-950" : "bg-ink/8 dark:bg-pine-200/10")}><IcAward size={20} /></span>
                <span>
                  <span className="block font-display text-[14.5px] font-bold">{d.name}</span>
                  <span className="mt-0.5 block text-[12px] leading-relaxed text-ink-2/75 dark:text-pine-200/55">{d.description}</span>
                  {e && <span className="mt-1 block text-[10.5px] font-extrabold uppercase tracking-wider text-sun-700 dark:text-sun-400">Earned {fmtDate(e.earnedAt)}</span>}
                </span>
              </div>
            );
          })}
        </div>
      </section></Reveal>
    </div>
  );
}

/* ── Bookmarks ───────────────────────────────────────────────────────────── */
export function BookmarksPage() {
  const { db, user } = useApp();
  const toast = useToast();
  if (!user) return null;
  const marks = db.bookmarks.filter((b) => b.userId === user.id).sort((a, b) => b.createdAt - a.createdAt);
  return (
    <div>
      {marks.length === 0 ? <Empty icon={<IcBookmark size={26} />} title="No bookmarks yet" body="Tap the bookmark icon on any lesson or resource to save it here for quick revision." /> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {marks.map((b) => {
            if (b.type === "lesson") {
              const l = lessonById(b.refId); if (!l) return null;
              const c = courseById(l.courseId);
              return (
                <div key={b.id} className="lift flex flex-col rounded-xl border border-pine-700/10 bg-white p-5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
                  <div className="flex items-center justify-between">
                    <Badge tone="pine"><IcVideo size={11} /> lesson</Badge>
                    <button onClick={() => { toggleBookmark(user.id, "lesson", b.refId); toast.push("Bookmark removed", "info"); }} aria-label="Remove bookmark" className="cursor-pointer rounded-md p-1 text-sun-600 transition-transform hover:scale-110 dark:text-sun-400"><IcBookmark size={16} filled /></button>
                  </div>
                  <Link to={`/app/learn/${l.courseId}/${l.id}`} className="mt-3 font-display text-[15.5px] font-bold leading-snug hover:text-pine-700 dark:hover:text-sun-400">{l.title}</Link>
                  <p className="mt-1 text-[12px] font-bold text-ink-2/60 dark:text-pine-200/50">{c?.title}</p>
                  <p className="mt-1.5 text-[11.5px] font-bold uppercase tracking-wider text-ink-2/45 dark:text-pine-200/35">Saved {timeAgo(b.createdAt)}</p>
                </div>
              );
            }
            const r = db.resources.find((x) => x.id === b.refId); if (!r) return null;
            return (
              <div key={b.id} className="lift flex flex-col rounded-xl border border-pine-700/10 bg-white p-5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
                <div className="flex items-center justify-between">
                  <Badge tone="sun" className="capitalize">{r.kind.replace("-", " ")}</Badge>
                  <button onClick={() => { toggleBookmark(user.id, "resource", b.refId); toast.push("Bookmark removed", "info"); }} aria-label="Remove bookmark" className="cursor-pointer rounded-md p-1 text-sun-600 transition-transform hover:scale-110 dark:text-sun-400"><IcBookmark size={16} filled /></button>
                </div>
                <Link to="/app/resources" className="mt-3 font-display text-[15.5px] font-bold leading-snug hover:text-pine-700 dark:hover:text-sun-400">{r.title}</Link>
                <p className="mt-1 text-[12px] font-bold text-ink-2/60 dark:text-pine-200/50">{subjectName(r.subjectId)} · {gradeName(r.gradeId)}</p>
                <p className="mt-1.5 text-[11.5px] font-bold uppercase tracking-wider text-ink-2/45 dark:text-pine-200/35">Saved {timeAgo(b.createdAt)}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Notifications ───────────────────────────────────────────────────────── */
export function NotificationsPage() {
  const { db, user } = useApp();
  const nav = useNavigate();
  const [tab, setTab] = useState("all");
  if (!user) return null;
  const all = db.notifications.filter((n) => n.userId === user.id);
  const shown = tab === "unread" ? all.filter((n) => !n.read) : all;
  const kindIcon: Record<string, React.ReactNode> = { course: <IcBookOpen size={16} />, assignment: <IcClipboard size={16} />, quiz: <IcTarget size={16} />, result: <IcCheckC size={16} />, payment: <IcMoney size={16} />, announcement: <IcMail size={16} />, system: <IcSpark size={16} /> };
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs tabs={[{ id: "all", label: "All", count: all.length }, { id: "unread", label: "Unread", count: all.filter((n) => !n.read).length }]} active={tab} onChange={setTab} />
        {all.some((n) => !n.read) && <Btn variant="outline" size="sm" onClick={() => markAllRead(user.id)}>Mark all as read</Btn>}
      </div>
      {shown.length === 0 ? <div className="mt-8"><Empty icon={<IcMail size={26} />} title="Inbox zero" body="You're all caught up. New course activity, results and announcements will land here." /></div> : (
        <div className="mt-6 space-y-2.5">
          {shown.map((n) => (
            <button key={n.id} onClick={() => { markRead(n.id); if (n.link) nav(n.link); }}
              className={cx("flex w-full cursor-pointer items-start gap-4 rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-night-800",
                n.read ? "border-pine-700/8 bg-white dark:border-pine-200/8" : "border-sun-500/40 bg-sun-500/6")}>
              <span className={cx("grid h-10 w-10 shrink-0 place-items-center rounded-lg", n.read ? "bg-pine-700/8 text-pine-700 dark:bg-pine-200/10 dark:text-pine-300" : "bg-sun-500 text-pine-950")}>{kindIcon[n.kind] ?? <IcSpark size={16} />}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-3"><span className="font-display text-[15px] font-bold">{n.title}</span><span className="shrink-0 text-[11px] font-extrabold uppercase tracking-wider text-ink-2/50 dark:text-pine-200/40">{timeAgo(n.createdAt)}</span></span>
                <span className="mt-1 block text-[13px] leading-relaxed text-ink-2/85 dark:text-pine-200/65">{n.body}</span>
              </span>
              {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sun-500" aria-label="Unread" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Profile & settings ──────────────────────────────────────────────────── */
const AV_COLORS = ["#0C5A43", "#B56508", "#C4562E", "#1F6A50", "#8F4D0D", "#357E62", "#A84625", "#083528"];
export function ProfilePage() {
  const { db, user } = useApp();
  const toast = useToast();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [color, setColor] = useState(user?.color ?? AV_COLORS[0]);
  const [cur, setCur] = useState(""); const [next, setNext] = useState(""); const [conf, setConf] = useState("");
  const [pwErr, setPwErr] = useState("");
  if (!user) return null;
  const parent = db.users.find((u) => u.role === "parent" && u.linkedStudentIds?.includes(user.id));

  const saveProfile = () => {
    if (name.trim().length < 3) { toast.push("Name must be at least 3 characters.", "err"); return; }
    updateProfile(user.id, { name: name.trim(), phone, color });
    toast.push("Profile updated.");
  };
  const savePw = () => {
    setPwErr("");
    if (next !== conf) { setPwErr("New passwords do not match."); return; }
    const e = changePassword(user.id, cur, next);
    if (e) { setPwErr(e); return; }
    setCur(""); setNext(""); setConf("");
    toast.push("Password changed successfully.");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Reveal><section className="rounded-xl border border-pine-700/10 bg-white p-6 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
        <h3 className="font-display text-lg font-bold">Profile</h3>
        <div className="mt-5 flex items-center gap-4">
          <Avatar name={name || user.name} color={color} size={64} />
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Avatar colour">
            {AV_COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)} role="radio" aria-checked={color === c} aria-label={`Colour ${c}`}
                className={cx("h-7 w-7 cursor-pointer rounded-full transition-transform hover:scale-110", color === c && "ring-2 ring-sun-500 ring-offset-2 ring-offset-paper dark:ring-offset-night-800")} style={{ background: c }} />
            ))}
          </div>
        </div>
        <div className="mt-5 space-y-4">
          <Field label="Full name"><TextInput value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Phone"><TextInput value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 7XX XXX XXX" /></Field>
          <Field label="Email" hint="Email is your login and cannot be changed here."><TextInput value={user.email} disabled className="opacity-60" /></Field>
          {user.role === "student" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-pine-700/6 px-3.5 py-2.5 dark:bg-pine-200/8"><p className="text-[10.5px] font-extrabold uppercase tracking-wider text-ink-2/55 dark:text-pine-200/45">Student code</p><p className="font-mono text-[15px] font-black text-pine-800 dark:text-pine-200">{user.studentCode}</p></div>
              <div className="rounded-lg bg-pine-700/6 px-3.5 py-2.5 dark:bg-pine-200/8"><p className="text-[10.5px] font-extrabold uppercase tracking-wider text-ink-2/55 dark:text-pine-200/45">Grade</p><p className="text-[15px] font-black text-pine-800 dark:text-pine-200">{gradeName(user.gradeId ?? "")}</p></div>
            </div>
          )}
          {user.role === "student" && parent && <p className="text-[12.5px] font-semibold text-ink-2/70 dark:text-pine-200/60">Linked guardian: <strong>{parent.name}</strong> ({parent.email})</p>}
          <Btn onClick={saveProfile}>Save profile</Btn>
          {user.role === "student" && <p className="flex items-start gap-2 rounded-lg bg-pine-700/5 p-3 text-[11.5px] leading-relaxed text-ink-2/70 dark:bg-pine-200/6 dark:text-pine-200/55"><IcLock size={13} className="mt-0.5 shrink-0" /> Academic records (results, enrolments, codes) are protected and can only be changed by teachers or administrators.</p>}
        </div>
      </section></Reveal>
      <div className="space-y-6">
        <Reveal delay={100}><section className="rounded-xl border border-pine-700/10 bg-white p-6 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <h3 className="font-display text-lg font-bold">Change password</h3>
          <div className="mt-4 space-y-3.5">
            <Field label="Current password"><TextInput type="password" value={cur} onChange={(e) => setCur(e.target.value)} autoComplete="current-password" /></Field>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label="New password"><TextInput type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" /></Field>
              <Field label="Confirm new"><TextInput type="password" value={conf} onChange={(e) => setConf(e.target.value)} autoComplete="new-password" /></Field>
            </div>
            {pwErr && <p className="text-[13px] font-bold text-clay-600">{pwErr}</p>}
            <Btn onClick={savePw} disabled={!cur || !next}>Update password</Btn>
          </div>
        </section></Reveal>
        <Reveal delay={160}><section className="rounded-xl border border-pine-700/10 bg-white p-6 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <h3 className="font-display text-lg font-bold">Notification preferences</h3>
          <div className="mt-4 space-y-3.5">
            {([["notifyEmail", "Email notifications", "Results, receipts and important announcements"], ["notifyPush", "In-app notifications", "Assignment reminders and quiz availability"]] as const).map(([key, t, b]) => (
              <div key={key} className="flex items-center justify-between gap-4 rounded-lg border border-pine-700/8 px-4 py-3 dark:border-pine-200/8">
                <div><p className="text-[14px] font-bold">{t}</p><p className="text-[12px] text-ink-2/70 dark:text-pine-200/55">{b}</p></div>
                <ToggleSwitch on={!!user[key]} onChange={(v) => { updateProfile(user.id, { [key]: v }); toast.push(`Preference saved.`, "info"); }} label={t} />
              </div>
            ))}
            <p className="text-[11.5px] leading-relaxed text-ink-2/60 dark:text-pine-200/45">Theme preference lives in the sun/moon toggle in the top bar — it is saved to this device automatically.</p>
          </div>
        </section></Reveal>
      </div>
    </div>
  );
}
import { Toggle as ToggleSwitch } from "../components/ui";


+++ src/pages/student.tsx (修改后)
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  assignmentById, changePassword, courseById, courseProgress, enrollmentFor, gradeName, isBookmarked,
  lessonById, lessonsOf, markAllRead, markRead, resolveAudience, subjectName, submitAssignment, toggleBookmark,
  updateProfile, useApp, userById,
} from "../lib/db";
import type { Assignment, Submission } from "../lib/types";
import { Avatar, Badge, Btn, Confirm, Empty, Field, Modal, Progress, Reveal, Skel, Stat, Tabs, TextArea, TextInput, cx, daysUntil, fmtDate, timeAgo, useLoad, useToast } from "../components/ui";
import { Bars, Donut, HBars, Line } from "../components/charts";
import {
  IcArrowR, IcAward, IcBookOpen, IcBookmark, IcCalendar, IcCheck, IcCheckC, IcClipboard, IcClock, IcDownload,
  IcFileText, IcFlame, IcLock, IcMail, IcMoney, IcPhone, IcSearch, IcSpark, IcTarget, IcTrend, IcUpload, IcVideo, IcX,
} from "../components/icons";

/* ── helpers ─────────────────────────────────────────────────────────────── */
function myEnrollments(userId: string, db: ReturnType<typeof useApp>["db"]) {
  return db.enrollments.filter((e) => e.studentId === userId && e.status !== "cancelled");
}
function streakOf(userId: string, db: ReturnType<typeof useApp>["db"]) {
  const day = (t: number) => new Date(t).toDateString();
  const days = new Set([
    ...db.lessonProgress.filter((p) => p.studentId === userId).map((p) => day(p.completedAt)),
    ...db.attempts.filter((a) => a.studentId === userId).map((a) => day(a.submittedAt)),
  ]);
  let s = 0; const d = new Date();
  if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1); // grace: streak counts from yesterday
  while (days.has(d.toDateString())) { s++; d.setDate(d.getDate() - 1); }
  return s;
}

/* ── Dashboard ───────────────────────────────────────────────────────────── */
export function StudentDashboard() {
  const { db, user } = useApp();
  const nav = useNavigate();
  const loading = useLoad(400);
  if (!user) return null;
  const ens = myEnrollments(user.id, db).filter((e) => e.status === "active");
  const allLessons = ens.flatMap((e) => lessonsOf(e.courseId));
  const doneLessons = allLessons.filter((l) => db.lessonProgress.some((p) => p.studentId === user.id && p.lessonId === l.id));
  const overall = allLessons.length ? Math.round((doneLessons.length / allLessons.length) * 100) : 0;
  const attempts = db.attempts.filter((a) => a.studentId === user.id);
  const quizAvg = attempts.length ? Math.round(attempts.reduce((n, a) => n + a.percent, 0) / attempts.length) : 0;
  const graded = db.submissions.filter((s) => s.studentId === user.id && s.status === "graded");
  const asgAvg = graded.length ? Math.round(graded.reduce((n, s) => n + ((s.marks ?? 0) / (assignmentById(s.assignmentId)?.maxMarks ?? 1)) * 100, 0) / graded.length) : 0;
  const streak = streakOf(user.id, db);

  const upcoming = db.assignments
    .filter((a) => ens.some((e) => e.courseId === a.courseId) && a.dueAt > Date.now())
    .filter((a) => !db.submissions.some((s) => s.assignmentId === a.id && s.studentId === user.id))
    .sort((a, b) => a.dueAt - b.dueAt).slice(0, 3);
  const quizList = db.quizzes.filter((q) => q.active && ens.some((e) => e.courseId === q.courseId)).slice(0, 2);
  const results = db.results.filter((r) => r.studentId === user.id).sort((a, b) => b.date - a.date).slice(0, 4);
  const earnedDefs = db.achievementDefs.filter((d) => db.earned.some((e) => e.studentId === user.id && e.defId === d.id));
  const announcements = db.announcements.filter((a) => ["all-students", "everyone", "grade"].includes(a.audience) && (!a.expiresAt || a.expiresAt > Date.now())).slice(0, 2);

  const firstName = user.name.split(" ")[0];
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Habari ya asubuhi" : hour < 17 ? "Habari ya mchana" : "Habari ya jioni";

  if (loading) return <div className="grid gap-5 lg:grid-cols-3"><Skel className="h-44 lg:col-span-2" /><Skel className="h-44" /><Skel className="h-64 lg:col-span-2" /><Skel className="h-64" /></div>;

  return (
    <div className="space-y-6">
      {/* welcome banner */}
      <Reveal>
        <div className="board-bg noise relative overflow-hidden rounded-2xl p-6 sm:p-8">
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-sun-400">{greet} · {new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long" })}</p>
              <h2 className="mt-2 font-display text-3xl font-black text-paper sm:text-4xl">Welcome back, {firstName} 👋🏾</h2>
              <p className="mt-2 max-w-lg text-[14px] text-pine-100/75">You're <strong className="text-sun-400">{overall}%</strong> through your enrolled lessons{upcoming.length > 0 && <> with <strong className="text-sun-400">{upcoming.length} assignment{upcoming.length > 1 ? "s" : ""}</strong> due this week</>}. Small steps, every day.</p>
              <Btn variant="accent" className="mt-5" onClick={() => nav("/app/my-courses")}>Continue learning <IcArrowR size={15} /></Btn>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <Donut value={overall} size={110} stroke={11} sub="overall" />
              </div>
              <div className="hidden rounded-xl border border-paper/12 bg-paper/6 px-5 py-4 backdrop-blur-sm sm:block">
                <p className="flex items-center gap-2 font-display text-2xl font-black text-sun-400"><IcFlame size={22} /> {streak} day{streak === 1 ? "" : "s"}</p>
                <p className="mt-1 text-[11px] font-extrabold uppercase tracking-wider text-pine-100/60">study streak</p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={<IcBookOpen size={19} />} label="Lessons done" value={doneLessons.length} sub={`of ${allLessons.length} enrolled`} />
        <Stat icon={<IcTarget size={19} />} label="Quiz average" value={attempts.length ? `${quizAvg}%` : "—"} sub={`${attempts.length} attempt${attempts.length === 1 ? "" : "s"}`} tone="sun" />
        <Stat icon={<IcClipboard size={19} />} label="Assignment avg" value={graded.length ? `${asgAvg}%` : "—"} sub={`${graded.length} graded`} tone="night" />
        <Stat icon={<IcTrend size={19} />} label="Courses active" value={ens.length} sub={`${db.earned.filter((e) => e.studentId === user.id).length} badges earned`} tone="clay" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* continue learning */}
        <Reveal>
          <section className="rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Continue learning</h3>
              <Link to="/app/my-courses" className="link-sweep text-[13px] font-extrabold text-sun-700 dark:text-sun-400">All courses</Link>
            </div>
            <div className="mt-4 space-y-3.5">
              {ens.length === 0 && <Empty icon={<IcBookOpen size={24} />} title="No courses yet" body="Browse the catalogue and enrol in your first course." action={<Link to="/courses"><Btn size="sm">Browse courses</Btn></Link>} />}
              {ens.slice(0, 3).map((e) => {
                const c = courseById(e.courseId)!;
                const p = courseProgress(user.id, c.id);
                const nextLesson = lessonsOf(c.id).find((l) => !db.lessonProgress.some((x) => x.studentId === user.id && x.lessonId === l.id));
                return (
                  <Link key={e.id} to={`/app/learn/${c.id}`} className="group flex items-center gap-4 rounded-xl border border-pine-700/8 p-3 transition-all hover:-translate-y-0.5 hover:border-sun-500/50 hover:shadow-md dark:border-pine-200/8">
                    <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-pine-700 to-pine-950">
                      <img src={c.image} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" onError={(ev) => { (ev.currentTarget as HTMLImageElement).style.display = "none"; }} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-[15px] font-bold group-hover:text-pine-700 dark:group-hover:text-sun-400">{c.title}</span>
                      <span className="mt-0.5 block text-[12px] font-semibold text-ink-2/70 dark:text-pine-200/55">{nextLesson ? `Next: ${nextLesson.title}` : "Course complete 🎓"}</span>
                      <span className="mt-2 flex items-center gap-2.5"><Progress value={p.percent} className="flex-1" /><span className="text-[12px] font-black text-pine-700 dark:text-sun-400">{p.percent}%</span></span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        </Reveal>

        {/* upcoming */}
        <div className="space-y-6">
          <Reveal delay={100}>
            <section className="rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold"><IcCalendar size={18} className="text-sun-600 dark:text-sun-400" /> Upcoming</h3>
              <div className="mt-3.5 space-y-2.5">
                {upcoming.map((a) => (
                  <Link to="/app/assignments" key={a.id} className="flex items-center gap-3 rounded-lg border border-pine-700/8 px-3.5 py-2.5 transition-colors hover:border-sun-500/50 dark:border-pine-200/8">
                    <span className={cx("grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[12px] font-black", daysUntil(a.dueAt) <= 2 ? "bg-clay-500/12 text-clay-600" : "bg-pine-700/8 text-pine-700 dark:bg-pine-200/10 dark:text-pine-300")}>{daysUntil(a.dueAt)}d</span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13.5px] font-bold">{a.title}</span>
                      <span className="text-[11.5px] font-bold uppercase tracking-wider text-ink-2/55 dark:text-pine-200/45">{subjectName(courseById(a.courseId)?.subjectId ?? "")} · due {fmtDate(a.dueAt)}</span>
                    </span>
                  </Link>
                ))}
                {quizList.map((q) => (
                  <Link to={`/app/quiz/${q.id}`} key={q.id} className="flex items-center gap-3 rounded-lg border border-pine-700/8 px-3.5 py-2.5 transition-colors hover:border-sun-500/50 dark:border-pine-200/8">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sun-500/15 text-sun-700 dark:text-sun-400"><IcTarget size={16} /></span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13.5px] font-bold">{q.title}</span>
                      <span className="text-[11.5px] font-bold uppercase tracking-wider text-ink-2/55 dark:text-pine-200/45">{q.questions.length} questions · {q.timeLimitMin} min</span>
                    </span>
                  </Link>
                ))}
                {upcoming.length === 0 && quizList.length === 0 && <p className="px-1 py-2 text-[13px] font-semibold text-ink-2/60 dark:text-pine-200/50">Nothing due — enjoy the calm (or get ahead!).</p>}
              </div>
            </section>
          </Reveal>
          <Reveal delay={160}>
            <section className="rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
              <h3 className="font-display text-lg font-bold">Announcements</h3>
              <div className="mt-3 space-y-2.5">
                {announcements.map((a) => (
                  <div key={a.id} className="rounded-lg bg-pine-700/5 px-3.5 py-3 dark:bg-pine-200/6">
                    <p className="text-[13.5px] font-bold">{a.title}</p>
                    <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-ink-2/75 dark:text-pine-200/55">{a.content}</p>
                    <p className="mt-1.5 text-[10.5px] font-extrabold uppercase tracking-wider text-ink-2/50 dark:text-pine-200/40">{timeAgo(a.publishedAt)} · {userById(a.authorId)?.name}</p>
                  </div>
                ))}
                {announcements.length === 0 && <p className="text-[13px] font-semibold text-ink-2/60 dark:text-pine-200/50">No announcements right now.</p>}
              </div>
            </section>
          </Reveal>
          <Reveal delay={220}>
            <section className="rounded-xl border border-sun-500/40 bg-sun-500/8 p-5.5 dark:bg-sun-500/6">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold"><IcPhone size={17} className="text-sun-700 dark:text-sun-400" /> Need Help?</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2 dark:text-pine-200/70">Stuck on a lesson, a payment, or your account? Contact Support — the SSGT team picks up.</p>
              <div className="mt-3.5 space-y-2 text-[13.5px] font-bold">
                <a href={`tel:${db.settings.contactPhone.replace(/\s/g, "")}`} className="flex items-center gap-2.5 rounded-lg bg-white px-3.5 py-2.5 transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-night-800">
                  <span className="shrink-0 text-ink-2/60 dark:text-pine-200/50">Call:</span> {db.settings.contactPhone}
                </a>
                <a href={`mailto:${db.settings.contactEmail}`} className="flex items-center gap-2.5 rounded-lg bg-white px-3.5 py-2.5 transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-night-800">
                  <span className="shrink-0 text-ink-2/60 dark:text-pine-200/50">Email:</span> <span className="break-all">{db.settings.contactEmail}</span>
                </a>
              </div>
            </section>
          </Reveal>
        </div>
      </div>

      {/* recent results + achievements */}
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Reveal>
          <section className="rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Recent results</h3>
              <Link to="/app/results" className="link-sweep text-[13px] font-extrabold text-sun-700 dark:text-sun-400">All results</Link>
            </div>
            {results.length === 0 ? (
              <p className="mt-4 text-[13px] font-semibold text-ink-2/60 dark:text-pine-200/50">No results released yet — complete a quiz or assignment to see marks here.</p>
            ) : (
              <div className="mt-3.5 overflow-x-auto">
                <table className="w-full min-w-105 text-left text-[13px]">
                  <thead><tr className="border-b border-pine-700/10 text-[11px] font-extrabold uppercase tracking-wider text-ink-2/55 dark:border-pine-200/10 dark:text-pine-200/45">
                    <th className="py-2 pr-3">Assessment</th><th className="py-2 pr-3">Subject</th><th className="py-2 pr-3">Score</th><th className="py-2">Grade</th></tr></thead>
                  <tbody>
                    {results.map((r) => (
                      <tr key={r.id} className="border-b border-pine-700/6 last:border-0 dark:border-pine-200/6">
                        <td className="py-2.5 pr-3 font-bold">{r.assessment}</td>
                        <td className="py-2.5 pr-3 text-ink-2 dark:text-pine-200/70">{subjectName(r.subjectId)}</td>
                        <td className="py-2.5 pr-3 font-bold">{r.score}/{r.maxScore} <span className="text-ink-2/50 dark:text-pine-200/40">({Math.round((r.score / r.maxScore) * 100)}%)</span></td>
                        <td className="py-2.5"><Badge tone={r.score / r.maxScore >= 0.7 ? "pine" : r.score / r.maxScore >= 0.5 ? "sun" : "clay"}>{gradeLetter(r.score / r.maxScore * 100)}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </Reveal>
        <Reveal delay={120}>
          <section className="rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold"><IcAward size={18} className="text-sun-600 dark:text-sun-400" /> Achievements</h3>
              <Link to="/app/progress" className="link-sweep text-[13px] font-extrabold text-sun-700 dark:text-sun-400">View all</Link>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {db.achievementDefs.map((d) => {
                const got = db.earned.some((e) => e.studentId === user.id && e.defId === d.id);
                return (
                  <div key={d.id} title={`${d.name} — ${d.description}`} className={cx("flex flex-col items-center rounded-lg border px-2 py-3 text-center transition-all",
                    got ? "border-sun-500/50 bg-sun-500/10" : "border-pine-700/8 opacity-45 grayscale dark:border-pine-200/8")}>
                    <IcSpark size={20} className={got ? "text-sun-600 dark:text-sun-400" : ""} />
                    <span className="mt-1.5 text-[10.5px] font-black leading-tight">{d.name}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
const gradeLetter = (p: number) => p >= 80 ? "A" : p >= 75 ? "A-" : p >= 70 ? "B+" : p >= 65 ? "B" : p >= 60 ? "B-" : p >= 55 ? "C+" : p >= 50 ? "C" : p >= 45 ? "C-" : p >= 40 ? "D+" : "D";

/* ── My courses ──────────────────────────────────────────────────────────── */
export function MyCoursesPage() {
  const { db, user } = useApp();
  const [tab, setTab] = useState("active");
  if (!user) return null;
  const ens = myEnrollments(user.id, db);
  const shown = ens.filter((e) => tab === "all" ? true : e.status === tab);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs tabs={[{ id: "active", label: "In progress", count: ens.filter((e) => e.status === "active").length }, { id: "completed", label: "Completed", count: ens.filter((e) => e.status === "completed").length }, { id: "pending", label: "Pending", count: ens.filter((e) => e.status === "pending").length }, { id: "all", label: "All", count: ens.length }]} active={tab} onChange={setTab} />
        <Link to="/courses"><Btn variant="outline" size="sm">Browse catalogue <IcArrowR size={14} /></Btn></Link>
      </div>
      {shown.length === 0 ? (
        <div className="mt-8"><Empty icon={<IcBookOpen size={26} />} title="Nothing here yet" body="Courses you enrol in will appear here with live progress bars." action={<Link to="/courses"><Btn>Explore courses</Btn></Link>} /></div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((e) => {
            const c = courseById(e.courseId); if (!c) return null;
            const p = courseProgress(user.id, c.id);
            return (
              <div key={e.id} className="lift group overflow-hidden rounded-xl border border-pine-700/10 bg-white shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
                <Link to={e.status === "pending" ? `/courses/${c.id}` : `/app/learn/${c.id}`} className="relative block h-36 overflow-hidden bg-gradient-to-br from-pine-700 to-pine-950">
                  <img src={c.image} alt="" className="h-full w-full object-cover transition-transform duration-[2.5s] group-hover:scale-110" onError={(ev) => { (ev.currentTarget as HTMLImageElement).style.display = "none"; }} />
                  <span className="absolute right-3 top-3"><Badge tone={e.status === "completed" ? "pine" : e.status === "pending" ? "clay" : "sun"} className={cx(e.status === "active" && "bg-sun-500 text-pine-950")}>{e.status}</Badge></span>
                </Link>
                <div className="p-4.5">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-pine-700 dark:text-pine-300">{subjectName(c.subjectId)} · {gradeName(c.gradeId)}</p>
                  <Link to={e.status === "pending" ? `/courses/${c.id}` : `/app/learn/${c.id}`} className="mt-1 line-clamp-2 block font-display text-[15.5px] font-bold hover:text-pine-700 dark:hover:text-sun-400">{c.title}</Link>
                  <div className="mt-3 flex items-center gap-2.5"><Progress value={p.percent} className="flex-1" /><span className="text-[12px] font-black text-pine-700 dark:text-sun-400">{p.percent}%</span></div>
                  <p className="mt-2 text-[11.5px] font-bold text-ink-2/60 dark:text-pine-200/50">{p.done}/{p.total} lessons · enrolled {fmtDate(e.enrolledAt)}</p>
                  {e.status === "pending" && <p className="mt-2 text-[12px] font-bold text-clay-600">Payment pending — open the course to pay.</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Assignments (student) ───────────────────────────────────────────────── */
export function StudentAssignments() {
  const { db, user } = useApp();
  const toast = useToast();
  const [openAsg, setOpenAsg] = useState<Assignment | null>(null);
  const [text, setText] = useState("");
  const [file, setFile] = useState("");
  const [err, setErr] = useState("");
  if (!user) return null;
  const ens = myEnrollments(user.id, db).filter((e) => e.status !== "pending");
  const list = db.assignments.filter((a) => a.active && ens.some((e) => e.courseId === a.courseId)).sort((a, b) => a.dueAt - b.dueAt);
  const subFor = (a: Assignment): Submission | undefined => db.submissions.find((s) => s.assignmentId === a.id && s.studentId === user.id);

  const submit = () => {
    if (!openAsg) return;
    if (text.trim().length < 10 && !file) { setErr("Write your answer (or attach a file) before submitting."); return; }
    const e = submitAssignment(openAsg.id, user.id, text.trim(), file || undefined);
    if (e) { setErr(e); return; }
    toast.push("Assignment submitted — your teacher has been notified.");
    setOpenAsg(null); setText(""); setFile(""); setErr("");
  };

  return (
    <div>
      {list.length === 0 ? <Empty icon={<IcClipboard size={26} />} title="No assignments yet" body="Assignments from your enrolled courses will appear here with due dates." /> : (
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((a, i) => {
            const sub = subFor(a);
            const course = courseById(a.courseId);
            const overdue = a.dueAt < Date.now() && !sub;
            return (
              <Reveal key={a.id} delay={(i % 2) * 80}>
                <div className={cx("flex h-full flex-col rounded-xl border bg-white p-5 shadow-[var(--shadow-card)] dark:bg-night-800", overdue ? "border-clay-500/40" : "border-pine-700/10 dark:border-pine-200/10")}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-2/55 dark:text-pine-200/45">{course?.title}</p>
                      <h3 className="mt-1 font-display text-lg font-bold">{a.title}</h3>
                    </div>
                    {sub ? (sub.status === "graded"
                      ? <Badge tone="pine">Graded · {sub.marks}/{a.maxMarks}</Badge>
                      : <Badge tone="sun">Submitted</Badge>)
                      : overdue ? <Badge tone="clay">Overdue</Badge> : <Badge tone="gray">Due in {daysUntil(a.dueAt)}d</Badge>}
                  </div>
                  <p className="mt-2.5 line-clamp-3 whitespace-pre-line text-[13px] leading-relaxed text-ink-2/85 dark:text-pine-200/65">{a.instructions}</p>
                  <div className="mt-3 flex items-center gap-4 text-[12px] font-bold text-ink-2/60 dark:text-pine-200/50">
                    <span className="flex items-center gap-1.5"><IcCalendar size={14} /> {fmtDate(a.dueAt)}</span>
                    <span className="flex items-center gap-1.5"><IcClipboard size={14} /> {a.maxMarks} marks</span>
                    {a.allowsUpload && <span className="flex items-center gap-1.5"><IcUpload size={14} /> uploads allowed</span>}
                  </div>
                  {sub?.status === "graded" && sub.feedback && (
                    <div className="mt-3.5 rounded-lg border border-pine-700/12 bg-pine-700/5 p-3.5 dark:border-pine-200/12 dark:bg-pine-200/6">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-pine-700 dark:text-pine-300">Teacher feedback</p>
                      <p className="mt-1 text-[13px] leading-relaxed">{sub.feedback}</p>
                    </div>
                  )}
                  <div className="mt-auto pt-4">
                    {sub ? (
                      <Btn variant="outline" size="sm" onClick={() => { setOpenAsg(a); setText(sub.text); setFile(sub.fileName ?? ""); }} className="w-full">View submission</Btn>
                    ) : (
                      <Btn size="sm" onClick={() => { setOpenAsg(a); setText(""); setFile(""); setErr(""); }} className="w-full" disabled={overdue}>
                        {overdue ? "Deadline passed" : "Open & submit"}
                      </Btn>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}

      <Modal open={!!openAsg} onClose={() => setOpenAsg(null)} title={openAsg?.title ?? ""} wide>
        {openAsg && (
          <div>
            <p className="whitespace-pre-line rounded-lg bg-pine-700/5 p-4 text-[13px] leading-relaxed text-ink-2 dark:bg-pine-200/6 dark:text-pine-200/80">{openAsg.instructions}</p>
            <div className="mt-4 flex items-center justify-between text-[12.5px] font-bold text-ink-2/70 dark:text-pine-200/60">
              <span>Due {fmtDate(openAsg.dueAt)} · {openAsg.maxMarks} marks</span>
              {subFor(openAsg) && <Badge tone="sun">{subFor(openAsg)!.status}</Badge>}
            </div>
            {!subFor(openAsg) || subFor(openAsg)!.status === "returned" ? (
              <>
                <div className="mt-4">
                  <Field label="Your answer" error={err}><TextArea rows={7} value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your working / answer here. Show every step — method marks matter!" /></Field>
                </div>
                {openAsg.allowsUpload && (
                  <div className="mt-4">
                    <Field label="Attachment (optional)" hint="Photos or scans of your exercise book — PDF/JPG up to 5 MB.">
                      <div className="flex items-center gap-2">
                        <TextInput value={file} onChange={(e) => setFile(e.target.value)} placeholder="e.g. amina_q5_working.jpg" />
                        <Btn variant="outline" size="sm" onClick={() => setFile(`submission_${user.name.split(" ")[0].toLowerCase()}_${openAsg.id}.jpg`)}><IcUpload size={14} /> Attach</Btn>
                      </div>
                    </Field>
                  </div>
                )}
                <div className="mt-5 flex justify-end gap-2">
                  <Btn variant="ghost" onClick={() => setOpenAsg(null)}>Cancel</Btn>
                  <Btn onClick={submit}><IcCheck size={15} /> Submit for marking</Btn>
                </div>
              </>
            ) : (
              <div className="mt-4">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-2/55 dark:text-pine-200/45">Submitted {fmtDate(subFor(openAsg)!.submittedAt)}</p>
                <p className="mt-2 whitespace-pre-line rounded-lg border border-pine-700/12 p-4 text-[13.5px] leading-relaxed dark:border-pine-200/12">{subFor(openAsg)!.text}</p>
                {subFor(openAsg)!.fileName && <p className="mt-2 flex items-center gap-1.5 text-[12.5px] font-bold text-ink-2/70 dark:text-pine-200/60"><IcFileText size={14} /> {subFor(openAsg)!.fileName}</p>}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ── Quizzes (student) ───────────────────────────────────────────────────── */
export function StudentQuizzes() {
  const { db, user } = useApp();
  if (!user) return null;
  const ens = myEnrollments(user.id, db).filter((e) => e.status !== "pending");
  const quizzes = db.quizzes.filter((q) => q.active && ens.some((e) => e.courseId === q.courseId));
  const attempts = db.attempts.filter((a) => a.studentId === user.id).sort((a, b) => b.submittedAt - a.submittedAt);
  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <section>
        <h3 className="font-display text-lg font-bold">Available quizzes</h3>
        <div className="mt-4 space-y-3.5">
          {quizzes.length === 0 && <Empty icon={<IcTarget size={26} />} title="No quizzes yet" body="Quizzes appear when you enrol in assessed courses." />}
          {quizzes.map((q) => {
            const mine = db.attempts.filter((a) => a.quizId === q.id && a.studentId === user.id);
            const best = mine.length ? Math.max(...mine.map((a) => a.percent)) : null;
            const left = q.maxAttempts - mine.length;
            return (
              <div key={q.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-pine-700/10 bg-white p-4.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-sun-500/15 text-sun-700 dark:text-sun-400"><IcTarget size={22} /></span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[15.5px] font-bold">{q.title}</p>
                  <p className="mt-0.5 text-[12px] font-bold text-ink-2/60 dark:text-pine-200/50">
                    {courseById(q.courseId)?.title} · {q.questions.length} questions · {q.timeLimitMin} min · pass {q.passingPercent}%
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {best !== null && <Badge tone={best >= q.passingPercent ? "pine" : "clay"}>Best: {best}%</Badge>}
                    <Badge tone={left > 0 ? "gray" : "clay"}>{left > 0 ? `${left} attempt${left === 1 ? "" : "s"} left` : "No attempts left"}</Badge>
                  </div>
                </div>
                <Link to={`/app/quiz/${q.id}`}><Btn size="sm" variant={left > 0 ? "primary" : "outline"}>{left > 0 ? (mine.length ? "Retake" : "Start") : "Review"}</Btn></Link>
              </div>
            );
          })}
        </div>
      </section>
      <section>
        <h3 className="font-display text-lg font-bold">Attempt history</h3>
        <div className="mt-4 space-y-2.5">
          {attempts.length === 0 && <p className="text-[13px] font-semibold text-ink-2/60 dark:text-pine-200/50">No attempts yet.</p>}
          {attempts.map((a) => {
            const q = db.quizzes.find((x) => x.id === a.quizId);
            return (
              <Link to={`/app/quiz/${a.quizId}`} key={a.id} className="flex items-center gap-3.5 rounded-xl border border-pine-700/8 bg-white px-4 py-3 transition-colors hover:border-sun-500/50 dark:border-pine-200/8 dark:bg-night-800">
                <span className={cx("grid h-10 w-10 shrink-0 place-items-center rounded-lg font-display text-[13px] font-black", a.passed ? "bg-pine-700/10 text-pine-700 dark:bg-pine-200/10 dark:text-pine-300" : "bg-clay-500/12 text-clay-600")}>{a.percent}%</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-bold">{q?.title}</span>
                  <span className="text-[11.5px] font-bold text-ink-2/55 dark:text-pine-200/45">{a.score}/{a.total} · {Math.floor(a.timeSpentSec / 60)}m {a.timeSpentSec % 60}s · {fmtDate(a.submittedAt)}</span>
                </span>
                <Badge tone={a.passed ? "pine" : "clay"}>{a.passed ? "Pass" : "Fail"}</Badge>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/* ── Results table (shared with parents) ─────────────────────────────────── */
export function ResultsTable({ studentId, compact = false }: { studentId: string; compact?: boolean }) {
  const { db } = useApp();
  const results = db.results.filter((r) => r.studentId === studentId).sort((a, b) => b.date - a.date);
  if (results.length === 0) return <Empty icon={<IcSearch size={24} />} title="No results yet" body="Released results and graded assignments will appear here." />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-130 text-left text-[13px]">
        <thead><tr className="border-b-2 border-pine-700/15 text-[11px] font-extrabold uppercase tracking-wider text-ink-2/60 dark:border-pine-200/15 dark:text-pine-200/50">
          <th className="py-2.5 pr-3">Date</th><th className="py-2.5 pr-3">Subject</th><th className="py-2.5 pr-3">Assessment</th>
          <th className="py-2.5 pr-3">Score</th><th className="py-2.5 pr-3">%</th><th className="py-2.5 pr-3">Grade</th>{!compact && <th className="py-2.5">Comment</th>}</tr></thead>
        <tbody>
          {results.map((r) => {
            const pct = Math.round((r.score / r.maxScore) * 100);
            return (
              <tr key={r.id} className="border-b border-pine-700/6 transition-colors last:border-0 hover:bg-pine-700/3 dark:border-pine-200/6 dark:hover:bg-pine-200/4">
                <td className="py-3 pr-3 whitespace-nowrap font-semibold text-ink-2 dark:text-pine-200/70">{fmtDate(r.date)}</td>
                <td className="py-3 pr-3 font-bold">{subjectName(r.subjectId)}</td>
                <td className="py-3 pr-3 font-bold">{r.assessment}<span className="block text-[11px] font-semibold text-ink-2/55 dark:text-pine-200/45">{r.term}</span></td>
                <td className="py-3 pr-3 font-bold">{r.score}/{r.maxScore}</td>
                <td className="py-3 pr-3 font-bold">{pct}%</td>
                <td className="py-3 pr-3"><Badge tone={pct >= 70 ? "pine" : pct >= 50 ? "sun" : "clay"}>{gradeLetter(pct)}</Badge></td>
                {!compact && <td className="max-w-60 py-3 text-[12.5px] leading-relaxed text-ink-2/85 dark:text-pine-200/65">{r.comment}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function StudentResults() {
  const { db, user } = useApp();
  if (!user) return null;
  const results = db.results.filter((r) => r.studentId === user.id);
  const pcts = results.map((r) => (r.score / r.maxScore) * 100);
  const avg = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0;
  const bySubject = [...new Set(results.map((r) => r.subjectId))].map((sid) => {
    const rs = results.filter((r) => r.subjectId === sid).map((r) => (r.score / r.maxScore) * 100);
    return { label: subjectName(sid), value: Math.round(rs.reduce((a, b) => a + b, 0) / rs.length) };
  });
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Stat icon={<IcTrend size={19} />} label="Average" value={`${avg}%`} sub={gradeLetter(avg)} />
        <Stat icon={<IcCheckC size={19} />} label="Highest" value={pcts.length ? `${Math.round(Math.max(...pcts))}%` : "—"} tone="sun" />
        <Stat icon={<IcClipboard size={19} />} label="Lowest" value={pcts.length ? `${Math.round(Math.min(...pcts))}%` : "—"} tone="clay" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Reveal><section className="rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <h3 className="font-display text-lg font-bold">All results</h3>
          <div className="mt-3"><ResultsTable studentId={user.id} /></div>
        </section></Reveal>
        <Reveal delay={120}><section className="h-fit rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <h3 className="font-display text-lg font-bold">Subject performance</h3>
          <div className="mt-4"><HBars data={bySubject.map((s) => ({ ...s, value: s.value }))} format={(v) => `${v}%`} /></div>
        </section></Reveal>
      </div>
    </div>
  );
}

/* ── Progress ────────────────────────────────────────────────────────────── */
export function ProgressPage() {
  const { db, user } = useApp();
  const userId = user?.id ?? "";
  const series = useMemo(() => {
    const out: number[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setHours(0, 0, 0, 0); const start = d.getTime() - i * 86400000;
      out.push(db.lessonProgress.filter((p) => p.studentId === userId && p.completedAt >= start && p.completedAt < start + 86400000).length);
    }
    return out;
  }, [db, userId]);
  if (!user) return null;
  const ens = myEnrollments(user.id, db).filter((e) => e.status !== "pending");
  const all = ens.flatMap((e) => lessonsOf(e.courseId));
  const done = all.filter((l) => db.lessonProgress.some((p) => p.studentId === user.id && p.lessonId === l.id));
  const overall = all.length ? Math.round((done.length / all.length) * 100) : 0;
  const labels = Array.from({ length: 14 }, (_, i) => { const d = new Date(Date.now() - (13 - i) * 86400000); return d.toLocaleDateString("en-KE", { day: "numeric" }); });

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <Reveal><section className="flex flex-col items-center rounded-xl border border-pine-700/10 bg-white p-6 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <Donut value={overall} size={150} stroke={14} sub="complete" />
          <p className="mt-4 text-center text-[13.5px] font-bold text-ink-2 dark:text-pine-200/70">{done.length} of {all.length} enrolled lessons completed</p>
          <div className="mt-5 grid w-full grid-cols-2 gap-3">
            <div className="rounded-lg bg-pine-700/6 px-3 py-2.5 text-center dark:bg-pine-200/8"><p className="font-display text-lg font-black text-pine-800 dark:text-pine-200">{ens.filter((e) => e.status === "completed").length}</p><p className="text-[10.5px] font-extrabold uppercase tracking-wider text-ink-2/60 dark:text-pine-200/50">courses finished</p></div>
            <div className="rounded-lg bg-sun-500/10 px-3 py-2.5 text-center"><p className="font-display text-lg font-black text-sun-700 dark:text-sun-400">{db.earned.filter((e) => e.studentId === user.id).length}</p><p className="text-[10.5px] font-extrabold uppercase tracking-wider text-ink-2/60 dark:text-pine-200/50">badges earned</p></div>
          </div>
        </section></Reveal>
        <Reveal delay={100}><section className="rounded-xl border border-pine-700/10 bg-white p-6 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <h3 className="font-display text-lg font-bold">Lessons per day — last 14 days</h3>
          <div className="mt-4"><Line points={series} labels={labels} height={170} /></div>
        </section></Reveal>
      </div>
      <Reveal><section className="rounded-xl border border-pine-700/10 bg-white p-6 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
        <h3 className="font-display text-lg font-bold">Course progress</h3>
        <div className="mt-4 space-y-4">
          {ens.map((e) => {
            const c = courseById(e.courseId); if (!c) return null;
            const p = courseProgress(user.id, c.id);
            return (
              <div key={e.id}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <Link to={`/app/learn/${c.id}`} className="truncate font-display text-[15px] font-bold hover:text-pine-700 dark:hover:text-sun-400">{c.title}</Link>
                  <span className="shrink-0 text-[12.5px] font-black text-pine-700 dark:text-sun-400">{p.done}/{p.total} · {p.percent}%</span>
                </div>
                <Progress value={p.percent} color={p.percent === 100 ? "var(--color-sun-500)" : "var(--color-pine-600)"} />
              </div>
            );
          })}
          {ens.length === 0 && <p className="text-[13px] font-semibold text-ink-2/60 dark:text-pine-200/50">Enrol in a course to start tracking progress.</p>}
        </div>
      </section></Reveal>
      <Reveal><section className="rounded-xl border border-pine-700/10 bg-white p-6 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold"><IcAward size={18} className="text-sun-600 dark:text-sun-400" /> Badges & milestones</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {db.achievementDefs.map((d) => {
            const e = db.earned.find((x) => x.studentId === user.id && x.defId === d.id);
            return (
              <div key={d.id} className={cx("flex items-start gap-3.5 rounded-xl border p-4 transition-all", e ? "border-sun-500/50 bg-sun-500/8" : "border-pine-700/8 opacity-50 grayscale dark:border-pine-200/8")}>
                <span className={cx("grid h-11 w-11 shrink-0 place-items-center rounded-xl", e ? "bg-sun-500 text-pine-950" : "bg-ink/8 dark:bg-pine-200/10")}><IcAward size={20} /></span>
                <span>
                  <span className="block font-display text-[14.5px] font-bold">{d.name}</span>
                  <span className="mt-0.5 block text-[12px] leading-relaxed text-ink-2/75 dark:text-pine-200/55">{d.description}</span>
                  {e && <span className="mt-1 block text-[10.5px] font-extrabold uppercase tracking-wider text-sun-700 dark:text-sun-400">Earned {fmtDate(e.earnedAt)}</span>}
                </span>
              </div>
            );
          })}
        </div>
      </section></Reveal>
    </div>
  );
}

/* ── Bookmarks ───────────────────────────────────────────────────────────── */
export function BookmarksPage() {
  const { db, user } = useApp();
  const toast = useToast();
  if (!user) return null;
  const marks = db.bookmarks.filter((b) => b.userId === user.id).sort((a, b) => b.createdAt - a.createdAt);
  return (
    <div>
      {marks.length === 0 ? <Empty icon={<IcBookmark size={26} />} title="No bookmarks yet" body="Tap the bookmark icon on any lesson or resource to save it here for quick revision." /> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {marks.map((b) => {
            if (b.type === "lesson") {
              const l = lessonById(b.refId); if (!l) return null;
              const c = courseById(l.courseId);
              return (
                <div key={b.id} className="lift flex flex-col rounded-xl border border-pine-700/10 bg-white p-5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
                  <div className="flex items-center justify-between">
                    <Badge tone="pine"><IcVideo size={11} /> lesson</Badge>
                    <button onClick={() => { toggleBookmark(user.id, "lesson", b.refId); toast.push("Bookmark removed", "info"); }} aria-label="Remove bookmark" className="cursor-pointer rounded-md p-1 text-sun-600 transition-transform hover:scale-110 dark:text-sun-400"><IcBookmark size={16} filled /></button>
                  </div>
                  <Link to={`/app/learn/${l.courseId}/${l.id}`} className="mt-3 font-display text-[15.5px] font-bold leading-snug hover:text-pine-700 dark:hover:text-sun-400">{l.title}</Link>
                  <p className="mt-1 text-[12px] font-bold text-ink-2/60 dark:text-pine-200/50">{c?.title}</p>
                  <p className="mt-1.5 text-[11.5px] font-bold uppercase tracking-wider text-ink-2/45 dark:text-pine-200/35">Saved {timeAgo(b.createdAt)}</p>
                </div>
              );
            }
            const r = db.resources.find((x) => x.id === b.refId); if (!r) return null;
            return (
              <div key={b.id} className="lift flex flex-col rounded-xl border border-pine-700/10 bg-white p-5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
                <div className="flex items-center justify-between">
                  <Badge tone="sun" className="capitalize">{r.kind.replace("-", " ")}</Badge>
                  <button onClick={() => { toggleBookmark(user.id, "resource", b.refId); toast.push("Bookmark removed", "info"); }} aria-label="Remove bookmark" className="cursor-pointer rounded-md p-1 text-sun-600 transition-transform hover:scale-110 dark:text-sun-400"><IcBookmark size={16} filled /></button>
                </div>
                <Link to="/app/resources" className="mt-3 font-display text-[15.5px] font-bold leading-snug hover:text-pine-700 dark:hover:text-sun-400">{r.title}</Link>
                <p className="mt-1 text-[12px] font-bold text-ink-2/60 dark:text-pine-200/50">{subjectName(r.subjectId)} · {gradeName(r.gradeId)}</p>
                <p className="mt-1.5 text-[11.5px] font-bold uppercase tracking-wider text-ink-2/45 dark:text-pine-200/35">Saved {timeAgo(b.createdAt)}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Notifications ───────────────────────────────────────────────────────── */
export function NotificationsPage() {
  const { db, user } = useApp();
  const nav = useNavigate();
  const [tab, setTab] = useState("all");
  if (!user) return null;
  const all = db.notifications.filter((n) => n.userId === user.id);
  const shown = tab === "unread" ? all.filter((n) => !n.read) : all;
  const kindIcon: Record<string, React.ReactNode> = { course: <IcBookOpen size={16} />, assignment: <IcClipboard size={16} />, quiz: <IcTarget size={16} />, result: <IcCheckC size={16} />, payment: <IcMoney size={16} />, announcement: <IcMail size={16} />, system: <IcSpark size={16} /> };
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs tabs={[{ id: "all", label: "All", count: all.length }, { id: "unread", label: "Unread", count: all.filter((n) => !n.read).length }]} active={tab} onChange={setTab} />
        {all.some((n) => !n.read) && <Btn variant="outline" size="sm" onClick={() => markAllRead(user.id)}>Mark all as read</Btn>}
      </div>
      {shown.length === 0 ? <div className="mt-8"><Empty icon={<IcMail size={26} />} title="Inbox zero" body="You're all caught up. New course activity, results and announcements will land here." /></div> : (
        <div className="mt-6 space-y-2.5">
          {shown.map((n) => (
            <button key={n.id} onClick={() => { markRead(n.id); if (n.link) nav(n.link); }}
              className={cx("flex w-full cursor-pointer items-start gap-4 rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-night-800",
                n.read ? "border-pine-700/8 bg-white dark:border-pine-200/8" : "border-sun-500/40 bg-sun-500/6")}>
              <span className={cx("grid h-10 w-10 shrink-0 place-items-center rounded-lg", n.read ? "bg-pine-700/8 text-pine-700 dark:bg-pine-200/10 dark:text-pine-300" : "bg-sun-500 text-pine-950")}>{kindIcon[n.kind] ?? <IcSpark size={16} />}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-3"><span className="font-display text-[15px] font-bold">{n.title}</span><span className="shrink-0 text-[11px] font-extrabold uppercase tracking-wider text-ink-2/50 dark:text-pine-200/40">{timeAgo(n.createdAt)}</span></span>
                <span className="mt-1 block text-[13px] leading-relaxed text-ink-2/85 dark:text-pine-200/65">{n.body}</span>
              </span>
              {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sun-500" aria-label="Unread" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Profile & settings ──────────────────────────────────────────────────── */
const AV_COLORS = ["#0C5A43", "#B56508", "#C4562E", "#1F6A50", "#8F4D0D", "#357E62", "#A84625", "#083528"];
export function ProfilePage() {
  const { db, user } = useApp();
  const toast = useToast();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [color, setColor] = useState(user?.color ?? AV_COLORS[0]);
  const [cur, setCur] = useState(""); const [next, setNext] = useState(""); const [conf, setConf] = useState("");
  const [pwErr, setPwErr] = useState("");
  if (!user) return null;
  const parent = db.users.find((u) => u.role === "parent" && u.linkedStudentIds?.includes(user.id));

  const saveProfile = () => {
    if (name.trim().length < 3) { toast.push("Name must be at least 3 characters.", "err"); return; }
    updateProfile(user.id, { name: name.trim(), phone, color });
    toast.push("Profile updated.");
  };
  const savePw = () => {
    setPwErr("");
    if (next !== conf) { setPwErr("New passwords do not match."); return; }
    const e = changePassword(user.id, cur, next);
    if (e) { setPwErr(e); return; }
    setCur(""); setNext(""); setConf("");
    toast.push("Password changed successfully.");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Reveal><section className="rounded-xl border border-pine-700/10 bg-white p-6 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
        <h3 className="font-display text-lg font-bold">Profile</h3>
        <div className="mt-5 flex items-center gap-4">
          <Avatar name={name || user.name} color={color} size={64} />
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Avatar colour">
            {AV_COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)} role="radio" aria-checked={color === c} aria-label={`Colour ${c}`}
                className={cx("h-7 w-7 cursor-pointer rounded-full transition-transform hover:scale-110", color === c && "ring-2 ring-sun-500 ring-offset-2 ring-offset-paper dark:ring-offset-night-800")} style={{ background: c }} />
            ))}
          </div>
        </div>
        <div className="mt-5 space-y-4">
          <Field label="Full name"><TextInput value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Phone"><TextInput value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 7XX XXX XXX" /></Field>
          <Field label="Email" hint="Email is your login and cannot be changed here."><TextInput value={user.email} disabled className="opacity-60" /></Field>
          {user.role === "student" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-pine-700/6 px-3.5 py-2.5 dark:bg-pine-200/8"><p className="text-[10.5px] font-extrabold uppercase tracking-wider text-ink-2/55 dark:text-pine-200/45">Student code</p><p className="font-mono text-[15px] font-black text-pine-800 dark:text-pine-200">{user.studentCode}</p></div>
              <div className="rounded-lg bg-pine-700/6 px-3.5 py-2.5 dark:bg-pine-200/8"><p className="text-[10.5px] font-extrabold uppercase tracking-wider text-ink-2/55 dark:text-pine-200/45">Grade</p><p className="text-[15px] font-black text-pine-800 dark:text-pine-200">{gradeName(user.gradeId ?? "")}</p></div>
            </div>
          )}
          {user.role === "student" && parent && <p className="text-[12.5px] font-semibold text-ink-2/70 dark:text-pine-200/60">Linked guardian: <strong>{parent.name}</strong> ({parent.email})</p>}
          <Btn onClick={saveProfile}>Save profile</Btn>
          {user.role === "student" && <p className="flex items-start gap-2 rounded-lg bg-pine-700/5 p-3 text-[11.5px] leading-relaxed text-ink-2/70 dark:bg-pine-200/6 dark:text-pine-200/55"><IcLock size={13} className="mt-0.5 shrink-0" /> Academic records (results, enrolments, codes) are protected and can only be changed by teachers or administrators.</p>}
        </div>
      </section></Reveal>
      <div className="space-y-6">
        <Reveal delay={100}><section className="rounded-xl border border-pine-700/10 bg-white p-6 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <h3 className="font-display text-lg font-bold">Change password</h3>
          <div className="mt-4 space-y-3.5">
            <Field label="Current password"><TextInput type="password" value={cur} onChange={(e) => setCur(e.target.value)} autoComplete="current-password" /></Field>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label="New password"><TextInput type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" /></Field>
              <Field label="Confirm new"><TextInput type="password" value={conf} onChange={(e) => setConf(e.target.value)} autoComplete="new-password" /></Field>
            </div>
            {pwErr && <p className="text-[13px] font-bold text-clay-600">{pwErr}</p>}
            <Btn onClick={savePw} disabled={!cur || !next}>Update password</Btn>
          </div>
        </section></Reveal>
        <Reveal delay={160}><section className="rounded-xl border border-pine-700/10 bg-white p-6 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <h3 className="font-display text-lg font-bold">Notification preferences</h3>
          <div className="mt-4 space-y-3.5">
            {([["notifyEmail", "Email notifications", "Results, receipts and important announcements"], ["notifyPush", "In-app notifications", "Assignment reminders and quiz availability"]] as const).map(([key, t, b]) => (
              <div key={key} className="flex items-center justify-between gap-4 rounded-lg border border-pine-700/8 px-4 py-3 dark:border-pine-200/8">
                <div><p className="text-[14px] font-bold">{t}</p><p className="text-[12px] text-ink-2/70 dark:text-pine-200/55">{b}</p></div>
                <ToggleSwitch on={!!user[key]} onChange={(v) => { updateProfile(user.id, { [key]: v }); toast.push(`Preference saved.`, "info"); }} label={t} />
              </div>
            ))}
            <p className="text-[11.5px] leading-relaxed text-ink-2/60 dark:text-pine-200/45">Theme preference lives in the sun/moon toggle in the top bar — it is saved to this device automatically.</p>
          </div>
        </section></Reveal>
      </div>
    </div>
  );
}
import { Toggle as ToggleSwitch } from "../components/ui";
