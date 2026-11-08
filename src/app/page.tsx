"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import Learn from "@/components/Learn";
import Mascot from "@/components/Mascot";
import Practice from "@/components/Practice";
import Tutor from "@/components/Tutor";
import Visualizer from "@/components/Visualizer";
import { challenges, topics } from "@/data/course";
import {
  addStudyDate,
  emptyProgress,
  getStudyStreak,
  loadProgress,
  saveProgress,
  type Progress,
} from "@/lib/progress";

type View = "home" | "learn" | "practice" | "visualize" | "tutor" | "progress";

const navigation: { id: View; label: string; icon: string }[] = [
  { id: "home", label: "Overview", icon: "⌂" },
  { id: "learn", label: "Learn", icon: "▤" },
  { id: "practice", label: "Practice", icon: "⌘" },
  { id: "visualize", label: "Visualize", icon: "◫" },
  { id: "tutor", label: "AI tutor", icon: "✳" },
];

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [activeTopic, setActiveTopic] = useState("complexity");
  const [hydrated, setHydrated] = useState(false);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      saveProgress(progress);
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [hydrated, progress]);

  const activeTopicTitle = useMemo(
    () => topics.find(({ id }) => id === activeTopic)?.title ?? topics[0].title,
    [activeTopic],
  );
  const streak = getStudyStreak(progress.studyDates);
  const totalDone = progress.solvedChallenges.length + progress.completedTopics.length;

  const markStudyDay = (next: Progress) => ({
    ...next,
    studyDates: addStudyDate(next.studyDates),
  });

  const completeTopic = (topicId: string) => {
    setProgress((current) => {
      const completedTopics = current.completedTopics.includes(topicId)
        ? current.completedTopics
        : [...current.completedTopics, topicId];
      return markStudyDay({ ...current, completedTopics });
    });
  };

  const completeChallenge = (challengeId: string) => {
    setProgress((current) => {
      const solvedChallenges = current.solvedChallenges.includes(challengeId)
        ? current.solvedChallenges
        : [...current.solvedChallenges, challengeId];
      return markStudyDay({ ...current, solvedChallenges });
    });
  };

  const switchView = (next: View) => {
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderView = () => {
    switch (view) {
      case "learn":
        return (
          <Learn
            completedTopicIds={progress.completedTopics}
            notesByTopic={progress.notesByTopic}
            onComplete={completeTopic}
            onNoteChange={(topicId, note) => {
              setProgress((current) => ({
                ...current,
                notesByTopic: { ...current.notesByTopic, [topicId]: note },
              }));
            }}
            onTutor={(topicId) => {
              setActiveTopic(topicId);
              switchView("tutor");
            }}
          />
        );
      case "practice":
        return (
          <Practice
            solvedIds={progress.solvedChallenges}
            initialChallengeId={challenges.find(({ id }) => !progress.solvedChallenges.includes(id))?.id ?? challenges[0].id}
            onSolved={completeChallenge}
          />
        );
      case "visualize":
        return <Visualizer />;
      case "tutor":
        return <Tutor topicId={activeTopic} onTopicChange={setActiveTopic} />;
      case "progress":
        return (
          <ProgressView
            progress={progress}
            streak={streak}
            onContinue={() => switchView("learn")}
          />
        );
      default:
        return (
          <Overview
            completedTopics={progress.completedTopics.length}
            totalTopics={topics.length}
            solvedChallenges={progress.solvedChallenges.length}
            totalChallenges={challenges.length}
            streak={streak}
            totalDone={totalDone}
            nextChallenge={challenges.find(({ id }) => !progress.solvedChallenges.includes(id)) ?? challenges[0]}
            onNavigate={switchView}
          />
        );
    }
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/" onClick={(event) => { event.preventDefault(); switchView("home"); }} aria-label="BreakDSA overview">
          <span className="brand-mark">break<span>DSA</span></span>
          <span className="brand-tagline">THINK. TRACE. SOLVE.</span>
        </a>
        <div className="sidebar-section-label">STUDY SPACE</div>
        <nav className="primary-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <button
              className={`nav-link ${view === item.id ? "active" : ""}`}
              key={item.id}
              type="button"
              onClick={() => switchView(item.id)}
              aria-current={view === item.id ? "page" : undefined}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
              {item.id === "tutor" && <span className="nav-badge">BETA</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-divider" />
        <div className="sidebar-section-label">YOUR PROGRESS</div>
        <button className={`nav-link ${view === "progress" ? "active" : ""}`} type="button" onClick={() => switchView("progress")} aria-current={view === "progress" ? "page" : undefined}>
          <span className="nav-icon" aria-hidden="true">◷</span><span>Study record</span>
        </button>
        <div className="sidebar-bottom">
          <div className="study-streak"><span aria-hidden="true">↗</span><strong>{streak} day{streak === 1 ? "" : "s"}</strong><small>current study streak</small></div>
          <div className="privacy-note"><span className="privacy-dot" /> Progress stays on this device</div>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span><span className="breadcrumb-separator">/</span><strong>{navigation.find(({ id }) => id === view)?.label ?? "Study record"}</strong>
          </div>
          <div className="topbar-actions">
            <span className="study-topic">{view === "tutor" ? activeTopicTitle : "DSA learning path"}</span>
            <span className="avatar-mark" aria-label="Learner">Y</span>
          </div>
        </header>

        <div className="page-content">
          {storageError && <p className="storage-warning" role="status">Progress could not be saved in this browser. Check your storage or privacy settings.</p>}
          {renderView()}
        </div>
      </div>
    </main>
  );
}

function Overview({
  completedTopics,
  totalTopics,
  solvedChallenges,
  totalChallenges,
  streak,
  totalDone,
  nextChallenge,
  onNavigate,
}: {
  completedTopics: number;
  totalTopics: number;
  solvedChallenges: number;
  totalChallenges: number;
  streak: number;
  totalDone: number;
  nextChallenge: (typeof challenges)[number];
  onNavigate: (view: View) => void;
}) {
  const progressPercent = Math.round(((completedTopics + solvedChallenges) / (totalTopics + totalChallenges)) * 100);
  return (
    <section className="view-section overview-view" aria-labelledby="overview-title">
      <div className="welcome-strip">
        <div>
          <p className="section-kicker">PLAYER ONE · DSA ARCADE</p>
          <h1 id="overview-title">Big problems.<br /><span>Small wins.</span></h1>
          <p className="section-description">Learn the move, try the challenge, and watch your ideas click into place.</p>
          <button className="button button-primary welcome-action" type="button" onClick={() => onNavigate("learn")}>
            Start a learning run <span aria-hidden="true">→</span>
          </button>
        </div>
        <div className="welcome-mark" aria-hidden="true">
          <span className="orbit orbit-one" /><span className="orbit orbit-two" />
          <Mascot completedTopics={completedTopics} solvedChallenges={solvedChallenges} streak={streak} />
        </div>
      </div>

      <div className="overview-stats" aria-label="Learning statistics">
        <StatCard label="Lessons completed" value={`${completedTopics} / ${totalTopics}`} detail="Concepts in your path" />
        <StatCard label="Challenges solved" value={`${solvedChallenges} / ${totalChallenges}`} detail="Correct answers recorded" />
        <StatCard label="Study streak" value={`${streak} day${streak === 1 ? "" : "s"}`} detail="Keep the rhythm going" />
        <StatCard label="Learning progress" value={`${progressPercent}%`} detail={`${totalDone} milestones reached`} />
      </div>

      <div className="daily-quest">
        <div className="quest-stamp" aria-hidden="true">GO!</div>
        <div className="quest-copy">
          <span className="quest-eyebrow">YOUR NEXT MINI-MISSION</span>
          <strong>Up next: {nextChallenge.title}</strong>
          <span>A quick {nextChallenge.difficulty.toLowerCase()} challenge. Pick it up and keep your streak moving.</span>
        </div>
        <button className="button quest-action" type="button" onClick={() => onNavigate("practice")}>
          Enter practice <span aria-hidden="true">↗</span>
        </button>
      </div>

      <div className="section-row-heading">
        <div><p className="section-kicker">CHOOSE YOUR NEXT LEVEL</p><h2>How do you want to learn?</h2></div>
        <button className="text-link" type="button" onClick={() => onNavigate("progress")}>View study record <span aria-hidden="true">→</span></button>
      </div>
      <div className="feature-grid">
        <FeatureCard number="01" title="Learn a concept" description="Build a clear mental model with short, focused lessons." action="Browse lessons" icon="▤" onClick={() => onNavigate("learn")} />
        <FeatureCard number="02" title="Practice deliberately" description="Work through a question, use hints, then check your reasoning." action="Open practice" icon="⌘" onClick={() => onNavigate("practice")} />
        <FeatureCard number="03" title="Watch it unfold" description="Step through common algorithms and data structures." action="Enter the lab" icon="◫" onClick={() => onNavigate("visualize")} />
      </div>
      <div className="tutor-callout">
        <span className="tutor-callout-icon" aria-hidden="true">✳</span>
        <div><strong>Need a nudge?</strong><p>Ask the study partner to explain an idea or help you find the next step.</p></div>
        <button className="button button-quiet" type="button" onClick={() => onNavigate("tutor")}>Talk it through <span aria-hidden="true">→</span></button>
      </div>
    </section>
  );
}

function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <article className="stat-card"><p>{label}</p><strong>{value}</strong><span>{detail}</span></article>;
}

