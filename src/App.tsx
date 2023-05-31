import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { Outlet, Route, useRouter } from "./Router";
import { useLocalStorage, LocalStorageSetter } from "./utils/storage";
import { Box, BoxProps } from "@chakra-ui/react";
import { useWindowDimensions } from "./utils/dimensions";
import { SFXProvider } from "./utils/sfx";
import PointerProvider, { usePointer } from "./components/PointerProvider";
import { SocketProvider } from "./utils/api";

interface IAppContext {
  sfx: {
    enabled: boolean;
    setEnabled: LocalStorageSetter<boolean>;
  };
  overlay: {
    showing: boolean;
    setShowing: LocalStorageSetter<boolean>;
  };
  scroll: {
    toBottom: (smooth?: boolean) => void;
  };
}
const AppContext = createContext<IAppContext>({} as IAppContext);

export function useApp(): IAppContext {
  return useContext(AppContext);
}

export default function App() {
  const { route } = useRouter();

  const [sfxEnabled, setSfxEnabled] = useLocalStorage("sfxEnabled", true);
  const [showingOverlay, setShowingOverlay] = useLocalStorage(
    "showingOverlay",
    true
  );
  useEffect(() => {
    // Preload images
    preloadImage("deandre.jpg");
    preloadImage("bowtie.svg");
  }, []);

  const adminViewOverride = useCallback(
    (bool: boolean) => (route === Route.ADMIN ? false : bool),
    [route]
  );

  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((smooth: boolean = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  }, []);

  return (
    <AppContext.Provider
      value={{
        sfx: { enabled: sfxEnabled, setEnabled: setSfxEnabled },
        overlay: { showing: showingOverlay, setShowing: setShowingOverlay },
        scroll: { toBottom: scrollToBottom },
      }}
    >
      <SocketProvider>
        <SFXProvider isEnabled={adminViewOverride(sfxEnabled)}>
          <PointerProvider>
            <AppInner />
            <div ref={bottomRef} />
          </PointerProvider>
        </SFXProvider>
        <BlackOverlay
          isVisible={adminViewOverride(showingOverlay)}
          onDoubleClick={() => document.documentElement.requestFullscreen()}
        />
      </SocketProvider>
    </AppContext.Provider>
  );
}

function AppInner() {
  const { route } = useRouter();
  const { setEnabled: setPointerEnabled } = usePointer();
  const {
    overlay: { showing: showingOverlay },
  } = useApp();

  useEffect(() => {
    if (route === Route.CHAT) {
      setPointerEnabled(false);
    } else if (route !== Route.ADMIN) {
      setPointerEnabled(!showingOverlay);
    }
  }, [route, setPointerEnabled, showingOverlay]);

  return (
    <Box userSelect="none">
      <Outlet />
    </Box>
  );
}

interface IBlackOverlayProps extends BoxProps {
  isVisible: boolean;
}

function BlackOverlay({ isVisible, ...props }: IBlackOverlayProps) {
  const { width, height } = useWindowDimensions();
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      width={width}
      height={height}
      background={isVisible ? "rgba(0,0,0,1)" : "rgba(0,0,0,0)"}
      pointerEvents={isVisible ? "auto" : "none"}
      z-index="9999"
      {...props}
    />
  );
}

function preloadImage(fileName: string): void {
  new Image().src = process.env.PUBLIC_URL + "/img/" + fileName;
}
