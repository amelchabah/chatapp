import React from "react";
import { format } from "date-fns";
import styles from "./Message.module.scss";

const Message = ({ message, isOwnMessage }) => {

  const formatDate = (timestamp) => {
    if (
      format(new Date(timestamp), "MM/dd/yyyy") ===
      format(new Date(), "MM/dd/yyyy")
    ) {
      return format(new Date(timestamp), "'Today at' h:mm a");
    } else {
      return format(new Date(timestamp), "MM/dd/yyyy 'at' h:mm a");
    }
  };

  if (message.content.match(/^(http|https):\/\/.*\.(jpeg|jpg|gif|png|webp|svg)$/) != null) {
    message.isImage = true;
  }

  // if message is empty, don't display it
  if (message.content === "") {
    return null;
  }

  return (
    <div
      className={`${styles.message} ${
        isOwnMessage ? styles.ownmessage : styles.othermessage
      }`}
    >
      <div className="inline">
        <h6>{message.username}</h6>
        <small>{formatDate(message.date)}</small>
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
};

export default Message;
