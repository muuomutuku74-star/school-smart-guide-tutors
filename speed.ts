--- src/lib/seed.ts (原始)
import type { DB, Lesson } from "./types";

/* ────────────────────────────────────────────────────────────────────────────
   Seed database — realistic Kenyan demo data.
   Loaded once into localStorage on first run (see db.ts). Never ships secrets.
   ──────────────────────────────────────────────────────────────────────────── */

const IMG = {
  math: "https://image.qwenlm.ai/generated-images/dc381962-eb3f-4424-8a88-26ed3a8fb05f/_result.png",
  sci: "https://image.qwenlm.ai/generated-images/d6df294d-c260-435a-a3df-9c1946b3dc6c/_result.png",
  eng: "https://image.qwenlm.ai/generated-images/d98541ad-6012-4936-8c9f-791d8d85199f/_result.png",
  kis: "https://image.qwenlm.ai/generated-images/1707b98d-70c6-4681-8914-4b9ec9aaab80/_result.png",
  bus: "https://image.qwenlm.ai/generated-images/2be7e448-891b-4975-9cc3-2acf95c564d1/_result.png",
  cs: "https://image.qwenlm.ai/generated-images/b2508b39-542c-4c07-ba6f-a912c019ab0e/_result.png",
  agr: "https://image.qwenlm.ai/generated-images/57d2cf79-447e-447e-891f-7a2a0a4a5f86/_result.png",
  cre: "https://image.qwenlm.ai/generated-images/b017729f-2cf0-4116-bb8a-1e6c386da090/_result.png",
  ss: "https://image.qwenlm.ai/generated-images/e7a5ff25-d86d-40e1-8624-4d60f988ee06/_result.png",
};
// fallback if a hosted cover is unreachable — the UI renders a palette gradient behind images.
void IMG;

const now = Date.now();
const D = 86400000;
const ago = (d: number) => now - d * D;
const ahead = (d: number) => now + d * D;

// demo password hash is applied in db.ts (hash("Demo@123" + pepper))
const PW = "demo";

const L = (id: string, moduleId: string, courseId: string, title: string, kind: Lesson["kind"], minutes: number, order: number, content: string, resourceIds: string[] = []): Lesson =>
  ({ id, moduleId, courseId, title, kind, minutes, order, content, resourceIds });

