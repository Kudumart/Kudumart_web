import React from 'react';
import { RiRobot2Fill } from "react-icons/ri";

const ChatMessage = ({chat}) => {
  return (
    !chat.hideInChat && (
    <div className={`message ${chat.role === "model" ? "bot-message" : "user-message"} ${chat.isError ? "error" : ""}`}>
        {chat.role === "model" &&  <RiRobot2Fill className='robot'/>}
        <p className='message-text'>{chat.text}</p>
    </div>
    )
  );
}

export default ChatMessage;
