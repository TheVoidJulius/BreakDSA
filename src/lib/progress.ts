import { challenges, topics } from "@/data/course";

export type Progress = {
  solvedChallenges: string[];
  completedTopics: string[];
  studyDates: string[];
  notesByTopic: Record<string, string>;
};

export const emptyProgress: Progress = {
  solvedChallenges: [],
  completedTopics: [],
  studyDates: [],
  notesByTopic: {},
};

const storageKey = "breakdsa.progress.v1";
const knownChallengeIds = new Set(challenges.map(({ id }) => id));
const knownTopicIds = new Set(topics.map(({ id }) => id));

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function loadProgress(): Progress {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return emptyProgress;
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) return emptyProgress;
    const record = value as Record<string, unknown>;
    const storedNotes = typeof record.notesByTopic === "object" && record.notesByTopic !== null
      ? record.notesByTopic as Record<string, unknown>
      : {};
    const notesByTopic: Record<string, string> = {};
    for (const [id, note] of Object.entries(storedNotes)) {
      if (knownTopicIds.has(id) && typeof note === "string" && note.length <= 5_000) {
        notesByTopic[id] = note;
      }
    }
    return {
      solvedChallenges: Array.isArray(record.solvedChallenges)
        ? record.solvedChallenges.filter(
            (id): id is string => typeof id === "string" && knownChallengeIds.has(id),
          )
        : [],
      completedTopics: Array.isArray(record.completedTopics)
        ? record.completedTopics.filter(
            (id): id is string => typeof id === "string" && knownTopicIds.has(id),
          )
        : [],
      studyDates: Array.isArray(record.studyDates)
        ? record.studyDates.filter((date): date is string => typeof date === "string")
        : [],
      notesByTopic,
    };
  } catch {
    return emptyProgress;
  }
}

export function saveProgress(progress: Progress) {
  window.localStorage.setItem(storageKey, JSON.stringify(progress));
}

export function getStudyStreak(dates: string[]) {
  const studied = new Set(dates);
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  const today = dateKey(cursor);
  if (!studied.has(today)) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (studied.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function addStudyDate(dates: string[]) {
  const today = dateKey(new Date());
  return dates.includes(today) ? dates : [...dates, today];
}
