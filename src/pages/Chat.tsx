import { Avatar, Box, Flex, Text } from "@chakra-ui/react";
import TypewriterText from "../components/TypewriterText";
import { useEffect, useState } from "react";
import { useLocalStorage } from "../utils/storage";

export default function Chat() {
  const [welcomeText, setWelcomeText] = useState("");
  const [audiencePrompt] = useLocalStorage("audiencePrompt", "");

  useEffect(() => {
    const timeout = setTimeout(
      () =>
        setWelcomeText(
          // "Hello! I'm FleetGPT, Stanford's all-original, all-comedy a cappella bot! Fleet Street's computer science majors spent the past three weeks building me instead of taking showers and socializing with...friends.\nSo as you might expect, I write a pretty mean skit, as far as Fleet Street standards go. Even my worst work is better than half of the stuff the group comes up with (see: Bitsmas).\nGot any ideas for a skit? If you can't think of one, may I suggest asking the audience?"
          `Heya! I'm FleetGPT, Stanford's one and only all-original, all-comedy a cappella bot! The Fleet Street computer whizzes cooked me up during a three-week-long, shower-free, anti-social coding marathon. Shampoo? Nah, who needs it when you've got me?

          As you can imagine, I churn out skits that'll have you in stitches – way beyond your average Fleet Street fare. I mean, seriously. Even my most cringe-worthy creations outshine half of what the group dreams up (cough, Bitsmas, cough).
          
          Got a hankering for a side-splitting skit? If you're drawing a blank, fear not! Let's tap into the collective comedic genius of our lovely audience, shall we?`
        ),
      1500
    );

    return () => {
      clearTimeout(timeout);
    };
  });

  return (
    <Box>
      <ChatRow>
        <TypewriterText text={welcomeText} />
      </ChatRow>
      <ChatRow isHuman isHidden={!audiencePrompt}>
        <Text>{audiencePrompt}</Text>
      </ChatRow>
    </Box>
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
      p="6"
      display={isHidden ? "none" : undefined}
    >
      <Box>
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
