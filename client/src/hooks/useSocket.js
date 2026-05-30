import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import useAuthStore from "../context/authStore";

let socketInstance = null;

export const useSocket = () => {
  const { token, isAuthenticated } = useAuthStore();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    if (!socketInstance) {
      socketInstance = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
        auth: { token },
        transports: ["websocket"],
      });
    }

    socketRef.current = socketInstance;

    socketInstance.on("connect", () => {
      console.log("🔌 Socket connected");
    });

    socketInstance.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
    });

    return () => {
      // Don't disconnect on component unmount, keep singleton
    };
  }, [isAuthenticated, token]);

  return socketRef.current;
};

export const getSocket = () => socketInstance;
export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
