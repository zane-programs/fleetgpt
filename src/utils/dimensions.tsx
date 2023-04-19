import { createContext, useContext, useEffect, useState } from "react";

interface IWindowDimensionsContext {
  width: number;
  height: number;
}

const WindowDimensionsContext = createContext<IWindowDimensionsContext>(
  {} as IWindowDimensionsContext
);

export function useWindowDimensions() {
  return useContext(WindowDimensionsContext);
}

export function WindowDimensionsProvider({
  children,
}: React.PropsWithChildren<{}>) {
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    }

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <WindowDimensionsContext.Provider value={{ width, height }}>
      {children}
    </WindowDimensionsContext.Provider>
  );
}
