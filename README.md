<div align="center">

# 🎮 BreakDSA

### Big problems. Small wins.

**A colorful little arcade for learning the ideas behind data structures and algorithms.**

Learn a concept. Take a shot at a challenge. Watch an algorithm think out loud.
Bring questions to your study buddy, Byte.

<br />

![Next.js](https://img.shields.io/badge/Next.js-15-171923?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-315edb?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-ef668e?style=for-the-badge&logo=typescript&logoColor=white)

**Six lessons · Six practice questions · Four interactive visualizers · One encouraging robot**

</div>

---

## 🕹️ Welcome to the arcade

BreakDSA turns a big, intimidating subject into a series of smaller things you can actually do. It brings lessons, practice, algorithm visualizations, personal notes, progress tracking, and a course-grounded tutor together in one browser-based study space.

It’s designed to make it easier to **start**, stay curious, and notice your progress—not to bury you in a giant list of topics.

```text
       .---------------------------.
       |  BREAKDSA                 |
       |                           |
       |    LEARN  ->  TRY  ->  SEE |
       |       \       |      /    |
       |        \      v     /     |
       |          LEVEL UP!         |
       '---------------------------'
```

## ✨ Pick your next level

| Arcade station | What you can do |
|---|---|
| 📚 **Learn** | Explore six concise lessons: complexity, arrays and hash maps, stacks and queues, binary search, sorting, and linked lists. Search and filter the library, keep notes for each topic, and mark lessons as learned. |
| 🎯 **Practice** | Work through six original multiple-choice DSA questions. Reveal hints one at a time, check your answer, and learn from the explanation. The dashboard mini-mission points to your next unsolved question. |
| 🔬 **Visualize** | Play through bubble sort, binary search, a stack, and a queue. Step or play the animation, adjust its speed, scrub the timeline, and reset whenever you want. |
| 💬 **Ask Byte’s study partner** | Ask a question about a selected lesson. With a Groq API key, replies stream from the configured model; without one, the app provides a deterministic answer from local course notes. |
| 🏆 **Study record** | See lessons completed, questions solved, your study streak, and your overall progress. Your record stays in this browser. |

### Meet Byte 🤖

Byte is the cheerful little robot hanging out on the overview screen. Tap the character for a fresh boost, check out the next mini-mission, and jump straight into the next unsolved challenge. Byte’s expressions are there for encouragement—not to grade your code.

## 🚀 Start a run

### You’ll need

- [Node.js](https://nodejs.org/) 20.9 or later
- [Yarn Classic](https://classic.yarnpkg.com/) 1.x
- A [Groq API key](https://console.groq.com/keys) only if you want live AI tutoring

### Power up locally

```powershell
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) and choose a station. The lessons, practice set, visualizers, and local progress work without an AI key.

### Optional: activate live tutoring

1. Make a copy of the example environment file:

   ```powershell
   Copy-Item .env.example .env.local
   ```

2. Add your Groq key to `.env.local`:

   ```dotenv
   GROQ_API_KEY=your-server-side-key
   GROQ_MODEL=openai/gpt-oss-20b
   ```

3. Restart the development server and open **AI tutor**.

The default model is Groq’s [`openai/gpt-oss-20b`](https://console.groq.com/docs/model/openai/gpt-oss-20b). Model access and free-tier quotas can vary; check Groq’s [model catalog](https://console.groq.com/docs/models) and [rate limits](https://console.groq.com/docs/rate-limits).

> 🔐 Keep `.env.local` private. The key is used on the server and must never be exposed in browser code or committed. Groq says inference data is not retained by default, but may be temporarily logged for reliability or abuse investigations for up to 30 days. Don’t send sensitive information; see [Groq data controls](https://console.groq.com/docs/your-data).

## 🧭 How a learning run works

1. **Pick a lesson** and build a mental model of one concept.
2. **Write a note** about the part you want to remember.
3. **Try the matching question**—use a hint if you need a nudge.
4. **Watch the visualization** to see how values or pointers change.
5. **Ask the tutor** for another explanation or example.
6. **Come back tomorrow** and keep your streak alive.

There’s no timer, ranking, or punishment for getting something wrong. The aim is to build understanding one useful step at a time.

## 🎨 The look and feel

BreakDSA’s interface takes inspiration from playful illustrated arcade and event pages: sunny yellow, electric blue, bubblegum pink, chunky outlines, sticker-like panels, dotted backdrops, and bouncy details.

The home screen acts like a cabinet front: progress indicators, Byte, and a next-step mission invite you in. Each study area is still organized around doing the work—reading, answering, tracing, or asking—rather than navigating a maze of decoration. Motion respects the system’s reduced-motion preference.

## 🧰 Under the hood

- **Next.js 15** App Router, **React 19**, and **TypeScript**
- Local lesson and challenge content in `src/data/course.ts`
- Browser `localStorage` for progress, notes, and study dates
- A streaming Next.js tutor route with Groq integration and a local lesson-notes fallback
- No accounts, cloud sync, user-code execution, or code judge

Run the checks and production server:

```powershell
yarn typecheck
yarn build
yarn start
```

For hosting, use a Node.js host that supports Next.js route handlers and streaming. Add `GROQ_API_KEY` and, optionally, `GROQ_MODEL` through the host’s server-side secret settings. There is no user authentication or distributed rate limiting yet; configure host-level limits before making the tutor endpoint public.

## 📦 Scope, sources, and what’s next

This repository currently includes **six original practice questions**, not the 500-question Striver Sheet. It does not reproduce Striver Sheet problem statements or editorials. A future expanded question catalog can link to original problem sources while keeping BreakDSA’s notes and learning material original, unless reuse permission or a suitable license is available.

This is a usable learning workspace and a growing project—not a complete DSA curriculum. Accounts, cloud-synced progress, saved tutor conversations, a code judge, and a large problem bank are not included yet.

---

<div align="center">

### Made for the next small win. 💛

**Think it. Trace it. Solve it.**

</div>
