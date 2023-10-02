// MessageGeneral.js
import React from "react";

const MessageGeneral = ({ messages, username }) => {
  return (
    <div className="messages">
      {messages.map((message, key) => (
        <div
          key={key}
          className={`message ${message.username === username ? "own-message" : "other-message"}`}
        >
          <div className="inline">
            <h6>{message.username}</h6>
            {/* <small>{formatDate(message.date)}</small> */}
          </div>
          {message.isImage ? (
            <div>
              <img src={message.content} alt={`Image de ${message.username}`} />
            </div>
          ) : (
            <p>{message.content}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default MessageGeneral;
