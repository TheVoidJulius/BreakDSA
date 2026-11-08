import { NextRequest } from "next/server";
import { getTopic, topics } from "@/data/course";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const encoder = new TextEncoder();
const maxMessageLength = 4_000;
const maxHistoryLength = 10;

function event(eventName: string, data: unknown) {
  return encoder.encode(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`);
}

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function parseMessages(value: unknown): ChatMessage[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > maxHistoryLength) return null;
  const parsed: ChatMessage[] = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null || !("role" in item) || !("content" in item)) return null;
    if (
      (item.role !== "user" && item.role !== "assistant") ||
      typeof item.content !== "string" ||
      !item.content.trim() ||
      item.content.length > maxMessageLength
    ) return null;
    parsed.push({ role: item.role, content: item.content.trim() });
  }
  return parsed.at(-1)?.role === "user" ? parsed : null;
}

function findRelevantTopics(query: string, topicId: string) {
  const stopWords = new Set([
    "and", "are", "before", "can", "does", "for", "how", "into", "its", "must",
    "not", "the", "this", "true", "use", "using", "what", "when", "where", "with",
    "you",
  ]);
  const words = query.toLowerCase().match(/[a-z0-9+#]+/g) ?? [];
  const meaningfulWords = new Set(words.filter((word) => word.length > 2 && !stopWords.has(word)));
  const ranked = topics
    .map((topic) => {
      const title = topic.title.toLowerCase();
      const searchable = [topic.summary, ...topic.lesson, ...topic.takeaways, topic.complexity].join(" ").toLowerCase();
      const titleMatches = [...meaningfulWords].filter((word) => title.includes(word)).length;
      const contentMatches = [...meaningfulWords].filter((word) => searchable.includes(word)).length;
      const score = titleMatches * 3 + contentMatches;
      return { topic, score, titleMatches, contentMatches };
    })
    .sort((left, right) => right.score - left.score);
  const matched = ranked
    .filter((item) => item.titleMatches > 0 || item.contentMatches >= 3)
    .slice(0, 3)
    .map((item) => item.topic);
  return matched.length > 0 ? matched : [getTopic(topicId) ?? topics[0]];
}

function topicContext(selected: ReturnType<typeof findRelevantTopics>[number]) {
  return [
    `Topic: ${selected.title}`,
    `Summary: ${selected.summary}`,
    `Complexity: ${selected.complexity}`,
    ...selected.lesson,
    `Key takeaways: ${selected.takeaways.join(" ")}`,
  ].join("\n");
}

function localReply(question: string, relevant: ReturnType<typeof findRelevantTopics>) {
  const primary = relevant[0];
  const normalized = question.toLowerCase();
  const focus = normalized.includes("hint") || normalized.includes("stuck")
    ? `Try this first: identify the input size and the operation that repeats. In ${primary.title}, ask yourself: ${primary.takeaways[0].toLowerCase()}`
    : `${primary.summary}\n\n${primary.lesson[0]}`;
  const second = primary.lesson[1] ? `\n\nA useful next step: ${primary.lesson[1]}` : "";
  const related = relevant.length > 1
    ? `\n\nRelated lesson: ${relevant[1].title} — ${relevant[1].summary}`
    : "";
  return `I’m answering from the local BreakDSA course notes (offline mode).\n\n${focus}${second}\n\n**Complexity:** ${primary.complexity}${related}\n\n**Source:** [${primary.title}]\n\nFor a conversational AI response, add a Groq API key in the server environment.`;
}

function groqConfiguration() {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) return null;
  return {
    apiKey,
    model: process.env.GROQ_MODEL?.trim() || "openai/gpt-oss-20b",
  };
}

function tutorInstructions(relevant: ReturnType<typeof findRelevantTopics>) {
  const references = relevant.map(topicContext).join("\n\n---\n\n");
  return `You are BreakDSA, a patient data-structures-and-algorithms tutor. Help learners reason step by step, with concise explanations and examples. Prefer a small hint before revealing a full solution unless the learner asks directly. Never claim that code was run.

Ground your DSA explanations in the course reference material below. Cite the relevant topic by its exact title in square brackets, such as [Binary search]. If the reference material does not cover a detail, say so plainly before offering clearly labeled general guidance. Do not invent a source or claim the course says something it does not.

COURSE REFERENCE MATERIAL:
${references}`;
}

async function pipeGroq(
  enqueue: (name: string, data: unknown) => void,
  signal: AbortSignal,
  messages: ChatMessage[],
  relevant: ReturnType<typeof findRelevantTopics>,
  configuration: NonNullable<ReturnType<typeof groqConfiguration>>,
) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${configuration.apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: configuration.model,
      messages: messages.map((message, index) => index === messages.length - 1
        ? {
            ...message,
            content: `${tutorInstructions(relevant)}\n\nLEARNER QUESTION:\n${message.content}`,
          }
        : message),
      stream: true,
      temperature: 0.6,
      max_completion_tokens: 1_500,
      reasoning_effort: "medium",
      reasoning_format: "hidden",
    }),
    signal,
    cache: "no-store",
  });

  if (!response.ok || !response.body) {
    console.error("Groq tutor request failed:", response.status, response.statusText);
    enqueue("error", {
      message: `Groq returned HTTP ${response.status}. Check the server logs, API key, model name, and available quota.`,
    });
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const consumeFrame = (frame: string) => {
    for (const line of frame.split("\n")) {
      if (!line.startsWith("data:")) continue;
      const rawData = line.slice(5).trim();
      if (!rawData || rawData === "[DONE]") continue;
      try {
        const payload: unknown = JSON.parse(rawData);
        if (
          typeof payload === "object" &&
          payload !== null &&
          "choices" in payload &&
          Array.isArray(payload.choices)
        ) {
          const choice: unknown = payload.choices[0];
          if (
            typeof choice === "object" &&
            choice !== null &&
            "delta" in choice &&
            typeof choice.delta === "object" &&
            choice.delta !== null &&
            "content" in choice.delta &&
            typeof choice.delta.content === "string"
          ) enqueue("token", { text: choice.delta.content });
        }
      } catch {
        console.error("Groq returned an invalid tutor stream event.");
        enqueue("error", { message: "The AI provider returned an invalid stream event." });
      }
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value, { stream: !done }).replace(/\r\n/g, "\n");
    let boundary = buffer.indexOf("\n\n");
    while (boundary !== -1) {
      consumeFrame(buffer.slice(0, boundary));
      buffer = buffer.slice(boundary + 2);
      boundary = buffer.indexOf("\n\n");
    }
    if (done) break;
  }
  if (buffer.trim()) consumeFrame(buffer);
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Request body must be valid JSON.", 400);
  }

  if (typeof body !== "object" || body === null || !("topicId" in body) || typeof body.topicId !== "string" || !getTopic(body.topicId)) {
    return errorResponse("Choose a valid BreakDSA topic.", 400);
  }
  const messages = parseMessages("messages" in body ? body.messages : undefined);
  if (!messages) {
    return errorResponse(
      `Send 1–${maxHistoryLength} user/assistant messages, ending with a non-empty user message of at most ${maxMessageLength} characters.`,
      400,
    );
  }

  const relevant = findRelevantTopics(messages.at(-1)?.content ?? "", body.topicId);
  const configuration = groqConfiguration();
  const controller = new AbortController();
  const abortFromRequest = () => controller.abort(request.signal.reason);
  request.signal.addEventListener("abort", abortFromRequest, { once: true });
  let cancelled = false;

  const stream = new ReadableStream<Uint8Array>({
    async start(streamController) {
      const enqueue = (name: string, data: unknown) => {
        if (!cancelled && !controller.signal.aborted) streamController.enqueue(event(name, data));
      };
      try {
        enqueue("meta", { provider: configuration ? "groq" : "offline" });
        if (configuration) {
          await pipeGroq(enqueue, controller.signal, messages, relevant, configuration);
        } else {
          const reply = localReply(messages.at(-1)?.content ?? "", relevant);
          for (const word of reply.match(/\S+\s*/g) ?? []) {
            if (controller.signal.aborted) break;
            enqueue("token", { text: word });
            await new Promise((resolve) => setTimeout(resolve, 12));
          }
        }
        enqueue("done", { ok: true });
      } catch (cause) {
        if (!controller.signal.aborted) {
          console.error("BreakDSA tutor stream failed:", cause);
          enqueue("error", { message: "The tutor stream failed. Check the server logs and provider settings." });
        }
      } finally {
        request.signal.removeEventListener("abort", abortFromRequest);
        if (!cancelled) streamController.close();
      }
    },
    cancel() {
      cancelled = true;
      controller.abort();
      request.signal.removeEventListener("abort", abortFromRequest);
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    },
  });
}
