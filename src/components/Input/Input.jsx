import { socket } from "@/utils/socket";
import { useRef, useState, useEffect } from "react";
import styles from "./Input.module.scss";
import Commands from "@/components/Commands/Commands";

const Input = ({ selectedUser, setSelectedUser, username }) => {
    const inputRef = useRef();
    const soundBoardRef = useRef();
    const fileInputRef = useRef(); // Référence distincte pour le champ de fichier
    const [imagePreview, setImagePreview] = useState(null);
    const [typingUsers, setTypingUsers] = useState([]);
    const [commandsVisible, setCommandsVisible] = useState(false);

    const customFile = (
        <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M448 80c8.8 0 16 7.2 16 16V415.8l-5-6.5-136-176c-4.5-5.9-11.6-9.3-19-9.3s-14.4 3.4-19 9.3L202 340.7l-30.5-42.7C167 291.7 159.8 288 152 288s-15 3.7-19.5 10.1l-80 112L48 416.3l0-.3V96c0-8.8 7.2-16 16-16H448zM64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm80 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z" /></svg>
    );

    const soundBoard = (
        <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M499.1 6.3c8.1 6 12.9 15.6 12.9 25.7v72V368c0 44.2-43 80-96 80s-96-35.8-96-80s43-80 96-80c11.2 0 22 1.6 32 4.6V147L192 223.8V432c0 44.2-43 80-96 80s-96-35.8-96-80s43-80 96-80c11.2 0 22 1.6 32 4.6V200 128c0-14.1 9.3-26.6 22.8-30.7l320-96c9.7-2.9 20.2-1.1 28.3 5z" /></svg>
    );


    const previewImage = (e) => {
        const file = fileInputRef.current.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageBase64 = event.target.result;
                setImagePreview(imageBase64); // Set the image preview
            };
            reader.readAsDataURL(file);
        };
    };
    const onImageUpload = (e) => {
        const file = fileInputRef.current.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageBase64 = event.target.result;
                // setImagePreview(imageBase64); // Set the image preview
                socket.emit("image", { content: imageBase64, fileName: file.name });
            };
            reader.readAsDataURL(file);
        }
    };

    const onPrivateImageUpload = (e) => {
        const currentDate = new Date()
        const file = fileInputRef.current.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageBase64 = event.target.result;
                // setImagePreview(imageBase64); // Set the image preview
                socket.emit("private image", { content: imageBase64, fileName: file.name, to: selectedUser.userID });
            };
            reader.readAsDataURL(file);
        }
        //render for the sender and push in _selectedUser messages
        const _selectedUser = { ...selectedUser };
        e.preventDefault();
        _selectedUser.messages.push({
            content: imagePreview,
            fileName: fileInputRef.current.files[0] ? fileInputRef.current.files[0].name : null,
            // fromSelf: true,
            from: socket.userID,
            username: localStorage.getItem("username"),
            date: currentDate,
            isImage: true
        });
        e.preventDefault();
        setSelectedUser(_selectedUser);
        e.preventDefault();
    };


    const onDeleteImage = () => {
        // Réinitialisez la valeur du champ de fichier et l'aperçu de l'image
        fileInputRef.current.value = "";
        setImagePreview(null);
    };


    const onSend = (e) => {
        e.preventDefault();
        const currentDate = new Date();

        // Récupérez la valeur du champ de texte
        const messageContent = inputRef.current.value.trim();

        // Récupérez le fichier sélectionné
        const selectedFile = fileInputRef.current.files[0];

        // Vérifiez à la fois le champ de texte et le champ de fichier 
        if (messageContent !== "" || (selectedFile && selectedFile.size > 0)) {

            if (selectedUser) {
                const _selectedUser = { ...selectedUser };
                socket.emit("private message", {
                    content: messageContent,
                    to: selectedUser.userID,
                    date: currentDate
                });

                if (fileInputRef.current.files[0]) {
                    onPrivateImageUpload(e);
                } else if (messageContent !== "") {
                    _selectedUser.messages.push({
                        content: messageContent,
                        from: socket.userID,
                        username: localStorage.getItem("username"),
                        date: currentDate,
                    });
                    setSelectedUser(_selectedUser);
                }
            } else {
                socket.emit('message', {
                    content: messageContent,
                    date: currentDate
                });

                if (fileInputRef.current.files[0]) {
                    onImageUpload(e);
                }
            }
        }
        // Réinitialisez le champ de fichier et l'aperçu de l'image
        inputRef.current.value = "";
        fileInputRef.current.value = "";
        setImagePreview(null);
    };


    const handleTyping = () => {
        const username = localStorage.getItem("username");
        socket.emit('user typing', username);
        clearTimeout(handleTyping.timer);
        handleTyping.timer = setTimeout(() => {
            socket.emit('user stopped typing', username);
        }, 1000);

    };

    useEffect(() => {
        socket.on("user typing", (nickname) => {
            setTypingUsers((prevUsers) => {
                if (!prevUsers.includes(nickname)) {
                    return [...prevUsers, nickname];
                }
                return prevUsers;
            });
        });

        socket.on("user stopped typing", (nickname) => {
            setTypingUsers((prevUsers) => {
                return prevUsers.filter((user) => user !== nickname);
            });
        });

        return () => {
            socket.off("user typing");
            socket.off("user stopped typing");
        };
    }, []);

    const toggleCommands = () => {
        setCommandsVisible(!commandsVisible);
    };

    return (
        <>
            <div className={styles.typingIndicator}>
                {typingUsers.length > 0 && (
                    <h5>
                        {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
                    </h5>
                )}

            </div>
            <form action="" onSubmit={onSend} className={styles.input}>
                {imagePreview && (
                    <div className={styles.imagePreview}>
                        <img src={imagePreview} alt="Image Preview" />
                        <button type="button" className={styles.delete} onClick={onDeleteImage}>
                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z" /></svg>
                        </button>
                    </div>
                )}

                {/* <Commands {...{commandsVisible}} /> */}
                <Commands commandsVisible={commandsVisible} />

                <div className={styles.flex}>
                    <input
                        ref={fileInputRef}
                        className={styles.inputfile}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }} // Masquez l'élément d'entrée de fichier
                        id="fileInput" // Ajoutez un ID à l'élément d'entrée de fichier
                        onChange={previewImage} // Listen to file input changes
                    />

                    <label
                        className={styles.customFileInputLabel}
                        htmlFor="fileInput" // Lier le label à l'élément d'entrée de fichier
                        title="Upload an image"
                    >
                        {customFile}
                    </label>
                    <label ref={soundBoardRef} onClick={toggleCommands} title="Soundboard">
                        {soundBoard}
                    </label>
                    <input
                        ref={inputRef}
                        className={styles.inputtext}
                        type="text"
                        placeholder="Try /chef or paste image URL..."
                        onInput={handleTyping}
                    />

                    <button className={styles.submit} type="submit" title="Send">Send</button>

                </div>


            </form>
        </>
    );
};

export default Input;
