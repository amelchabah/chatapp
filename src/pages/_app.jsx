import "@/styles/globals.scss";
import { useRouter } from 'next/router';
import Head from 'next/head';
import Theme from "@/components/Theme/Theme.utils";


export default function App({ Component, pageProps }) {
    const router = useRouter();
    const isLoginPage = router.pathname === '/login';

    return (
        <>
            <Head>
                <title>let's chat ‧₊˚ 🖇️✩ ₊˚🎧⊹♡</title>
                <link rel="icon" href="favicon/favicon.ico" />
                <link rel="apple-touch-icon" sizes="180x180" href="favicon/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="favicon/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="favicon/favicon-16x16.png" />
                <link rel="manifest" href="favicon/site.webmanifest" />
                
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="description" content="A chat app built with Socket.io, Next.js, and React." />
                <meta name="keywords" content="socket.io, next.js, react, chat, app" />
                <meta name="author" content="amel chabah" />
                <meta name="og:title" content="socket.io chat app" />
                <meta name="og:description" content="Your local chat app built with Socket.io, Next.js, and React." />
                <meta name="og:type" content="website" />
                <meta name="og:url" content="https://socket-io-chat-app.vercel.app/" />
                <meta name="og:image" content="https://socket-io-chat-app.vercel.app/og-image.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content="@vwel00" />
                <meta name="twitter:creator" content="@vwel00" />
                <meta name="twitter:title" content="socket.io chat app" />
                <meta name="twitter:description" content="A chat app built with Socket.io, Next.js, and React." />
            </Head>
            <Theme />
            <main className={isLoginPage ? 'login' : ''}>
                <Component {...pageProps} />
            </main>

        </>
    );
}
