"use client";

import { useEffect, useMemo, useState } from "react";

type Mode = "bubble" | "binary" | "stack" | "queue";
type Frame = {
  values: number[];
  active: number[];
  label: string;
  detail: string;
};

const initialValues = [36, 12, 49, 23, 8, 41];
const searchValues = [4, 8, 12, 17, 23, 29, 34, 41];
const target = 29;

const modes: { id: Mode; title: string; caption: string }[] = [
  { id: "bubble", title: "Bubble sort", caption: "Sorting" },
  { id: "binary", title: "Binary search", caption: "Searching" },
  { id: "stack", title: "Stack", caption: "LIFO" },
  { id: "queue", title: "Queue", caption: "FIFO" },
];

function buildFrames(mode: Mode): Frame[] {
  if (mode === "bubble") {
    const values = [...initialValues];
    const frames: Frame[] = [{
      values: [...values],
      active: [],
      label: "Ready",
      detail: "Compare neighboring values and swap them when they are out of order.",
    }];

    for (let end = values.length - 1; end > 0; end -= 1) {
      for (let index = 0; index < end; index += 1) {
        const left = values[index];
        const right = values[index + 1];
        frames.push({
          values: [...values],
          active: [index, index + 1],
          label: `Compare ${left} and ${right}`,
          detail: left <= right
            ? `${left} is already before ${right}; leave this pair as it is.`
            : `${left} is greater than ${right}; swap the pair.`,
        });
        if (left > right) {
          [values[index], values[index + 1]] = [right, left];
          frames.push({
            values: [...values],
            active: [index, index + 1],
            label: `Swap ${right} and ${left}`,
            detail: "The larger value moves one position toward the end.",
          });
        }
      }
    }

    frames.push({
      values: [...values],
      active: [],
      label: "Sorted",
      detail: "After each pass, the largest remaining value is in its final position.",
    });
    return frames;
  }

  if (mode === "binary") {
    const frames: Frame[] = [{
      values: searchValues,
      active: [],
      label: `Find ${target}`,
      detail: "The array is sorted. Check the midpoint and discard the half that cannot contain the target.",
    }];
    let left = 0;
    let right = searchValues.length - 1;
    while (left <= right) {
      const mid = left + Math.floor((right - left) / 2);
      frames.push({
        values: searchValues,
        active: [left, mid, right],
        label: `Check index ${mid}: ${searchValues[mid]}`,
        detail: searchValues[mid] === target
          ? `Found ${target} at index ${mid}.`
          : searchValues[mid] < target
            ? `${searchValues[mid]} is too small. Continue in the right half.`
            : `${searchValues[mid]} is too large. Continue in the left half.`,
      });
      if (searchValues[mid] === target) break;
      if (searchValues[mid] < target) left = mid + 1;
      else right = mid - 1;
    }
    return frames;
  }

  const operations = mode === "stack"
    ? [
        { values: [] as number[], label: "Ready", detail: "A stack is last-in, first-out." },
        { values: [8], label: "Push 8", detail: "Add 8 to the top of the stack." },
        { values: [8, 3], label: "Push 3", detail: "3 becomes the new top." },
        { values: [8, 3, 11], label: "Push 11", detail: "The newest item is now at the top." },
        { values: [8, 3], label: "Pop 11", detail: "Remove the top item: 11 was added last, so it leaves first." },
        { values: [8, 3, 5], label: "Push 5", detail: "Push adds the new value to the top." },
      ]
    : [
        { values: [] as number[], label: "Ready", detail: "A queue is first-in, first-out." },
        { values: [8], label: "Enqueue 8", detail: "Add 8 at the back of the queue." },
        { values: [8, 3], label: "Enqueue 3", detail: "New arrivals join at the back." },
        { values: [8, 3, 11], label: "Enqueue 11", detail: "11 joins behind the earlier requests." },
        { values: [3, 11], label: "Dequeue 8", detail: "Remove the front item: 8 arrived first, so it leaves first." },
        { values: [3, 11, 5], label: "Enqueue 5", detail: "Add the next arrival to the back." },
      ];

  return operations.map((operation, index) => ({
    values: operation.values,
    active: index === 0 ? [] : [Math.max(0, operation.values.length - 1)],
    label: operation.label,
    detail: operation.detail,
  }));
}

