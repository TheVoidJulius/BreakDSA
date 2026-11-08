# BreakDSA

BreakDSA brings DSA lessons, deliberate practice, visual explanations, and a course-grounded tutor into one study workspace.

## What’s included

- **Learn:** six concise lessons covering complexity, arrays and hash maps, stacks and queues, binary search, sorting, and linked lists, with private per-topic notes.
- **Practice:** six original multiple-choice challenges with progressive hints, explanations, and completion tracking.
- **Visualize:** step, play, pause, adjust speed, and reset bubble sort, binary search, stack, and queue visualizations. The app does not execute user-submitted code.
- **Tutor:** a streaming AI tutor grounded in BreakDSA course notes, with local course-grounded replies when no AI key is configured.
- **Progress:** completed lessons, solved challenges, private study notes, and study streak stored locally in the current browser.

This is an early, usable product slice—not a claim of a complete DSA curriculum. There are no accounts, cloud sync, code judge, or saved tutor conversations yet.

## Requirements

- Node.js 20.9 or later
- Yarn 1 (Classic)
- Optional: a Groq API key for live AI tutoring

## Run locally

From the repository root:

```powershell
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000). Without an API key the tutor uses the local lesson notes; the rest of the app works offline. This mode is deterministic course content, not a local AI model.

## Enable live AI tutoring

BreakDSA uses Groq’s OpenAI-compatible chat-completions API and defaults to **[`openai/gpt-oss-20b`](https://console.groq.com/docs/model/openai/gpt-oss-20b)**, a model documented by Groq for reasoning and coding workloads.

1. Create a Groq account and generate an API key at [console.groq.com/keys](https://console.groq.com/keys).
2. Copy the example environment file:

   ```powershell
   Copy-Item .env.example .env.local
   ```

3. Add the key to `.env.local`:

   ```dotenv
   GROQ_API_KEY=your-server-side-key
   GROQ_MODEL=openai/gpt-oss-20b
   ```

4. Restart the development server and open **AI tutor**. After a response, the tutor status indicates when it used Groq.

The Groq model ID can be changed to another model available to your account. Free-tier model availability, rate limits, and quotas can vary by model and account and may change; check the current [Groq model catalog](https://console.groq.com/docs/models) and [rate limits](https://console.groq.com/docs/rate-limits). A free tier is not an unlimited service guarantee.

The key is only read by the Next.js server. Do not expose it in browser code, use a `NEXT_PUBLIC_` prefix, or commit `.env.local`. Groq says inference inputs and outputs are not retained by default, but may be temporarily logged for reliability or abuse investigations for up to 30 days. Avoid entering sensitive or confidential information. See [Groq data controls](https://console.groq.com/docs/your-data).

## Use BreakDSA

- Choose **Learn** to browse or search course notes, add private notes to a topic, and mark a lesson learned when you finish it.
- Choose **Practice** to work through a question. Request hints one at a time, select an answer, and check it to see the explanation.
- Choose **Visualize** to select a structure or algorithm. Use the timeline, speed menu, step, play, pause, or reset controls.
- Choose **AI tutor** to ask about a selected lesson. If no Groq key is configured, answers come from the local course notes.
- Open **Study record** to see completed lessons, solved challenges, and your current study streak. Progress is kept in this browser only.

## Build and validate

```powershell
yarn typecheck
yarn build
yarn start
```

The tutor endpoint is a Next.js server route and streams responses. For hosting, use a Node.js host that supports Next.js route handlers and streaming; set `GROQ_API_KEY` and optionally `GROQ_MODEL` as server-side environment variables in the host’s secret manager. This app has no user authentication or distributed rate limiting yet, so configure host-level API rate limits before making a public deployment.
