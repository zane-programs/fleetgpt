import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export enum Sound {
  BEEP = "beep.mp3",
  TADA = "tada.mp3",
  CLICK = "click.mp3",
  TYPING = "typing.mp3",
}

export function SFXProvider({
  isEnabled,
  children,
}: React.PropsWithChildren<{ isEnabled: boolean }>) {
  const [isPlayingTyping, setIsPlayingTyping] = useState(false);

  const typingAudioRef = useRef<HTMLAudioElement>(
    new Audio(process.env.PUBLIC_URL + "/sfx/" + Sound.TYPING)
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

  const playSound = useCallback(
    (sound: Sound, volume?: number) => {
      isEnabled && _playSound(sound, volume);
    },
    [isEnabled]
  );

  const speakText = useCallback(
    (sentence: string): Promise<SpeechSynthesisEvent | void> => {
      return new Promise((resolve) => {
        // Prevent speech when disabled
        if (!isEnabled) resolve();

        let audio = new SpeechSynthesisUtterance(sentence);
        audio.volume = 0.55;
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
    typingAudioRef.current.volume = 0.3;
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
      value={{ isPlayingTyping, setIsPlayingTyping, playSound, speakText }}
    >
      <div ref={containerRef}>{children}</div>
    </SFXProviderContext.Provider>
  );
}

export function playClick(): Promise<void> {
  return _playSound(Sound.CLICK, 0.35);
}

function _playSound(fileName: Sound | string, volume?: number): Promise<void> {
  return new Promise((resolve) => {
    const audio = new Audio(process.env.PUBLIC_URL + "/sfx/" + fileName);
    audio.volume = volume ?? 1;
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
  playSound: (sound: Sound, volume?: number) => void;
  speakText: (sentence: string) => void;
}

const SFXProviderContext = createContext<ISFXProviderContext>(
  {} as ISFXProviderContext
);
