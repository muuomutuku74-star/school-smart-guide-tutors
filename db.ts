--- src/lib/db.ts (原始)
import { useEffect, useReducer } from "react";
import type { Announcement, Audience, Course, DB, Lesson, Question, Resource, Role, Session, Submission, User } from "./types";
import { makeSeed } from "./seed";

/* ────────────────────────────────────────────────────────────────────────────
   SSGT data + service layer.

   Architecture note: this module is the client-side implementation of the
   platform's API boundary. Every mutation flows through `commit()`, which is
   where a server would enforce authorization, validation, audit logging and
   persistence (PostgreSQL via Prisma). Swapping localStorage for API calls is
   a one-file change; the UI only talks to the functions below.
   ──────────────────────────────────────────────────────────────────────────── */

const DB_KEY = "ssgt-db-v1";
const SES_KEY = "ssgt-session-v1";
export const DEMO_PASSWORD = "Demo@123";

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);

/** Demo-only salted hash. Production: bcrypt/argon2 on the server — never client hashing. */
export function hash(s: string) {
  const str = "ssgt-pepper::" + s;
  let h1 = 0xdeadbeef ^ 7, h2 = 0x41c6ce57 ^ 7;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16) + (h1 >>> 0).toString(16);
}

function loadDB(): DB {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DB;
      if (parsed?.users?.length) {
        // Normalize seeded demo passwords into hashes on first load.
        parsed.users = parsed.users.map((u) => (u.pass === "demo" ? { ...u, pass: hash(DEMO_PASSWORD) } : u));
        return parsed;
      }
    }
  } catch { /* corrupted store → reseed */ }
  const fresh = makeSeed();
  fresh.users = fresh.users.map((u) => (u.pass === "demo" ? { ...u, pass: hash(DEMO_PASSWORD) } : u));
  try { localStorage.setItem(DB_KEY, JSON.stringify(fresh)); } catch { /* private mode */ }
  return fresh;
}

let db: DB = loadDB();
let session: Session | null = (() => {
  try { const raw = localStorage.getItem(SES_KEY); return raw ? (JSON.parse(raw) as Session) : null; } catch { return null; }
})();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const persist = () => { try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch { /* ignore */ } };

export function useApp() {
  const [, force] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    const l = () => force();
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  const u = session ? db.users.find((x) => x.id === session!.userId) : undefined;
  return { db, user: u && u.active ? u : null, session };
}

export function commit(fn: (d: DB) => void, auditInfo?: { action: string; entity: string; details?: string }) {
  fn(db);
  if (auditInfo) {
    const who = session ? db.users.find((u) => u.id === session!.userId) : undefined;
    db.audit.unshift({ id: uid(), userId: who?.id ?? "system", userName: who?.name ?? "System", action: auditInfo.action, entity: auditInfo.entity, details: auditInfo.details ?? "", date: Date.now() });
    db.audit = db.audit.slice(0, 400);
  }
  db = { ...db };
  persist();
  emit();
}

/* ── lookups ─────────────────────────────────────────────────────────────── */
export const userById = (id: string) => db.users.find((u) => u.id === id);
export const courseById = (id: string) => db.courses.find((c) => c.id === id);
export const lessonById = (id: string) => db.lessons.find((l) => l.id === id);
export const subjectById = (id: string) => db.subjects.find((s) => s.id === id);
export const subjectName = (id: string) => subjectById(id)?.name ?? "—";
export const gradeName = (id: string) => db.grades.find((g) => g.id === id)?.name ?? "—";
export const levelName = (id: string) => db.levels.find((l) => l.id === id)?.name ?? "—";
export const curriculumName = (id: string) => db.curricula.find((c) => c.id === id)?.name ?? "—";
export const quizById = (id: string) => db.quizzes.find((q) => q.id === id);
export const assignmentById = (id: string) => db.assignments.find((a) => a.id === id);

export function modulesOf(courseId: string) {
  return db.modules.filter((m) => m.courseId === courseId).sort((a, b) => a.order - b.order);
}
export function lessonsOf(courseId: string): Lesson[] {
  const out: Lesson[] = [];
  for (const m of modulesOf(courseId))
    out.push(...db.lessons.filter((l) => l.moduleId === m.id).sort((a, b) => a.order - b.order));
  return out;
}
export function quizzesOf(courseId: string) { return db.quizzes.filter((q) => q.courseId === courseId && q.active); }
export function assignmentsOf(courseId: string) { return db.assignments.filter((a) => a.courseId === courseId && a.active); }
export const enrollmentFor = (studentId: string, courseId: string) =>
  db.enrollments.find((e) => e.studentId === studentId && e.courseId === courseId && e.status !== "cancelled");

export function courseProgress(studentId: string, courseId: string) {
  const lessons = lessonsOf(courseId);
  const done = lessons.filter((l) => db.lessonProgress.some((p) => p.studentId === studentId && p.lessonId === l.id)).length;
  return { done, total: lessons.length, percent: lessons.length ? Math.round((done / lessons.length) * 100) : 0 };
}

export function computeGrade(pct: number) {
  if (pct >= 80) return "A"; if (pct >= 75) return "A-"; if (pct >= 70) return "B+";
  if (pct >= 65) return "B"; if (pct >= 60) return "B-"; if (pct >= 55) return "C+";
  if (pct >= 50) return "C"; if (pct >= 45) return "C-"; if (pct >= 40) return "D+";
  if (pct >= 35) return "D"; if (pct >= 30) return "D-"; return "E";
}

/* ── auth ────────────────────────────────────────────────────────────────── */
export function login(email: string, password: string): string | null {
  const u = db.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
  if (!u) return "No account found with that email.";
  if (!u.active) return "This account has been deactivated. Contact your administrator.";
  if (u.pass !== hash(password)) return "Incorrect password. Try again.";
  session = { userId: u.id, token: uid(), issuedAt: Date.now() };
  try { localStorage.setItem(SES_KEY, JSON.stringify(session)); } catch { /* ignore */ }
  commit(() => {}, { action: "login", entity: "auth", details: `${u.name} signed in` });
  return null;
}

export function logout() {
  const who = session ? userById(session.userId) : undefined;
  session = null;
  try { localStorage.removeItem(SES_KEY); } catch { /* ignore */ }
  commit(() => {}, { action: "logout", entity: "auth", details: `${who?.name ?? "User"} signed out` });
}

export function register( { name: string; email: string; phone: string; role: Role; gradeId?: string; password: string }): string | null {
  if (!db.settings.registrationOpen) return "Registration is currently closed. Please contact the school office.";
  if (db.users.some((u) => u.email.toLowerCase() === data.email.trim().toLowerCase())) return "An account with this email already exists.";
  if (data.password.length < 8) return "Password must be at least 8 characters.";
  const students = db.users.filter((u) => u.role === "student").length;
  const id = uid();
  commit((d) => {
    d.users.push({
      id, name: data.name.trim(), email: data.email.trim().toLowerCase(), phone: data.phone, pass: hash(data.password),
      role: data.role, color: ["#0C5A43", "#B56508", "#C4562E", "#1F6A50", "#8F4D0D"][students % 5], active: true,
      createdAt: Date.now(), gradeId: data.gradeId,
      studentCode: data.role === "student" ? `SSGT-${1001 + students}` : undefined,
      linkedStudentIds: data.role === "parent" ? [] : undefined,
      notifyEmail: true, notifyPush: true,
    });
    d.notifications.unshift({ id: uid(), userId: id, title: "Karibu SSGT! 🎓", body: "Your account is ready. Explore courses, join a class and start learning.", kind: "system", read: false, createdAt: Date.now(), link: "/app/dashboard" });
    d.emails.unshift({ id: uid(), to: data.email, template: "welcome", subject: "Welcome to School Smart Guide Tutors", date: Date.now() });
  }, { action: "register", entity: "user", details: `New ${data.role} account: ${data.email}` });
  session = { userId: id, token: uid(), issuedAt: Date.now() };
  try { localStorage.setItem(SES_KEY, JSON.stringify(session)); } catch { /* ignore */ }
  emit();
  return null;
}

