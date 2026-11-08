"use client";

import { FormEvent, useState } from "react";
import { getTopic, topics } from "@/data/course";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type EventPayload =
  | { type: "meta"; provider: "groq" | "offline" }
  | { type: "token"; text: string }
  | { type: "error"; message: string }
  | { type: "done" };

function parseEvent(frame: string): EventPayload | null {
  const eventName = frame.split("\n").find((line) => line.startsWith("event:"))?.slice(6).trim();
  const data = frame.split("\n").find((line) => line.startsWith("data:"))?.slice(5).trim();
  if (!eventName || !data) return null;
  try {
    const payload: unknown = JSON.parse(data);
    if (typeof payload !== "object" || payload === null) return null;
    if (eventName === "meta" && "provider" in payload && (payload.provider === "groq" || payload.provider === "offline")) {
      return { type: "meta", provider: payload.provider };
    }
    if (eventName === "token" && "text" in payload && typeof payload.text === "string") {
      return { type: "token", text: payload.text };
    }
    if (eventName === "error" && "message" in payload && typeof payload.message === "string") {
      return { type: "error", message: payload.message };
    }
    if (eventName === "done") return { type: "done" };
  } catch {
    return null;
  }
  return null;
}

export default function Tutor({
  topicId,
  onTopicChange,
}: {
  topicId: string;
  onTopicChange: (topicId: string) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [provider, setProvider] = useState<"groq" | "offline" | null>(null);
  const activeTopic = getTopic(topicId);

  const send = async (prompt: string) => {
    const clean = prompt.trim();
    if (!clean || busy) return;
    const next = [...messages, { role: "user" as const, content: clean }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setError("");
    setBusy(true);

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-10), topicId }),
      });
      if (!response.ok) {
        const payload = await response.json() as { error?: string };
        throw new Error(payload.error || `Tutor request failed (${response.status}).`);
      }
      if (!response.body) throw new Error("The tutor response stream is unavailable.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamError = "";
      const consume = (rawFrame: string) => {
        const event = parseEvent(rawFrame);
        if (!event) return;
        if (event.type === "meta") setProvider(event.provider);
        if (event.type === "error") streamError = event.message;
        if (event.type === "token") {
          setMessages((current) => {
            const updated = [...current];
            const last = updated.at(-1);
            if (last?.role === "assistant") {
              updated[updated.length - 1] = { ...last, content: last.content + event.text };
            }
            return updated;
          });
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value, { stream: !done }).replace(/\r\n/g, "\n");
        let boundary = buffer.indexOf("\n\n");
        while (boundary !== -1) {
          consume(buffer.slice(0, boundary));
          buffer = buffer.slice(boundary + 2);
          boundary = buffer.indexOf("\n\n");
        }
        if (done) break;
      }
      if (buffer.trim()) consume(buffer);
      if (streamError) throw new Error(streamError);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The tutor request failed.");
      setMessages((current) => current.at(-1)?.content ? current : current.slice(0, -1));
    } finally {
      setBusy(false);
    }
  };

  const starters = activeTopic
    ? [
        `Explain ${activeTopic.title} with a simple example.`,
        `What are common mistakes with ${activeTopic.title}?`,
        `Give me a small practice question about ${activeTopic.title}.`,
      ]
    : [
        "How do I choose between a stack and a queue?",
        "Explain binary search with an example.",
        "How should I think about time complexity?",
      ];

  return (
    <section className="view-section tutor-view" aria-labelledby="tutor-title">
      <div className="section-heading">
        <div>
          <p className="section-kicker">GROUNDED STUDY PARTNER</p>
          <h1 id="tutor-title">Let’s work it out.</h1>
          <p className="section-description">Ask for an explanation, a nudge, or a fresh example. The tutor uses the BreakDSA lesson notes as its reference.</p>
        </div>
        <div className="tutor-heading-actions">
          {messages.length > 0 && (
            <button className="button button-quiet" type="button" disabled={busy} onClick={() => { setMessages([]); setError(""); }}>
              New conversation
            </button>
          )}
          <span className={`tutor-provider ${provider === "groq" ? "live" : ""}`}>
            <span />{provider === "groq" ? "Groq · live" : "Course-grounded"}
          </span>
        </div>
      </div>

      <div className="tutor-workspace">
        <div className="tutor-context">
          <p className="panel-overline">STUDY CONTEXT</p>
          <label htmlFor="tutor-topic">Current topic</label>
          <select
            id="tutor-topic"
            value={topicId}
            onChange={(event) => onTopicChange(event.target.value)}
          >
            {topics.map((topic) => <option value={topic.id} key={topic.id}>{topic.title}</option>)}
          </select>
          <div className="context-note">
            <span className="context-mark" aria-hidden="true">⌁</span>
            <p>Answers are grounded in the selected lesson. If a detail isn’t covered there, the tutor should say so.</p>
          </div>
          <div className="tutor-privacy">
            <span aria-hidden="true">◇</span>
            <p>Without an API key, replies come from local lesson notes. With Groq configured, prompts are sent to its API; avoid sharing sensitive information.</p>
          </div>
        </div>

        <div className="tutor-chat">
          {messages.length === 0 ? (
            <div className="tutor-empty">
              <span className="tutor-empty-icon" aria-hidden="true">✳</span>
              <h2>Start with a question.</h2>
              <p>Try one of these to get moving.</p>
              <div className="tutor-starters">
                {starters.map((starter) => (
                  <button type="button" key={starter} disabled={busy} onClick={() => void send(starter)}>
                    {starter}<span aria-hidden="true">↗</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="tutor-messages" aria-live="polite">
              {messages.map((message, index) => (
                <article className={`tutor-message ${message.role}`} key={`${index}-${message.role}`}>
                  <span className="tutor-message-avatar" aria-hidden="true">{message.role === "assistant" ? "B" : "Y"}</span>
                  <div><p className="panel-overline">{message.role === "assistant" ? "BREAKDSA TUTOR" : "YOU"}</p><p className="tutor-message-content">{message.content || (busy && index === messages.length - 1 ? "Thinking…" : "")}</p></div>
                </article>
              ))}
            </div>
          )}
          {error && <div className="tutor-error" role="alert">{error}</div>}
          <form
            className="tutor-composer"
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              void send(input);
            }}
          >
            <label className="sr-only" htmlFor="tutor-prompt">Ask the BreakDSA tutor</label>
            <textarea
              id="tutor-prompt"
              rows={2}
              maxLength={4000}
              placeholder="Ask a question or describe where you’re stuck…"
              value={input}
              disabled={busy}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void send(input);
                }
              }}
            />
            <div className="tutor-composer-bottom">
              <span>Enter to send · Shift + Enter for a new line</span>
              <button type="submit" className="button button-primary" disabled={busy || !input.trim()}>
                {busy ? "Thinking…" : "Ask tutor"} <span aria-hidden="true">↑</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
