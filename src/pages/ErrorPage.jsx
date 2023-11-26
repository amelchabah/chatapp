import React from "react";
import Link from "next/link";

const ErrorPage = () => {
  return (
    <div>
      <h1>Oops</h1>
      <Link href={"/"} title="home">Go back home</Link>
      <style jsx>{`
        div {
          margin: 0 auto;
          display:flex;
          justify-content:center;
          text-align:center;
          gap:0.5rem;
          flex-direction:column;
        }
      `}</style>
    </div>
  );
};

export default ErrorPage;