export function requestPasswordReset(email: string): string | null {
  const u = db.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
  if (!u) return "No account found with that email.";
  const temp = "Karibu#" + Math.floor(1000 + Math.random() * 9000);
  commit((d) => {
    const usr = d.users.find((x) => x.id === u.id)!;
    usr.pass = hash(temp);
    d.notifications.unshift({ id: uid(), userId: u.id, title: "Password reset", body: "Your password was reset. Use the temporary password sent to your email, then change it in Profile.", kind: "system", read: false, createdAt: Date.now() });
    d.emails.unshift({ id: uid(), to: u.email, template: "password-reset", subject: `Your temporary password: ${temp}`, date: Date.now() });
  }, { action: "password_reset", entity: "user", details: `Temporary password issued for ${u.email}` });
  return temp;
}

export function changePassword(userId: string, current: string, next: string): string | null {
  const u = userById(userId);
  if (!u) return "Account not found.";
  if (u.pass !== hash(current)) return "Current password is incorrect.";
  if (next.length < 8) return "New password must be at least 8 characters.";
  commit((d) => { d.users.find((x) => x.id === userId)!.pass = hash(next); },
    { action: "change_password", entity: "user", details: `${u.name} changed their password` });
  return null;
}

export function updateProfile(userId: string, patch: Partial<User>) {
  commit((d) => { Object.assign(d.users.find((x) => x.id === userId)!, patch); },
    { action: "update_profile", entity: "user", details: "Profile updated" });
}

/* ── notifications ───────────────────────────────────────────────────────── */
export function notifyUser(userId: string, n: { title: string; body: string; kind: string; link?: string }) {
  commit((d) => {
    d.notifications.unshift({ id: uid(), userId, title: n.title, body: n.body, kind: n.kind as never, read: false, createdAt: Date.now(), link: n.link });
    d.notifications = d.notifications.slice(0, 500);
  });
}
export const unreadCount = (userId: string) => db.notifications.filter((n) => n.userId === userId && !n.read).length;
export function markRead(id: string) { commit((d) => { const n = d.notifications.find((x) => x.id === id); if (n) n.read = true; }); }
export function markAllRead(userId: string) { commit((d) => { d.notifications.forEach((n) => { if (n.userId === userId) n.read = true; }); }); }

/* ── enrollment & payment ────────────────────────────────────────────────── */
export function enrollFree(studentId: string, courseId: string): string | null {
  const c = courseById(courseId);
  if (!c) return "Course not found.";
  if (enrollmentFor(studentId, courseId)) return "You are already enrolled in this course.";
  if (c.price > 0) return "This is a paid course — complete payment to enrol.";
  commit((d) => {
    d.enrollments.push({ id: uid(), studentId, courseId, status: "active", enrolledAt: Date.now(), paymentStatus: "none" });
    const course = d.courses.find((x) => x.id === courseId)!;
    course.enrolledCount += 1;
    d.notifications.unshift({ id: uid(), userId: studentId, title: "Enrolment confirmed 🎉", body: `You are now enrolled in "${course.title}". Your first lesson awaits.`, kind: "course", read: false, createdAt: Date.now(), link: `/app/learn/${courseId}` });
    d.emails.unshift({ id: uid(), to: userById(studentId)?.email ?? "", template: "enrollment-confirmation", subject: `You're enrolled: ${course.title}`, date: Date.now() });
  }, { action: "enroll", entity: "enrollment", details: `${userById(studentId)?.name} enrolled in '${c.title}' (free)` });
  return null;
}

/** Called by the payment integration after a successful charge (M-Pesa STK / card). */
export function confirmPayment(studentId: string, courseId: string, amount: number, method: "mpesa" | "card" | "bank", reference: string, phone?: string): string | null {
  const c = courseById(courseId);
  if (!c) return "Course not found.";
  commit((d) => {
    const pendingPay = d.payments.find((p) => p.studentId === studentId && p.courseId === courseId && p.status === "pending");
    if (pendingPay) { pendingPay.status = "completed"; pendingPay.reference = reference; pendingPay.method = method; pendingPay.date = Date.now(); }
    else d.payments.unshift({ id: uid(), studentId, courseId, amount, method, status: "completed", reference, phone, date: Date.now() });
    const en = d.enrollments.find((e) => e.studentId === studentId && e.courseId === courseId);
    if (en) { en.status = "active"; en.paymentStatus = "paid"; }
    else {
      d.enrollments.push({ id: uid(), studentId, courseId, status: "active", enrolledAt: Date.now(), paymentStatus: "paid" });
      d.courses.find((x) => x.id === courseId)!.enrolledCount += 1;
    }
    d.notifications.unshift({ id: uid(), userId: studentId, title: "Payment received ✓", body: `KSh ${amount.toLocaleString()} confirmed (${reference}). You are enrolled in "${c.title}".`, kind: "payment", read: false, createdAt: Date.now(), link: `/app/learn/${courseId}` });
    d.emails.unshift({ id: uid(), to: userById(studentId)?.email ?? "", template: "payment-receipt", subject: `Receipt: KSh ${amount} — ${c.title}`, date: Date.now() });
  }, { action: "confirm_payment", entity: "payment", details: `${method.toUpperCase()} ${reference} — KSh ${amount} (${userById(studentId)?.name})` });
  return null;
}

export function createPendingPayment(studentId: string, courseId: string, amount: number, method: "mpesa" | "card" | "bank", phone?: string) {
  if (db.payments.some((p) => p.studentId === studentId && p.courseId === courseId && p.status === "pending")) return;
  commit((d) => {
    d.payments.unshift({ id: uid(), studentId, courseId, amount, method, status: "pending", reference: "—" , phone, date: Date.now() });
    const en = d.enrollments.find((e) => e.studentId === studentId && e.courseId === courseId);
    if (!en) d.enrollments.push({ id: uid(), studentId, courseId, status: "pending", enrolledAt: Date.now(), paymentStatus: "pending" });
  }, { action: "initiate_payment", entity: "payment", details: `Pending payment KSh ${amount} (${userById(studentId)?.name})` });
}