export function makeSeed(): DB {
  return {
    seededAt: now,

    users: [
      { id: "u-admin", name: "Susan Kamande", email: "admin@ssgt.ac.ke", phone: "+254 700 000 001", pass: PW, role: "admin", color: "#083528", active: true, createdAt: ago(400) },
      { id: "u-wanjiku", name: "Grace Wanjiku", email: "teacher@ssgt.ac.ke", phone: "+254 712 555 010", pass: PW, role: "teacher", color: "#0C5A43", active: true, createdAt: ago(380), subjectIds: ["sub-math"], bio: "Mathematics educator with 12 years in Kenyan classrooms, from CBC Grade 7 to KCSE.", qualifications: "B.Ed Mathematics (Kenyatta University), TSC 128456" },
      { id: "u-otieno", name: "Daniel Otieno", email: "d.otieno@ssgt.ac.ke", phone: "+254 733 555 011", pass: PW, role: "teacher", color: "#357E62", active: true, createdAt: ago(350), subjectIds: ["sub-sci", "sub-agr", "sub-ss"], bio: "Sciences tutor who believes every learner can master the lab.", qualifications: "B.Sc & PGDE (Maseno University), TSC 204117" },
      { id: "u-achieng", name: "Mercy Achieng'", email: "m.achieng@ssgt.ac.ke", phone: "+254 720 555 012", pass: PW, role: "teacher", color: "#D9860A", active: true, createdAt: ago(330), subjectIds: ["sub-eng", "sub-kis", "sub-cre"], bio: "Languages & creative arts specialist — insha coach and KCSE examiner.", qualifications: "BA Education, Literature (Moi University), TSC 315002" },
      { id: "u-mutua", name: "Peter Mutua", email: "p.mutua@ssgt.ac.ke", phone: "+254 798 555 013", pass: PW, role: "teacher", color: "#8F4D0D", active: true, createdAt: ago(300), subjectIds: ["sub-cs", "sub-bus"], bio: "Business & computer studies mentor; builds young problem-solvers.", qualifications: "B.Com (KCA University), TSC 402288" },
      { id: "u-amina", name: "Amina Yusuf", email: "student@ssgt.ac.ke", phone: "+254 745 555 020", pass: PW, role: "student", color: "#C4562E", active: true, createdAt: ago(120), gradeId: "gr8", studentCode: "SSGT-1001", guardianName: "Hassan Yusuf" },
      { id: "u-brian", name: "Brian Kiptoo", email: "brian@ssgt.ac.ke", phone: "+254 745 555 021", pass: PW, role: "student", color: "#1F6A50", active: true, createdAt: ago(95), gradeId: "grf1", studentCode: "SSGT-1002", guardianName: "Ruth Kiptoo" },
      { id: "u-wairimu", name: "Wairimu Njoroge", email: "wairimu@ssgt.ac.ke", phone: "+254 745 555 022", pass: PW, role: "student", color: "#B56508", active: true, createdAt: ago(88), gradeId: "gr7", studentCode: "SSGT-1003", guardianName: "Rose Njoroge" },
      { id: "u-juma", name: "Juma Abdalla", email: "juma@ssgt.ac.ke", phone: "+254 745 555 023", pass: PW, role: "student", color: "#0A4536", active: true, createdAt: ago(70), gradeId: "gr8", studentCode: "SSGT-1004", guardianName: "Salim Abdalla" },
      { id: "u-zawadi", name: "Zawadi Mumbua", email: "zawadi@ssgt.ac.ke", phone: "+254 745 555 024", pass: PW, role: "student", color: "#6F3C0E", active: true, createdAt: ago(52), gradeId: "grf2", studentCode: "SSGT-1005", guardianName: "Naomi Mumbua" },
      { id: "u-kiptoo", name: "Kiptoo Rono", email: "kiptoo@ssgt.ac.ke", phone: "+254 745 555 025", pass: PW, role: "student", color: "#5C9C80", active: true, createdAt: ago(40), gradeId: "gr8", studentCode: "SSGT-1006", guardianName: "David Rono" },
      { id: "u-hassan", name: "Hassan Yusuf", email: "parent@ssgt.ac.ke", phone: "+254 701 555 030", pass: PW, role: "parent", color: "#A84625", active: true, createdAt: ago(110), linkedStudentIds: ["u-amina"] },
      { id: "u-rose", name: "Rose Njoroge", email: "rose@ssgt.ac.ke", phone: "+254 701 555 031", pass: PW, role: "parent", color: "#083528", active: true, createdAt: ago(85), linkedStudentIds: ["u-wairimu"] },
    ],

    curricula: [
      { id: "curr-cbc", name: "CBC (Competency-Based Curriculum)", code: "CBC", description: "Kenya's 2-6-3-3-3 competency-based curriculum.", active: true },
      { id: "curr-844", name: "8-4-4 Curriculum", code: "8-4-4", description: "Legacy curriculum — revision materials and KCSE preparation.", active: true },
    ],

    levels: [
      { id: "lvl-eyp", curriculumId: "curr-cbc", name: "Early Years (PP1–PP2)", order: 1 },
      { id: "lvl-pri", curriculumId: "curr-cbc", name: "Primary (Grade 1–6)", order: 2 },
      { id: "lvl-jss", curriculumId: "curr-cbc", name: "Junior Secondary (Grade 7–9)", order: 3 },
      { id: "lvl-sss", curriculumId: "curr-cbc", name: "Senior Secondary (Grade 10–12)", order: 4 },
      { id: "lvl-844p", curriculumId: "curr-844", name: "Primary (Standard 1–8)", order: 1 },
      { id: "lvl-844s", curriculumId: "curr-844", name: "Secondary (Form 1–4)", order: 2 },
    ],

    grades: [
      { id: "gr5", levelId: "lvl-pri", name: "Grade 5", order: 5 },
      { id: "gr6", levelId: "lvl-pri", name: "Grade 6", order: 6 },
      { id: "gr7", levelId: "lvl-jss", name: "Grade 7", order: 1 },
      { id: "gr8", levelId: "lvl-jss", name: "Grade 8", order: 2 },
      { id: "gr9", levelId: "lvl-jss", name: "Grade 9", order: 3 },
      { id: "gr10", levelId: "lvl-sss", name: "Grade 10", order: 1 },
      { id: "grf14", levelId: "lvl-844s", name: "Form 1–4", order: 0 },
      { id: "grf1", levelId: "lvl-844s", name: "Form 1", order: 1 },
      { id: "grf2", levelId: "lvl-844s", name: "Form 2", order: 2 },
      { id: "grf3", levelId: "lvl-844s", name: "Form 3", order: 3 },
      { id: "grf4", levelId: "lvl-844s", name: "Form 4", order: 4 },
    ],

    subjects: [
      { id: "sub-math", name: "Mathematics", short: "Math", color: "#0C5A43", icon: "target", description: "Numbers, algebra, geometry and problem solving across all levels.", levelIds: ["lvl-pri", "lvl-jss", "lvl-sss"], active: true },
      { id: "sub-eng", name: "English", short: "ENG", color: "#B56508", icon: "book", description: "Comprehension, composition, grammar, listening and speaking.", levelIds: ["lvl-pri", "lvl-jss", "lvl-sss", "lvl-844s"], active: true },
      { id: "sub-kis", name: "Kiswahili", short: "KIS", color: "#A84625", icon: "drum", description: "Sarufi, insha, fasihi na isimu jamii kwa lugha ya Kiswahili.", levelIds: ["lvl-pri", "lvl-jss", "lvl-sss", "lvl-844s"], active: true },
      { id: "sub-sci", name: "Integrated Science", short: "SCI", color: "#1F6A50", icon: "spark", description: "Biology, chemistry and physics strands integrated for JSS learners.", levelIds: ["lvl-jss"], active: true },
      { id: "sub-prisci", name: "Science & Technology", short: "S&T", color: "#357E62", icon: "spark", description: "Primary science: living things, energy, matter and the environment.", levelIds: ["lvl-pri"], active: true },
      { id: "sub-ss", name: "Social Studies", short: "SST", color: "#8F4D0D", icon: "globe", description: "History, civics, geography and citizenship for young Kenyans.", levelIds: ["lvl-pri", "lvl-jss"], active: true },
      { id: "sub-bus", name: "Business Studies", short: "BUS", color: "#6F3C0E", icon: "money", description: "Trade, entrepreneurship, accounting and the Kenyan economy.", levelIds: ["lvl-jss", "lvl-844s"], active: true },
      { id: "sub-agr", name: "Agriculture & Nutrition", short: "AGR", color: "#5C9C80", icon: "leaf", description: "Crop production, soil science, livestock and food security.", levelIds: ["lvl-jss"], active: true },
      { id: "sub-cs", name: "Computer Science", short: "CS", color: "#083528", icon: "code", description: "Digital literacy, computational thinking and programming.", levelIds: ["lvl-jss", "lvl-sss"], active: true },
      { id: "sub-cre", name: "Creative & Performing Arts", short: "CPA", color: "#D9860A", icon: "sun", description: "Music, art, craft and performance across the curriculum.", levelIds: ["lvl-pri", "lvl-jss"], active: true },
      { id: "sub-phe", name: "Physical & Health Education", short: "PHE", color: "#C4562E", icon: "flame", description: "Fitness, games, hygiene and healthy living.", levelIds: ["lvl-jss"], active: true },
      { id: "sub-re", name: "Religious Education", short: "RE", color: "#0A4536", icon: "shield", description: "Values, ethics and spiritual development.", levelIds: ["lvl-pri", "lvl-jss"], active: true },
    ],

    courses: [
      { id: "c-math8", title: "Grade 8 Mathematics: Algebra & Linear Equations", slug: "grade-8-mathematics-algebra", subjectId: "sub-math", gradeId: "gr8", curriculumId: "curr-cbc", teacherId: "u-wanjiku", description: "Master algebraic expressions and linear equations step by step — with worked examples, videos and KCSE-style practice.", long: "This course takes Grade 8 learners from the very idea of a variable to confidently solving equations with brackets and word problems. Every lesson ends with practice questions, and the final mastery quiz mirrors the structure of end-of-term assessments.", image: IMG.math, rating: 4.8, ratingCount: 214, enrolledCount: 342, price: 0, featured: true, published: true, objectives: ["Identify variables, constants and coefficients in expressions", "Simplify algebraic expressions by collecting like terms", "Solve one-step and two-step linear equations", "Solve equations involving brackets and fractions", "Translate word problems into equations and solve them"], createdAt: ago(150) },
      { id: "c-sci7", title: "Grade 7 Integrated Science: Mixtures & Separation", slug: "grade-7-science-mixtures", subjectId: "sub-sci", gradeId: "gr7", curriculumId: "curr-cbc", teacherId: "u-otieno", description: "Explore everyday mixtures — from tea to seawater — and learn the lab techniques used to separate them.", image: IMG.sci, rating: 4.7, ratingCount: 162, enrolledCount: 289, price: 0, featured: true, published: true, objectives: ["Distinguish mixtures, elements and compounds", "Describe filtration, evaporation, distillation and chromatography", "Choose the right separation method for a given mixture", "Carry out a safe separation experiment at home or school"], createdAt: ago(140) },
      { id: "c-cs9", title: "Computer Science Grade 9: Programming Foundations", slug: "grade-9-computer-science-programming", subjectId: "sub-cs", gradeId: "gr9", curriculumId: "curr-cbc", teacherId: "u-mutua", description: "Think computationally: algorithms, flowcharts and your first real Python programs — no experience needed.", image: IMG.cs, rating: 4.9, ratingCount: 98, enrolledCount: 176, price: 0, featured: true, published: true, objectives: ["Define algorithms and trace them by hand", "Draw and read flowcharts", "Write and run basic Python: variables, input, conditions", "Debug simple programs like a professional"], createdAt: ago(60) },
      { id: "c-eng", title: "KCSE English Paper 1: Comprehension, Summary & Grammar", slug: "kcse-english-paper-1", subjectId: "sub-eng", gradeId: "grf14", curriculumId: "curr-844", teacherId: "u-achieng", description: "Exam-focused drills for functional skills: comprehension questions, summary writing in sentence form, and the grammar items examiners love.", image: IMG.eng, rating: 4.6, ratingCount: 301, enrolledCount: 458, price: 500, featured: true, published: true, objectives: ["Answer comprehension questions in full, precise sentences", "Write summaries within word limits without losing marks", "Master reported speech, conditionals and punctuation", "Practice with marked KCSE-style past questions"], createdAt: ago(200) },
      { id: "c-kis8", title: "Kiswahili Grade 8: Insha, Sarufi na Fasihi", slug: "kiswahili-grade-8-insha", subjectId: "sub-kis", gradeId: "gr8", curriculumId: "curr-cbc", teacherId: "u-achieng", description: "Jenga ujuzi wako wa insha fungamano, kanga misamiati, na uelewe sarufi kwa vitendo — si kwa nadharia tu.", image: IMG.kis, rating: 4.7, ratingCount: 141, enrolledCount: 265, price: 0, featured: false, published: true, objectives: ["Andika insha fungamano yenye muundo sahihi", "Tambua na tumia kauli za vitenzi na nyakati", "Chambua methali na vitendawili"], createdAt: ago(130) },
      { id: "c-bus1", title: "Business Studies Form 1: Introduction to Business", slug: "business-studies-form-1-introduction", subjectId: "sub-bus", gradeId: "grf1", curriculumId: "curr-844", teacherId: "u-mutua", description: "From the duka to the boardroom: what business is, forms of business units, and how money moves in Kenya.", image: IMG.bus, rating: 4.5, ratingCount: 87, enrolledCount: 134, price: 350, featured: false, published: true, objectives: ["Define business and its role in the economy", "Compare sole proprietorship, partnership and companies", "Understand basic bookkeeping terms"], createdAt: ago(110) },
      { id: "c-agr7", title: "Agriculture Grade 7: Soil & Crop Production Basics", slug: "agriculture-grade-7-soil-crops", subjectId: "sub-agr", gradeId: "gr7", curriculumId: "curr-cbc", teacherId: "u-otieno", description: "Hands-on soil science: texture tests, land preparation and raising a healthy seedbed — linked to the school garden.", image: IMG.agr, rating: 4.6, ratingCount: 74, enrolledCount: 121, price: 0, featured: false, published: true, objectives: ["Identify soil types by feel and behaviour", "Explain land preparation practices", "Establish and maintain a simple nursery bed"], createdAt: ago(100) },
      { id: "c-math9", title: "Grade 9 Mathematics: Quadratic Expressions", slug: "grade-9-mathematics-quadratics", subjectId: "sub-math", gradeId: "gr9", curriculumId: "curr-cbc", teacherId: "u-wanjiku", description: "The bridge to senior-school maths: expanding, factorising and solving quadratics with confidence.", image: IMG.math, rating: 4.8, ratingCount: 63, enrolledCount: 118, price: 450, featured: false, published: true, objectives: ["Expand and simplify quadratic expressions", "Factorise quadratics by grouping and inspection", "Solve quadratic equations by factorisation"], createdAt: ago(75) },
      { id: "c-cre5", title: "Creative Arts Grade 5: Music, Art & Craft Foundations", slug: "creative-arts-grade-5", subjectId: "sub-cre", gradeId: "gr5", curriculumId: "curr-cbc", teacherId: "u-achieng", description: "Sing, draw, weave and perform — competency-based creative arts made joyful for upper primary.", image: IMG.cre, rating: 4.9, ratingCount: 58, enrolledCount: 96, price: 0, featured: false, published: true, objectives: ["Perform simple folk songs with rhythm", "Create art from found and recycled materials", "Present a short class performance"], createdAt: ago(90) },
      { id: "c-ss8", title: "Social Studies Grade 8: History & Government of Kenya", slug: "social-studies-grade-8-kenya-history", subjectId: "sub-ss", gradeId: "gr8", curriculumId: "curr-cbc", teacherId: "u-otieno", description: "From early settlements to devolution: Kenya's story told with maps, timelines and discussion prompts.", image: IMG.ss, rating: 4.5, ratingCount: 92, enrolledCount: 143, price: 0, featured: false, published: true, objectives: ["Trace early Kenyan communities and migration", "Explain colonial rule and the road to independence", "Describe Kenya's three arms of government"], createdAt: ago(85) },
    ],

    modules: [
      { id: "m-a1", courseId: "c-math8", title: "Foundations of Algebra", order: 1 },
      { id: "m-a2", courseId: "c-math8", title: "Linear Equations", order: 2 },
      { id: "m-a3", courseId: "c-math8", title: "Applications & Mastery", order: 3 },
      { id: "m-s1", courseId: "c-sci7", title: "The Nature of Mixtures", order: 1 },
      { id: "m-s2", courseId: "c-sci7", title: "Separation Techniques", order: 2 },
      { id: "m-e1", courseId: "c-eng", title: "Comprehension Skills", order: 1 },
      { id: "m-e2", courseId: "c-eng", title: "Summary Writing & Grammar", order: 2 },
      { id: "m-k1", courseId: "c-kis8", title: "Insha Fungamano", order: 1 },
      { id: "m-k2", courseId: "c-kis8", title: "Sarufi kwa Vitendo", order: 2 },
      { id: "m-b1", courseId: "c-bus1", title: "What is Business?", order: 1 },
      { id: "m-b2", courseId: "c-bus1", title: "Forms of Business Units", order: 2 },
      { id: "m-c1", courseId: "c-cs9", title: "Thinking Computationally", order: 1 },
      { id: "m-c2", courseId: "c-cs9", title: "Your First Python Programs", order: 2 },
      { id: "m-g1", courseId: "c-agr7", title: "Understanding Soil", order: 1 },
      { id: "m-g2", courseId: "c-agr7", title: "Raising Crops", order: 2 },
      { id: "m-q1", courseId: "c-math9", title: "Working with Quadratics", order: 1 },
      { id: "m-q2", courseId: "c-math9", title: "Solving Quadratic Equations", order: 2 },
      { id: "m-r1", courseId: "c-cre5", title: "Music & Movement", order: 1 },
      { id: "m-r2", courseId: "c-cre5", title: "Art from Around Us", order: 2 },
      { id: "m-h1", courseId: "c-ss8", title: "Early Kenya", order: 1 },
      { id: "m-h2", courseId: "c-ss8", title: "Independent Kenya", order: 2 },
    ],

    lessons: [
      // ── Grade 8 Mathematics (flagship, full content) ──
      L("l-a1", "m-a1", "c-math8", "What is Algebra?", "notes", 8, 1,
`## From arithmetic to algebra

In arithmetic we work with **known numbers**: 3 + 5 = 8. In algebra we introduce **letters** that stand for numbers we do not yet know — or that can change. We call these letters **variables**.

- A **variable** is a letter (like x, y or n) representing an unknown or changing value.
- A **constant** is a fixed number, like 7 or −3.
- A **coefficient** is the number written in front of a variable, like the 4 in 4x.

## Why letters?

Imagine you buy maize flour at KSh x per kilo. Three kilos cost 3 × x, written **3x**. If x = 90, then 3x = 270. The same expression works for any price — that is the power of algebra.

> **Key idea:** an algebraic expression is a mathematical phrase made of variables, constants and operations — it has no equals sign. An *equation* has an equals sign.

## Check yourself

Without solving anything, identify the variable, coefficient and constant in each expression:

- 5x + 2
- 3n − 7
- 9 + 2y`),
      L("l-a2", "m-a1", "c-math8", "Algebraic Expressions & Like Terms", "notes", 10, 2,
`## Terms

A **term** is a part of an expression separated by + or − signs. The expression 4x + 3y − 7 has three terms: 4x, 3y and −7.

## Like terms

Terms are **like** when they have exactly the same variable part:

- 3x and 7x are like terms (both are "x" terms).
- 5y² and −2y² are like terms.
- 4x and 4y are **unlike** — different variables.
- 2x and 2x² are **unlike** — different powers.

## Collecting like terms

To simplify, add or subtract the coefficients of like terms and keep the variable part:

- 3x + 5x = 8x
- 7y − 2y + y = 6y
- 4a + 3b + 2a = 6a + 3b (a-terms combine; 3b stays)

> **Common trap:** 3x + 5 ≠ 8x. You cannot add a number to a variable term — apples and oranges!

## Practice

Simplify each:

- 6m + 4m − 2m
- 5p + 3q − 2p + q
- 8k − 3 + 2k + 9`),
      L("l-a3", "m-a1", "c-math8", "Video: Simplifying Expressions Worked Examples", "video", 12, 3,
`## In this lesson

Watch Ms. Wanjiku simplify expressions step by step, narrating every decision:

- Grouping like terms with underlines
- Handling negative coefficients carefully
- Writing the final answer in standard form (variable term first)

## Pause-and-try moments

The video pauses at three points. Attempt each simplification yourself before watching the solution:

- 9c − 4c + 2c
- 6x + 5 − 2x + 3
- 10m − 3n − 4m + 8n

> **Remember:** simplifying never changes the value of an expression — it only makes it tidier. If x = 2, then 6x + 5 − 2x + 3 and 4x + 8 both give 16.`),
      L("l-a4", "m-a2", "c-math8", "Introduction to Equations", "notes", 9, 1,
`## The balance model

An **equation** says two expressions are equal. Picture a balance scale: whatever you do to one side, you **must** do to the other to keep it level.

x + 3 = 10 means: some number, plus 3, gives 10.

## Solving by inverse operations

To find x, undo the operations around it:

- x + 3 = 10 → subtract 3 from both sides → x = 7
- x − 4 = 9 → add 4 to both sides → x = 13
- 3x = 18 → divide both sides by 3 → x = 6
- x/5 = 4 → multiply both sides by 5 → x = 20

## Checking your answer

Substitute your value back into the original equation:

- If x = 7, then x + 3 = 7 + 3 = 10 ✓

> **Golden rule:** always state the operation you are doing *to both sides*. It is the habit that saves marks in exams.

## Practice

Solve and check:

- x + 6 = 14
- x − 8 = 3
- 4x = 36
- x/7 = 5`),
      L("l-a5", "m-a2", "c-math8", "Video: Solving One-Step Equations", "video", 11, 2,
`## Lesson overview

A guided walkthrough of 8 one-step equations, from easy to exam-level, including negative answers and fractional coefficients.

## Worked example on screen

Solve: x/3 = −4

- Multiply both sides by 3
- x = −12
- Check: −12 ÷ 3 = −4 ✓

## Your turn

Pause the video and solve:

- x + 9 = 2
- −5x = 35
- x/4 = 2.5

> Watch how Ms. Wanjiku lines up her equals signs — neat working is half the marks in a marked script.`),
      L("l-a6", "m-a2", "c-math8", "Solving Two-Step Equations", "notes", 12, 3,
`## Undo in reverse order

A two-step equation wraps x in two operations, e.g. 2x + 5 = 13. Undo the operation **furthest from x first**:

- 2x + 5 = 13
- Subtract 5 from both sides: 2x = 8
- Divide both sides by 2: x = 4

## More examples

Solve 3x − 7 = 11:

- Add 7 to both sides: 3x = 18
- Divide by 3: x = 6

Solve x/2 + 4 = 9:

- Subtract 4: x/2 = 5
- Multiply by 2: x = 10

## When x appears with negatives

Solve 20 − 3x = 5:

- Subtract 20: −3x = −15
- Divide by −3: x = 5 (a negative ÷ a negative is positive!)

> **Exam tip:** two-step equations are worth 2–3 marks. One clear step per line, operation labelled, answer checked — full marks every time.

## Practice

- 4x + 1 = 29
- 6x − 2 = 16
- x/3 − 5 = 1
- 15 − 2x = 7`),
      L("l-a7", "m-a2", "c-math8", "Equations with Brackets & Variables on Both Sides", "notes", 14, 4,
`## Expanding brackets first

Solve 3(x + 2) = 21:

- Expand: 3x + 6 = 21
- Subtract 6: 3x = 15
- Divide by 3: x = 5

You could also divide both sides by 3 first: x + 2 = 7, so x = 5. Both roads work — choose the shorter one.

## Variables on both sides

Collect variable terms on one side and numbers on the other.

Solve 5x − 3 = 2x + 12:

- Subtract 2x from both sides: 3x − 3 = 12
- Add 3: 3x = 15
- Divide by 3: x = 5

Solve 7x + 4 = 4x − 11:

- Subtract 4x: 3x + 4 = −11
- Subtract 4: 3x = −15
- x = −5

> **Strategy:** move the *smaller* x-term to the side with the larger one — you usually avoid negative coefficients.

## Practice

- 2(x + 4) = 18
- 5(x − 1) = 3x + 9
- 8x − 5 = 3x + 20
- 6x + 2 = 2x − 14`),
      L("l-a8", "m-a3", "c-math8", "Video: Word Problems → Equations", "video", 13, 1,
`## Translating English into algebra

Word problems reward a calm method:

- Read the whole problem once.
- Let a letter stand for the unknown (say it out loud: "Let n = the number of notebooks").
- Translate each phrase into an expression.
- Build the equation, solve, then **answer the question asked** — with units.

## Problem 1 (on screen)

Amina buys 3 notebooks and a KSh 50 pen. She pays KSh 200 and gets no balance. How much is one notebook?

- Let n = cost of one notebook.
- 3n + 50 = 200 → 3n = 150 → n = 50.
- Answer: each notebook costs KSh 50.

## Problem 2 (pause and try)

The sum of three consecutive numbers is 57. Find them.

- Let the first be n, so n + (n+1) + (n+2) = 57 → 3n + 3 = 57 → n = 18.
- The numbers are 18, 19 and 20.

> In CBC assessments, the *process* — defining the variable and forming the equation — carries marks even if your arithmetic slips.`),
      L("l-a9", "m-a3", "c-math8", "Revision & Past-Paper Practice", "notes", 15, 2,
`## Course recap

- An **expression** has no equals sign; an **equation** does.
- Simplify by **collecting like terms**.
- Solve by **inverse operations**, done to both sides.
- **Brackets**: expand first (or divide through).
- **Both sides**: gather x-terms on one side.
- **Word problems**: define → translate → solve → answer in words.

## Timed drill (15 minutes)

- Simplify: 7a + 3b − 2a + 5b
- Solve: 5x − 4 = 21
- Solve: 3(x + 6) = 33
- Solve: 9x − 2 = 4x + 18
- A matatu fare is KSh 30 plus KSh 10 per km. If Wairimu paid KSh 110, how far did she travel?

Then attempt the **Linear Equations Mastery Quiz** — 8 questions, 10 minutes, pass mark 70%.

> You may attempt the quiz up to 3 times. Your best result is the one your teacher sees.`, ["r-mathrev"]),

      // ── Grade 7 Integrated Science ──
      L("l-s1", "m-s1", "c-sci7", "What is a Mixture?", "notes", 8, 1,
`## Mixtures are everywhere

A **mixture** is two or more substances combined physically — each keeps its own properties. Your morning tea (water, tea, sugar, milk), air, soil and seawater are all mixtures.

- **Elements** are pure substances made of one type of atom (oxygen, iron).
- **Compounds** are chemically joined elements (water, salt).
- **Mixtures** can be separated by physical means — no chemistry needed.

## Why it matters

Separating mixtures is how we get clean water, salt from the sea, and flour from maize. It is one of the most practical skills in science.

> **Think:** is a fruit salad a mixture? What about bronze? (Yes and yes — bronze mixes copper and tin.)`),
      L("l-s2", "m-s1", "c-sci7", "Video: Elements, Compounds, Mixtures", "video", 10, 2,
`## Watch for

Mr. Otieno sorts everyday items into elements, compounds and mixtures using simple particle drawings.

- Particle diagrams: how scientists *see* the difference
- Why mixtures keep the properties of their parts
- A quick "sort the shelf" challenge — pause and try it yourself

> Draw the particle diagram for salt water before watching the reveal.`),
      L("l-s3", "m-s2", "c-sci7", "Separation Techniques I: Filtration & Evaporation", "notes", 12, 1,
`## Filtration

Separates an **insoluble solid** from a liquid. Sand in water? Filter paper traps the sand (residue); clean water passes through (filtrate).

## Evaporation

Recovers a **dissolved solid** from a solution. Heat salt water: water evaporates, salt crystals remain.

## Choosing the right method

- Sand + water → filtration
- Salt + water → evaporation
- Sand + salt + water → filter the sand first, then evaporate the salt water

> **Home lab:** mix soil and water in a clear bottle. Filter through a clean cloth. Compare the filtrate with the original mixture and note your observations — this is your lab report data.`, ["r-sciws"]),
      L("l-s4", "m-s2", "c-sci7", "Separation Techniques II: Distillation & Chromatography", "video", 14, 2,
`## In this lesson

- **Simple distillation**: recovering the *liquid* from a solution — condensation is the star.
- **Fractional distillation**: separating liquids with different boiling points (how crude oil is refined).
- **Paper chromatography**: separating coloured dyes — ink racing up paper.

## Pause-and-try

Predict which dye travels furthest on chromatography paper and why, then watch the race.

> Distillation is how many Kenyan schools produce distilled water for the lab — ask your teacher to show you the apparatus.`),

      // ── KCSE English Paper 1 ──
      L("l-e1", "m-e1", "c-eng", "Comprehension: Reading the Questions First", "notes", 10, 1,
`## The 3-pass method

- **Pass 1:** read the *questions* first. Underline command words (explain, give two reasons, what does the writer suggest).
- **Pass 2:** read the passage actively, marking where each answer lives.
- **Pass 3:** answer in your own words unless told to quote.

## Lift-or-rephrase?

If the question says "in your own words", lifting earns zero. Rephrase while keeping the exact meaning.

> Examiners reward **precision**: answer exactly what is asked — no more, no less.`),
      L("l-e2", "m-e1", "c-eng", "Grammar Clinic: Reported Speech & Conditionals", "notes", 12, 2,
`## Reported speech in one shift

Move tenses one step back: present → past, will → would, can → could. Change pronouns and time words (today → that day).

- "I am tired," she said. → She said (that) she **was** tired.

## Conditionals examiners love

- Type 1: If it **rains**, we **will stay** home. (real future)
- Type 2: If I **had** money, I **would buy** books. (unreal present)

> **Drill:** rewrite 5 direct-speech sentences from your class notes into reported speech — then swap with a friend to mark.`),
      L("l-e3", "m-e2", "c-eng", "Summary Writing: The Sentence Method", "notes", 11, 1,
`## The formula

A summary is: **numbered points + own words + within word limit**.

- Read the summary question — it limits the *region* of the passage.
- List the points in the margin (one idea per point).
- Write each as one clean sentence, joined by commas/semicolons — no full stops needed between points.

## Classic deductions

Repetitions, examples, illustrations and explanations of the same idea count as **one point**.

> Count words last. Being 2–3 words over costs you — practise trimming adjectives first.`),
      L("l-e4", "m-e2", "c-eng", "Marked KCSE-Style Practice", "video", 15, 2,
`## What happens in this lesson

Ms. Achieng' marks a real candidate's summary live — you will see exactly where marks are won and lost.

- The rubric decoded: content vs. language marks
- A candidate response annotated in real time
- Your turn: attempt the 2023-style comprehension, then compare with the model answer

> Time yourself strictly: 40 minutes for the full Paper 1 practice set.`, ["r-engpp"]),

      // ── Kiswahili Grade 8 ──
      L("l-k1", "m-k1", "c-kis8", "Muundo wa Insha Fungamano", "notes", 10, 1,
`## Muundo sahihi

Insha fungamano ina sehemu tatu: **utangulizi**, **kiini** na **hitimisho**.

- Utangulizi: anza kwa dondoo, swali au msimamo — shika msomaji.
- Kiini: aya 2–3; kila aya iwe na wazo kuu moja na mifano.
- Hitimisho: fumua kwa kilele cha hoja zako — usianzishe wazo jipya.

> **Zoezi:** andika utangulizi wa insha "Mitandao ya kijamii: baraka au bala?" kwa maneno 40 pekee.`),
      L("l-k2", "m-k1", "c-kis8", "Video: Kuandika kwa Picha na Hisia", "video", 9, 2,
`## Somo

Jinsi ya kutumia **picha za maneno** (simile na метаfora... metaphor!) ili kuifanya insha yako iishi.

- Onyesha, usiseme tu: badala ya "alikuwa na hofu", sema "moyo wake ulidunda kama ngoma ya mwakenya".
- Tumia vya maana za nyumbani — msomaji wa Kenya anajua harufu ya mvua ya kwanza.

> Andika aya moja ya picha kuhusu soko la mjini kwenu kisha isome kwa sauti.`),
      L("l-k3", "m-k2", "c-kis8", "Nyakati na Kauli za Vitenzi", "notes", 12, 3,
`## Kauli kuu

- **Amri:** Soma kitabu chako.
- **Tendwa:** Amina **ana**soma (inaendelea); Juma **ali**soma (zamani); Wairimu **ta**soma (wakati ujao).
- **Tendewa:** Kitabu **kina**somwa na Amina.
- **Tenzi:** Amina **ame**soma kitabu (kamilifu).

## Makosa ya kawaida

Kuchanganya nyakati ndani ya aya moja hupoteza alama. Chagua nyakati moja ya hadithi (kawaida zamani) na uishikilie.

> **Zoezi:** badilisha sentensi 5 kutoka kauli tendwa hadi tendewa.`),
      L("l-k4", "m-k2", "c-kis8", "Methali na Vitendawili", "notes", 8, 4,
`## Methali

- "Haraka haraka haina baraka." — mvuto: uvumilivu.
- "Penye nia pana njia." — azimio huleta mafanikio.

Tumia methali **moja au mbili** tu ndani ya insha — zaidi ya hapo ni mapambo.

## Vitendawili

Kitendawili: "Nyumba yangu bila mlango?" Jibu: yai. Fanya mashindano ya vitendawili darasani!`, ["r-kisguide"]),

      // ── Business Studies Form 1 ──
      L("l-b1", "m-b1", "c-bus1", "What is Business?", "notes", 9, 1,
`## Business defined

**Business** is any activity carried out to produce or distribute goods and services **for profit**. The duka, the boda stage, the bank and M-Pesa agents are all businesses.

- **Goods** are tangible (sugar, shoes). **Services** are intangible (haircuts, transport).
- Profit = revenue − expenses. No profit motive → it is charity or public service, not business.

> **Discuss:** is a school a business? Argue both sides using the profit test.`),
      L("l-b2", "m-b1", "c-bus1", "Video: Business Around You", "video", 10, 2,
`## Lesson flow

Mr. Mutua walks through a market street and classifies every business you see:

- Producers vs. wholesalers vs. retailers
- Why some businesses sell services only
- The customer is the reason any of it exists

> **Field task:** list 10 businesses near your home and classify each as goods, services, or both.`),
      L("l-b3", "m-b2", "c-bus1", "Sole Proprietorship, Partnership & Companies", "notes", 12, 3,
`## Compare the big three

- **Sole proprietorship:** one owner, easy to start, unlimited liability. Most dukas.
- **Partnership:** 2–20 owners sharing profits; deeds matter.
- **Limited company:** a separate legal person; owners' risk limited to their shares. Needs registration at the Registrar of Companies.

## Which to choose?

Ask: how much capital is needed? Who carries the risk? How are decisions made?

> **Case:** three friends want to start a school-supplies shop with KSh 90,000. Recommend a form of business and give three reasons.`),

      // ── Computer Science Grade 9 ──
      L("l-c1", "m-c1", "c-cs9", "Algorithms: Recipes for Computers", "notes", 10, 1,
`## An algorithm is a recipe

A **finite, ordered set of steps** that solves a problem. Making tea is an algorithm; so is long division.

Good algorithms are: **clear** (no ambiguity), **finite** (they end), and **effective** (each step is doable).

## Trace it by hand

Trace this algorithm with a = 4, b = 7:

- sum ← a + b
- if sum > 10, print "Big", else print "Small"

Result: sum = 11 → "Big". Tracing on paper is how programmers think.

> **Try:** write an algorithm a stranger could follow to buy airtime on a phone. Watch where your instructions are ambiguous!`),
      L("l-c2", "m-c1", "c-cs9", "Video: Flowcharts That Talk", "video", 11, 2,
`## Symbols

- Oval: start / end
- Parallelogram: input / output
- Rectangle: process
- Diamond: decision (yes/no)

## Live build

Mr. Mutua flowcharts "should I carry an umbrella?" then upgrades it to "pass or resit" logic.

> **Pause-and-draw:** flowchart the steps of withdrawing money from an M-Pesa agent. Decisions included!`, ["r-csprac"]),
      L("l-c3", "m-c2", "c-cs9", "Hello, Python: Variables & Input", "video", 14, 3,
`## Your first program

\`\`\`
name = input("What is your name? ")
print("Karibu, " + name + "!")
\`\`\`

- **Variables** are labelled boxes: \`marks = 72\`
- **input()** asks the user; **print()** answers back.
- Strings need quotes; numbers do not.

## Mini-challenges

- Print your name 3 times.
- Ask for two numbers and print their sum (hint: \`int()\`).
- Store your grade and print "My grade is B+".

> Errors are **information**, not failure. Read the last line of an error message — Python tells you exactly where it got lost.`),
      L("l-c4", "m-c2", "c-cs9", "Conditions: Making Decisions in Code", "notes", 12, 4,
`## if / elif / else

\`\`\`
score = int(input("Score? "))
if score >= 50:
    print("Pass")
else:
    print("Try again")
\`\`\`

Indentation **is** the structure in Python — 4 spaces per level, always.

## Build: the matatu fare checker

Ask the fare; if it is more than 100, print "Expensive!", else "Fair price".

## Debug this

\`\`\`
age = input("Age? ")
if age >= 18:   # crashes! why?
\`\`\`

> **Answer:** input() returns a *string*. Convert it: \`age = int(input("Age? "))\`. Then attempt the course quiz.`),

      // ── Agriculture Grade 7 ──
      L("l-g1", "m-g1", "c-agr7", "Knowing Your Soil", "notes", 9, 1,
`## The feel test

Roll moist soil in your palm:

- **Sandy soil:** gritty, won't hold a ribbon. Drains fast, poor in nutrients.
- **Clay soil:** smooth, sticky, ribbons long. Holds water, hard to work.
- **Loam:** crumbly, dark — the gardener's gold: sand + silt + clay + humus.

## Why structure matters

Roots need air *and* water. Clay suffocates roots when wet; sand starves them of water.

> **Field task:** collect three soil samples around your school, feel-test each, and record your classification in your log book.`),
      L("l-g2", "m-g1", "c-agr7", "Video: Land Preparation the Right Way", "video", 10, 2,
`## Order of operations

Clearing → primary tillage (digging/ploughing) → harrowing → making beds or furrows.

- Timing matters: prepare land **before** the rains, not during.
- Minimum tillage protects soil life — don't over-dig.

> Notice how Mr. Otieno slopes his beds across the hill to stop erosion. Why does that work?`),
      L("l-g3", "m-g2", "c-agr7", "Raising a Nursery Bed", "notes", 11, 3,
`## From seed to seedling

- Choose a site: morning sun, near water, protected from animals.
- Soil mix: top soil + well-rotted manure (2:1), sieved fine.
- Sow at the right depth: small seeds shallow; beans about 5 cm.
- Mulch lightly, water gently morning and evening.

## Hardening off

A week before transplanting, reduce shade and water so seedlings toughen up.

> **Project:** raise sukuma wiki seedlings in trays. Photograph each week for your portfolio — CBC loves evidence of process.`),

      // ── Grade 9 Mathematics ──
      L("l-q1", "m-q1", "c-math9", "Expanding & Factorising Quadratics", "notes", 12, 1,
`## Expanding

(x + 3)(x + 4) = x² + 4x + 3x + 12 = **x² + 7x + 12**. Every term in the first bracket multiplies every term in the second.

## Factorising (reverse gear)

x² + 7x + 12: find two numbers that **multiply to 12** and **add to 7** → 3 and 4 → (x + 3)(x + 4).

- x² − 5x + 6 → (−2)(−3) = 6, (−2)+(−3) = −5 → (x − 2)(x − 3)
- x² + 2x − 15 → (5)(−3) → (x + 5)(x − 3)

> **Check by expanding** — it takes ten seconds and guarantees the mark.`),
      L("l-q2", "m-q2", "c-math9", "Solving Quadratic Equations", "video", 13, 2,
`## The zero-product rule

If A × B = 0, then A = 0 **or** B = 0. So:

- x² − 5x + 6 = 0 → (x − 2)(x − 3) = 0 → x = 2 or x = 3.

Quadratics usually have **two** solutions. State both.

## Live solves

Three full solutions on screen, including x² + x − 20 = 0 and a disguised one: x² = 7x.

> **Exam watch:** x² = 7x tempts you to divide by x — which *destroys* the solution x = 0. Factorise instead: x(x − 7) = 0.`),

      // ── Creative Arts Grade 5 ──
      L("l-r1", "m-r1", "c-cre5", "Folk Songs & Rhythm", "notes", 8, 1,
`## Sing with purpose

A folk song carries a community's stories, work and celebrations. Clap the pulse first, then sing: steady beat is everything.

- Call-and-response: the leader sings, the group answers.
- Add body percussion: clap, pat, stamp.

> Learn one folk song from a grandparent or neighbour this week. Write down two lines in your book — bring them to class.`),
      L("l-r2", "m-r2", "c-cre5", "Art from Found Materials", "notes", 9, 2,
`## Treasure, not trash

Bottle tops, sisal, old magazines and corn husks can become art. Plan first: sketch your design before you build.

- Weaving: over-under-over-under — the same pattern in baskets and mats.
- Collage: tear, arrange, then glue. Tear edges look softer than cut ones.

> **Challenge:** create an animal from only materials you find at home. Photograph it from three angles for your portfolio.`),

      // ── Social Studies Grade 8 ──
      L("l-h1", "m-h1", "c-ss8", "Early Communities of Kenya", "notes", 11, 1,
`## First peoples

The earliest Kenyans were hunter-gatherers — tools, fire and rock art survive as evidence (Kariandusi, Olorgesailie).

Later, **migrations** shaped modern Kenya: Bantu, Nilotic and Cushite communities moved in over centuries, each bringing farming, herding or fishing skills.

## Why migration matters

Trade, intermarriage and shared neighbours built the Kenya we know. Diversity is old — unity is a practice.

> **Timeline task:** draw a 10 cm timeline of Kenyan settlement from memory of this lesson, then correct it from your notes.`),
      L("l-h2", "m-h2", "c-ss8", "The Three Arms of Government", "video", 12, 2,
`## Separation of powers

- **Executive:** implements the law — President, Cabinet, county governors.
- **Legislature:** makes the law — Parliament (Senate + National Assembly).
- **Judiciary:** interprets the law — courts, led by the Supreme Court.

Each arm checks the others; that friction is the design, not a bug.

> **Debate prep:** "County governments have improved services in my area." Prepare two points for and two against.`, ["r-ssguide"]),
    ],

    enrollments: [
      { id: "en-1", studentId: "u-amina", courseId: "c-math8", status: "active", enrolledAt: ago(45), paymentStatus: "none" },
      { id: "en-2", studentId: "u-amina", courseId: "c-sci7", status: "active", enrolledAt: ago(30), paymentStatus: "none" },
      { id: "en-3", studentId: "u-amina", courseId: "c-cs9", status: "active", enrolledAt: ago(18), paymentStatus: "none" },
      { id: "en-4", studentId: "u-juma", courseId: "c-math8", status: "active", enrolledAt: ago(50), paymentStatus: "none" },
      { id: "en-5", studentId: "u-juma", courseId: "c-kis8", status: "active", enrolledAt: ago(26), paymentStatus: "none" },
      { id: "en-6", studentId: "u-wairimu", courseId: "c-sci7", status: "completed", enrolledAt: ago(80), completedAt: ago(9), paymentStatus: "none" },
      { id: "en-7", studentId: "u-wairimu", courseId: "c-cre5", status: "active", enrolledAt: ago(22), paymentStatus: "none" },
      { id: "en-8", studentId: "u-zawadi", courseId: "c-eng", status: "active", enrolledAt: ago(12), paymentStatus: "paid" },
      { id: "en-9", studentId: "u-brian", courseId: "c-eng", status: "active", enrolledAt: ago(20), paymentStatus: "paid" },
      { id: "en-10", studentId: "u-brian", courseId: "c-bus1", status: "pending", enrolledAt: ago(1), paymentStatus: "pending" },
      { id: "en-11", studentId: "u-brian", courseId: "c-math9", status: "active", enrolledAt: ago(35), paymentStatus: "paid" },
      { id: "en-12", studentId: "u-kiptoo", courseId: "c-math8", status: "active", enrolledAt: ago(15), paymentStatus: "none" },
      { id: "en-13", studentId: "u-kiptoo", courseId: "c-ss8", status: "active", enrolledAt: ago(10), paymentStatus: "none" },
      { id: "en-14", studentId: "u-kiptoo", courseId: "c-math9", status: "active", enrolledAt: ago(66), paymentStatus: "paid" },
      { id: "en-15", studentId: "u-zawadi", courseId: "c-math9", status: "completed", enrolledAt: ago(60), completedAt: ago(14), paymentStatus: "paid" },
    ],

    lessonProgress: [
      { id: "lp-1", studentId: "u-amina", lessonId: "l-a1", courseId: "c-math8", completedAt: ago(40) },
      { id: "lp-2", studentId: "u-amina", lessonId: "l-a2", courseId: "c-math8", completedAt: ago(33) },
      { id: "lp-3", studentId: "u-amina", lessonId: "l-a3", courseId: "c-math8", completedAt: ago(27) },
      { id: "lp-4", studentId: "u-amina", lessonId: "l-a4", courseId: "c-math8", completedAt: ago(19) },
      { id: "lp-5", studentId: "u-amina", lessonId: "l-a5", courseId: "c-math8", completedAt: ago(12) },
      { id: "lp-6", studentId: "u-amina", lessonId: "l-s1", courseId: "c-sci7", completedAt: ago(21) },
      { id: "lp-7", studentId: "u-amina", lessonId: "l-s2", courseId: "c-sci7", completedAt: ago(15) },
      { id: "lp-8", studentId: "u-amina", lessonId: "l-c1", courseId: "c-cs9", completedAt: ago(8) },
      { id: "lp-9", studentId: "u-juma", lessonId: "l-a1", courseId: "c-math8", completedAt: ago(30) },
      { id: "lp-10", studentId: "u-juma", lessonId: "l-a2", courseId: "c-math8", completedAt: ago(22) },
      { id: "lp-11", studentId: "u-juma", lessonId: "l-k1", courseId: "c-kis8", completedAt: ago(9) },
      { id: "lp-12", studentId: "u-wairimu", lessonId: "l-s1", courseId: "c-sci7", completedAt: ago(70) },
      { id: "lp-13", studentId: "u-wairimu", lessonId: "l-s2", courseId: "c-sci7", completedAt: ago(61) },
      { id: "lp-14", studentId: "u-wairimu", lessonId: "l-s3", courseId: "c-sci7", completedAt: ago(48) },
      { id: "lp-15", studentId: "u-wairimu", lessonId: "l-s4", courseId: "c-sci7", completedAt: ago(36) },
      { id: "lp-16", studentId: "u-wairimu", lessonId: "l-r1", courseId: "c-cre5", completedAt: ago(6) },
      { id: "lp-17", studentId: "u-zawadi", lessonId: "l-e1", courseId: "c-eng", completedAt: ago(9) },
      { id: "lp-18", studentId: "u-zawadi", lessonId: "l-e2", courseId: "c-eng", completedAt: ago(4) },
      { id: "lp-19", studentId: "u-brian", lessonId: "l-e1", courseId: "c-eng", completedAt: ago(11) },
      { id: "lp-20", studentId: "u-brian", lessonId: "l-q1", courseId: "c-math9", completedAt: ago(20) },
      { id: "lp-21", studentId: "u-kiptoo", lessonId: "l-a1", courseId: "c-math8", completedAt: ago(12) },
      { id: "lp-22", studentId: "u-kiptoo", lessonId: "l-a2", courseId: "c-math8", completedAt: ago(7) },
      { id: "lp-23", studentId: "u-kiptoo", lessonId: "l-a3", courseId: "c-math8", completedAt: ago(3) },
      { id: "lp-24", studentId: "u-kiptoo", lessonId: "l-h1", courseId: "c-ss8", completedAt: ago(5) },
      { id: "lp-25", studentId: "u-zawadi", lessonId: "l-q1", courseId: "c-math9", completedAt: ago(50) },
      { id: "lp-26", studentId: "u-zawadi", lessonId: "l-q2", courseId: "c-math9", completedAt: ago(40) },
    ],

    resources: [
      { id: "r-mathrev", title: "Grade 8 Mathematics Revision Notes — Algebra", kind: "notes", subjectId: "sub-math", gradeId: "gr8", description: "Complete algebra revision: expressions, equations, brackets and word problems with worked examples.", sizeKB: 1240, downloads: 861, downloadEnabled: true, pages: 24, active: true },
      { id: "r-engpp", title: "KCSE English Paper 1 — 2024 Past Paper", kind: "past-paper", subjectId: "sub-eng", gradeId: "grf14", description: "Full 2024 KCSE English Paper 1 with original layout for timed practice.", sizeKB: 2180, downloads: 1490, downloadEnabled: true, pages: 12, year: 2024, active: true },
      { id: "r-engms", title: "KCSE English Paper 1 — 2024 Marking Scheme", kind: "marking-scheme", subjectId: "sub-eng", gradeId: "grf14", description: "Official-style marking scheme: see exactly how marks are allocated.", sizeKB: 980, downloads: 1102, downloadEnabled: false, pages: 8, year: 2024, active: true },
      { id: "r-kisguide", title: "Mwongozo wa Insha — Grade 7–9", kind: "study-guide", subjectId: "sub-kis", gradeId: "gr8", description: "Insha fungamano step-by-step: muundo, mifano, na makosa ya kuepuka.", sizeKB: 860, downloads: 644, downloadEnabled: true, pages: 18, active: true },
      { id: "r-sciws", title: "Worksheet: Mixtures & Separation Methods", kind: "worksheet", subjectId: "sub-sci", gradeId: "gr7", description: "20 practice items matching mixtures to separation techniques, with a home-lab checklist.", sizeKB: 540, downloads: 415, downloadEnabled: true, pages: 6, active: true },
      { id: "r-mathpp", title: "Grade 8 End-Term 1 Mathematics Exam — 2025", kind: "past-paper", subjectId: "sub-math", gradeId: "gr8", description: "Full end-term exam with Section A and B, CBC-formatted.", sizeKB: 1310, downloads: 723, downloadEnabled: true, pages: 10, year: 2025, active: true },
      { id: "r-csprac", title: "Computer Science Practice Questions — Python Basics", kind: "practice", subjectId: "sub-cs", gradeId: "gr9", description: "40 graded questions: tracing, debugging and writing short programs.", sizeKB: 430, downloads: 289, downloadEnabled: true, pages: 9, active: true },
      { id: "r-busguide", title: "Business Studies Study Guide — Form 1", kind: "study-guide", subjectId: "sub-bus", gradeId: "grf1", description: "Every Form 1 topic summarised with revision questions and answers.", sizeKB: 1520, downloads: 201, downloadEnabled: true, pages: 30, active: true },
      { id: "r-agrvid", title: "Video Guide: Raising a Nursery Bed", kind: "video", subjectId: "sub-agr", gradeId: "gr7", description: "Step-by-step nursery bed establishment, filmed at a JSS school garden.", sizeKB: 48200, downloads: 156, downloadEnabled: false, active: true },
      { id: "r-plan", title: "Learner Study Planner Template", kind: "study-guide", subjectId: "sub-math", gradeId: "gr8", description: "Weekly study planner with revision slots, quiz reminders and goals tracker.", sizeKB: 210, downloads: 934, downloadEnabled: true, pages: 3, active: true },
    ],

    quizzes: [
      {
        id: "q-alg", courseId: "c-math8", lessonId: "l-a9", title: "Linear Equations Mastery Quiz", description: "8 questions covering expressions, equations and word problems. Pass mark 70%.",
        timeLimitMin: 10, passingPercent: 70, maxAttempts: 3, showImmediate: true, active: true,
        questions: [
          { id: "qa1", type: "mcq", prompt: "Simplify: 6x + 3x − 2x", options: ["7x", "11x", "x", "7x²"], answer: "7x", explanation: "All terms are like terms: 6 + 3 − 2 = 7." },
          { id: "qa2", type: "mcq", prompt: "Solve: 3x + 5 = 20", options: ["x = 3", "x = 5", "x = 15", "x = 25/3"], answer: "x = 5", explanation: "Subtract 5 → 3x = 15, divide by 3 → x = 5." },
          { id: "qa3", type: "tf", prompt: "3x + 5 can be simplified to 8x.", options: ["True", "False"], answer: "False", explanation: "A constant cannot be added to a variable term." },
          { id: "qa4", type: "mcq", prompt: "Expand: 4(x + 2)", options: ["4x + 2", "4x + 8", "x + 8", "4x² + 8"], answer: "4x + 8", explanation: "Multiply both terms inside the bracket by 4." },
          { id: "qa5", type: "mcq", prompt: "Solve: 5x − 3 = 2x + 12", options: ["x = 3", "x = 5", "x = −5", "x = 9"], answer: "x = 5", explanation: "Subtract 2x → 3x − 3 = 12; add 3 → 3x = 15; x = 5." },
          { id: "qa6", type: "short", prompt: "Solve 2(x + 4) = 18. What is x?", answer: "5", explanation: "2x + 8 = 18 → 2x = 10 → x = 5." },
          { id: "qa7", type: "tf", prompt: "An equation must contain an equals sign.", options: ["True", "False"], answer: "True", explanation: "That is what distinguishes equations from expressions." },
          { id: "qa8", type: "short", prompt: "3 notebooks and a KSh 50 pen cost KSh 200. How much is one notebook (in KSh)?", answer: "50", explanation: "3n + 50 = 200 → 3n = 150 → n = 50." },
        ],
      },
      {
        id: "q-sci", courseId: "c-sci7", lessonId: "l-s4", title: "Mixtures & Separation Quiz", description: "6 questions on mixtures, elements, compounds and separation methods.",
        timeLimitMin: 8, passingPercent: 60, maxAttempts: 2, showImmediate: true, active: true,
        questions: [
          { id: "qs1", type: "mcq", prompt: "Which method separates sand from water?", options: ["Evaporation", "Filtration", "Distillation", "Chromatography"], answer: "Filtration", explanation: "Sand is insoluble — filter paper traps it." },
          { id: "qs2", type: "mcq", prompt: "Salt is recovered from sea water by…", options: ["Filtration", "Evaporation", "Using a magnet", "Decanting"], answer: "Evaporation", explanation: "Water evaporates, leaving salt crystals." },
          { id: "qs3", type: "tf", prompt: "Air is a mixture of gases.", options: ["True", "False"], answer: "True", explanation: "Nitrogen, oxygen, argon and others — physically combined." },
          { id: "qs4", type: "mcq", prompt: "In distillation, the liquid that condenses and collects is called the…", options: ["Residue", "Filtrate", "Distillate", "Solute"], answer: "Distillate", explanation: "Distillate is the condensed, collected liquid." },
          { id: "qs5", type: "short", prompt: "What technique separates the dyes in ink?", answer: "chromatography|paper chromatography", explanation: "Different dyes travel different distances on paper." },
          { id: "qs6", type: "tf", prompt: "A compound can be separated by physical methods.", options: ["True", "False"], answer: "False", explanation: "Compounds need chemical methods — the atoms are bonded." },
        ],
      },
      {
        id: "q-cs", courseId: "c-cs9", lessonId: "l-c4", title: "Programming Foundations Quiz", description: "Algorithms, flowcharts and Python basics — 6 questions.",
        timeLimitMin: 10, passingPercent: 60, maxAttempts: 3, showImmediate: true, active: true,
        questions: [
          { id: "qc1", type: "mcq", prompt: "Which flowchart symbol represents a decision?", options: ["Rectangle", "Oval", "Diamond", "Parallelogram"], answer: "Diamond", explanation: "Diamonds split the flow into yes/no paths." },
          { id: "qc2", type: "mcq", prompt: "What does `print()` do in Python?", options: ["Reads user input", "Displays output", "Stores a variable", "Draws a picture"], answer: "Displays output", explanation: "print() writes to the screen." },
          { id: "qc3", type: "tf", prompt: "An algorithm must eventually stop.", options: ["True", "False"], answer: "True", explanation: "Finiteness is a required property of algorithms." },
          { id: "qc4", type: "short", prompt: "Which function converts text input into a whole number?", answer: "int|int()", explanation: "int(\"7\") → 7." },
          { id: "qc5", type: "mcq", prompt: "In Python, blocks of code are marked by…", options: ["Curly braces { }", "Indentation", "Semicolons", "Parentheses"], answer: "Indentation", explanation: "Whitespace is structural in Python." },
          { id: "qc6", type: "tf", prompt: "`input()` always returns a string.", options: ["True", "False"], answer: "True", explanation: "Convert with int() or float() when you need numbers." },
        ],
      },
      {
        id: "q-eng", courseId: "c-eng", lessonId: "l-e4", title: "Functional Skills Check", description: "Comprehension, summary and grammar — 5 questions.",
        timeLimitMin: 8, passingPercent: 60, maxAttempts: 3, showImmediate: true, active: true,
        questions: [
          { id: "qe1", type: "mcq", prompt: "Choose the correctly reported sentence.", options: ["She said she is tired.", "She said she was tired.", "She says she was tired.", "She said she were tired."], answer: "She said she was tired.", explanation: "Present shifts one step back to past." },
          { id: "qe2", type: "tf", prompt: "In a summary, an example and its explanation count as two points.", options: ["True", "False"], answer: "False", explanation: "They express one idea — one point." },
          { id: "qe3", type: "mcq", prompt: "If I ___ rich, I would build a library.", options: ["am", "was", "were", "will be"], answer: "were", explanation: "Type 2 conditional uses were for all persons in formal English." },
          { id: "qe4", type: "short", prompt: "What do we call the exact words a speaker used, inside quotation marks?", answer: "direct speech", explanation: "Direct speech quotes verbatim; reported speech paraphrases." },
          { id: "qe5", type: "tf", prompt: "Summary answers should be written in the candidate's own words unless quoting is required.", options: ["True", "False"], answer: "True", explanation: "Lifting whole phrases loses language marks." },
        ],
      },
    ],

    attempts: [
      { id: "at-1", quizId: "q-alg", studentId: "u-amina", answers: { qa1: "7x", qa2: "x = 5", qa3: "False", qa4: "4x + 8", qa5: "x = 3", qa6: "5", qa7: "True", qa8: "50" }, score: 7, total: 8, percent: 88, passed: true, timeSpentSec: 412, submittedAt: ago(2) },
      { id: "at-2", quizId: "q-sci", studentId: "u-wairimu", answers: { qs1: "Filtration", qs2: "Evaporation", qs3: "True", qs4: "Distillate", qs5: "chromatography", qs6: "False" }, score: 5, total: 6, percent: 83, passed: true, timeSpentSec: 298, submittedAt: ago(5) },
      { id: "at-3", quizId: "q-cs", studentId: "u-amina", answers: { qc1: "Diamond", qc2: "Displays output", qc3: "True", qc4: "int", qc5: "Indentation", qc6: "False" }, score: 5, total: 6, percent: 83, passed: true, timeSpentSec: 340, submittedAt: ago(1) },
    ],

    assignments: [
      { id: "a-math", courseId: "c-math8", title: "Linear Equations Problem Set", instructions: "Solve all 6 questions in your exercise book, photograph or scan your working, and upload it.\n\n1. Simplify 9a + 4b − 3a + 2b\n2. Solve 7x − 2 = 33\n3. Solve 4(x + 3) = 44\n4. Solve 8x + 5 = 3x + 30\n5. Amina has twice as many books as Juma. Together they have 27. How many does each have?\n6. Write an equation for: \"a number increased by 12 gives 30\", then solve it.\n\nShow every step. Neat, aligned working earns method marks.", dueAt: ahead(5), maxMarks: 20, allowsUpload: true, active: true, createdAt: ago(6) },
      { id: "a-sci", courseId: "c-sci7", title: "Mixtures Lab Report", instructions: "Carry out the soil-and-water separation experiment from Lesson 3.\n\nYour report must include: aim, materials, method (numbered steps), observations table, and conclusion. Keep it to one page.", dueAt: ahead(3), maxMarks: 15, allowsUpload: true, active: true, createdAt: ago(5) },
      { id: "a-kis", courseId: "c-kis8", title: "Insha: Siku ya Masoko", instructions: "Andika insha fungamano ya maneno 250–300 kwenye mada: \"Siku ya Masoko\".\n\nHakikisha una utangulizi, kiini na hitimisho. Tumia methali moja na picha za maneno mbili.", dueAt: ago(1), maxMarks: 20, allowsUpload: false, active: true, createdAt: ago(9) },
      { id: "a-cs", courseId: "c-cs9", title: "Flowchart: Making Tea", instructions: "Draw a flowchart for making a cup of tea. Include at least two decision points (e.g. is the water boiling? do you take sugar?). Use correct symbols for start/end, process and decision.", dueAt: ahead(7), maxMarks: 10, allowsUpload: true, active: true, createdAt: ago(4) },
    ],

    submissions: [
      { id: "sub-1", assignmentId: "a-kis", studentId: "u-amina", text: "Insha yangu: Siku ya Masoko\n\nUtangulizi: Harufu ya ndizi mbivu na pilipili hujaza hewa kila Ijumaa mjini kwetu...\n(Kiini: aya tatu za watu, bei, na mchezo wa kupandisha bei. Hitimisho: masoko ni moyo wa kijiji.)", submittedAt: ago(3), status: "graded", marks: 17, feedback: "Muundo imara na methali iliyochaguliwa vizuri. Picha za maneno ziliifanya insha iishi — angalia tu kauli za vitenzi katika aya ya pili. Kazi nzuri!", gradedAt: ago(2) },
      { id: "sub-2", assignmentId: "a-kis", studentId: "u-juma", text: "Siku ya Masoko\n\nSiku ya masoko ni siku nzuri. Watu wengi huja sokoni. Wanununua matunda na mboga...", submittedAt: ago(1), status: "submitted" },
      { id: "sub-3", assignmentId: "a-math", studentId: "u-juma", text: "Working attached. Q5: Let Juma have x books, Amina 2x. x + 2x = 27 → 3x = 27 → x = 9. Juma: 9, Amina: 18.", fileName: "juma_linear_equations.jpg", submittedAt: ago(0.4), status: "submitted" },
    ],

    results: [
      { id: "res-1", studentId: "u-amina", subjectId: "sub-math", courseId: "c-math8", assessment: "CAT 1 — Algebra", score: 72, maxScore: 100, comment: "Solid grasp of one-step equations; practise equations with brackets.", term: "Term 1 2026", date: ago(14), releasedBy: "u-wanjiku" },
      { id: "res-2", studentId: "u-amina", subjectId: "sub-eng", assessment: "English Paper 1 Mock", score: 68, maxScore: 100, comment: "Summary within limits — keep trimming introductions.", term: "Term 1 2026", date: ago(12), releasedBy: "u-achieng" },
      { id: "res-3", studentId: "u-amina", subjectId: "sub-kis", courseId: "c-kis8", assessment: "Insha — Siku ya Masoko", score: 17, maxScore: 20, comment: "Muundo imara; angalia kauli za vitenzi.", term: "Term 1 2026", date: ago(2), releasedBy: "u-achieng" },
      { id: "res-4", studentId: "u-amina", subjectId: "sub-sci", assessment: "Science Practical Test", score: 77, maxScore: 100, comment: "Excellent method descriptions; label diagrams next time.", term: "Term 1 2026", date: ago(10), releasedBy: "u-otieno" },
      { id: "res-5", studentId: "u-brian", subjectId: "sub-math", courseId: "c-math9", assessment: "CAT 1 — Quadratics", score: 55, maxScore: 100, comment: "Factorising improving; revise sign rules.", term: "Term 1 2026", date: ago(13), releasedBy: "u-wanjiku" },
      { id: "res-6", studentId: "u-brian", subjectId: "sub-eng", courseId: "c-eng", assessment: "Comprehension Drill 2", score: 61, maxScore: 100, comment: "Answers more precise — avoid lifting from the passage.", term: "Term 1 2026", date: ago(9), releasedBy: "u-achieng" },
      { id: "res-7", studentId: "u-wairimu", subjectId: "sub-sci", courseId: "c-sci7", assessment: "End of Course Assessment", score: 83, maxScore: 100, comment: "Outstanding. Separation methods fully mastered.", term: "Term 1 2026", date: ago(9), releasedBy: "u-otieno" },
      { id: "res-8", studentId: "u-wairimu", subjectId: "sub-cre", assessment: "Creative Portfolio Review", score: 88, maxScore: 100, comment: "Beautiful weaving portfolio — exhibition ready!", term: "Term 1 2026", date: ago(7), releasedBy: "u-achieng" },
      { id: "res-9", studentId: "u-juma", subjectId: "sub-math", courseId: "c-math8", assessment: "CAT 1 — Algebra", score: 49, maxScore: 100, comment: "Attend the Wednesday clinic; like terms need more practice.", term: "Term 1 2026", date: ago(14), releasedBy: "u-wanjiku" },
      { id: "res-10", studentId: "u-zawadi", subjectId: "sub-eng", courseId: "c-eng", assessment: "Grammar Clinic Test", score: 74, maxScore: 100, comment: "Reported speech mastered; conditionals next.", term: "Term 1 2026", date: ago(6), releasedBy: "u-achieng" },
      { id: "res-11", studentId: "u-kiptoo", subjectId: "sub-math", courseId: "c-math8", assessment: "CAT 1 — Algebra", score: 66, maxScore: 100, comment: "Good pace; show full working for method marks.", term: "Term 1 2026", date: ago(14), releasedBy: "u-wanjiku" },
      { id: "res-12", studentId: "u-zawadi", subjectId: "sub-math", courseId: "c-math9", assessment: "End of Course Assessment", score: 81, maxScore: 100, comment: "Excellent factorising under timed conditions.", term: "Term 1 2026", date: ago(14), releasedBy: "u-wanjiku" },
    ],

    payments: [
      { id: "pay-1", studentId: "u-zawadi", courseId: "c-eng", amount: 500, method: "mpesa", status: "completed", reference: "SGM4T8XK2Q", phone: "+254 745 555 024", date: ago(12) },
      { id: "pay-2", studentId: "u-brian", courseId: "c-eng", amount: 500, method: "mpesa", status: "completed", reference: "SGN7P2QL9R", phone: "+254 745 555 021", date: ago(20) },
      { id: "pay-3", studentId: "u-brian", courseId: "c-math9", amount: 450, method: "card", status: "completed", reference: "SGK9D4WM1S", date: ago(35) },
      { id: "pay-4", studentId: "u-kiptoo", courseId: "c-math9", amount: 450, method: "mpesa", status: "completed", reference: "SGB2R6TN8V", phone: "+254 745 555 025", date: ago(66) },
      { id: "pay-5", studentId: "u-zawadi", courseId: "c-math9", amount: 450, method: "mpesa", status: "completed", reference: "SGF5H1JC3W", phone: "+254 745 555 024", date: ago(60) },
      { id: "pay-6", studentId: "u-brian", courseId: "c-bus1", amount: 350, method: "mpesa", status: "pending", reference: "SGQ8Y3ZA5X", phone: "+254 745 555 021", date: ago(1) },
      { id: "pay-7", studentId: "u-wairimu", courseId: "c-eng", amount: 500, method: "mpesa", status: "failed", reference: "SGT1U9BD7Z", phone: "+254 745 555 022", date: ago(3) },
    ],

    announcements: [
      { id: "ann-1", title: "Term 1 2026 Examination Timetable Released", content: "The end-of-term examination timetable is now available. Mathematics sits on Tuesday 08:00, English Wednesday, Sciences Friday. Revision clinics run daily 4–5 PM this fortnight. Log in early on exam days — papers open 10 minutes before start time.", audience: "all-students", authorId: "u-admin", publishedAt: ago(3), pinned: true },
      { id: "ann-2", title: "New: Computer Science Grade 9 — Programming Foundations", content: "Mr. Mutua's brand-new programming course is live: algorithms, flowcharts and your first Python programs. Free for all Grade 9 learners this term. Enrol from the Courses page.", audience: "everyone", authorId: "u-admin", publishedAt: ago(6) },
      { id: "ann-3", title: "JSS Science Fair — submit your project", content: "Grade 7–9 learners: the inter-school Science Fair is on 28 March. Submit a one-page project proposal (mixtures, soils or energy) via your science teacher by next Friday. Top three projects present at the county fair.", audience: "course", audienceRef: "c-sci7", authorId: "u-otieno", publishedAt: ago(2) },
      { id: "ann-4", title: "Parents' Day — Saturday 28 March", content: "You are invited to Parents' Day from 9 AM. We will share term progress reports, demonstrate the parent dashboard, and hold one-on-one consultations with subject teachers.", audience: "parents", authorId: "u-admin", publishedAt: ago(8) },
    ],

    notifications: [
      { id: "nt-1", userId: "u-amina", title: "Assignment due in 5 days", body: "Linear Equations Problem Set is due soon. Show full working for method marks.", kind: "assignment", read: false, createdAt: ago(1), link: "/app/assignments" },
      { id: "nt-2", userId: "u-amina", title: "Result released", body: "Your Insha mark (17/20) has been published with teacher feedback.", kind: "result", read: false, createdAt: ago(2), link: "/app/results" },
      { id: "nt-3", userId: "u-amina", title: "Exam timetable posted", body: "Term 1 2026 examination timetable is now available.", kind: "announcement", read: true, createdAt: ago(3), link: "/app/dashboard" },
      { id: "nt-4", userId: "u-brian", title: "Payment pending", body: "Your M-Pesa payment of KSh 350 for Business Studies Form 1 is awaiting confirmation.", kind: "payment", read: false, createdAt: ago(1) },
      { id: "nt-5", userId: "u-wairimu", title: "Course completed 🎓", body: "You completed Grade 7 Integrated Science: Mixtures & Separation. Outstanding work!", kind: "course", read: true, createdAt: ago(9), link: "/app/progress" },
      { id: "nt-6", userId: "u-juma", title: "Wednesday maths clinic", body: "Ms. Wanjiku invites you to the algebra clinic — Wednesdays 4 PM.", kind: "system", read: false, createdAt: ago(2) },
    ],

    bookmarks: [
      { id: "bk-1", userId: "u-amina", type: "resource", refId: "r-mathrev", createdAt: ago(10) },
      { id: "bk-2", userId: "u-amina", type: "lesson", refId: "l-a5", createdAt: ago(8) },
      { id: "bk-3", userId: "u-amina", type: "resource", refId: "r-plan", createdAt: ago(4) },
    ],

    achievementDefs: [
      { id: "ach-first", name: "First Steps", description: "Completed your very first lesson.", icon: "first" },
      { id: "ach-ace", name: "Quiz Ace", description: "Passed your first quiz.", icon: "ace" },
      { id: "ach-streak", name: "Momentum", description: "Completed 10 lessons across your courses.", icon: "streak" },
      { id: "ach-half", name: "Halfway Hero", description: "Reached 50% in a course.", icon: "half" },
      { id: "ach-grad", name: "Course Graduate", description: "Completed an entire course.", icon: "grad" },
      { id: "ach-book", name: "Curious Collector", description: "Bookmarked 5 lessons or resources.", icon: "book" },
    ],

    earned: [
      { id: "ea-1", studentId: "u-amina", defId: "ach-first", earnedAt: ago(40) },
      { id: "ea-2", studentId: "u-amina", defId: "ach-ace", earnedAt: ago(2) },
      { id: "ea-3", studentId: "u-wairimu", defId: "ach-first", earnedAt: ago(70) },
      { id: "ea-4", studentId: "u-wairimu", defId: "ach-grad", earnedAt: ago(9) },
      { id: "ea-5", studentId: "u-wairimu", defId: "ach-half", earnedAt: ago(48) },
    ],

    audit: [
      { id: "au-1", userId: "u-admin", userName: "Susan Kamande", action: "publish_announcement", entity: "announcement", details: "Published 'Term 1 2026 Examination Timetable Released'", date: ago(3) },
      { id: "au-2", userId: "u-wanjiku", userName: "Grace Wanjiku", action: "grade_submission", entity: "submission", details: "Graded Amina Yusuf — Insha: Siku ya Masoko (17/20)", date: ago(2) },
      { id: "au-3", userId: "u-mutua", userName: "Peter Mutua", action: "create_course", entity: "course", details: "Created 'Computer Science Grade 9: Programming Foundations'", date: ago(60) },
      { id: "au-4", userId: "u-admin", userName: "Susan Kamande", action: "confirm_payment", entity: "payment", details: "M-Pesa SGM4T8XK2Q — KSh 500 (Zawadi Mumbua)", date: ago(12) },
      { id: "au-5", userId: "u-achieng", userName: "Mercy Achieng'", action: "release_results", entity: "result", details: "Released Grammar Clinic Test results (6 learners)", date: ago(6) },
      { id: "au-6", userId: "u-admin", userName: "Susan Kamande", action: "update_user", entity: "user", details: "Deactivated trial account trial@ssgt.ac.ke", date: ago(15) },
    ],

    contacts: [
      { id: "ct-1", name: "David Rono", email: "d.rono@gmail.com", phone: "+254 722 118 442", subject: "School partnership", message: "Hello — I am the deputy principal at Kapsoet JSS. We would like to enrol our Grade 7–9 cohort on SSGT. Could we get a school account quote?", date: ago(2), read: false },
      { id: "ct-2", name: "Faith Wambui", email: "faithw@outlook.com", phone: "+254 710 993 221", subject: "Payment question", message: "I paid via M-Pesa yesterday but my daughter's course still shows pending. Reference SGQ8Y3ZA5X. Kindly assist.", date: ago(1), read: false },
    ],

    emails: [
      { id: "em-1", to: "student@ssgt.ac.ke", template: "enrollment-confirmation", subject: "You're enrolled: Grade 8 Mathematics", date: ago(45) },
      { id: "em-2", to: "zawadi@ssgt.ac.ke", template: "payment-receipt", subject: "Receipt: KSh 500 — KCSE English Paper 1", date: ago(12) },
    ],

    settings: {
      contactEmail: "hello@ssgt.ac.ke",
      contactPhone: "+254 712 345 678",
      address: "3rd Floor, Kimathi House, Kimathi Street, Nairobi",
      socials: { facebook: "https://facebook.com/ssgtutors", x: "https://x.com/ssgtutors", youtube: "https://youtube.com/@ssgtutors", whatsapp: "https://wa.me/254712345678" },
      featuredCourseIds: ["c-math8", "c-sci7", "c-cs9", "c-eng"],
      registrationOpen: true,
      testimonials: [
        { id: "ts-1", name: "Hassan Yusuf", role: "Parent — Nairobi", quote: "Amina moved from a C+ to a B+ average in one term. I can see every quiz score and assignment on my phone before she even tells me.", color: "#A84625" },
        { id: "ts-2", name: "Wairimu Njoroge", role: "Grade 7 learner — Nakuru", quote: "The quizzes tell me immediately what I got wrong and why. It feels like a patient teacher sitting next to me at night.", color: "#B56508" },
        { id: "ts-3", name: "Grace Wanjiku", role: "Mathematics teacher — Kiambu", quote: "I manage three courses and marking used to eat my weekends. Now submissions queue themselves and results publish with one click.", color: "#0C5A43" },
      ],
      faqs: [
        { id: "fq-1", q: "Is SSGT aligned with the Kenyan curriculum?", a: "Yes. Courses are mapped to CBC (Grade 1–12 pathways) and 8-4-4 (KCSE revision). Every course shows its curriculum, level and grade, and administrators can extend the catalogue as KICD updates the curriculum." },
        { id: "fq-2", q: "How do I pay for paid courses?", a: "Paid courses support M-Pesa (STK push to your phone) and card payments. Your enrolment activates automatically once payment confirms, and a receipt is saved to your payment history. We never store card numbers." },
        { id: "fq-3", q: "Can parents monitor their child's progress?", a: "Parents create an account and link learners using the student's SSGT code (e.g. SSGT-1001). Linked parents see courses, progress, results, assignments and payment history — nothing else on the platform." },
        { id: "fq-4", q: "Do learners get certificates?", a: "Learners build a verifiable progress record: completed lessons, quiz scores and course completion. Teachers and administrators can export results for official school reporting." },
        { id: "fq-5", q: "What devices does it work on?", a: "SSGT is mobile-first — most learners use Android phones on modest bundles. Pages are lightweight, images are optimised, and dashboards work on any modern browser on phone, tablet or computer." },
        { id: "fq-6", q: "Can teachers build their own courses?", a: "Yes. Teacher accounts can create courses, modules, lessons, quizzes and assignments, grade submissions, and publish announcements to their classes — with full audit trails." },
      ],
    },
  };
}


