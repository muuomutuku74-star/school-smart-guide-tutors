--- src/lib/types.ts (原始)
// ─── School Smart Guide Tutors — domain types ───────────────────────────────
export type Role = "student" | "teacher" | "parent" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  pass: string; // demo-only salted hash (see db.hash) — server would use bcrypt/argon2
  role: Role;
  color: string; // avatar hue
  active: boolean;
  createdAt: number;
  // student profile
  gradeId?: string;
  studentCode?: string;
  guardianName?: string;
  // teacher profile
  subjectIds?: string[];
  bio?: string;
  qualifications?: string;
  // parent profile
  linkedStudentIds?: string[];
  // preferences
  notifyEmail?: boolean;
  notifyPush?: boolean;
}

export interface Curriculum { id: string; name: string; code: string; description: string; active: boolean; }
export interface EducationLevel { id: string; curriculumId: string; name: string; order: number; }
export interface Grade { id: string; levelId: string; name: string; order: number; }

export interface Subject {
  id: string; name: string; short: string; color: string; icon: string;
  description: string; levelIds: string[]; active: boolean;
}

export interface Course {
  id: string; title: string; slug: string; subjectId: string; gradeId: string;
  curriculumId: string; teacherId: string; description: string; long?: string;
  image: string; rating: number; ratingCount: number; enrolledCount: number;
  price: number; // 0 = free
  featured: boolean; published: boolean; objectives: string[]; createdAt: number;
}

export interface CourseModule { id: string; courseId: string; title: string; order: number; }

export interface Lesson {
  id: string; moduleId: string; courseId: string; title: string;
  kind: "notes" | "video" | "reading";
  minutes: number; content: string; order: number; resourceIds: string[];
}

export type EnrollmentStatus = "pending" | "active" | "completed" | "cancelled";
export interface Enrollment {
  id: string; studentId: string; courseId: string; status: EnrollmentStatus;
  enrolledAt: number; completedAt?: number; paymentStatus: "none" | "pending" | "paid";
}

export interface LessonProgress { id: string; studentId: string; lessonId: string; courseId: string; completedAt: number; }

export type ResourceKind = "notes" | "past-paper" | "marking-scheme" | "worksheet" | "study-guide" | "video" | "practice";
export interface Resource {
  id: string; title: string; kind: ResourceKind; subjectId: string; gradeId: string;
  description: string; sizeKB: number; downloads: number; downloadEnabled: boolean;
  pages?: number; year?: number; active: boolean;
}

export type QuestionType = "mcq" | "tf" | "short";
export interface Question {
  id: string; type: QuestionType; prompt: string;
  options?: string[]; answer: string; // for mcq: option text; tf: "True"/"False"; short: accepted answers separated by |
  explanation?: string;
}

export interface Quiz {
  id: string; courseId: string; lessonId?: string; title: string; description: string;
  timeLimitMin: number; passingPercent: number; maxAttempts: number;
  showImmediate: boolean; questions: Question[]; active: boolean;
}

export interface QuizAttempt {
  id: string; quizId: string; studentId: string;
  answers: Record<string, string>; score: number; total: number; percent: number;
  passed: boolean; timeSpentSec: number; submittedAt: number;
}

export interface Assignment {
  id: string; courseId: string; title: string; instructions: string;
  dueAt: number; maxMarks: number; allowsUpload: boolean; active: boolean; createdAt: number;
}

export type SubmissionStatus = "submitted" | "graded" | "returned";
export interface Submission {
  id: string; assignmentId: string; studentId: string; text: string; fileName?: string;
  submittedAt: number; status: SubmissionStatus; marks?: number; feedback?: string; gradedAt?: number;
}

export interface Result {
  id: string; studentId: string; subjectId: string; courseId?: string;
  assessment: string; score: number; maxScore: number; comment: string;
  term: string; date: number; releasedBy: string;
}

export interface Payment {
  id: string; studentId: string; courseId: string; amount: number;
  method: "mpesa" | "card" | "bank"; status: "pending" | "completed" | "failed";
  reference: string; phone?: string; date: number;
}

export type Audience = "all-students" | "teachers" | "parents" | "course" | "grade" | "everyone";
export interface Announcement {
  id: string; title: string; content: string; audience: Audience;
  audienceRef?: string; authorId: string; publishedAt: number; expiresAt?: number; pinned?: boolean;
}

