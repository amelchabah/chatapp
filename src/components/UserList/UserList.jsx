import React, { useState } from "react";
import styles from "./UserList.module.scss";
import { socket } from "@/utils/socket";
import { useRouter } from "next/router";
import { useEffect } from "react";


const UserList = ({ users, setUsers, selectedUser, setSelectedUser, messages, showGeneralMessages, setShowGeneralMessages }) => {

    const { push } = useRouter();
    const onlineUsers = users.filter((user) => user.connected);

    const generateAvatar = (username) => {
        const initials = username
            .split(' ')
            .map((part) => part[0])
            .join('');
        // return `https://kawaii-avatar.now.sh/api/avatar?username==${encodeURIComponent(initials)}`
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=200&bold=true&font-size=0.4&background=d2d3fa&format=svg`;
    };

    const handleGeneralClick = () => {
        setSelectedUser(null); // Désélectionnez l'utilisateur sélectionné
        setShowGeneralMessages(true);
    };

    const handleUserClick = (user) => {
        setSelectedUser(user);
        setShowGeneralMessages(false);
    };

    const HandleLogout = () => {
        localStorage.removeItem("sessionID");
        localStorage.removeItem("username");
        localStorage.removeItem("error");
        socket.disconnect();
        push("/login");
    };

    const resetNotification = (user) => {
    const _users = [...users];
    
    const index = _users.findIndex((_user) => _user.userID === user.userID);
        _users[index].hasNewMessages = false;
    setUsers(_users);
    };


    return (
        <div className={styles.userlist}>
            <h3>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M64 0C28.7 0 0 28.7 0 64V352c0 35.3 28.7 64 64 64h96v80c0 6.1 3.4 11.6 8.8 14.3s11.9 2.1 16.8-1.5L309.3 416H448c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H64z" /></svg>
                <span>
                    Messages
                </span>
            </h3>
            {/* <div className={`${styles.user}`} onClick={handleGeneralClick}> */}
            <div
                className={`${styles.user} ${selectedUser ? "" : styles.user__active}`} // Ajoutez la classe user__active si selectedUser est null
                onClick={handleGeneralClick}
            >
                <div className={styles.avatar}>
                    <img src={generateAvatar("General")} alt="your avatar" />
                </div>
                <p>General</p></div>
            <hr />
            <nav>
                <h5>Online - {onlineUsers.length - 1}</h5>
                <div className={styles.list}>

                    {onlineUsers.length === 1 ? (
                        <h5 className={styles.mini}>...y a prsn mskn🧍</h5>
                    ) : (

                        users
                            .filter((user) => user.userID !== socket.userID) // Filtrer votre propre utilisateur
                            .map((user) => {
                                return user.connected ? (
                                    <div
                                        key={user.userID}
                                        className={`${styles.user} ${selectedUser?.userID === user.userID ? styles.user__active : ""}`}
                                        onClick={() => handleUserClick(user)}
                                    >
                                        <div className={styles.avatar}>
                                            <img src={generateAvatar(user.username)} alt="your avatar" />
                                        </div>
                                        {user.hasNewMessages ? (<p className={styles.bold}>{user.username}</p>) : (<p>{user.username}</p>)}
                                        {user.hasNewMessages ? (<div className={styles.newMessage}></div>) : null}
                                    </div>
                                ) : null;

                            }
                            )
                    )}




                </div>

            </nav>
            <button onClick={HandleLogout}>
                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                    <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0-14.3 32-32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c-28.3 0-53 15-72.9 38.9-4.8 4.8-9.1 10.1-13 15.7 21.1 14.9 45.9 24.1 72.9 24.1l64 0c17.7 0-32-14.3-32-32s-14.3-32-32-32z" />
                </svg>
                <p>Logout</p>
            </button>
        </div>
    );
};

export default UserList;
