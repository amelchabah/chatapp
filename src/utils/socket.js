import { io } from 'socket.io-client';

// export pour l'importer dans d'autres fichiers
// mettre le lien d'un serveur (socket.io?)
// export const socket = io("https://iut-chat.karljustiniano.fr:1234/", {
// export const socket = io("http://localhost:1234", {
export const socket = io("https://mmidev.alwaysdata.net/", {
    autoConnect: false,
});



// voir en direct ce qu'on reçoit sur notre client
socket.onAny((event, ...args) => {
    console.log("event received", event, args);
    // event et paramètres que renvoie le serveur, je recois les events de chaque autre utilisateur connecté à ce serveur (leurs usernames, messages etc)
});