--- src/pages/parent.tsx (原始)
import { useState } from "react";
import { Link } from "react-router-dom";
import { courseById, courseProgress, gradeName, lessonsOf, linkChild, subjectName, useApp, userById } from "../lib/db";
import { Avatar, Badge, Btn, Empty, Field, Modal, Progress, Reveal, Stat, TextInput, cx, fmtDate, ksh, timeAgo, useToast } from "../components/ui";
import { Donut, HBars } from "../components/charts";
import { IcBookOpen, IcCalendar, IcCap, IcCheckC, IcClipboard, IcLink, IcMoney, IcPlus, IcTrend, IcUsers } from "../components/icons";
import { ResultsTable } from "./student";

function useChildren() {
  const { db, user } = useApp();
  return (user?.linkedStudentIds ?? []).map((id) => userById(id)).filter((u): u is NonNullable<typeof u> => !!u && u.active);
}

/* ── Parent dashboard ────────────────────────────────────────────────────── */
export function ParentDashboard() {
  const { db, user } = useApp();
  const children = useChildren();
  const [sel, setSel] = useState(0);
  const child = children[Math.min(sel, children.length - 1)];

  if (!user) return null;
  if (children.length === 0) {
    return (
      <Empty icon={<IcUsers size={26} />} title="Link your first learner"
        body="Ask your child for their SSGT student code (it looks like SSGT-1001 — they'll find it under Profile). Enter it under My Children to start seeing progress, grades and payments."
        action={<Link to="/app/children"><Btn><IcLink size={15} /> Link a learner</Btn></Link>} />
    );
  }

  const ens = db.enrollments.filter((e) => e.studentId === child.id && e.status !== "pending");
  const allLessons = ens.flatMap((e) => lessonsOf(e.courseId));
  const done = allLessons.filter((l) => db.lessonProgress.some((p) => p.studentId === child.id && p.lessonId === l.id));
  const overall = allLessons.length ? Math.round((done.length / allLessons.length) * 100) : 0;
  const results = db.results.filter((r) => r.studentId === child.id);
  const avg = results.length ? Math.round(results.reduce((n, r) => n + (r.score / r.maxScore) * 100, 0) / results.length) : 0;
  const due = db.assignments.filter((a) => ens.some((e) => e.courseId === a.courseId) && a.dueAt > Date.now() && !db.submissions.some((s) => s.assignmentId === a.id && s.studentId === child.id));
  const bySubject = [...new Set(results.map((r) => r.subjectId))].map((sid) => {
    const rs = results.filter((r) => r.subjectId === sid);
    return { label: subjectName(sid), value: Math.round(rs.reduce((n, r) => n + (r.score / r.maxScore) * 100, 0) / rs.length) };
  });
  const latestResult = [...results].sort((a, b) => b.date - a.date)[0];

  return (
    <div className="space-y-6">
      {/* child switcher */}
      <div className="flex flex-wrap items-center gap-2.5">
        {children.map((c, i) => (
          <button key={c.id} onClick={() => setSel(i)} aria-pressed={i === Math.min(sel, children.length - 1)}
            className={cx("flex cursor-pointer items-center gap-2.5 rounded-xl border-[1.5px] px-3.5 py-2 transition-all",
              i === Math.min(sel, children.length - 1) ? "border-pine-700 bg-pine-700 text-paper shadow-md dark:border-sun-500 dark:bg-sun-500 dark:text-pine-950" : "border-pine-700/15 bg-white hover:border-pine-700/50 dark:border-pine-200/15 dark:bg-night-800")}>
            <Avatar name={c.name} color={c.color} size={30} />
            <span className="text-left">
              <span className="block text-[13px] font-black leading-tight">{c.name}</span>
              <span className={cx("text-[10.5px] font-extrabold uppercase tracking-wider", i === Math.min(sel, children.length - 1) ? "opacity-75" : "text-ink-2/55 dark:text-pine-200/45")}>{gradeName(c.gradeId ?? "")}</span>
            </span>
          </button>
        ))}
        <Link to="/app/children"><Btn variant="outline" size="sm"><IcPlus size={14} /> Link another</Btn></Link>
      </div>

      {/* banner */}
      <Reveal>
        <div className="board-bg noise relative overflow-hidden rounded-2xl p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-sun-400">Parent view · {child.studentCode}</p>
              <h2 className="mt-2 font-display text-3xl font-black text-paper">{child.name.split(" ")[0]} is {overall >= 60 ? "on a roll" : overall >= 30 ? "finding a rhythm" : "just warming up"} 📚</h2>
              <p className="mt-2 max-w-xl text-[14px] text-pine-100/75">
                {done.length} of {allLessons.length} lessons complete across {ens.length} course{ens.length === 1 ? "" : "s"}
                {due.length > 0 && <> · <strong className="text-sun-400">{due.length} assignment{due.length > 1 ? "s" : ""} due</strong> this week</>}
                {latestResult && <> · latest mark: <strong className="text-sun-400">{latestResult.score}/{latestResult.maxScore}</strong> ({latestResult.assessment})</>}.
              </p>
            </div>
            <Donut value={overall} size={116} stroke={12} sub="complete" />
          </div>
        </div>
      </Reveal>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={<IcBookOpen size={19} />} label="Active courses" value={ens.filter((e) => e.status === "active").length} sub={`${ens.filter((e) => e.status === "completed").length} completed`} />
        <Stat icon={<IcTrend size={19} />} label="Average score" value={results.length ? `${avg}%` : "—"} sub={`${results.length} results released`} tone="sun" />
        <Stat icon={<IcCalendar size={19} />} label="Tasks due" value={due.length} sub={due.length ? "this week" : "all clear"} tone={due.length ? "clay" : "pine"} />
        <Stat icon={<IcMoney size={19} />} label="Payments" value={db.payments.filter((p) => p.studentId === child.id && p.status === "completed").length} sub="receipts available" tone="night" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Reveal><section className="rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <h3 className="font-display text-lg font-bold">Course progress</h3>
          <div className="mt-4 space-y-4">
            {ens.map((e) => {
              const c = courseById(e.courseId); if (!c) return null;
              const p = courseProgress(child.id, c.id);
              return (
                <div key={e.id}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <span className="truncate font-display text-[14.5px] font-bold">{c.title}</span>
                    <span className="flex shrink-0 items-center gap-2 text-[12px] font-black text-pine-700 dark:text-sun-400">{e.status === "completed" && <IcCheckC size={13} />} {p.percent}%</span>
                  </div>
                  <Progress value={p.percent} color={p.percent === 100 ? "var(--color-sun-500)" : "var(--color-pine-600)"} />
                </div>
              );
            })}
            {ens.length === 0 && <p className="text-[13px] font-semibold text-ink-2/60 dark:text-pine-200/50">{child.name.split(" ")[0]} hasn't enrolled in any courses yet.</p>}
          </div>
        </section></Reveal>
        <Reveal delay={120}><section className="h-fit rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <h3 className="font-display text-lg font-bold">Subject averages</h3>
          <div className="mt-4">{bySubject.length ? <HBars data={bySubject} format={(v) => `${v}%`} /> : <p className="text-[13px] font-semibold text-ink-2/60 dark:text-pine-200/50">No results yet.</p>}</div>
        </section></Reveal>
      </div>

      <Reveal><section className="rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
        <h3 className="font-display text-lg font-bold">Recent results</h3>
        <div className="mt-3"><ResultsTable studentId={child.id} compact /></div>
      </section></Reveal>
    </div>
  );
}

/* ── Link children page ──────────────────────────────────────────────────── */
export function ParentChildren() {
  const { user } = useApp();
  const children = useChildren();
  const toast = useToast();
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");

  const link = () => {
    if (!user) return;
    const e = linkChild(user.id, code);
    if (e) { setErr(e); return; }
    setErr(""); setCode("");
    toast.push("Learner linked — their progress is now visible on your dashboard.");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      <Reveal><section className="h-fit rounded-xl border border-pine-700/10 bg-white p-6 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold"><IcLink size={18} className="text-sun-600 dark:text-sun-400" /> Link a learner</h3>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-2 dark:text-pine-200/70">Enter your child's student code. They'll find it on their Profile page — it looks like <code className="rounded bg-pine-700/10 px-1.5 py-0.5 font-mono text-[12px] font-black dark:bg-pine-200/10">SSGT-1001</code>. Linking requires their account to be active, and both of you get a notification.</p>
        <div className="mt-4">
          <Field label="Student code" error={err}>
            <div className="flex gap-2">
              <TextInput value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setErr(""); }} placeholder="SSGT-1001" className="font-mono uppercase" />
              <Btn onClick={link} disabled={code.trim().length < 4}>Link</Btn>
            </div>
          </Field>
        </div>
        <p className="mt-4 rounded-lg bg-pine-700/5 p-3 text-[11.5px] leading-relaxed text-ink-2/70 dark:bg-pine-200/6 dark:text-pine-200/55">Privacy: you'll see this learner's courses, progress, results and payments — and nothing else on the platform. Learners can see which guardian is linked.</p>
      </section></Reveal>
      <section>
        <h3 className="font-display text-lg font-bold">Linked learners</h3>
        <div className="mt-4 space-y-3.5">
          {children.length === 0 && <Empty icon={<IcUsers size={24} />} title="No learners linked" body="Link a learner with their student code to unlock the parent dashboard." />}
          {children.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-pine-700/10 bg-white p-4.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
              <Avatar name={c.name} color={c.color} size={48} />
              <div className="min-w-0 flex-1">
                <p className="font-display text-[16px] font-bold">{c.name}</p>
                <p className="text-[12.5px] font-bold text-ink-2/60 dark:text-pine-200/50">{gradeName(c.gradeId ?? "")} · <span className="font-mono">{c.studentCode}</span> · {c.email}</p>
              </div>
              <Link to="/app/dashboard"><Btn size="sm" variant="outline">View progress <IcTrend size={14} /></Btn></Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ── Parent payments ─────────────────────────────────────────────────────── */
export function ParentPayments() {
  const { db } = useApp();
  const children = useChildren();
  const pays = db.payments.filter((p) => children.some((c) => c.id === p.studentId)).sort((a, b) => b.date - a.date);
  return (
    <div>
      {pays.length === 0 ? <Empty icon={<IcMoney size={26} />} title="No payments" body="Course payments for your linked learners will appear here with receipts." /> : (
        <div className="overflow-hidden rounded-xl border border-pine-700/10 bg-white shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <div className="overflow-x-auto">
            <table className="w-full min-w-130 text-left text-[13px]">
              <thead><tr className="border-b-2 border-pine-700/12 text-[11px] font-extrabold uppercase tracking-wider text-ink-2/55 dark:border-pine-200/12 dark:text-pine-200/45">
                <th className="px-5 py-3.5">Date</th><th className="px-3 py-3.5">Learner</th><th className="px-3 py-3.5">Course</th><th className="px-3 py-3.5">Method</th><th className="px-3 py-3.5">Reference</th><th className="px-3 py-3.5">Amount</th><th className="px-5 py-3.5">Status</th></tr></thead>
              <tbody>
                {pays.map((p) => (
                  <tr key={p.id} className="border-b border-pine-700/6 last:border-0 hover:bg-pine-700/3 dark:border-pine-200/6 dark:hover:bg-pine-200/4">
                    <td className="whitespace-nowrap px-5 py-3 font-semibold text-ink-2 dark:text-pine-200/70">{fmtDate(p.date)}</td>
                    <td className="px-3 py-3 font-bold">{userById(p.studentId)?.name}</td>
                    <td className="max-w-50 truncate px-3 py-3 font-bold">{courseById(p.courseId)?.title}</td>
                    <td className="px-3 py-3"><Badge tone="gray" className="uppercase">{p.method}</Badge></td>
                    <td className="px-3 py-3 font-mono text-[12px] font-bold">{p.reference}</td>
                    <td className="px-3 py-3 font-black">{ksh(p.amount)}</td>
                    <td className="px-5 py-3"><Badge tone={p.status === "completed" ? "pine" : p.status === "pending" ? "sun" : "clay"}>{p.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


+++ src/pages/parent.tsx (修改后)
import { useState } from "react";
import { Link } from "react-router-dom";
import { courseById, courseProgress, gradeName, lessonsOf, linkChild, subjectName, useApp, userById } from "../lib/db";
import { Avatar, Badge, Btn, Empty, Field, Modal, Progress, Reveal, Stat, TextInput, cx, fmtDate, ksh, timeAgo, useToast } from "../components/ui";
import { Donut, HBars } from "../components/charts";
import { IcBookOpen, IcCalendar, IcCap, IcCheckC, IcClipboard, IcLink, IcMoney, IcPhone, IcPlus, IcTrend, IcUsers } from "../components/icons";
import { ResultsTable } from "./student";

function useChildren() {
  const { db, user } = useApp();
  return (user?.linkedStudentIds ?? []).map((id) => userById(id)).filter((u): u is NonNullable<typeof u> => !!u && u.active);
}

/** Official academy support block for parents — details come from Academy Settings. */
function ParentSupportCard() {
  const { db } = useApp();
  const s = db.settings;
  return (
    <section className="rounded-xl border border-sun-500/40 bg-sun-500/8 p-5.5 dark:bg-sun-500/6">
      <h3 className="flex items-center gap-2 font-display text-lg font-bold"><IcPhone size={17} className="text-sun-700 dark:text-sun-400" /> {s.academyName} Support</h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2 dark:text-pine-200/70">Questions about linking a learner, results or a payment? Talk to the academy directly.</p>
      <div className="mt-3.5 flex flex-wrap gap-2.5 text-[13.5px] font-bold">
        <a href={`tel:${s.contactPhone.replace(/\s/g, "")}`} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-night-800">
          <span className="text-ink-2/60 dark:text-pine-200/50">Phone:</span> {s.contactPhone}
        </a>
        <a href={`mailto:${s.contactEmail}`} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-night-800">
          <span className="text-ink-2/60 dark:text-pine-200/50">Email:</span> <span className="break-all">{s.contactEmail}</span>
        </a>
      </div>
    </section>
  );
}

/* ── Parent dashboard ────────────────────────────────────────────────────── */
export function ParentDashboard() {
  const { db, user } = useApp();
  const children = useChildren();
  const [sel, setSel] = useState(0);
  const child = children[Math.min(sel, children.length - 1)];

  if (!user) return null;
  if (children.length === 0) {
    return (
      <div className="space-y-6">
        <Empty icon={<IcUsers size={26} />} title="Link your first learner"
          body="Ask your child for their SSGT student code (it looks like SSGT-1001 — they'll find it under Profile). Enter it under My Children to start seeing progress, grades and payments."
          action={<Link to="/app/children"><Btn><IcLink size={15} /> Link a learner</Btn></Link>} />
        <ParentSupportCard />
      </div>
    );
  }

  const ens = db.enrollments.filter((e) => e.studentId === child.id && e.status !== "pending");
  const allLessons = ens.flatMap((e) => lessonsOf(e.courseId));
  const done = allLessons.filter((l) => db.lessonProgress.some((p) => p.studentId === child.id && p.lessonId === l.id));
  const overall = allLessons.length ? Math.round((done.length / allLessons.length) * 100) : 0;
  const results = db.results.filter((r) => r.studentId === child.id);
  const avg = results.length ? Math.round(results.reduce((n, r) => n + (r.score / r.maxScore) * 100, 0) / results.length) : 0;
  const due = db.assignments.filter((a) => ens.some((e) => e.courseId === a.courseId) && a.dueAt > Date.now() && !db.submissions.some((s) => s.assignmentId === a.id && s.studentId === child.id));
  const bySubject = [...new Set(results.map((r) => r.subjectId))].map((sid) => {
    const rs = results.filter((r) => r.subjectId === sid);
    return { label: subjectName(sid), value: Math.round(rs.reduce((n, r) => n + (r.score / r.maxScore) * 100, 0) / rs.length) };
  });
  const latestResult = [...results].sort((a, b) => b.date - a.date)[0];

  return (
    <div className="space-y-6">
      {/* child switcher */}
      <div className="flex flex-wrap items-center gap-2.5">
        {children.map((c, i) => (
          <button key={c.id} onClick={() => setSel(i)} aria-pressed={i === Math.min(sel, children.length - 1)}
            className={cx("flex cursor-pointer items-center gap-2.5 rounded-xl border-[1.5px] px-3.5 py-2 transition-all",
              i === Math.min(sel, children.length - 1) ? "border-pine-700 bg-pine-700 text-paper shadow-md dark:border-sun-500 dark:bg-sun-500 dark:text-pine-950" : "border-pine-700/15 bg-white hover:border-pine-700/50 dark:border-pine-200/15 dark:bg-night-800")}>
            <Avatar name={c.name} color={c.color} size={30} />
            <span className="text-left">
              <span className="block text-[13px] font-black leading-tight">{c.name}</span>
              <span className={cx("text-[10.5px] font-extrabold uppercase tracking-wider", i === Math.min(sel, children.length - 1) ? "opacity-75" : "text-ink-2/55 dark:text-pine-200/45")}>{gradeName(c.gradeId ?? "")}</span>
            </span>
          </button>
        ))}
        <Link to="/app/children"><Btn variant="outline" size="sm"><IcPlus size={14} /> Link another</Btn></Link>
      </div>

      {/* banner */}
      <Reveal>
        <div className="board-bg noise relative overflow-hidden rounded-2xl p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-sun-400">Parent view · {child.studentCode}</p>
              <h2 className="mt-2 font-display text-3xl font-black text-paper">{child.name.split(" ")[0]} is {overall >= 60 ? "on a roll" : overall >= 30 ? "finding a rhythm" : "just warming up"} 📚</h2>
              <p className="mt-2 max-w-xl text-[14px] text-pine-100/75">
                {done.length} of {allLessons.length} lessons complete across {ens.length} course{ens.length === 1 ? "" : "s"}
                {due.length > 0 && <> · <strong className="text-sun-400">{due.length} assignment{due.length > 1 ? "s" : ""} due</strong> this week</>}
                {latestResult && <> · latest mark: <strong className="text-sun-400">{latestResult.score}/{latestResult.maxScore}</strong> ({latestResult.assessment})</>}.
              </p>
            </div>
            <Donut value={overall} size={116} stroke={12} sub="complete" />
          </div>
        </div>
      </Reveal>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={<IcBookOpen size={19} />} label="Active courses" value={ens.filter((e) => e.status === "active").length} sub={`${ens.filter((e) => e.status === "completed").length} completed`} />
        <Stat icon={<IcTrend size={19} />} label="Average score" value={results.length ? `${avg}%` : "—"} sub={`${results.length} results released`} tone="sun" />
        <Stat icon={<IcCalendar size={19} />} label="Tasks due" value={due.length} sub={due.length ? "this week" : "all clear"} tone={due.length ? "clay" : "pine"} />
        <Stat icon={<IcMoney size={19} />} label="Payments" value={db.payments.filter((p) => p.studentId === child.id && p.status === "completed").length} sub="receipts available" tone="night" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Reveal><section className="rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <h3 className="font-display text-lg font-bold">Course progress</h3>
          <div className="mt-4 space-y-4">
            {ens.map((e) => {
              const c = courseById(e.courseId); if (!c) return null;
              const p = courseProgress(child.id, c.id);
              return (
                <div key={e.id}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <span className="truncate font-display text-[14.5px] font-bold">{c.title}</span>
                    <span className="flex shrink-0 items-center gap-2 text-[12px] font-black text-pine-700 dark:text-sun-400">{e.status === "completed" && <IcCheckC size={13} />} {p.percent}%</span>
                  </div>
                  <Progress value={p.percent} color={p.percent === 100 ? "var(--color-sun-500)" : "var(--color-pine-600)"} />
                </div>
              );
            })}
            {ens.length === 0 && <p className="text-[13px] font-semibold text-ink-2/60 dark:text-pine-200/50">{child.name.split(" ")[0]} hasn't enrolled in any courses yet.</p>}
          </div>
        </section></Reveal>
        <Reveal delay={120}><section className="h-fit rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <h3 className="font-display text-lg font-bold">Subject averages</h3>
          <div className="mt-4">{bySubject.length ? <HBars data={bySubject} format={(v) => `${v}%`} /> : <p className="text-[13px] font-semibold text-ink-2/60 dark:text-pine-200/50">No results yet.</p>}</div>
        </section></Reveal>
      </div>

      <Reveal><section className="rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
        <h3 className="font-display text-lg font-bold">Recent results</h3>
        <div className="mt-3"><ResultsTable studentId={child.id} compact /></div>
      </section></Reveal>

      <Reveal delay={100}><ParentSupportCard /></Reveal>
    </div>
  );
}

/* ── Link children page ──────────────────────────────────────────────────── */
export function ParentChildren() {
  const { user } = useApp();
  const children = useChildren();
  const toast = useToast();
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");

  const link = () => {
    if (!user) return;
    const e = linkChild(user.id, code);
    if (e) { setErr(e); return; }
    setErr(""); setCode("");
    toast.push("Learner linked — their progress is now visible on your dashboard.");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      <Reveal><section className="h-fit rounded-xl border border-pine-700/10 bg-white p-6 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold"><IcLink size={18} className="text-sun-600 dark:text-sun-400" /> Link a learner</h3>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-2 dark:text-pine-200/70">Enter your child's student code. They'll find it on their Profile page — it looks like <code className="rounded bg-pine-700/10 px-1.5 py-0.5 font-mono text-[12px] font-black dark:bg-pine-200/10">SSGT-1001</code>. Linking requires their account to be active, and both of you get a notification.</p>
        <div className="mt-4">
          <Field label="Student code" error={err}>
            <div className="flex gap-2">
              <TextInput value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setErr(""); }} placeholder="SSGT-1001" className="font-mono uppercase" />
              <Btn onClick={link} disabled={code.trim().length < 4}>Link</Btn>
            </div>
          </Field>
        </div>
        <p className="mt-4 rounded-lg bg-pine-700/5 p-3 text-[11.5px] leading-relaxed text-ink-2/70 dark:bg-pine-200/6 dark:text-pine-200/55">Privacy: you'll see this learner's courses, progress, results and payments — and nothing else on the platform. Learners can see which guardian is linked.</p>
      </section></Reveal>
      <section>
        <h3 className="font-display text-lg font-bold">Linked learners</h3>
        <div className="mt-4 space-y-3.5">
          {children.length === 0 && <Empty icon={<IcUsers size={24} />} title="No learners linked" body="Link a learner with their student code to unlock the parent dashboard." />}
          {children.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-pine-700/10 bg-white p-4.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
              <Avatar name={c.name} color={c.color} size={48} />
              <div className="min-w-0 flex-1">
                <p className="font-display text-[16px] font-bold">{c.name}</p>
                <p className="text-[12.5px] font-bold text-ink-2/60 dark:text-pine-200/50">{gradeName(c.gradeId ?? "")} · <span className="font-mono">{c.studentCode}</span> · {c.email}</p>
              </div>
              <Link to="/app/dashboard"><Btn size="sm" variant="outline">View progress <IcTrend size={14} /></Btn></Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ── Parent payments ─────────────────────────────────────────────────────── */
export function ParentPayments() {
  const { db } = useApp();
  const children = useChildren();
  const pays = db.payments.filter((p) => children.some((c) => c.id === p.studentId)).sort((a, b) => b.date - a.date);
  return (
    <div>
      {pays.length === 0 ? <Empty icon={<IcMoney size={26} />} title="No payments" body="Course payments for your linked learners will appear here with receipts." /> : (
        <div className="overflow-hidden rounded-xl border border-pine-700/10 bg-white shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <div className="overflow-x-auto">
            <table className="w-full min-w-130 text-left text-[13px]">
              <thead><tr className="border-b-2 border-pine-700/12 text-[11px] font-extrabold uppercase tracking-wider text-ink-2/55 dark:border-pine-200/12 dark:text-pine-200/45">
                <th className="px-5 py-3.5">Date</th><th className="px-3 py-3.5">Learner</th><th className="px-3 py-3.5">Course</th><th className="px-3 py-3.5">Method</th><th className="px-3 py-3.5">Reference</th><th className="px-3 py-3.5">Amount</th><th className="px-5 py-3.5">Status</th></tr></thead>
              <tbody>
                {pays.map((p) => (
                  <tr key={p.id} className="border-b border-pine-700/6 last:border-0 hover:bg-pine-700/3 dark:border-pine-200/6 dark:hover:bg-pine-200/4">
                    <td className="whitespace-nowrap px-5 py-3 font-semibold text-ink-2 dark:text-pine-200/70">{fmtDate(p.date)}</td>
                    <td className="px-3 py-3 font-bold">{userById(p.studentId)?.name}</td>
                    <td className="max-w-50 truncate px-3 py-3 font-bold">{courseById(p.courseId)?.title}</td>
                    <td className="px-3 py-3"><Badge tone="gray" className="uppercase">{p.method}</Badge></td>
                    <td className="px-3 py-3 font-mono text-[12px] font-bold">{p.reference}</td>
                    <td className="px-3 py-3 font-black">{ksh(p.amount)}</td>
                    <td className="px-5 py-3"><Badge tone={p.status === "completed" ? "pine" : p.status === "pending" ? "sun" : "clay"}>{p.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
