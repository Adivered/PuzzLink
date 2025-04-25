import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./hooks/useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    const user = useAuthStore.getState().user;

    try {
      const res = await axiosInstance.get("/messages/users", {
        params: { senderId: user?._id },
      });
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users.");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    const user = useAuthStore.getState().user;

    try {
      const res = await axiosInstance.get(`/messages/${userId}`, {
        params: { senderId: user?._id },
      });
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages.");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const user = useAuthStore.getState().user;

    if (!user || !selectedUser) {
      toast.error("Cannot send message. Missing user or recipient.");
      return;
    }

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, {
        senderId: user._id,
        ...messageData,
      });

      set({ messages: [...messages, res.data] });

      const socket = useAuthStore.getState().socket;
      if (socket) {
        socket.emit("sendMessage", {
          receiverId: selectedUser._id,
          message: res.data, // 🟢 שולח את כל האובייקט כולל createdAt
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message.");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket || typeof socket.on !== "function") return;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket || typeof socket.off !== "function") return;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