/* ── learning: progress, bookmarks, quizzes, assignments ─────────────────── */
export function markLessonComplete(studentId: string, lesson: Lesson) {
  commit((d) => {
    if (d.lessonProgress.some((p) => p.studentId === studentId && p.lessonId === lesson.id)) return;
    d.lessonProgress.push({ id: uid(), studentId, lessonId: lesson.id, courseId: lesson.courseId, completedAt: Date.now() });
    const grant = (defId: string, name: string, body: string) => {
      if (d.earned.some((e) => e.studentId === studentId && e.defId === defId)) return;
      d.earned.push({ id: uid(), studentId, defId, earnedAt: Date.now() });
      d.notifications.unshift({ id: uid(), userId: studentId, title: `Badge unlocked: ${name}`, body, kind: "system", read: false, createdAt: Date.now(), link: "/app/progress" });
    };
    const totalLessons = d.lessonProgress.filter((p) => p.studentId === studentId).length;
    if (totalLessons === 1) grant("ach-first", "First Steps", "You completed your very first lesson. The journey has begun!");
    if (totalLessons >= 10) grant("ach-streak", "Momentum", "10 lessons completed across your courses. Unstoppable!");
    const courseLessons = lessonsOf(lesson.courseId);
    const done = courseLessons.filter((l) => d.lessonProgress.some((p) => p.studentId === studentId && p.lessonId === l.id)).length;
    const pct = courseLessons.length ? Math.round((done / courseLessons.length) * 100) : 0;
    if (pct >= 50) grant("ach-half", "Halfway Hero", "You are more than halfway through a course. The summit is in sight!");
    if (pct === 100) {
      const en = d.enrollments.find((e) => e.studentId === studentId && e.courseId === lesson.courseId && e.status === "active");
      if (en) { en.status = "completed"; en.completedAt = Date.now(); }
      grant("ach-grad", "Course Graduate", "You completed an entire course. Hongera!");
      d.notifications.unshift({ id: uid(), userId: studentId, title: "Course completed 🎓", body: `Congratulations — you finished "${courseById(lesson.courseId)?.title}".`, kind: "course", read: false, createdAt: Date.now(), link: "/app/progress" });
    }
  }, { action: "complete_lesson", entity: "lesson", details: `'${lesson.title}' completed` });
}

export function isBookmarked(userId: string, type: string, refId: string) {
  return db.bookmarks.some((b) => b.userId === userId && b.type === type && b.refId === refId);
}
export function toggleBookmark(userId: string, type: "lesson" | "resource" | "course", refId: string): boolean {
  const existing = db.bookmarks.find((b) => b.userId === userId && b.type === type && b.refId === refId);
  let added = false;
  commit((d) => {
    if (existing) d.bookmarks = d.bookmarks.filter((b) => b.id !== existing.id);
    else {
      d.bookmarks.push({ id: uid(), userId, type, refId, createdAt: Date.now() });
      added = true;
      const count = d.bookmarks.filter((b) => b.userId === userId).length;
      if (count >= 5 && !d.earned.some((e) => e.studentId === userId && e.defId === "ach-book")) {
        d.earned.push({ id: uid(), studentId: userId, defId: "ach-book", earnedAt: Date.now() });
        d.notifications.unshift({ id: uid(), userId, title: "Badge unlocked: Curious Collector", body: "You bookmarked 5 lessons or resources.", kind: "system", read: false, createdAt: Date.now() });
      }
    }
  });
  return added;
}

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
export function gradeQuestion(q: Question, given: string | undefined): boolean {
  if (given === undefined || given === "") return false;
  if (q.type === "short") return q.answer.split("|").some((a) => norm(a) === norm(given));
  return norm(q.answer) === norm(given);
}

export function submitQuizAttempt(quizId: string, studentId: string, answers: Record<string, string>, timeSpentSec: number) {
  const quiz = quizById(quizId)!;
  const score = quiz.questions.filter((q) => gradeQuestion(q, answers[q.id])).length;
  const percent = Math.round((score / quiz.questions.length) * 100);
  const passed = percent >= quiz.passingPercent;
  const attempt = { id: uid(), quizId, studentId, answers, score, total: quiz.questions.length, percent, passed, timeSpentSec, submittedAt: Date.now() };
  commit((d) => {
    d.attempts.unshift(attempt);
    if (passed && !d.earned.some((e) => e.studentId === studentId && e.defId === "ach-ace")) {
      d.earned.push({ id: uid(), studentId, defId: "ach-ace", earnedAt: Date.now() });
      d.notifications.unshift({ id: uid(), userId: studentId, title: "Badge unlocked: Quiz Ace", body: "You passed your first quiz!", kind: "quiz", read: false, createdAt: Date.now() });
    }
    d.notifications.unshift({ id: uid(), userId: studentId, title: `Quiz result: ${percent}%`, body: `"${quiz.title}" — ${passed ? "passed ✓" : "below the pass mark"}. ${quiz.showImmediate ? "Review your answers now." : "Details released by your teacher."}`, kind: "quiz", read: false, createdAt: Date.now(), link: `/app/quiz/${quizId}` });
  }, { action: "submit_quiz", entity: "quiz_attempt", details: `'${quiz.title}' — ${percent}% (${passed ? "pass" : "fail"})` });
  return attempt;
}

export function submitAssignment(assignmentId: string, studentId: string, text: string, fileName?: string): string | null {
  const a = assignmentById(assignmentId);
  if (!a) return "Assignment not found.";
  const existing = db.submissions.find((s) => s.assignmentId === assignmentId && s.studentId === studentId);
  if (existing && existing.status !== "returned") return "You have already submitted this assignment.";
  const course = courseById(a.courseId);
  commit((d) => {
    if (existing) Object.assign(existing, { text, fileName, submittedAt: Date.now(), status: "submitted", marks: undefined, feedback: undefined });
    else d.submissions.push({ id: uid(), assignmentId, studentId, text, fileName, submittedAt: Date.now(), status: "submitted" });
    if (course?.teacherId) {
      d.notifications.unshift({ id: uid(), userId: course.teacherId, title: "New submission to grade", body: `${userById(studentId)?.name} submitted "${a.title}".`, kind: "assignment", read: false, createdAt: Date.now(), link: "/app/assignments" });
    }
  }, { action: "submit_assignment", entity: "submission", details: `'${a.title}' by ${userById(studentId)?.name}` });
  return null;
}

export function gradeSubmission(submissionId: string, marks: number, feedback: string) {
  const s = db.submissions.find((x) => x.id === submissionId);
  if (!s) return;
  const a = assignmentById(s.assignmentId);
  const course = a ? courseById(a.courseId) : undefined;
  const teacher = session ? userById(session.userId) : undefined;
  commit((d) => {
    const sub = d.submissions.find((x) => x.id === submissionId)!;
    sub.status = "graded"; sub.marks = marks; sub.feedback = feedback; sub.gradedAt = Date.now();
    if (a && course) {
      d.results.unshift({ id: uid(), studentId: s.studentId, subjectId: course.subjectId, courseId: course.id, assessment: a.title, score: marks, maxScore: a.maxMarks, comment: feedback, term: "Term 1 2026", date: Date.now(), releasedBy: teacher?.id ?? "system" });
    }
    d.notifications.unshift({ id: uid(), userId: s.studentId, title: "Assignment graded", body: `"${a?.title}" — ${marks}/${a?.maxMarks}. ${feedback ? "Feedback available." : ""}`, kind: "result", read: false, createdAt: Date.now(), link: "/app/results" });
  }, { action: "grade_submission", entity: "submission", details: `'${a?.title}' — ${marks}/${a?.maxMarks}` });
}

export function addResult(r: { studentId: string; subjectId: string; courseId?: string; assessment: string; score: number; maxScore: number; comment: string; term: string }) {
  const teacher = session ? userById(session.userId) : undefined;
  commit((d) => {
    d.results.unshift({ id: uid(), ...r, date: Date.now(), releasedBy: teacher?.id ?? "system" });
    d.notifications.unshift({ id: uid(), userId: r.studentId, title: "Result released", body: `${r.assessment}: ${r.score}/${r.maxScore} (${computeGrade((r.score / r.maxScore) * 100)})`, kind: "result", read: false, createdAt: Date.now(), link: "/app/results" });
  }, { action: "release_result", entity: "result", details: `${r.assessment} — ${r.score}/${r.maxScore}` });
}

