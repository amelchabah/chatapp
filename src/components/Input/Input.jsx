import { socket } from "@/utils/socket";
import { useRef, useState, useEffect } from "react";
import styles from "./Input.module.scss";

const Input = ({ selectedUser, setSelectedUser, username }) => {
    const inputRef = useRef();
    const fileInputRef = useRef(); // Référence distincte pour le champ de fichier
    const [imagePreview, setImagePreview] = useState(null);
    const [typingUsers, setTypingUsers] = useState([]);

    const customFile = (
        <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M448 80c8.8 0 16 7.2 16 16V415.8l-5-6.5-136-176c-4.5-5.9-11.6-9.3-19-9.3s-14.4 3.4-19 9.3L202 340.7l-30.5-42.7C167 291.7 159.8 288 152 288s-15 3.7-19.5 10.1l-80 112L48 416.3l0-.3V96c0-8.8 7.2-16 16-16H448zM64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm80 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z" /></svg>
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
        const currentDate = new Date()
        e.preventDefault();
        if (selectedUser) {
            const _selectedUser = { ...selectedUser };
            e.preventDefault();

            socket.emit("private message", {
                content: inputRef.current.value,
                to: selectedUser.userID,
                date: currentDate
            });

            // do this because react doesnt re-render otherwise
            if (fileInputRef.current.files[0]) {
                onPrivateImageUpload(e);
                // _selectedUser.messages.push({
                //     content: onPrivateImageUpload(e),
                //     fileName: fileInputRef.current.files[0] ? fileInputRef.current.files[0].name : null,
                //     // fromSelf: true,
                //     from: socket.userID,
                //     username: localStorage.getItem("username"),
                //     date: currentDate,
                //     isImage: true
                // });
            } else {
                _selectedUser.messages.push({
                    content: inputRef.current.value,
                    // fileName: null,
                    // fromSelf: true,
                    from: socket.userID,
                    username: localStorage.getItem("username"),
                    date: currentDate,
                    // isImage: false
                });

                // change the reference to trigger a render
                setSelectedUser(_selectedUser);
                e.preventDefault();
            }
        } else {
            socket.emit('message', {
                content: inputRef.current.value,
                date: currentDate
            })
            if (fileInputRef.current.files[0]) {
                onImageUpload(e);
            };
            setSelectedUser(null);
        }

        inputRef.current.value = "";
        fileInputRef.current.value = ""; // Réinitialisez le champ de fichier
        setImagePreview(null); // Reset the image preview
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
                    >
                        {customFile}
                    </label>

                    <input
                        ref={inputRef}
                        className={styles.inputtext}
                        type="text"
                        placeholder="Try /chef..."
                        onInput={handleTyping}
                    />

                    <button type="submit">Send</button>

                </div>


            </form>
        </>
    );
};

export default Input;
