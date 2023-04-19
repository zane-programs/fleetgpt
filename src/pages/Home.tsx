import {
  Button,
  ButtonGroup,
  ButtonProps,
  Flex,
  Heading,
  Icon,
  Text,
} from "@chakra-ui/react";
import { useWindowDimensions } from "../utils/dimensions";
import { MdEditNote, MdMusicNote, MdTheaterComedy } from "react-icons/md";
import { Route, useRouter } from "../Router";
import { forwardRef, useEffect, useState } from "react";

const ADMIN_CLICK_THRESHOLD = 10;

export default function Home() {
  const { setRoute } = useRouter();
  const { height } = useWindowDimensions();

  const [adminClicks, setAdminClicks] = useState(0);

  useEffect(() => {
    if (adminClicks >= ADMIN_CLICK_THRESHOLD) {
      setRoute(Route.ADMIN);
    }
  }, [adminClicks, setRoute]);

  // Clear audience prompt on fresh load
  useEffect(() => {
    localStorage.setItem("audiencePrompt", '""');
  });

  return (
    <Flex
      alignItems="center"
      justifyContent="center"
      style={{ height }}
      flexDir="column"
      gap="2"
    >
      <Heading fontSize="8xl">FleetGPT</Heading>
      <Flex
        alignItems="center"
        justifyContent="center"
        flexDir="column"
        gap="8"
      >
        <Text fontStyle="italic" color="gray.300" fontSize="4xl">
          What would you like to write today?
        </Text>
        <ButtonGroup gap="2">
          <MegaButton leftIcon={<Icon as={MdMusicNote} />}>Song</MegaButton>
          <MegaButton
            leftIcon={<Icon as={MdTheaterComedy} />}
            onClick={() => setRoute(Route.CHAT)}
          >
            Skit
          </MegaButton>
          <MegaButton
            leftIcon={<Icon as={MdEditNote} />}
            onClick={() => setAdminClicks((clicks) => clicks + 1)}
          >
            TSF Letter
          </MegaButton>
        </ButtonGroup>
      </Flex>
    </Flex>
  );
}

const MegaButton = forwardRef(function (props: ButtonProps, ref) {
  return (
    <Button
      // @ts-ignore
      ref={ref}
      fontSize="4xl"
      px="10"
      py="12"
      {...props}
    />
  );
});
