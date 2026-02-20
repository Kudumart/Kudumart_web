import React, { useState, useEffect, useRef } from "react";
import "./chat.css";
import { RiRobot2Fill } from "react-icons/ri";
import { MdKeyboardArrowDown } from "react-icons/md";
import ChatForm from "./ChatForm";
import ChatMessage from "./ChatMessage";
import { BiSolidMessageSquareDots } from "react-icons/bi";
import { MdOutlineClose } from "react-icons/md";
import { companyInfo } from "./CompanyInfo";

const Chat = () => {
  const [chatHistory, setChatHistory] = useState([
    {
      hideInChat: true,
      role: "model",
      text: companyInfo,
    },
  ]);
  const [showChatbot, setShowChatbot] = useState(false);
  const chatBodyRef = useRef();

  const generateBotResponse = async (history) => {
    const updateHistory = (text, isError = false) => {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Thinking..."),
        { role: "model", text, isError },
      ]);
    };

    history = history.map(({ role, text }) => ({ role, parts: [{ text }] }));

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: history }),
    };

    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL,
        requestOptions,
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error.message || "Something went wrong!");
      const apiResponseText = data.candidates[0].content.parts[0].text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .trim();
      updateHistory(apiResponseText);
    } catch (error) {
      updateHistory(error.message, true);
    }
  };

  useEffect(() => {
    chatBodyRef.current.scrollTo({
      top: chatBodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatHistory]);

  return (
    <div className={`chat-container ${showChatbot ? "show-chatbot" : ""}`}>
      <button
        id="chatbot-toggler"
        onClick={() => setShowChatbot((prev) => !prev)}
      >
        <span className="material-symbols-rounded">
          <BiSolidMessageSquareDots className="toggle-icon" />
        </span>
        <span className="material-symbols-rounded">
          <MdOutlineClose className="toggle-icon" />
        </span>
      </button>

      <div className="chatbot-popup">
        {/* CHAT HEADER */}
        <div className="chat-header">
          <div className="header-info">
            <RiRobot2Fill className="robot" />
            <h2 className="logo-text">Chatbot</h2>
          </div>
          <button onClick={() => setShowChatbot((prev) => !prev)}>
            <MdKeyboardArrowDown className="d-arrow" />
          </button>
        </div>

        {/* CHAT BODY */}
        <div ref={chatBodyRef} className="chat-body">
          <div className="message bot-message">
            <RiRobot2Fill className="robot" />
            <p className="message-text">
              Hey there <br /> How can i help you?
            </p>
          </div>

          {/* RENDER THE CHAT HISTORY DYNAMICALLY */}
          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>

        {/* CHAT FOOTER */}
        <div className="chat-footer">
          <ChatForm
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            generateBotResponse={generateBotResponse}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
