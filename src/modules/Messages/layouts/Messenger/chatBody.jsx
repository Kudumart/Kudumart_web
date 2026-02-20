import React, { useState, useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import Imgix from "react-imgix";
import { useProductById } from "../../../../api/product";
import { useSearchParams } from "react-router-dom";
import Loader from "../../../../components/Loader";
import { currencyFormat, formatTime } from "../../../../helpers/helperFactory";
import { getMessage, sendMessage } from "../../../../api/message";
import useAppState from "../../../../hooks/appState";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import EmojiPickerApp from "./EmojiPicker";
import { useSocket } from "../../../../store/SocketContext";
import useFileUpload from "../../../../api/hooks/useFileUpload";

const ChatInterface = ({
  conversationId,
  closeInterface,
  productId,
  selectedConversation,
}) => {
  const { uploadFiles, isLoadingUpload } = useFileUpload();

  console.log(conversationId, "conversationId");

  const { user } = useAppState();
  const [text, setText] = useState("");
  const userId = user.id;

  const [showFiles, setShowFiles] = useState([]);

  const socket = useSocket();
  const queryClient = useQueryClient();


  useEffect(() => {
    if (!socket) return;

    socket.emit("register", userId);

    socket.on("receiveMessage", (message) => {
      queryClient.invalidateQueries(["messages", conversationId]);
      refetch();
      console.log(message, "message from socket");
    });
  }, [socket]);


  const chatContainerRef = useRef(null);
  const [showPicker, setShowPicker] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);

  const initiatecloseInterface = () => {
    closeInterface();
  };

  const { mutate: sendText, isLoading: isSending } = sendMessage();

  const handleMessage = (e) => {
    e.preventDefault();
      socket.emit("sendMessage", {
        productId: productId,
        receiverId:
          selectedConversation?.receiverId === userId
            ? selectedConversation?.senderId
            : selectedConversation?.receiverId,
        content: text,
        userId: userId,
        fileUrl: showFiles[0],
      });
      setText("");
      setShowFiles('')
      queryClient.invalidateQueries(["messages", conversationId]);
      refetch();
  };


  const textRef = useRef();
  const { data: product, isLoading, error } = useProductById(productId);
  const {
    data: message,
    isLoading: isGettingMessage,
    refetch,
  } = getMessage(conversationId);


  useEffect(() => {
    // Scroll to the bottom when new messages are added
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [message]);



  const fileInputRef = useRef(null);


  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };


  const handleUploadFiles = async (files) => {
    const selectedFile = files;
    await uploadFiles(selectedFile, (uploadedUrls) => {
      setShowFiles(uploadedUrls);
    });
  }


  const removeImage = (indexToRemove) => {
    setShowFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
  };


  if (isLoading || isGettingMessage) return (
    <div className="md:w-[68%] w-full flex flex-col gap-2 md:mt-px pt-20 bg-white relative border-l-2 overflow-auto">
      <Loader />
    </div>
  );


  return (
    <div className="md:w-[68%] w-full flex flex-col gap-2 md:mt-px bg-white relative border-l-2 overflow-auto">
      <div className="flex items-center justify-between gap-4 p-4 border-b-2">
        <span
          className="md:hidden flex"
          onClick={() => initiatecloseInterface()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </span>
        <div className="flex items-center gap-1">
          {product?.image_url && (
            <Imgix
              src={product?.image_url}
              alt="Product"
              width={50}
              height={50}
              sizes="20vw"
              className="w-10 h-10 rounded-md mr-4"
            />
          )}
          <div>
            <h2 className="text-sm font-medium">{product?.name}</h2>
            <p className="text-sm font-bold">
              {" "}
              {product?.price && currencyFormat(product?.price)}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {message?.message?.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${message.userId === userId ? "items-end" : "items-start"
              }`}
          >
            <div
              className={`flex items-center gap-2 max-w-xs px-4 py-2 rounded-lg text-sm ${message.userId === userId
                ? "bg-kudu-orange text-white"
                : "bg-[rgba(242,246,250,1)] text-black"
                }`}
            >
              <div className="flex flex-col gap-1">
                {message.fileUrl && <p>
                  <img src={message.fileUrl} alt="file" className="w-40 h-40 object-cover rounded-md" />
                </p>}
                <p>{message.content}</p>
              </div>
            </div>

            <p className="mt-1 text-xs font-semibold text-gray-500">
              {formatTime(message?.createdAt)}
            </p>
          </div>
        ))}
      </div>

      {(showFiles.length > 0 || isLoadingUpload) && (
        <div className="flex items-center p-4 bg-white border-t-2 shadow-md">
          {isLoadingUpload ? (
            <Loader className="w-4 h-4" />
          ) : (
            <div className="grid grid-cols-3 gap-4 my-1">
              {showFiles.map((fileObj, index) => (
                <div key={index} className="relative">
                  <img
                    src={fileObj}
                    alt="preview"
                    className="w-full h-24 object-cover rounded-sm"
                  />
                  <span
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-white shadow-lg cursor-pointer text-black rounded-full p-1"
                  >
                    <FaTimes className="w-4 h-4" />
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      {/* Chat Input */}
      <div className="flex items-center p-4 bg-white border-t-2 shadow-md">
        <form
          onSubmit={handleMessage}
          className="flex items-center bg-[rgba(249,249,249,1)] border border-[rgba(212,212,212,1)] rounded-lg overflow-hidden w-full"
        >
          <input
            type="text"
            className="md:w-3/4 w-full px-4 py-2 rounded-lg md:px-6 md:py-2 bg-transparent outline-hidden text-[13px] md:text-lg text-gray-700 disabled:cursor-not-allowed"
            placeholder="Message"
            disabled={isSending}
            value={text}
            onChange={(e) => setText(e.target.value)}
            ref={textRef}
            style={{ fontSize: "13px" }}
          />
          <span className="flex w-1/4 px-5 gap-4 justify-end">
            <div className="flex gap-2 items-center">
              {/**Attachment 
              <button className="p-1 bg-transparent">
                <svg
                  width="12"
                  height="18"
                  viewBox="0 0 12 23"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.86971 0.0652962C7.27007 0.0667953 8.61266 0.623751 9.60287 1.61396C10.5931 2.60417 11.15 3.94675 11.1515 5.34711L11.1515 18.9289C11.1515 19.9295 10.754 20.8891 10.0465 21.5967C9.339 22.3042 8.37939 22.7017 7.3788 22.7017C6.37821 22.7017 5.4186 22.3042 4.71108 21.5967C4.00356 20.8891 3.60607 19.9295 3.60607 18.9289L3.60607 5.34711C3.60607 4.74676 3.84456 4.171 4.26908 3.74648C4.69359 3.32197 5.26936 3.08348 5.86971 3.08348C6.47006 3.08348 7.04583 3.32197 7.47034 3.74648C7.89486 4.171 8.13335 4.74676 8.13335 5.34711V15.9108C8.13335 16.1109 8.05385 16.3028 7.91234 16.4443C7.77084 16.5858 7.57892 16.6653 7.3788 16.6653C7.17868 16.6653 6.98676 16.5858 6.84526 16.4443C6.70375 16.3028 6.62425 16.1109 6.62425 15.9108L6.62425 5.34711C6.62425 5.147 6.54476 4.95507 6.40325 4.81357C6.26175 4.67207 6.06983 4.59257 5.86971 4.59257C5.66959 4.59257 5.47767 4.67207 5.33616 4.81357C5.19466 4.95507 5.11516 5.147 5.11516 5.34711L5.11516 18.9289C5.11516 19.5293 5.35365 20.1051 5.77817 20.5296C6.20268 20.9541 6.77845 21.1926 7.3788 21.1926C7.97915 21.1926 8.55492 20.9541 8.97943 20.5296C9.40395 20.1051 9.64244 19.5293 9.64244 18.9289L9.64244 5.34711C9.64244 4.34653 9.24495 3.38692 8.53743 2.67939C7.82991 1.97187 6.8703 1.57439 5.86971 1.57439C4.86912 1.57439 3.90951 1.97187 3.20199 2.67939C2.49446 3.38692 2.09698 4.34653 2.09698 5.34711L2.09698 15.9108C2.09698 16.1109 2.01749 16.3028 1.87598 16.4443C1.73448 16.5858 1.54255 16.6653 1.34244 16.6653C1.14232 16.6653 0.950397 16.5858 0.808892 16.4443C0.667387 16.3028 0.587891 16.1109 0.587891 15.9108L0.587891 5.34711C0.589389 3.94675 1.14635 2.60417 2.13655 1.61396C3.12676 0.623751 4.46934 0.0667953 5.86971 0.0652962Z"
                    fill="black"
                  />
                </svg>
              </button> */}
              {/**Emoji */}
              <EmojiPickerApp
                textRef={textRef}
                message={text}
                setMessage={setText}
                showPicker={showPicker}
                setShowPicker={setShowPicker}
                setShowAttachments={setShowAttachments}
              />
              {/* <button className="p-1 bg-transparent">
                <svg
                  width="15"
                  height="18"
                  viewBox="0 0 20 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.0161 0.574341C8.07607 0.574341 6.17958 1.14963 4.56649 2.22747C2.95339 3.30531 1.69614 4.83728 0.953708 6.62965C0.211281 8.42203 0.0170287 10.3943 0.395515 12.2971C0.774001 14.1999 1.70823 15.9477 3.08005 17.3195C4.45188 18.6913 6.19969 19.6256 8.10247 20.004C10.0052 20.3825 11.9775 20.1883 13.7699 19.4458C15.5623 18.7034 17.0942 17.4462 18.1721 15.8331C19.2499 14.22 19.8252 12.3235 19.8252 10.3834C19.8225 7.78274 18.7881 5.28936 16.9492 3.45039C15.1102 1.61142 12.6168 0.577087 10.0161 0.574341ZM10.0161 18.6834C8.37454 18.6834 6.76982 18.1966 5.40489 17.2846C4.03997 16.3726 2.97613 15.0763 2.34793 13.5597C1.71972 12.0431 1.55535 10.3742 1.87561 8.76418C2.19587 7.15414 2.98636 5.67522 4.14714 4.51445C5.30792 3.35367 6.78683 2.56317 8.39688 2.24291C10.0069 1.92266 11.6758 2.08702 13.1924 2.71523C14.709 3.34344 16.0053 4.40727 16.9173 5.7722C17.8293 7.13713 18.3161 8.74185 18.3161 10.3834C18.3136 12.584 17.4384 14.6936 15.8824 16.2497C14.3263 17.8057 12.2167 18.6809 10.0161 18.6834ZM5.48885 8.49707C5.48885 8.27321 5.55523 8.05439 5.6796 7.86826C5.80396 7.68214 5.98073 7.53707 6.18754 7.4514C6.39436 7.36574 6.62193 7.34333 6.84148 7.387C7.06103 7.43067 7.2627 7.53846 7.42099 7.69675C7.57928 7.85504 7.68707 8.05671 7.73074 8.27626C7.77441 8.49581 7.752 8.72338 7.66634 8.9302C7.58067 9.13701 7.4356 9.31377 7.24948 9.43814C7.06335 9.56251 6.84452 9.62889 6.62067 9.62889C6.32049 9.62889 6.03261 9.50964 5.82035 9.29738C5.6081 9.08513 5.48885 8.79724 5.48885 8.49707ZM14.5434 8.49707C14.5434 8.72092 14.477 8.93974 14.3527 9.12587C14.2283 9.312 14.0515 9.45707 13.8447 9.54273C13.6379 9.6284 13.4103 9.65081 13.1908 9.60714C12.9712 9.56347 12.7696 9.45567 12.6113 9.29738C12.453 9.1391 12.3452 8.93743 12.3015 8.71787C12.2578 8.49832 12.2803 8.27075 12.3659 8.06394C12.4516 7.85713 12.5966 7.68036 12.7828 7.55599C12.9689 7.43163 13.1877 7.36525 13.4116 7.36525C13.7118 7.36525 13.9996 7.48449 14.2119 7.69675C14.4242 7.90901 14.5434 8.19689 14.5434 8.49707ZM14.4425 13.0243C13.4719 14.7023 11.8582 15.6652 10.0161 15.6652C8.17409 15.6652 6.56125 14.7032 5.59072 13.0243C5.53612 12.9385 5.49946 12.8424 5.48295 12.742C5.46643 12.6416 5.4704 12.5389 5.49461 12.44C5.51882 12.3412 5.56278 12.2483 5.62383 12.1668C5.68488 12.0854 5.76178 12.0172 5.84988 11.9663C5.93799 11.9154 6.03548 11.8828 6.1365 11.8705C6.23753 11.8582 6.33999 11.8665 6.43772 11.8949C6.53546 11.9232 6.62645 11.9711 6.70522 12.0355C6.78399 12.0999 6.84891 12.1796 6.89608 12.2698C7.60064 13.4874 8.70793 14.1562 10.0161 14.1562C11.3243 14.1562 12.4316 13.4865 13.1352 12.2698C13.2353 12.0964 13.4001 11.9699 13.5934 11.9181C13.7868 11.8663 13.9928 11.8934 14.1661 11.9934C14.3395 12.0935 14.466 12.2583 14.5178 12.4517C14.5696 12.645 14.5425 12.851 14.4425 13.0243Z"
                    fill="black"
                  />
                </svg>
              </button> */}
              {/**Image & Video */}
              <span className="p-1 bg-transparent" onClick={() => handleButtonClick()}>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 19 19"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16.7074 0.328857H1.61651C1.21628 0.328857 0.832434 0.48785 0.549424 0.77086C0.266415 1.05387 0.107422 1.43771 0.107422 1.83795V16.9289C0.107422 17.3291 0.266415 17.7129 0.549424 17.9959C0.832434 18.279 1.21628 18.4379 1.61651 18.4379H16.7074C17.1077 18.4379 17.4915 18.279 17.7745 17.9959C18.0575 17.7129 18.2165 17.3291 18.2165 16.9289V1.83795C18.2165 1.43771 18.0575 1.05387 17.7745 0.77086C17.4915 0.48785 17.1077 0.328857 16.7074 0.328857ZM1.61651 1.83795H16.7074V9.13629L14.3787 6.80663C14.0957 6.52383 13.712 6.36498 13.312 6.36498C12.9119 6.36498 12.5282 6.52383 12.2452 6.80663L2.123 16.9289H1.61651V1.83795ZM16.7074 16.9289H4.25742L13.312 7.87431L16.7074 11.2698V16.9289ZM6.14379 8.62886C6.59149 8.62886 7.02914 8.4961 7.40139 8.24737C7.77365 7.99863 8.06378 7.6451 8.23511 7.23148C8.40644 6.81785 8.45127 6.36271 8.36393 5.92361C8.27658 5.48451 8.06099 5.08116 7.74442 4.76459C7.42784 4.44801 7.0245 4.23242 6.5854 4.14508C6.1463 4.05774 5.69115 4.10256 5.27753 4.27389C4.8639 4.44522 4.51037 4.73536 4.26164 5.10761C4.01291 5.47987 3.88015 5.91752 3.88015 6.36522C3.88015 6.96557 4.11864 7.54134 4.54315 7.96585C4.96767 8.39037 5.54343 8.62886 6.14379 8.62886ZM6.14379 5.61068C6.29302 5.61068 6.4389 5.65493 6.56299 5.73784C6.68707 5.82075 6.78378 5.93859 6.84089 6.07647C6.898 6.21434 6.91295 6.36606 6.88383 6.51243C6.85472 6.65879 6.78285 6.79324 6.67733 6.89877C6.5718 7.00429 6.43736 7.07615 6.29099 7.10527C6.14462 7.13438 5.99291 7.11944 5.85503 7.06233C5.71716 7.00522 5.59931 6.90851 5.5164 6.78442C5.43349 6.66034 5.38924 6.51446 5.38924 6.36522C5.38924 6.1651 5.46874 5.97318 5.61024 5.83168C5.75175 5.69017 5.94367 5.61068 6.14379 5.61068Z"
                    fill="black"
                  />
                </svg>
              </span>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleUploadFiles(e.target.files)}
              />

              {/** Send Button */}
              {(text !== "" && !isSending) || showFiles.length > 0 ? (
                <button
                  type="submit"
                  disabled={isSending}
                  className="py-1 px-4 bg-[rgba(72,133,237,1)] text-white font-medium text-xs rounded-md disabled:opacity-90 disabled:cursor-not-allowed"
                >
                  {isSending ? "Sending" : "Send"}
                </button>
              )
            :
            <></>}
            </div>
          </span>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
