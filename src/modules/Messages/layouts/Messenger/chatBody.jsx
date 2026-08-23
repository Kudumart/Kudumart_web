import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaTimes } from "react-icons/fa";
import { FiArrowLeft, FiSend, FiImage } from "react-icons/fi";
import Imgix from "react-imgix";
import { useProductById } from "../../../../api/product";
import Loader from "../../../../components/Loader";
import { currencyFormat, formatTime } from "../../../../helpers/helperFactory";
import { getMessage } from "../../../../api/message";
import useAppState from "../../../../hooks/appState";
import { useQueryClient } from "@tanstack/react-query";
import EmojiPickerApp from "./EmojiPicker";
import { useSocket } from "../../../../store/SocketContext";
import useFileUpload from "../../../../api/hooks/useFileUpload";

const DEFAULT_AVATAR =
  "https://res.cloudinary.com/do2kojulq/image/upload/v1735426601/kudu_mart/profile_icon_yq3gnr.png";

const ChatInterface = ({
  conversationId,
  closeInterface,
  productId,
  selectedConversation,
  currentUser,
}) => {
  const { uploadFiles, isLoadingUpload } = useFileUpload();
  const { user } = useAppState();
  const userId = (currentUser || user)?.id;

  const [text, setText] = useState("");
  const [showFiles, setShowFiles] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);

  const socket = useSocket();
  const queryClient = useQueryClient();
  const chatContainerRef = useRef(null);
  const textRef = useRef(null);
  const fileInputRef = useRef(null);

  // Determine the other party in this conversation
  const renderedUser =
    selectedConversation?.receiverUser?.id === userId
      ? selectedConversation?.senderUser
      : selectedConversation?.receiverUser;

  // Product info for the header
  const { data: product } = useProductById(productId);

  // ── Messages query ───────────────────────────────────────────────────────
  // Use isLoading (true only on FIRST fetch) — NOT isFetching.
  // This prevents the loader guard from unmounting the chat on re-fetches.
  const {
    data: messageData,
    isLoading: isFirstLoad,
  } = getMessage(conversationId);

  const messages = messageData?.message ?? [];

  // ── Socket: register + receive incoming messages ─────────────────────────
  useEffect(() => {
    if (!socket || !userId) return;

    socket.emit("register", userId);

    const handleReceive = (incoming) => {
      // Patch cache directly — never call refetch() (causes loader → remount bug)
      queryClient.setQueryData(["message", conversationId], (old) => {
        if (!old) return old;
        const exists = old.message?.some((m) => m.id === incoming.id);
        if (exists) return old;
        return { ...old, message: [...(old.message || []), incoming] };
      });
    };

    socket.on("receiveMessage", handleReceive);
    return () => socket.off("receiveMessage", handleReceive);
  }, [socket, userId, conversationId, queryClient]);

  // ── Auto-scroll on new messages ──────────────────────────────────────────
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages.length]);

  // ── Send message ─────────────────────────────────────────────────────────
  const handleMessage = useCallback(
    (e) => {
      e.preventDefault();
      const trimmedText = text.trim();
      if (!trimmedText && showFiles.length === 0) return;

      // 1. Optimistic update — append to cache immediately, no loading flash
      const optimistic = {
        id: `opt-${Date.now()}`,
        content: trimmedText,
        fileUrl: showFiles[0] ?? null,
        userId,
        createdAt: new Date().toISOString(),
        _optimistic: true,
      };
      queryClient.setQueryData(["message", conversationId], (old) => {
        if (!old) return { message: [optimistic] };
        return { ...old, message: [...(old.message || []), optimistic] };
      });

      // 2. Emit via socket
      if (socket) {
        socket.emit("sendMessage", {
          productId,
          receiverId:
            selectedConversation?.receiverId === userId
              ? selectedConversation?.senderId
              : selectedConversation?.receiverId,
          content: trimmedText,
          userId,
          fileUrl: showFiles[0] ?? null,
        });
      }

      // 3. Clear inputs
      setText("");
      setShowFiles([]);

      // 4. Silent background invalidation (no loading state triggered)
      queryClient.invalidateQueries({
        queryKey: ["message", conversationId],
        refetchType: "none",
      });
    },
    [text, showFiles, userId, socket, productId, selectedConversation, conversationId, queryClient]
  );

  // ── File upload ──────────────────────────────────────────────────────────
  const handleUploadFiles = async (files) => {
    await uploadFiles(files, (uploadedUrls) => setShowFiles(uploadedUrls));
  };

  const removeImage = (i) =>
    setShowFiles((prev) => prev.filter((_, idx) => idx !== i));

  // First-load skeleton (never show on re-fetches)
  if (isFirstLoad) {
    return (
      <div className="flex flex-col flex-1 h-full items-center justify-center bg-white">
        <Loader />
      </div>
    );
  }

  return (
    // flex-col + h-full fills the parent flex-1 in Messenger/index.jsx
    <div className="flex flex-col h-full overflow-hidden bg-white">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white shrink-0">
        {/* Mobile back */}
        {closeInterface && (
          <button
            type="button"
            onClick={closeInterface}
            className="md:hidden p-1.5 rounded-full hover:bg-gray-100 transition-colors mr-1"
            aria-label="Back to conversations"
          >
            <FiArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
        )}

        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
            {renderedUser?.photo ? (
              <Imgix
                src={renderedUser.photo}
                alt={renderedUser?.firstName || "User"}
                width={40}
                height={40}
                sizes="40px"
                className="w-10 h-10 object-cover"
              />
            ) : (
              <img src={DEFAULT_AVATAR} alt="User" className="w-10 h-10 object-cover" />
            )}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
        </div>

        {/* Name + product context */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {renderedUser?.firstName} {renderedUser?.lastName}
          </p>
          {product?.name && (
            <div className="flex items-center gap-1.5 mt-0.5">
              {product?.image_url && (
                <Imgix
                  src={product.image_url}
                  alt="Product"
                  width={16}
                  height={16}
                  sizes="16px"
                  className="w-4 h-4 rounded object-cover shrink-0"
                />
              )}
              <p className="text-xs text-orange-500 font-medium truncate">
                {product.name}
                {product?.price && (
                  <span className="text-gray-400 font-normal ml-1">
                    · {currencyFormat(product.price)}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Messages area ────────────────────────────────────────────────── */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10 text-gray-400 select-none">
            <p className="text-sm">No messages yet — say hello!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.userId === userId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[75%] md:max-w-[60%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    isMine
                      ? "bg-orange-500 text-white rounded-br-sm"
                      : "bg-white text-gray-800 rounded-bl-sm border border-gray-100"
                  } ${msg._optimistic ? "opacity-60" : ""}`}
                >
                  {msg.fileUrl && (
                    <img
                      src={msg.fileUrl}
                      alt="attachment"
                      className="w-48 h-36 object-cover rounded-lg mb-1.5"
                    />
                  )}
                  {msg.content && <p>{msg.content}</p>}
                </div>
                <p className={`mt-0.5 text-[10px] text-gray-400 px-1`}>
                  {formatTime(msg.createdAt)}
                  {msg._optimistic && <span className="ml-1 italic">sending…</span>}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* ── Image preview strip ───────────────────────────────────────────── */}
      {(showFiles.length > 0 || isLoadingUpload) && (
        <div className="flex items-center gap-3 px-4 py-2 bg-white border-t border-gray-100 shrink-0">
          {isLoadingUpload ? (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Loader className="w-4 h-4" />
              <span>Uploading…</span>
            </div>
          ) : (
            showFiles.map((url, i) => (
              <div key={i} className="relative">
                <img src={url} alt="preview" className="w-16 h-16 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-1.5 -right-1.5 bg-white shadow rounded-full p-0.5 text-gray-600 hover:text-red-500 transition-colors"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Input bar ────────────────────────────────────────────────────── */}
      <div className="shrink-0 px-4 py-3 bg-white border-t border-gray-200">
        <form
          onSubmit={handleMessage}
          className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2"
        >
          {/* Emoji picker */}
          <div className="shrink-0">
            <EmojiPickerApp
              textRef={textRef}
              message={text}
              setMessage={setText}
              showPicker={showPicker}
              setShowPicker={setShowPicker}
              setShowAttachments={setShowAttachments}
            />
          </div>

          {/* Text input */}
          <input
            ref={textRef}
            type="text"
            className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
            placeholder="Type a message…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {/* Image attach */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 p-1 text-gray-400 hover:text-orange-500 transition-colors"
            aria-label="Attach image"
          >
            <FiImage className="w-4 h-4" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => handleUploadFiles(e.target.files)}
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={!text.trim() && showFiles.length === 0}
            className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Send"
          >
            <FiSend className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
