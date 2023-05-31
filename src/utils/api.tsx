import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";

export const API_HOST = "http://localhost:3001";

export interface APIResponse<T = any> {
  error?: string;
  data?: T;
}

export async function generateScript(
  prompt: string
): Promise<APIResponse<"success">> {
  const req = await fetch(API_HOST + "/generateScript", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({ prompt, type: "dark" }),
  });

  const res = await req.json();

  return res as APIResponse<"success">;
}

export async function generateScriptPPT(
  person: string,
  place: string,
  thing: string
): Promise<APIResponse<"success">> {
  const req = await fetch(API_HOST + "/generateScript", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      prompt: `Person: ${person}\nPlace: ${place}\nThing: ${thing}`,
      type: "ppt_v3",
    }),
  });

  const res = await req.json();

  return res as APIResponse<"success">;
}

export async function speakTextOnServer(
  text: string,
  voice?: string,
  speed?: number
): Promise<APIResponse<"success">> {
  const req = await fetch(API_HOST + "/speakText", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({ text, voice, speed }),
  });

  const res = await req.json();

  return res as APIResponse<"success">;
}

const socket = io(API_HOST);
interface ISocketContext {
  socket: Socket;
  setIsRunningQueue: React.Dispatch<React.SetStateAction<boolean>>;
  finalString: string;
}
const SocketContext = createContext<ISocketContext>({} as ISocketContext);
export function useSocket() {
  return useContext(SocketContext);
}
export function SocketProvider({ children }: React.PropsWithChildren<{}>) {
  const tokenQueue = useRef<string[]>([]);
  const [isRunningQueue, setIsRunningQueue] = useState(false);
  const [finalString, setFinalString] = useState("");

  useEffect(() => {
    const handleConnect = () => console.log("connected");
    const handleDisconnect = () => console.log("disconnect");

    function handleChatToken(token: string) {
      tokenQueue.current.push(token);
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("chatToken", handleChatToken);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("chatToken", handleChatToken);
    };
  }, []);

  useEffect(() => {
    const queueHandlingInterval = setInterval(() => {
      if (isRunningQueue && tokenQueue.current.length > 0) {
        setFinalString((previous) => previous + tokenQueue.current.shift());
      }
    }, 210);

    return () => {
      clearInterval(queueHandlingInterval);
    };
  }, [isRunningQueue, tokenQueue]);

  return (
    <SocketContext.Provider
      value={{ socket, setIsRunningQueue, finalString }}
      children={children}
    />
  );
}
