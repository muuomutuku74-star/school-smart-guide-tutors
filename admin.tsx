--- src/pages/admin.tsx (原始)
import React, { useMemo, useState } from "react";
import { Link, useSearchParams as reactRouterUseSearchParams } from "react-router-dom";
import {
  adminSaveUser, commit, confirmPayment, courseById, gradeName, monthSeries, resetUserPassword,
  saveSettings, subjectName, uid, useApp, userById,
} from "../lib/db";
import type { Course, Resource, Role, Subject, User } from "../lib/types";
import { Avatar, Badge, Btn, Confirm, Empty, Field, Modal, Pager, Reveal, Select, Stat, Tabs, TextArea, TextInput, Toggle, cx, exportCSV, fmtDate, ksh, timeAgo, useToast } from "../components/ui";
import { Bars, Donut, HBars, Line } from "../components/charts";
import {
  IcBookOpen, IcCap, IcChart, IcCheck, IcCheckC, IcClipboard, IcDownload, IcEdit, IcEye, IcFileText, IcHistory,
  IcLayers, IcMail, IcMoney, IcPlus, IcSearch, IcShield, IcTarget, IcTrash, IcTrend, IcUsers, IcX,
} from "../components/icons";

/* shared bits */
function Tbl({ head, children, min = "min-w-150" }: { head: string[]; children: React.ReactNode; min?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-pine-700/10 bg-white shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
      <div className="overflow-x-auto">
        <table className={cx("w-full text-left text-[13px]", min)}>
          <thead><tr className="border-b-2 border-pine-700/12 text-[11px] font-extrabold uppercase tracking-wider text-ink-2/55 dark:border-pine-200/12 dark:text-pine-200/45">
            {head.map((h) => <th key={h} className="px-4 py-3.5 first:pl-5 last:pr-5">{h}</th>)}</tr></thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}
const rowCls = "border-b border-pine-700/6 last:border-0 transition-colors hover:bg-pine-700/3 dark:border-pine-200/6 dark:hover:bg-pine-200/4";
const td = "px-4 py-3 first:pl-5 last:pr-5";

/* ── Dashboard ───────────────────────────────────────────────────────────── */
export function AdminDashboard() {
  const { db } = useApp();
  const students = db.users.filter((u) => u.role === "student");
  const teachers = db.users.filter((u) => u.role === "teacher");
  const activeEnr = db.enrollments.filter((e) => e.status === "active");
  const revenue = db.payments.filter((p) => p.status === "completed").reduce((n, p) => n + p.amount, 0);
  const pending = db.payments.filter((p) => p.status === "pending");
  const enrTrend = monthSeries(6, (s, e) => db.enrollments.filter((x) => x.enrolledAt >= s && x.enrolledAt < e).length);
  const revTrend = monthSeries(6, (s, e) => db.payments.filter((p) => p.status === "completed" && p.date >= s && p.date < e).reduce((n, p) => n + p.amount, 0));
  const popular = [...db.courses].sort((a, b) => b.enrolledCount - a.enrolledCount).slice(0, 5).map((c) => ({ label: c.title.length > 30 ? c.title.slice(0, 30) + "…" : c.title, value: c.enrolledCount }));
  const avgPerf = db.results.length ? Math.round(db.results.reduce((n, r) => n + (r.score / r.maxScore) * 100, 0) / db.results.length) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={<IcUsers size={19} />} label="Students" value={students.length} sub={`${students.filter((s) => s.active).length} active`} />
        <Stat icon={<IcCap size={19} />} label="Teachers" value={teachers.length} sub={`${db.users.filter((u) => u.role === "parent").length} parents`} tone="sun" />
        <Stat icon={<IcBookOpen size={19} />} label="Courses" value={db.courses.length} sub={`${db.courses.filter((c) => c.published).length} published`} tone="night" />
        <Stat icon={<IcTrend size={19} />} label="Active enrollments" value={activeEnr.length} sub={`${db.enrollments.filter((e) => e.status === "completed").length} completed`} tone="clay" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={<IcMoney size={19} />} label="Revenue" value={ksh(revenue)} sub="completed payments" />
        <Stat icon={<IcClock16 />} label="Pending payments" value={pending.length} sub={ksh(pending.reduce((n, p) => n + p.amount, 0))} tone="sun" />
        <Stat icon={<IcClipboard size={19} />} label="Assignments" value={db.submissions.length} sub={`${db.submissions.filter((s) => s.status === "submitted").length} awaiting marks`} tone="night" />
        <Stat icon={<IcTarget size={19} />} label="Quiz attempts" value={db.attempts.length} sub={`${db.attempts.filter((a) => a.passed).length} passed`} tone="clay" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal><section className="rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <h3 className="font-display text-lg font-bold">Enrollment trend</h3>
          <div className="mt-4"><Line points={enrTrend.values} labels={enrTrend.labels} height={160} /></div>
        </section></Reveal>
        <Reveal delay={100}><section className="rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <h3 className="font-display text-lg font-bold">Revenue trend (KSh)</h3>
          <div className="mt-4"><Bars data={revTrend.values.map((v, i) => ({ label: revTrend.labels[i], value: v }))} height={160} color="var(--color-sun-500)" format={(v) => ksh(v)} /></div>
        </section></Reveal>
        <Reveal><section className="rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <h3 className="font-display text-lg font-bold">Most popular courses</h3>
          <div className="mt-4"><HBars data={popular} format={(v) => `${v} learners`} /></div>
        </section></Reveal>
        <Reveal delay={100}><section className="rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-bold">Platform performance</h3>
              <p className="mt-2 max-w-55 text-[13px] leading-relaxed text-ink-2/80 dark:text-pine-200/60">Average of all released results across subjects this term.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="pine">{db.results.length} results</Badge>
                <Badge tone="sun">{db.quizzes.length} quizzes live</Badge>
                <Badge tone="gray">{db.resources.length} resources</Badge>
              </div>
            </div>
            <Donut value={avgPerf} size={130} stroke={13} sub="avg score" />
          </div>
        </section></Reveal>
      </div>

      <Reveal><section className="rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold"><IcHistory size={18} className="text-sun-600 dark:text-sun-400" /> Recent audit activity</h3>
          <Link to="/app/audit" className="link-sweep text-[13px] font-extrabold text-sun-700 dark:text-sun-400">Full log</Link>
        </div>
        <div className="mt-3.5 space-y-1">
          {db.audit.slice(0, 6).map((a) => (
            <div key={a.id} className="flex items-center gap-3.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-pine-700/4 dark:hover:bg-pine-200/4">
              <Badge tone="gray" className="w-34 justify-center capitalize">{a.action.replace(/_/g, " ")}</Badge>
              <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink-2 dark:text-pine-200/75">{a.details}</span>
              <span className="shrink-0 text-[11px] font-bold text-ink-2/50 dark:text-pine-200/40">{a.userName} · {timeAgo(a.date)}</span>
            </div>
          ))}
        </div>
      </section></Reveal>
    </div>
  );
}
function IcClock16() { return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.4 2" /></svg>; }

/* ── Users ───────────────────────────────────────────────────────────────── */
export function AdminUsers() {
  const { db, user: me } = useApp();
  const toast = useToast();
  const [params] = reactRouterUseSearchParams();
  const [q, setQ] = useState(""); const [role, setRole] = useState(params.get("role") ?? ""); const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);
  const [deact, setDeact] = useState<User | null>(null);
  const [f, setF] = useState({ name: "", email: "", phone: "", role: "student" as Role, gradeId: "", active: true });
  const per = 8;

  const list = useMemo(() => {
    let out = db.users;
    if (role) out = out.filter((u) => u.role === role);
    if (q.trim()) out = out.filter((u) => (u.name + " " + u.email + " " + (u.studentCode ?? "")).toLowerCase().includes(q.toLowerCase()));
    return [...out].sort((a, b) => b.createdAt - a.createdAt);
  }, [db, q, role]);
  const pages = Math.max(1, Math.ceil(list.length / per));
  const shown = list.slice((page - 1) * per, page * per);

  const openCreate = () => { setF({ name: "", email: "", phone: "", role: "student", gradeId: "", active: true }); setCreating(true); };
  const openEdit = (u: User) => { setF({ name: u.name, email: u.email, phone: u.phone ?? "", role: u.role, gradeId: u.gradeId ?? "", active: u.active }); setEditing(u); };
  const save = () => {
    const res = adminSaveUser({ id: editing?.id, name: f.name, email: f.email, phone: f.phone, role: f.role, gradeId: f.gradeId || undefined, active: f.active });
    if (res.error) { toast.push(res.error, "err"); return; }
    if (res.tempPassword) toast.push(`Account created. Temporary password: ${res.tempPassword} (emailed in production)`, "info");
    else toast.push("User updated.");
    setCreating(false); setEditing(null);
  };
  const doReset = (u: User) => { const t = resetUserPassword(u.id); toast.push(`Password reset for ${u.name}. Temporary: ${t}`, "info"); };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52"><IcSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-2/50 dark:text-pine-200/50" /><TextInput value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search name, email, student code…" className="pl-10" aria-label="Search users" /></div>
        <Select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} className="w-40" aria-label="Filter role">
          <option value="">All roles</option><option value="student">Students</option><option value="teacher">Teachers</option><option value="parent">Parents</option><option value="admin">Admins</option>
        </Select>
        <Btn variant="outline" size="sm" onClick={() => { exportCSV(list.map((u) => ({ name: u.name, email: u.email, role: u.role, active: u.active ? "yes" : "no", joined: fmtDate(u.createdAt) })), "ssgt-users.csv"); toast.push("CSV exported."); }}><IcDownload size={14} /> Export</Btn>
        <Btn onClick={openCreate}><IcPlus size={15} /> Add user</Btn>
      </div>

      <div className="mt-5">
        <Tbl head={["User", "Role", "Details", "Joined", "Status", "Actions"]}>
          {shown.map((u) => (
            <tr key={u.id} className={rowCls}>
              <td className={td}><span className="flex items-center gap-3"><Avatar name={u.name} color={u.color} size={36} /><span><span className="block font-bold">{u.name}</span><span className="text-[11.5px] font-semibold text-ink-2/55 dark:text-pine-200/45">{u.email}</span></span></span></td>
              <td className={td}><Badge tone={u.role === "admin" ? "night" : u.role === "teacher" ? "pine" : u.role === "parent" ? "sun" : "gray"} className="capitalize">{u.role}</Badge></td>
              <td className={td + " font-semibold text-ink-2 dark:text-pine-200/65"}>{u.role === "student" ? <>{gradeName(u.gradeId ?? "")} · <span className="font-mono text-[11.5px]">{u.studentCode}</span></> : u.role === "teacher" ? u.subjectIds?.map(subjectName).join(", ") : u.role === "parent" ? `${u.linkedStudentIds?.length ?? 0} linked learner(s)` : "Platform admin"}</td>
              <td className={td + " whitespace-nowrap font-semibold text-ink-2 dark:text-pine-200/65"}>{fmtDate(u.createdAt)}</td>
              <td className={td}><Badge tone={u.active ? "pine" : "clay"}>{u.active ? "Active" : "Deactivated"}</Badge></td>
              <td className={td}>
                <div className="flex gap-1.5">
                  <button onClick={() => openEdit(u)} aria-label={`Edit ${u.name}`} className="cursor-pointer rounded-md p-1.5 text-ink-2/70 transition-colors hover:bg-pine-700/10 hover:text-pine-800 dark:text-pine-200/60 dark:hover:text-paper"><IcEdit size={15} /></button>
                  <button onClick={() => doReset(u)} aria-label={`Reset password for ${u.name}`} title="Reset password" className="cursor-pointer rounded-md p-1.5 text-ink-2/70 transition-colors hover:bg-sun-500/15 hover:text-sun-700 dark:text-pine-200/60"><IcShield size={15} /></button>
                  {u.id !== me?.id && (
                    u.active
                      ? <button onClick={() => setDeact(u)} aria-label={`Deactivate ${u.name}`} className="cursor-pointer rounded-md p-1.5 text-ink-2/70 transition-colors hover:bg-clay-500/12 hover:text-clay-600 dark:text-pine-200/60"><IcX size={15} /></button>
                      : <button onClick={() => { commit((d) => { d.users.find((x) => x.id === u.id)!.active = true; }, { action: "activate_user", entity: "user", details: u.name }); toast.push(`${u.name} reactivated.`); }} className="cursor-pointer rounded-md p-1.5 text-pine-700 transition-colors hover:bg-pine-700/10 dark:text-pine-300" aria-label={`Reactivate ${u.name}`}><IcCheck size={15} /></button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </Tbl>
        <div className="mt-5"><Pager page={page} pages={pages} onPage={setPage} /></div>
      </div>

      <Modal open={creating || !!editing} onClose={() => { setCreating(false); setEditing(null); }} title={editing ? `Edit ${editing.name}` : "Add user"}>
        <div className="space-y-4">
          <Field label="Full name"><TextInput value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email"><TextInput type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
            <Field label="Phone"><TextInput value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Role"><Select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as Role })}><option value="student">Student</option><option value="teacher">Teacher</option><option value="parent">Parent</option><option value="admin">Admin</option></Select></Field>
            {f.role === "student" && <Field label="Grade"><Select value={f.gradeId} onChange={(e) => setF({ ...f, gradeId: e.target.value })}><option value="">—</option>{db.grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</Select></Field>}
          </div>
          <div className="flex items-center gap-3"><Toggle on={f.active} onChange={(v) => setF({ ...f, active: v })} label="Account active" /><span className="text-[13px] font-bold">{f.active ? "Account active" : "Account deactivated"}</span></div>
          {!editing && <p className="rounded-lg bg-sun-500/10 px-3.5 py-2.5 text-[12px] font-bold text-ink-2 dark:text-pine-200/75">A temporary password is generated on creation and emailed in production.</p>}
          <div className="flex justify-end gap-2"><Btn variant="ghost" onClick={() => { setCreating(false); setEditing(null); }}>Cancel</Btn><Btn onClick={save}><IcCheckC size={15} /> {editing ? "Save changes" : "Create user"}</Btn></div>
        </div>
      </Modal>

      <Confirm open={!!deact} onClose={() => setDeact(null)} title="Deactivate account?" yesLabel="Deactivate"
        body={`${deact?.name} will be signed out and blocked from logging in. Their records are preserved and can be reactivated at any time.`}
        onYes={() => { if (deact) { commit((d) => { d.users.find((x) => x.id === deact.id)!.active = false; }, { action: "deactivate_user", entity: "user", details: deact.name }); toast.push(`${deact.name} deactivated.`, "info"); } }} />
    </div>
  );
}


/* ── Courses admin ───────────────────────────────────────────────────────── */
export function AdminCourses() {
  const { db } = useApp();
  const toast = useToast();
  const [editing, setEditing] = useState<Course | null>(null);
  const [f, setF] = useState({ title: "", description: "", price: 0, teacherId: "", featured: false });
  const teachers = db.users.filter((u) => u.role === "teacher" && u.active);

  const open = (c: Course) => { setF({ title: c.title, description: c.description, price: c.price, teacherId: c.teacherId, featured: c.featured }); setEditing(c); };
  const save = () => {
    if (!editing) return;
    commit((d) => { Object.assign(d.courses.find((c) => c.id === editing.id)!, { title: f.title, description: f.description, price: f.price, teacherId: f.teacherId, featured: f.featured }); },
      { action: "update_course", entity: "course", details: f.title });
    toast.push("Course updated."); setEditing(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13.5px] font-semibold text-ink-2 dark:text-pine-200/65">{db.courses.length} courses · enrolment, pricing and publication managed centrally.</p>
        <Btn variant="outline" size="sm" onClick={() => { exportCSV(db.courses.map((c) => ({ title: c.title, subject: subjectName(c.subjectId), grade: gradeName(c.gradeId), price: c.price, enrolled: c.enrolledCount, published: c.published ? "yes" : "no" })), "ssgt-courses.csv"); toast.push("CSV exported."); }}><IcDownload size={14} /> Export</Btn>
      </div>
      <div className="mt-5">
        <Tbl head={["Course", "Teacher", "Price", "Enrolled", "Featured", "Published", ""]}>
          {db.courses.map((c) => (
            <tr key={c.id} className={rowCls}>
              <td className={td}><span className="flex items-center gap-3"><span className="h-10 w-14 shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-pine-700 to-pine-950"><img src={c.image} alt="" className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} /></span><span className="max-w-60"><span className="block truncate font-bold">{c.title}</span><span className="text-[11.5px] font-semibold text-ink-2/55 dark:text-pine-200/45">{subjectName(c.subjectId)} · {gradeName(c.gradeId)}</span></span></span></td>
              <td className={td + " font-semibold"}>{userById(c.teacherId)?.name}</td>
              <td className={td + " font-bold"}>{c.price === 0 ? <Badge tone="pine">Free</Badge> : ksh(c.price)}</td>
              <td className={td + " font-bold"}>{c.enrolledCount}</td>
              <td className={td}><Toggle on={c.featured} label={`Feature ${c.title}`} onChange={(v) => { commit((d) => { d.courses.find((x) => x.id === c.id)!.featured = v; d.settings.featuredCourseIds = d.courses.filter((x) => x.featured).map((x) => x.id); }, { action: "toggle_featured", entity: "course", details: c.title }); toast.push(v ? "Added to homepage features." : "Removed from homepage features.", "info"); }} /></td>
              <td className={td}><Toggle on={c.published} label={`Publish ${c.title}`} onChange={(v) => { commit((d) => { d.courses.find((x) => x.id === c.id)!.published = v; }, { action: v ? "publish_course" : "unpublish_course", entity: "course", details: c.title }); }} /></td>
              <td className={td}><div className="flex justify-end"><Link to={`/courses/${c.id}`} className="cursor-pointer rounded-md p-1.5 text-ink-2/70 hover:bg-pine-700/10 dark:text-pine-200/60" aria-label={`View ${c.title}`}><IcEye size={15} /></Link><button onClick={() => open(c)} className="cursor-pointer rounded-md p-1.5 text-ink-2/70 hover:bg-pine-700/10 hover:text-pine-800 dark:text-pine-200/60" aria-label={`Edit ${c.title}`}><IcEdit size={15} /></button></div></td>
            </tr>
          ))}
        </Tbl>
      </div>
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit course">
        <div className="space-y-4">
          <Field label="Title"><TextInput value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
          <Field label="Description"><TextArea rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Teacher"><Select value={f.teacherId} onChange={(e) => setF({ ...f, teacherId: e.target.value })}>{teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</Select></Field>
            <Field label="Price (KSh)"><TextInput type="number" min={0} value={f.price} onChange={(e) => setF({ ...f, price: Math.max(0, Number(e.target.value)) })} /></Field>
          </div>
          <div className="flex items-center gap-3"><Toggle on={f.featured} onChange={(v) => setF({ ...f, featured: v })} label="Featured" /><span className="text-[13px] font-bold">Featured on homepage</span></div>
          <div className="flex justify-end gap-2"><Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn><Btn onClick={save}><IcCheckC size={15} /> Save</Btn></div>
        </div>
      </Modal>
    </div>
  );
}

/* ── Subjects admin ──────────────────────────────────────────────────────── */
export function AdminSubjects() {
  const { db } = useApp();
  const toast = useToast();
  const [editing, setEditing] = useState<Subject | null>(null);
  const [creating, setCreating] = useState(false);
  const [f, setF] = useState({ name: "", short: "", description: "", color: "#0C5A43", icon: "book", levelIds: [] as string[] });

  const open = (s: Subject) => { setF({ name: s.name, short: s.short, description: s.description, color: s.color, icon: s.icon, levelIds: [...s.levelIds] }); setEditing(s); };
  const save = () => {
    if (f.name.trim().length < 3) { toast.push("Subject name is too short.", "err"); return; }
    if (editing) {
      commit((d) => { Object.assign(d.subjects.find((s) => s.id === editing.id)!, f); }, { action: "update_subject", entity: "subject", details: f.name });
      toast.push("Subject updated.");
    } else {
      commit((d) => { d.subjects.push({ id: uid(), name: f.name.trim(), short: f.short || f.name.slice(0, 3).toUpperCase(), description: f.description, color: f.color, icon: f.icon, levelIds: f.levelIds, active: true }); },
        { action: "create_subject", entity: "subject", details: f.name });
      toast.push(`Subject "${f.name}" added — it's immediately available in course builders.`);
    }
    setEditing(null); setCreating(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13.5px] font-semibold text-ink-2 dark:text-pine-200/65">Subjects are database-driven — add, rename or deactivate and every page updates.</p>
        <Btn onClick={() => { setF({ name: "", short: "", description: "", color: "#0C5A43", icon: "book", levelIds: [] }); setCreating(true); }}><IcPlus size={15} /> Add subject</Btn>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {db.subjects.map((s) => (
          <div key={s.id} className={cx("rounded-xl border bg-white p-5 shadow-[var(--shadow-card)] dark:bg-night-800", s.active ? "border-pine-700/10 dark:border-pine-200/10" : "border-clay-500/30 opacity-70")}>
            <div className="flex items-start justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-xl text-paper" style={{ background: s.color }}><IcLayers size={20} /></span>
              <div className="flex items-center gap-2">
                <Badge tone={s.active ? "pine" : "clay"}>{s.active ? "Active" : "Inactive"}</Badge>
                <Toggle on={s.active} label={`Activate ${s.name}`} onChange={(v) => { commit((d) => { d.subjects.find((x) => x.id === s.id)!.active = v; }, { action: v ? "activate_subject" : "deactivate_subject", entity: "subject", details: s.name }); }} />
              </div>
            </div>
            <h3 className="mt-3 font-display text-[16px] font-bold">{s.name}</h3>
            <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-ink-2/80 dark:text-pine-200/60">{s.description}</p>
            <div className="mt-3 flex items-center justify-between border-t border-pine-700/8 pt-3 dark:border-pine-200/8">
              <span className="text-[11.5px] font-bold text-ink-2/60 dark:text-pine-200/50">{db.courses.filter((c) => c.subjectId === s.id).length} courses · {db.resources.filter((r) => r.subjectId === s.id).length} resources</span>
              <Btn variant="outline" size="sm" onClick={() => open(s)}><IcEdit size={13} /> Edit</Btn>
            </div>
          </div>
        ))}
      </div>

      <Modal open={creating || !!editing} onClose={() => { setCreating(false); setEditing(null); }} title={editing ? `Edit ${editing.name}` : "Add subject"}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_110px]">
            <Field label="Name"><TextInput value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Pre-Technical Studies" /></Field>
            <Field label="Short code"><TextInput value={f.short} onChange={(e) => setF({ ...f, short: e.target.value.toUpperCase() })} placeholder="PTS" /></Field>
          </div>
          <Field label="Description"><TextArea rows={2} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Accent colour"><div className="flex flex-wrap gap-1.5">{["#0C5A43", "#B56508", "#C4562E", "#1F6A50", "#8F4D0D", "#357E62", "#A84625", "#083528"].map((c) => <button key={c} onClick={() => setF({ ...f, color: c })} aria-label={`Colour ${c}`} className={cx("h-7 w-7 cursor-pointer rounded-full transition-transform hover:scale-110", f.color === c && "ring-2 ring-sun-500 ring-offset-2")} style={{ background: c }} />)}</div></Field>
            <Field label="Icon key"><Select value={f.icon} onChange={(e) => setF({ ...f, icon: e.target.value })}>{["target", "book", "drum", "spark", "globe", "money", "leaf", "code", "sun", "flame", "shield"].map((i) => <option key={i}>{i}</option>)}</Select></Field>
          </div>
          <Field label="Levels">
            <div className="flex flex-wrap gap-2">
              {db.levels.map((l) => {
                const on = f.levelIds.includes(l.id);
                return <button key={l.id} onClick={() => setF({ ...f, levelIds: on ? f.levelIds.filter((x) => x !== l.id) : [...f.levelIds, l.id] })} aria-pressed={on}
                  className={cx("cursor-pointer rounded-lg border-[1.5px] px-3 py-1.5 text-[12px] font-bold transition-all", on ? "border-pine-700 bg-pine-700 text-paper dark:border-sun-500 dark:bg-sun-500 dark:text-pine-950" : "border-pine-700/20 text-ink-2 dark:border-pine-200/20 dark:text-pine-200/70")}>{l.name}</button>;
              })}
            </div>
          </Field>
          <div className="flex justify-end gap-2"><Btn variant="ghost" onClick={() => { setCreating(false); setEditing(null); }}>Cancel</Btn><Btn onClick={save}><IcCheckC size={15} /> {editing ? "Save" : "Add subject"}</Btn></div>
        </div>
      </Modal>
    </div>
  );
}

/* ── Curriculum tree ─────────────────────────────────────────────────────── */
export function AdminCurriculum() {
  const { db } = useApp();
  const toast = useToast();
  const [addLevel, setAddLevel] = useState<string | null>(null);
  const [addGrade, setAddGrade] = useState<string | null>(null);
  const [name, setName] = useState("");

  const saveLevel = () => {
    if (!addLevel || name.trim().length < 3) return;
    commit((d) => { d.levels.push({ id: uid(), curriculumId: addLevel, name: name.trim(), order: d.levels.filter((l) => l.curriculumId === addLevel).length + 1 }); },
      { action: "create_level", entity: "curriculum", details: name });
    toast.push("Level added."); setAddLevel(null); setName("");
  };
  const saveGrade = () => {
    if (!addGrade || name.trim().length < 3) return;
    commit((d) => { d.grades.push({ id: uid(), levelId: addGrade, name: name.trim(), order: d.grades.filter((g) => g.levelId === addGrade).length + 1 }); },
      { action: "create_grade", entity: "curriculum", details: name });
    toast.push("Grade added."); setAddGrade(null); setName("");
  };

  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-[13.5px] leading-relaxed text-ink-2 dark:text-pine-200/65">The academic spine of the platform: <strong>Curriculum → Level → Grade → Subject → Course → Module → Lesson → Assessment</strong>. Extending it here instantly extends every filter and form.</p>
      {db.curricula.map((cur) => (
        <Reveal key={cur.id}>
          <section className="overflow-hidden rounded-xl border border-pine-700/10 bg-white shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
            <div className="flex items-center gap-3 border-b border-pine-700/8 bg-pine-700/4 px-5 py-4 dark:border-pine-200/8 dark:bg-pine-200/5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-pine-700 text-paper dark:bg-sun-500 dark:text-pine-950"><IcLayers size={17} /></span>
              <div><h3 className="font-display text-[16.5px] font-bold">{cur.name}</h3><p className="text-[12px] font-semibold text-ink-2/60 dark:text-pine-200/50">{cur.description}</p></div>
              <button onClick={() => { setAddLevel(cur.id); setName(""); }} className="ml-auto flex cursor-pointer items-center gap-1.5 text-[12.5px] font-extrabold text-pine-700 hover:underline dark:text-sun-400"><IcPlus size={14} /> Add level</button>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              {db.levels.filter((l) => l.curriculumId === cur.id).sort((a, b) => a.order - b.order).map((l) => (
                <div key={l.id} className="rounded-lg border border-pine-700/10 p-4 dark:border-pine-200/10">
                  <div className="flex items-center justify-between">
                    <p className="font-display text-[14.5px] font-bold">{l.name}</p>
                    <button onClick={() => { setAddGrade(l.id); setName(""); }} className="cursor-pointer text-[11.5px] font-extrabold text-pine-700 hover:underline dark:text-sun-400">+ grade</button>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {db.grades.filter((g) => g.levelId === l.id).sort((a, b) => a.order - b.order).map((g) => (
                      <span key={g.id} className="group relative rounded-md border border-pine-700/15 bg-paper px-2.5 py-1 text-[12px] font-bold dark:border-pine-200/15 dark:bg-night-850">
                        {g.name}
                        <span className="ml-1.5 text-[10px] font-black text-ink-2/45 dark:text-pine-200/35">{db.courses.filter((c) => c.gradeId === g.id).length}c</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>
      ))}
      <Modal open={!!addLevel || !!addGrade} onClose={() => { setAddLevel(null); setAddGrade(null); }} title={addLevel ? "Add education level" : "Add grade / form"}>
        <Field label="Name"><TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder={addLevel ? "e.g. Senior Secondary (Grade 10–12)" : "e.g. Grade 4"} autoFocus /></Field>
        <div className="mt-5 flex justify-end gap-2"><Btn variant="ghost" onClick={() => { setAddLevel(null); setAddGrade(null); }}>Cancel</Btn><Btn onClick={addLevel ? saveLevel : saveGrade}><IcPlus size={15} /> Add</Btn></div>
      </Modal>
    </div>
  );
}

/* ── Resources admin ─────────────────────────────────────────────────────── */
export function AdminResources() {
  const { db } = useApp();
  const toast = useToast();
  const [creating, setCreating] = useState(false);
  const [f, setF] = useState({ title: "", kind: "notes" as Resource["kind"], subjectId: "", gradeId: "", description: "", downloadEnabled: true });
  const save = () => {
    if (f.title.trim().length < 5) { toast.push("Give the resource a proper title.", "err"); return; }
    commit((d) => { d.resources.unshift({ id: uid(), title: f.title.trim(), kind: f.kind, subjectId: f.subjectId || d.subjects[0].id, gradeId: f.gradeId || d.grades[2].id, description: f.description || f.title, sizeKB: 480, downloads: 0, downloadEnabled: f.downloadEnabled, active: true }); },
      { action: "create_resource", entity: "resource", details: f.title });
    toast.push("Resource published to the library."); setCreating(false);
  };
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13.5px] font-semibold text-ink-2 dark:text-pine-200/65">Control what learners can download. Restricted items stay visible but locked.</p>
        <Btn onClick={() => { setF({ title: "", kind: "notes", subjectId: "", gradeId: "", description: "", downloadEnabled: true }); setCreating(true); }}><IcPlus size={15} /> Add resource</Btn>
      </div>
      <div className="mt-5">
        <Tbl head={["Resource", "Type", "Subject / Grade", "Downloads", "Downloadable", "Active", ""]}>
          {db.resources.map((r) => (
            <tr key={r.id} className={rowCls}>
              <td className={td + " max-w-70"}><span className="block truncate font-bold">{r.title}</span><span className="text-[11.5px] font-semibold text-ink-2/55 dark:text-pine-200/45">{(r.sizeKB / 1024).toFixed(1)} MB{r.year ? ` · ${r.year}` : ""}</span></td>
              <td className={td}><Badge tone="sun" className="capitalize">{r.kind.replace("-", " ")}</Badge></td>
              <td className={td + " font-semibold text-ink-2 dark:text-pine-200/65"}>{subjectName(r.subjectId)} · {gradeName(r.gradeId)}</td>
              <td className={td + " font-bold"}>{r.downloads.toLocaleString()}</td>
              <td className={td}><Toggle on={r.downloadEnabled} label={`Allow download ${r.title}`} onChange={(v) => { commit((d) => { d.resources.find((x) => x.id === r.id)!.downloadEnabled = v; }, { action: "toggle_download", entity: "resource", details: `${r.title} → ${v ? "enabled" : "restricted"}` }); toast.push(v ? "Downloads enabled." : "Downloads restricted.", "info"); }} /></td>
              <td className={td}><Toggle on={r.active} label={`Activate ${r.title}`} onChange={(v) => { commit((d) => { d.resources.find((x) => x.id === r.id)!.active = v; }, { action: v ? "activate_resource" : "deactivate_resource", entity: "resource", details: r.title }); }} /></td>
              <td className={td}><button onClick={() => { commit((d) => { d.resources.find((x) => x.id === r.id)!.active = false; }, { action: "deactivate_resource", entity: "resource", details: r.title }); toast.push("Resource removed from library.", "info"); }} aria-label={`Remove ${r.title}`} className="cursor-pointer rounded-md p-1.5 text-ink-2/70 hover:bg-clay-500/12 hover:text-clay-600 dark:text-pine-200/60"><IcTrash size={15} /></button></td>
            </tr>
          ))}
        </Tbl>
      </div>
      <Modal open={creating} onClose={() => setCreating(false)} title="Add resource">
        <div className="space-y-4">
          <Field label="Title"><TextInput value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Grade 9 Physics Formula Sheet" /></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Type"><Select value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value as Resource["kind"] })}>{["notes", "past-paper", "marking-scheme", "worksheet", "study-guide", "practice", "video"].map((k) => <option key={k} value={k}>{k.replace("-", " ")}</option>)}</Select></Field>
            <Field label="Subject"><Select value={f.subjectId} onChange={(e) => setF({ ...f, subjectId: e.target.value })}><option value="">Choose…</option>{db.subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></Field>
            <Field label="Grade"><Select value={f.gradeId} onChange={(e) => setF({ ...f, gradeId: e.target.value })}><option value="">Choose…</option>{db.grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</Select></Field>
          </div>
          <Field label="Description"><TextArea rows={2} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
          <div className="flex items-center gap-3"><Toggle on={f.downloadEnabled} onChange={(v) => setF({ ...f, downloadEnabled: v })} label="Downloadable" /><span className="text-[13px] font-bold">Learners may download</span></div>
          <p className="rounded-lg bg-pine-700/6 px-3.5 py-2.5 text-[11.5px] leading-relaxed text-ink-2/75 dark:bg-pine-200/8 dark:text-pine-200/60">Files live in object storage (S3-compatible) in production — type and size are validated server-side before the record is created.</p>
          <div className="flex justify-end gap-2"><Btn variant="ghost" onClick={() => setCreating(false)}>Cancel</Btn><Btn onClick={save}><IcCheckC size={15} /> Publish</Btn></div>
        </div>
      </Modal>
    </div>
  );
}

/* ── Enrollments ─────────────────────────────────────────────────────────── */
export function AdminEnrollments() {
  const { db } = useApp();
  const toast = useToast();
  const [status, setStatus] = useState("");
  const list = db.enrollments.filter((e) => !status || e.status === status).sort((a, b) => b.enrolledAt - a.enrolledAt);
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-44" aria-label="Filter by status">
          <option value="">All statuses</option><option value="active">Active</option><option value="pending">Pending</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
        </Select>
        <span className="text-[13px] font-bold text-ink-2/70 dark:text-pine-200/60">{list.length} enrollments</span>
        <span className="ml-auto"><Btn variant="outline" size="sm" onClick={() => { exportCSV(list.map((e) => ({ student: userById(e.studentId)?.name, course: courseById(e.courseId)?.title, status: e.status, payment: e.paymentStatus, enrolled: fmtDate(e.enrolledAt) })), "ssgt-enrollments.csv"); toast.push("CSV exported."); }}><IcDownload size={14} /> Export</Btn></span>
      </div>
      <div className="mt-5">
        <Tbl head={["Student", "Course", "Enrolled", "Payment", "Status"]}>
          {list.map((e) => (
            <tr key={e.id} className={rowCls}>
              <td className={td}><span className="flex items-center gap-2.5"><Avatar name={userById(e.studentId)?.name ?? "?"} color={userById(e.studentId)?.color ?? "#888"} size={30} /><span className="font-bold">{userById(e.studentId)?.name}</span></span></td>
              <td className={td + " max-w-70 truncate font-semibold"}>{courseById(e.courseId)?.title}</td>
              <td className={td + " whitespace-nowrap font-semibold text-ink-2 dark:text-pine-200/65"}>{fmtDate(e.enrolledAt)}</td>
              <td className={td}><Badge tone={e.paymentStatus === "paid" ? "pine" : e.paymentStatus === "pending" ? "sun" : "gray"}>{e.paymentStatus}</Badge></td>
              <td className={td}>
                <Select value={e.status} aria-label="Enrollment status" className="w-34 py-1.5 text-[12px]"
                  onChange={(ev) => { commit((d) => { d.enrollments.find((x) => x.id === e.id)!.status = ev.target.value as never; }, { action: "update_enrollment", entity: "enrollment", details: `${userById(e.studentId)?.name} → ${ev.target.value}` }); toast.push("Enrollment updated.", "info"); }}>
                  <option value="active">Active</option><option value="pending">Pending</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                </Select>
              </td>
            </tr>
          ))}
        </Tbl>
      </div>
    </div>
  );
}

/* ── Payments ────────────────────────────────────────────────────────────── */
export function AdminPayments() {
  const { db } = useApp();
  const toast = useToast();
  const [receipt, setReceipt] = useState<string | null>(null);
  const pays = [...db.payments].sort((a, b) => b.date - a.date);
  const r = receipt ? db.payments.find((p) => p.id === receipt) : null;
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13.5px] font-semibold text-ink-2 dark:text-pine-200/65">M-Pesa STK, card and bank rails — no card data is ever stored, only references and statuses.</p>
        <Btn variant="outline" size="sm" onClick={() => { exportCSV(pays.map((p) => ({ student: userById(p.studentId)?.name, course: courseById(p.courseId)?.title, amount: p.amount, method: p.method, status: p.status, reference: p.reference, date: fmtDate(p.date) })), "ssgt-payments.csv"); toast.push("CSV exported."); }}><IcDownload size={14} /> Export</Btn>
      </div>
      <div className="mt-5">
        <Tbl head={["Date", "Student", "Course", "Method", "Reference", "Amount", "Status", ""]}>
          {pays.map((p) => (
            <tr key={p.id} className={rowCls}>
              <td className={td + " whitespace-nowrap font-semibold text-ink-2 dark:text-pine-200/65"}>{fmtDate(p.date)}</td>
              <td className={td + " font-bold"}>{userById(p.studentId)?.name}</td>
              <td className={td + " max-w-55 truncate font-semibold"}>{courseById(p.courseId)?.title}</td>
              <td className={td}><Badge tone="gray" className="uppercase">{p.method}</Badge></td>
              <td className={td + " font-mono text-[12px] font-bold"}>{p.reference}</td>
              <td className={td + " font-black"}>{ksh(p.amount)}</td>
              <td className={td}><Badge tone={p.status === "completed" ? "pine" : p.status === "pending" ? "sun" : "clay"}>{p.status}</Badge></td>
              <td className={td}>
                <div className="flex justify-end gap-1.5">
                  <button onClick={() => setReceipt(p.id)} className="cursor-pointer rounded-md p-1.5 text-ink-2/70 hover:bg-pine-700/10 dark:text-pine-200/60" aria-label="View receipt"><IcEye size={15} /></button>
                  {p.status === "pending" && <>
                    <button title="Confirm payment" aria-label="Confirm payment" onClick={() => { confirmPayment(p.studentId, p.courseId, p.amount, p.method, "SGA" + p.reference.slice(-6).toUpperCase(), p.phone); toast.push("Payment confirmed — enrollment activated & receipt sent."); }} className="cursor-pointer rounded-md p-1.5 text-pine-700 hover:bg-pine-700/10 dark:text-pine-300"><IcCheck size={15} /></button>
                    <button title="Mark failed" aria-label="Mark failed" onClick={() => { commit((d) => { d.payments.find((x) => x.id === p.id)!.status = "failed"; }, { action: "fail_payment", entity: "payment", details: p.reference }); toast.push("Marked as failed.", "info"); }} className="cursor-pointer rounded-md p-1.5 text-clay-600 hover:bg-clay-500/12"><IcX size={15} /></button>
                  </>}
                </div>
              </td>
            </tr>
          ))}
        </Tbl>
      </div>
      <Modal open={!!r} onClose={() => setReceipt(null)} title="Payment receipt">
        {r && (
          <div>
            <div className="rounded-xl border-2 border-dashed border-pine-700/25 p-5 text-center dark:border-pine-200/25">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-ink-2/55 dark:text-pine-200/45">School Smart Guide Tutors</p>
              <p className="mt-2 font-display text-3xl font-black">{ksh(r.amount)}</p>
              <Badge tone={r.status === "completed" ? "pine" : r.status === "pending" ? "sun" : "clay"} className="mt-2">{r.status}</Badge>
            </div>
            <dl className="mt-4 space-y-2 text-[13.5px] font-semibold">
              {[["Student", userById(r.studentId)?.name ?? ""], ["Course", courseById(r.courseId)?.title ?? ""], ["Method", r.method.toUpperCase()], ["Reference", r.reference], ["Phone", r.phone ?? "—"], ["Date", fmtDate(r.date)]].map(([k2, v]) => (
                <div key={k2} className="flex justify-between gap-4 border-b border-pine-700/8 pb-2 last:border-0 dark:border-pine-200/8"><dt className="text-ink-2/70 dark:text-pine-200/55">{k2}</dt><dd className="text-right font-bold">{v}</dd></div>
              ))}
            </dl>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ── Messages ────────────────────────────────────────────────────────────── */
export function AdminMessages() {
  const { db } = useApp();
  const toast = useToast();
  return (
    <div className="space-y-3.5">
      {db.contacts.length === 0 && <Empty icon={<IcMail size={24} />} title="Inbox empty" body="Contact form submissions from the public website land here." />}
      {db.contacts.map((c) => (
        <div key={c.id} className={cx("rounded-xl border bg-white p-5 shadow-[var(--shadow-card)] dark:bg-night-800", c.read ? "border-pine-700/10 dark:border-pine-200/10" : "border-sun-500/40 bg-sun-500/4")}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-display text-[15.5px] font-bold">{c.subject} {!c.read && <Badge tone="sun" className="ml-1.5">New</Badge>}</p>
              <p className="mt-0.5 text-[12.5px] font-bold text-ink-2/60 dark:text-pine-200/50">{c.name} · {c.email}{c.phone ? ` · ${c.phone}` : ""} · {timeAgo(c.date)}</p>
            </div>
            <div className="flex gap-1.5">
              {!c.read && <Btn size="sm" variant="outline" onClick={() => { commit((d) => { d.contacts.find((x) => x.id === c.id)!.read = true; }); toast.push("Marked as read.", "info"); }}><IcCheck size={13} /> Read</Btn>}
              <button onClick={() => { commit((d) => { d.contacts = d.contacts.filter((x) => x.id !== c.id); }, { action: "delete_contact", entity: "contact", details: c.subject }); toast.push("Message deleted.", "info"); }} aria-label="Delete message" className="cursor-pointer rounded-md p-1.5 text-ink-2/70 hover:bg-clay-500/12 hover:text-clay-600 dark:text-pine-200/60"><IcTrash size={15} /></button>
            </div>
          </div>
          <p className="mt-3 rounded-lg bg-pine-700/4 p-4 text-[13.5px] leading-relaxed text-ink-2 dark:bg-pine-200/5 dark:text-pine-200/75">{c.message}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Audit ───────────────────────────────────────────────────────────────── */
export function AdminAudit() {
  const { db } = useApp();
  const [q, setQ] = useState("");
  const list = db.audit.filter((a) => !q.trim() || (a.action + " " + a.entity + " " + a.details + " " + a.userName).toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <div className="relative max-w-sm"><IcSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-2/50 dark:text-pine-200/50" /><TextInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by action, user, details…" className="pl-10" aria-label="Filter audit log" /></div>
      <div className="mt-5">
        <Tbl head={["When", "Actor", "Action", "Entity", "Details"]}>
          {list.slice(0, 60).map((a) => (
            <tr key={a.id} className={rowCls}>
              <td className={td + " whitespace-nowrap font-semibold text-ink-2 dark:text-pine-200/65"}>{fmtDate(a.date)} · {new Date(a.date).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}</td>
              <td className={td + " font-bold"}>{a.userName}</td>
              <td className={td}><Badge tone="gray" className="capitalize">{a.action.replace(/_/g, " ")}</Badge></td>
              <td className={td + " font-semibold capitalize text-ink-2 dark:text-pine-200/65"}>{a.entity}</td>
              <td className={td + " max-w-90 truncate font-semibold text-ink-2 dark:text-pine-200/70"}>{a.details}</td>
            </tr>
          ))}
        </Tbl>
      </div>
    </div>
  );
}

/* ── Reports ─────────────────────────────────────────────────────────────── */
export function AdminReports() {
  const { db } = useApp();
  const toast = useToast();
  const subjPerf = db.subjects.filter((s) => s.active).map((s) => {
    const rs = db.results.filter((r) => r.subjectId === s.id);
    return { label: s.name, value: rs.length ? Math.round(rs.reduce((n, r) => n + (r.score / r.maxScore) * 100, 0) / rs.length) : 0 };
  }).filter((x) => x.value > 0);
  const quizPerf = db.quizzes.map((qz) => {
    const at = db.attempts.filter((a) => a.quizId === qz.id);
    return { label: qz.title.length > 28 ? qz.title.slice(0, 28) + "…" : qz.title, value: at.length ? Math.round(at.reduce((n, a) => n + a.percent, 0) / at.length) : 0 };
  }).filter((x) => x.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2.5">
        {[
          ["Results CSV", () => exportCSV(db.results.map((r) => ({ student: userById(r.studentId)?.name, subject: subjectName(r.subjectId), assessment: r.assessment, score: r.score, max: r.maxScore, term: r.term, date: fmtDate(r.date) })), "ssgt-results.csv")],
          ["Enrollments CSV", () => exportCSV(db.enrollments.map((e) => ({ student: userById(e.studentId)?.name, course: courseById(e.courseId)?.title, status: e.status, date: fmtDate(e.enrolledAt) })), "ssgt-enrollments.csv")],
          ["Payments CSV", () => exportCSV(db.payments.map((p) => ({ student: userById(p.studentId)?.name, amount: p.amount, status: p.status, reference: p.reference })), "ssgt-payments.csv")],
        ].map(([label, fn]) => (
          <Btn key={label as string} variant="outline" size="sm" onClick={() => { (fn as () => void)(); toast.push(`${label} downloaded.`); }}><IcDownload size={14} /> {label as string}</Btn>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal><section className="rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <h3 className="font-display text-lg font-bold">Average score by subject</h3>
          <div className="mt-4"><HBars data={subjPerf} format={(v) => `${v}%`} /></div>
        </section></Reveal>
        <Reveal delay={100}><section className="rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <h3 className="font-display text-lg font-bold">Quiz performance</h3>
          <div className="mt-4"><HBars data={quizPerf} color="var(--color-pine-600)" format={(v) => `${v}%`} /></div>
        </section></Reveal>
      </div>
    </div>
  );
}

/* ── Settings / CMS ──────────────────────────────────────────────────────── */
export function AdminSettings() {
  const { db } = useApp();
  const toast = useToast();
  const s = db.settings;
  const [contact, setContact] = useState({ contactEmail: s.contactEmail, contactPhone: s.contactPhone, address: s.address, socials: { ...s.socials } });
  const [regOpen, setRegOpen] = useState(s.registrationOpen);

  const saveContact = () => { saveSettings(contact); toast.push("Contact & social links updated — footer reflects the change immediately."); };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Reveal><section className="rounded-xl border border-pine-700/10 bg-white p-6 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
        <h3 className="font-display text-lg font-bold">Platform</h3>
        <div className="mt-4 flex items-center justify-between rounded-lg border border-pine-700/10 px-4 py-3.5 dark:border-pine-200/10">
          <div><p className="text-[14px] font-bold">Open registration</p><p className="text-[12px] text-ink-2/70 dark:text-pine-200/55">When off, the sign-up page shows a notice and blocks new accounts.</p></div>
          <Toggle on={regOpen} onChange={(v) => { setRegOpen(v); saveSettings({ registrationOpen: v }); toast.push(v ? "Registration reopened." : "Registration paused.", "info"); }} label="Open registration" />
        </div>
        <div className="mt-4 space-y-3.5">
          <Field label="Contact email"><TextInput value={contact.contactEmail} onChange={(e) => setContact({ ...contact, contactEmail: e.target.value })} /></Field>
          <Field label="Contact phone"><TextInput value={contact.contactPhone} onChange={(e) => setContact({ ...contact, contactPhone: e.target.value })} /></Field>
          <Field label="Office address"><TextInput value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} /></Field>
          <div className="grid gap-3.5 sm:grid-cols-2">
            {(["facebook", "x", "youtube", "whatsapp"] as const).map((k) => (
              <Field key={k} label={k === "x" ? "X (Twitter)" : k[0].toUpperCase() + k.slice(1)}><TextInput value={contact.socials[k]} onChange={(e) => setContact({ ...contact, socials: { ...contact.socials, [k]: e.target.value } })} /></Field>
            ))}
          </div>
          <Btn onClick={saveContact}><IcCheckC size={15} /> Save contact settings</Btn>
        </div>
      </section></Reveal>

      <div className="space-y-6">
        <Reveal delay={100}><section className="rounded-xl border border-pine-700/10 bg-white p-6 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <h3 className="font-display text-lg font-bold">Homepage testimonials</h3>
          <p className="mt-1 text-[12.5px] text-ink-2/70 dark:text-pine-200/55">Edited here, rendered on the public homepage instantly.</p>
          <div className="mt-4 space-y-3">
            {s.testimonials.map((t, i) => (
              <div key={t.id} className="rounded-lg border border-pine-700/10 p-3.5 dark:border-pine-200/10">
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <TextInput defaultValue={t.name} aria-label="Name" onBlur={(e) => { const next = [...s.testimonials]; next[i] = { ...t, name: e.target.value }; saveSettings({ testimonials: next }); }} />
                  <TextInput defaultValue={t.role} aria-label="Role" onBlur={(e) => { const next = [...s.testimonials]; next[i] = { ...t, role: e.target.value }; saveSettings({ testimonials: next }); }} />
                </div>
                <TextArea rows={2} className="mt-2.5" defaultValue={t.quote} aria-label="Quote" onBlur={(e) => { const next = [...s.testimonials]; next[i] = { ...t, quote: e.target.value }; saveSettings({ testimonials: next }); toast.push("Testimonial updated."); }} />
              </div>
            ))}
          </div>
        </section></Reveal>
        <Reveal delay={160}><section className="rounded-xl border border-pine-700/10 bg-white p-6 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <h3 className="font-display text-lg font-bold">FAQs</h3>
          <div className="mt-4 space-y-3">
            {s.faqs.map((fq, i) => (
              <div key={fq.id} className="rounded-lg border border-pine-700/10 p-3.5 dark:border-pine-200/10">
                <TextInput defaultValue={fq.q} aria-label="Question" className="font-bold" onBlur={(e) => { const next = [...s.faqs]; next[i] = { ...fq, q: e.target.value }; saveSettings({ faqs: next }); }} />
                <TextArea rows={2} className="mt-2.5" defaultValue={fq.a} aria-label="Answer" onBlur={(e) => { const next = [...s.faqs]; next[i] = { ...fq, a: e.target.value }; saveSettings({ faqs: next }); toast.push("FAQ updated."); }} />
              </div>
            ))}
          </div>
          <Btn variant="outline" size="sm" className="mt-3" onClick={() => { saveSettings({ faqs: [...s.faqs, { id: uid(), q: "New question?", a: "Answer…" }] }); toast.push("FAQ added — edit it above."); }}><IcPlus size={14} /> Add FAQ</Btn>
        </section></Reveal>
      </div>
    </div>
  );
}


+++ src/pages/admin.tsx (修改后)
import React, { useMemo, useState } from "react";
import { Link, useSearchParams as reactRouterUseSearchParams } from "react-router-dom";
import {
  adminSaveUser, commit, confirmPayment, courseById, gradeName, monthSeries, resetUserPassword,
  saveSettings, subjectName, uid, useApp, userById,
} from "../lib/db";
import type { Course, Resource, Role, Subject, User } from "../lib/types";
import { Avatar, Badge, Btn, Confirm, Empty, Field, Modal, Pager, Reveal, Select, Stat, Tabs, TextArea, TextInput, Toggle, cx, exportCSV, fmtDate, ksh, timeAgo, useToast } from "../components/ui";
import { Bars, Donut, HBars, Line } from "../components/charts";
import {
  IcBookOpen, IcCap, IcChart, IcCheck, IcCheckC, IcClipboard, IcDownload, IcEdit, IcEye, IcFileText, IcHistory,
  IcLayers, IcMail, IcMoney, IcPlus, IcSearch, IcShield, IcTarget, IcTrash, IcTrend, IcUsers, IcX,
} from "../components/icons";

/* shared bits */
function Tbl({ head, children, min = "min-w-150" }: { head: string[]; children: React.ReactNode; min?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-pine-700/10 bg-white shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
      <div className="overflow-x-auto">
        <table className={cx("w-full text-left text-[13px]", min)}>
          <thead><tr className="border-b-2 border-pine-700/12 text-[11px] font-extrabold uppercase tracking-wider text-ink-2/55 dark:border-pine-200/12 dark:text-pine-200/45">
            {head.map((h) => <th key={h} className="px-4 py-3.5 first:pl-5 last:pr-5">{h}</th>)}</tr></thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}
const rowCls = "border-b border-pine-700/6 last:border-0 transition-colors hover:bg-pine-700/3 dark:border-pine-200/6 dark:hover:bg-pine-200/4";
const td = "px-4 py-3 first:pl-5 last:pr-5";

/* ── Dashboard ───────────────────────────────────────────────────────────── */
export function AdminDashboard() {
  const { db } = useApp();
  const students = db.users.filter((u) => u.role === "student");
  const teachers = db.users.filter((u) => u.role === "teacher");
  const activeEnr = db.enrollments.filter((e) => e.status === "active");
  const revenue = db.payments.filter((p) => p.status === "completed").reduce((n, p) => n + p.amount, 0);
  const pending = db.payments.filter((p) => p.status === "pending");
  const enrTrend = monthSeries(6, (s, e) => db.enrollments.filter((x) => x.enrolledAt >= s && x.enrolledAt < e).length);
  const revTrend = monthSeries(6, (s, e) => db.payments.filter((p) => p.status === "completed" && p.date >= s && p.date < e).reduce((n, p) => n + p.amount, 0));
  const popular = [...db.courses].sort((a, b) => b.enrolledCount - a.enrolledCount).slice(0, 5).map((c) => ({ label: c.title.length > 30 ? c.title.slice(0, 30) + "…" : c.title, value: c.enrolledCount }));
  const avgPerf = db.results.length ? Math.round(db.results.reduce((n, r) => n + (r.score / r.maxScore) * 100, 0) / db.results.length) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={<IcUsers size={19} />} label="Students" value={students.length} sub={`${students.filter((s) => s.active).length} active`} />
        <Stat icon={<IcCap size={19} />} label="Teachers" value={teachers.length} sub={`${db.users.filter((u) => u.role === "parent").length} parents`} tone="sun" />
        <Stat icon={<IcBookOpen size={19} />} label="Courses" value={db.courses.length} sub={`${db.courses.filter((c) => c.published).length} published`} tone="night" />
        <Stat icon={<IcTrend size={19} />} label="Active enrollments" value={activeEnr.length} sub={`${db.enrollments.filter((e) => e.status === "completed").length} completed`} tone="clay" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={<IcMoney size={19} />} label="Revenue" value={ksh(revenue)} sub="completed payments" />
        <Stat icon={<IcClock16 />} label="Pending payments" value={pending.length} sub={ksh(pending.reduce((n, p) => n + p.amount, 0))} tone="sun" />
        <Stat icon={<IcClipboard size={19} />} label="Assignments" value={db.submissions.length} sub={`${db.submissions.filter((s) => s.status === "submitted").length} awaiting marks`} tone="night" />
        <Stat icon={<IcTarget size={19} />} label="Quiz attempts" value={db.attempts.length} sub={`${db.attempts.filter((a) => a.passed).length} passed`} tone="clay" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal><section className="rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <h3 className="font-display text-lg font-bold">Enrollment trend</h3>
          <div className="mt-4"><Line points={enrTrend.values} labels={enrTrend.labels} height={160} /></div>
        </section></Reveal>
        <Reveal delay={100}><section className="rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <h3 className="font-display text-lg font-bold">Revenue trend (KSh)</h3>
          <div className="mt-4"><Bars data={revTrend.values.map((v, i) => ({ label: revTrend.labels[i], value: v }))} height={160} color="var(--color-sun-500)" format={(v) => ksh(v)} /></div>
        </section></Reveal>
        <Reveal><section className="rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <h3 className="font-display text-lg font-bold">Most popular courses</h3>
          <div className="mt-4"><HBars data={popular} format={(v) => `${v} learners`} /></div>
        </section></Reveal>
        <Reveal delay={100}><section className="rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-bold">Platform performance</h3>
              <p className="mt-2 max-w-55 text-[13px] leading-relaxed text-ink-2/80 dark:text-pine-200/60">Average of all released results across subjects this term.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="pine">{db.results.length} results</Badge>
                <Badge tone="sun">{db.quizzes.length} quizzes live</Badge>
                <Badge tone="gray">{db.resources.length} resources</Badge>
              </div>
            </div>
            <Donut value={avgPerf} size={130} stroke={13} sub="avg score" />
          </div>
        </section></Reveal>
      </div>

      <Reveal><section className="rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold"><IcHistory size={18} className="text-sun-600 dark:text-sun-400" /> Recent audit activity</h3>
          <Link to="/app/audit" className="link-sweep text-[13px] font-extrabold text-sun-700 dark:text-sun-400">Full log</Link>
        </div>
        <div className="mt-3.5 space-y-1">
          {db.audit.slice(0, 6).map((a) => (
            <div key={a.id} className="flex items-center gap-3.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-pine-700/4 dark:hover:bg-pine-200/4">
              <Badge tone="gray" className="w-34 justify-center capitalize">{a.action.replace(/_/g, " ")}</Badge>
              <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink-2 dark:text-pine-200/75">{a.details}</span>
              <span className="shrink-0 text-[11px] font-bold text-ink-2/50 dark:text-pine-200/40">{a.userName} · {timeAgo(a.date)}</span>
            </div>
          ))}
        </div>
      </section></Reveal>
    </div>
  );
}
function IcClock16() { return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.4 2" /></svg>; }

/* ── Users ───────────────────────────────────────────────────────────────── */
export function AdminUsers() {
  const { db, user: me } = useApp();
  const toast = useToast();
  const [params] = reactRouterUseSearchParams();
  const [q, setQ] = useState(""); const [role, setRole] = useState(params.get("role") ?? ""); const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);
  const [deact, setDeact] = useState<User | null>(null);
  const [f, setF] = useState({ name: "", email: "", phone: "", role: "student" as Role, gradeId: "", active: true });
  const per = 8;

  const list = useMemo(() => {
    let out = db.users;
    if (role) out = out.filter((u) => u.role === role);
    if (q.trim()) out = out.filter((u) => (u.name + " " + u.email + " " + (u.studentCode ?? "")).toLowerCase().includes(q.toLowerCase()));
    return [...out].sort((a, b) => b.createdAt - a.createdAt);
  }, [db, q, role]);
  const pages = Math.max(1, Math.ceil(list.length / per));
  const shown = list.slice((page - 1) * per, page * per);

  const openCreate = () => { setF({ name: "", email: "", phone: "", role: "student", gradeId: "", active: true }); setCreating(true); };
  const openEdit = (u: User) => { setF({ name: u.name, email: u.email, phone: u.phone ?? "", role: u.role, gradeId: u.gradeId ?? "", active: u.active }); setEditing(u); };
  const save = () => {
    const res = adminSaveUser({ id: editing?.id, name: f.name, email: f.email, phone: f.phone, role: f.role, gradeId: f.gradeId || undefined, active: f.active });
    if (res.error) { toast.push(res.error, "err"); return; }
    if (res.tempPassword) toast.push(`Account created. Temporary password: ${res.tempPassword} (emailed in production)`, "info");
    else toast.push("User updated.");
    setCreating(false); setEditing(null);
  };
  const doReset = (u: User) => { const t = resetUserPassword(u.id); toast.push(`Password reset for ${u.name}. Temporary: ${t}`, "info"); };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52"><IcSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-2/50 dark:text-pine-200/50" /><TextInput value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search name, email, student code…" className="pl-10" aria-label="Search users" /></div>
        <Select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} className="w-40" aria-label="Filter role">
          <option value="">All roles</option><option value="student">Students</option><option value="teacher">Teachers</option><option value="parent">Parents</option><option value="admin">Admins</option>
        </Select>
        <Btn variant="outline" size="sm" onClick={() => { exportCSV(list.map((u) => ({ name: u.name, email: u.email, role: u.role, active: u.active ? "yes" : "no", joined: fmtDate(u.createdAt) })), "ssgt-users.csv"); toast.push("CSV exported."); }}><IcDownload size={14} /> Export</Btn>
        <Btn onClick={openCreate}><IcPlus size={15} /> Add user</Btn>
      </div>

      <div className="mt-5">
        <Tbl head={["User", "Role", "Details", "Joined", "Status", "Actions"]}>
          {shown.map((u) => (
            <tr key={u.id} className={rowCls}>
              <td className={td}><span className="flex items-center gap-3"><Avatar name={u.name} color={u.color} size={36} /><span><span className="block font-bold">{u.name}</span><span className="text-[11.5px] font-semibold text-ink-2/55 dark:text-pine-200/45">{u.email}</span></span></span></td>
              <td className={td}><Badge tone={u.role === "admin" ? "night" : u.role === "teacher" ? "pine" : u.role === "parent" ? "sun" : "gray"} className="capitalize">{u.role}</Badge></td>
              <td className={td + " font-semibold text-ink-2 dark:text-pine-200/65"}>{u.role === "student" ? <>{gradeName(u.gradeId ?? "")} · <span className="font-mono text-[11.5px]">{u.studentCode}</span></> : u.role === "teacher" ? u.subjectIds?.map(subjectName).join(", ") : u.role === "parent" ? `${u.linkedStudentIds?.length ?? 0} linked learner(s)` : "Platform admin"}</td>
              <td className={td + " whitespace-nowrap font-semibold text-ink-2 dark:text-pine-200/65"}>{fmtDate(u.createdAt)}</td>
              <td className={td}><Badge tone={u.active ? "pine" : "clay"}>{u.active ? "Active" : "Deactivated"}</Badge></td>
              <td className={td}>
                <div className="flex gap-1.5">
                  <button onClick={() => openEdit(u)} aria-label={`Edit ${u.name}`} className="cursor-pointer rounded-md p-1.5 text-ink-2/70 transition-colors hover:bg-pine-700/10 hover:text-pine-800 dark:text-pine-200/60 dark:hover:text-paper"><IcEdit size={15} /></button>
                  <button onClick={() => doReset(u)} aria-label={`Reset password for ${u.name}`} title="Reset password" className="cursor-pointer rounded-md p-1.5 text-ink-2/70 transition-colors hover:bg-sun-500/15 hover:text-sun-700 dark:text-pine-200/60"><IcShield size={15} /></button>
                  {u.id !== me?.id && (
                    u.active
                      ? <button onClick={() => setDeact(u)} aria-label={`Deactivate ${u.name}`} className="cursor-pointer rounded-md p-1.5 text-ink-2/70 transition-colors hover:bg-clay-500/12 hover:text-clay-600 dark:text-pine-200/60"><IcX size={15} /></button>
                      : <button onClick={() => { commit((d) => { d.users.find((x) => x.id === u.id)!.active = true; }, { action: "activate_user", entity: "user", details: u.name }); toast.push(`${u.name} reactivated.`); }} className="cursor-pointer rounded-md p-1.5 text-pine-700 transition-colors hover:bg-pine-700/10 dark:text-pine-300" aria-label={`Reactivate ${u.name}`}><IcCheck size={15} /></button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </Tbl>
        <div className="mt-5"><Pager page={page} pages={pages} onPage={setPage} /></div>
      </div>

      <Modal open={creating || !!editing} onClose={() => { setCreating(false); setEditing(null); }} title={editing ? `Edit ${editing.name}` : "Add user"}>
        <div className="space-y-4">
          <Field label="Full name"><TextInput value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email"><TextInput type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
            <Field label="Phone"><TextInput value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Role"><Select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as Role })}><option value="student">Student</option><option value="teacher">Teacher</option><option value="parent">Parent</option><option value="admin">Admin</option></Select></Field>
            {f.role === "student" && <Field label="Grade"><Select value={f.gradeId} onChange={(e) => setF({ ...f, gradeId: e.target.value })}><option value="">—</option>{db.grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</Select></Field>}
          </div>
          <div className="flex items-center gap-3"><Toggle on={f.active} onChange={(v) => setF({ ...f, active: v })} label="Account active" /><span className="text-[13px] font-bold">{f.active ? "Account active" : "Account deactivated"}</span></div>
          {!editing && <p className="rounded-lg bg-sun-500/10 px-3.5 py-2.5 text-[12px] font-bold text-ink-2 dark:text-pine-200/75">A temporary password is generated on creation and emailed in production.</p>}
          <div className="flex justify-end gap-2"><Btn variant="ghost" onClick={() => { setCreating(false); setEditing(null); }}>Cancel</Btn><Btn onClick={save}><IcCheckC size={15} /> {editing ? "Save changes" : "Create user"}</Btn></div>
        </div>
      </Modal>

      <Confirm open={!!deact} onClose={() => setDeact(null)} title="Deactivate account?" yesLabel="Deactivate"
        body={`${deact?.name} will be signed out and blocked from logging in. Their records are preserved and can be reactivated at any time.`}
        onYes={() => { if (deact) { commit((d) => { d.users.find((x) => x.id === deact.id)!.active = false; }, { action: "deactivate_user", entity: "user", details: deact.name }); toast.push(`${deact.name} deactivated.`, "info"); } }} />
    </div>
  );
}


/* ── Courses admin ───────────────────────────────────────────────────────── */
export function AdminCourses() {
  const { db } = useApp();
  const toast = useToast();
  const [editing, setEditing] = useState<Course | null>(null);
  const [f, setF] = useState({ title: "", description: "", price: 0, teacherId: "", featured: false });
  const teachers = db.users.filter((u) => u.role === "teacher" && u.active);

  const open = (c: Course) => { setF({ title: c.title, description: c.description, price: c.price, teacherId: c.teacherId, featured: c.featured }); setEditing(c); };
  const save = () => {
    if (!editing) return;
    commit((d) => { Object.assign(d.courses.find((c) => c.id === editing.id)!, { title: f.title, description: f.description, price: f.price, teacherId: f.teacherId, featured: f.featured }); },
      { action: "update_course", entity: "course", details: f.title });
    toast.push("Course updated."); setEditing(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13.5px] font-semibold text-ink-2 dark:text-pine-200/65">{db.courses.length} courses · enrolment, pricing and publication managed centrally.</p>
        <Btn variant="outline" size="sm" onClick={() => { exportCSV(db.courses.map((c) => ({ title: c.title, subject: subjectName(c.subjectId), grade: gradeName(c.gradeId), price: c.price, enrolled: c.enrolledCount, published: c.published ? "yes" : "no" })), "ssgt-courses.csv"); toast.push("CSV exported."); }}><IcDownload size={14} /> Export</Btn>
      </div>
      <div className="mt-5">
        <Tbl head={["Course", "Teacher", "Price", "Enrolled", "Featured", "Published", ""]}>
          {db.courses.map((c) => (
            <tr key={c.id} className={rowCls}>
              <td className={td}><span className="flex items-center gap-3"><span className="h-10 w-14 shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-pine-700 to-pine-950"><img src={c.image} alt="" className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} /></span><span className="max-w-60"><span className="block truncate font-bold">{c.title}</span><span className="text-[11.5px] font-semibold text-ink-2/55 dark:text-pine-200/45">{subjectName(c.subjectId)} · {gradeName(c.gradeId)}</span></span></span></td>
              <td className={td + " font-semibold"}>{userById(c.teacherId)?.name}</td>
              <td className={td + " font-bold"}>{c.price === 0 ? <Badge tone="pine">Free</Badge> : ksh(c.price)}</td>
              <td className={td + " font-bold"}>{c.enrolledCount}</td>
              <td className={td}><Toggle on={c.featured} label={`Feature ${c.title}`} onChange={(v) => { commit((d) => { d.courses.find((x) => x.id === c.id)!.featured = v; d.settings.featuredCourseIds = d.courses.filter((x) => x.featured).map((x) => x.id); }, { action: "toggle_featured", entity: "course", details: c.title }); toast.push(v ? "Added to homepage features." : "Removed from homepage features.", "info"); }} /></td>
              <td className={td}><Toggle on={c.published} label={`Publish ${c.title}`} onChange={(v) => { commit((d) => { d.courses.find((x) => x.id === c.id)!.published = v; }, { action: v ? "publish_course" : "unpublish_course", entity: "course", details: c.title }); }} /></td>
              <td className={td}><div className="flex justify-end"><Link to={`/courses/${c.id}`} className="cursor-pointer rounded-md p-1.5 text-ink-2/70 hover:bg-pine-700/10 dark:text-pine-200/60" aria-label={`View ${c.title}`}><IcEye size={15} /></Link><button onClick={() => open(c)} className="cursor-pointer rounded-md p-1.5 text-ink-2/70 hover:bg-pine-700/10 hover:text-pine-800 dark:text-pine-200/60" aria-label={`Edit ${c.title}`}><IcEdit size={15} /></button></div></td>
            </tr>
          ))}
        </Tbl>
      </div>
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit course">
        <div className="space-y-4">
          <Field label="Title"><TextInput value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
          <Field label="Description"><TextArea rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Teacher"><Select value={f.teacherId} onChange={(e) => setF({ ...f, teacherId: e.target.value })}>{teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</Select></Field>
            <Field label="Price (KSh)"><TextInput type="number" min={0} value={f.price} onChange={(e) => setF({ ...f, price: Math.max(0, Number(e.target.value)) })} /></Field>
          </div>
          <div className="flex items-center gap-3"><Toggle on={f.featured} onChange={(v) => setF({ ...f, featured: v })} label="Featured" /><span className="text-[13px] font-bold">Featured on homepage</span></div>
          <div className="flex justify-end gap-2"><Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn><Btn onClick={save}><IcCheckC size={15} /> Save</Btn></div>
        </div>
      </Modal>
    </div>
  );
}

/* ── Subjects admin ──────────────────────────────────────────────────────── */
export function AdminSubjects() {
  const { db } = useApp();
  const toast = useToast();
  const [editing, setEditing] = useState<Subject | null>(null);
  const [creating, setCreating] = useState(false);
  const [f, setF] = useState({ name: "", short: "", description: "", color: "#0C5A43", icon: "book", levelIds: [] as string[] });

  const open = (s: Subject) => { setF({ name: s.name, short: s.short, description: s.description, color: s.color, icon: s.icon, levelIds: [...s.levelIds] }); setEditing(s); };
  const save = () => {
    if (f.name.trim().length < 3) { toast.push("Subject name is too short.", "err"); return; }
    if (editing) {
      commit((d) => { Object.assign(d.subjects.find((s) => s.id === editing.id)!, f); }, { action: "update_subject", entity: "subject", details: f.name });
      toast.push("Subject updated.");
    } else {
      commit((d) => { d.subjects.push({ id: uid(), name: f.name.trim(), short: f.short || f.name.slice(0, 3).toUpperCase(), description: f.description, color: f.color, icon: f.icon, levelIds: f.levelIds, active: true }); },
        { action: "create_subject", entity: "subject", details: f.name });
      toast.push(`Subject "${f.name}" added — it's immediately available in course builders.`);
    }
    setEditing(null); setCreating(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13.5px] font-semibold text-ink-2 dark:text-pine-200/65">Subjects are database-driven — add, rename or deactivate and every page updates.</p>
        <Btn onClick={() => { setF({ name: "", short: "", description: "", color: "#0C5A43", icon: "book", levelIds: [] }); setCreating(true); }}><IcPlus size={15} /> Add subject</Btn>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {db.subjects.map((s) => (
          <div key={s.id} className={cx("rounded-xl border bg-white p-5 shadow-[var(--shadow-card)] dark:bg-night-800", s.active ? "border-pine-700/10 dark:border-pine-200/10" : "border-clay-500/30 opacity-70")}>
            <div className="flex items-start justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-xl text-paper" style={{ background: s.color }}><IcLayers size={20} /></span>
              <div className="flex items-center gap-2">
                <Badge tone={s.active ? "pine" : "clay"}>{s.active ? "Active" : "Inactive"}</Badge>
                <Toggle on={s.active} label={`Activate ${s.name}`} onChange={(v) => { commit((d) => { d.subjects.find((x) => x.id === s.id)!.active = v; }, { action: v ? "activate_subject" : "deactivate_subject", entity: "subject", details: s.name }); }} />
              </div>
            </div>
            <h3 className="mt-3 font-display text-[16px] font-bold">{s.name}</h3>
            <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-ink-2/80 dark:text-pine-200/60">{s.description}</p>
            <div className="mt-3 flex items-center justify-between border-t border-pine-700/8 pt-3 dark:border-pine-200/8">
              <span className="text-[11.5px] font-bold text-ink-2/60 dark:text-pine-200/50">{db.courses.filter((c) => c.subjectId === s.id).length} courses · {db.resources.filter((r) => r.subjectId === s.id).length} resources</span>
              <Btn variant="outline" size="sm" onClick={() => open(s)}><IcEdit size={13} /> Edit</Btn>
            </div>
          </div>
        ))}
      </div>

      <Modal open={creating || !!editing} onClose={() => { setCreating(false); setEditing(null); }} title={editing ? `Edit ${editing.name}` : "Add subject"}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_110px]">
            <Field label="Name"><TextInput value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Pre-Technical Studies" /></Field>
            <Field label="Short code"><TextInput value={f.short} onChange={(e) => setF({ ...f, short: e.target.value.toUpperCase() })} placeholder="PTS" /></Field>
          </div>
          <Field label="Description"><TextArea rows={2} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Accent colour"><div className="flex flex-wrap gap-1.5">{["#0C5A43", "#B56508", "#C4562E", "#1F6A50", "#8F4D0D", "#357E62", "#A84625", "#083528"].map((c) => <button key={c} onClick={() => setF({ ...f, color: c })} aria-label={`Colour ${c}`} className={cx("h-7 w-7 cursor-pointer rounded-full transition-transform hover:scale-110", f.color === c && "ring-2 ring-sun-500 ring-offset-2")} style={{ background: c }} />)}</div></Field>
            <Field label="Icon key"><Select value={f.icon} onChange={(e) => setF({ ...f, icon: e.target.value })}>{["target", "book", "drum", "spark", "globe", "money", "leaf", "code", "sun", "flame", "shield"].map((i) => <option key={i}>{i}</option>)}</Select></Field>
          </div>
          <Field label="Levels">
            <div className="flex flex-wrap gap-2">
              {db.levels.map((l) => {
                const on = f.levelIds.includes(l.id);
                return <button key={l.id} onClick={() => setF({ ...f, levelIds: on ? f.levelIds.filter((x) => x !== l.id) : [...f.levelIds, l.id] })} aria-pressed={on}
                  className={cx("cursor-pointer rounded-lg border-[1.5px] px-3 py-1.5 text-[12px] font-bold transition-all", on ? "border-pine-700 bg-pine-700 text-paper dark:border-sun-500 dark:bg-sun-500 dark:text-pine-950" : "border-pine-700/20 text-ink-2 dark:border-pine-200/20 dark:text-pine-200/70")}>{l.name}</button>;
              })}
            </div>
          </Field>
          <div className="flex justify-end gap-2"><Btn variant="ghost" onClick={() => { setCreating(false); setEditing(null); }}>Cancel</Btn><Btn onClick={save}><IcCheckC size={15} /> {editing ? "Save" : "Add subject"}</Btn></div>
        </div>
      </Modal>
    </div>
  );
}

/* ── Curriculum tree ─────────────────────────────────────────────────────── */
export function AdminCurriculum() {
  const { db } = useApp();
  const toast = useToast();
  const [addLevel, setAddLevel] = useState<string | null>(null);
  const [addGrade, setAddGrade] = useState<string | null>(null);
  const [name, setName] = useState("");

  const saveLevel = () => {
    if (!addLevel || name.trim().length < 3) return;
    commit((d) => { d.levels.push({ id: uid(), curriculumId: addLevel, name: name.trim(), order: d.levels.filter((l) => l.curriculumId === addLevel).length + 1 }); },
      { action: "create_level", entity: "curriculum", details: name });
    toast.push("Level added."); setAddLevel(null); setName("");
  };
  const saveGrade = () => {
    if (!addGrade || name.trim().length < 3) return;
    commit((d) => { d.grades.push({ id: uid(), levelId: addGrade, name: name.trim(), order: d.grades.filter((g) => g.levelId === addGrade).length + 1 }); },
      { action: "create_grade", entity: "curriculum", details: name });
    toast.push("Grade added."); setAddGrade(null); setName("");
  };

  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-[13.5px] leading-relaxed text-ink-2 dark:text-pine-200/65">The academic spine of the platform: <strong>Curriculum → Level → Grade → Subject → Course → Module → Lesson → Assessment</strong>. Extending it here instantly extends every filter and form.</p>
      {db.curricula.map((cur) => (
        <Reveal key={cur.id}>
          <section className="overflow-hidden rounded-xl border border-pine-700/10 bg-white shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
            <div className="flex items-center gap-3 border-b border-pine-700/8 bg-pine-700/4 px-5 py-4 dark:border-pine-200/8 dark:bg-pine-200/5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-pine-700 text-paper dark:bg-sun-500 dark:text-pine-950"><IcLayers size={17} /></span>
              <div><h3 className="font-display text-[16.5px] font-bold">{cur.name}</h3><p className="text-[12px] font-semibold text-ink-2/60 dark:text-pine-200/50">{cur.description}</p></div>
              <button onClick={() => { setAddLevel(cur.id); setName(""); }} className="ml-auto flex cursor-pointer items-center gap-1.5 text-[12.5px] font-extrabold text-pine-700 hover:underline dark:text-sun-400"><IcPlus size={14} /> Add level</button>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              {db.levels.filter((l) => l.curriculumId === cur.id).sort((a, b) => a.order - b.order).map((l) => (
                <div key={l.id} className="rounded-lg border border-pine-700/10 p-4 dark:border-pine-200/10">
                  <div className="flex items-center justify-between">
                    <p className="font-display text-[14.5px] font-bold">{l.name}</p>
                    <button onClick={() => { setAddGrade(l.id); setName(""); }} className="cursor-pointer text-[11.5px] font-extrabold text-pine-700 hover:underline dark:text-sun-400">+ grade</button>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {db.grades.filter((g) => g.levelId === l.id).sort((a, b) => a.order - b.order).map((g) => (
                      <span key={g.id} className="group relative rounded-md border border-pine-700/15 bg-paper px-2.5 py-1 text-[12px] font-bold dark:border-pine-200/15 dark:bg-night-850">
                        {g.name}
                        <span className="ml-1.5 text-[10px] font-black text-ink-2/45 dark:text-pine-200/35">{db.courses.filter((c) => c.gradeId === g.id).length}c</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>
      ))}
      <Modal open={!!addLevel || !!addGrade} onClose={() => { setAddLevel(null); setAddGrade(null); }} title={addLevel ? "Add education level" : "Add grade / form"}>
        <Field label="Name"><TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder={addLevel ? "e.g. Senior Secondary (Grade 10–12)" : "e.g. Grade 4"} autoFocus /></Field>
        <div className="mt-5 flex justify-end gap-2"><Btn variant="ghost" onClick={() => { setAddLevel(null); setAddGrade(null); }}>Cancel</Btn><Btn onClick={addLevel ? saveLevel : saveGrade}><IcPlus size={15} /> Add</Btn></div>
      </Modal>
    </div>
  );
}

/* ── Resources admin ─────────────────────────────────────────────────────── */
export function AdminResources() {
  const { db } = useApp();
  const toast = useToast();
  const [creating, setCreating] = useState(false);
  const [f, setF] = useState({ title: "", kind: "notes" as Resource["kind"], subjectId: "", gradeId: "", description: "", downloadEnabled: true });
  const save = () => {
    if (f.title.trim().length < 5) { toast.push("Give the resource a proper title.", "err"); return; }
    commit((d) => { d.resources.unshift({ id: uid(), title: f.title.trim(), kind: f.kind, subjectId: f.subjectId || d.subjects[0].id, gradeId: f.gradeId || d.grades[2].id, description: f.description || f.title, sizeKB: 480, downloads: 0, downloadEnabled: f.downloadEnabled, active: true }); },
      { action: "create_resource", entity: "resource", details: f.title });
    toast.push("Resource published to the library."); setCreating(false);
  };
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13.5px] font-semibold text-ink-2 dark:text-pine-200/65">Control what learners can download. Restricted items stay visible but locked.</p>
        <Btn onClick={() => { setF({ title: "", kind: "notes", subjectId: "", gradeId: "", description: "", downloadEnabled: true }); setCreating(true); }}><IcPlus size={15} /> Add resource</Btn>
      </div>
      <div className="mt-5">
        <Tbl head={["Resource", "Type", "Subject / Grade", "Downloads", "Downloadable", "Active", ""]}>
          {db.resources.map((r) => (
            <tr key={r.id} className={rowCls}>
              <td className={td + " max-w-70"}><span className="block truncate font-bold">{r.title}</span><span className="text-[11.5px] font-semibold text-ink-2/55 dark:text-pine-200/45">{(r.sizeKB / 1024).toFixed(1)} MB{r.year ? ` · ${r.year}` : ""}</span></td>
              <td className={td}><Badge tone="sun" className="capitalize">{r.kind.replace("-", " ")}</Badge></td>
              <td className={td + " font-semibold text-ink-2 dark:text-pine-200/65"}>{subjectName(r.subjectId)} · {gradeName(r.gradeId)}</td>
              <td className={td + " font-bold"}>{r.downloads.toLocaleString()}</td>
              <td className={td}><Toggle on={r.downloadEnabled} label={`Allow download ${r.title}`} onChange={(v) => { commit((d) => { d.resources.find((x) => x.id === r.id)!.downloadEnabled = v; }, { action: "toggle_download", entity: "resource", details: `${r.title} → ${v ? "enabled" : "restricted"}` }); toast.push(v ? "Downloads enabled." : "Downloads restricted.", "info"); }} /></td>
              <td className={td}><Toggle on={r.active} label={`Activate ${r.title}`} onChange={(v) => { commit((d) => { d.resources.find((x) => x.id === r.id)!.active = v; }, { action: v ? "activate_resource" : "deactivate_resource", entity: "resource", details: r.title }); }} /></td>
              <td className={td}><button onClick={() => { commit((d) => { d.resources.find((x) => x.id === r.id)!.active = false; }, { action: "deactivate_resource", entity: "resource", details: r.title }); toast.push("Resource removed from library.", "info"); }} aria-label={`Remove ${r.title}`} className="cursor-pointer rounded-md p-1.5 text-ink-2/70 hover:bg-clay-500/12 hover:text-clay-600 dark:text-pine-200/60"><IcTrash size={15} /></button></td>
            </tr>
          ))}
        </Tbl>
      </div>
      <Modal open={creating} onClose={() => setCreating(false)} title="Add resource">
        <div className="space-y-4">
          <Field label="Title"><TextInput value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Grade 9 Physics Formula Sheet" /></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Type"><Select value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value as Resource["kind"] })}>{["notes", "past-paper", "marking-scheme", "worksheet", "study-guide", "practice", "video"].map((k) => <option key={k} value={k}>{k.replace("-", " ")}</option>)}</Select></Field>
            <Field label="Subject"><Select value={f.subjectId} onChange={(e) => setF({ ...f, subjectId: e.target.value })}><option value="">Choose…</option>{db.subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></Field>
            <Field label="Grade"><Select value={f.gradeId} onChange={(e) => setF({ ...f, gradeId: e.target.value })}><option value="">Choose…</option>{db.grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</Select></Field>
          </div>
          <Field label="Description"><TextArea rows={2} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
          <div className="flex items-center gap-3"><Toggle on={f.downloadEnabled} onChange={(v) => setF({ ...f, downloadEnabled: v })} label="Downloadable" /><span className="text-[13px] font-bold">Learners may download</span></div>
          <p className="rounded-lg bg-pine-700/6 px-3.5 py-2.5 text-[11.5px] leading-relaxed text-ink-2/75 dark:bg-pine-200/8 dark:text-pine-200/60">Files live in object storage (S3-compatible) in production — type and size are validated server-side before the record is created.</p>
          <div className="flex justify-end gap-2"><Btn variant="ghost" onClick={() => setCreating(false)}>Cancel</Btn><Btn onClick={save}><IcCheckC size={15} /> Publish</Btn></div>
        </div>
      </Modal>
    </div>
  );
}

/* ── Enrollments ─────────────────────────────────────────────────────────── */
export function AdminEnrollments() {
  const { db } = useApp();
  const toast = useToast();
  const [status, setStatus] = useState("");
  const list = db.enrollments.filter((e) => !status || e.status === status).sort((a, b) => b.enrolledAt - a.enrolledAt);
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-44" aria-label="Filter by status">
          <option value="">All statuses</option><option value="active">Active</option><option value="pending">Pending</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
        </Select>
        <span className="text-[13px] font-bold text-ink-2/70 dark:text-pine-200/60">{list.length} enrollments</span>
        <span className="ml-auto"><Btn variant="outline" size="sm" onClick={() => { exportCSV(list.map((e) => ({ student: userById(e.studentId)?.name, course: courseById(e.courseId)?.title, status: e.status, payment: e.paymentStatus, enrolled: fmtDate(e.enrolledAt) })), "ssgt-enrollments.csv"); toast.push("CSV exported."); }}><IcDownload size={14} /> Export</Btn></span>
      </div>
      <div className="mt-5">
        <Tbl head={["Student", "Course", "Enrolled", "Payment", "Status"]}>
          {list.map((e) => (
            <tr key={e.id} className={rowCls}>
              <td className={td}><span className="flex items-center gap-2.5"><Avatar name={userById(e.studentId)?.name ?? "?"} color={userById(e.studentId)?.color ?? "#888"} size={30} /><span className="font-bold">{userById(e.studentId)?.name}</span></span></td>
              <td className={td + " max-w-70 truncate font-semibold"}>{courseById(e.courseId)?.title}</td>
              <td className={td + " whitespace-nowrap font-semibold text-ink-2 dark:text-pine-200/65"}>{fmtDate(e.enrolledAt)}</td>
              <td className={td}><Badge tone={e.paymentStatus === "paid" ? "pine" : e.paymentStatus === "pending" ? "sun" : "gray"}>{e.paymentStatus}</Badge></td>
              <td className={td}>
                <Select value={e.status} aria-label="Enrollment status" className="w-34 py-1.5 text-[12px]"
                  onChange={(ev) => { commit((d) => { d.enrollments.find((x) => x.id === e.id)!.status = ev.target.value as never; }, { action: "update_enrollment", entity: "enrollment", details: `${userById(e.studentId)?.name} → ${ev.target.value}` }); toast.push("Enrollment updated.", "info"); }}>
                  <option value="active">Active</option><option value="pending">Pending</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                </Select>
              </td>
            </tr>
          ))}
        </Tbl>
      </div>
    </div>
  );
}

/* ── Payments ────────────────────────────────────────────────────────────── */
export function AdminPayments() {
  const { db } = useApp();
  const toast = useToast();
  const [receipt, setReceipt] = useState<string | null>(null);
  const pays = [...db.payments].sort((a, b) => b.date - a.date);
  const r = receipt ? db.payments.find((p) => p.id === receipt) : null;
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13.5px] font-semibold text-ink-2 dark:text-pine-200/65">M-Pesa STK, card and bank rails — no card data is ever stored, only references and statuses.</p>
        <Btn variant="outline" size="sm" onClick={() => { exportCSV(pays.map((p) => ({ student: userById(p.studentId)?.name, course: courseById(p.courseId)?.title, amount: p.amount, method: p.method, status: p.status, reference: p.reference, date: fmtDate(p.date) })), "ssgt-payments.csv"); toast.push("CSV exported."); }}><IcDownload size={14} /> Export</Btn>
      </div>
      <div className="mt-5">
        <Tbl head={["Date", "Student", "Course", "Method", "Reference", "Amount", "Status", ""]}>
          {pays.map((p) => (
            <tr key={p.id} className={rowCls}>
              <td className={td + " whitespace-nowrap font-semibold text-ink-2 dark:text-pine-200/65"}>{fmtDate(p.date)}</td>
              <td className={td + " font-bold"}>{userById(p.studentId)?.name}</td>
              <td className={td + " max-w-55 truncate font-semibold"}>{courseById(p.courseId)?.title}</td>
              <td className={td}><Badge tone="gray" className="uppercase">{p.method}</Badge></td>
              <td className={td + " font-mono text-[12px] font-bold"}>{p.reference}</td>
              <td className={td + " font-black"}>{ksh(p.amount)}</td>
              <td className={td}><Badge tone={p.status === "completed" ? "pine" : p.status === "pending" ? "sun" : "clay"}>{p.status}</Badge></td>
              <td className={td}>
                <div className="flex justify-end gap-1.5">
                  <button onClick={() => setReceipt(p.id)} className="cursor-pointer rounded-md p-1.5 text-ink-2/70 hover:bg-pine-700/10 dark:text-pine-200/60" aria-label="View receipt"><IcEye size={15} /></button>
                  {p.status === "pending" && <>
                    <button title="Confirm payment" aria-label="Confirm payment" onClick={() => { confirmPayment(p.studentId, p.courseId, p.amount, p.method, "SGA" + p.reference.slice(-6).toUpperCase(), p.phone); toast.push("Payment confirmed — enrollment activated & receipt sent."); }} className="cursor-pointer rounded-md p-1.5 text-pine-700 hover:bg-pine-700/10 dark:text-pine-300"><IcCheck size={15} /></button>
                    <button title="Mark failed" aria-label="Mark failed" onClick={() => { commit((d) => { d.payments.find((x) => x.id === p.id)!.status = "failed"; }, { action: "fail_payment", entity: "payment", details: p.reference }); toast.push("Marked as failed.", "info"); }} className="cursor-pointer rounded-md p-1.5 text-clay-600 hover:bg-clay-500/12"><IcX size={15} /></button>
                  </>}
                </div>
              </td>
            </tr>
          ))}
        </Tbl>
      </div>
      <Modal open={!!r} onClose={() => setReceipt(null)} title="Payment receipt">
        {r && (
          <div>
            <div className="rounded-xl border-2 border-dashed border-pine-700/25 p-5 text-center dark:border-pine-200/25">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-ink-2/55 dark:text-pine-200/45">School Smart Guide Tutors</p>
              <p className="mt-2 font-display text-3xl font-black">{ksh(r.amount)}</p>
              <Badge tone={r.status === "completed" ? "pine" : r.status === "pending" ? "sun" : "clay"} className="mt-2">{r.status}</Badge>
            </div>
            <dl className="mt-4 space-y-2 text-[13.5px] font-semibold">
              {[["Student", userById(r.studentId)?.name ?? ""], ["Course", courseById(r.courseId)?.title ?? ""], ["Method", r.method.toUpperCase()], ["Reference", r.reference], ["Phone", r.phone ?? "—"], ["Date", fmtDate(r.date)]].map(([k2, v]) => (
                <div key={k2} className="flex justify-between gap-4 border-b border-pine-700/8 pb-2 last:border-0 dark:border-pine-200/8"><dt className="text-ink-2/70 dark:text-pine-200/55">{k2}</dt><dd className="text-right font-bold">{v}</dd></div>
              ))}
            </dl>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ── Messages ────────────────────────────────────────────────────────────── */
export function AdminMessages() {
  const { db } = useApp();
  const toast = useToast();
  return (
    <div className="space-y-3.5">
      {db.contacts.length === 0 && <Empty icon={<IcMail size={24} />} title="Inbox empty" body="Contact form submissions from the public website land here." />}
      {db.contacts.map((c) => (
        <div key={c.id} className={cx("rounded-xl border bg-white p-5 shadow-[var(--shadow-card)] dark:bg-night-800", c.read ? "border-pine-700/10 dark:border-pine-200/10" : "border-sun-500/40 bg-sun-500/4")}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-display text-[15.5px] font-bold">{c.subject} {!c.read && <Badge tone="sun" className="ml-1.5">New</Badge>}</p>
              <p className="mt-0.5 text-[12.5px] font-bold text-ink-2/60 dark:text-pine-200/50">{c.name} · {c.email}{c.phone ? ` · ${c.phone}` : ""} · {timeAgo(c.date)}</p>
            </div>
            <div className="flex gap-1.5">
              {!c.read && <Btn size="sm" variant="outline" onClick={() => { commit((d) => { d.contacts.find((x) => x.id === c.id)!.read = true; }); toast.push("Marked as read.", "info"); }}><IcCheck size={13} /> Read</Btn>}
              <button onClick={() => { commit((d) => { d.contacts = d.contacts.filter((x) => x.id !== c.id); }, { action: "delete_contact", entity: "contact", details: c.subject }); toast.push("Message deleted.", "info"); }} aria-label="Delete message" className="cursor-pointer rounded-md p-1.5 text-ink-2/70 hover:bg-clay-500/12 hover:text-clay-600 dark:text-pine-200/60"><IcTrash size={15} /></button>
            </div>
          </div>
          <p className="mt-3 rounded-lg bg-pine-700/4 p-4 text-[13.5px] leading-relaxed text-ink-2 dark:bg-pine-200/5 dark:text-pine-200/75">{c.message}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Audit ───────────────────────────────────────────────────────────────── */
export function AdminAudit() {
  const { db } = useApp();
  const [q, setQ] = useState("");
  const list = db.audit.filter((a) => !q.trim() || (a.action + " " + a.entity + " " + a.details + " " + a.userName).toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <div className="relative max-w-sm"><IcSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-2/50 dark:text-pine-200/50" /><TextInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by action, user, details…" className="pl-10" aria-label="Filter audit log" /></div>
      <div className="mt-5">
        <Tbl head={["When", "Actor", "Action", "Entity", "Details"]}>
          {list.slice(0, 60).map((a) => (
            <tr key={a.id} className={rowCls}>
              <td className={td + " whitespace-nowrap font-semibold text-ink-2 dark:text-pine-200/65"}>{fmtDate(a.date)} · {new Date(a.date).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}</td>
              <td className={td + " font-bold"}>{a.userName}</td>
              <td className={td}><Badge tone="gray" className="capitalize">{a.action.replace(/_/g, " ")}</Badge></td>
              <td className={td + " font-semibold capitalize text-ink-2 dark:text-pine-200/65"}>{a.entity}</td>
              <td className={td + " max-w-90 truncate font-semibold text-ink-2 dark:text-pine-200/70"}>{a.details}</td>
            </tr>
          ))}
        </Tbl>
      </div>
    </div>
  );
}

/* ── Reports ─────────────────────────────────────────────────────────────── */
export function AdminReports() {
  const { db } = useApp();
  const toast = useToast();
  const subjPerf = db.subjects.filter((s) => s.active).map((s) => {
    const rs = db.results.filter((r) => r.subjectId === s.id);
    return { label: s.name, value: rs.length ? Math.round(rs.reduce((n, r) => n + (r.score / r.maxScore) * 100, 0) / rs.length) : 0 };
  }).filter((x) => x.value > 0);
  const quizPerf = db.quizzes.map((qz) => {
    const at = db.attempts.filter((a) => a.quizId === qz.id);
    return { label: qz.title.length > 28 ? qz.title.slice(0, 28) + "…" : qz.title, value: at.length ? Math.round(at.reduce((n, a) => n + a.percent, 0) / at.length) : 0 };
  }).filter((x) => x.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2.5">
        {[
          ["Results CSV", () => exportCSV(db.results.map((r) => ({ student: userById(r.studentId)?.name, subject: subjectName(r.subjectId), assessment: r.assessment, score: r.score, max: r.maxScore, term: r.term, date: fmtDate(r.date) })), "ssgt-results.csv")],
          ["Enrollments CSV", () => exportCSV(db.enrollments.map((e) => ({ student: userById(e.studentId)?.name, course: courseById(e.courseId)?.title, status: e.status, date: fmtDate(e.enrolledAt) })), "ssgt-enrollments.csv")],
          ["Payments CSV", () => exportCSV(db.payments.map((p) => ({ student: userById(p.studentId)?.name, amount: p.amount, status: p.status, reference: p.reference })), "ssgt-payments.csv")],
        ].map(([label, fn]) => (
          <Btn key={label as string} variant="outline" size="sm" onClick={() => { (fn as () => void)(); toast.push(`${label} downloaded.`); }}><IcDownload size={14} /> {label as string}</Btn>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal><section className="rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <h3 className="font-display text-lg font-bold">Average score by subject</h3>
          <div className="mt-4"><HBars data={subjPerf} format={(v) => `${v}%`} /></div>
        </section></Reveal>
        <Reveal delay={100}><section className="rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <h3 className="font-display text-lg font-bold">Quiz performance</h3>
          <div className="mt-4"><HBars data={quizPerf} color="var(--color-pine-600)" format={(v) => `${v}%`} /></div>
        </section></Reveal>
      </div>
    </div>
  );
}

/* ── Settings / CMS ──────────────────────────────────────────────────────── */
export function AdminSettings() {
  const { db } = useApp();
  const toast = useToast();
  const s = db.settings;
  const [contact, setContact] = useState({ academyName: s.academyName, contactEmail: s.contactEmail, contactPhone: s.contactPhone, address: s.address, socials: { ...s.socials } });
  const [regOpen, setRegOpen] = useState(s.registrationOpen);

  const saveContact = () => {
    if (!contact.academyName.trim() || !contact.contactPhone.trim() || !/^\S+@\S+\.\S+$/.test(contact.contactEmail)) {
      toast.push("Academy name, phone and a valid email are required.", "err"); return;
    }
    saveSettings(contact); toast.push("Academy contact information saved — header, footer and dashboards update immediately.");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Reveal><section className="rounded-xl border border-pine-700/10 bg-white p-6 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-sun-700 dark:text-sun-400">Academy Settings</p>
        <h3 className="mt-1 font-display text-lg font-bold">Contact Information</h3>
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-2/70 dark:text-pine-200/55">The single source of truth for the academy's contact details — rendered in the website header, contact page, footer, about page and every dashboard's support block. Only administrators can edit this.</p>
        <div className="mt-4 rounded-lg border border-pine-700/12 bg-pine-700/4 p-4 dark:border-pine-200/12 dark:bg-pine-200/5">
          <dl className="grid gap-2.5 text-[13px] font-semibold sm:grid-cols-3">
            <div><dt className="text-[10.5px] font-extrabold uppercase tracking-wider text-ink-2/55 dark:text-pine-200/45">Academy Name</dt><dd className="mt-0.5 font-display text-[14px] font-bold">{s.academyName}</dd></div>
            <div><dt className="text-[10.5px] font-extrabold uppercase tracking-wider text-ink-2/55 dark:text-pine-200/45">Academy Phone</dt><dd className="mt-0.5 font-display text-[14px] font-bold text-pine-800 dark:text-pine-200">{s.contactPhone}</dd></div>
            <div><dt className="text-[10.5px] font-extrabold uppercase tracking-wider text-ink-2/55 dark:text-pine-200/45">Academy Email</dt><dd className="mt-0.5 break-all font-display text-[13px] font-bold text-pine-800 dark:text-pine-200">{s.contactEmail}</dd></div>
          </dl>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-lg border border-pine-700/10 px-4 py-3.5 dark:border-pine-200/10">
          <div><p className="text-[14px] font-bold">Open registration</p><p className="text-[12px] text-ink-2/70 dark:text-pine-200/55">When off, the sign-up page shows a notice and blocks new accounts.</p></div>
          <Toggle on={regOpen} onChange={(v) => { setRegOpen(v); saveSettings({ registrationOpen: v }); toast.push(v ? "Registration reopened." : "Registration paused.", "info"); }} label="Open registration" />
        </div>
        <div className="mt-4 space-y-3.5">
          <Field label="Academy name"><TextInput value={contact.academyName} onChange={(e) => setContact({ ...contact, academyName: e.target.value })} /></Field>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label="Academy phone"><TextInput value={contact.contactPhone} onChange={(e) => setContact({ ...contact, contactPhone: e.target.value })} /></Field>
            <Field label="Academy email"><TextInput type="email" value={contact.contactEmail} onChange={(e) => setContact({ ...contact, contactEmail: e.target.value })} /></Field>
          </div>
          <Field label="Office address" hint="Leave blank until an official address is confirmed — it stays hidden across the site meanwhile."><TextInput value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} placeholder="To be provided" /></Field>
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-2/55 dark:text-pine-200/45">Social media links (optional — icons appear in the footer once filled)</p>
          <div className="grid gap-3.5 sm:grid-cols-2">
            {(["facebook", "x", "youtube", "whatsapp"] as const).map((k) => (
              <Field key={k} label={k === "x" ? "X (Twitter)" : k[0].toUpperCase() + k.slice(1)}><TextInput value={contact.socials[k]} onChange={(e) => setContact({ ...contact, socials: { ...contact.socials, [k]: e.target.value } })} placeholder="https://…" /></Field>
            ))}
          </div>
          <Btn onClick={saveContact}><IcCheckC size={15} /> Save contact information</Btn>
        </div>
      </section></Reveal>

      <div className="space-y-6">
        <Reveal delay={100}><section className="rounded-xl border border-pine-700/10 bg-white p-6 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <h3 className="font-display text-lg font-bold">Homepage testimonials</h3>
          <p className="mt-1 text-[12.5px] text-ink-2/70 dark:text-pine-200/55">Edited here, rendered on the public homepage instantly.</p>
          <div className="mt-4 space-y-3">
            {s.testimonials.map((t, i) => (
              <div key={t.id} className="rounded-lg border border-pine-700/10 p-3.5 dark:border-pine-200/10">
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <TextInput defaultValue={t.name} aria-label="Name" onBlur={(e) => { const next = [...s.testimonials]; next[i] = { ...t, name: e.target.value }; saveSettings({ testimonials: next }); }} />
                  <TextInput defaultValue={t.role} aria-label="Role" onBlur={(e) => { const next = [...s.testimonials]; next[i] = { ...t, role: e.target.value }; saveSettings({ testimonials: next }); }} />
                </div>
                <TextArea rows={2} className="mt-2.5" defaultValue={t.quote} aria-label="Quote" onBlur={(e) => { const next = [...s.testimonials]; next[i] = { ...t, quote: e.target.value }; saveSettings({ testimonials: next }); toast.push("Testimonial updated."); }} />
              </div>
            ))}
          </div>
        </section></Reveal>
        <Reveal delay={160}><section className="rounded-xl border border-pine-700/10 bg-white p-6 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <h3 className="font-display text-lg font-bold">FAQs</h3>
          <div className="mt-4 space-y-3">
            {s.faqs.map((fq, i) => (
              <div key={fq.id} className="rounded-lg border border-pine-700/10 p-3.5 dark:border-pine-200/10">
                <TextInput defaultValue={fq.q} aria-label="Question" className="font-bold" onBlur={(e) => { const next = [...s.faqs]; next[i] = { ...fq, q: e.target.value }; saveSettings({ faqs: next }); }} />
                <TextArea rows={2} className="mt-2.5" defaultValue={fq.a} aria-label="Answer" onBlur={(e) => { const next = [...s.faqs]; next[i] = { ...fq, a: e.target.value }; saveSettings({ faqs: next }); toast.push("FAQ updated."); }} />
              </div>
            ))}
          </div>
          <Btn variant="outline" size="sm" className="mt-3" onClick={() => { saveSettings({ faqs: [...s.faqs, { id: uid(), q: "New question?", a: "Answer…" }] }); toast.push("FAQ added — edit it above."); }}><IcPlus size={14} /> Add FAQ</Btn>
        </section></Reveal>
      </div>
    </div>
  );
}