+++ src/lib/seed.ts (修改后)
import type { DB, Lesson } from "./types";

/* ────────────────────────────────────────────────────────────────────────────
   Seed database — realistic Kenyan demo data.
   Loaded once into localStorage on first run (see db.ts). Never ships secrets.
   ──────────────────────────────────────────────────────────────────────────── */

const IMG = {
  math: "https://image.qwenlm.ai/generated-images/dc381962-eb3f-4424-8a88-26ed3a8fb05f/_result.png",
  sci: "https://image.qwenlm.ai/generated-images/d6df294d-c260-435a-a3df-9c1946b3dc6c/_result.png",
  eng: "https://image.qwenlm.ai/generated-images/d98541ad-6012-4936-8c9f-791d8d85199f/_result.png",
  kis: "https://image.qwenlm.ai/generated-images/1707b98d-70c6-4681-8914-4b9ec9aaab80/_result.png",
  bus: "https://image.qwenlm.ai/generated-images/2be7e448-891b-4975-9cc3-2acf95c564d1/_result.png",
  cs: "https://image.qwenlm.ai/generated-images/b2508b39-542c-4c07-ba6f-a912c019ab0e/_result.png",
  agr: "https://image.qwenlm.ai/generated-images/57d2cf79-447e-447e-891f-7a2a0a4a5f86/_result.png",
  cre: "https://image.qwenlm.ai/generated-images/b017729f-2cf0-4116-bb8a-1e6c386da090/_result.png",
  ss: "https://image.qwenlm.ai/generated-images/e7a5ff25-d86d-40e1-8624-4d60f988ee06/_result.png",
};
// fallback if a hosted cover is unreachable — the UI renders a palette gradient behind images.
void IMG;

