"use client";

import { useEffect, useRef, useState } from "react";

export type GuardOutcome = {
  readonly text: string;
  readonly strippedChars: boolean;
  readonly truncated: boolean;
};

type GuardedTextArgs = {
  readonly initial: string;
  readonly max: number;
  readonly guard: (raw: string) => GuardOutcome;
  readonly onStrip?: () => void;
};

const HINT_MS = 2500;

// Mechanism only: tribune knows nothing about names or pincodes. The caller injects
// `guard`, so the domain vocabulary stays in the app.
export function useGuardedText({
  initial,
  max,
  guard,
  onStrip,
}: GuardedTextArgs) {
  const [text, setText] = useState(initial);
  const [strikes, setStrikes] = useState(0);
  const [hinting, setHinting] = useState(false);
  const composing = useRef(false);

  useEffect(() => {
    if (strikes === 0) {
      return;
    }
    setHinting(true);
    const timer = setTimeout(() => setHinting(false), HINT_MS);
    return () => clearTimeout(timer);
  }, [strikes]);

  // Filtering mid-composition destroys Indic/IME input: the browser is still
  // assembling a syllable, so we take the raw value and guard on commit.
  const accept = (raw: string) => {
    if (composing.current) {
      setText(raw);
      return;
    }
    const outcome = guard(raw);
    setText(outcome.text);
    if (outcome.strippedChars) {
      setStrikes((n) => n + 1);
      onStrip?.();
    }
  };

  const inputProps = {
    maxLength: max,
    onChange: (event: { target: { value: string } }) =>
      accept(event.target.value),
    onCompositionEnd: (event: { currentTarget: { value: string } }) => {
      composing.current = false;
      accept(event.currentTarget.value);
    },
    onCompositionStart: () => {
      composing.current = true;
    },
    value: text,
  };

  return {
    hinting,
    inputProps,
    remaining: max - [...text].length,
    setText,
    text,
  };
}