/* ── announcements ───────────────────────────────────────────────────────── */
export function resolveAudience(audience: Audience, ref?: string): User[] {
  switch (audience) {
    case "all-students": return db.users.filter((u) => u.role === "student" && u.active);
    case "teachers": return db.users.filter((u) => u.role === "teacher" && u.active);
    case "parents": return db.users.filter((u) => u.role === "parent" && u.active);
    case "course": return db.enrollments.filter((e) => e.courseId === ref && e.status !== "cancelled").map((e) => userById(e.studentId)).filter((u): u is User => !!u);
    case "grade": return db.users.filter((u) => u.role === "student" && u.gradeId === ref && u.active);
    default: return db.users.filter((u) => u.active);
  }
}

export function publishAnnouncement(a: { title: string; content: string; audience: Audience; audienceRef?: string; pinned?: boolean; expiresAt?: number }) {
  const author = session ? userById(session.userId) : undefined;
  let count = 0;
  commit((d) => {
    const ann: Announcement = { id: uid(), ...a, authorId: author?.id ?? "system", publishedAt: Date.now() };
    d.announcements.unshift(ann);
    const targets = resolveAudience(a.audience, a.audienceRef);
    count = targets.length;
    for (const t of targets) {
      d.notifications.unshift({ id: uid(), userId: t.id, title: a.title, body: a.content.slice(0, 120) + (a.content.length > 120 ? "…" : ""), kind: "announcement", read: false, createdAt: Date.now(), link: "/app/dashboard" });
    }
  }, { action: "publish_announcement", entity: "announcement", details: `'${a.title}' → ${a.audience}` });
  return count;
}

/* ── parent linking ──────────────────────────────────────────────────────── */
export function linkChild(parentId: string, code: string): string | null {
  const student = db.users.find((u) => u.role === "student" && u.studentCode?.toLowerCase() === code.trim().toLowerCase());
  if (!student) return "No learner found with that code. Codes look like SSGT-1001.";
  if (!student.active) return "That learner account is inactive.";
  const parent = userById(parentId);
  if (parent?.linkedStudentIds?.includes(student.id)) return `${student.name} is already linked to your account.`;
  commit((d) => {
    const p = d.users.find((u) => u.id === parentId)!;
    p.linkedStudentIds = [...(p.linkedStudentIds ?? []), student.id];
    d.notifications.unshift({ id: uid(), userId: parentId, title: "Learner linked ✓", body: `${student.name} (${student.studentCode}) is now connected to your parent account.`, kind: "system", read: false, createdAt: Date.now() });
    d.notifications.unshift({ id: uid(), userId: student.id, title: "Parent account linked", body: `${p.name} can now view your academic progress.`, kind: "system", read: false, createdAt: Date.now() });
  }, { action: "link_student", entity: "parent_student", details: `${userById(parentId)?.name} linked ${student.name}` });
  return null;
}

/* ── admin operations ────────────────────────────────────────────────────── */
export function adminSaveUser( { id?: string; name: string; email: string; phone?: string; role: Role; gradeId?: string; active?: boolean }): { error?: string; tempPassword?: string } {
  if (!data.name.trim() || !data.email.trim()) return { error: "Name and email are required." };
  if (db.users.some((u) => u.email.toLowerCase() === data.email.trim().toLowerCase() && u.id !== data.id)) return { error: "A user with this email already exists." };
  if (data.id) {
    commit((d) => { Object.assign(d.users.find((u) => u.id === data.id)!, { name: data.name, email: data.email.toLowerCase(), phone: data.phone, role: data.role, gradeId: data.gradeId, active: data.active ?? true }); },
      { action: "update_user", entity: "user", details: `Updated ${data.name}` });
    return {};
  }
  const temp = "Karibu#" + Math.floor(1000 + Math.random() * 9000);
  const students = db.users.filter((u) => u.role === "student").length;
  commit((d) => {
    d.users.push({
      id: uid(), name: data.name.trim(), email: data.email.trim().toLowerCase(), phone: data.phone, pass: hash(temp),
      role: data.role, color: ["#0C5A43", "#B56508", "#C4562E", "#1F6A50", "#8F4D0D", "#357E62"][d.users.length % 6],
      active: data.active ?? true, createdAt: Date.now(), gradeId: data.gradeId,
      studentCode: data.role === "student" ? `SSGT-${1001 + students}` : undefined,
      linkedStudentIds: data.role === "parent" ? [] : undefined,
    });
  }, { action: "create_user", entity: "user", details: `Created ${data.role} account: ${data.email}` });
  return { tempPassword: temp };
}

export function resetUserPassword(userId: string): string {
  const temp = "Karibu#" + Math.floor(1000 + Math.random() * 9000);
  commit((d) => {
    const u = d.users.find((x) => x.id === userId)!;
    u.pass = hash(temp);
    d.emails.unshift({ id: uid(), to: u.email, template: "password-reset", subject: `Your temporary password: ${temp}`, date: Date.now() });
  }, { action: "reset_password", entity: "user", details: `Temporary password for ${userById(userId)?.email}` });
  return temp;
}

export function saveSettings(patch: Partial<DB["settings"]>) {
  commit((d) => { d.settings = { ...d.settings, ...patch }; }, { action: "update_settings", entity: "settings", details: "Platform settings updated" });
}

export function addContact(c: { name: string; email: string; phone: string; subject: string; message: string }) {
  commit((d) => {
    d.contacts.unshift({ id: uid(), ...c, date: Date.now(), read: false });
    for (const admin of d.users.filter((u) => u.role === "admin")) {
      d.notifications.unshift({ id: uid(), userId: admin.id, title: "New contact message", body: `${c.name} — ${c.subject}`, kind: "system", read: false, createdAt: Date.now(), link: "/app/messages" });
    }
  }, { action: "contact_received", entity: "contact", details: `${c.name}: ${c.subject}` });
}

/* ── analytics helpers ───────────────────────────────────────────────────── */
export function activitySeries(studentId: string, days = 14): number[] {
  const out: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0);
    const start = dayStart.getTime() - i * 86400000, end = start + 86400000;
    out.push(
      db.lessonProgress.filter((p) => p.studentId === studentId && p.completedAt >= start && p.completedAt < end).length +
      db.attempts.filter((a) => a.studentId === studentId && a.submittedAt >= start && a.submittedAt < end).length
    );
  }
  return out;
}

export function monthSeries(months: number, fn: (monthStart: number, monthEnd: number) => number) {
  const labels: string[] = [], values: number[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    labels.push(start.toLocaleDateString("en-KE", { month: "short" }));
    values.push(fn(start.getTime(), end.getTime()));
  }
  return { labels, values };
}

export function downloadResource(resourceId: string) {
  commit((d) => { const r = d.resources.find((x) => x.id === resourceId); if (r && r.downloadEnabled) r.downloads += 1; });
}

export function searchAll(q: string) {
  const s = q.trim().toLowerCase();
  if (s.length < 2) return null;
  return {
    courses: db.courses.filter((c) => c.published && (c.title + " " + c.description).toLowerCase().includes(s)).slice(0, 5),
    subjects: db.subjects.filter((x) => x.active && x.name.toLowerCase().includes(s)).slice(0, 4),
    lessons: db.lessons.filter((l) => l.title.toLowerCase().includes(s)).slice(0, 5),
    resources: db.resources.filter((r) => r.active && (r.title + " " + r.description).toLowerCase().includes(s)).slice(0, 4),
    teachers: db.users.filter((u) => u.role === "teacher" && u.active && (u.name + " " + (u.bio ?? "")).toLowerCase().includes(s)).slice(0, 3),
  };
}


+++ src/lib/db.ts (修改后)
import { useEffect, useReducer } from "react";
import type { Announcement, Audience, Course, DB, Lesson, Question, Resource, Role, Session, Submission, User } from "./types";
import { makeSeed } from "./seed";

