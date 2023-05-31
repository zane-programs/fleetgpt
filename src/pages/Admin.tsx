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
import { generateScriptPPT } from "../utils/api";
import { usePointer } from "../components/PointerProvider";

export default function Admin() {
  const { sfx, overlay } = useApp();
  const { setRoute } = useRouter();
  const { setEnabled: setPointerEnabled } = usePointer();

  const [promptPerson, setPromptPerson] = useLocalStorage("promptPerson", "");
  const [promptPlace, setPromptPlace] = useLocalStorage("promptPlace", "");
  const [promptThing, setPromptThing] = useLocalStorage("promptThing", "");

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
    await generateScriptPPT(promptPerson, promptPlace, promptThing);
    setScriptIsReady(true);
  }, [
    promptPerson,
    promptPlace,
    promptThing,
    setIsGenerating,
    setScriptIsReady,
  ]);

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

      <ControlledTextField
        value={promptPerson}
        setValue={setPromptPerson}
        placeholder="Person"
      />
      <ControlledTextField
        value={promptPlace}
        setValue={setPromptPlace}
        placeholder="Place"
      />
      <ControlledTextField
        value={promptThing}
        setValue={setPromptThing}
        placeholder="Thing"
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

function ControlledTextField({
  value,
  setValue,
  placeholder,
}: {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  placeholder?: string;
}) {
  return (
    <Textarea
      value={value}
      onChange={(e) => setValue(e.target.value)}
      size="sm"
      placeholder={placeholder}
      mb="4"
    />
  );
}

function resetApp() {
  if (window.confirm("Reset app? This action cannot be undone.")) {
    localStorage.clear();
    window.location.reload();
  }
}
