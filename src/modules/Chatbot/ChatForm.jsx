import React, { useRef } from 'react';
import "./chat.css";
import { MdKeyboardArrowUp } from "react-icons/md";

const ChatForm = ({chatHistory, setChatHistory, generateBotResponse}) => {
  const inputRef = useRef();

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const userMessage = inputRef.current.value.trim();
    if(!userMessage) return
    inputRef.current.value = "";

    // UPDATE CHAT HISTORY WITH THE USER MESSAGE
    setChatHistory((history) => [...history, { role: "user", text: userMessage }])

    // ADD A "Thinking..." placeholder for the bot's response
    setTimeout(() => {
        setChatHistory((history) => [...history, { role: "model", text: "Thinking..."}]);

        
        generateBotResponse([...chatHistory, { role: "user", text: `Using the details provided above, please address this query: ${userMessage}`}]);
    }, 600) 
  }

  return (
    <form action="#" className='chat-form' onSubmit={handleFormSubmit}>
        <input ref={inputRef} type="text" placeholder='Message...' className='message-input' required/>
        <button className='material-symbols-rounded'><MdKeyboardArrowUp className='u-arrow'/></button>
    </form>
  );
}

export default ChatForm;
