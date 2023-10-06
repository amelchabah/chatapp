import { useEffect } from "react"
import { socket } from "@/utils/socket";
import { useRouter } from "next/router";
import Input from "@/components/Input/Input";
import Commands from "@/components/Commands/Commands"
import { useState } from "react";
import { useRef } from "react";
import Notification from "@/components/Notification/Notification";
import { format, formatDistance } from "date-fns";
import UserList from "@/components/UserList/UserList";
import Userbar from "@/components/Userbar/Userbar";
import styles from "@/styles/index.module.scss";
// import MessageGeneral from "@/components/MessageGeneral/MessageGeneral"
// import MessagePrivate from "@/components/MessagePrivate/MessagePrivate"


const Home = () => {
    const [messages, setMessages] = useState([]);
    // const [generalMessages, setGeneralMessages] = useState([]); // New state for General messages
    const [error, setError] = useState();
    // users inscrits (connectés ou non)
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState();
    const [showGeneralMessages, setShowGeneralMessages] = useState(true);


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
    }

    const formatDate = (timestamp) => {
        // Utilisez la fonction format pour formater la date et l'heure
        // return format(new Date(timestamp), 'dd/MM');
        // return format(new Date(timestamp), "MM/dd/yyyy 'at' h:mm a");
        // if date is today, display "Today"

        if (format(new Date(timestamp), "MM/dd/yyyy") === format(new Date(), "MM/dd/yyyy")) {
            return format(new Date(timestamp), "'Today at' h:mm a");
        } else {
            return format(new Date(timestamp), "MM/dd/yyyy 'at' h:mm a");
        }
    };


    const onMessage = (message) => {
        console.log("message received", message);
        setMessages((messages) => [...messages, message]);
    };

    const getMessagesAtInit = (messages) => {
        console.log("messages received", messages);
        setMessages(messages);
    }
    // users ou _users c pareil

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
    };

    const onUserDisconnect = (_userID) => {
        const filteredArray = [...users].filter((_user) =>
            _user.userID !== _userID ? true : false
        );
        console.log(filteredArray);
        setUsers(filteredArray);
    };


    const onConnectionError = (error) => {
        console.log("connection error", error);
        localStorage.clear('username');
        localStorage.clear('sessionID');
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

        // if (userMessaging.userID !== selectedUser?.userID) {
        //     userMessaging.hasNewMessages = true;
        // }

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

        // if (userMessaging.userID !== selectedUser?.userID) {
        //     userMessaging.hasNewMessages = true;
        // }

        const _users = [...users];
        _users[userMessagingIndex] = userMessaging;
        setUsers(_users);
    };


    useEffect(() => {
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

        return () => {
            socket.off('error', onError);
            socket.off('session', onSession);
            socket.off('message', onMessage);
            socket.off('image', onMessage);
            socket.off('messages', getMessagesAtInit);
            socket.off('users', getUsersAtInit);
            // socket.off('users', onUserConnect);
            socket.off('connect_error', onConnectionError);
            socket.off('disconnect', onConnectionError);
            socket.disconnect();
            // disconnect pour respecter la doc de socket.io
        }

    }, []);


    useEffect(() => {
        // Update the list of connected users when a new user connects or disconnects
        socket.on('connectedUsers', (users) => {
            setConnectedUsers(users);
        });

        return () => {
            socket.off('connectedUsers');
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
    }, [messages, selectedUser, users, error]);




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
                                ? selectedUser.messages.map((_message, key) => {
                                    if (_message.content.match(/^(http|https):\/\/.*\.(jpeg|jpg|gif|png|webp|svg)$/) != null) {
                                        return (
                                            <div key={key}
                                                className={`${styles.message} ${_message.username === username ? styles.ownmessage : styles.othermessage}`}>

                                                <div className="inline">
                                                    <h6>{_message.username}</h6>
                                                    <small>{formatDate(_message.date)}</small>
                                                </div>
                                                <div>
                                                    <img src={_message.content} alt={`Image de ${_message.username}`} />
                                                </div>
                                            </div>
                                        )

                                    }
                                    else if (!_message.isImage && _message.content.trim() !== "") {
                                        return (
                                            <div key={key}
                                                className={`${styles.message} ${_message.username === username ? styles.ownmessage : styles.othermessage}`}>

                                                <div className="inline">
                                                    <h6>{_message.username}</h6>
                                                    <small>{formatDate(_message.date)}</small>
                                                </div>
                                                <p>{_message.content}</p>
                                            </div>
                                        );
                                    } else if (_message.isImage) {
                                        return (
                                            <div key={key}
                                                className={`${styles.message} ${_message.username === username ? styles.ownmessage : styles.othermessage}`}>

                                                <div className="inline">
                                                    <h6>{_message.username}</h6>
                                                    <small>{formatDate(_message.date)}</small>
                                                </div>
                                                <div>
                                                    <img src={_message.content} alt={`Image de ${_message.username}`} />
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null; // Exclure les messages vides

                                }
                                )
                                : (
                                    messages.map((message, key) => {
                                        if (
                                            message.content.match(/^(http|https):\/\/.*\.(jpeg|jpg|gif|png|webp|svg)$/) != null
                                        ) {
                                            return (
                                                <div key={key}
                                                    className={`${styles.message} ${message.username === username ? styles.ownmessage : styles.othermessage}`}>

                                                    <div className="inline">
                                                        <h6>{message.username}</h6>
                                                        <small>{formatDate(message.date)}</small>
                                                    </div>
                                                    <div>
                                                        <img src={message.content} alt={`Image de ${message.username}`} />
                                                    </div>
                                                </div>
                                            )

                                        }
                                        else if (message.content.trim() !== "") {
                                            return (
                                                <div key={key}
                                                    className={`${styles.message} ${message.username === username ? styles.ownmessage : styles.othermessage}`}>
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
                                        }
                                        return null; // Exclure les messages vides

                                    })
                                )}
                        </>
                    )}
                    {error && (
                        <Notification title={error.title} content={error.content} onClose={() => setError(null)} />
                    )}
                </div>
                <Commands />
                <Input selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
            </div>
            <Userbar />
        </>
    );
}
export default Home;