/* ────────────────────────────────────────────────────────────────────────────
   SSGT data + service layer.

   Architecture note: this module is the client-side implementation of the
   platform's API boundary. Every mutation flows through `commit()`, which is
   where a server would enforce authorization, validation, audit logging and
   persistence (PostgreSQL via Prisma). Swapping localStorage for API calls is
   a one-file change; the UI only talks to the functions below.
   ──────────────────────────────────────────────────────────────────────────── */

const DB_KEY = "ssgt-db-v2";
const SES_KEY = "ssgt-session-v1";
export const DEMO_PASSWORD = "Demo@123";

/**
 * Official academy identity. Every surface that shows the academy's contact
 * details reads from `db.settings` (seeded from these values and editable in
 * Academy Settings → Contact Information). Do not add alternative numbers or
 * email addresses anywhere in the codebase.
 */
export const ACADEMY = {
  name: "School Smart Guide Tutors",
  phone: "0112866660",
  email: "schoolsmartguidetutors@gmail.com",
};

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);

/** Demo-only salted hash. Production: bcrypt/argon2 on the server — never client hashing. */
export function hash(s: string) {
  const str = "ssgt-pepper::" + s;
  let h1 = 0xdeadbeef ^ 7, h2 = 0x41c6ce57 ^ 7;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16) + (h1 >>> 0).toString(16);
}

function loadDB(): DB {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DB;
      if (parsed?.users?.length) {
        // Normalize seeded demo passwords into hashes on first load.
        parsed.users = parsed.users.map((u) => (u.pass === "demo" ? { ...u, pass: hash(DEMO_PASSWORD) } : u));
        // Backfill official academy identity for older stores.
        if (parsed.settings) {
          parsed.settings = {
            ...parsed.settings,
            academyName: parsed.settings.academyName || ACADEMY.name,
            logo: parsed.settings.logo || "built-in",
            socials: { ...parsed.settings.socials },
          };
        }
        return parsed;
      }
    }
  } catch { /* corrupted store → reseed */ }
  const fresh = makeSeed();
  fresh.users = fresh.users.map((u) => (u.pass === "demo" ? { ...u, pass: hash(DEMO_PASSWORD) } : u));
  try { localStorage.setItem(DB_KEY, JSON.stringify(fresh)); } catch { /* private mode */ }
  return fresh;
}

let db: DB = loadDB();
let session: Session | null = (() => {
  try { const raw = localStorage.getItem(SES_KEY); return raw ? (JSON.parse(raw) as Session) : null; } catch { return null; }
})();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const persist = () => { try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch { /* ignore */ } };

export function useApp() {
  const [, force] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    const l = () => force();
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  const u = session ? db.users.find((x) => x.id === session!.userId) : undefined;
  return { db, user: u && u.active ? u : null, session };
}

export function commit(fn: (d: DB) => void, auditInfo?: { action: string; entity: string; details?: string }) {
  fn(db);
  if (auditInfo) {
    const who = session ? db.users.find((u) => u.id === session!.userId) : undefined;
    db.audit.unshift({ id: uid(), userId: who?.id ?? "system", userName: who?.name ?? "System", action: auditInfo.action, entity: auditInfo.entity, details: auditInfo.details ?? "", date: Date.now() });
    db.audit = db.audit.slice(0, 400);
  }
  db = { ...db };
  persist();
  emit();
}

/* ── lookups ─────────────────────────────────────────────────────────────── */
export const userById = (id: string) => db.users.find((u) => u.id === id);
export const courseById = (id: string) => db.courses.find((c) => c.id === id);
export const lessonById = (id: string) => db.lessons.find((l) => l.id === id);
export const subjectById = (id: string) => db.subjects.find((s) => s.id === id);
export const subjectName = (id: string) => subjectById(id)?.name ?? "—";
export const gradeName = (id: string) => db.grades.find((g) => g.id === id)?.name ?? "—";
export const levelName = (id: string) => db.levels.find((l) => l.id === id)?.name ?? "—";
export const curriculumName = (id: string) => db.curricula.find((c) => c.id === id)?.name ?? "—";
export const quizById = (id: string) => db.quizzes.find((q) => q.id === id);
export const assignmentById = (id: string) => db.assignments.find((a) => a.id === id);

export function modulesOf(courseId: string) {
  return db.modules.filter((m) => m.courseId === courseId).sort((a, b) => a.order - b.order);
}
export function lessonsOf(courseId: string): Lesson[] {
  const out: Lesson[] = [];
  for (const m of modulesOf(courseId))
    out.push(...db.lessons.filter((l) => l.moduleId === m.id).sort((a, b) => a.order - b.order));
  return out;
}
export function quizzesOf(courseId: string) { return db.quizzes.filter((q) => q.courseId === courseId && q.active); }
export function assignmentsOf(courseId: string) { return db.assignments.filter((a) => a.courseId === courseId && a.active); }
export const enrollmentFor = (studentId: string, courseId: string) =>
  db.enrollments.find((e) => e.studentId === studentId && e.courseId === courseId && e.status !== "cancelled");

export function courseProgress(studentId: string, courseId: string) {
  const lessons = lessonsOf(courseId);
  const done = lessons.filter((l) => db.lessonProgress.some((p) => p.studentId === studentId && p.lessonId === l.id)).length;
  return { done, total: lessons.length, percent: lessons.length ? Math.round((done / lessons.length) * 100) : 0 };
}

export function computeGrade(pct: number) {
  if (pct >= 80) return "A"; if (pct >= 75) return "A-"; if (pct >= 70) return "B+";
  if (pct >= 65) return "B"; if (pct >= 60) return "B-"; if (pct >= 55) return "C+";
  if (pct >= 50) return "C"; if (pct >= 45) return "C-"; if (pct >= 40) return "D+";
  if (pct >= 35) return "D"; if (pct >= 30) return "D-"; return "E";
}

/* ── auth ────────────────────────────────────────────────────────────────── */
export function login(email: string, password: string): string | null {
  const u = db.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
  if (!u) return "No account found with that email.";
  if (!u.active) return "This account has been deactivated. Contact your administrator.";
  if (u.pass !== hash(password)) return "Incorrect password. Try again.";
  session = { userId: u.id, token: uid(), issuedAt: Date.now() };
  try { localStorage.setItem(SES_KEY, JSON.stringify(session)); } catch { /* ignore */ }
  commit(() => {}, { action: "login", entity: "auth", details: `${u.name} signed in` });
  return null;
}

export function logout() {
  const who = session ? userById(session.userId) : undefined;
  session = null;
  try { localStorage.removeItem(SES_KEY); } catch { /* ignore */ }
  commit(() => {}, { action: "logout", entity: "auth", details: `${who?.name ?? "User"} signed out` });
}

export function register( { name: string; email: string; phone: string; role: Role; gradeId?: string; password: string }): string | null {
  if (!db.settings.registrationOpen) return "Registration is currently closed. Please contact the school office.";
  if (db.users.some((u) => u.email.toLowerCase() === data.email.trim().toLowerCase())) return "An account with this email already exists.";
  if (data.password.length < 8) return "Password must be at least 8 characters.";
  const students = db.users.filter((u) => u.role === "student").length;
  const id = uid();
  commit((d) => {
    d.users.push({
      id, name: data.name.trim(), email: data.email.trim().toLowerCase(), phone: data.phone, pass: hash(data.password),
      role: data.role, color: ["#0C5A43", "#B56508", "#C4562E", "#1F6A50", "#8F4D0D"][students % 5], active: true,
      createdAt: Date.now(), gradeId: data.gradeId,
      studentCode: data.role === "student" ? `SSGT-${1001 + students}` : undefined,
      linkedStudentIds: data.role === "parent" ? [] : undefined,
      notifyEmail: true, notifyPush: true,
    });
    d.notifications.unshift({ id: uid(), userId: id, title: "Karibu SSGT! 🎓", body: "Your account is ready. Explore courses, join a class and start learning.", kind: "system", read: false, createdAt: Date.now(), link: "/app/dashboard" });
    d.emails.unshift({ id: uid(), to: data.email, template: "welcome", subject: "Welcome to School Smart Guide Tutors", date: Date.now() });
  }, { action: "register", entity: "user", details: `New ${data.role} account: ${data.email}` });
  session = { userId: id, token: uid(), issuedAt: Date.now() };
  try { localStorage.setItem(SES_KEY, JSON.stringify(session)); } catch { /* ignore */ }
  emit();
  return null;
}

