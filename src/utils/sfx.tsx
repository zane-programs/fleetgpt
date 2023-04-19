import { createContext, useContext, useEffect, useRef, useState } from "react";

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
    typingAudioRef.current.loop = true;
  }, []);

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
      value={{ isPlayingTyping, setIsPlayingTyping }}
    >
      <div ref={containerRef}>{children}</div>
    </SFXProviderContext.Provider>
  );
}

export function playClick(): Promise<void> {
  return new Promise((resolve) => {
    const audio = new Audio(process.env.PUBLIC_URL + "/sfx/click.mp3");
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
}

const SFXProviderContext = createContext<ISFXProviderContext>(
  {} as ISFXProviderContext
);
