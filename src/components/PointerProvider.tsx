import { Box } from "@chakra-ui/react";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import styled from "@emotion/styled";
import { useWindowDimensions } from "../utils/dimensions";

const PointerContainer = styled(Box)`
  ${({ enabled }: { enabled: any }) =>
    enabled
      ? `cursor: none;

  & * {
    cursor: none !important;
  }`
      : ""}
`;

export default function PointerProvider({
  children,
}: React.PropsWithChildren<{}>) {
  const [enabled, setEnabled] = useState<boolean>(false);

  const { height } = useWindowDimensions();

  return (
    <PointerProviderContext.Provider value={{ enabled, setEnabled }}>
      <PointerContainer
        enabled={enabled ? "yes" : ""}
        style={{ minHeight: height }}
      >
        {children}
        {enabled && <Pointer />}
      </PointerContainer>
    </PointerProviderContext.Provider>
  );
}

export function usePointer() {
  return useContext(PointerProviderContext);
}

interface IPointerProviderContext {
  enabled: boolean;
  setEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}
const PointerProviderContext = createContext<IPointerProviderContext>(
  {} as IPointerProviderContext
);

export function Pointer() {
  const [visible, setVisible] = useState<boolean>(false);
  const [position, setPosition] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    function show() {
      setVisible(true);
    }
    function hide() {
      setVisible(false);
    }
    function handleMouseMove({ clientX, clientY }: MouseEvent) {
      setPosition([clientX, clientY]);
    }

    document.documentElement.addEventListener("mouseenter", show);
    document.documentElement.addEventListener("mousemove", show);
    document.documentElement.addEventListener("mouseleave", hide);
    document.documentElement.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.documentElement.removeEventListener("mouseenter", show);
      document.documentElement.removeEventListener("mouseleave", hide);
      document.documentElement.removeEventListener(
        "mousemove",
        handleMouseMove
      );
    };
  }, []);

  const pointerTranslate = useMemo(
    () => `translate(${position[0]}px,${position[1]}px)`,
    [position]
  );

  return (
    <Box
      pointerEvents="none"
      width="24"
      height="24"
      position="absolute"
      top="0"
      left="0"
      opacity={visible ? 1 : 0}
      style={{ transform: pointerTranslate }}
      zIndex="9990"
    >
      <svg
        height="100%"
        viewBox="0 0 22 22"
        width="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="none" fillRule="evenodd">
          <path
            d="m6.148 18.473 1.863-1.003 1.615-.839-2.568-4.816h4.332l-11.379-11.408v16.015l3.316-3.221z"
            fill="#fff"
          />
          <path
            d="m6.431 17 1.765-.941-2.775-5.202h3.604l-8.025-8.043v11.188l2.53-2.442z"
            fill="#000"
          />
        </g>
      </svg>
    </Box>
  );
}