export function requestPasswordReset(email: string): string | null {
  const u = db.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
  if (!u) return "No account found with that email.";
  const temp = "Karibu#" + Math.floor(1000 + Math.random() * 9000);
  commit((d) => {
    const usr = d.users.find((x) => x.id === u.id)!;
    usr.pass = hash(temp);
    d.notifications.unshift({ id: uid(), userId: u.id, title: "Password reset", body: "Your password was reset. Use the temporary password sent to your email, then change it in Profile.", kind: "system", read: false, createdAt: Date.now() });
    d.emails.unshift({ id: uid(), to: u.email, template: "password-reset", subject: `Your temporary password: ${temp}`, date: Date.now() });
  }, { action: "password_reset", entity: "user", details: `Temporary password issued for ${u.email}` });
  return temp;
}

export function changePassword(userId: string, current: string, next: string): string | null {
  const u = userById(userId);
  if (!u) return "Account not found.";
  if (u.pass !== hash(current)) return "Current password is incorrect.";
  if (next.length < 8) return "New password must be at least 8 characters.";
  commit((d) => { d.users.find((x) => x.id === userId)!.pass = hash(next); },
    { action: "change_password", entity: "user", details: `${u.name} changed their password` });
  return null;
}

export function updateProfile(userId: string, patch: Partial<User>) {
  commit((d) => { Object.assign(d.users.find((x) => x.id === userId)!, patch); },
    { action: "update_profile", entity: "user", details: "Profile updated" });
}

/* ── notifications ───────────────────────────────────────────────────────── */
export function notifyUser(userId: string, n: { title: string; body: string; kind: string; link?: string }) {
  commit((d) => {
    d.notifications.unshift({ id: uid(), userId, title: n.title, body: n.body, kind: n.kind as never, read: false, createdAt: Date.now(), link: n.link });
    d.notifications = d.notifications.slice(0, 500);
  });
}
export const unreadCount = (userId: string) => db.notifications.filter((n) => n.userId === userId && !n.read).length;
export function markRead(id: string) { commit((d) => { const n = d.notifications.find((x) => x.id === id); if (n) n.read = true; }); }
export function markAllRead(userId: string) { commit((d) => { d.notifications.forEach((n) => { if (n.userId === userId) n.read = true; }); }); }

/* ── enrollment & payment ────────────────────────────────────────────────── */
export function enrollFree(studentId: string, courseId: string): string | null {
  const c = courseById(courseId);
  if (!c) return "Course not found.";
  if (enrollmentFor(studentId, courseId)) return "You are already enrolled in this course.";
  if (c.price > 0) return "This is a paid course — complete payment to enrol.";
  commit((d) => {
    d.enrollments.push({ id: uid(), studentId, courseId, status: "active", enrolledAt: Date.now(), paymentStatus: "none" });
    const course = d.courses.find((x) => x.id === courseId)!;
    course.enrolledCount += 1;
    d.notifications.unshift({ id: uid(), userId: studentId, title: "Enrolment confirmed 🎉", body: `You are now enrolled in "${course.title}". Your first lesson awaits.`, kind: "course", read: false, createdAt: Date.now(), link: `/app/learn/${courseId}` });
    d.emails.unshift({ id: uid(), to: userById(studentId)?.email ?? "", template: "enrollment-confirmation", subject: `You're enrolled: ${course.title}`, date: Date.now() });
  }, { action: "enroll", entity: "enrollment", details: `${userById(studentId)?.name} enrolled in '${c.title}' (free)` });
  return null;
}

/** Called by the payment integration after a successful charge (M-Pesa STK / card). */
export function confirmPayment(studentId: string, courseId: string, amount: number, method: "mpesa" | "card" | "bank", reference: string, phone?: string): string | null {
  const c = courseById(courseId);
  if (!c) return "Course not found.";
  commit((d) => {
    const pendingPay = d.payments.find((p) => p.studentId === studentId && p.courseId === courseId && p.status === "pending");
    if (pendingPay) { pendingPay.status = "completed"; pendingPay.reference = reference; pendingPay.method = method; pendingPay.date = Date.now(); }
    else d.payments.unshift({ id: uid(), studentId, courseId, amount, method, status: "completed", reference, phone, date: Date.now() });
    const en = d.enrollments.find((e) => e.studentId === studentId && e.courseId === courseId);
    if (en) { en.status = "active"; en.paymentStatus = "paid"; }
    else {
      d.enrollments.push({ id: uid(), studentId, courseId, status: "active", enrolledAt: Date.now(), paymentStatus: "paid" });
      d.courses.find((x) => x.id === courseId)!.enrolledCount += 1;
    }
    d.notifications.unshift({ id: uid(), userId: studentId, title: "Payment received ✓", body: `KSh ${amount.toLocaleString()} confirmed (${reference}). You are enrolled in "${c.title}".`, kind: "payment", read: false, createdAt: Date.now(), link: `/app/learn/${courseId}` });
    d.emails.unshift({ id: uid(), to: userById(studentId)?.email ?? "", template: "payment-receipt", subject: `Receipt: KSh ${amount} — ${c.title}`, date: Date.now() });
  }, { action: "confirm_payment", entity: "payment", details: `${method.toUpperCase()} ${reference} — KSh ${amount} (${userById(studentId)?.name})` });
  return null;
}

export function createPendingPayment(studentId: string, courseId: string, amount: number, method: "mpesa" | "card" | "bank", phone?: string) {
  if (db.payments.some((p) => p.studentId === studentId && p.courseId === courseId && p.status === "pending")) return;
  commit((d) => {
    d.payments.unshift({ id: uid(), studentId, courseId, amount, method, status: "pending", reference: "—" , phone, date: Date.now() });
    const en = d.enrollments.find((e) => e.studentId === studentId && e.courseId === courseId);
    if (!en) d.enrollments.push({ id: uid(), studentId, courseId, status: "pending", enrolledAt: Date.now(), paymentStatus: "pending" });
  }, { action: "initiate_payment", entity: "payment", details: `Pending payment KSh ${amount} (${userById(studentId)?.name})` });
}

