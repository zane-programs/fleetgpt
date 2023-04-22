import { Avatar, Box, Flex, Spinner, Text } from "@chakra-ui/react";
import TypewriterText, { Cursor } from "../components/TypewriterText";
import { useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "../utils/storage";
import YTOverlay from "../components/YTOverlay";
import { Sound, useSfx } from "../utils/sfx";
import { sleep } from "../utils/misc";
import ScriptReady from "./ScriptReady";

const STALLING_TEXT = [
  "Generating…",
  "Still generating…",
  "Ah, shit. This is going to take a while.",
  "This is what happens when you skip CS lectures.",
  "If you don't do something, your tiny audience is going to leave.",
  'You know what? I\'m just gonna show them a video skit you "people" made.',
  "Enjoy the show, folks! Heh heh.",
  "Loading video…",
];

export default function Chat() {
  const [welcomeText, setWelcomeText] = useState("");
  const [audiencePrompt] = useLocalStorage("audiencePrompt", "");
  const [isGenerating] = useLocalStorage("isGenerating", false);
  const [scriptIsReady] = useLocalStorage("scriptIsReady", false);
  const [isShowingVideo, setIsShowingVideo] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(
      () =>
        setWelcomeText(
          `Heya! I'm FleetGPT, Stanford's all-original, all-comedy a cappella bot! The Fleet Street computer whizzes cooked me up during a three-week-long, shower-free, anti-social coding marathon. Shampoo? Nah, who needs it when you've got me?
          As you can imagine, I churn out skits that'll have you in stitches – way beyond your average Fleet Street fare. I mean, seriously. Even my most cringe-worthy creations outshine half of what the group dreams up (cough, Bitsmas, cough).
          So, do you have any ideas for a skit? Maybe ask your lovely audience? :-)`
        ),
      1250
    );

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const audiencePromptLines = useMemo(
    () =>
      audiencePrompt
        .split("\n\n")
        .map((item) => item.split("\n"))
        .flat(),
    [audiencePrompt]
  );

  return (
    <>
      {!isShowingVideo && scriptIsReady ? (
        <ScriptReady />
      ) : (
        <Box>
          <ChatRow>
            <TypewriterText text={welcomeText} />
          </ChatRow>
          <ChatRow isHuman isHidden={!audiencePrompt}>
            {audiencePromptLines.map((line, index) => (
              <Text key={index + "_" + line}>
                {line}
                {!isGenerating && index + 1 === audiencePromptLines.length && (
                  <Cursor opacity={1} cursor="|" blinkStyle="normal" />
                )}
              </Text>
            ))}
          </ChatRow>
          {isGenerating && (
            <StallingChatRow setIsShowingVideo={setIsShowingVideo} />
          )}
        </Box>
      )}
      {isShowingVideo && (
        <YTOverlay
          url="https://www.youtube.com/watch?v=rN--BCpU-78" /* the group is too big. */
          // url="https://www.youtube.com/watch?v=34ZMVARbuU4" /* dorm alone 2 trailer */
          // url="https://www.youtube.com/watch?v=Vj4Y1c-DSM0" /* 15 sec video filler */
          onEnded={() => setIsShowingVideo(false)}
        />
      )}
    </>
  );
}

function StallingChatRow({
  setIsShowingVideo,
}: {
  setIsShowingVideo: React.Dispatch<React.SetStateAction<boolean>>;
}) {
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
    setIsShowingVideo(stallingTextIndex === -1);
  }, [playSound, setIsShowingVideo, stallingTextIndex]);

  return (
    <ChatRow>
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
}: React.PropsWithChildren<{ isHuman?: boolean; isHidden?: boolean }>) {
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