const now = Date.now();
const D = 86400000;
const ago = (d: number) => now - d * D;
const ahead = (d: number) => now + d * D;

// demo password hash is applied in db.ts (hash("Demo@123" + pepper))
const PW = "demo";

const L = (id: string, moduleId: string, courseId: string, title: string, kind: Lesson["kind"], minutes: number, order: number, content: string, resourceIds: string[] = []): Lesson =>
  ({ id, moduleId, courseId, title, kind, minutes, order, content, resourceIds });

export function makeSeed(): DB {
  return {
    seededAt: now,

    users: [
      { id: "u-admin", name: "Susan Kamande", email: "admin@ssgt.ac.ke", phone: "+254 700 000 001", pass: PW, role: "admin", color: "#083528", active: true, createdAt: ago(400) },
      { id: "u-wanjiku", name: "Grace Wanjiku", email: "teacher@ssgt.ac.ke", phone: "+254 712 555 010", pass: PW, role: "teacher", color: "#0C5A43", active: true, createdAt: ago(380), subjectIds: ["sub-math"], bio: "Mathematics educator with 12 years in Kenyan classrooms, from CBC Grade 7 to KCSE.", qualifications: "B.Ed Mathematics (Kenyatta University), TSC 128456" },
      { id: "u-otieno", name: "Daniel Otieno", email: "d.otieno@ssgt.ac.ke", phone: "+254 733 555 011", pass: PW, role: "teacher", color: "#357E62", active: true, createdAt: ago(350), subjectIds: ["sub-sci", "sub-agr", "sub-ss"], bio: "Sciences tutor who believes every learner can master the lab.", qualifications: "B.Sc & PGDE (Maseno University), TSC 204117" },
      { id: "u-achieng", name: "Mercy Achieng'", email: "m.achieng@ssgt.ac.ke", phone: "+254 720 555 012", pass: PW, role: "teacher", color: "#D9860A", active: true, createdAt: ago(330), subjectIds: ["sub-eng", "sub-kis", "sub-cre"], bio: "Languages & creative arts specialist — insha coach and KCSE examiner.", qualifications: "BA Education, Literature (Moi University), TSC 315002" },
      { id: "u-mutua", name: "Peter Mutua", email: "p.mutua@ssgt.ac.ke", phone: "+254 798 555 013", pass: PW, role: "teacher", color: "#8F4D0D", active: true, createdAt: ago(300), subjectIds: ["sub-cs", "sub-bus"], bio: "Business & computer studies mentor; builds young problem-solvers.", qualifications: "B.Com (KCA University), TSC 402288" },
      { id: "u-amina", name: "Amina Yusuf", email: "student@ssgt.ac.ke", phone: "+254 745 555 020", pass: PW, role: "student", color: "#C4562E", active: true, createdAt: ago(120), gradeId: "gr8", studentCode: "SSGT-1001", guardianName: "Hassan Yusuf" },
      { id: "u-brian", name: "Brian Kiptoo", email: "brian@ssgt.ac.ke", phone: "+254 745 555 021", pass: PW, role: "student", color: "#1F6A50", active: true, createdAt: ago(95), gradeId: "grf1", studentCode: "SSGT-1002", guardianName: "Ruth Kiptoo" },
      { id: "u-wairimu", name: "Wairimu Njoroge", email: "wairimu@ssgt.ac.ke", phone: "+254 745 555 022", pass: PW, role: "student", color: "#B56508", active: true, createdAt: ago(88), gradeId: "gr7", studentCode: "SSGT-1003", guardianName: "Rose Njoroge" },
      { id: "u-juma", name: "Juma Abdalla", email: "juma@ssgt.ac.ke", phone: "+254 745 555 023", pass: PW, role: "student", color: "#0A4536", active: true, createdAt: ago(70), gradeId: "gr8", studentCode: "SSGT-1004", guardianName: "Salim Abdalla" },
      { id: "u-zawadi", name: "Zawadi Mumbua", email: "zawadi@ssgt.ac.ke", phone: "+254 745 555 024", pass: PW, role: "student", color: "#6F3C0E", active: true, createdAt: ago(52), gradeId: "grf2", studentCode: "SSGT-1005", guardianName: "Naomi Mumbua" },
      { id: "u-kiptoo", name: "Kiptoo Rono", email: "kiptoo@ssgt.ac.ke", phone: "+254 745 555 025", pass: PW, role: "student", color: "#5C9C80", active: true, createdAt: ago(40), gradeId: "gr8", studentCode: "SSGT-1006", guardianName: "David Rono" },
      { id: "u-hassan", name: "Hassan Yusuf", email: "parent@ssgt.ac.ke", phone: "+254 701 555 030", pass: PW, role: "parent", color: "#A84625", active: true, createdAt: ago(110), linkedStudentIds: ["u-amina"] },
      { id: "u-rose", name: "Rose Njoroge", email: "rose@ssgt.ac.ke", phone: "+254 701 555 031", pass: PW, role: "parent", color: "#083528", active: true, createdAt: ago(85), linkedStudentIds: ["u-wairimu"] },
    ],

    curricula: [
      { id: "curr-cbc", name: "CBC (Competency-Based Curriculum)", code: "CBC", description: "Kenya's 2-6-3-3-3 competency-based curriculum.", active: true },
      { id: "curr-844", name: "8-4-4 Curriculum", code: "8-4-4", description: "Legacy curriculum — revision materials and KCSE preparation.", active: true },
    ],

    levels: [
      { id: "lvl-eyp", curriculumId: "curr-cbc", name: "Early Years (PP1–PP2)", order: 1 },
      { id: "lvl-pri", curriculumId: "curr-cbc", name: "Primary (Grade 1–6)", order: 2 },
      { id: "lvl-jss", curriculumId: "curr-cbc", name: "Junior Secondary (Grade 7–9)", order: 3 },
      { id: "lvl-sss", curriculumId: "curr-cbc", name: "Senior Secondary (Grade 10–12)", order: 4 },
      { id: "lvl-844p", curriculumId: "curr-844", name: "Primary (Standard 1–8)", order: 1 },
      { id: "lvl-844s", curriculumId: "curr-844", name: "Secondary (Form 1–4)", order: 2 },
    ],

    grades: [
      { id: "gr5", levelId: "lvl-pri", name: "Grade 5", order: 5 },
      { id: "gr6", levelId: "lvl-pri", name: "Grade 6", order: 6 },
      { id: "gr7", levelId: "lvl-jss", name: "Grade 7", order: 1 },
      { id: "gr8", levelId: "lvl-jss", name: "Grade 8", order: 2 },
      { id: "gr9", levelId: "lvl-jss", name: "Grade 9", order: 3 },
      { id: "gr10", levelId: "lvl-sss", name: "Grade 10", order: 1 },
      { id: "grf14", levelId: "lvl-844s", name: "Form 1–4", order: 0 },
      { id: "grf1", levelId: "lvl-844s", name: "Form 1", order: 1 },
      { id: "grf2", levelId: "lvl-844s", name: "Form 2", order: 2 },
      { id: "grf3", levelId: "lvl-844s", name: "Form 3", order: 3 },
      { id: "grf4", levelId: "lvl-844s", name: "Form 4", order: 4 },
    ],

    subjects: [
      { id: "sub-math", name: "Mathematics", short: "Math", color: "#0C5A43", icon: "target", description: "Numbers, algebra, geometry and problem solving across all levels.", levelIds: ["lvl-pri", "lvl-jss", "lvl-sss"], active: true },
      { id: "sub-eng", name: "English", short: "ENG", color: "#B56508", icon: "book", description: "Comprehension, composition, grammar, listening and speaking.", levelIds: ["lvl-pri", "lvl-jss", "lvl-sss", "lvl-844s"], active: true },
      { id: "sub-kis", name: "Kiswahili", short: "KIS", color: "#A84625", icon: "drum", description: "Sarufi, insha, fasihi na isimu jamii kwa lugha ya Kiswahili.", levelIds: ["lvl-pri", "lvl-jss", "lvl-sss", "lvl-844s"], active: true },
      { id: "sub-sci", name: "Integrated Science", short: "SCI", color: "#1F6A50", icon: "spark", description: "Biology, chemistry and physics strands integrated for JSS learners.", levelIds: ["lvl-jss"], active: true },
      { id: "sub-prisci", name: "Science & Technology", short: "S&T", color: "#357E62", icon: "spark", description: "Primary science: living things, energy, matter and the environment.", levelIds: ["lvl-pri"], active: true },
      { id: "sub-ss", name: "Social Studies", short: "SST", color: "#8F4D0D", icon: "globe", description: "History, civics, geography and citizenship for young Kenyans.", levelIds: ["lvl-pri", "lvl-jss"], active: true },
      { id: "sub-bus", name: "Business Studies", short: "BUS", color: "#6F3C0E", icon: "money", description: "Trade, entrepreneurship, accounting and the Kenyan economy.", levelIds: ["lvl-jss", "lvl-844s"], active: true },
      { id: "sub-agr", name: "Agriculture & Nutrition", short: "AGR", color: "#5C9C80", icon: "leaf", description: "Crop production, soil science, livestock and food security.", levelIds: ["lvl-jss"], active: true },
      { id: "sub-cs", name: "Computer Science", short: "CS", color: "#083528", icon: "code", description: "Digital literacy, computational thinking and programming.", levelIds: ["lvl-jss", "lvl-sss"], active: true },
      { id: "sub-cre", name: "Creative & Performing Arts", short: "CPA", color: "#D9860A", icon: "sun", description: "Music, art, craft and performance across the curriculum.", levelIds: ["lvl-pri", "lvl-jss"], active: true },
      { id: "sub-phe", name: "Physical & Health Education", short: "PHE", color: "#C4562E", icon: "flame", description: "Fitness, games, hygiene and healthy living.", levelIds: ["lvl-jss"], active: true },
      { id: "sub-re", name: "Religious Education", short: "RE", color: "#0A4536", icon: "shield", description: "Values, ethics and spiritual development.", levelIds: ["lvl-pri", "lvl-jss"], active: true },
    ],

    courses: [
      { id: "c-math8", title: "Grade 8 Mathematics: Algebra & Linear Equations", slug: "grade-8-mathematics-algebra", subjectId: "sub-math", gradeId: "gr8", curriculumId: "curr-cbc", teacherId: "u-wanjiku", description: "Master algebraic expressions and linear equations step by step — with worked examples, videos and KCSE-style practice.", long: "This course takes Grade 8 learners from the very idea of a variable to confidently solving equations with brackets and word problems. Every lesson ends with practice questions, and the final mastery quiz mirrors the structure of end-of-term assessments.", image: IMG.math, rating: 4.8, ratingCount: 214, enrolledCount: 342, price: 0, featured: true, published: true, objectives: ["Identify variables, constants and coefficients in expressions", "Simplify algebraic expressions by collecting like terms", "Solve one-step and two-step linear equations", "Solve equations involving brackets and fractions", "Translate word problems into equations and solve them"], createdAt: ago(150) },
      { id: "c-sci7", title: "Grade 7 Integrated Science: Mixtures & Separation", slug: "grade-7-science-mixtures", subjectId: "sub-sci", gradeId: "gr7", curriculumId: "curr-cbc", teacherId: "u-otieno", description: "Explore everyday mixtures — from tea to seawater — and learn the lab techniques used to separate them.", image: IMG.sci, rating: 4.7, ratingCount: 162, enrolledCount: 289, price: 0, featured: true, published: true, objectives: ["Distinguish mixtures, elements and compounds", "Describe filtration, evaporation, distillation and chromatography", "Choose the right separation method for a given mixture", "Carry out a safe separation experiment at home or school"], createdAt: ago(140) },
      { id: "c-cs9", title: "Computer Science Grade 9: Programming Foundations", slug: "grade-9-computer-science-programming", subjectId: "sub-cs", gradeId: "gr9", curriculumId: "curr-cbc", teacherId: "u-mutua", description: "Think computationally: algorithms, flowcharts and your first real Python programs — no experience needed.", image: IMG.cs, rating: 4.9, ratingCount: 98, enrolledCount: 176, price: 0, featured: true, published: true, objectives: ["Define algorithms and trace them by hand", "Draw and read flowcharts", "Write and run basic Python: variables, input, conditions", "Debug simple programs like a professional"], createdAt: ago(60) },
      { id: "c-eng", title: "KCSE English Paper 1: Comprehension, Summary & Grammar", slug: "kcse-english-paper-1", subjectId: "sub-eng", gradeId: "grf14", curriculumId: "curr-844", teacherId: "u-achieng", description: "Exam-focused drills for functional skills: comprehension questions, summary writing in sentence form, and the grammar items examiners love.", image: IMG.eng, rating: 4.6, ratingCount: 301, enrolledCount: 458, price: 500, featured: true, published: true, objectives: ["Answer comprehension questions in full, precise sentences", "Write summaries within word limits without losing marks", "Master reported speech, conditionals and punctuation", "Practice with marked KCSE-style past questions"], createdAt: ago(200) },
      { id: "c-kis8", title: "Kiswahili Grade 8: Insha, Sarufi na Fasihi", slug: "kiswahili-grade-8-insha", subjectId: "sub-kis", gradeId: "gr8", curriculumId: "curr-cbc", teacherId: "u-achieng", description: "Jenga ujuzi wako wa insha fungamano, kanga misamiati, na uelewe sarufi kwa vitendo — si kwa nadharia tu.", image: IMG.kis, rating: 4.7, ratingCount: 141, enrolledCount: 265, price: 0, featured: false, published: true, objectives: ["Andika insha fungamano yenye muundo sahihi", "Tambua na tumia kauli za vitenzi na nyakati", "Chambua methali na vitendawili"], createdAt: ago(130) },
      { id: "c-bus1", title: "Business Studies Form 1: Introduction to Business", slug: "business-studies-form-1-introduction", subjectId: "sub-bus", gradeId: "grf1", curriculumId: "curr-844", teacherId: "u-mutua", description: "From the duka to the boardroom: what business is, forms of business units, and how money moves in Kenya.", image: IMG.bus, rating: 4.5, ratingCount: 87, enrolledCount: 134, price: 350, featured: false, published: true, objectives: ["Define business and its role in the economy", "Compare sole proprietorship, partnership and companies", "Understand basic bookkeeping terms"], createdAt: ago(110) },
      { id: "c-agr7", title: "Agriculture Grade 7: Soil & Crop Production Basics", slug: "agriculture-grade-7-soil-crops", subjectId: "sub-agr", gradeId: "gr7", curriculumId: "curr-cbc", teacherId: "u-otieno", description: "Hands-on soil science: texture tests, land preparation and raising a healthy seedbed — linked to the school garden.", image: IMG.agr, rating: 4.6, ratingCount: 74, enrolledCount: 121, price: 0, featured: false, published: true, objectives: ["Identify soil types by feel and behaviour", "Explain land preparation practices", "Establish and maintain a simple nursery bed"], createdAt: ago(100) },
      { id: "c-math9", title: "Grade 9 Mathematics: Quadratic Expressions", slug: "grade-9-mathematics-quadratics", subjectId: "sub-math", gradeId: "gr9", curriculumId: "curr-cbc", teacherId: "u-wanjiku", description: "The bridge to senior-school maths: expanding, factorising and solving quadratics with confidence.", image: IMG.math, rating: 4.8, ratingCount: 63, enrolledCount: 118, price: 450, featured: false, published: true, objectives: ["Expand and simplify quadratic expressions", "Factorise quadratics by grouping and inspection", "Solve quadratic equations by factorisation"], createdAt: ago(75) },
      { id: "c-cre5", title: "Creative Arts Grade 5: Music, Art & Craft Foundations", slug: "creative-arts-grade-5", subjectId: "sub-cre", gradeId: "gr5", curriculumId: "curr-cbc", teacherId: "u-achieng", description: "Sing, draw, weave and perform — competency-based creative arts made joyful for upper primary.", image: IMG.cre, rating: 4.9, ratingCount: 58, enrolledCount: 96, price: 0, featured: false, published: true, objectives: ["Perform simple folk songs with rhythm", "Create art from found and recycled materials", "Present a short class performance"], createdAt: ago(90) },
      { id: "c-ss8", title: "Social Studies Grade 8: History & Government of Kenya", slug: "social-studies-grade-8-kenya-history", subjectId: "sub-ss", gradeId: "gr8", curriculumId: "curr-cbc", teacherId: "u-otieno", description: "From early settlements to devolution: Kenya's story told with maps, timelines and discussion prompts.", image: IMG.ss, rating: 4.5, ratingCount: 92, enrolledCount: 143, price: 0, featured: false, published: true, objectives: ["Trace early Kenyan communities and migration", "Explain colonial rule and the road to independence", "Describe Kenya's three arms of government"], createdAt: ago(85) },
    ],

    modules: [
      { id: "m-a1", courseId: "c-math8", title: "Foundations of Algebra", order: 1 },
      { id: "m-a2", courseId: "c-math8", title: "Linear Equations", order: 2 },
      { id: "m-a3", courseId: "c-math8", title: "Applications & Mastery", order: 3 },
      { id: "m-s1", courseId: "c-sci7", title: "The Nature of Mixtures", order: 1 },
      { id: "m-s2", courseId: "c-sci7", title: "Separation Techniques", order: 2 },
      { id: "m-e1", courseId: "c-eng", title: "Comprehension Skills", order: 1 },
      { id: "m-e2", courseId: "c-eng", title: "Summary Writing & Grammar", order: 2 },
      { id: "m-k1", courseId: "c-kis8", title: "Insha Fungamano", order: 1 },
      { id: "m-k2", courseId: "c-kis8", title: "Sarufi kwa Vitendo", order: 2 },
      { id: "m-b1", courseId: "c-bus1", title: "What is Business?", order: 1 },
      { id: "m-b2", courseId: "c-bus1", title: "Forms of Business Units", order: 2 },
      { id: "m-c1", courseId: "c-cs9", title: "Thinking Computationally", order: 1 },
      { id: "m-c2", courseId: "c-cs9", title: "Your First Python Programs", order: 2 },
      { id: "m-g1", courseId: "c-agr7", title: "Understanding Soil", order: 1 },
      { id: "m-g2", courseId: "c-agr7", title: "Raising Crops", order: 2 },
      { id: "m-q1", courseId: "c-math9", title: "Working with Quadratics", order: 1 },
      { id: "m-q2", courseId: "c-math9", title: "Solving Quadratic Equations", order: 2 },
      { id: "m-r1", courseId: "c-cre5", title: "Music & Movement", order: 1 },
      { id: "m-r2", courseId: "c-cre5", title: "Art from Around Us", order: 2 },
      { id: "m-h1", courseId: "c-ss8", title: "Early Kenya", order: 1 },
      { id: "m-h2", courseId: "c-ss8", title: "Independent Kenya", order: 2 },
    ],

    lessons: [
      // ── Grade 8 Mathematics (flagship, full content) ──
      L("l-a1", "m-a1", "c-math8", "What is Algebra?", "notes", 8, 1,
`## From arithmetic to algebra

In arithmetic we work with **known numbers**: 3 + 5 = 8. In algebra we introduce **letters** that stand for numbers we do not yet know — or that can change. We call these letters **variables**.

- A **variable** is a letter (like x, y or n) representing an unknown or changing value.
- A **constant** is a fixed number, like 7 or −3.
- A **coefficient** is the number written in front of a variable, like the 4 in 4x.

## Why letters?

Imagine you buy maize flour at KSh x per kilo. Three kilos cost 3 × x, written **3x**. If x = 90, then 3x = 270. The same expression works for any price — that is the power of algebra.

> **Key idea:** an algebraic expression is a mathematical phrase made of variables, constants and operations — it has no equals sign. An *equation* has an equals sign.

## Check yourself

Without solving anything, identify the variable, coefficient and constant in each expression:

- 5x + 2
- 3n − 7
- 9 + 2y`),
      L("l-a2", "m-a1", "c-math8", "Algebraic Expressions & Like Terms", "notes", 10, 2,
`## Terms

A **term** is a part of an expression separated by + or − signs. The expression 4x + 3y − 7 has three terms: 4x, 3y and −7.

## Like terms

Terms are **like** when they have exactly the same variable part:

- 3x and 7x are like terms (both are "x" terms).
- 5y² and −2y² are like terms.
- 4x and 4y are **unlike** — different variables.
- 2x and 2x² are **unlike** — different powers.

## Collecting like terms

To simplify, add or subtract the coefficients of like terms and keep the variable part:

- 3x + 5x = 8x
- 7y − 2y + y = 6y
- 4a + 3b + 2a = 6a + 3b (a-terms combine; 3b stays)

> **Common trap:** 3x + 5 ≠ 8x. You cannot add a number to a variable term — apples and oranges!

## Practice

Simplify each:

- 6m + 4m − 2m
- 5p + 3q − 2p + q
- 8k − 3 + 2k + 9`),
      L("l-a3", "m-a1", "c-math8", "Video: Simplifying Expressions Worked Examples", "video", 12, 3,
`## In this lesson

Watch Ms. Wanjiku simplify expressions step by step, narrating every decision:

- Grouping like terms with underlines
- Handling negative coefficients carefully
- Writing the final answer in standard form (variable term first)

## Pause-and-try moments

The video pauses at three points. Attempt each simplification yourself before watching the solution:

- 9c − 4c + 2c
- 6x + 5 − 2x + 3
- 10m − 3n − 4m + 8n

> **Remember:** simplifying never changes the value of an expression — it only makes it tidier. If x = 2, then 6x + 5 − 2x + 3 and 4x + 8 both give 16.`),
      L("l-a4", "m-a2", "c-math8", "Introduction to Equations", "notes", 9, 1,
`## The balance model

An **equation** says two expressions are equal. Picture a balance scale: whatever you do to one side, you **must** do to the other to keep it level.

x + 3 = 10 means: some number, plus 3, gives 10.

## Solving by inverse operations

To find x, undo the operations around it:

- x + 3 = 10 → subtract 3 from both sides → x = 7
- x − 4 = 9 → add 4 to both sides → x = 13
- 3x = 18 → divide both sides by 3 → x = 6
- x/5 = 4 → multiply both sides by 5 → x = 20

## Checking your answer

Substitute your value back into the original equation:

- If x = 7, then x + 3 = 7 + 3 = 10 ✓

> **Golden rule:** always state the operation you are doing *to both sides*. It is the habit that saves marks in exams.

## Practice

Solve and check:

- x + 6 = 14
- x − 8 = 3
- 4x = 36
- x/7 = 5`),
      L("l-a5", "m-a2", "c-math8", "Video: Solving One-Step Equations", "video", 11, 2,
`## Lesson overview

A guided walkthrough of 8 one-step equations, from easy to exam-level, including negative answers and fractional coefficients.

## Worked example on screen

Solve: x/3 = −4

- Multiply both sides by 3
- x = −12
- Check: −12 ÷ 3 = −4 ✓

## Your turn

Pause the video and solve:

- x + 9 = 2
- −5x = 35
- x/4 = 2.5

> Watch how Ms. Wanjiku lines up her equals signs — neat working is half the marks in a marked script.`),
      L("l-a6", "m-a2", "c-math8", "Solving Two-Step Equations", "notes", 12, 3,
`## Undo in reverse order

A two-step equation wraps x in two operations, e.g. 2x + 5 = 13. Undo the operation **furthest from x first**:

- 2x + 5 = 13
- Subtract 5 from both sides: 2x = 8
- Divide both sides by 2: x = 4

## More examples

Solve 3x − 7 = 11:

- Add 7 to both sides: 3x = 18
- Divide by 3: x = 6

Solve x/2 + 4 = 9:

- Subtract 4: x/2 = 5
- Multiply by 2: x = 10

## When x appears with negatives

Solve 20 − 3x = 5:

- Subtract 20: −3x = −15
- Divide by −3: x = 5 (a negative ÷ a negative is positive!)

> **Exam tip:** two-step equations are worth 2–3 marks. One clear step per line, operation labelled, answer checked — full marks every time.

## Practice

- 4x + 1 = 29
- 6x − 2 = 16
- x/3 − 5 = 1
- 15 − 2x = 7`),
      L("l-a7", "m-a2", "c-math8", "Equations with Brackets & Variables on Both Sides", "notes", 14, 4,
`## Expanding brackets first

Solve 3(x + 2) = 21:

- Expand: 3x + 6 = 21
- Subtract 6: 3x = 15
- Divide by 3: x = 5

You could also divide both sides by 3 first: x + 2 = 7, so x = 5. Both roads work — choose the shorter one.

## Variables on both sides

Collect variable terms on one side and numbers on the other.

Solve 5x − 3 = 2x + 12:

- Subtract 2x from both sides: 3x − 3 = 12
- Add 3: 3x = 15
- Divide by 3: x = 5

Solve 7x + 4 = 4x − 11:

- Subtract 4x: 3x + 4 = −11
- Subtract 4: 3x = −15
- x = −5

> **Strategy:** move the *smaller* x-term to the side with the larger one — you usually avoid negative coefficients.

## Practice

- 2(x + 4) = 18
- 5(x − 1) = 3x + 9
- 8x − 5 = 3x + 20
- 6x + 2 = 2x − 14`),
      L("l-a8", "m-a3", "c-math8", "Video: Word Problems → Equations", "video", 13, 1,
`## Translating English into algebra

Word problems reward a calm method:

- Read the whole problem once.
- Let a letter stand for the unknown (say it out loud: "Let n = the number of notebooks").
- Translate each phrase into an expression.
- Build the equation, solve, then **answer the question asked** — with units.

## Problem 1 (on screen)

Amina buys 3 notebooks and a KSh 50 pen. She pays KSh 200 and gets no balance. How much is one notebook?

- Let n = cost of one notebook.
- 3n + 50 = 200 → 3n = 150 → n = 50.
- Answer: each notebook costs KSh 50.

## Problem 2 (pause and try)

The sum of three consecutive numbers is 57. Find them.

- Let the first be n, so n + (n+1) + (n+2) = 57 → 3n + 3 = 57 → n = 18.
- The numbers are 18, 19 and 20.

> In CBC assessments, the *process* — defining the variable and forming the equation — carries marks even if your arithmetic slips.`),
      L("l-a9", "m-a3", "c-math8", "Revision & Past-Paper Practice", "notes", 15, 2,
`## Course recap

- An **expression** has no equals sign; an **equation** does.
- Simplify by **collecting like terms**.
- Solve by **inverse operations**, done to both sides.
- **Brackets**: expand first (or divide through).
- **Both sides**: gather x-terms on one side.
- **Word problems**: define → translate → solve → answer in words.

## Timed drill (15 minutes)

- Simplify: 7a + 3b − 2a + 5b
- Solve: 5x − 4 = 21
- Solve: 3(x + 6) = 33
- Solve: 9x − 2 = 4x + 18
- A matatu fare is KSh 30 plus KSh 10 per km. If Wairimu paid KSh 110, how far did she travel?

Then attempt the **Linear Equations Mastery Quiz** — 8 questions, 10 minutes, pass mark 70%.

> You may attempt the quiz up to 3 times. Your best result is the one your teacher sees.`, ["r-mathrev"]),

      // ── Grade 7 Integrated Science ──
      L("l-s1", "m-s1", "c-sci7", "What is a Mixture?", "notes", 8, 1,
`## Mixtures are everywhere

A **mixture** is two or more substances combined physically — each keeps its own properties. Your morning tea (water, tea, sugar, milk), air, soil and seawater are all mixtures.

- **Elements** are pure substances made of one type of atom (oxygen, iron).
- **Compounds** are chemically joined elements (water, salt).
- **Mixtures** can be separated by physical means — no chemistry needed.

## Why it matters

Separating mixtures is how we get clean water, salt from the sea, and flour from maize. It is one of the most practical skills in science.

> **Think:** is a fruit salad a mixture? What about bronze? (Yes and yes — bronze mixes copper and tin.)`),
      L("l-s2", "m-s1", "c-sci7", "Video: Elements, Compounds, Mixtures", "video", 10, 2,
`## Watch for

Mr. Otieno sorts everyday items into elements, compounds and mixtures using simple particle drawings.

- Particle diagrams: how scientists *see* the difference
- Why mixtures keep the properties of their parts
- A quick "sort the shelf" challenge — pause and try it yourself

> Draw the particle diagram for salt water before watching the reveal.`),
      L("l-s3", "m-s2", "c-sci7", "Separation Techniques I: Filtration & Evaporation", "notes", 12, 1,
`## Filtration

Separates an **insoluble solid** from a liquid. Sand in water? Filter paper traps the sand (residue); clean water passes through (filtrate).

## Evaporation

Recovers a **dissolved solid** from a solution. Heat salt water: water evaporates, salt crystals remain.

## Choosing the right method

- Sand + water → filtration
- Salt + water → evaporation
- Sand + salt + water → filter the sand first, then evaporate the salt water

> **Home lab:** mix soil and water in a clear bottle. Filter through a clean cloth. Compare the filtrate with the original mixture and note your observations — this is your lab report data.`, ["r-sciws"]),
      L("l-s4", "m-s2", "c-sci7", "Separation Techniques II: Distillation & Chromatography", "video", 14, 2,
`## In this lesson

- **Simple distillation**: recovering the *liquid* from a solution — condensation is the star.
- **Fractional distillation**: separating liquids with different boiling points (how crude oil is refined).
- **Paper chromatography**: separating coloured dyes — ink racing up paper.

## Pause-and-try

Predict which dye travels furthest on chromatography paper and why, then watch the race.

> Distillation is how many Kenyan schools produce distilled water for the lab — ask your teacher to show you the apparatus.`),

      // ── KCSE English Paper 1 ──
      L("l-e1", "m-e1", "c-eng", "Comprehension: Reading the Questions First", "notes", 10, 1,
`## The 3-pass method

- **Pass 1:** read the *questions* first. Underline command words (explain, give two reasons, what does the writer suggest).
- **Pass 2:** read the passage actively, marking where each answer lives.
- **Pass 3:** answer in your own words unless told to quote.

## Lift-or-rephrase?

If the question says "in your own words", lifting earns zero. Rephrase while keeping the exact meaning.

> Examiners reward **precision**: answer exactly what is asked — no more, no less.`),
      L("l-e2", "m-e1", "c-eng", "Grammar Clinic: Reported Speech & Conditionals", "notes", 12, 2,
`## Reported speech in one shift

Move tenses one step back: present → past, will → would, can → could. Change pronouns and time words (today → that day).

- "I am tired," she said. → She said (that) she **was** tired.

## Conditionals examiners love

- Type 1: If it **rains**, we **will stay** home. (real future)
- Type 2: If I **had** money, I **would buy** books. (unreal present)

> **Drill:** rewrite 5 direct-speech sentences from your class notes into reported speech — then swap with a friend to mark.`),
      L("l-e3", "m-e2", "c-eng", "Summary Writing: The Sentence Method", "notes", 11, 1,
`## The formula

A summary is: **numbered points + own words + within word limit**.

- Read the summary question — it limits the *region* of the passage.
- List the points in the margin (one idea per point).
- Write each as one clean sentence, joined by commas/semicolons — no full stops needed between points.

## Classic deductions

Repetitions, examples, illustrations and explanations of the same idea count as **one point**.

> Count words last. Being 2–3 words over costs you — practise trimming adjectives first.`),
      L("l-e4", "m-e2", "c-eng", "Marked KCSE-Style Practice", "video", 15, 2,
`## What happens in this lesson

Ms. Achieng' marks a real candidate's summary live — you will see exactly where marks are won and lost.

- The rubric decoded: content vs. language marks
- A candidate response annotated in real time
- Your turn: attempt the 2023-style comprehension, then compare with the model answer

> Time yourself strictly: 40 minutes for the full Paper 1 practice set.`, ["r-engpp"]),

      // ── Kiswahili Grade 8 ──
      L("l-k1", "m-k1", "c-kis8", "Muundo wa Insha Fungamano", "notes", 10, 1,
`## Muundo sahihi

Insha fungamano ina sehemu tatu: **utangulizi**, **kiini** na **hitimisho**.

- Utangulizi: anza kwa dondoo, swali au msimamo — shika msomaji.
- Kiini: aya 2–3; kila aya iwe na wazo kuu moja na mifano.
- Hitimisho: fumua kwa kilele cha hoja zako — usianzishe wazo jipya.

> **Zoezi:** andika utangulizi wa insha "Mitandao ya kijamii: baraka au bala?" kwa maneno 40 pekee.`),
      L("l-k2", "m-k1", "c-kis8", "Video: Kuandika kwa Picha na Hisia", "video", 9, 2,
`## Somo

Jinsi ya kutumia **picha za maneno** (simile na метаfora... metaphor!) ili kuifanya insha yako iishi.

- Onyesha, usiseme tu: badala ya "alikuwa na hofu", sema "moyo wake ulidunda kama ngoma ya mwakenya".
- Tumia vya maana za nyumbani — msomaji wa Kenya anajua harufu ya mvua ya kwanza.

> Andika aya moja ya picha kuhusu soko la mjini kwenu kisha isome kwa sauti.`),
      L("l-k3", "m-k2", "c-kis8", "Nyakati na Kauli za Vitenzi", "notes", 12, 3,
`## Kauli kuu

- **Amri:** Soma kitabu chako.
- **Tendwa:** Amina **ana**soma (inaendelea); Juma **ali**soma (zamani); Wairimu **ta**soma (wakati ujao).
- **Tendewa:** Kitabu **kina**somwa na Amina.
- **Tenzi:** Amina **ame**soma kitabu (kamilifu).

## Makosa ya kawaida

Kuchanganya nyakati ndani ya aya moja hupoteza alama. Chagua nyakati moja ya hadithi (kawaida zamani) na uishikilie.

> **Zoezi:** badilisha sentensi 5 kutoka kauli tendwa hadi tendewa.`),
      L("l-k4", "m-k2", "c-kis8", "Methali na Vitendawili", "notes", 8, 4,
`## Methali

- "Haraka haraka haina baraka." — mvuto: uvumilivu.
- "Penye nia pana njia." — azimio huleta mafanikio.

Tumia methali **moja au mbili** tu ndani ya insha — zaidi ya hapo ni mapambo.

## Vitendawili

Kitendawili: "Nyumba yangu bila mlango?" Jibu: yai. Fanya mashindano ya vitendawili darasani!`, ["r-kisguide"]),

      // ── Business Studies Form 1 ──
      L("l-b1", "m-b1", "c-bus1", "What is Business?", "notes", 9, 1,
`## Business defined

**Business** is any activity carried out to produce or distribute goods and services **for profit**. The duka, the boda stage, the bank and M-Pesa agents are all businesses.

- **Goods** are tangible (sugar, shoes). **Services** are intangible (haircuts, transport).
- Profit = revenue − expenses. No profit motive → it is charity or public service, not business.

> **Discuss:** is a school a business? Argue both sides using the profit test.`),
      L("l-b2", "m-b1", "c-bus1", "Video: Business Around You", "video", 10, 2,
`## Lesson flow

Mr. Mutua walks through a market street and classifies every business you see:

- Producers vs. wholesalers vs. retailers
- Why some businesses sell services only
- The customer is the reason any of it exists

> **Field task:** list 10 businesses near your home and classify each as goods, services, or both.`),
      L("l-b3", "m-b2", "c-bus1", "Sole Proprietorship, Partnership & Companies", "notes", 12, 3,
`## Compare the big three

- **Sole proprietorship:** one owner, easy to start, unlimited liability. Most dukas.
- **Partnership:** 2–20 owners sharing profits; deeds matter.
- **Limited company:** a separate legal person; owners' risk limited to their shares. Needs registration at the Registrar of Companies.

## Which to choose?

Ask: how much capital is needed? Who carries the risk? How are decisions made?

> **Case:** three friends want to start a school-supplies shop with KSh 90,000. Recommend a form of business and give three reasons.`),

      // ── Computer Science Grade 9 ──
      L("l-c1", "m-c1", "c-cs9", "Algorithms: Recipes for Computers", "notes", 10, 1,
`## An algorithm is a recipe

A **finite, ordered set of steps** that solves a problem. Making tea is an algorithm; so is long division.

Good algorithms are: **clear** (no ambiguity), **finite** (they end), and **effective** (each step is doable).

## Trace it by hand

Trace this algorithm with a = 4, b = 7:

- sum ← a + b
- if sum > 10, print "Big", else print "Small"

Result: sum = 11 → "Big". Tracing on paper is how programmers think.

> **Try:** write an algorithm a stranger could follow to buy airtime on a phone. Watch where your instructions are ambiguous!`),
      L("l-c2", "m-c1", "c-cs9", "Video: Flowcharts That Talk", "video", 11, 2,
`## Symbols

- Oval: start / end
- Parallelogram: input / output
- Rectangle: process
- Diamond: decision (yes/no)

## Live build

Mr. Mutua flowcharts "should I carry an umbrella?" then upgrades it to "pass or resit" logic.

> **Pause-and-draw:** flowchart the steps of withdrawing money from an M-Pesa agent. Decisions included!`, ["r-csprac"]),
      L("l-c3", "m-c2", "c-cs9", "Hello, Python: Variables & Input", "video", 14, 3,
`## Your first program

\`\`\`
name = input("What is your name? ")
print("Karibu, " + name + "!")
\`\`\`

- **Variables** are labelled boxes: \`marks = 72\`
- **input()** asks the user; **print()** answers back.
- Strings need quotes; numbers do not.

## Mini-challenges

- Print your name 3 times.
- Ask for two numbers and print their sum (hint: \`int()\`).
- Store your grade and print "My grade is B+".

> Errors are **information**, not failure. Read the last line of an error message — Python tells you exactly where it got lost.`),
      L("l-c4", "m-c2", "c-cs9", "Conditions: Making Decisions in Code", "notes", 12, 4,
`## if / elif / else

\`\`\`
score = int(input("Score? "))
if score >= 50:
    print("Pass")
else:
    print("Try again")
\`\`\`

Indentation **is** the structure in Python — 4 spaces per level, always.

## Build: the matatu fare checker

Ask the fare; if it is more than 100, print "Expensive!", else "Fair price".

## Debug this

\`\`\`
age = input("Age? ")
if age >= 18:   # crashes! why?
\`\`\`

> **Answer:** input() returns a *string*. Convert it: \`age = int(input("Age? "))\`. Then attempt the course quiz.`),

      // ── Agriculture Grade 7 ──
      L("l-g1", "m-g1", "c-agr7", "Knowing Your Soil", "notes", 9, 1,
`## The feel test

Roll moist soil in your palm:

- **Sandy soil:** gritty, won't hold a ribbon. Drains fast, poor in nutrients.
- **Clay soil:** smooth, sticky, ribbons long. Holds water, hard to work.
- **Loam:** crumbly, dark — the gardener's gold: sand + silt + clay + humus.

## Why structure matters

Roots need air *and* water. Clay suffocates roots when wet; sand starves them of water.

> **Field task:** collect three soil samples around your school, feel-test each, and record your classification in your log book.`),
      L("l-g2", "m-g1", "c-agr7", "Video: Land Preparation the Right Way", "video", 10, 2,
`## Order of operations

Clearing → primary tillage (digging/ploughing) → harrowing → making beds or furrows.

- Timing matters: prepare land **before** the rains, not during.
- Minimum tillage protects soil life — don't over-dig.

> Notice how Mr. Otieno slopes his beds across the hill to stop erosion. Why does that work?`),
      L("l-g3", "m-g2", "c-agr7", "Raising a Nursery Bed", "notes", 11, 3,
`## From seed to seedling

- Choose a site: morning sun, near water, protected from animals.
- Soil mix: top soil + well-rotted manure (2:1), sieved fine.
- Sow at the right depth: small seeds shallow; beans about 5 cm.
- Mulch lightly, water gently morning and evening.

## Hardening off

A week before transplanting, reduce shade and water so seedlings toughen up.

> **Project:** raise sukuma wiki seedlings in trays. Photograph each week for your portfolio — CBC loves evidence of process.`),

      // ── Grade 9 Mathematics ──
      L("l-q1", "m-q1", "c-math9", "Expanding & Factorising Quadratics", "notes", 12, 1,
`## Expanding

(x + 3)(x + 4) = x² + 4x + 3x + 12 = **x² + 7x + 12**. Every term in the first bracket multiplies every term in the second.

## Factorising (reverse gear)

x² + 7x + 12: find two numbers that **multiply to 12** and **add to 7** → 3 and 4 → (x + 3)(x + 4).

- x² − 5x + 6 → (−2)(−3) = 6, (−2)+(−3) = −5 → (x − 2)(x − 3)
- x² + 2x − 15 → (5)(−3) → (x + 5)(x − 3)

> **Check by expanding** — it takes ten seconds and guarantees the mark.`),
      L("l-q2", "m-q2", "c-math9", "Solving Quadratic Equations", "video", 13, 2,
`## The zero-product rule

If A × B = 0, then A = 0 **or** B = 0. So:

- x² − 5x + 6 = 0 → (x − 2)(x − 3) = 0 → x = 2 or x = 3.

Quadratics usually have **two** solutions. State both.

## Live solves

Three full solutions on screen, including x² + x − 20 = 0 and a disguised one: x² = 7x.

> **Exam watch:** x² = 7x tempts you to divide by x — which *destroys* the solution x = 0. Factorise instead: x(x − 7) = 0.`),

      // ── Creative Arts Grade 5 ──
      L("l-r1", "m-r1", "c-cre5", "Folk Songs & Rhythm", "notes", 8, 1,
`## Sing with purpose

A folk song carries a community's stories, work and celebrations. Clap the pulse first, then sing: steady beat is everything.

- Call-and-response: the leader sings, the group answers.
- Add body percussion: clap, pat, stamp.

> Learn one folk song from a grandparent or neighbour this week. Write down two lines in your book — bring them to class.`),
      L("l-r2", "m-r2", "c-cre5", "Art from Found Materials", "notes", 9, 2,
`## Treasure, not trash

Bottle tops, sisal, old magazines and corn husks can become art. Plan first: sketch your design before you build.

- Weaving: over-under-over-under — the same pattern in baskets and mats.
- Collage: tear, arrange, then glue. Tear edges look softer than cut ones.

> **Challenge:** create an animal from only materials you find at home. Photograph it from three angles for your portfolio.`),

      // ── Social Studies Grade 8 ──
      L("l-h1", "m-h1", "c-ss8", "Early Communities of Kenya", "notes", 11, 1,
`## First peoples

The earliest Kenyans were hunter-gatherers — tools, fire and rock art survive as evidence (Kariandusi, Olorgesailie).

Later, **migrations** shaped modern Kenya: Bantu, Nilotic and Cushite communities moved in over centuries, each bringing farming, herding or fishing skills.

## Why migration matters

Trade, intermarriage and shared neighbours built the Kenya we know. Diversity is old — unity is a practice.

> **Timeline task:** draw a 10 cm timeline of Kenyan settlement from memory of this lesson, then correct it from your notes.`),
      L("l-h2", "m-h2", "c-ss8", "The Three Arms of Government", "video", 12, 2,
`## Separation of powers

- **Executive:** implements the law — President, Cabinet, county governors.
- **Legislature:** makes the law — Parliament (Senate + National Assembly).
- **Judiciary:** interprets the law — courts, led by the Supreme Court.

Each arm checks the others; that friction is the design, not a bug.

> **Debate prep:** "County governments have improved services in my area." Prepare two points for and two against.`, ["r-ssguide"]),
    ],

    enrollments: [
      { id: "en-1", studentId: "u-amina", courseId: "c-math8", status: "active", enrolledAt: ago(45), paymentStatus: "none" },
      { id: "en-2", studentId: "u-amina", courseId: "c-sci7", status: "active", enrolledAt: ago(30), paymentStatus: "none" },
      { id: "en-3", studentId: "u-amina", courseId: "c-cs9", status: "active", enrolledAt: ago(18), paymentStatus: "none" },
      { id: "en-4", studentId: "u-juma", courseId: "c-math8", status: "active", enrolledAt: ago(50), paymentStatus: "none" },
      { id: "en-5", studentId: "u-juma", courseId: "c-kis8", status: "active", enrolledAt: ago(26), paymentStatus: "none" },
      { id: "en-6", studentId: "u-wairimu", courseId: "c-sci7", status: "completed", enrolledAt: ago(80), completedAt: ago(9), paymentStatus: "none" },
      { id: "en-7", studentId: "u-wairimu", courseId: "c-cre5", status: "active", enrolledAt: ago(22), paymentStatus: "none" },
      { id: "en-8", studentId: "u-zawadi", courseId: "c-eng", status: "active", enrolledAt: ago(12), paymentStatus: "paid" },
      { id: "en-9", studentId: "u-brian", courseId: "c-eng", status: "active", enrolledAt: ago(20), paymentStatus: "paid" },
      { id: "en-10", studentId: "u-brian", courseId: "c-bus1", status: "pending", enrolledAt: ago(1), paymentStatus: "pending" },
      { id: "en-11", studentId: "u-brian", courseId: "c-math9", status: "active", enrolledAt: ago(35), paymentStatus: "paid" },
      { id: "en-12", studentId: "u-kiptoo", courseId: "c-math8", status: "active", enrolledAt: ago(15), paymentStatus: "none" },
      { id: "en-13", studentId: "u-kiptoo", courseId: "c-ss8", status: "active", enrolledAt: ago(10), paymentStatus: "none" },
      { id: "en-14", studentId: "u-kiptoo", courseId: "c-math9", status: "active", enrolledAt: ago(66), paymentStatus: "paid" },
      { id: "en-15", studentId: "u-zawadi", courseId: "c-math9", status: "completed", enrolledAt: ago(60), completedAt: ago(14), paymentStatus: "paid" },
    ],

    lessonProgress: [
      { id: "lp-1", studentId: "u-amina", lessonId: "l-a1", courseId: "c-math8", completedAt: ago(40) },
      { id: "lp-2", studentId: "u-amina", lessonId: "l-a2", courseId: "c-math8", completedAt: ago(33) },
      { id: "lp-3", studentId: "u-amina", lessonId: "l-a3", courseId: "c-math8", completedAt: ago(27) },
      { id: "lp-4", studentId: "u-amina", lessonId: "l-a4", courseId: "c-math8", completedAt: ago(19) },
      { id: "lp-5", studentId: "u-amina", lessonId: "l-a5", courseId: "c-math8", completedAt: ago(12) },
      { id: "lp-6", studentId: "u-amina", lessonId: "l-s1", courseId: "c-sci7", completedAt: ago(21) },
      { id: "lp-7", studentId: "u-amina", lessonId: "l-s2", courseId: "c-sci7", completedAt: ago(15) },
      { id: "lp-8", studentId: "u-amina", lessonId: "l-c1", courseId: "c-cs9", completedAt: ago(8) },
      { id: "lp-9", studentId: "u-juma", lessonId: "l-a1", courseId: "c-math8", completedAt: ago(30) },
      { id: "lp-10", studentId: "u-juma", lessonId: "l-a2", courseId: "c-math8", completedAt: ago(22) },
      { id: "lp-11", studentId: "u-juma", lessonId: "l-k1", courseId: "c-kis8", completedAt: ago(9) },
      { id: "lp-12", studentId: "u-wairimu", lessonId: "l-s1", courseId: "c-sci7", completedAt: ago(70) },
      { id: "lp-13", studentId: "u-wairimu", lessonId: "l-s2", courseId: "c-sci7", completedAt: ago(61) },
      { id: "lp-14", studentId: "u-wairimu", lessonId: "l-s3", courseId: "c-sci7", completedAt: ago(48) },
      { id: "lp-15", studentId: "u-wairimu", lessonId: "l-s4", courseId: "c-sci7", completedAt: ago(36) },
      { id: "lp-16", studentId: "u-wairimu", lessonId: "l-r1", courseId: "c-cre5", completedAt: ago(6) },
      { id: "lp-17", studentId: "u-zawadi", lessonId: "l-e1", courseId: "c-eng", completedAt: ago(9) },
      { id: "lp-18", studentId: "u-zawadi", lessonId: "l-e2", courseId: "c-eng", completedAt: ago(4) },
      { id: "lp-19", studentId: "u-brian", lessonId: "l-e1", courseId: "c-eng", completedAt: ago(11) },
      { id: "lp-20", studentId: "u-brian", lessonId: "l-q1", courseId: "c-math9", completedAt: ago(20) },
      { id: "lp-21", studentId: "u-kiptoo", lessonId: "l-a1", courseId: "c-math8", completedAt: ago(12) },
      { id: "lp-22", studentId: "u-kiptoo", lessonId: "l-a2", courseId: "c-math8", completedAt: ago(7) },
      { id: "lp-23", studentId: "u-kiptoo", lessonId: "l-a3", courseId: "c-math8", completedAt: ago(3) },
      { id: "lp-24", studentId: "u-kiptoo", lessonId: "l-h1", courseId: "c-ss8", completedAt: ago(5) },
      { id: "lp-25", studentId: "u-zawadi", lessonId: "l-q1", courseId: "c-math9", completedAt: ago(50) },
      { id: "lp-26", studentId: "u-zawadi", lessonId: "l-q2", courseId: "c-math9", completedAt: ago(40) },
    ],

    resources: [
      { id: "r-mathrev", title: "Grade 8 Mathematics Revision Notes — Algebra", kind: "notes", subjectId: "sub-math", gradeId: "gr8", description: "Complete algebra revision: expressions, equations, brackets and word problems with worked examples.", sizeKB: 1240, downloads: 861, downloadEnabled: true, pages: 24, active: true },
      { id: "r-engpp", title: "KCSE English Paper 1 — 2024 Past Paper", kind: "past-paper", subjectId: "sub-eng", gradeId: "grf14", description: "Full 2024 KCSE English Paper 1 with original layout for timed practice.", sizeKB: 2180, downloads: 1490, downloadEnabled: true, pages: 12, year: 2024, active: true },
      { id: "r-engms", title: "KCSE English Paper 1 — 2024 Marking Scheme", kind: "marking-scheme", subjectId: "sub-eng", gradeId: "grf14", description: "Official-style marking scheme: see exactly how marks are allocated.", sizeKB: 980, downloads: 1102, downloadEnabled: false, pages: 8, year: 2024, active: true },
      { id: "r-kisguide", title: "Mwongozo wa Insha — Grade 7–9", kind: "study-guide", subjectId: "sub-kis", gradeId: "gr8", description: "Insha fungamano step-by-step: muundo, mifano, na makosa ya kuepuka.", sizeKB: 860, downloads: 644, downloadEnabled: true, pages: 18, active: true },
      { id: "r-sciws", title: "Worksheet: Mixtures & Separation Methods", kind: "worksheet", subjectId: "sub-sci", gradeId: "gr7", description: "20 practice items matching mixtures to separation techniques, with a home-lab checklist.", sizeKB: 540, downloads: 415, downloadEnabled: true, pages: 6, active: true },
      { id: "r-mathpp", title: "Grade 8 End-Term 1 Mathematics Exam — 2025", kind: "past-paper", subjectId: "sub-math", gradeId: "gr8", description: "Full end-term exam with Section A and B, CBC-formatted.", sizeKB: 1310, downloads: 723, downloadEnabled: true, pages: 10, year: 2025, active: true },
      { id: "r-csprac", title: "Computer Science Practice Questions — Python Basics", kind: "practice", subjectId: "sub-cs", gradeId: "gr9", description: "40 graded questions: tracing, debugging and writing short programs.", sizeKB: 430, downloads: 289, downloadEnabled: true, pages: 9, active: true },
      { id: "r-busguide", title: "Business Studies Study Guide — Form 1", kind: "study-guide", subjectId: "sub-bus", gradeId: "grf1", description: "Every Form 1 topic summarised with revision questions and answers.", sizeKB: 1520, downloads: 201, downloadEnabled: true, pages: 30, active: true },
      { id: "r-agrvid", title: "Video Guide: Raising a Nursery Bed", kind: "video", subjectId: "sub-agr", gradeId: "gr7", description: "Step-by-step nursery bed establishment, filmed at a JSS school garden.", sizeKB: 48200, downloads: 156, downloadEnabled: false, active: true },
      { id: "r-plan", title: "Learner Study Planner Template", kind: "study-guide", subjectId: "sub-math", gradeId: "gr8", description: "Weekly study planner with revision slots, quiz reminders and goals tracker.", sizeKB: 210, downloads: 934, downloadEnabled: true, pages: 3, active: true },
    ],

    quizzes: [
      {
        id: "q-alg", courseId: "c-math8", lessonId: "l-a9", title: "Linear Equations Mastery Quiz", description: "8 questions covering expressions, equations and word problems. Pass mark 70%.",
        timeLimitMin: 10, passingPercent: 70, maxAttempts: 3, showImmediate: true, active: true,
        questions: [
          { id: "qa1", type: "mcq", prompt: "Simplify: 6x + 3x − 2x", options: ["7x", "11x", "x", "7x²"], answer: "7x", explanation: "All terms are like terms: 6 + 3 − 2 = 7." },
          { id: "qa2", type: "mcq", prompt: "Solve: 3x + 5 = 20", options: ["x = 3", "x = 5", "x = 15", "x = 25/3"], answer: "x = 5", explanation: "Subtract 5 → 3x = 15, divide by 3 → x = 5." },
          { id: "qa3", type: "tf", prompt: "3x + 5 can be simplified to 8x.", options: ["True", "False"], answer: "False", explanation: "A constant cannot be added to a variable term." },
          { id: "qa4", type: "mcq", prompt: "Expand: 4(x + 2)", options: ["4x + 2", "4x + 8", "x + 8", "4x² + 8"], answer: "4x + 8", explanation: "Multiply both terms inside the bracket by 4." },
          { id: "qa5", type: "mcq", prompt: "Solve: 5x − 3 = 2x + 12", options: ["x = 3", "x = 5", "x = −5", "x = 9"], answer: "x = 5", explanation: "Subtract 2x → 3x − 3 = 12; add 3 → 3x = 15; x = 5." },
          { id: "qa6", type: "short", prompt: "Solve 2(x + 4) = 18. What is x?", answer: "5", explanation: "2x + 8 = 18 → 2x = 10 → x = 5." },
          { id: "qa7", type: "tf", prompt: "An equation must contain an equals sign.", options: ["True", "False"], answer: "True", explanation: "That is what distinguishes equations from expressions." },
          { id: "qa8", type: "short", prompt: "3 notebooks and a KSh 50 pen cost KSh 200. How much is one notebook (in KSh)?", answer: "50", explanation: "3n + 50 = 200 → 3n = 150 → n = 50." },
        ],
      },
      {
        id: "q-sci", courseId: "c-sci7", lessonId: "l-s4", title: "Mixtures & Separation Quiz", description: "6 questions on mixtures, elements, compounds and separation methods.",
        timeLimitMin: 8, passingPercent: 60, maxAttempts: 2, showImmediate: true, active: true,
        questions: [
          { id: "qs1", type: "mcq", prompt: "Which method separates sand from water?", options: ["Evaporation", "Filtration", "Distillation", "Chromatography"], answer: "Filtration", explanation: "Sand is insoluble — filter paper traps it." },
          { id: "qs2", type: "mcq", prompt: "Salt is recovered from sea water by…", options: ["Filtration", "Evaporation", "Using a magnet", "Decanting"], answer: "Evaporation", explanation: "Water evaporates, leaving salt crystals." },
          { id: "qs3", type: "tf", prompt: "Air is a mixture of gases.", options: ["True", "False"], answer: "True", explanation: "Nitrogen, oxygen, argon and others — physically combined." },
          { id: "qs4", type: "mcq", prompt: "In distillation, the liquid that condenses and collects is called the…", options: ["Residue", "Filtrate", "Distillate", "Solute"], answer: "Distillate", explanation: "Distillate is the condensed, collected liquid." },
          { id: "qs5", type: "short", prompt: "What technique separates the dyes in ink?", answer: "chromatography|paper chromatography", explanation: "Different dyes travel different distances on paper." },
          { id: "qs6", type: "tf", prompt: "A compound can be separated by physical methods.", options: ["True", "False"], answer: "False", explanation: "Compounds need chemical methods — the atoms are bonded." },
        ],
      },
      {
        id: "q-cs", courseId: "c-cs9", lessonId: "l-c4", title: "Programming Foundations Quiz", description: "Algorithms, flowcharts and Python basics — 6 questions.",
        timeLimitMin: 10, passingPercent: 60, maxAttempts: 3, showImmediate: true, active: true,
        questions: [
          { id: "qc1", type: "mcq", prompt: "Which flowchart symbol represents a decision?", options: ["Rectangle", "Oval", "Diamond", "Parallelogram"], answer: "Diamond", explanation: "Diamonds split the flow into yes/no paths." },
          { id: "qc2", type: "mcq", prompt: "What does `print()` do in Python?", options: ["Reads user input", "Displays output", "Stores a variable", "Draws a picture"], answer: "Displays output", explanation: "print() writes to the screen." },
          { id: "qc3", type: "tf", prompt: "An algorithm must eventually stop.", options: ["True", "False"], answer: "True", explanation: "Finiteness is a required property of algorithms." },
          { id: "qc4", type: "short", prompt: "Which function converts text input into a whole number?", answer: "int|int()", explanation: "int(\"7\") → 7." },
          { id: "qc5", type: "mcq", prompt: "In Python, blocks of code are marked by…", options: ["Curly braces { }", "Indentation", "Semicolons", "Parentheses"], answer: "Indentation", explanation: "Whitespace is structural in Python." },
          { id: "qc6", type: "tf", prompt: "`input()` always returns a string.", options: ["True", "False"], answer: "True", explanation: "Convert with int() or float() when you need numbers." },
        ],
      },
      {
        id: "q-eng", courseId: "c-eng", lessonId: "l-e4", title: "Functional Skills Check", description: "Comprehension, summary and grammar — 5 questions.",
        timeLimitMin: 8, passingPercent: 60, maxAttempts: 3, showImmediate: true, active: true,
        questions: [
          { id: "qe1", type: "mcq", prompt: "Choose the correctly reported sentence.", options: ["She said she is tired.", "She said she was tired.", "She says she was tired.", "She said she were tired."], answer: "She said she was tired.", explanation: "Present shifts one step back to past." },
          { id: "qe2", type: "tf", prompt: "In a summary, an example and its explanation count as two points.", options: ["True", "False"], answer: "False", explanation: "They express one idea — one point." },
          { id: "qe3", type: "mcq", prompt: "If I ___ rich, I would build a library.", options: ["am", "was", "were", "will be"], answer: "were", explanation: "Type 2 conditional uses were for all persons in formal English." },
          { id: "qe4", type: "short", prompt: "What do we call the exact words a speaker used, inside quotation marks?", answer: "direct speech", explanation: "Direct speech quotes verbatim; reported speech paraphrases." },
          { id: "qe5", type: "tf", prompt: "Summary answers should be written in the candidate's own words unless quoting is required.", options: ["True", "False"], answer: "True", explanation: "Lifting whole phrases loses language marks." },
        ],
      },
    ],

    attempts: [
      { id: "at-1", quizId: "q-alg", studentId: "u-amina", answers: { qa1: "7x", qa2: "x = 5", qa3: "False", qa4: "4x + 8", qa5: "x = 3", qa6: "5", qa7: "True", qa8: "50" }, score: 7, total: 8, percent: 88, passed: true, timeSpentSec: 412, submittedAt: ago(2) },
      { id: "at-2", quizId: "q-sci", studentId: "u-wairimu", answers: { qs1: "Filtration", qs2: "Evaporation", qs3: "True", qs4: "Distillate", qs5: "chromatography", qs6: "False" }, score: 5, total: 6, percent: 83, passed: true, timeSpentSec: 298, submittedAt: ago(5) },
      { id: "at-3", quizId: "q-cs", studentId: "u-amina", answers: { qc1: "Diamond", qc2: "Displays output", qc3: "True", qc4: "int", qc5: "Indentation", qc6: "False" }, score: 5, total: 6, percent: 83, passed: true, timeSpentSec: 340, submittedAt: ago(1) },
    ],

    assignments: [
      { id: "a-math", courseId: "c-math8", title: "Linear Equations Problem Set", instructions: "Solve all 6 questions in your exercise book, photograph or scan your working, and upload it.\n\n1. Simplify 9a + 4b − 3a + 2b\n2. Solve 7x − 2 = 33\n3. Solve 4(x + 3) = 44\n4. Solve 8x + 5 = 3x + 30\n5. Amina has twice as many books as Juma. Together they have 27. How many does each have?\n6. Write an equation for: \"a number increased by 12 gives 30\", then solve it.\n\nShow every step. Neat, aligned working earns method marks.", dueAt: ahead(5), maxMarks: 20, allowsUpload: true, active: true, createdAt: ago(6) },
      { id: "a-sci", courseId: "c-sci7", title: "Mixtures Lab Report", instructions: "Carry out the soil-and-water separation experiment from Lesson 3.\n\nYour report must include: aim, materials, method (numbered steps), observations table, and conclusion. Keep it to one page.", dueAt: ahead(3), maxMarks: 15, allowsUpload: true, active: true, createdAt: ago(5) },
      { id: "a-kis", courseId: "c-kis8", title: "Insha: Siku ya Masoko", instructions: "Andika insha fungamano ya maneno 250–300 kwenye mada: \"Siku ya Masoko\".\n\nHakikisha una utangulizi, kiini na hitimisho. Tumia methali moja na picha za maneno mbili.", dueAt: ago(1), maxMarks: 20, allowsUpload: false, active: true, createdAt: ago(9) },
      { id: "a-cs", courseId: "c-cs9", title: "Flowchart: Making Tea", instructions: "Draw a flowchart for making a cup of tea. Include at least two decision points (e.g. is the water boiling? do you take sugar?). Use correct symbols for start/end, process and decision.", dueAt: ahead(7), maxMarks: 10, allowsUpload: true, active: true, createdAt: ago(4) },
    ],

    submissions: [
      { id: "sub-1", assignmentId: "a-kis", studentId: "u-amina", text: "Insha yangu: Siku ya Masoko\n\nUtangulizi: Harufu ya ndizi mbivu na pilipili hujaza hewa kila Ijumaa mjini kwetu...\n(Kiini: aya tatu za watu, bei, na mchezo wa kupandisha bei. Hitimisho: masoko ni moyo wa kijiji.)", submittedAt: ago(3), status: "graded", marks: 17, feedback: "Muundo imara na methali iliyochaguliwa vizuri. Picha za maneno ziliifanya insha iishi — angalia tu kauli za vitenzi katika aya ya pili. Kazi nzuri!", gradedAt: ago(2) },
      { id: "sub-2", assignmentId: "a-kis", studentId: "u-juma", text: "Siku ya Masoko\n\nSiku ya masoko ni siku nzuri. Watu wengi huja sokoni. Wanununua matunda na mboga...", submittedAt: ago(1), status: "submitted" },
      { id: "sub-3", assignmentId: "a-math", studentId: "u-juma", text: "Working attached. Q5: Let Juma have x books, Amina 2x. x + 2x = 27 → 3x = 27 → x = 9. Juma: 9, Amina: 18.", fileName: "juma_linear_equations.jpg", submittedAt: ago(0.4), status: "submitted" },
    ],

    results: [
      { id: "res-1", studentId: "u-amina", subjectId: "sub-math", courseId: "c-math8", assessment: "CAT 1 — Algebra", score: 72, maxScore: 100, comment: "Solid grasp of one-step equations; practise equations with brackets.", term: "Term 1 2026", date: ago(14), releasedBy: "u-wanjiku" },
      { id: "res-2", studentId: "u-amina", subjectId: "sub-eng", assessment: "English Paper 1 Mock", score: 68, maxScore: 100, comment: "Summary within limits — keep trimming introductions.", term: "Term 1 2026", date: ago(12), releasedBy: "u-achieng" },
      { id: "res-3", studentId: "u-amina", subjectId: "sub-kis", courseId: "c-kis8", assessment: "Insha — Siku ya Masoko", score: 17, maxScore: 20, comment: "Muundo imara; angalia kauli za vitenzi.", term: "Term 1 2026", date: ago(2), releasedBy: "u-achieng" },
      { id: "res-4", studentId: "u-amina", subjectId: "sub-sci", assessment: "Science Practical Test", score: 77, maxScore: 100, comment: "Excellent method descriptions; label diagrams next time.", term: "Term 1 2026", date: ago(10), releasedBy: "u-otieno" },
      { id: "res-5", studentId: "u-brian", subjectId: "sub-math", courseId: "c-math9", assessment: "CAT 1 — Quadratics", score: 55, maxScore: 100, comment: "Factorising improving; revise sign rules.", term: "Term 1 2026", date: ago(13), releasedBy: "u-wanjiku" },
      { id: "res-6", studentId: "u-brian", subjectId: "sub-eng", courseId: "c-eng", assessment: "Comprehension Drill 2", score: 61, maxScore: 100, comment: "Answers more precise — avoid lifting from the passage.", term: "Term 1 2026", date: ago(9), releasedBy: "u-achieng" },
      { id: "res-7", studentId: "u-wairimu", subjectId: "sub-sci", courseId: "c-sci7", assessment: "End of Course Assessment", score: 83, maxScore: 100, comment: "Outstanding. Separation methods fully mastered.", term: "Term 1 2026", date: ago(9), releasedBy: "u-otieno" },
      { id: "res-8", studentId: "u-wairimu", subjectId: "sub-cre", assessment: "Creative Portfolio Review", score: 88, maxScore: 100, comment: "Beautiful weaving portfolio — exhibition ready!", term: "Term 1 2026", date: ago(7), releasedBy: "u-achieng" },
      { id: "res-9", studentId: "u-juma", subjectId: "sub-math", courseId: "c-math8", assessment: "CAT 1 — Algebra", score: 49, maxScore: 100, comment: "Attend the Wednesday clinic; like terms need more practice.", term: "Term 1 2026", date: ago(14), releasedBy: "u-wanjiku" },
      { id: "res-10", studentId: "u-zawadi", subjectId: "sub-eng", courseId: "c-eng", assessment: "Grammar Clinic Test", score: 74, maxScore: 100, comment: "Reported speech mastered; conditionals next.", term: "Term 1 2026", date: ago(6), releasedBy: "u-achieng" },
      { id: "res-11", studentId: "u-kiptoo", subjectId: "sub-math", courseId: "c-math8", assessment: "CAT 1 — Algebra", score: 66, maxScore: 100, comment: "Good pace; show full working for method marks.", term: "Term 1 2026", date: ago(14), releasedBy: "u-wanjiku" },
      { id: "res-12", studentId: "u-zawadi", subjectId: "sub-math", courseId: "c-math9", assessment: "End of Course Assessment", score: 81, maxScore: 100, comment: "Excellent factorising under timed conditions.", term: "Term 1 2026", date: ago(14), releasedBy: "u-wanjiku" },
    ],

    payments: [
      { id: "pay-1", studentId: "u-zawadi", courseId: "c-eng", amount: 500, method: "mpesa", status: "completed", reference: "SGM4T8XK2Q", phone: "+254 745 555 024", date: ago(12) },
      { id: "pay-2", studentId: "u-brian", courseId: "c-eng", amount: 500, method: "mpesa", status: "completed", reference: "SGN7P2QL9R", phone: "+254 745 555 021", date: ago(20) },
      { id: "pay-3", studentId: "u-brian", courseId: "c-math9", amount: 450, method: "card", status: "completed", reference: "SGK9D4WM1S", date: ago(35) },
      { id: "pay-4", studentId: "u-kiptoo", courseId: "c-math9", amount: 450, method: "mpesa", status: "completed", reference: "SGB2R6TN8V", phone: "+254 745 555 025", date: ago(66) },
      { id: "pay-5", studentId: "u-zawadi", courseId: "c-math9", amount: 450, method: "mpesa", status: "completed", reference: "SGF5H1JC3W", phone: "+254 745 555 024", date: ago(60) },
      { id: "pay-6", studentId: "u-brian", courseId: "c-bus1", amount: 350, method: "mpesa", status: "pending", reference: "SGQ8Y3ZA5X", phone: "+254 745 555 021", date: ago(1) },
      { id: "pay-7", studentId: "u-wairimu", courseId: "c-eng", amount: 500, method: "mpesa", status: "failed", reference: "SGT1U9BD7Z", phone: "+254 745 555 022", date: ago(3) },
    ],

    announcements: [
      { id: "ann-1", title: "Term 1 2026 Examination Timetable Released", content: "The end-of-term examination timetable is now available. Mathematics sits on Tuesday 08:00, English Wednesday, Sciences Friday. Revision clinics run daily 4–5 PM this fortnight. Log in early on exam days — papers open 10 minutes before start time.", audience: "all-students", authorId: "u-admin", publishedAt: ago(3), pinned: true },
      { id: "ann-2", title: "New: Computer Science Grade 9 — Programming Foundations", content: "Mr. Mutua's brand-new programming course is live: algorithms, flowcharts and your first Python programs. Free for all Grade 9 learners this term. Enrol from the Courses page.", audience: "everyone", authorId: "u-admin", publishedAt: ago(6) },
      { id: "ann-3", title: "JSS Science Fair — submit your project", content: "Grade 7–9 learners: the inter-school Science Fair is on 28 March. Submit a one-page project proposal (mixtures, soils or energy) via your science teacher by next Friday. Top three projects present at the county fair.", audience: "course", audienceRef: "c-sci7", authorId: "u-otieno", publishedAt: ago(2) },
      { id: "ann-4", title: "Parents' Day — Saturday 28 March", content: "You are invited to Parents' Day from 9 AM. We will share term progress reports, demonstrate the parent dashboard, and hold one-on-one consultations with subject teachers.", audience: "parents", authorId: "u-admin", publishedAt: ago(8) },
    ],

    notifications: [
      { id: "nt-1", userId: "u-amina", title: "Assignment due in 5 days", body: "Linear Equations Problem Set is due soon. Show full working for method marks.", kind: "assignment", read: false, createdAt: ago(1), link: "/app/assignments" },
      { id: "nt-2", userId: "u-amina", title: "Result released", body: "Your Insha mark (17/20) has been published with teacher feedback.", kind: "result", read: false, createdAt: ago(2), link: "/app/results" },
      { id: "nt-3", userId: "u-amina", title: "Exam timetable posted", body: "Term 1 2026 examination timetable is now available.", kind: "announcement", read: true, createdAt: ago(3), link: "/app/dashboard" },
      { id: "nt-4", userId: "u-brian", title: "Payment pending", body: "Your M-Pesa payment of KSh 350 for Business Studies Form 1 is awaiting confirmation.", kind: "payment", read: false, createdAt: ago(1) },
      { id: "nt-5", userId: "u-wairimu", title: "Course completed 🎓", body: "You completed Grade 7 Integrated Science: Mixtures & Separation. Outstanding work!", kind: "course", read: true, createdAt: ago(9), link: "/app/progress" },
      { id: "nt-6", userId: "u-juma", title: "Wednesday maths clinic", body: "Ms. Wanjiku invites you to the algebra clinic — Wednesdays 4 PM.", kind: "system", read: false, createdAt: ago(2) },
    ],

    bookmarks: [
      { id: "bk-1", userId: "u-amina", type: "resource", refId: "r-mathrev", createdAt: ago(10) },
      { id: "bk-2", userId: "u-amina", type: "lesson", refId: "l-a5", createdAt: ago(8) },
      { id: "bk-3", userId: "u-amina", type: "resource", refId: "r-plan", createdAt: ago(4) },
    ],

    achievementDefs: [
      { id: "ach-first", name: "First Steps", description: "Completed your very first lesson.", icon: "first" },
      { id: "ach-ace", name: "Quiz Ace", description: "Passed your first quiz.", icon: "ace" },
      { id: "ach-streak", name: "Momentum", description: "Completed 10 lessons across your courses.", icon: "streak" },
      { id: "ach-half", name: "Halfway Hero", description: "Reached 50% in a course.", icon: "half" },
      { id: "ach-grad", name: "Course Graduate", description: "Completed an entire course.", icon: "grad" },
      { id: "ach-book", name: "Curious Collector", description: "Bookmarked 5 lessons or resources.", icon: "book" },
    ],

    earned: [
      { id: "ea-1", studentId: "u-amina", defId: "ach-first", earnedAt: ago(40) },
      { id: "ea-2", studentId: "u-amina", defId: "ach-ace", earnedAt: ago(2) },
      { id: "ea-3", studentId: "u-wairimu", defId: "ach-first", earnedAt: ago(70) },
      { id: "ea-4", studentId: "u-wairimu", defId: "ach-grad", earnedAt: ago(9) },
      { id: "ea-5", studentId: "u-wairimu", defId: "ach-half", earnedAt: ago(48) },
    ],

    audit: [
      { id: "au-1", userId: "u-admin", userName: "Susan Kamande", action: "publish_announcement", entity: "announcement", details: "Published 'Term 1 2026 Examination Timetable Released'", date: ago(3) },
      { id: "au-2", userId: "u-wanjiku", userName: "Grace Wanjiku", action: "grade_submission", entity: "submission", details: "Graded Amina Yusuf — Insha: Siku ya Masoko (17/20)", date: ago(2) },
      { id: "au-3", userId: "u-mutua", userName: "Peter Mutua", action: "create_course", entity: "course", details: "Created 'Computer Science Grade 9: Programming Foundations'", date: ago(60) },
      { id: "au-4", userId: "u-admin", userName: "Susan Kamande", action: "confirm_payment", entity: "payment", details: "M-Pesa SGM4T8XK2Q — KSh 500 (Zawadi Mumbua)", date: ago(12) },
      { id: "au-5", userId: "u-achieng", userName: "Mercy Achieng'", action: "release_results", entity: "result", details: "Released Grammar Clinic Test results (6 learners)", date: ago(6) },
      { id: "au-6", userId: "u-admin", userName: "Susan Kamande", action: "update_user", entity: "user", details: "Deactivated trial account trial@ssgt.ac.ke", date: ago(15) },
    ],

    contacts: [
      { id: "ct-1", name: "David Rono", email: "d.rono@gmail.com", phone: "+254 722 118 442", subject: "School partnership", message: "Hello — I am the deputy principal at Kapsoet JSS. We would like to enrol our Grade 7–9 cohort on SSGT. Could we get a school account quote?", date: ago(2), read: false },
      { id: "ct-2", name: "Faith Wambui", email: "faithw@outlook.com", phone: "+254 710 993 221", subject: "Payment question", message: "I paid via M-Pesa yesterday but my daughter's course still shows pending. Reference SGQ8Y3ZA5X. Kindly assist.", date: ago(1), read: false },
    ],

    emails: [
      { id: "em-1", to: "student@ssgt.ac.ke", template: "enrollment-confirmation", subject: "You're enrolled: Grade 8 Mathematics", date: ago(45) },
      { id: "em-2", to: "zawadi@ssgt.ac.ke", template: "payment-receipt", subject: "Receipt: KSh 500 — KCSE English Paper 1", date: ago(12) },
    ],

    settings: {
      // Official academy identity — the single source of truth for contact
      // details rendered across the public site, dashboards and admin panel.
      academyName: "School Smart Guide Tutors",
      logo: "built-in", // brand mark is the inline SVG <Logo/> component
      contactEmail: "schoolsmartguidetutors@gmail.com",
      contactPhone: "0112866660",
      address: "", // configurable — leave empty until an official address is provided
      socials: { facebook: "", x: "", youtube: "", whatsapp: "" }, // configurable — filled in once official links are provided
      featuredCourseIds: ["c-math8", "c-sci7", "c-cs9", "c-eng"],
      registrationOpen: true,
      testimonials: [
        { id: "ts-1", name: "Hassan Yusuf", role: "Parent — Nairobi", quote: "Amina moved from a C+ to a B+ average in one term. I can see every quiz score and assignment on my phone before she even tells me.", color: "#A84625" },
        { id: "ts-2", name: "Wairimu Njoroge", role: "Grade 7 learner — Nakuru", quote: "The quizzes tell me immediately what I got wrong and why. It feels like a patient teacher sitting next to me at night.", color: "#B56508" },
        { id: "ts-3", name: "Grace Wanjiku", role: "Mathematics teacher — Kiambu", quote: "I manage three courses and marking used to eat my weekends. Now submissions queue themselves and results publish with one click.", color: "#0C5A43" },
      ],
      faqs: [
        { id: "fq-1", q: "Is SSGT aligned with the Kenyan curriculum?", a: "Yes. Courses are mapped to CBC (Grade 1–12 pathways) and 8-4-4 (KCSE revision). Every course shows its curriculum, level and grade, and administrators can extend the catalogue as KICD updates the curriculum." },
        { id: "fq-2", q: "How do I pay for paid courses?", a: "Paid courses support M-Pesa (STK push to your phone) and card payments. Your enrolment activates automatically once payment confirms, and a receipt is saved to your payment history. We never store card numbers." },
        { id: "fq-3", q: "Can parents monitor their child's progress?", a: "Parents create an account and link learners using the student's SSGT code (e.g. SSGT-1001). Linked parents see courses, progress, results, assignments and payment history — nothing else on the platform." },
        { id: "fq-4", q: "Do learners get certificates?", a: "Learners build a verifiable progress record: completed lessons, quiz scores and course completion. Teachers and administrators can export results for official school reporting." },
        { id: "fq-5", q: "What devices does it work on?", a: "SSGT is mobile-first — most learners use Android phones on modest bundles. Pages are lightweight, images are optimised, and dashboards work on any modern browser on phone, tablet or computer." },
        { id: "fq-6", q: "Can teachers build their own courses?", a: "Yes. Teacher accounts can create courses, modules, lessons, quizzes and assignments, grade submissions, and publish announcements to their classes — with full audit trails." },
      ],
    },
  };
}
