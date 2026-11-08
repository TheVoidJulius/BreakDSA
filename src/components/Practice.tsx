"use client";

import { useState } from "react";
import { challenges, getTopic } from "@/data/course";

type Props = {
  solvedIds: string[];
  initialChallengeId: string;
  onSolved: (challengeId: string) => void;
};

export default function Practice({ solvedIds, initialChallengeId, onSolved }: Props) {
  const [selectedId, setSelectedId] = useState(initialChallengeId);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const challenge = challenges.find(({ id }) => id === selectedId) ?? challenges[0];
  const solved = solvedIds.includes(challenge.id);
  const correct = submitted && selectedAnswer === challenge.answer;
  const progress = Math.round((solvedIds.length / challenges.length) * 100);

  const selectChallenge = (id: string) => {
    setSelectedId(id);
    setSelectedAnswer(null);
    setSubmitted(false);
    setHintLevel(0);
  };

  return (
    <section className="view-section practice-view" aria-labelledby="practice-title">
      <div className="section-heading">
        <div>
          <p className="section-kicker">PRACTICE SET</p>
          <h1 id="practice-title">Make it second nature.</h1>
          <p className="section-description">A few careful questions beat a hundred rushed guesses.</p>
        </div>
        <div className="practice-progress">
          <div className="progress-copy"><span>Set progress</span><strong>{solvedIds.length} / {challenges.length}</strong></div>
          <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
        </div>
      </div>

      <div className="practice-layout">
        <aside className="challenge-list" aria-label="Choose a challenge">
          <p className="panel-overline">CHALLENGES</p>
          {challenges.map((item, index) => {
            const topic = getTopic(item.topicId);
            const isSolved = solvedIds.includes(item.id);
            return (
              <button
                type="button"
                key={item.id}
                className={`challenge-row ${selectedId === item.id ? "selected" : ""}`}
                onClick={() => selectChallenge(item.id)}
                aria-current={selectedId === item.id ? "step" : undefined}
              >
                <span className={`challenge-number ${isSolved ? "solved" : ""}`}>{isSolved ? "✓" : String(index + 1).padStart(2, "0")}</span>
                <span className="challenge-row-copy"><strong>{item.title}</strong><small>{topic?.title}</small></span>
                <span className={`difficulty ${item.difficulty.toLowerCase()}`}>{item.difficulty}</span>
              </button>
            );
          })}
        </aside>

        <article className="question-panel">
          <div className="question-meta">
            <span>{getTopic(challenge.topicId)?.area}</span>
            <span className={`difficulty ${challenge.difficulty.toLowerCase()}`}>{challenge.difficulty}</span>
            {solved && <span className="solved-label">Solved</span>}
          </div>
          <h2>{challenge.title}</h2>
          <p className="question-prompt">{challenge.prompt}</p>

          <fieldset className="answer-options" disabled={correct}>
            <legend className="sr-only">Choose your answer</legend>
            {challenge.choices.map((option, index) => (
              <label
                className={`answer-option ${selectedAnswer === index ? "selected" : ""} ${submitted && index === challenge.answer ? "correct" : ""} ${submitted && selectedAnswer === index && !correct ? "incorrect" : ""}`}
                key={option}
              >
                <input
                  type="radio"
                  name={`answer-${challenge.id}`}
                  value={index}
                  checked={selectedAnswer === index}
                  onChange={() => {
                    setSelectedAnswer(index);
                    setSubmitted(false);
                  }}
                />
                <span className="answer-marker" aria-hidden="true">{String.fromCharCode(65 + index)}</span>
                <span>{option}</span>
                {submitted && index === challenge.answer && <span className="answer-check" aria-label="Correct answer">✓</span>}
              </label>
            ))}
          </fieldset>

          {hintLevel > 0 && (
            <div className="hint-card" role="status">
              <span className="hint-icon" aria-hidden="true">i</span>
              <div><strong>Hint {hintLevel}</strong><p>{challenge.hints[hintLevel - 1]}</p></div>
            </div>
          )}

          {submitted && (
            <div className={`answer-feedback ${correct ? "success" : "try-again"}`} role="status">
              <strong>{correct ? "That’s right." : "Not quite. Revisit the key idea."}</strong>
              {correct && <p>{challenge.explanation}</p>}
            </div>
          )}

          <div className="question-actions">
            <button
              className="button button-quiet"
              type="button"
              disabled={hintLevel >= challenge.hints.length || correct}
              onClick={() => setHintLevel((current) => Math.min(current + 1, challenge.hints.length))}
            >
              {hintLevel >= challenge.hints.length ? "No more hints" : "Get a hint"}
              {hintLevel > 0 && hintLevel < challenge.hints.length && <span>{hintLevel}/{challenge.hints.length}</span>}
            </button>
            {correct ? (
              <button
                className="button button-primary"
                type="button"
                onClick={() => selectChallenge(challenges[(challenges.findIndex(({ id }) => id === challenge.id) + 1) % challenges.length].id)}
              >
                Next challenge <span aria-hidden="true">→</span>
              </button>
            ) : (
              <button
                className="button button-primary"
                type="button"
                disabled={selectedAnswer === null}
                onClick={() => {
                  setSubmitted(true);
                  if (selectedAnswer === challenge.answer) onSolved(challenge.id);
                }}
              >
                Check answer
              </button>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
