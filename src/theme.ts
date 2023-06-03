import { extendTheme } from "@chakra-ui/theme-utils";

const theme = extendTheme({
  config: { initialColorMode: "dark", useSystemColorMode: false },
  fonts: {
    heading: `'ChatGPTFont', sans-serif`,
    body: `'ChatGPTFont', sans-serif`,
  },
  components: {
    Heading: {
      baseStyle: {
        fontWeight: "600",
      },
    },
  },
});

export default theme;
