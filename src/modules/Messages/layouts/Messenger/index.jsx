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

  const renderedUser =
    selectedInterface?.receiverUser?.id === user?.id
      ? selectedInterface?.senderUser
      : selectedInterface?.receiverUser;

  return (
    <div className="flex flex-col w-full bg-white md:rounded-xl md:shadow-sm overflow-hidden" style={{ height: "calc(100vh - 100px)" }}>

      {/* ── DESKTOP LAYOUT ── */}
      <div className="hidden md:flex w-full h-full">
        {/* Sidebar */}
        <div className="w-[340px] shrink-0 flex flex-col border-r border-gray-200 h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white">
            <h1 className="text-lg font-bold text-gray-900">Messages</h1>
            <FiMessageSquare className="w-5 h-5 text-gray-500" />
          </div>

          <ChatSideBar
            setOpenedMessage={openInterface}
            conversations={conversations}
            currentUser={user}
            isLoading={isGettingConversations}
            selectedId={selectedInterface?.id}
          />
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col h-full">
          {selectedInterface ? (
            <ChatInterface
              key={selectedInterface.id}
              conversationId={selectedInterface.id}
              currentUser={user}
              productId={selectedInterface.productId}
              selectedConversation={selectedInterface}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 select-none">
              <FiMessageSquare className="w-16 h-16 mb-4 text-gray-200" />
              <p className="text-base font-medium">Select a conversation</p>
              <p className="text-sm mt-1">Choose from your conversations on the left</p>
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE LAYOUT ── */}
      <div className="flex md:hidden w-full h-full flex-col">
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
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white">
              <h1 className="text-lg font-bold text-gray-900">Messages</h1>
              <FiMessageSquare className="w-5 h-5 text-gray-500" />
            </div>
            <ChatSideBar
              conversations={conversations}
              setOpenedMessage={openInterface}
              currentUser={user}
              isLoading={isGettingConversations}
              selectedId={selectedInterface?.id}
            />
          </>
        )}
      </div>
    </div>
  );
}