function FeatureCard({
  number,
  title,
  description,
  action,
  icon,
  onClick,
}: {
  number: string;
  title: string;
  description: string;
  action: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button className="feature-card" type="button" onClick={onClick}>
      <span className="feature-number">{number}</span><span className="feature-icon" aria-hidden="true">{icon}</span>
      <strong>{title}</strong><p>{description}</p><span className="feature-action">{action} <span aria-hidden="true">↗</span></span>
    </button>
  );
}

function ProgressView({
  progress,
  streak,
  onContinue,
}: {
  progress: Progress;
  streak: number;
  onContinue: () => void;
}) {
  const recentTopics = progress.completedTopics.map((id) => topics.find((topic) => topic.id === id)).filter((topic) => topic !== undefined);
  const solved = progress.solvedChallenges.map((id) => challenges.find((challenge) => challenge.id === id)).filter((challenge) => challenge !== undefined);
  return (
    <section className="view-section progress-view" aria-labelledby="progress-title">
      <div className="section-heading">
        <div><p className="section-kicker">YOUR STUDY RECORD</p><h1 id="progress-title">Small steps add up.</h1><p className="section-description">Your record is stored in this browser and is not synced to an account.</p></div>
      </div>
      <div className="progress-overview-card">
        <div className="progress-ring" style={{ "--progress": `${Math.round(((recentTopics.length + solved.length) / (topics.length + challenges.length)) * 100)}%` } as CSSProperties}>
          <div><strong>{Math.round(((recentTopics.length + solved.length) / (topics.length + challenges.length)) * 100)}%</strong><span>complete</span></div>
        </div>
        <div className="progress-overview-copy">
          <p className="section-kicker">YOUR PATH</p>
          <h2>{recentTopics.length + solved.length === 0 ? "Start with one small win." : "You’re building momentum."}</h2>
          <p>{recentTopics.length} of {topics.length} lessons and {solved.length} of {challenges.length} practice questions completed.</p>
          <div className="progress-bar"><span style={{ width: `${Math.round(((recentTopics.length + solved.length) / (topics.length + challenges.length)) * 100)}%` }} /></div>
          <span className="progress-streak">Current streak: <strong>{streak} day{streak === 1 ? "" : "s"}</strong></span>
        </div>
      </div>
      <div className="progress-columns">
        <ProgressList title="Lessons learned" empty="Complete a lesson to see it here." items={recentTopics.map(({ title, area }) => ({ title, detail: area }))} />
        <ProgressList title="Challenges solved" empty="Solve a practice question to see it here." items={solved.map(({ title, difficulty }) => ({ title, detail: difficulty }))} />
      </div>
      <button className="button button-primary" type="button" onClick={onContinue}>Continue learning <span aria-hidden="true">→</span></button>
    </section>
  );
}

function ProgressList({ title, empty, items }: { title: string; empty: string; items: { title: string; detail: string }[] }) {
  return (
    <section className="progress-list">
      <h2>{title}<span>{items.length}</span></h2>
      {items.length > 0 ? items.map((item) => <div className="progress-list-row" key={item.title}><span className="progress-check">✓</span><strong>{item.title}</strong><small>{item.detail}</small></div>) : <p className="progress-empty">{empty}</p>}
    </section>
  );
}