export default function Visualizer() {
  const [mode, setMode] = useState<Mode>("bubble");
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const frames = useMemo(() => buildFrames(mode), [mode]);
  const frame = frames[frameIndex] ?? frames[0];
  const progress = frames.length > 1 ? (frameIndex / (frames.length - 1)) * 100 : 0;
  const isArrayMode = mode === "bubble" || mode === "binary";

  useEffect(() => {
    setFrameIndex(0);
    setPlaying(false);
  }, [mode]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      if (frameIndex >= frames.length - 1) setPlaying(false);
      else setFrameIndex(frameIndex + 1);
    }, speed);
    return () => window.clearTimeout(timer);
  }, [frameIndex, frames.length, playing, speed]);

  const step = () => {
    setPlaying(false);
    setFrameIndex((current) => Math.min(current + 1, frames.length - 1));
  };
  const reset = () => {
    setPlaying(false);
    setFrameIndex(0);
  };

  return (
    <section className="view-section visualizer-view" aria-labelledby="visualizer-title">
      <div className="section-heading">
        <div>
          <p className="section-kicker">INTERACTIVE LAB</p>
          <h1 id="visualizer-title">See the steps.</h1>
          <p className="section-description">Slow an algorithm down and watch what changes at each step.</p>
        </div>
        <span className="lab-status"><span /> No code execution</span>
      </div>

      <div className="visualizer-layout">
        <aside className="mode-list" aria-label="Choose a visualization">
          <p className="panel-overline">LIBRARY</p>
          {modes.map((item) => (
            <button
              className={`mode-option ${mode === item.id ? "selected" : ""}`}
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              aria-pressed={mode === item.id}
            >
              <span className="mode-glyph" aria-hidden="true">
                {item.id === "bubble" ? "↕" : item.id === "binary" ? "⌕" : item.id === "stack" ? "▤" : "⇥"}
              </span>
              <span><strong>{item.title}</strong><small>{item.caption}</small></span>
              <span className="mode-chevron" aria-hidden="true">›</span>
            </button>
          ))}
        </aside>

        <div className="visualizer-panel">
          <div className="visualizer-toolbar">
            <div>
              <p className="panel-overline">NOW VISUALIZING</p>
              <h2>{modes.find((item) => item.id === mode)?.title}</h2>
            </div>
            <div className="visualizer-toolbar-meta">
              <span className="algorithm-complexity">{mode === "bubble" ? "O(n²) time" : mode === "binary" ? "O(log n) time" : "O(1) operations"}</span>
              <span className="step-count">STEP {String(frameIndex + 1).padStart(2, "0")} / {String(frames.length).padStart(2, "0")}</span>
            </div>
          </div>

          <div className={`visual-stage ${mode === "stack" ? "stack-stage" : ""}`}>
            {isArrayMode ? (
              <div className={`array-visual ${mode === "binary" ? "binary-visual" : ""}`} role="img" aria-label={`${modes.find((item) => item.id === mode)?.title} step ${frameIndex + 1}: ${frame.values.join(", ")}`}>
                {frame.values.map((value, index) => {
                  const active = frame.active.includes(index);
                  const height = mode === "bubble" ? 22 + value * 2.4 : 30;
                  return (
                    <div className={`array-cell ${active ? "active" : ""}`} key={`${index}-${value}`}>
                      {mode === "bubble" && <div className="bar-rect" style={{ height: `${height}px` }} />}
                      {mode === "binary" && (
                        <div className="binary-index">{frame.active.includes(index) ? ["L", "M", "R"][frame.active.indexOf(index)] : ""}</div>
                      )}
                      <strong>{value}</strong>
                      <small>{index}</small>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={`linear-visual ${mode}`} role="img" aria-label={`${mode} contents: ${frame.values.length ? frame.values.join(", ") : "empty"}`}>
                <span className="linear-endpoint">{mode === "stack" ? "TOP" : "FRONT"}</span>
                <div className="linear-items">
                  {frame.values.length === 0
                    ? <div className="empty-structure">Empty {mode}</div>
                    : frame.values.map((value, index) => (
                        <div className={`linear-item ${index === 0 && mode === "queue" ? "next-out" : ""} ${index === frame.values.length - 1 && mode === "stack" ? "top-item" : ""}`} key={`${index}-${value}`}>
                          <strong>{value}</strong>
                          <small>{index === 0 && mode === "queue" ? "next out" : index === frame.values.length - 1 && mode === "stack" ? "top" : ""}</small>
                        </div>
                      ))}
                </div>
                <span className="linear-endpoint">{mode === "stack" ? "BASE" : "BACK"}</span>
              </div>
            )}
          </div>

          <div className="step-explanation" aria-live="polite">
            <span className="step-indicator" />
            <div><strong>{frame.label}</strong><p>{frame.detail}</p></div>
          </div>

          <div className="timeline" aria-label="Visualization timeline">
            <div className="timeline-track"><span style={{ width: `${progress}%` }} /></div>
            <input
              aria-label="Choose visualization step"
              type="range"
              min={0}
              max={frames.length - 1}
              value={frameIndex}
              onChange={(event) => {
                setPlaying(false);
                setFrameIndex(Number(event.target.value));
              }}
            />
          </div>

          <div className="visual-controls">
            <label className="speed-control">
              <span>Speed</span>
              <select aria-label="Animation speed" value={speed} onChange={(event) => setSpeed(Number(event.target.value))}>
                <option value={1200}>Slow</option>
                <option value={800}>Normal</option>
                <option value={400}>Fast</option>
              </select>
            </label>
            <div className="control-actions">
              <button className="button button-quiet" type="button" onClick={reset}>Reset</button>
              <button className="button button-quiet" type="button" onClick={step} disabled={frameIndex >= frames.length - 1}>Step forward <span aria-hidden="true">→</span></button>
              <button
                className="button button-primary play-button"
                type="button"
                onClick={() => {
                  if (frameIndex >= frames.length - 1) setFrameIndex(0);
                  setPlaying((current) => !current);
                }}
              >
                {playing ? "Pause" : "Play"} <span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