export interface Notification {
  id: string; userId: string; title: string; body: string;
  kind: "course" | "assignment" | "quiz" | "result" | "payment" | "announcement" | "system";
  read: boolean; createdAt: number; link?: string;
}

export interface Bookmark { id: string; userId: string; type: "lesson" | "resource" | "course"; refId: string; createdAt: number; }

export interface AchievementDef { id: string; name: string; description: string; icon: "first" | "ace" | "streak" | "half" | "grad" | "book"; }
export interface EarnedAchievement { id: string; studentId: string; defId: string; earnedAt: number; }

export interface AuditLog { id: string; userId: string; userName: string; action: string; entity: string; details: string; date: number; }

export interface ContactMessage { id: string; name: string; email: string; phone: string; subject: string; message: string; date: number; read: boolean; }

export interface Testimonial { id: string; name: string; role: string; quote: string; color: string; }
export interface Faq { id: string; q: string; a: string; }

export interface Settings {
  contactEmail: string; contactPhone: string; address: string;
  socials: { facebook: string; x: string; youtube: string; whatsapp: string };
  testimonials: Testimonial[]; faqs: Faq[]; featuredCourseIds: string[];
  registrationOpen: boolean;
}

export interface EmailLogEntry { id: string; to: string; template: string; subject: string; date: number; }

export interface DB {
  seededAt: number;
  users: User[];
  curricula: Curriculum[];
  levels: EducationLevel[];
  grades: Grade[];
  subjects: Subject[];
  courses: Course[];
  modules: CourseModule[];
  lessons: Lesson[];
  enrollments: Enrollment[];
  lessonProgress: LessonProgress[];
  resources: Resource[];
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  assignments: Assignment[];
  submissions: Submission[];
  results: Result[];
  payments: Payment[];
  announcements: Announcement[];
  notifications: Notification[];
  bookmarks: Bookmark[];
  achievementDefs: AchievementDef[];
  earned: EarnedAchievement[];
  audit: AuditLog[];
  contacts: ContactMessage[];
  emails: EmailLogEntry[];
  settings: Settings;
}

export interface Session { userId: string; token: string; issuedAt: number; }


+++ src/lib/types.ts (修改后)
// ─── School Smart Guide Tutors — domain types ───────────────────────────────
export type Role = "student" | "teacher" | "parent" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  pass: string; // demo-only salted hash (see db.hash) — server would use bcrypt/argon2
  role: Role;
  color: string; // avatar hue
  active: boolean;
  createdAt: number;
  // student profile
  gradeId?: string;
  studentCode?: string;
  guardianName?: string;
  // teacher profile
  subjectIds?: string[];
  bio?: string;
  qualifications?: string;
  // parent profile
  linkedStudentIds?: string[];
  // preferences
  notifyEmail?: boolean;
  notifyPush?: boolean;
}

export interface Curriculum { id: string; name: string; code: string; description: string; active: boolean; }
export interface EducationLevel { id: string; curriculumId: string; name: string; order: number; }
export interface Grade { id: string; levelId: string; name: string; order: number; }

export interface Subject {
  id: string; name: string; short: string; color: string; icon: string;
  description: string; levelIds: string[]; active: boolean;
}

export interface Course {
  id: string; title: string; slug: string; subjectId: string; gradeId: string;
  curriculumId: string; teacherId: string; description: string; long?: string;
  image: string; rating: number; ratingCount: number; enrolledCount: number;
  price: number; // 0 = free
  featured: boolean; published: boolean; objectives: string[]; createdAt: number;
}

export interface CourseModule { id: string; courseId: string; title: string; order: number; }

export interface Lesson {
  id: string; moduleId: string; courseId: string; title: string;
  kind: "notes" | "video" | "reading";
  minutes: number; content: string; order: number; resourceIds: string[];
}

export type EnrollmentStatus = "pending" | "active" | "completed" | "cancelled";
export interface Enrollment {
  id: string; studentId: string; courseId: string; status: EnrollmentStatus;
  enrolledAt: number; completedAt?: number; paymentStatus: "none" | "pending" | "paid";
}

export interface LessonProgress { id: string; studentId: string; lessonId: string; courseId: string; completedAt: number; }

