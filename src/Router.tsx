import { createContext, useContext, useState } from "react";

// Pages
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Admin from "./pages/Admin";

interface IRouterContext {
  route: Route;
  setRoute: React.Dispatch<React.SetStateAction<Route>>;
}
const RouterContext = createContext({} as IRouterContext);

export default function Router({
  defaultRoute,
  children,
}: React.PropsWithChildren<{ defaultRoute: Route }>) {
  const [route, setRoute] = useState<Route>(defaultRoute);

  return (
    <RouterContext.Provider value={{ route, setRoute }}>
      {children}
    </RouterContext.Provider>
  );
}

export function Outlet() {
  const { route } = useRouter();

  return <>{routes[route]}</>;
}

export function useRouter(): IRouterContext {
  return useContext(RouterContext);
}

export enum Route {
  HOME = "home",
  CHAT = "chat",
  ADMIN = "admin",
}

export const routes: { [route in Route]: React.ReactNode } = {
  [Route.HOME]: <Home />,
  [Route.CHAT]: <Chat />,
  [Route.ADMIN]: <Admin />,
};
