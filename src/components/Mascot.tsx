"use client";

import { useState } from "react";

type Props = {
  completedTopics: number;
  solvedChallenges: number;
  streak: number;
};

export default function Mascot({ completedTopics, solvedChallenges, streak }: Props) {
  const [reaction, setReaction] = useState(0);
  const greeting = completedTopics + solvedChallenges === 0
    ? "Hey! I’m Byte. Ready for your first win?"
    : streak > 2
      ? `${streak} days in a row? You’re on fire!`
      : `Nice progress! ${solvedChallenges} challenge${solvedChallenges === 1 ? "" : "s"} cracked.`;
  const reactions = [
    greeting,
    "Tiny steps. Big brain energy.",
    "Boop! Want to try a challenge?",
    "You bring the logic. I’ll bring the vibes.",
  ];

  return (
    <div className="mascot-stage">
      <div className="mascot-speech" aria-live="polite">
        <span className="mascot-status"><i /> YOUR STUDY BUDDY</span>
        <strong>{reactions[reaction % reactions.length]}</strong>
        <span className="mascot-speech-tail" />
      </div>
      <button
        className="mascot-button"
        type="button"
        aria-label="Tap Byte for encouragement"
        onClick={() => setReaction((current) => current + 1)}
      >
        <span className="mascot-spark mascot-spark-one" aria-hidden="true">✦</span>
        <span className="mascot-spark mascot-spark-two" aria-hidden="true">+</span>
        <svg
          key={reaction}
          className="mascot-art"
          viewBox="0 0 250 260"
          role="img"
          aria-label="Byte, your cheerful DSA study buddy"
        >
          <ellipse cx="126" cy="239" rx="71" ry="12" fill="#172033" opacity=".18" />
          <path className="mascot-antenna" d="M125 54V35" fill="none" stroke="#172033" strokeWidth="8" strokeLinecap="round" />
          <circle cx="125" cy="27" r="13" fill="#ffda32" stroke="#172033" strokeWidth="5" />
          <path d="M80 76c0-22 20-38 45-38s45 16 45 38" fill="#ef668e" stroke="#172033" strokeWidth="6" />
          <rect x="57" y="67" width="136" height="128" rx="43" fill="#fff5ce" stroke="#172033" strokeWidth="7" />
          <path d="M64 104H44c-11 0-19 8-19 19v27c0 11 8 19 19 19h17" fill="#ffda32" stroke="#172033" strokeWidth="7" strokeLinejoin="round" />
          <g className="mascot-wave">
            <path className="mascot-arm" d="M188 108h16c11 0 19 8 19 19v10" fill="none" stroke="#172033" strokeWidth="9" strokeLinecap="round" />
            <path d="M216 136c-12 0-20 8-20 19 0 8 5 14 12 17v9h17v-9c7-4 12-10 12-18 0-10-9-18-21-18Z" fill="#ffda32" stroke="#172033" strokeWidth="6" strokeLinejoin="round" />
          </g>
          <rect x="72" y="84" width="106" height="72" rx="29" fill="#315edb" stroke="#172033" strokeWidth="5" />
          <ellipse className="mascot-eye" cx="105" cy="116" rx="8" ry="12" fill="#fffdf6" />
          <ellipse className="mascot-eye" cx="145" cy="116" rx="8" ry="12" fill="#fffdf6" />
          <circle cx="107" cy="119" r="3.5" fill="#172033" />
          <circle cx="147" cy="119" r="3.5" fill="#172033" />
          <path d="M111 137c8 9 21 9 29 0" fill="none" stroke="#fffdf6" strokeWidth="5" strokeLinecap="round" />
          <circle cx="87" cy="134" r="5" fill="#ff9bb5" />
          <circle cx="162" cy="134" r="5" fill="#ff9bb5" />
          <rect x="90" y="171" width="70" height="13" rx="6.5" fill="#ef668e" stroke="#172033" strokeWidth="4" />
          <path d="M91 196v18c0 8 7 15 15 15s15-7 15-15v-18m10 0v18c0 8 7 15 15 15s15-7 15-15v-18" fill="#315edb" stroke="#172033" strokeWidth="6" strokeLinecap="round" />
          <rect x="112" y="171" width="27" height="13" rx="6" fill="#ffda32" />
        </svg>
        <span className="mascot-tap-hint" aria-hidden="true">TAP FOR A BOOST</span>
      </button>
    </div>
  );
}