/* ── learning: progress, bookmarks, quizzes, assignments ─────────────────── */
export function markLessonComplete(studentId: string, lesson: Lesson) {
  commit((d) => {
    if (d.lessonProgress.some((p) => p.studentId === studentId && p.lessonId === lesson.id)) return;
    d.lessonProgress.push({ id: uid(), studentId, lessonId: lesson.id, courseId: lesson.courseId, completedAt: Date.now() });
    const grant = (defId: string, name: string, body: string) => {
      if (d.earned.some((e) => e.studentId === studentId && e.defId === defId)) return;
      d.earned.push({ id: uid(), studentId, defId, earnedAt: Date.now() });
      d.notifications.unshift({ id: uid(), userId: studentId, title: `Badge unlocked: ${name}`, body, kind: "system", read: false, createdAt: Date.now(), link: "/app/progress" });
    };
    const totalLessons = d.lessonProgress.filter((p) => p.studentId === studentId).length;
    if (totalLessons === 1) grant("ach-first", "First Steps", "You completed your very first lesson. The journey has begun!");
    if (totalLessons >= 10) grant("ach-streak", "Momentum", "10 lessons completed across your courses. Unstoppable!");
    const courseLessons = lessonsOf(lesson.courseId);
    const done = courseLessons.filter((l) => d.lessonProgress.some((p) => p.studentId === studentId && p.lessonId === l.id)).length;
    const pct = courseLessons.length ? Math.round((done / courseLessons.length) * 100) : 0;
    if (pct >= 50) grant("ach-half", "Halfway Hero", "You are more than halfway through a course. The summit is in sight!");
    if (pct === 100) {
      const en = d.enrollments.find((e) => e.studentId === studentId && e.courseId === lesson.courseId && e.status === "active");
      if (en) { en.status = "completed"; en.completedAt = Date.now(); }
      grant("ach-grad", "Course Graduate", "You completed an entire course. Hongera!");
      d.notifications.unshift({ id: uid(), userId: studentId, title: "Course completed 🎓", body: `Congratulations — you finished "${courseById(lesson.courseId)?.title}".`, kind: "course", read: false, createdAt: Date.now(), link: "/app/progress" });
    }
  }, { action: "complete_lesson", entity: "lesson", details: `'${lesson.title}' completed` });
}

export function isBookmarked(userId: string, type: string, refId: string) {
  return db.bookmarks.some((b) => b.userId === userId && b.type === type && b.refId === refId);
}
export function toggleBookmark(userId: string, type: "lesson" | "resource" | "course", refId: string): boolean {
  const existing = db.bookmarks.find((b) => b.userId === userId && b.type === type && b.refId === refId);
  let added = false;
  commit((d) => {
    if (existing) d.bookmarks = d.bookmarks.filter((b) => b.id !== existing.id);
    else {
      d.bookmarks.push({ id: uid(), userId, type, refId, createdAt: Date.now() });
      added = true;
      const count = d.bookmarks.filter((b) => b.userId === userId).length;
      if (count >= 5 && !d.earned.some((e) => e.studentId === userId && e.defId === "ach-book")) {
        d.earned.push({ id: uid(), studentId: userId, defId: "ach-book", earnedAt: Date.now() });
        d.notifications.unshift({ id: uid(), userId, title: "Badge unlocked: Curious Collector", body: "You bookmarked 5 lessons or resources.", kind: "system", read: false, createdAt: Date.now() });
      }
    }
  });
  return added;
}

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
export function gradeQuestion(q: Question, given: string | undefined): boolean {
  if (given === undefined || given === "") return false;
  if (q.type === "short") return q.answer.split("|").some((a) => norm(a) === norm(given));
  return norm(q.answer) === norm(given);
}

export function submitQuizAttempt(quizId: string, studentId: string, answers: Record<string, string>, timeSpentSec: number) {
  const quiz = quizById(quizId)!;
  const score = quiz.questions.filter((q) => gradeQuestion(q, answers[q.id])).length;
  const percent = Math.round((score / quiz.questions.length) * 100);
  const passed = percent >= quiz.passingPercent;
  const attempt = { id: uid(), quizId, studentId, answers, score, total: quiz.questions.length, percent, passed, timeSpentSec, submittedAt: Date.now() };
  commit((d) => {
    d.attempts.unshift(attempt);
    if (passed && !d.earned.some((e) => e.studentId === studentId && e.defId === "ach-ace")) {
      d.earned.push({ id: uid(), studentId, defId: "ach-ace", earnedAt: Date.now() });
      d.notifications.unshift({ id: uid(), userId: studentId, title: "Badge unlocked: Quiz Ace", body: "You passed your first quiz!", kind: "quiz", read: false, createdAt: Date.now() });
    }
    d.notifications.unshift({ id: uid(), userId: studentId, title: `Quiz result: ${percent}%`, body: `"${quiz.title}" — ${passed ? "passed ✓" : "below the pass mark"}. ${quiz.showImmediate ? "Review your answers now." : "Details released by your teacher."}`, kind: "quiz", read: false, createdAt: Date.now(), link: `/app/quiz/${quizId}` });
  }, { action: "submit_quiz", entity: "quiz_attempt", details: `'${quiz.title}' — ${percent}% (${passed ? "pass" : "fail"})` });
  return attempt;
}

export function submitAssignment(assignmentId: string, studentId: string, text: string, fileName?: string): string | null {
  const a = assignmentById(assignmentId);
  if (!a) return "Assignment not found.";
  const existing = db.submissions.find((s) => s.assignmentId === assignmentId && s.studentId === studentId);
  if (existing && existing.status !== "returned") return "You have already submitted this assignment.";
  const course = courseById(a.courseId);
  commit((d) => {
    if (existing) Object.assign(existing, { text, fileName, submittedAt: Date.now(), status: "submitted", marks: undefined, feedback: undefined });
    else d.submissions.push({ id: uid(), assignmentId, studentId, text, fileName, submittedAt: Date.now(), status: "submitted" });
    if (course?.teacherId) {
      d.notifications.unshift({ id: uid(), userId: course.teacherId, title: "New submission to grade", body: `${userById(studentId)?.name} submitted "${a.title}".`, kind: "assignment", read: false, createdAt: Date.now(), link: "/app/assignments" });
    }
  }, { action: "submit_assignment", entity: "submission", details: `'${a.title}' by ${userById(studentId)?.name}` });
  return null;
}

export function gradeSubmission(submissionId: string, marks: number, feedback: string) {
  const s = db.submissions.find((x) => x.id === submissionId);
  if (!s) return;
  const a = assignmentById(s.assignmentId);
  const course = a ? courseById(a.courseId) : undefined;
  const teacher = session ? userById(session.userId) : undefined;
  commit((d) => {
    const sub = d.submissions.find((x) => x.id === submissionId)!;
    sub.status = "graded"; sub.marks = marks; sub.feedback = feedback; sub.gradedAt = Date.now();
    if (a && course) {
      d.results.unshift({ id: uid(), studentId: s.studentId, subjectId: course.subjectId, courseId: course.id, assessment: a.title, score: marks, maxScore: a.maxMarks, comment: feedback, term: "Term 1 2026", date: Date.now(), releasedBy: teacher?.id ?? "system" });
    }
    d.notifications.unshift({ id: uid(), userId: s.studentId, title: "Assignment graded", body: `"${a?.title}" — ${marks}/${a?.maxMarks}. ${feedback ? "Feedback available." : ""}`, kind: "result", read: false, createdAt: Date.now(), link: "/app/results" });
  }, { action: "grade_submission", entity: "submission", details: `'${a?.title}' — ${marks}/${a?.maxMarks}` });
}

export function addResult(r: { studentId: string; subjectId: string; courseId?: string; assessment: string; score: number; maxScore: number; comment: string; term: string }) {
  const teacher = session ? userById(session.userId) : undefined;
  commit((d) => {
    d.results.unshift({ id: uid(), ...r, date: Date.now(), releasedBy: teacher?.id ?? "system" });
    d.notifications.unshift({ id: uid(), userId: r.studentId, title: "Result released", body: `${r.assessment}: ${r.score}/${r.maxScore} (${computeGrade((r.score / r.maxScore) * 100)})`, kind: "result", read: false, createdAt: Date.now(), link: "/app/results" });
  }, { action: "release_result", entity: "result", details: `${r.assessment} — ${r.score}/${r.maxScore}` });
}

