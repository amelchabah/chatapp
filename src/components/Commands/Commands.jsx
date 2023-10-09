import { useEffect, useState } from "react";
import { socket } from "@/utils/socket";
import styles from "./Commands.module.scss";

const Commands = ({ commandsVisible }) => {
  const [sounds, setSounds] = useState({});
  const commandList = [
    "/chef",
    "/boom",
    "/disconnect",
    "/left",
    "/join",
    "/peter",
    "/skype",
  ];

  useEffect(() => {
    setSounds({
      chef: new Audio("/assets/sounds/chef.mp3"),
      boom: new Audio("/assets/sounds/boom.mp3"),
      disconnect: new Audio("/assets/sounds/disconnect.mp3"),
      left: new Audio("/assets/sounds/left.mp3"),
      join: new Audio("/assets/sounds/join.mp3"),
      peter: new Audio("/assets/sounds/peter.mp3"),
      skype: new Audio("/assets/sounds/skype.mp3"),
    });
  }, []);

  useEffect(() => {
    const onCommand = (command) => {
      switch (command) {
        case "/chef":
          sounds.chef.currentTime = 0;
          sounds.chef.play();
          break;
        case "/boom":
          sounds.boom.currentTime = 0;
          sounds.boom.play();
          break;
        case "/disconnect":
          sounds.disconnect.currentTime = 0;
          sounds.disconnect.play();
          break;
        case "/left":
          sounds.left.currentTime = 0;
          sounds.left.play();
          break;
        case "/join":
          sounds.join.currentTime = 0;
          sounds.join.play();
          break;
        case "/peter":
          sounds.peter.currentTime = 0;
          sounds.peter.play();
          break;
        case "/skype":
          sounds.skype.currentTime = 0;
          sounds.skype.play();
          break;
        default:
          break;
      }
    };

    socket.on("command", onCommand);

    return () => {
      socket.off("command", onCommand);
    };
  }, [sounds]);


  const handleCommandClick = (command) => {
    socket.emit("command", command);
    const sound = sounds[command.substring(1)];
    if (sound) {
      sound.currentTime = 0;
      sound.play();
    }
  };

  return (
    <div className={`${styles.commands} ${commandsVisible ? styles.active : styles.inactive}`}>
      <h5>Soundboard (type /something to play a sound)</h5>
      <ul className={styles.list}>
        {commandList.map((command) => (
          <h5 key={command} className={styles.command} onClick={() => handleCommandClick(command)}>
            {command.substring(1)}
          </h5>
        ))}
      </ul>
    </div>
  );
};

export default Commands;
