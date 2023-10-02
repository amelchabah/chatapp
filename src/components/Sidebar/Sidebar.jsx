// import React, { useEffect, useState } from 'react';
// import styles from './Sidebar.module.scss';
// import { useRouter } from 'next/router';
// import { socket } from '@/utils/socket';

// const Sidebar = () => {
//     const [connectedUsers, setConnectedUsers] = useState([]);
//     const { push } = useRouter();
//     const [windowWidth, setWindowWidth] = useState(0);

//     useEffect(() => {
//         const handleResize = () => {
//             setWindowWidth(window.innerWidth);
//         };

//         window.addEventListener('resize', handleResize);

//         socket.on('users', (users) => {
//             // Filtrer les utilisateurs connectés
//             const onlineUsers = users.filter((user) => user.connected);
//             setConnectedUsers(onlineUsers);
//         });

//         return () => {
//             window.removeEventListener('resize', handleResize);
//             socket.off('users');
//         };
//     }, []);

//     useEffect(() => {
//         // Écouter l'événement user connected
//         socket.on('user connected', (userData) => {
//             setConnectedUsers((prevUsers) => [...prevUsers, userData]);
//         });

//         // Écouter l'événement user disconnected
//         socket.on('user disconnected', (userID) => {
//             setConnectedUsers((prevUsers) => prevUsers.filter((user) => user.userID !== userID));
//         });

//         return () => {
//             // Nettoyer les écouteurs lorsque le composant est démonté
//             socket.off('user connected');
//             socket.off('user disconnected');
//         };
//     }, []);


//     const handleLogout = () => {
//         localStorage.removeItem('sessionID');
//         localStorage.removeItem('username');
//         socket.disconnect();
//         push('/login');
//     };

//     return (
//         <div className={`${styles.sidebar} ${windowWidth < 768 ? styles['sidebar-icons'] : ''}`}>
//             <h2>Users</h2>
//             <nav>
//                 <h5>Online - {connectedUsers.length}</h5>
//                 <ul>
//                     {connectedUsers.map((user) => (
//                         <li key={user.userID}>{user.username}</li>
//                     ))}
//                 </ul>
//             </nav>
//             <button onClick={handleLogout}>
//                 <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
//                     <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0-14.3 32-32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c-28.3 0-53 15-72.9 38.9-4.8 4.8-9.1 10.1-13 15.7 21.1 14.9 45.9 24.1 72.9 24.1l64 0c17.7 0-32-14.3-32-32s-14.3-32-32-32z" />
//                 </svg> Logout
//             </button>
//         </div>
//     );
// };

// export default Sidebar;
