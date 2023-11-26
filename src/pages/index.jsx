import { useEffect } from "react"
import { socket } from "@/utils/socket";
import { useRouter } from "next/router";
import Input from "@/components/Input/Input";
import { useState } from "react";
import { useRef } from "react";
import Notification from "@/components/Notification/Notification";
import UserList from "@/components/UserList/UserList";
import Sidebar from "@/components/Sidebar/Sidebar";
import styles from "@/styles/index.module.scss";
import Message from "@/components/Message/Message"; // Importez le composant Message

const Home = () => {
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState();
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState();
    const [showGeneralMessages, setShowGeneralMessages] = useState(true);
    const [connectionSound, setConnectionSound] = useState();
    const [disconnectionSound, setDisconnectionSound] = useState();
    // const [errors, setErrors] = useState([]);    
    // faire tableau quand y aura plusieurs erreurs, comme pour message

    const { push } = useRouter();
    const listRef = useRef(null);

    const getUsernameFromLocalStorage = () => {
        // Retrieve the username from localStorage only on the client-side
        if (typeof window !== 'undefined') {
            return localStorage.getItem("username");
        }
        return null;
    };

    const username = getUsernameFromLocalStorage();

    // s'assurer que le code est executé QUE côté client et non coté client+serveur
    // par ex, dans useEffect, window sera défini

    // on veut juste faire des composants qui tournent sur un client, donc pour éviter les erreurs de serveur on fait des 'client components'

    const onSession = ({ sessionID, userID }) => {
        // console.log("session received", sessionID, userID);
        socket.auth = { sessionID };
        localStorage.setItem("sessionID", sessionID);
        // save l'ID du user
        socket.userID = userID;
        localStorage.removeItem('error');
    }

    const onMessage = (message) => {
        console.log("message received", message);
        setMessages((messages) => [...messages, message]);
    };

    const getMessagesAtInit = (messages) => {
        // console.log("messages received", messages);
        setMessages(messages);
    }

    const getUsersAtInit = (_users) => {
        console.log("users received", _users);
        setUsers(_users);
    }

    const onUserConnect = (_user) => {
        const existingUser = users.find((user) => user.userID === _user.userID);
        if (existingUser) {
            return;
        }
        setUsers((currentUsers) => [...currentUsers, _user]);
        connectionSound.currentTime = 0;
        connectionSound.play();

    };

    const onUserDisconnect = (_userID) => {
        const filteredArray = [...users].filter((_user) =>
            _user.userID !== _userID ? true : false
        );
        console.log(filteredArray);
        setUsers(filteredArray);

        disconnectionSound.currentTime = 0;
        disconnectionSound.play();
    };

    const onConnectionError = (error) => {
        console.log("connection error", error);
        localStorage.removeItem('username');
        localStorage.removeItem('sessionID');
        localStorage.setItem('error', 100);
        // ca c cote client uniquement ca n'a rien a voir avec le serveur (100)
        push("/login");
    };

    const onError = ({ code, error }) => {
        console.log(code, error);

        let title = "";
        let content = "";

        switch (code) {
            case 100:
                // title = `Erreur ${code} : Spam`;
                // content = "Tu spam trop";
                title = "Waooh !";
                content = "Calm down, you're sending too many messages !";
                break;
            //ca c l'erreur renvoyée par le SERVEUR
            default:
                break;
        }
        setError({ title, content });
    }

    const onPrivateMessage = ({ content, from, to, username, date }) => {
        console.log(content, from, to, username, date);
        // doesn't work

        // check from which user the message came from
        const userMessagingIndex = users.findIndex(
            (_user) => _user.userID === from
        );

        console.log(userMessagingIndex);

        const userMessaging = users.find((_user) => _user.userID === from);

        console.log(userMessaging);

        if (!userMessaging) return;

        userMessaging.messages.push({
            content,
            from,
            to,
            username: username,
            date: new Date(),
        });

        if (userMessaging.userID !== selectedUser?.userID) {
            userMessaging.hasNewMessages = true;
        }

        const _users = [...users];
        _users[userMessagingIndex] = userMessaging;
        setUsers(_users);
    };


    const onPrivateImage = ({ content, from, to, fileName, username, date, isImage }) => {
        console.log(content, from, to, fileName, username, date, isImage);
        // check from which user the message came from
        const userMessagingIndex = users.findIndex(
            (_user) => _user.userID === from
        );

        console.log(userMessagingIndex);

        const userMessaging = users.find((_user) => _user.userID === from);

        console.log(userMessaging);

        if (!userMessaging) return;

        userMessaging.messages.push({
            content,
            fileName,
            from,
            to,
            username: username,
            date: new Date(),
            isImage: true,
        });

        if (userMessaging.userID !== selectedUser?.userID) {
            userMessaging.hasNewMessages = true;
        }

        const _users = [...users];
        _users[userMessagingIndex] = userMessaging;
        setUsers(_users);
    };


    useEffect(() => {
        setConnectionSound(new Audio("/assets/sounds/join.mp3"));

        socket.on('private message', onPrivateMessage);
        socket.on('private image', onPrivateImage);
        socket.on('user connected', onUserConnect);
        socket.on('user disconnected', onUserDisconnect);
        return () => {
            socket.off('private message', onPrivateMessage);
            socket.off('private image', onPrivateImage);
            socket.off('user connected', onUserConnect);
            socket.off('user disconnected', onUserDisconnect);
        }
    }, [users]);


    useEffect(() => {
        const sessionID = localStorage.getItem("sessionID");
        setDisconnectionSound(new Audio("/assets/sounds/left.mp3"));

        // s'il est dispo, je me suis déjà connecté et la session existe déjà (le serveur sait que j'existe)
        if (sessionID) {
            socket.auth = { sessionID };
            socket.connect();
        } else if (localStorage.getItem("username")) {
            const username = localStorage.getItem("username");
            socket.auth = { username };
            socket.connect();
        } else {
            push("/login");
        }

        socket.on('error', onError);
        socket.on('session', onSession);
        socket.on('message', onMessage);
        socket.on('image', onMessage);
        socket.on('messages', getMessagesAtInit);
        socket.on('users', getUsersAtInit);
        // socket.on('users', onUserConnect);
        socket.on('disconnect', onConnectionError);
        socket.on('connect_error', onConnectionError);
        socket.on('connectedUsers', (users) => {
            setConnectedUsers(users);
        });

        return () => {
            socket.off('error', onError);
            socket.off('session', onSession);
            socket.off('message', onMessage);
            socket.off('image', onMessage);
            socket.off('messages', getMessagesAtInit);
            socket.off('users', getUsersAtInit);
            // socket.off('users', onUserConnect);
            socket.off('connect_error', onConnectionError);
            socket.off('connectedUsers');
            socket.off('disconnect', onConnectionError);
            socket.off("user connected", onUserConnect);
            socket.off("user disconnected", onUserDisconnect);
            socket.disconnect();
            // disconnect pour respecter la doc de socket.io
        }

    }, []);

    const generateAvatar = (username) => {
        const initials = username
            .split(' ')
            .map((part) => part[0])
            .join('');
        // return `https://kawaii-avatar.now.sh/api/avatar?username==${encodeURIComponent(initials)}`
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=200&bold=true&font-size=0.4&background=d2d3fa&format=svg`;
    };

    // Faites défiler la liste vers le bas lorsque la page se charge
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages, selectedUser, users, error, listRef.current, messages.isImage, messages.content]);

    return (
        <>
            <UserList
                users={users}
                setUsers={setUsers}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                messages={messages}
                showGeneralMessages={showGeneralMessages}
                setShowGeneralMessages={setShowGeneralMessages}
            />
            <div className={styles.chat}>

                {/* destinataire */}
                <h2 className={styles.title}>
                    {selectedUser ? (
                        <>
                            <div className={styles.avatar}>
                                <img src={generateAvatar(selectedUser.username)} alt="your avatar" />
                            </div>
                            <span>
                                {selectedUser.username}
                            </span>

                        </>
                    ) : (
                        <>
                            <div className={styles.avatar}>
                                <img src={generateAvatar("General")} alt="your avatar" />
                            </div>
                            <span>
                                General  ✩°｡⋆⸜ 🎧
                            </span>

                        </>
                    )}
                </h2>

                {/* messages */}
                <div className={styles.messages} ref={listRef}>
                    {messages.length === 0 && !selectedUser ? (
                        <div className={styles.nomessage}>
                            <h1>Welcome to General! ✨</h1>
                            <p>Don't be shy, start the conversation!</p>
                        </div>
                    ) : (
                        <>
                            {selectedUser && selectedUser.messages.length === 0 && (
                                <div className={styles.nomessage}>
                                    <h1>Here starts your chat with {selectedUser.username} 👀</h1>
                                    <p>Don't be shy, start the conversation!</p>
                                </div>
                            )}
                            {selectedUser
                                ? selectedUser.messages.map((_message, key) => (
                                    <Message
                                        key={key}
                                        message={_message}
                                        isOwnMessage={_message.username === username}
                                    />
                                ))
                                : messages.map((message, key) => (
                                    <Message
                                        key={key}
                                        message={message}
                                        isOwnMessage={message.username === username}
                                    />
                                ))}
                        </>

                    )}
                    {error && (
                        <Notification title={error.title} content={error.content} onClose={() => setError(null)} />
                    )}
                </div>
                <Input selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
            </div>
            <Sidebar />
        </>
    );
}
export default Home;
