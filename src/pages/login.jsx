import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/router";
import { socket } from "@/utils/socket";
import { el } from "date-fns/locale";
import styles from "@/styles/login.module.scss";
// import Theme from "@/components/Theme/Theme.utils";


const Login = () => {
    // recuperer valeur du input
    const inputRef = useRef();
    const [error, setError] = useState("");

    // redirection
    const { push } = useRouter();

    const onKeyDown = (e) => {
        // if (e.key === "Enter") {
        if (e.keyCode === 13) {
            console.log(inputRef.current.value);
            localStorage.setItem("username", inputRef.current.value);
            inputRef.current.value = "";
            push("/");
        }
    }

    useEffect(() => {
        const checkServerAvailability = async () => {
            try {
                const response = await fetch("https://mmidev.alwaysdata.net/"); // Assurez-vous de remplacer l'URL par celle de votre serveur

                if (response.status === 200) {
                    // Le serveur est en ligne, supprimez l'erreur du localStorage
                    localStorage.removeItem("error");
                    setError(""); // Effacez également l'erreur dans l'état local
                } else {
                    // Le serveur est hors ligne, définissez l'erreur dans l'état local
                    setError('Server is down at the moment, please refresh and try later :(');
                }
            } catch (error) {
                // En cas d'erreur lors de la requête, le serveur n'est pas accessible
                console.error("Erreur lors de la vérification de la disponibilité du serveur :", error);
            }
        };

        checkServerAvailability();
    }, []);

    useEffect(() => {
        console.log(typeof localStorage.getItem('error'));
        // typeof -> on recoit que des chaines de caractere string (=== check les types contrairement a ==), pas obligatoire en vrai
        if (localStorage.getItem('error') == 100) {
            console.log('error 100');
            setError('Server is down at the moment, please refresh and try later :(')
        }
    }, []);

    // const displayError = () => {
    //     if (error !== "") {
    //         console.log('error');
    //         return <p className="error">{error}</p>
    //     }
    // }

    const getClassname = () => {
        if (error !== "") {
            return `${styles.login_frame} ${styles.error}`
        } else {
            return `${styles.login_frame}`
        }
    }

    return (
        <>
            <div className={getClassname()}>
                <img src="/assets/images/cats.jpg" width={200} height={200} alt="login image" />
                {/* <form action="" onSubmit={(e) => e.preventDefault()}> */}
                <div>
                    {/* </form> */}
                    {error !== "" ? <>
                        <p className="error">{error}</p>
                    </> : <>
                        <h1>Welcome back!</h1>
                        <h5>Please enter your username</h5>
                        <div className={styles.container}>
                            <input
                                className={styles.input}
                                ref={inputRef}
                                type="text"
                                placeholder="Username"
                                onKeyDown={onKeyDown}
                            />
                            <span className="arrow" onClick={onKeyDown}>→</span>
                        </div>
                    </>}
                    {/* ou */}
                    {/* {error !== "" && <p>{error}</p>} */}
                    {/* {displayError()} */}
                </div>

            </div>

            {/* <Theme /> */}

        </>
    )
}

export default Login
