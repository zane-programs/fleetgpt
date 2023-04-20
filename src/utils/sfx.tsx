import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export function SFXProvider({
  isEnabled,
  children,
}: React.PropsWithChildren<{ isEnabled: boolean }>) {
  const [isPlayingTyping, setIsPlayingTyping] = useState(false);

  const typingAudioRef = useRef<HTMLAudioElement>(
    new Audio(process.env.PUBLIC_URL + "/sfx/typing.mp3")
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    function handleClick(e: MouseEvent) {
      // Don't play when SFX disabled
      if (!isEnabled) return;

      const nodeName: string | undefined = (e.target as any)?.nodeName;

      if (nodeName === "BUTTON") {
        playClick();
      }
    }

    container?.addEventListener("click", handleClick);

    return () => {
      container?.removeEventListener("click", handleClick);
    };
  }, [isEnabled]);

  const playBeep = useCallback(() => {
    isEnabled && _playSound("beep.mp3");
  }, [isEnabled]);

  const speakText = useCallback(
    (sentence: string): Promise<SpeechSynthesisEvent | void> => {
      return new Promise((resolve) => {
        // Prevent speech when disabled
        if (!isEnabled) resolve();

        let audio = new SpeechSynthesisUtterance(sentence);
        audio.voice =
          (
            (window as any).SPEECH_SYNTHESIS_VOICES as SpeechSynthesisVoice[]
          ).find(({ name, lang }) => name === "Daniel" && lang === "en-GB") ??
          null;
        window.speechSynthesis.speak(audio);

        audio.onend = resolve;
      });
    },
    [isEnabled]
  );

  useEffect(() => {
    if (isPlayingTyping) {
      // Restart and play adio
      typingAudioRef.current.currentTime = 0;
      typingAudioRef.current.play();
    } else {
      // Stop playing audio
      typingAudioRef.current.pause();
    }
  }, [isPlayingTyping]);

  useEffect(() => {
    typingAudioRef.current.volume = isEnabled ? 1 : 0;
  }, [isEnabled]);

  return (
    <SFXProviderContext.Provider
      value={{ isPlayingTyping, setIsPlayingTyping, playBeep, speakText }}
    >
      <div ref={containerRef}>{children}</div>
    </SFXProviderContext.Provider>
  );
}

export function playClick(): Promise<void> {
  return _playSound("click.mp3");
}

function _playSound(fileName: string): Promise<void> {
  return new Promise((resolve) => {
    const audio = new Audio(process.env.PUBLIC_URL + "/sfx/" + fileName);
    audio.addEventListener("ended", function () {
      this.remove();
      resolve();
    });
    audio.play();
  });
}

export function useSfx(): ISFXProviderContext {
  return useContext(SFXProviderContext);
}

interface ISFXProviderContext {
  isPlayingTyping: boolean;
  setIsPlayingTyping: React.Dispatch<React.SetStateAction<boolean>>;
  playBeep: () => void;
  speakText: (sentence: string) => void;
}

const SFXProviderContext = createContext<ISFXProviderContext>(
  {} as ISFXProviderContext
);
