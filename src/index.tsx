import ReactDOM from "react-dom/client";
import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme";
import { WindowDimensionsProvider } from "./utils/dimensions";
import Router, { Route } from "./Router";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <ChakraProvider theme={theme}>
    <WindowDimensionsProvider>
      <Router
        defaultRoute={
          window.location.search === "?admin" ? Route.ADMIN : Route.HOME
        }
      >
        <App />
      </Router>
    </WindowDimensionsProvider>
  </ChakraProvider>
);
