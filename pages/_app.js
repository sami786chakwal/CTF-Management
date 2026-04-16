import "../styles/globals.css";
import { Toaster } from "react-hot-toast";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#12161f",
            border: "1px solid rgba(20,184,166,0.3)",
            color: "#e2e8f0",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "13px",
          },
          success: {
            iconTheme: { primary: "#14b8a6", secondary: "#042f2e" },
          },
          error: {
            iconTheme: { primary: "#f87171", secondary: "#2d1515" },
          },
        }}
      />
    </>
  );
}
