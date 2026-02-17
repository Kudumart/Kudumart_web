import { Button } from "@material-tailwind/react";
import ChatSideBar from "./sideBar";
import ChatInterface from "./chatBody";
import { useEffect, useState } from "react";
import { useConversation } from "../../../../api/message";
import { io } from "socket.io-client";
import useAppState from "../../../../hooks/appState";

export default function Messenger() {
  const { user } = useAppState();

  const [selectedInterface, setSelectedInterface] = useState(null);
  // const socket = io("https://api.kudumart.com", {
  //   transports: ["websocket"],
  // });
  
  // function registerUser() {
  //   if (socket.connected) {
  //     socket.emit("register", userId);
  //     console.log("Registered user:", userId);
  //   } else {
  //     console.log("Socket not connected, retrying...");
  //   }
  // }
  
  // useEffect(() => {
  //   // Listen for connection
  //   socket.on("connect", () => {
  //     console.log("Socket connected:", socket.id);
  //     registerUser(); // Register the user after connecting
  //     console.log("Socket status inside connect:", socket.connected); // Confirm connected status
  //   });
  
  //   // Listen for disconnect
  //   socket.on("disconnect", () => {
  //     console.log("Socket disconnected");
  //   });
  
  //   // Listen for received messages
  //   socket.on("receiveMessage", (message) => {
  //     console.log("Received message:", message);
  //   });
  
  //   // Cleanup event listeners
  //   return () => {
  //     socket.off("connect");
  //     socket.off("disconnect");
  //     socket.off("receiveMessage");
  //   };
  // }, []);
  
  // console.log("Socket status before connect:", socket.connected); // Initial status (likely false)
  

  const openInterface = (data) => {
    setSelectedInterface(data);
  };

  const {
    data: conversations,
    isLoading: isGettingConversations,
    error,
  } = useConversation();


  const renderedUser = selectedInterface?.receiverUser?.id === user?.id  ? selectedInterface?.senderUser : selectedInterface?.receiverUser;

  return (
    <>
      <div className="w-full flex justify-between md:shadow-lg md:py-5 py-3 bg-white px-6 gap-10 rounded-t-md">
        <div className="md:w-[32%] w-full h-full flex justify-between items-center">
          <span className="md:text-lg text-base font-semibold flex grow">
            MESSAGES
          </span>
          <span className="md:flex hidden">
            <svg
              width="25"
              height="15"
              viewBox="0 0 29 19"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.625 18.75V15.6667H28.375V18.75H0.625ZM0.625 11.0417V7.95833H28.375V11.0417H0.625ZM0.625 3.33333V0.25H28.375V3.33333H0.625Z"
                fill="black"
              />
            </svg>
          </span>
        </div>

        <div className="md:w-[68%] h-full md:flex hidden justify-between items-center">
          <span className="text-sm mt-1 font-semibold flex grow">
            {renderedUser?.firstName}{" "}
            {renderedUser?.lastName}
          </span>
         {/* <span className="flex">
            <Button className="px-4 rounded-md py-2 bg-[rgba(72,133,237,1)] text-white text-xs font-semibold">
              Show Contact
            </Button>
          </span> */}
        </div>
      </div>

      <div className="w-full md:flex hidden md:gap-0 gap-4 rounded-md md:max-h-[72vh] h-full">
        <ChatSideBar
          setOpenedMessage={openInterface}
          conversations={conversations}
          currentUser={user}
          isLoading={isGettingConversations}
        />
        {selectedInterface ? (
          <ChatInterface
            conversationId={selectedInterface.id}
            currentUser={user}
            productId={selectedInterface.productId}
            selectedConversation={selectedInterface}
          />
        ) : (
          <></>
        )}
      </div>

      {/** MOBILE DEVICES */}
      <div className="w-full flex md:hidden md:gap-0 gap-4 rounded-md md:max-h-[72vh] h-full">
        {selectedInterface ? (
          <ChatInterface
            conversationId={selectedInterface.id}
            productId={selectedInterface.productId}
            selectedConversation={selectedInterface}
            currentUser={user}
            interfaceData={selectedInterface}
            closeInterface={() => setSelectedInterface(null)}
          />
        ) : (
          <ChatSideBar
            conversations={conversations}
            setOpenedMessage={openInterface}
            currentUser={user}
            isLoading={isGettingConversations}
          />
        )}
      </div>
    </>
  );
}
