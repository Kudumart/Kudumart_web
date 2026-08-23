import ChatSideBar from "./sideBar";
import ChatInterface from "./chatBody";
import { useState } from "react";
import { useConversation } from "../../../../api/message";
import useAppState from "../../../../hooks/appState";
import { FiMessageSquare } from "react-icons/fi";

export default function Messenger() {
  const { user } = useAppState();
  const [selectedInterface, setSelectedInterface] = useState(null);

  const {
    data: conversations,
    isLoading: isGettingConversations,
  } = useConversation();

  const openInterface = (data) => {
    setSelectedInterface(data);
  };

  return (
    // h-full inherits the explicit height from Messages/index.jsx
    <div className="flex w-full h-full bg-white md:rounded-xl shadow-sm overflow-hidden">

      {/* ──────────────── DESKTOP ──────────────── */}

      {/* Sidebar — always visible on desktop */}
      <div className="hidden md:flex flex-col w-[320px] xl:w-[340px] shrink-0 border-r border-gray-200 h-full">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white shrink-0">
          <h1 className="text-lg font-bold text-gray-900">Messages</h1>
          <FiMessageSquare className="w-5 h-5 text-gray-400" />
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatSideBar
            setOpenedMessage={openInterface}
            conversations={conversations}
            currentUser={user}
            isLoading={isGettingConversations}
            selectedId={selectedInterface?.id}
          />
        </div>
      </div>

      {/* Chat panel — desktop */}
      <div className="hidden md:flex flex-col flex-1 h-full overflow-hidden">
        {selectedInterface ? (
          <ChatInterface
            key={selectedInterface.id}
            conversationId={selectedInterface.id}
            currentUser={user}
            productId={selectedInterface.productId}
            selectedConversation={selectedInterface}
          />
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 text-gray-400 select-none gap-3">
            <FiMessageSquare className="w-14 h-14 text-gray-200" />
            <p className="text-sm font-medium">Select a conversation to start chatting</p>
          </div>
        )}
      </div>

      {/* ──────────────── MOBILE ──────────────── */}
      <div className="flex md:hidden flex-col w-full h-full overflow-hidden">
        {selectedInterface ? (
          <ChatInterface
            key={selectedInterface.id}
            conversationId={selectedInterface.id}
            productId={selectedInterface.productId}
            selectedConversation={selectedInterface}
            currentUser={user}
            closeInterface={() => setSelectedInterface(null)}
          />
        ) : (
          <>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white shrink-0">
              <h1 className="text-lg font-bold text-gray-900">Messages</h1>
              <FiMessageSquare className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatSideBar
                conversations={conversations}
                setOpenedMessage={openInterface}
                currentUser={user}
                isLoading={isGettingConversations}
                selectedId={null}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
