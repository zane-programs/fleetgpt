import { Text } from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";

import styles from "./TypewriterText.module.css";
import { useSfx } from "../utils/sfx";

enum TypewriterState {
  RESTING = 1,
  TYPING,
  BACKSPACING,
}

export default function TypewriterText({
  text,
  typingDelay = 28,
  backspacingDelay = 20,
}: {
  text: string;
  typingDelay?: number;
  backspacingDelay?: number;
}) {
  const previousText = useRef<string>("");
  const currentText = useRef<string>("");
  const [displayText, setDisplayText] = useState<string>("");
  const [state, setState] = useState<TypewriterState>(TypewriterState.RESTING);

  const { setIsPlayingTyping } = useSfx();

  useEffect(() => {
    async function handleTextChange() {
      previousText.current = currentText.current;

      // Backspacing
      setState(TypewriterState.BACKSPACING);

      let backspacingPreviousText = previousText.current;

      while (backspacingPreviousText.length > 0) {
        backspacingPreviousText = backspacingPreviousText.slice(0, -1);
        setDisplayText(backspacingPreviousText);
        await sleep(backspacingDelay);
      }

      currentText.current = text;

      // Typing
      setState(TypewriterState.TYPING);

      let newDisplayText: string;
      let lastCharIsNewLine: boolean;
      for (let typingIndex = 0; typingIndex < text.length; typingIndex++) {
        newDisplayText = text.substring(0, typingIndex + 1);
        lastCharIsNewLine = newDisplayText.slice(-1) === "\n";
        setDisplayText(newDisplayText);

        setIsPlayingTyping(!lastCharIsNewLine);
        await sleep(lastCharIsNewLine ? 750 : typingDelay);
      }

      // Done!
      setState(TypewriterState.RESTING);
    }

    handleTextChange();
  }, [backspacingDelay, setIsPlayingTyping, text, typingDelay]);

  useEffect(() => {
    currentText.current = displayText;
  }, [displayText]);

  // Set typing SFX based on typing state
  useEffect(() => {
    // Play typing sound effect while typing
    setIsPlayingTyping(state !== TypewriterState.RESTING);
  }, [setIsPlayingTyping, state]);

  const lines = useMemo(() => displayText.split("\n"), [displayText]);

  return (
    <span>
      {lines.map((text, index) => (
        <Text
          key={index}
          pt={index === 0 ? undefined : "2"}
          pb={index + 1 === lines.length ? undefined : "2"}
        >
          {text}
          {index + 1 >= lines.length &&
            (state !== TypewriterState.RESTING || displayText === "") && (
              <Cursor state={state} {...(displayText ? {} : { opacity: 1 })} />
            )}
        </Text>
      ))}
    </span>
  );
}

function Cursor({
  state,
  opacity,
}: {
  state: TypewriterState;
  opacity?: string | number;
}) {
  return (
    <span
      style={{
        opacity: opacity ?? (state === TypewriterState.RESTING ? 0 : 1),
      }}
    >
      <span
        className={styles.blinking}
        style={{
          userSelect: "none",
        }}
      >
        ▋
      </span>
    </span>
  );
}

const sleep = (t: number) => new Promise((r) => setTimeout(r, t));
