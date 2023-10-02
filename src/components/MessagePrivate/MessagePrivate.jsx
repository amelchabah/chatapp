// MessagePrivate.js
import React from "react";

const MessagePrivate = ({ messages, username, selectedUser }) => {
  return (
    <div className="messages">
      {messages.map((message, key) => {
        // Vérifiez si le contenu du message n'est pas vide
        if (message.content.trim() !== "") {
          return (
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
          );
        }
        return null; // Exclure les messages vides
      })}
    </div>
  );
};

export default MessagePrivate;
