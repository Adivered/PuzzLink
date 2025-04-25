import { X } from "lucide-react";
import { useAuthStore } from "../store/hooks/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar placeholder">
            <div className="bg-neutral text-neutral-content rounded-full size-10 flex items-center justify-center font-bold">
              {selectedUser.username
                .split(" ")
                .map((word) => word[0])
                .join("")
                .toUpperCase()}
            </div>
          </div>

          {/* Username + Online (with adjusted alignment for "Online") */}
          <div className="flex flex-col justify-center">
            <h3 className="font-medium">{selectedUser.username}</h3>
            <p className="text-sm text-green-500 ml-2">Online</p>
          </div>
        </div>

        <button onClick={() => setSelectedUser(null)}>
          <X />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
