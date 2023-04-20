import { Box } from "@chakra-ui/react";
import ReactPlayer from "react-player";
import { useWindowDimensions } from "../utils/dimensions";

export default function YTOverlay({
  url,
  onEnded,
}: {
  url: string;
  onEnded?: () => void;
}) {
  const { width, height } = useWindowDimensions();
  return (
    <Box
      position="absolute"
      top="0"
      left="0"
      background="black"
      style={{ width, height }}
    >
      <ReactPlayer
        url={url}
        playing={true}
        controls={false}
        width={width}
        height={height}
        onEnded={onEnded}
        config={{ youtube: { playerVars: { disablekb: 1, showinfo: 0 } } }}
      />
    </Box>
  );
}
