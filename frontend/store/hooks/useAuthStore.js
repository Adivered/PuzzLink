//realId - testUser : 680372970fded7e0c0bcbd2c
//realId - SecondUser : 68037f6e0fded7e0c0bcbd2d

// frontend/src/store/hooks/useAuthStore.js

import { create } from "zustand";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

const USERS = {
  test: {
    _id: "680372970fded7e0c0bcbd2c",
    username: "TestUser",
    profilePic: "/avatar.png",
  },
  second: {
    _id: "68037f6e0fded7e0c0bcbd2d",
    username: "SecondUser",
    profilePic: "/avatar.png",
  },
};

export const useAuthStore = create((set, get) => {
  // קריאה מה־URL ?user=test
  const urlParams = new URLSearchParams(window.location.search);
  const currentUser = urlParams.get("user") || "test";

  const user = USERS[currentUser];

  const socket = io(BASE_URL, {
    query: { userId: user._id },
  });
  socket.connect();

  set({ socket });

  socket.on("getOnlineUsers", (userIds) => {
    set({ onlineUsers: userIds });
  });

  return {
    user,
    socket,
    onlineUsers: [],
    connectSocket: () => {}, // כבר מחובר
    disconnectSocket: () => {
      const socket = get().socket;
      if (socket?.connected) socket.disconnect();
    },
  };
});
