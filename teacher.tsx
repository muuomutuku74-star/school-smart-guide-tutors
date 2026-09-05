--- src/pages/teacher.tsx (原始)
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  addResult, commit, courseById, courseProgress, gradeName, gradeSubmission, lessonsOf, publishAnnouncement,
  subjectName, uid, useApp, userById,
} from "../lib/db";
import type { Audience, Course, Submission } from "../lib/types";
import { Avatar, Badge, Btn, Confirm, Empty, Field, Modal, Progress, Reveal, Select, Stat, Tabs, TextArea, TextInput, Toggle, cx, fmtDate, ksh, timeAgo, useToast } from "../components/ui";
import { Bars, HBars } from "../components/charts";
import { IcArrowR, IcBookOpen, IcCheckC, IcClipboard, IcClock, IcEdit, IcMsg, IcPlus, IcTarget, IcTrash, IcTrend, IcUsers, IcUpload } from "../components/icons";

const useMe = () => { const { user } = useApp(); return user!; };

/* ── Teacher dashboard ───────────────────────────────────────────────────── */
export function TeacherDashboard() {
  const { db } = useApp();
  const me = useMe();
  const myCourses = db.courses.filter((c) => c.teacherId === me.id);
  const myCourseIds = new Set(myCourses.map((c) => c.id));
  const myStudents = [...new Set(db.enrollments.filter((e) => e.status !== "cancelled" && myCourseIds.has(e.courseId)).map((e) => e.studentId))];
  const queue = db.submissions.filter((s) => s.status === "submitted" && myCourseIds.has(assignmentCourse(s)?.id ?? ""));
  const myResults = db.results.filter((r) => r.courseId ? myCourseIds.has(r.courseId) : false);
  const avgScore = myResults.length ? Math.round(myResults.reduce((n, r) => n + (r.score / r.maxScore) * 100, 0) / myResults.length) : 0;

  function assignmentCourse(s: Submission) { const a = db.assignments.find((x) => x.id === s.assignmentId); return a ? courseById(a.courseId) : undefined; }

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="board-bg noise relative overflow-hidden rounded-2xl p-6 sm:p-8">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-sun-400">Teacher workspace · {new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long" })}</p>
          <h2 className="mt-2 font-display text-3xl font-black text-paper sm:text-4xl">Habari, {me.name.split(" ")[0]} 🍎</h2>
          <p className="mt-2 max-w-xl text-[14px] text-pine-100/75">
            {queue.length > 0
              ? <>You have <strong className="text-sun-400">{queue.length} submission{queue.length > 1 ? "s" : ""}</strong> waiting for marking.</>
              : "Your marking queue is clear — beautiful."}{" "}
            Your courses reached <strong className="text-sun-400">{myStudents.length} learners</strong> this term.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link to="/app/assignments"><Btn variant="accent">Open marking queue {queue.length > 0 && `(${queue.length})`}</Btn></Link>
            <Link to="/app/my-courses"><Btn variant="outline" className="border-paper/25 text-paper hover:border-sun-400 hover:bg-paper/5">Manage courses</Btn></Link>
          </div>
        </div>
      </Reveal>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={<IcBookOpen size={19} />} label="My courses" value={myCourses.length} sub={`${myCourses.reduce((n, c) => n + lessonsOf(c.id).length, 0)} lessons published`} />
        <Stat icon={<IcUsers size={19} />} label="My students" value={myStudents.length} sub="across all courses" tone="sun" />
        <Stat icon={<IcClipboard size={19} />} label="To mark" value={queue.length} sub={queue.length ? "submissions pending" : "queue clear"} tone={queue.length ? "clay" : "pine"} />
        <Stat icon={<IcTrend size={19} />} label="Avg class score" value={myResults.length ? `${avgScore}%` : "—"} sub={`${myResults.length} results released`} tone="night" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Reveal><section className="rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <h3 className="font-display text-lg font-bold">Enrolment by course</h3>
          <div className="mt-4">
            <HBars data={myCourses.map((c) => ({ label: c.title.length > 34 ? c.title.slice(0, 34) + "…" : c.title, value: c.enrolledCount }))} format={(v) => `${v} learners`} />
          </div>
        </section></Reveal>
        <Reveal delay={120}><section className="rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold"><IcClipboard size={18} className="text-sun-600 dark:text-sun-400" /> Marking queue</h3>
          <div className="mt-3.5 space-y-2.5">
            {queue.slice(0, 4).map((s) => {
              const st = userById(s.studentId); const c = assignmentCourse(s);
              return (
                <Link to="/app/assignments" key={s.id} className="flex items-center gap-3 rounded-lg border border-pine-700/8 px-3.5 py-2.5 transition-colors hover:border-sun-500/50 dark:border-pine-200/8">
                  <Avatar name={st?.name ?? "?"} color={st?.color ?? "#888"} size={34} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-bold">{st?.name}</span>
                    <span className="block truncate text-[11.5px] font-bold text-ink-2/55 dark:text-pine-200/45">{c?.title} · {timeAgo(s.submittedAt)}</span>
                  </span>
                  <Badge tone="sun">mark</Badge>
                </Link>
              );
            })}
            {queue.length === 0 && <p className="px-1 py-3 text-[13px] font-semibold text-ink-2/60 dark:text-pine-200/50">All caught up. New submissions will appear here with a notification.</p>}
          </div>
        </section></Reveal>
      </div>
    </div>
  );
}

