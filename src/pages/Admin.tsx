import {
  Box,
  Button,
  ButtonGroup,
  Heading,
  Icon,
  Textarea,
} from "@chakra-ui/react";
import { Route, useRouter } from "../Router";
import { MdVolumeOff, MdVolumeUp } from "react-icons/md";
import { useApp } from "../App";
import { useLocalStorage } from "../utils/storage";
import { useCallback, useEffect } from "react";
import { generateScript } from "../utils/api";
import { usePointer } from "../components/PointerProvider";

export default function Admin() {
  const { sfx, overlay } = useApp();
  const { setRoute } = useRouter();
  const { setEnabled: setPointerEnabled } = usePointer();
  const [audiencePrompt, setAudiencePrompt] = useLocalStorage(
    "audiencePrompt",
    ""
  );
  const [isGenerating, setIsGenerating] = useLocalStorage(
    "isGenerating",
    false
  );
  const [scriptIsReady, setScriptIsReady] = useLocalStorage(
    "scriptIsReady",
    false
  );

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    await generateScript(audiencePrompt);
    setScriptIsReady(true);
  }, [audiencePrompt, setIsGenerating, setScriptIsReady]);

  useEffect(() => {
    setPointerEnabled(false);
    return () => {
      setPointerEnabled(true);
    };
  }, [setPointerEnabled]);

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
        mb="4"
      />
      <ButtonGroup gap={2} mb="6" display="block">
        <Button
          onClick={handleGenerate}
          isLoading={isGenerating && !scriptIsReady}
          isDisabled={scriptIsReady}
        >
          {scriptIsReady ? "Script Ready!" : "Generate"}
        </Button>
      </ButtonGroup>
      <ButtonGroup gap={2} mb="6" display="block">
        <Button onClick={() => overlay.setShowing((showing) => !showing)}>
          {overlay.showing ? "Show Screen" : "Hide Screen"}
        </Button>
        <Button
          leftIcon={<Icon as={sfx.enabled ? MdVolumeUp : MdVolumeOff} />}
          onClick={() => sfx.setEnabled((enabled) => !enabled)}
        >
          SFX: {sfx.enabled ? "On" : "Off"}
        </Button>
      </ButtonGroup>
      <ButtonGroup gap={2}>
        <Button onClick={resetApp} colorScheme="red">
          Reset App
        </Button>
        <Button onClick={() => setRoute(Route.HOME)}>Exit</Button>
      </ButtonGroup>
    </Box>
  );
}

function resetApp() {
  if (window.confirm("Reset app? This action cannot be undone.")) {
    localStorage.clear();
    window.location.reload();
  }
}
