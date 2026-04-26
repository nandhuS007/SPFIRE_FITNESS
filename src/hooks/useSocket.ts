import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // In our setup, the socket server is the same as the app host
    socketRef.current = io();

    socketRef.current.on("connect", () => {
      console.log("Connected to real-time server");
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const emitActivityUpdate = (data: any) => {
    if (socketRef.current) {
      socketRef.current.emit("activity:update", data);
    }
  };

  return { emitActivityUpdate };
}
