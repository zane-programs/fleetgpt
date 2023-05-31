import { Avatar, Box, Flex, Spinner, Text } from "@chakra-ui/react";
import TypewriterText, { Cursor } from "../components/TypewriterText";
import { useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "../utils/storage";
import { Sound, useSfx } from "../utils/sfx";
import { sleep } from "../utils/misc";
import ScriptReady from "./ScriptReady";
import { useApp } from "../App";
import { useSocket } from "../utils/api";

import styles from "./Chat.module.css";

const STALLING_TEXT = [
  "Generating…",
  "Still generating…",
  "Ah, shit. This is going to take a while.",
  "This is what happens when you skip CS lectures.",
  "Your tiny audience is going to leave, and it'll be your fault, not mine.",
  "Oh, never mind! Let me cook.",
  "Enjoy the show, folks! Heh heh.",
  "Loading skit…",
];

export default function Chat() {
  const { scroll } = useApp();
  const { finalString } = useSocket();

  const [welcomeText, setWelcomeText] = useState("");

  const [promptPerson] = useLocalStorage("promptPerson", "");
  const [promptPlace] = useLocalStorage("promptPlace", "");
  const [promptThing] = useLocalStorage("promptThing", "");

  const [isGenerating] = useLocalStorage("isGenerating", false);
  const [scriptIsReady] = useLocalStorage("scriptIsReady", false);
  const [isShowingChatMessages, setIsShowingChatMessages] = useState(false);

  const shouldShowPromptPlace = useMemo(
    () => promptPerson.split("\n").length > 1,
    [promptPerson]
  );
  const shouldShowPromptThing = useMemo(
    () => promptPlace.split("\n").length > 1,
    [promptPlace]
  );

  // Scroll to bottom of page when necessary
  useEffect(() => {
    scroll.toBottom();
  }, [scroll, promptPerson, promptPlace, promptThing, isGenerating]);

  // Auto scroll to bottom of page (not smoothly) on chat update
  useEffect(() => {
    scroll.toBottom(false);
  }, [scroll, finalString]);

  useEffect(() => {
    const timeout = setTimeout(
      () =>
        setWelcomeText(
          `Hey, y'all! I'm FleetGPT, Fleet Street's latest innovation!
          The rules are simple: to write a skit, you'll need a person, place, and thing. Let's go!
          First, let's ask the audience. Give us a person!`
        ),
      1250
    );

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  // const audiencePromptLines = useMemo(
  //   () =>
  //     audiencePrompt
  //       .split("\n\n")
  //       .map((item) => item.split("\n"))
  //       .flat(),
  //   [audiencePrompt]
  // );

  const chatLines = useMemo(
    () =>
      finalString
        .split("\n")
        .map((token) => (token === "" ? <>&nbsp;</> : token)),
    [finalString]
  );

  return (
    <>
      {!isShowingChatMessages && scriptIsReady ? (
        <ScriptReady />
      ) : (
        <Box>
          {/* Welcome */}
          <ChatRow>
            <TypewriterText text={welcomeText} />
          </ChatRow>
          {/* Person response */}
          <ChatResponse text={promptPerson} />
          {/* Place prompt */}
          {shouldShowPromptPlace && (
            <ChatRow>
              <TypewriterText text={"Now, how about a place?"} />
            </ChatRow>
          )}
          {/* Place response */}
          <ChatResponse text={promptPlace} />
          {/* Thing prompt */}
          {shouldShowPromptThing && (
            <ChatRow>
              <TypewriterText text={"Last one. Give us a thing!"} />
            </ChatRow>
          )}
          {/* Thing response */}
          <ChatResponse text={promptThing} />
          {isGenerating && !isShowingChatMessages && (
            <StallingChatRow
              setIsShowingChatMessages={setIsShowingChatMessages}
            />
          )}
        </Box>
      )}
      {isShowingChatMessages && (
        <ChatRow>
          {chatLines.map((line, index) => (
            <Text
              key={index + "_" + line.toString()}
              style={{
                fontSize: typeof line === "string" ? undefined : "0.6em",
              }}
            >
              {line}
              {index + 1 === chatLines.length && typeof line === "string" && (
                <Cursor />
              )}
            </Text>
          ))}
        </ChatRow>
      )}
    </>
  );
}

function ChatResponse({ text }: { text: string }) {
  return (
    <ChatRow isHuman isHidden={!text}>
      <Text>
        {text.split("\n")[0]}
        {text.split("\n").length <= 1 && (
          <Cursor opacity={1} cursor="|" blinkStyle="normal" />
        )}
      </Text>
    </ChatRow>
  );
}

function StallingChatRow({
  setIsShowingChatMessages,
}: {
  setIsShowingChatMessages: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { setIsRunningQueue } = useSocket();

  const [stallingTextIndex, setStallingTextIndex] = useState(0);

  const { playSound, speakText } = useSfx();

  useEffect(() => {
    async function doStalling() {
      for (let i = 0; i < STALLING_TEXT.length; i++) {
        if (i + 1 < STALLING_TEXT.length) {
          await sleep(1000);
          await speakText(STALLING_TEXT[i]);
          setStallingTextIndex((orig) => orig + 1);
        } else {
          setStallingTextIndex(-1);
        }
      }
    }

    doStalling();
  }, [speakText]);

  useEffect(() => {
    playSound(Sound.BEEP);
    if (stallingTextIndex === -1) {
      setIsShowingChatMessages(true);
      setIsRunningQueue(true);
    }
  }, [
    playSound,
    setIsShowingChatMessages,
    stallingTextIndex,
    setIsRunningQueue,
  ]);

  return (
    <ChatRow isPulsing>
      <Flex fontStyle="italic" alignItems="center">
        <Spinner size="xl" thickness="5px" mr="4" display="inline-block" />
        <Text flex="1">
          {stallingTextIndex === -1
            ? "Still generating… *sigh*"
            : STALLING_TEXT[stallingTextIndex]}
        </Text>
      </Flex>
    </ChatRow>
  );
}

function ChatRow({
  children,
  isHuman,
  isHidden,
  isPulsing,
}: React.PropsWithChildren<{
  isHuman?: boolean;
  isHidden?: boolean;
  isPulsing?: boolean;
}>) {
  return (
    <Flex
      background={isHuman ? undefined : "whiteAlpha.300"}
      gap="2"
      px="6"
      pt="6"
      pb="10"
      display={isHidden ? "none" : undefined}
    >
      <Box mt="2" mb="3">
        <Avatar
          className={isPulsing ? styles.pulsingAvatar : undefined}
          size="2xl"
          src={
            process.env.PUBLIC_URL +
            "/img/" +
            (isHuman ? "deandre.jpg" : "bowtie.svg")
          }
        />
      </Box>
      <Box flex="1" fontSize="4xl" px="6">
        {children}
      </Box>
    </Flex>
  );
}
