import ConfettiExplosion from "react-confetti-explosion";
import { useWindowDimensions } from "../utils/dimensions";
import { Box, Flex, Heading } from "@chakra-ui/react";
import { useEffect } from "react";
import { Sound, useSfx } from "../utils/sfx";

export default function ScriptReady() {
  const { width, height } = useWindowDimensions();
  const { playSound, speakText } = useSfx();

  useEffect(() => {
    playSound(Sound.TADA, 0.5);

    const speakTimeout = setTimeout(() => {
      speakText(
        "Congratulations Fleet Street. My newest masterpiece is complete! Check your handheld displays for more information, and get ready to perform. Break a leg!"
      );
    }, 2000);

    return () => {
      clearTimeout(speakTimeout);
    };
  }, [playSound, speakText]);

  return (
    <Flex alignItems="center" justifyContent="center" height={height}>
      <Box>
        <Heading fontSize="8xl">All Done!</Heading>
        <Box position="relative" top="-200px">
          <ConfettiExplosion
            width={width}
            duration={3200}
            particleCount={200}
            colors={["#eeeeee", "#c90620"]}
          />
        </Box>
      </Box>
    </Flex>
  );
}
