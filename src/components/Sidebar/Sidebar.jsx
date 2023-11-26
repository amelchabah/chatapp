import React, { useEffect, useState } from 'react';
import styles from './Sidebar.module.scss';
import { useRouter } from 'next/router';
import { socket } from '@/utils/socket';
// import Theme from "@/components/Theme/Theme.utils";

const getUsernameFromLocalStorage = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem("username");
    }
    return null;
};

const generateAvatar = (name) => {
    const initials = name
        .split(' ')
        .map((part) => part[0])
        .join('');
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=200&bold=true&font-size=0.4&background=d2d3fa&format=svg`;
    // return `https://kawaii-avatar.now.sh/api/avatar?username==${encodeURIComponent(initials)}`
};


const Sidebar = () => {
    const [connectedUsers, setConnectedUsers] = useState([]);
    const [windowWidth, setWindowWidth] = useState(0);
    const [username, setUsername] = useState('');
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
    const dayOfMonth = today.getDate();
    const formattedDate = `${dayOfWeek} ${dayOfMonth}`;

    useEffect(() => {
        const username = getUsernameFromLocalStorage();
        if (username) {
            setUsername(username);
        }
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        socket.on('users', (users) => {
            const uniqueUsers = [...new Set(users.map((user) => user.username))];
            setConnectedUsers(uniqueUsers);
        });

        return () => {
            window.removeEventListener('resize', handleResize);
            socket.off('users');
        };
    }, []);

    const toggleSidebar = () => {
        const sidebar = document.querySelector(`.${styles.sidebar}`);

        if (sidebar) {
            if (sidebar.classList.contains(styles.active)) {
                sidebar.classList.remove(styles.active);
                sidebar.classList.add(styles.inactive);
            } else {
                sidebar.classList.remove(styles.inactive);
                sidebar.classList.add(styles.active);
            }
        }
    };
    return (
        <div className={`${styles.sidebar} ${styles.inactive}`} onClick={toggleSidebar}>
            <h3>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z" /></svg>
                <span>
                    Profile
                </span>
            </h3>
            <div className={styles.profile}>
                <div className={styles.avatar}>
                    <img src={generateAvatar(username)} alt="your avatar" />
                </div>
                <div className={styles.userinfos}>
                    <h4>{username}</h4>
                </div>
            </div>

            <article>
                <h5>today is <b>{formattedDate}</b> ⊹˙</h5>

            </article>
            <ul>
                <li>© Copyrights</li>
                <li>ui by <a href="https://github.com/amelchabah/" target='_blank' rel="noopener noreferrer">@amelchabah</a></li>
                <li>server by <a href="https://github.com/karljstn" target='_blank' rel="noopener noreferrer">@karljstn</a></li>
                <li>avatars from <a href="https://ui-avatars.com/" target="_blank" rel="noopener noreferrer">ui-avatars.com</a>
                </li>
                <li>icons from <a href="https://fontawesome.com/" target="_blank" rel="noopener noreferrer">fontawesome.com</a>
                </li>
                <li>made with <a href="https://socket.io/" target='_blank' rel="noopener noreferrer">Socket.io</a> & <a href='https://nextjs.org/' target='_blank' rel="noopener noreferrer">Next.js</a></li>
                <li>more features soon ;)</li>
            </ul>

            <div className={styles.pull}> ◂ </div>
        </div>
    );
};

export default Sidebar;
