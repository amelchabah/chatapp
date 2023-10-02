import { useState, useEffect, useRef } from "react"
import styles from "./Theme.module.scss"
import Script from 'next/script'

export default function SetTheme() {

    const [theme, setTheme] = useState()
    const popupRef = useRef(null);

    const toggleTheme = () => {
        if (theme == 'light') {
            setTheme('dark')
        } else if (theme == 'dark') {
            setTheme('light')
        }
    }

    const buttonIcon = () => {
        switch (theme) {
            case 'dark': return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 384 512"><path d="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z" /></svg>)
            case 'light': return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z" /></svg>)
        }
    }

    const defaultTheme = () => {
        const themeLocalStorage = localStorage.getItem('theme')
        const themeSystem = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

        return (themeLocalStorage ?? themeSystem)
    }

    useEffect(() => {

        if (!theme) return setTheme(defaultTheme())

        document.querySelector(':root').dataset.theme = (theme)
        localStorage.setItem('theme', (theme))

        const useSetTheme = (e) => { setTheme(e.matches ? 'dark' : 'light') }
        const watchSysTheme = window.matchMedia('(prefers-color-scheme: dark)')

        watchSysTheme.addEventListener('change', useSetTheme)

        return () => {
            watchSysTheme.removeEventListener('change', useSetTheme)
        }
    }, [theme])


    useEffect(() => {
        const popup = popupRef.current;
        if (!popup) return;
        const hidePopup = () => {
            popup.classList.add(styles.hide);
            localStorage.setItem('popup', 'hidden');
            setTimeout(() => {
                popup.remove();
            }, 1000);
        };
    
        setTimeout(() => {
            popup.classList.add(styles.inactive);
        }, 8000);

        setTimeout(() => {
            hidePopup();
        }, 9000);

        // Vérifiez si le popup doit être caché en fonction du localStorage
        if (localStorage.getItem('popup') === 'hidden') {
            hidePopup();
        }
    }, []);


    return (
        <>
            <Script id="theme.util.jsx" strategy="beforeInteractive" >
                {`
                let themeLocalStorage   = localStorage.getItem('theme')
                let themeSystem         = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
                document.querySelector(':root').dataset.theme = themeLocalStorage ?? themeSystem
                `}
            </Script>
            <div className={styles.fixed}>
                <div ref={popupRef} className={styles.popup}>
                    <h5>Switch dark/light mode here! ⟶</h5>
                </div>
                <button key="themeToggle" onClick={toggleTheme} data-theme={theme} className={styles.toggle} title={theme + ' mode'}>
                    {buttonIcon(theme)}
                </button>
            </div>
        </>
    )
}