/* ── announcements ───────────────────────────────────────────────────────── */
export function resolveAudience(audience: Audience, ref?: string): User[] {
  switch (audience) {
    case "all-students": return db.users.filter((u) => u.role === "student" && u.active);
    case "teachers": return db.users.filter((u) => u.role === "teacher" && u.active);
    case "parents": return db.users.filter((u) => u.role === "parent" && u.active);
    case "course": return db.enrollments.filter((e) => e.courseId === ref && e.status !== "cancelled").map((e) => userById(e.studentId)).filter((u): u is User => !!u);
    case "grade": return db.users.filter((u) => u.role === "student" && u.gradeId === ref && u.active);
    default: return db.users.filter((u) => u.active);
  }
}

export function publishAnnouncement(a: { title: string; content: string; audience: Audience; audienceRef?: string; pinned?: boolean; expiresAt?: number }) {
  const author = session ? userById(session.userId) : undefined;
  let count = 0;
  commit((d) => {
    const ann: Announcement = { id: uid(), ...a, authorId: author?.id ?? "system", publishedAt: Date.now() };
    d.announcements.unshift(ann);
    const targets = resolveAudience(a.audience, a.audienceRef);
    count = targets.length;
    for (const t of targets) {
      d.notifications.unshift({ id: uid(), userId: t.id, title: a.title, body: a.content.slice(0, 120) + (a.content.length > 120 ? "…" : ""), kind: "announcement", read: false, createdAt: Date.now(), link: "/app/dashboard" });
    }
  }, { action: "publish_announcement", entity: "announcement", details: `'${a.title}' → ${a.audience}` });
  return count;
}

/* ── parent linking ──────────────────────────────────────────────────────── */
export function linkChild(parentId: string, code: string): string | null {
  const student = db.users.find((u) => u.role === "student" && u.studentCode?.toLowerCase() === code.trim().toLowerCase());
  if (!student) return "No learner found with that code. Codes look like SSGT-1001.";
  if (!student.active) return "That learner account is inactive.";
  const parent = userById(parentId);
  if (parent?.linkedStudentIds?.includes(student.id)) return `${student.name} is already linked to your account.`;
  commit((d) => {
    const p = d.users.find((u) => u.id === parentId)!;
    p.linkedStudentIds = [...(p.linkedStudentIds ?? []), student.id];
    d.notifications.unshift({ id: uid(), userId: parentId, title: "Learner linked ✓", body: `${student.name} (${student.studentCode}) is now connected to your parent account.`, kind: "system", read: false, createdAt: Date.now() });
    d.notifications.unshift({ id: uid(), userId: student.id, title: "Parent account linked", body: `${p.name} can now view your academic progress.`, kind: "system", read: false, createdAt: Date.now() });
  }, { action: "link_student", entity: "parent_student", details: `${userById(parentId)?.name} linked ${student.name}` });
  return null;
}

/* ── admin operations ────────────────────────────────────────────────────── */
export function adminSaveUser( { id?: string; name: string; email: string; phone?: string; role: Role; gradeId?: string; active?: boolean }): { error?: string; tempPassword?: string } {
  if (!data.name.trim() || !data.email.trim()) return { error: "Name and email are required." };
  if (db.users.some((u) => u.email.toLowerCase() === data.email.trim().toLowerCase() && u.id !== data.id)) return { error: "A user with this email already exists." };
  if (data.id) {
    commit((d) => { Object.assign(d.users.find((u) => u.id === data.id)!, { name: data.name, email: data.email.toLowerCase(), phone: data.phone, role: data.role, gradeId: data.gradeId, active: data.active ?? true }); },
      { action: "update_user", entity: "user", details: `Updated ${data.name}` });
    return {};
  }
  const temp = "Karibu#" + Math.floor(1000 + Math.random() * 9000);
  const students = db.users.filter((u) => u.role === "student").length;
  commit((d) => {
    d.users.push({
      id: uid(), name: data.name.trim(), email: data.email.trim().toLowerCase(), phone: data.phone, pass: hash(temp),
      role: data.role, color: ["#0C5A43", "#B56508", "#C4562E", "#1F6A50", "#8F4D0D", "#357E62"][d.users.length % 6],
      active: data.active ?? true, createdAt: Date.now(), gradeId: data.gradeId,
      studentCode: data.role === "student" ? `SSGT-${1001 + students}` : undefined,
      linkedStudentIds: data.role === "parent" ? [] : undefined,
    });
  }, { action: "create_user", entity: "user", details: `Created ${data.role} account: ${data.email}` });
  return { tempPassword: temp };
}

export function resetUserPassword(userId: string): string {
  const temp = "Karibu#" + Math.floor(1000 + Math.random() * 9000);
  commit((d) => {
    const u = d.users.find((x) => x.id === userId)!;
    u.pass = hash(temp);
    d.emails.unshift({ id: uid(), to: u.email, template: "password-reset", subject: `Your temporary password: ${temp}`, date: Date.now() });
  }, { action: "reset_password", entity: "user", details: `Temporary password for ${userById(userId)?.email}` });
  return temp;
}

export function saveSettings(patch: Partial<DB["settings"]>) {
  commit((d) => { d.settings = { ...d.settings, ...patch }; }, { action: "update_settings", entity: "settings", details: "Platform settings updated" });
}

export function addContact(c: { name: string; email: string; phone: string; subject: string; message: string }) {
  commit((d) => {
    d.contacts.unshift({ id: uid(), ...c, date: Date.now(), read: false });
    for (const admin of d.users.filter((u) => u.role === "admin")) {
      d.notifications.unshift({ id: uid(), userId: admin.id, title: "New contact message", body: `${c.name} — ${c.subject}`, kind: "system", read: false, createdAt: Date.now(), link: "/app/messages" });
    }
  }, { action: "contact_received", entity: "contact", details: `${c.name}: ${c.subject}` });
}

/* ── analytics helpers ───────────────────────────────────────────────────── */
export function activitySeries(studentId: string, days = 14): number[] {
  const out: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0);
    const start = dayStart.getTime() - i * 86400000, end = start + 86400000;
    out.push(
      db.lessonProgress.filter((p) => p.studentId === studentId && p.completedAt >= start && p.completedAt < end).length +
      db.attempts.filter((a) => a.studentId === studentId && a.submittedAt >= start && a.submittedAt < end).length
    );
  }
  return out;
}

export function monthSeries(months: number, fn: (monthStart: number, monthEnd: number) => number) {
  const labels: string[] = [], values: number[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    labels.push(start.toLocaleDateString("en-KE", { month: "short" }));
    values.push(fn(start.getTime(), end.getTime()));
  }
  return { labels, values };
}

export function downloadResource(resourceId: string) {
  commit((d) => { const r = d.resources.find((x) => x.id === resourceId); if (r && r.downloadEnabled) r.downloads += 1; });
}

export function searchAll(q: string) {
  const s = q.trim().toLowerCase();
  if (s.length < 2) return null;
  return {
    courses: db.courses.filter((c) => c.published && (c.title + " " + c.description).toLowerCase().includes(s)).slice(0, 5),
    subjects: db.subjects.filter((x) => x.active && x.name.toLowerCase().includes(s)).slice(0, 4),
    lessons: db.lessons.filter((l) => l.title.toLowerCase().includes(s)).slice(0, 5),
    resources: db.resources.filter((r) => r.active && (r.title + " " + r.description).toLowerCase().includes(s)).slice(0, 4),
    teachers: db.users.filter((u) => u.role === "teacher" && u.active && (u.name + " " + (u.bio ?? "")).toLowerCase().includes(s)).slice(0, 3),
  };
}
