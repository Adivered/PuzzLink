import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessagesInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";
import { useAuthStore } from "../store/hooks/useAuthStore";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { user: authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    }
    return () => unsubscribeFromMessages();
  }, [selectedUser?._id]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput currentUser={authUser} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isMyMessage = message.senderId === authUser?._id;
          const senderName = isMyMessage
            ? authUser?.username || "?"
            : selectedUser?.username || "?";
          const initial = senderName.charAt(0).toUpperCase();

          return (
            <div
              key={message._id || message.createdAt}
              className={`flex items-start gap-2 ${
                isMyMessage ? "justify-end" : "justify-start"
              }`}
              ref={messageEndRef}
            >
              {!isMyMessage && (
                <div className="bg-neutral text-white rounded-full w-10 h-10 flex items-center justify-center text-lg border">
                  {initial}
                </div>
              )}
              <div
                className={`max-w-xs p-3 rounded-xl ${
                  isMyMessage ? "bg-green-200 text-right" : "bg-gray-200 text-left"
                }`}
              >
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="rounded mb-2 max-w-[150px]"
                  />
                )}
                {message.text && <p>{message.text}</p>}
                <div className="text-xs text-gray-500 mt-1">
                  {formatMessageTime(message.createdAt)}
                </div>
              </div>
              {isMyMessage && (
                <div className="bg-neutral text-white rounded-full w-10 h-10 flex items-center justify-center text-lg border">
                  {initial}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <MessageInput currentUser={authUser} />
    </div>
  );
};

export default ChatContainer;
