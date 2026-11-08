"use client";

import { useState } from "react";
import { topics, type Topic } from "@/data/course";

type Props = {
  completedTopicIds: string[];
  notesByTopic: Record<string, string>;
  onComplete: (topicId: string) => void;
  onNoteChange: (topicId: string, note: string) => void;
  onTutor: (topicId: string) => void;
};

function TopicCard({
  topic,
  complete,
  onClick,
}: {
  topic: Topic;
  complete: boolean;
  onClick: () => void;
}) {
  return (
    <button className="topic-card" type="button" onClick={onClick}>
      <div className="topic-card-top">
        <span className="topic-category">{topic.area}</span>
        <span className={`topic-check ${complete ? "complete" : ""}`} aria-label={complete ? "Completed" : "Not completed"}>
          {complete ? "✓" : "↗"}
        </span>
      </div>
      <h3>{topic.title}</h3>
      <p>{topic.summary}</p>
      <div className="topic-card-bottom">
        <span>{topic.level}</span><span>{topic.duration}</span>
      </div>
    </button>
  );
}

export default function Learn({
  completedTopicIds,
  notesByTopic = {},
  onComplete,
  onNoteChange,
  onTutor,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("All");
  const selectedTopic = topics.find((topic) => topic.id === selectedId);
  const filteredTopics = topics.filter((topic) =>
    `${topic.title} ${topic.area} ${topic.summary}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  if (selectedTopic) {
    const complete = completedTopicIds.includes(selectedTopic.id);
    return (
      <section className="view-section learn-view" aria-labelledby="topic-title">
        <button className="back-link" type="button" onClick={() => setSelectedId(null)}>
          <span aria-hidden="true">←</span> Course library
        </button>
        <header className="lesson-header">
          <div>
            <p className="section-kicker">{selectedTopic.area.toUpperCase()} · {selectedTopic.duration.toUpperCase()}</p>
            <h1 id="topic-title">{selectedTopic.title}</h1>
            <p className="section-description">{selectedTopic.summary}</p>
          </div>
          <span className="complexity-badge">{selectedTopic.complexity}</span>
        </header>

        <div className="lesson-layout">
          <article className="lesson-copy">
            <p className="panel-overline">THE IDEA</p>
            {selectedTopic.lesson.map((paragraph, index) => (
              <p className="lesson-paragraph" key={index}>{paragraph}</p>
            ))}
            <div className="takeaway-card">
              <p className="panel-overline">KEEP IN MIND</p>
              <ul>
                {selectedTopic.takeaways.map((takeaway) => <li key={takeaway}>{takeaway}</li>)}
              </ul>
            </div>
          </article>
          <div className="lesson-side">
            <aside className="code-card">
              <div className="code-card-header"><span>EXAMPLE</span><span>TypeScript</span></div>
              <pre><code>{selectedTopic.code}</code></pre>
              <div className="code-card-footer">Read through the example, then try a related challenge.</div>
            </aside>
            <section className="notes-card" aria-labelledby="notes-title">
              <div className="notes-heading">
                <div><p className="panel-overline">YOUR STUDY NOTES</p><h2 id="notes-title">Make it yours.</h2></div>
                <span>Saved on this device</span>
              </div>
              <label className="sr-only" htmlFor="topic-notes">Personal notes for {selectedTopic.title}</label>
              <textarea
                id="topic-notes"
                maxLength={5_000}
                placeholder="Write down a question, a useful pattern, or what you want to remember…"
                value={notesByTopic[selectedTopic.id] ?? ""}
                onChange={(event) => onNoteChange(selectedTopic.id, event.target.value)}
              />
              <div className="notes-footer"><span>Notes are private to this browser.</span><span>{(notesByTopic[selectedTopic.id] ?? "").length} / 5000</span></div>
            </section>
          </div>
        </div>

        <div className="lesson-actions">
          <button
            className="button button-quiet"
            type="button"
            onClick={() => onTutor(selectedTopic.id)}
          >
            Ask the tutor <span aria-hidden="true">↗</span>
          </button>
          <button
            className="button button-primary"
            type="button"
            onClick={() => onComplete(selectedTopic.id)}
          >
            {complete ? "Completed ✓" : "Mark as learned"}
          </button>
        </div>
      </section>
    );
  }

  const areas = ["All", ...new Set(topics.map((topic) => topic.area))];
  const visibleTopics = filteredTopics.filter((topic) => area === "All" || topic.area === area);

  return (
    <section className="view-section learn-view" aria-labelledby="learn-title">
      <div className="section-heading">
        <div>
          <p className="section-kicker">LEARNING PATH</p>
          <h1 id="learn-title">Build the foundations.</h1>
          <p className="section-description">Short lessons designed to make the reasoning stick.</p>
        </div>
        <div className="completion-summary">{completedTopicIds.length} / {topics.length} complete</div>
      </div>
      <div className="library-toolbar">
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <span className="sr-only">Search lessons</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search concepts" />
          {query && <button type="button" aria-label="Clear search" onClick={() => setQuery("")}>×</button>}
        </label>
        <div className="filter-tabs" role="group" aria-label="Filter by subject">
          {areas.map((item) => (
            <button type="button" key={item} className={area === item ? "active" : ""} onClick={() => setArea(item)}>
              {item}
            </button>
          ))}
        </div>
      </div>
      {visibleTopics.length > 0 ? (
        <div className="topic-grid">
          {visibleTopics.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              complete={completedTopicIds.includes(topic.id)}
              onClick={() => setSelectedId(topic.id)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-search"><strong>No lessons found</strong><span>Try a different search term or subject.</span></div>
      )}
    </section>
  );
}