export type ResourceKind = "notes" | "past-paper" | "marking-scheme" | "worksheet" | "study-guide" | "video" | "practice";
export interface Resource {
  id: string; title: string; kind: ResourceKind; subjectId: string; gradeId: string;
  description: string; sizeKB: number; downloads: number; downloadEnabled: boolean;
  pages?: number; year?: number; active: boolean;
}

export type QuestionType = "mcq" | "tf" | "short";
export interface Question {
  id: string; type: QuestionType; prompt: string;
  options?: string[]; answer: string; // for mcq: option text; tf: "True"/"False"; short: accepted answers separated by |
  explanation?: string;
}

export interface Quiz {
  id: string; courseId: string; lessonId?: string; title: string; description: string;
  timeLimitMin: number; passingPercent: number; maxAttempts: number;
  showImmediate: boolean; questions: Question[]; active: boolean;
}

export interface QuizAttempt {
  id: string; quizId: string; studentId: string;
  answers: Record<string, string>; score: number; total: number; percent: number;
  passed: boolean; timeSpentSec: number; submittedAt: number;
}

export interface Assignment {
  id: string; courseId: string; title: string; instructions: string;
  dueAt: number; maxMarks: number; allowsUpload: boolean; active: boolean; createdAt: number;
}

export type SubmissionStatus = "submitted" | "graded" | "returned";
export interface Submission {
  id: string; assignmentId: string; studentId: string; text: string; fileName?: string;
  submittedAt: number; status: SubmissionStatus; marks?: number; feedback?: string; gradedAt?: number;
}

export interface Result {
  id: string; studentId: string; subjectId: string; courseId?: string;
  assessment: string; score: number; maxScore: number; comment: string;
  term: string; date: number; releasedBy: string;
}

export interface Payment {
  id: string; studentId: string; courseId: string; amount: number;
  method: "mpesa" | "card" | "bank"; status: "pending" | "completed" | "failed";
  reference: string; phone?: string; date: number;
}

export type Audience = "all-students" | "teachers" | "parents" | "course" | "grade" | "everyone";
export interface Announcement {
  id: string; title: string; content: string; audience: Audience;
  audienceRef?: string; authorId: string; publishedAt: number; expiresAt?: number; pinned?: boolean;
}

export interface Notification {
  id: string; userId: string; title: string; body: string;
  kind: "course" | "assignment" | "quiz" | "result" | "payment" | "announcement" | "system";
  read: boolean; createdAt: number; link?: string;
}

export interface Bookmark { id: string; userId: string; type: "lesson" | "resource" | "course"; refId: string; createdAt: number; }

export interface AchievementDef { id: string; name: string; description: string; icon: "first" | "ace" | "streak" | "half" | "grad" | "book"; }
export interface EarnedAchievement { id: string; studentId: string; defId: string; earnedAt: number; }

export interface AuditLog { id: string; userId: string; userName: string; action: string; entity: string; details: string; date: number; }

export interface ContactMessage { id: string; name: string; email: string; phone: string; subject: string; message: string; date: number; read: boolean; }

export interface Testimonial { id: string; name: string; role: string; quote: string; color: string; }
export interface Faq { id: string; q: string; a: string; }

export interface Settings {
  academyName: string; logo: string;
  contactEmail: string; contactPhone: string; address: string;
  socials: { facebook: string; x: string; youtube: string; whatsapp: string };
  testimonials: Testimonial[]; faqs: Faq[]; featuredCourseIds: string[];
  registrationOpen: boolean;
}

export interface EmailLogEntry { id: string; to: string; template: string; subject: string; date: number; }

export interface DB {
  seededAt: number;
  users: User[];
  curricula: Curriculum[];
  levels: EducationLevel[];
  grades: Grade[];
  subjects: Subject[];
  courses: Course[];
  modules: CourseModule[];
  lessons: Lesson[];
  enrollments: Enrollment[];
  lessonProgress: LessonProgress[];
  resources: Resource[];
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  assignments: Assignment[];
  submissions: Submission[];
  results: Result[];
  payments: Payment[];
  announcements: Announcement[];
  notifications: Notification[];
  bookmarks: Bookmark[];
  achievementDefs: AchievementDef[];
  earned: EarnedAchievement[];
  audit: AuditLog[];
  contacts: ContactMessage[];
  emails: EmailLogEntry[];
  settings: Settings;
}

export interface Session { userId: string; token: string; issuedAt: number; }