/* ── Teacher course manager ──────────────────────────────────────────────── */
export function TeacherCourses() {
  const { db } = useApp();
  const me = useMe();
  const toast = useToast();
  const [courseModal, setCourseModal] = useState<null | { id?: string }>(null);
  const [lessonModal, setLessonModal] = useState<null | { courseId: string; moduleId: string }>(null);
  const [moduleFor, setModuleFor] = useState<string | null>(null);
  const [delCourse, setDelCourse] = useState<Course | null>(null);
  const [cf, setCf] = useState({ title: "", subjectId: "", gradeId: "", description: "", price: 0, image: "" });
  const [mf, setMf] = useState({ title: "" });
  const [lf, setLf] = useState({ title: "", kind: "notes" as "notes" | "video" | "reading", minutes: 10, content: "" });
  const myCourses = db.courses.filter((c) => c.teacherId === me.id);

  const openNew = () => { setCf({ title: "", subjectId: db.subjects.find((s) => s.active)?.id ?? "", gradeId: db.grades[2]?.id ?? "", description: "", price: 0, image: "" }); setCourseModal({}); };
  const openEdit = (c: Course) => { setCf({ title: c.title, subjectId: c.subjectId, gradeId: c.gradeId, description: c.description, price: c.price, image: c.image }); setCourseModal({ id: c.id }); };

  const saveCourse = () => {
    if (cf.title.trim().length < 6) { toast.push("Give the course a fuller title (6+ characters).", "err"); return; }
    if (courseModal?.id) {
      commit((d) => { Object.assign(d.courses.find((c) => c.id === courseModal.id)!, { title: cf.title.trim(), subjectId: cf.subjectId, gradeId: cf.gradeId, description: cf.description, price: cf.price, image: cf.image || undefined }); },
        { action: "update_course", entity: "course", details: cf.title });
      toast.push("Course updated.");
    } else {
      const id = uid();
      commit((d) => {
        d.courses.unshift({
          id, title: cf.title.trim(), slug: cf.title.trim().toLowerCase().replace(/[^\w]+/g, "-").slice(0, 40),
          subjectId: cf.subjectId, gradeId: cf.gradeId,
          curriculumId: d.grades.find((g) => g.id === cf.gradeId)?.levelId.startsWith("lvl-844") ? "curr-844" : "curr-cbc",
          teacherId: me.id, description: cf.description || cf.title, image: cf.image || "https://image.qwenlm.ai/generated-images/dc381962-eb3f-4424-8a88-26ed3a8fb05f/_result.png",
          rating: 0, ratingCount: 0, enrolledCount: 0, price: cf.price, featured: false, published: true, objectives: ["Master the core concepts", "Practise with guided questions", "Pass the course assessment"], createdAt: Date.now(),
        });
      }, { action: "create_course", entity: "course", details: cf.title });
      toast.push(`Course "${cf.title}" created — now add modules and lessons.`);
    }
    setCourseModal(null);
  };

  const addModule = () => {
    if (!moduleFor || mf.title.trim().length < 3) return;
    commit((d) => {
      const order = d.modules.filter((m) => m.courseId === moduleFor).length + 1;
      d.modules.push({ id: uid(), courseId: moduleFor, title: mf.title.trim(), order });
    }, { action: "create_module", entity: "module", details: mf.title });
    toast.push("Module added."); setModuleFor(null); setMf({ title: "" });
  };

  const addLesson = () => {
    if (!lessonModal) return;
    if (lf.title.trim().length < 4 || lf.content.trim().length < 40) { toast.push("Lesson needs a title and at least 40 characters of content.", "err"); return; }
    commit((d) => {
      const order = d.lessons.filter((l) => l.moduleId === lessonModal.moduleId).length + 1;
      d.lessons.push({ id: uid(), moduleId: lessonModal.moduleId, courseId: lessonModal.courseId, title: lf.title.trim(), kind: lf.kind, minutes: lf.minutes, content: lf.content.trim(), order, resourceIds: [] });
    }, { action: "create_lesson", entity: "lesson", details: lf.title });
    toast.push("Lesson published to learners."); setLessonModal(null); setLf({ title: "", kind: "notes", minutes: 10, content: "" });
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13.5px] font-semibold text-ink-2 dark:text-pine-200/65">Create courses, publish lessons and control enrolment — everything is audit-logged.</p>
        <Btn onClick={openNew}><IcPlus size={16} /> New course</Btn>
      </div>
      {myCourses.length === 0 ? <div className="mt-8"><Empty icon={<IcBookOpen size={26} />} title="No courses yet" body="Create your first course, then add modules and lessons." action={<Btn onClick={openNew}>Create course</Btn>} /></div> : (
        <div className="mt-6 space-y-5">
          {myCourses.map((c) => {
            const mods = db.modules.filter((m) => m.courseId === c.id).sort((a, b) => a.order - b.order);
            return (
              <Reveal key={c.id}>
                <div className="overflow-hidden rounded-xl border border-pine-700/10 bg-white shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
                  <div className="flex flex-wrap items-center gap-4 p-5">
                    <span className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-pine-700 to-pine-950">
                      <img src={c.image} alt="" className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link to={`/courses/${c.id}`} className="font-display text-[16.5px] font-bold hover:text-pine-700 dark:hover:text-sun-400">{c.title}</Link>
                        <Badge tone={c.published ? "pine" : "clay"}>{c.published ? "Published" : "Unpublished"}</Badge>
                        {c.price > 0 && <Badge tone="sun">{ksh(c.price)}</Badge>}
                      </div>
                      <p className="mt-1 text-[12.5px] font-bold text-ink-2/60 dark:text-pine-200/50">{subjectName(c.subjectId)} · {gradeName(c.gradeId)} · {c.enrolledCount} enrolled · {lessonsOf(c.id).length} lessons</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 rounded-lg border border-pine-700/12 px-2.5 py-1.5 dark:border-pine-200/12">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-2/60 dark:text-pine-200/50">Live</span>
                        <Toggle on={c.published} label={`Publish ${c.title}`} onChange={(v) => { commit((d) => { d.courses.find((x) => x.id === c.id)!.published = v; }, { action: v ? "publish_course" : "unpublish_course", entity: "course", details: c.title }); toast.push(v ? "Course is live." : "Course hidden from catalogue.", "info"); }} />
                      </div>
                      <Btn variant="outline" size="sm" onClick={() => openEdit(c)}><IcEdit size={14} /> Edit</Btn>
                      <Btn variant="ghost" size="sm" onClick={() => setDelCourse(c)} aria-label={`Delete ${c.title}`}><IcTrash size={14} /></Btn>
                    </div>
                  </div>
                  <div className="border-t border-pine-700/8 bg-pine-700/[0.03] p-5 dark:border-pine-200/8 dark:bg-pine-200/[0.03]">
                    {mods.map((m, mi) => (
                      <div key={m.id} className="mb-3 last:mb-0">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[13px] font-extrabold"><span className="text-sun-700 dark:text-sun-400">{mi + 1}.</span> {m.title}</p>
                          <button onClick={() => setLessonModal({ courseId: c.id, moduleId: m.id })} className="cursor-pointer text-[12px] font-extrabold text-pine-700 hover:underline dark:text-sun-400">+ Add lesson</button>
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          {db.lessons.filter((l) => l.moduleId === m.id).sort((a, b) => a.order - b.order).map((l) => (
                            <span key={l.id} className="rounded-md border border-pine-700/10 bg-paper px-2.5 py-1 text-[11.5px] font-bold text-ink-2 dark:border-pine-200/10 dark:bg-night-850 dark:text-pine-200/75">{l.kind === "video" ? "▶" : "§"} {l.title} · {l.minutes}m</span>
                          ))}
                          {db.lessons.filter((l) => l.moduleId === m.id).length === 0 && <span className="text-[12px] font-semibold italic text-ink-2/50 dark:text-pine-200/40">No lessons yet</span>}
                        </div>
                      </div>
                    ))}
                    <button onClick={() => { setModuleFor(c.id); setMf({ title: "" }); }} className="mt-2 flex cursor-pointer items-center gap-1.5 text-[12.5px] font-extrabold text-pine-700 hover:underline dark:text-sun-400"><IcPlus size={14} /> Add module</button>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}

      {/* course modal */}
      <Modal open={!!courseModal} onClose={() => setCourseModal(null)} title={courseModal?.id ? "Edit course" : "New course"} wide>
        <div className="space-y-4">
          <Field label="Course title"><TextInput value={cf.title} onChange={(e) => setCf({ ...cf, title: e.target.value })} placeholder="e.g. Grade 8 Mathematics: Fractions Mastery" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Subject"><Select value={cf.subjectId} onChange={(e) => setCf({ ...cf, subjectId: e.target.value })}>{db.subjects.filter((s) => s.active).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></Field>
            <Field label="Grade / Form"><Select value={cf.gradeId} onChange={(e) => setCf({ ...cf, gradeId: e.target.value })}>{db.grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</Select></Field>
          </div>
          <Field label="Short description"><TextArea rows={3} value={cf.description} onChange={(e) => setCf({ ...cf, description: e.target.value })} placeholder="One or two sentences shown on the course card." /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Price (KSh)" hint="0 makes the course free."><TextInput type="number" min={0} step={50} value={cf.price} onChange={(e) => setCf({ ...cf, price: Math.max(0, Number(e.target.value)) })} /></Field>
            <Field label="Cover image URL (optional)"><TextInput value={cf.image} onChange={(e) => setCf({ ...cf, image: e.target.value })} placeholder="https://…" /></Field>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Btn variant="ghost" onClick={() => setCourseModal(null)}>Cancel</Btn>
            <Btn onClick={saveCourse}><IcCheckC size={15} /> {courseModal?.id ? "Save changes" : "Create course"}</Btn>
          </div>
        </div>
      </Modal>

      {/* module modal */}
      <Modal open={!!moduleFor} onClose={() => setModuleFor(null)} title="Add module">
        <Field label="Module title"><TextInput value={mf.title} onChange={(e) => setMf({ title: e.target.value })} placeholder="e.g. Working with Fractions" autoFocus /></Field>
        <div className="mt-5 flex justify-end gap-2"><Btn variant="ghost" onClick={() => setModuleFor(null)}>Cancel</Btn><Btn onClick={addModule}><IcPlus size={15} /> Add module</Btn></div>
      </Modal>

      {/* lesson modal */}
      <Modal open={!!lessonModal} onClose={() => setLessonModal(null)} title="New lesson" wide>
        <div className="space-y-4">
          <Field label="Lesson title"><TextInput value={lf.title} onChange={(e) => setLf({ ...lf, title: e.target.value })} placeholder="e.g. Adding and Subtracting Fractions" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type"><Select value={lf.kind} onChange={(e) => setLf({ ...lf, kind: e.target.value as never })}><option value="notes">Notes</option><option value="video">Video</option><option value="reading">Reading</option></Select></Field>
            <Field label="Duration (minutes)"><TextInput type="number" min={1} value={lf.minutes} onChange={(e) => setLf({ ...lf, minutes: Math.max(1, Number(e.target.value)) })} /></Field>
          </div>
          <Field label="Lesson content" hint="Formatting: '## ' headings · '- ' bullets · '> ' key ideas · wrap terms in **bold**.">
            <TextArea rows={9} value={lf.content} onChange={(e) => setLf({ ...lf, content: e.target.value })} placeholder={"## Introduction\n\nExplain the idea simply…\n\n- point one\n- point two\n\n> Key idea to remember."} />
          </Field>
          <div className="flex justify-end gap-2"><Btn variant="ghost" onClick={() => setLessonModal(null)}>Cancel</Btn><Btn onClick={addLesson}><IcCheckC size={15} /> Publish lesson</Btn></div>
        </div>
      </Modal>

      <Confirm open={!!delCourse} onClose={() => setDelCourse(null)} title="Unpublish course?" yesLabel="Unpublish"
        body={`"${delCourse?.title}" will be hidden from the catalogue. Enrolled learners keep access and progress. You can re-publish it any time.`}
        onYes={() => { if (delCourse) { commit((d) => { d.courses.find((c) => c.id === delCourse.id)!.published = false; }, { action: "unpublish_course", entity: "course", details: delCourse.title }); toast.push("Course unpublished.", "info"); } }} />
    </div>
  );
}

/* ── Grading ─────────────────────────────────────────────────────────────── */
export function GradingPage() {
  const { db } = useApp();
  const me = useMe();
  const toast = useToast();
  const [tab, setTab] = useState("submitted");
  const [grading, setGrading] = useState<Submission | null>(null);
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");

  const myCourseIds = new Set(db.courses.filter((c) => c.teacherId === me.id).map((c) => c.id));
  const mine = db.submissions.filter((s) => { const a = db.assignments.find((x) => x.id === s.assignmentId); return a && myCourseIds.has(a.courseId); });
  const shown = mine.filter((s) => s.status === tab).sort((a, b) => b.submittedAt - a.submittedAt);

  const save = () => {
    if (!grading) return;
    const a = db.assignments.find((x) => x.id === grading.assignmentId)!;
    const m = Number(marks);
    if (isNaN(m) || m < 0 || m > a.maxMarks) { toast.push(`Marks must be between 0 and ${a.maxMarks}.`, "err"); return; }
    gradeSubmission(grading.id, m, feedback.trim());
    toast.push(`Marked ${userById(grading.studentId)?.name}: ${m}/${a.maxMarks}. Result published to the learner & parent.`);
    setGrading(null);
  };

  return (
    <div>
      <Tabs tabs={[
        { id: "submitted", label: "Awaiting marking", count: mine.filter((s) => s.status === "submitted").length },
        { id: "graded", label: "Marked", count: mine.filter((s) => s.status === "graded").length },
      ]} active={tab} onChange={setTab} />
      {shown.length === 0 ? <div className="mt-8"><Empty icon={<IcClipboard size={26} />} title={tab === "submitted" ? "Marking queue is clear" : "Nothing marked yet"} body={tab === "submitted" ? "Submissions from your assignments land here the moment learners submit." : "Marked work appears here with the grades you gave."} /></div> : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {shown.map((s) => {
            const st = userById(s.studentId);
            const a = db.assignments.find((x) => x.id === s.assignmentId)!;
            const c = courseById(a.courseId);
            return (
              <div key={s.id} className="flex flex-col rounded-xl border border-pine-700/10 bg-white p-5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
                <div className="flex items-center gap-3.5">
                  <Avatar name={st?.name ?? "?"} color={st?.color ?? "#888"} size={42} />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-[15.5px] font-bold">{st?.name}</p>
                    <p className="truncate text-[12px] font-bold text-ink-2/60 dark:text-pine-200/50">{a.title} · {c?.title}</p>
                  </div>
                  {s.status === "graded" ? <Badge tone="pine">{s.marks}/{a.maxMarks}</Badge> : <Badge tone="sun"><IcClock size={11} /> {timeAgo(s.submittedAt)}</Badge>}
                </div>
                <p className="mt-3.5 line-clamp-3 whitespace-pre-line rounded-lg bg-pine-700/4 p-3.5 text-[13px] leading-relaxed text-ink-2 dark:bg-pine-200/5 dark:text-pine-200/75">{s.text}</p>
                {s.fileName && <p className="mt-2 flex items-center gap-1.5 text-[12px] font-bold text-ink-2/65 dark:text-pine-200/55"><IcUpload size={13} /> {s.fileName}</p>}
                {s.status === "graded" && s.feedback && <p className="mt-2.5 text-[12.5px] italic text-ink-2/75 dark:text-pine-200/60">Feedback: {s.feedback}</p>}
                <div className="mt-auto pt-3.5">
                  <Btn size="sm" variant={s.status === "graded" ? "outline" : "primary"} className="w-full"
                    onClick={() => { setGrading(s); setMarks(s.marks !== undefined ? String(s.marks) : ""); setFeedback(s.feedback ?? ""); }}>
                    {s.status === "graded" ? "View / adjust mark" : "Mark submission"}
                  </Btn>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!grading} onClose={() => setGrading(null)} title="Mark submission" wide>
        {grading && (() => {
          const a = db.assignments.find((x) => x.id === grading.assignmentId)!;
          const st = userById(grading.studentId);
          return (
            <div>
              <div className="flex items-center gap-3">
                <Avatar name={st?.name ?? "?"} color={st?.color ?? "#888"} size={40} />
                <div><p className="font-display font-bold">{st?.name}</p><p className="text-[12px] font-bold text-ink-2/60 dark:text-pine-200/50">{a.title} · max {a.maxMarks} marks</p></div>
              </div>
              <p className="mt-4 max-h-48 overflow-y-auto whitespace-pre-line rounded-lg bg-pine-700/4 p-4 text-[13.5px] leading-relaxed dark:bg-pine-200/5">{grading.text}</p>
              {grading.fileName && <p className="mt-2 flex items-center gap-1.5 text-[12.5px] font-bold text-ink-2/70 dark:text-pine-200/60"><IcUpload size={14} /> Attached: {grading.fileName}</p>}
              <div className="mt-4 grid gap-4 sm:grid-cols-[140px_1fr]">
                <Field label={`Marks / ${a.maxMarks}`}><TextInput type="number" min={0} max={a.maxMarks} value={marks} onChange={(e) => setMarks(e.target.value)} /></Field>
                <Field label="Feedback to learner"><TextArea rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="One strength, one next step — learners read every word." /></Field>
              </div>
              <p className="mt-3 rounded-lg bg-sun-500/10 px-3.5 py-2.5 text-[12px] font-bold text-ink-2 dark:text-pine-200/75">Marking publishes a result to the learner's records, notifies the learner and their linked parent, and is written to the audit log.</p>
              <div className="mt-4 flex justify-end gap-2"><Btn variant="ghost" onClick={() => setGrading(null)}>Cancel</Btn><Btn onClick={save}><IcCheckC size={15} /> Publish mark</Btn></div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

/* ── Teacher students ────────────────────────────────────────────────────── */
export function TeacherStudents() {
  const { db } = useApp();
  const me = useMe();
  const myCourseIds = new Set(db.courses.filter((c) => c.teacherId === me.id).map((c) => c.id));
  const rows = useMemo(() => {
    const ids = [...new Set(db.enrollments.filter((e) => e.status !== "cancelled" && myCourseIds.has(e.courseId)).map((e) => e.studentId))];
    return ids.map((sid) => {
      const st = userById(sid)!;
      const ens = db.enrollments.filter((e) => e.studentId === sid && myCourseIds.has(e.courseId));
      const avgProg = Math.round(ens.reduce((n, e) => n + courseProgress(sid, e.courseId).percent, 0) / Math.max(1, ens.length));
      const results = db.results.filter((r) => r.studentId === sid);
      const avgRes = results.length ? Math.round(results.reduce((n, r) => n + (r.score / r.maxScore) * 100, 0) / results.length) : null;
      return { st, ens, avgProg, avgRes };
    }).sort((a, b) => b.avgProg - a.avgProg);
  }, [db]);
  return (
    <div className="overflow-hidden rounded-xl border border-pine-700/10 bg-white shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
      <div className="overflow-x-auto">
        <table className="w-full min-w-130 text-left text-[13px]">
          <thead><tr className="border-b-2 border-pine-700/12 text-[11px] font-extrabold uppercase tracking-wider text-ink-2/55 dark:border-pine-200/12 dark:text-pine-200/45">
            <th className="px-5 py-3.5">Learner</th><th className="px-3 py-3.5">Grade</th><th className="px-3 py-3.5">My courses</th><th className="px-3 py-3.5">Avg progress</th><th className="px-5 py-3.5">Avg score</th></tr></thead>
          <tbody>
            {rows.map(({ st, ens, avgProg, avgRes }) => (
              <tr key={st.id} className="border-b border-pine-700/6 transition-colors last:border-0 hover:bg-pine-700/3 dark:border-pine-200/6 dark:hover:bg-pine-200/4">
                <td className="px-5 py-3.5"><span className="flex items-center gap-3"><Avatar name={st.name} color={st.color} size={34} /><span><span className="block font-bold">{st.name}</span><span className="text-[11.5px] font-semibold text-ink-2/55 dark:text-pine-200/45">{st.email}</span></span></span></td>
                <td className="px-3 py-3.5 font-bold">{gradeName(st.gradeId ?? "")}</td>
                <td className="px-3 py-3.5"><span className="flex flex-wrap gap-1">{ens.map((e) => <Badge key={e.id} tone="gray">{courseById(e.courseId)?.title.split(":")[0].slice(0, 18)}</Badge>)}</span></td>
                <td className="px-3 py-3.5"><span className="flex items-center gap-2.5"><Progress value={avgProg} className="w-24" /><span className="text-[12px] font-black">{avgProg}%</span></span></td>
                <td className="px-5 py-3.5 font-bold">{avgRes !== null ? `${avgRes}%` : "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-[13px] font-semibold text-ink-2/60 dark:text-pine-200/50">No learners enrolled in your courses yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Announcements (teacher + admin) ─────────────────────────────────────── */
export function AnnouncementsPage({ scope = "teacher" }: { scope?: "teacher" | "admin" }) {
  const { db } = useApp();
  const me = useMe();
  const toast = useToast();
  const [f, setF] = useState({ title: "", content: "", audience: "all-students" as Audience, audienceRef: "", days: "" });
  const myCourses = scope === "teacher" ? db.courses.filter((c) => c.teacherId === me.id) : db.courses;
  const list = scope === "admin" ? db.announcements : db.announcements.filter((a) => a.authorId === me.id || a.audience === "teachers");

  const publish = () => {
    if (f.title.trim().length < 5 || f.content.trim().length < 20) { toast.push("Announcement needs a title and at least 20 characters.", "err"); return; }
    const ref = ["course", "grade"].includes(f.audience) ? f.audienceRef : undefined;
    const days = Number(f.days);
    const expiresAt = f.days && !isNaN(days) && days > 0 ? Date.now() + days * 86400000 : undefined;
    const n = publishAnnouncement({ title: f.title.trim(), content: f.content.trim(), audience: f.audience, audienceRef: ref, expiresAt });
    toast.push(`Published — ${n} ${n === 1 ? "person" : "people"} notified.`);
    setF({ title: "", content: "", audience: "all-students", audienceRef: "", days: "" });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      <section className="h-fit rounded-xl border border-pine-700/10 bg-white p-6 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold"><IcMsg size={18} className="text-sun-600 dark:text-sun-400" /> Publish announcement</h3>
        <div className="mt-4 space-y-4">
          <Field label="Title"><TextInput value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Revision clinic this Friday" /></Field>
          <Field label="Message"><TextArea rows={5} value={f.content} onChange={(e) => setF({ ...f, content: e.target.value })} placeholder="Write the announcement…" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Audience">
              <Select value={f.audience} onChange={(e) => setF({ ...f, audience: e.target.value as Audience, audienceRef: "" })}>
                <option value="all-students">All students</option>
                <option value="course">Specific course</option>
                <option value="grade">Specific grade</option>
                <option value="parents">Parents</option>
                <option value="teachers">Teachers</option>
                {scope === "admin" && <option value="everyone">Everyone</option>}
              </Select>
            </Field>
            {f.audience === "course" && (
              <Field label="Course"><Select value={f.audienceRef} onChange={(e) => setF({ ...f, audienceRef: e.target.value })}>
                <option value="">Choose…</option>{myCourses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </Select></Field>
            )}
            {f.audience === "grade" && (
              <Field label="Grade"><Select value={f.audienceRef} onChange={(e) => setF({ ...f, audienceRef: e.target.value })}>
                <option value="">Choose…</option>{db.grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </Select></Field>
            )}
            <Field label="Expires after (days)" hint="Blank = never expires.">
              <TextInput type="number" min={0} value={f.days} onChange={(e) => setF({ ...f, days: e.target.value })} placeholder="e.g. 14" />
            </Field>
          </div>
          <Btn onClick={publish} className="w-full"><IcMsg size={15} /> Publish & notify</Btn>
        </div>
      </section>
      <section>
        <h3 className="font-display text-lg font-bold">Published announcements</h3>
        <div className="mt-4 space-y-3">
          {list.length === 0 && <Empty icon={<IcMsg size={24} />} title="Nothing published" body="Announcements you publish appear here with their audience." />}
          {list.map((a) => (
            <div key={a.id} className="rounded-xl border border-pine-700/10 bg-white p-5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
              <div className="flex items-start justify-between gap-3">
                <p className="font-display text-[15.5px] font-bold">{a.title}</p>
                <Badge tone="sun" className="shrink-0 capitalize">{a.audience.replace("-", " ")}</Badge>
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2/85 dark:text-pine-200/65">{a.content}</p>
              <p className="mt-2.5 text-[11px] font-extrabold uppercase tracking-wider text-ink-2/50 dark:text-pine-200/40">
                {fmtDate(a.publishedAt)} · {userById(a.authorId)?.name ?? "SSGT"}
                {a.expiresAt && <span className="text-clay-600"> · expires {fmtDate(a.expiresAt)}</span>}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ── Results manager (teacher) ───────────────────────────────────────────── */
export function ManageResults() {
  const { db } = useApp();
  const me = useMe();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ studentId: "", subjectId: "", assessment: "", score: "", maxScore: "100", comment: "", term: "Term 1 2026" });
  const myCourseIds = new Set(db.courses.filter((c) => c.teacherId === me.id).map((c) => c.id));
  const myStudentIds = [...new Set(db.enrollments.filter((e) => e.status !== "cancelled" && myCourseIds.has(e.courseId)).map((e) => e.studentId))];
  const results = db.results.filter((r) => r.releasedBy === me.id || (r.courseId && myCourseIds.has(r.courseId))).sort((a, b) => b.date - a.date);

  const save = () => {
    const score = Number(f.score), max = Number(f.maxScore);
    if (!f.studentId || !f.assessment.trim() || isNaN(score) || isNaN(max) || max <= 0 || score < 0 || score > max) { toast.push("Fill learner, assessment and a valid score.", "err"); return; }
    addResult({ studentId: f.studentId, subjectId: f.subjectId || db.subjects[0].id, assessment: f.assessment.trim(), score, maxScore: max, comment: f.comment.trim(), term: f.term });
    toast.push("Result published — learner and parent notified.");
    setOpen(false); setF({ studentId: "", subjectId: "", assessment: "", score: "", maxScore: "100", comment: "", term: "Term 1 2026" });
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13.5px] font-semibold text-ink-2 dark:text-pine-200/65">Release results for CATs, mocks and marked work. Learners and linked parents are notified instantly.</p>
        <Btn onClick={() => setOpen(true)}><IcPlus size={16} /> Add result</Btn>
      </div>
      <div className="mt-6 overflow-hidden rounded-xl border border-pine-700/10 bg-white shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
        <div className="overflow-x-auto">
          <table className="w-full min-w-130 text-left text-[13px]">
            <thead><tr className="border-b-2 border-pine-700/12 text-[11px] font-extrabold uppercase tracking-wider text-ink-2/55 dark:border-pine-200/12 dark:text-pine-200/45">
              <th className="px-5 py-3.5">Date</th><th className="px-3 py-3.5">Learner</th><th className="px-3 py-3.5">Assessment</th><th className="px-3 py-3.5">Score</th><th className="px-5 py-3.5">Comment</th></tr></thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id} className="border-b border-pine-700/6 last:border-0 hover:bg-pine-700/3 dark:border-pine-200/6 dark:hover:bg-pine-200/4">
                  <td className="whitespace-nowrap px-5 py-3 font-semibold text-ink-2 dark:text-pine-200/70">{fmtDate(r.date)}</td>
                  <td className="px-3 py-3 font-bold">{userById(r.studentId)?.name}</td>
                  <td className="px-3 py-3 font-bold">{r.assessment}<span className="block text-[11px] font-semibold text-ink-2/50 dark:text-pine-200/40">{subjectName(r.subjectId)}</span></td>
                  <td className="px-3 py-3 font-bold">{r.score}/{r.maxScore} ({Math.round((r.score / r.maxScore) * 100)}%)</td>
                  <td className="max-w-55 px-5 py-3 text-[12.5px] text-ink-2/80 dark:text-pine-200/60">{r.comment}</td>
                </tr>
              ))}
              {results.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-[13px] font-semibold text-ink-2/60 dark:text-pine-200/50">No results released yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add result" wide>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Learner"><Select value={f.studentId} onChange={(e) => setF({ ...f, studentId: e.target.value })}>
            <option value="">Choose…</option>{myStudentIds.map((id) => <option key={id} value={id}>{userById(id)?.name}</option>)}
          </Select></Field>
          <Field label="Subject"><Select value={f.subjectId} onChange={(e) => setF({ ...f, subjectId: e.target.value })}>
            <option value="">Choose…</option>{db.subjects.filter((s) => s.active).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select></Field>
          <div className="sm:col-span-2"><Field label="Assessment name"><TextInput value={f.assessment} onChange={(e) => setF({ ...f, assessment: e.target.value })} placeholder="e.g. CAT 2 — Equations" /></Field></div>
          <Field label="Score"><TextInput type="number" value={f.score} onChange={(e) => setF({ ...f, score: e.target.value })} placeholder="72" /></Field>
          <Field label="Out of"><TextInput type="number" value={f.maxScore} onChange={(e) => setF({ ...f, maxScore: e.target.value })} /></Field>
          <Field label="Term"><Select value={f.term} onChange={(e) => setF({ ...f, term: e.target.value })}><option>Term 1 2026</option><option>Term 2 2026</option><option>Term 3 2025</option></Select></Field>
          <div className="sm:col-span-2"><Field label="Teacher comment"><TextArea rows={2} value={f.comment} onChange={(e) => setF({ ...f, comment: e.target.value })} placeholder="One line the learner will remember." /></Field></div>
        </div>
        <div className="mt-5 flex justify-end gap-2"><Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn><Btn onClick={save}><IcCheckC size={15} /> Publish result</Btn></div>
      </Modal>
    </div>
  );
}


+++ src/pages/teacher.tsx (修改后)
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  addResult, commit, courseById, courseProgress, gradeName, gradeSubmission, lessonsOf, publishAnnouncement,
  subjectName, uid, useApp, userById,
} from "../lib/db";
import type { Audience, Course, Submission } from "../lib/types";
import { Avatar, Badge, Btn, Confirm, Empty, Field, Modal, Progress, Reveal, Select, Stat, Tabs, TextArea, TextInput, Toggle, cx, fmtDate, ksh, timeAgo, useToast } from "../components/ui";
import { Bars, HBars } from "../components/charts";
import { IcArrowR, IcBookOpen, IcCheckC, IcClipboard, IcClock, IcEdit, IcMsg, IcPhone, IcPlus, IcTarget, IcTrash, IcTrend, IcUsers, IcUpload } from "../components/icons";

const useMe = () => { const { user } = useApp(); return user!; };

/* ── Teacher dashboard ───────────────────────────────────────────────────── */
export function TeacherDashboard() {
  const { db } = useApp();
  const me = useMe();
  const myCourses = db.courses.filter((c) => c.teacherId === me.id);
  const myCourseIds = new Set(myCourses.map((c) => c.id));
  const myStudents = [...new Set(db.enrollments.filter((e) => e.status !== "cancelled" && myCourseIds.has(e.courseId)).map((e) => e.studentId))];
  const queue = db.submissions.filter((s) => s.status === "submitted" && myCourseIds.has(assignmentCourse(s)?.id ?? ""));
  const myResults = db.results.filter((r) => r.courseId ? myCourseIds.has(r.courseId) : false);
  const avgScore = myResults.length ? Math.round(myResults.reduce((n, r) => n + (r.score / r.maxScore) * 100, 0) / myResults.length) : 0;

  function assignmentCourse(s: Submission) { const a = db.assignments.find((x) => x.id === s.assignmentId); return a ? courseById(a.courseId) : undefined; }

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="board-bg noise relative overflow-hidden rounded-2xl p-6 sm:p-8">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-sun-400">Teacher workspace · {new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long" })}</p>
          <h2 className="mt-2 font-display text-3xl font-black text-paper sm:text-4xl">Habari, {me.name.split(" ")[0]} 🍎</h2>
          <p className="mt-2 max-w-xl text-[14px] text-pine-100/75">
            {queue.length > 0
              ? <>You have <strong className="text-sun-400">{queue.length} submission{queue.length > 1 ? "s" : ""}</strong> waiting for marking.</>
              : "Your marking queue is clear — beautiful."}{" "}
            Your courses reached <strong className="text-sun-400">{myStudents.length} learners</strong> this term.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link to="/app/assignments"><Btn variant="accent">Open marking queue {queue.length > 0 && `(${queue.length})`}</Btn></Link>
            <Link to="/app/my-courses"><Btn variant="outline" className="border-paper/25 text-paper hover:border-sun-400 hover:bg-paper/5">Manage courses</Btn></Link>
          </div>
        </div>
      </Reveal>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={<IcBookOpen size={19} />} label="My courses" value={myCourses.length} sub={`${myCourses.reduce((n, c) => n + lessonsOf(c.id).length, 0)} lessons published`} />
        <Stat icon={<IcUsers size={19} />} label="My students" value={myStudents.length} sub="across all courses" tone="sun" />
        <Stat icon={<IcClipboard size={19} />} label="To mark" value={queue.length} sub={queue.length ? "submissions pending" : "queue clear"} tone={queue.length ? "clay" : "pine"} />
        <Stat icon={<IcTrend size={19} />} label="Avg class score" value={myResults.length ? `${avgScore}%` : "—"} sub={`${myResults.length} results released`} tone="night" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Reveal><section className="rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <h3 className="font-display text-lg font-bold">Enrolment by course</h3>
          <div className="mt-4">
            <HBars data={myCourses.map((c) => ({ label: c.title.length > 34 ? c.title.slice(0, 34) + "…" : c.title, value: c.enrolledCount }))} format={(v) => `${v} learners`} />
          </div>
        </section></Reveal>
        <Reveal delay={120}><section className="rounded-xl border border-pine-700/10 bg-white p-5.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold"><IcClipboard size={18} className="text-sun-600 dark:text-sun-400" /> Marking queue</h3>
          <div className="mt-3.5 space-y-2.5">
            {queue.slice(0, 4).map((s) => {
              const st = userById(s.studentId); const c = assignmentCourse(s);
              return (
                <Link to="/app/assignments" key={s.id} className="flex items-center gap-3 rounded-lg border border-pine-700/8 px-3.5 py-2.5 transition-colors hover:border-sun-500/50 dark:border-pine-200/8">
                  <Avatar name={st?.name ?? "?"} color={st?.color ?? "#888"} size={34} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-bold">{st?.name}</span>
                    <span className="block truncate text-[11.5px] font-bold text-ink-2/55 dark:text-pine-200/45">{c?.title} · {timeAgo(s.submittedAt)}</span>
                  </span>
                  <Badge tone="sun">mark</Badge>
                </Link>
              );
            })}
            {queue.length === 0 && <p className="px-1 py-3 text-[13px] font-semibold text-ink-2/60 dark:text-pine-200/50">All caught up. New submissions will appear here with a notification.</p>}
          </div>
        </section></Reveal>
      </div>

      <Reveal delay={180}>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-pine-700/10 bg-white px-5.5 py-4.5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
          <div>
            <h3 className="flex items-center gap-2 font-display text-[15.5px] font-bold"><IcPhone size={16} className="text-sun-600 dark:text-sun-400" /> Academy Support</h3>
            <p className="mt-0.5 text-[12.5px] text-ink-2/70 dark:text-pine-200/55">Publishing, payments, curriculum mapping or account issues — the SSGT admin team is one call away.</p>
          </div>
          <div className="flex flex-wrap gap-2.5 text-[13.5px] font-bold">
            <a href={`tel:${db.settings.contactPhone.replace(/\s/g, "")}`} className="rounded-lg bg-pine-700/8 px-4 py-2 text-pine-800 transition-all hover:-translate-y-0.5 hover:bg-pine-700 hover:text-paper dark:bg-pine-200/10 dark:text-pine-200">{db.settings.contactPhone}</a>
            <a href={`mailto:${db.settings.contactEmail}`} className="rounded-lg bg-pine-700/8 px-4 py-2 text-pine-800 transition-all hover:-translate-y-0.5 hover:bg-pine-700 hover:text-paper dark:bg-pine-200/10 dark:text-pine-200">{db.settings.contactEmail}</a>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

/* ── Teacher course manager ──────────────────────────────────────────────── */
export function TeacherCourses() {
  const { db } = useApp();
  const me = useMe();
  const toast = useToast();
  const [courseModal, setCourseModal] = useState<null | { id?: string }>(null);
  const [lessonModal, setLessonModal] = useState<null | { courseId: string; moduleId: string }>(null);
  const [moduleFor, setModuleFor] = useState<string | null>(null);
  const [delCourse, setDelCourse] = useState<Course | null>(null);
  const [cf, setCf] = useState({ title: "", subjectId: "", gradeId: "", description: "", price: 0, image: "" });
  const [mf, setMf] = useState({ title: "" });
  const [lf, setLf] = useState({ title: "", kind: "notes" as "notes" | "video" | "reading", minutes: 10, content: "" });
  const myCourses = db.courses.filter((c) => c.teacherId === me.id);

  const openNew = () => { setCf({ title: "", subjectId: db.subjects.find((s) => s.active)?.id ?? "", gradeId: db.grades[2]?.id ?? "", description: "", price: 0, image: "" }); setCourseModal({}); };
  const openEdit = (c: Course) => { setCf({ title: c.title, subjectId: c.subjectId, gradeId: c.gradeId, description: c.description, price: c.price, image: c.image }); setCourseModal({ id: c.id }); };

  const saveCourse = () => {
    if (cf.title.trim().length < 6) { toast.push("Give the course a fuller title (6+ characters).", "err"); return; }
    if (courseModal?.id) {
      commit((d) => { Object.assign(d.courses.find((c) => c.id === courseModal.id)!, { title: cf.title.trim(), subjectId: cf.subjectId, gradeId: cf.gradeId, description: cf.description, price: cf.price, image: cf.image || undefined }); },
        { action: "update_course", entity: "course", details: cf.title });
      toast.push("Course updated.");
    } else {
      const id = uid();
      commit((d) => {
        d.courses.unshift({
          id, title: cf.title.trim(), slug: cf.title.trim().toLowerCase().replace(/[^\w]+/g, "-").slice(0, 40),
          subjectId: cf.subjectId, gradeId: cf.gradeId,
          curriculumId: d.grades.find((g) => g.id === cf.gradeId)?.levelId.startsWith("lvl-844") ? "curr-844" : "curr-cbc",
          teacherId: me.id, description: cf.description || cf.title, image: cf.image || "https://image.qwenlm.ai/generated-images/dc381962-eb3f-4424-8a88-26ed3a8fb05f/_result.png",
          rating: 0, ratingCount: 0, enrolledCount: 0, price: cf.price, featured: false, published: true, objectives: ["Master the core concepts", "Practise with guided questions", "Pass the course assessment"], createdAt: Date.now(),
        });
      }, { action: "create_course", entity: "course", details: cf.title });
      toast.push(`Course "${cf.title}" created — now add modules and lessons.`);
    }
    setCourseModal(null);
  };

  const addModule = () => {
    if (!moduleFor || mf.title.trim().length < 3) return;
    commit((d) => {
      const order = d.modules.filter((m) => m.courseId === moduleFor).length + 1;
      d.modules.push({ id: uid(), courseId: moduleFor, title: mf.title.trim(), order });
    }, { action: "create_module", entity: "module", details: mf.title });
    toast.push("Module added."); setModuleFor(null); setMf({ title: "" });
  };

  const addLesson = () => {
    if (!lessonModal) return;
    if (lf.title.trim().length < 4 || lf.content.trim().length < 40) { toast.push("Lesson needs a title and at least 40 characters of content.", "err"); return; }
    commit((d) => {
      const order = d.lessons.filter((l) => l.moduleId === lessonModal.moduleId).length + 1;
      d.lessons.push({ id: uid(), moduleId: lessonModal.moduleId, courseId: lessonModal.courseId, title: lf.title.trim(), kind: lf.kind, minutes: lf.minutes, content: lf.content.trim(), order, resourceIds: [] });
    }, { action: "create_lesson", entity: "lesson", details: lf.title });
    toast.push("Lesson published to learners."); setLessonModal(null); setLf({ title: "", kind: "notes", minutes: 10, content: "" });
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13.5px] font-semibold text-ink-2 dark:text-pine-200/65">Create courses, publish lessons and control enrolment — everything is audit-logged.</p>
        <Btn onClick={openNew}><IcPlus size={16} /> New course</Btn>
      </div>
      {myCourses.length === 0 ? <div className="mt-8"><Empty icon={<IcBookOpen size={26} />} title="No courses yet" body="Create your first course, then add modules and lessons." action={<Btn onClick={openNew}>Create course</Btn>} /></div> : (
        <div className="mt-6 space-y-5">
          {myCourses.map((c) => {
            const mods = db.modules.filter((m) => m.courseId === c.id).sort((a, b) => a.order - b.order);
            return (
              <Reveal key={c.id}>
                <div className="overflow-hidden rounded-xl border border-pine-700/10 bg-white shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
                  <div className="flex flex-wrap items-center gap-4 p-5">
                    <span className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-pine-700 to-pine-950">
                      <img src={c.image} alt="" className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link to={`/courses/${c.id}`} className="font-display text-[16.5px] font-bold hover:text-pine-700 dark:hover:text-sun-400">{c.title}</Link>
                        <Badge tone={c.published ? "pine" : "clay"}>{c.published ? "Published" : "Unpublished"}</Badge>
                        {c.price > 0 && <Badge tone="sun">{ksh(c.price)}</Badge>}
                      </div>
                      <p className="mt-1 text-[12.5px] font-bold text-ink-2/60 dark:text-pine-200/50">{subjectName(c.subjectId)} · {gradeName(c.gradeId)} · {c.enrolledCount} enrolled · {lessonsOf(c.id).length} lessons</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 rounded-lg border border-pine-700/12 px-2.5 py-1.5 dark:border-pine-200/12">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-2/60 dark:text-pine-200/50">Live</span>
                        <Toggle on={c.published} label={`Publish ${c.title}`} onChange={(v) => { commit((d) => { d.courses.find((x) => x.id === c.id)!.published = v; }, { action: v ? "publish_course" : "unpublish_course", entity: "course", details: c.title }); toast.push(v ? "Course is live." : "Course hidden from catalogue.", "info"); }} />
                      </div>
                      <Btn variant="outline" size="sm" onClick={() => openEdit(c)}><IcEdit size={14} /> Edit</Btn>
                      <Btn variant="ghost" size="sm" onClick={() => setDelCourse(c)} aria-label={`Delete ${c.title}`}><IcTrash size={14} /></Btn>
                    </div>
                  </div>
                  <div className="border-t border-pine-700/8 bg-pine-700/[0.03] p-5 dark:border-pine-200/8 dark:bg-pine-200/[0.03]">
                    {mods.map((m, mi) => (
                      <div key={m.id} className="mb-3 last:mb-0">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[13px] font-extrabold"><span className="text-sun-700 dark:text-sun-400">{mi + 1}.</span> {m.title}</p>
                          <button onClick={() => setLessonModal({ courseId: c.id, moduleId: m.id })} className="cursor-pointer text-[12px] font-extrabold text-pine-700 hover:underline dark:text-sun-400">+ Add lesson</button>
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          {db.lessons.filter((l) => l.moduleId === m.id).sort((a, b) => a.order - b.order).map((l) => (
                            <span key={l.id} className="rounded-md border border-pine-700/10 bg-paper px-2.5 py-1 text-[11.5px] font-bold text-ink-2 dark:border-pine-200/10 dark:bg-night-850 dark:text-pine-200/75">{l.kind === "video" ? "▶" : "§"} {l.title} · {l.minutes}m</span>
                          ))}
                          {db.lessons.filter((l) => l.moduleId === m.id).length === 0 && <span className="text-[12px] font-semibold italic text-ink-2/50 dark:text-pine-200/40">No lessons yet</span>}
                        </div>
                      </div>
                    ))}
                    <button onClick={() => { setModuleFor(c.id); setMf({ title: "" }); }} className="mt-2 flex cursor-pointer items-center gap-1.5 text-[12.5px] font-extrabold text-pine-700 hover:underline dark:text-sun-400"><IcPlus size={14} /> Add module</button>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}

      {/* course modal */}
      <Modal open={!!courseModal} onClose={() => setCourseModal(null)} title={courseModal?.id ? "Edit course" : "New course"} wide>
        <div className="space-y-4">
          <Field label="Course title"><TextInput value={cf.title} onChange={(e) => setCf({ ...cf, title: e.target.value })} placeholder="e.g. Grade 8 Mathematics: Fractions Mastery" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Subject"><Select value={cf.subjectId} onChange={(e) => setCf({ ...cf, subjectId: e.target.value })}>{db.subjects.filter((s) => s.active).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></Field>
            <Field label="Grade / Form"><Select value={cf.gradeId} onChange={(e) => setCf({ ...cf, gradeId: e.target.value })}>{db.grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</Select></Field>
          </div>
          <Field label="Short description"><TextArea rows={3} value={cf.description} onChange={(e) => setCf({ ...cf, description: e.target.value })} placeholder="One or two sentences shown on the course card." /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Price (KSh)" hint="0 makes the course free."><TextInput type="number" min={0} step={50} value={cf.price} onChange={(e) => setCf({ ...cf, price: Math.max(0, Number(e.target.value)) })} /></Field>
            <Field label="Cover image URL (optional)"><TextInput value={cf.image} onChange={(e) => setCf({ ...cf, image: e.target.value })} placeholder="https://…" /></Field>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Btn variant="ghost" onClick={() => setCourseModal(null)}>Cancel</Btn>
            <Btn onClick={saveCourse}><IcCheckC size={15} /> {courseModal?.id ? "Save changes" : "Create course"}</Btn>
          </div>
        </div>
      </Modal>

      {/* module modal */}
      <Modal open={!!moduleFor} onClose={() => setModuleFor(null)} title="Add module">
        <Field label="Module title"><TextInput value={mf.title} onChange={(e) => setMf({ title: e.target.value })} placeholder="e.g. Working with Fractions" autoFocus /></Field>
        <div className="mt-5 flex justify-end gap-2"><Btn variant="ghost" onClick={() => setModuleFor(null)}>Cancel</Btn><Btn onClick={addModule}><IcPlus size={15} /> Add module</Btn></div>
      </Modal>

      {/* lesson modal */}
      <Modal open={!!lessonModal} onClose={() => setLessonModal(null)} title="New lesson" wide>
        <div className="space-y-4">
          <Field label="Lesson title"><TextInput value={lf.title} onChange={(e) => setLf({ ...lf, title: e.target.value })} placeholder="e.g. Adding and Subtracting Fractions" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type"><Select value={lf.kind} onChange={(e) => setLf({ ...lf, kind: e.target.value as never })}><option value="notes">Notes</option><option value="video">Video</option><option value="reading">Reading</option></Select></Field>
            <Field label="Duration (minutes)"><TextInput type="number" min={1} value={lf.minutes} onChange={(e) => setLf({ ...lf, minutes: Math.max(1, Number(e.target.value)) })} /></Field>
          </div>
          <Field label="Lesson content" hint="Formatting: '## ' headings · '- ' bullets · '> ' key ideas · wrap terms in **bold**.">
            <TextArea rows={9} value={lf.content} onChange={(e) => setLf({ ...lf, content: e.target.value })} placeholder={"## Introduction\n\nExplain the idea simply…\n\n- point one\n- point two\n\n> Key idea to remember."} />
          </Field>
          <div className="flex justify-end gap-2"><Btn variant="ghost" onClick={() => setLessonModal(null)}>Cancel</Btn><Btn onClick={addLesson}><IcCheckC size={15} /> Publish lesson</Btn></div>
        </div>
      </Modal>

      <Confirm open={!!delCourse} onClose={() => setDelCourse(null)} title="Unpublish course?" yesLabel="Unpublish"
        body={`"${delCourse?.title}" will be hidden from the catalogue. Enrolled learners keep access and progress. You can re-publish it any time.`}
        onYes={() => { if (delCourse) { commit((d) => { d.courses.find((c) => c.id === delCourse.id)!.published = false; }, { action: "unpublish_course", entity: "course", details: delCourse.title }); toast.push("Course unpublished.", "info"); } }} />
    </div>
  );
}

/* ── Grading ─────────────────────────────────────────────────────────────── */
export function GradingPage() {
  const { db } = useApp();
  const me = useMe();
  const toast = useToast();
  const [tab, setTab] = useState("submitted");
  const [grading, setGrading] = useState<Submission | null>(null);
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");

  const myCourseIds = new Set(db.courses.filter((c) => c.teacherId === me.id).map((c) => c.id));
  const mine = db.submissions.filter((s) => { const a = db.assignments.find((x) => x.id === s.assignmentId); return a && myCourseIds.has(a.courseId); });
  const shown = mine.filter((s) => s.status === tab).sort((a, b) => b.submittedAt - a.submittedAt);

  const save = () => {
    if (!grading) return;
    const a = db.assignments.find((x) => x.id === grading.assignmentId)!;
    const m = Number(marks);
    if (isNaN(m) || m < 0 || m > a.maxMarks) { toast.push(`Marks must be between 0 and ${a.maxMarks}.`, "err"); return; }
    gradeSubmission(grading.id, m, feedback.trim());
    toast.push(`Marked ${userById(grading.studentId)?.name}: ${m}/${a.maxMarks}. Result published to the learner & parent.`);
    setGrading(null);
  };

  return (
    <div>
      <Tabs tabs={[
        { id: "submitted", label: "Awaiting marking", count: mine.filter((s) => s.status === "submitted").length },
        { id: "graded", label: "Marked", count: mine.filter((s) => s.status === "graded").length },
      ]} active={tab} onChange={setTab} />
      {shown.length === 0 ? <div className="mt-8"><Empty icon={<IcClipboard size={26} />} title={tab === "submitted" ? "Marking queue is clear" : "Nothing marked yet"} body={tab === "submitted" ? "Submissions from your assignments land here the moment learners submit." : "Marked work appears here with the grades you gave."} /></div> : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {shown.map((s) => {
            const st = userById(s.studentId);
            const a = db.assignments.find((x) => x.id === s.assignmentId)!;
            const c = courseById(a.courseId);
            return (
              <div key={s.id} className="flex flex-col rounded-xl border border-pine-700/10 bg-white p-5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
                <div className="flex items-center gap-3.5">
                  <Avatar name={st?.name ?? "?"} color={st?.color ?? "#888"} size={42} />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-[15.5px] font-bold">{st?.name}</p>
                    <p className="truncate text-[12px] font-bold text-ink-2/60 dark:text-pine-200/50">{a.title} · {c?.title}</p>
                  </div>
                  {s.status === "graded" ? <Badge tone="pine">{s.marks}/{a.maxMarks}</Badge> : <Badge tone="sun"><IcClock size={11} /> {timeAgo(s.submittedAt)}</Badge>}
                </div>
                <p className="mt-3.5 line-clamp-3 whitespace-pre-line rounded-lg bg-pine-700/4 p-3.5 text-[13px] leading-relaxed text-ink-2 dark:bg-pine-200/5 dark:text-pine-200/75">{s.text}</p>
                {s.fileName && <p className="mt-2 flex items-center gap-1.5 text-[12px] font-bold text-ink-2/65 dark:text-pine-200/55"><IcUpload size={13} /> {s.fileName}</p>}
                {s.status === "graded" && s.feedback && <p className="mt-2.5 text-[12.5px] italic text-ink-2/75 dark:text-pine-200/60">Feedback: {s.feedback}</p>}
                <div className="mt-auto pt-3.5">
                  <Btn size="sm" variant={s.status === "graded" ? "outline" : "primary"} className="w-full"
                    onClick={() => { setGrading(s); setMarks(s.marks !== undefined ? String(s.marks) : ""); setFeedback(s.feedback ?? ""); }}>
                    {s.status === "graded" ? "View / adjust mark" : "Mark submission"}
                  </Btn>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!grading} onClose={() => setGrading(null)} title="Mark submission" wide>
        {grading && (() => {
          const a = db.assignments.find((x) => x.id === grading.assignmentId)!;
          const st = userById(grading.studentId);
          return (
            <div>
              <div className="flex items-center gap-3">
                <Avatar name={st?.name ?? "?"} color={st?.color ?? "#888"} size={40} />
                <div><p className="font-display font-bold">{st?.name}</p><p className="text-[12px] font-bold text-ink-2/60 dark:text-pine-200/50">{a.title} · max {a.maxMarks} marks</p></div>
              </div>
              <p className="mt-4 max-h-48 overflow-y-auto whitespace-pre-line rounded-lg bg-pine-700/4 p-4 text-[13.5px] leading-relaxed dark:bg-pine-200/5">{grading.text}</p>
              {grading.fileName && <p className="mt-2 flex items-center gap-1.5 text-[12.5px] font-bold text-ink-2/70 dark:text-pine-200/60"><IcUpload size={14} /> Attached: {grading.fileName}</p>}
              <div className="mt-4 grid gap-4 sm:grid-cols-[140px_1fr]">
                <Field label={`Marks / ${a.maxMarks}`}><TextInput type="number" min={0} max={a.maxMarks} value={marks} onChange={(e) => setMarks(e.target.value)} /></Field>
                <Field label="Feedback to learner"><TextArea rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="One strength, one next step — learners read every word." /></Field>
              </div>
              <p className="mt-3 rounded-lg bg-sun-500/10 px-3.5 py-2.5 text-[12px] font-bold text-ink-2 dark:text-pine-200/75">Marking publishes a result to the learner's records, notifies the learner and their linked parent, and is written to the audit log.</p>
              <div className="mt-4 flex justify-end gap-2"><Btn variant="ghost" onClick={() => setGrading(null)}>Cancel</Btn><Btn onClick={save}><IcCheckC size={15} /> Publish mark</Btn></div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

/* ── Teacher students ────────────────────────────────────────────────────── */
export function TeacherStudents() {
  const { db } = useApp();
  const me = useMe();
  const myCourseIds = new Set(db.courses.filter((c) => c.teacherId === me.id).map((c) => c.id));
  const rows = useMemo(() => {
    const ids = [...new Set(db.enrollments.filter((e) => e.status !== "cancelled" && myCourseIds.has(e.courseId)).map((e) => e.studentId))];
    return ids.map((sid) => {
      const st = userById(sid)!;
      const ens = db.enrollments.filter((e) => e.studentId === sid && myCourseIds.has(e.courseId));
      const avgProg = Math.round(ens.reduce((n, e) => n + courseProgress(sid, e.courseId).percent, 0) / Math.max(1, ens.length));
      const results = db.results.filter((r) => r.studentId === sid);
      const avgRes = results.length ? Math.round(results.reduce((n, r) => n + (r.score / r.maxScore) * 100, 0) / results.length) : null;
      return { st, ens, avgProg, avgRes };
    }).sort((a, b) => b.avgProg - a.avgProg);
  }, [db]);
  return (
    <div className="overflow-hidden rounded-xl border border-pine-700/10 bg-white shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
      <div className="overflow-x-auto">
        <table className="w-full min-w-130 text-left text-[13px]">
          <thead><tr className="border-b-2 border-pine-700/12 text-[11px] font-extrabold uppercase tracking-wider text-ink-2/55 dark:border-pine-200/12 dark:text-pine-200/45">
            <th className="px-5 py-3.5">Learner</th><th className="px-3 py-3.5">Grade</th><th className="px-3 py-3.5">My courses</th><th className="px-3 py-3.5">Avg progress</th><th className="px-5 py-3.5">Avg score</th></tr></thead>
          <tbody>
            {rows.map(({ st, ens, avgProg, avgRes }) => (
              <tr key={st.id} className="border-b border-pine-700/6 transition-colors last:border-0 hover:bg-pine-700/3 dark:border-pine-200/6 dark:hover:bg-pine-200/4">
                <td className="px-5 py-3.5"><span className="flex items-center gap-3"><Avatar name={st.name} color={st.color} size={34} /><span><span className="block font-bold">{st.name}</span><span className="text-[11.5px] font-semibold text-ink-2/55 dark:text-pine-200/45">{st.email}</span></span></span></td>
                <td className="px-3 py-3.5 font-bold">{gradeName(st.gradeId ?? "")}</td>
                <td className="px-3 py-3.5"><span className="flex flex-wrap gap-1">{ens.map((e) => <Badge key={e.id} tone="gray">{courseById(e.courseId)?.title.split(":")[0].slice(0, 18)}</Badge>)}</span></td>
                <td className="px-3 py-3.5"><span className="flex items-center gap-2.5"><Progress value={avgProg} className="w-24" /><span className="text-[12px] font-black">{avgProg}%</span></span></td>
                <td className="px-5 py-3.5 font-bold">{avgRes !== null ? `${avgRes}%` : "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-[13px] font-semibold text-ink-2/60 dark:text-pine-200/50">No learners enrolled in your courses yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Announcements (teacher + admin) ─────────────────────────────────────── */
export function AnnouncementsPage({ scope = "teacher" }: { scope?: "teacher" | "admin" }) {
  const { db } = useApp();
  const me = useMe();
  const toast = useToast();
  const [f, setF] = useState({ title: "", content: "", audience: "all-students" as Audience, audienceRef: "", days: "" });
  const myCourses = scope === "teacher" ? db.courses.filter((c) => c.teacherId === me.id) : db.courses;
  const list = scope === "admin" ? db.announcements : db.announcements.filter((a) => a.authorId === me.id || a.audience === "teachers");

  const publish = () => {
    if (f.title.trim().length < 5 || f.content.trim().length < 20) { toast.push("Announcement needs a title and at least 20 characters.", "err"); return; }
    const ref = ["course", "grade"].includes(f.audience) ? f.audienceRef : undefined;
    const days = Number(f.days);
    const expiresAt = f.days && !isNaN(days) && days > 0 ? Date.now() + days * 86400000 : undefined;
    const n = publishAnnouncement({ title: f.title.trim(), content: f.content.trim(), audience: f.audience, audienceRef: ref, expiresAt });
    toast.push(`Published — ${n} ${n === 1 ? "person" : "people"} notified.`);
    setF({ title: "", content: "", audience: "all-students", audienceRef: "", days: "" });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      <section className="h-fit rounded-xl border border-pine-700/10 bg-white p-6 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold"><IcMsg size={18} className="text-sun-600 dark:text-sun-400" /> Publish announcement</h3>
        <div className="mt-4 space-y-4">
          <Field label="Title"><TextInput value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Revision clinic this Friday" /></Field>
          <Field label="Message"><TextArea rows={5} value={f.content} onChange={(e) => setF({ ...f, content: e.target.value })} placeholder="Write the announcement…" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Audience">
              <Select value={f.audience} onChange={(e) => setF({ ...f, audience: e.target.value as Audience, audienceRef: "" })}>
                <option value="all-students">All students</option>
                <option value="course">Specific course</option>
                <option value="grade">Specific grade</option>
                <option value="parents">Parents</option>
                <option value="teachers">Teachers</option>
                {scope === "admin" && <option value="everyone">Everyone</option>}
              </Select>
            </Field>
            {f.audience === "course" && (
              <Field label="Course"><Select value={f.audienceRef} onChange={(e) => setF({ ...f, audienceRef: e.target.value })}>
                <option value="">Choose…</option>{myCourses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </Select></Field>
            )}
            {f.audience === "grade" && (
              <Field label="Grade"><Select value={f.audienceRef} onChange={(e) => setF({ ...f, audienceRef: e.target.value })}>
                <option value="">Choose…</option>{db.grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </Select></Field>
            )}
            <Field label="Expires after (days)" hint="Blank = never expires.">
              <TextInput type="number" min={0} value={f.days} onChange={(e) => setF({ ...f, days: e.target.value })} placeholder="e.g. 14" />
            </Field>
          </div>
          <Btn onClick={publish} className="w-full"><IcMsg size={15} /> Publish & notify</Btn>
        </div>
      </section>
      <section>
        <h3 className="font-display text-lg font-bold">Published announcements</h3>
        <div className="mt-4 space-y-3">
          {list.length === 0 && <Empty icon={<IcMsg size={24} />} title="Nothing published" body="Announcements you publish appear here with their audience." />}
          {list.map((a) => (
            <div key={a.id} className="rounded-xl border border-pine-700/10 bg-white p-5 shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
              <div className="flex items-start justify-between gap-3">
                <p className="font-display text-[15.5px] font-bold">{a.title}</p>
                <Badge tone="sun" className="shrink-0 capitalize">{a.audience.replace("-", " ")}</Badge>
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2/85 dark:text-pine-200/65">{a.content}</p>
              <p className="mt-2.5 text-[11px] font-extrabold uppercase tracking-wider text-ink-2/50 dark:text-pine-200/40">
                {fmtDate(a.publishedAt)} · {userById(a.authorId)?.name ?? "SSGT"}
                {a.expiresAt && <span className="text-clay-600"> · expires {fmtDate(a.expiresAt)}</span>}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ── Results manager (teacher) ───────────────────────────────────────────── */
export function ManageResults() {
  const { db } = useApp();
  const me = useMe();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ studentId: "", subjectId: "", assessment: "", score: "", maxScore: "100", comment: "", term: "Term 1 2026" });
  const myCourseIds = new Set(db.courses.filter((c) => c.teacherId === me.id).map((c) => c.id));
  const myStudentIds = [...new Set(db.enrollments.filter((e) => e.status !== "cancelled" && myCourseIds.has(e.courseId)).map((e) => e.studentId))];
  const results = db.results.filter((r) => r.releasedBy === me.id || (r.courseId && myCourseIds.has(r.courseId))).sort((a, b) => b.date - a.date);

  const save = () => {
    const score = Number(f.score), max = Number(f.maxScore);
    if (!f.studentId || !f.assessment.trim() || isNaN(score) || isNaN(max) || max <= 0 || score < 0 || score > max) { toast.push("Fill learner, assessment and a valid score.", "err"); return; }
    addResult({ studentId: f.studentId, subjectId: f.subjectId || db.subjects[0].id, assessment: f.assessment.trim(), score, maxScore: max, comment: f.comment.trim(), term: f.term });
    toast.push("Result published — learner and parent notified.");
    setOpen(false); setF({ studentId: "", subjectId: "", assessment: "", score: "", maxScore: "100", comment: "", term: "Term 1 2026" });
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13.5px] font-semibold text-ink-2 dark:text-pine-200/65">Release results for CATs, mocks and marked work. Learners and linked parents are notified instantly.</p>
        <Btn onClick={() => setOpen(true)}><IcPlus size={16} /> Add result</Btn>
      </div>
      <div className="mt-6 overflow-hidden rounded-xl border border-pine-700/10 bg-white shadow-[var(--shadow-card)] dark:border-pine-200/10 dark:bg-night-800">
        <div className="overflow-x-auto">
          <table className="w-full min-w-130 text-left text-[13px]">
            <thead><tr className="border-b-2 border-pine-700/12 text-[11px] font-extrabold uppercase tracking-wider text-ink-2/55 dark:border-pine-200/12 dark:text-pine-200/45">
              <th className="px-5 py-3.5">Date</th><th className="px-3 py-3.5">Learner</th><th className="px-3 py-3.5">Assessment</th><th className="px-3 py-3.5">Score</th><th className="px-5 py-3.5">Comment</th></tr></thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id} className="border-b border-pine-700/6 last:border-0 hover:bg-pine-700/3 dark:border-pine-200/6 dark:hover:bg-pine-200/4">
                  <td className="whitespace-nowrap px-5 py-3 font-semibold text-ink-2 dark:text-pine-200/70">{fmtDate(r.date)}</td>
                  <td className="px-3 py-3 font-bold">{userById(r.studentId)?.name}</td>
                  <td className="px-3 py-3 font-bold">{r.assessment}<span className="block text-[11px] font-semibold text-ink-2/50 dark:text-pine-200/40">{subjectName(r.subjectId)}</span></td>
                  <td className="px-3 py-3 font-bold">{r.score}/{r.maxScore} ({Math.round((r.score / r.maxScore) * 100)}%)</td>
                  <td className="max-w-55 px-5 py-3 text-[12.5px] text-ink-2/80 dark:text-pine-200/60">{r.comment}</td>
                </tr>
              ))}
              {results.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-[13px] font-semibold text-ink-2/60 dark:text-pine-200/50">No results released yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add result" wide>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Learner"><Select value={f.studentId} onChange={(e) => setF({ ...f, studentId: e.target.value })}>
            <option value="">Choose…</option>{myStudentIds.map((id) => <option key={id} value={id}>{userById(id)?.name}</option>)}
          </Select></Field>
          <Field label="Subject"><Select value={f.subjectId} onChange={(e) => setF({ ...f, subjectId: e.target.value })}>
            <option value="">Choose…</option>{db.subjects.filter((s) => s.active).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select></Field>
          <div className="sm:col-span-2"><Field label="Assessment name"><TextInput value={f.assessment} onChange={(e) => setF({ ...f, assessment: e.target.value })} placeholder="e.g. CAT 2 — Equations" /></Field></div>
          <Field label="Score"><TextInput type="number" value={f.score} onChange={(e) => setF({ ...f, score: e.target.value })} placeholder="72" /></Field>
          <Field label="Out of"><TextInput type="number" value={f.maxScore} onChange={(e) => setF({ ...f, maxScore: e.target.value })} /></Field>
          <Field label="Term"><Select value={f.term} onChange={(e) => setF({ ...f, term: e.target.value })}><option>Term 1 2026</option><option>Term 2 2026</option><option>Term 3 2025</option></Select></Field>
          <div className="sm:col-span-2"><Field label="Teacher comment"><TextArea rows={2} value={f.comment} onChange={(e) => setF({ ...f, comment: e.target.value })} placeholder="One line the learner will remember." /></Field></div>
        </div>
        <div className="mt-5 flex justify-end gap-2"><Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn><Btn onClick={save}><IcCheckC size={15} /> Publish result</Btn></div>
      </Modal>
    </div>
  );
}
