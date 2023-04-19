import { Box, Button, Heading, Icon, Textarea } from "@chakra-ui/react";
import { Route, useRouter } from "../Router";
import { MdVolumeOff, MdVolumeUp } from "react-icons/md";
import { useApp } from "../App";
import { useLocalStorage } from "../utils/storage";

export default function Admin() {
  const { sfx, overlay } = useApp();
  const { setRoute } = useRouter();
  const [audiencePrompt, setAudiencePrompt] = useLocalStorage(
    "audiencePrompt",
    ""
  );

  return (
    <Box p="4">
      <Heading size="xl" mb="4">
        Admin
      </Heading>
      <Textarea
        value={audiencePrompt}
        onChange={(e) => setAudiencePrompt(e.target.value)}
        size="md"
        placeholder="Audience Prompt"
      />
      <Button onClick={() => overlay.setShowing((showing) => !showing)}>
        {overlay.showing ? "Show Screen" : "Hide Screen"}
      </Button>
      <Button
        leftIcon={<Icon as={sfx.enabled ? MdVolumeUp : MdVolumeOff} />}
        onClick={() => sfx.setEnabled((enabled) => !enabled)}
      >
        SFX: {sfx.enabled ? "On" : "Off"}
      </Button>
      <Button onClick={() => setRoute(Route.HOME)}>Exit</Button>
    </Box>
  );
}
