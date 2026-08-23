import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./store/index.js";
// react-toastify CSS removed — all toasts now go through Sonner
import "react-tabs/style/react-tabs.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SocketProvider } from "./store/SocketContext.jsx";
import IPInfo from "ip-info-react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { requestNotificationPermission } from "./config/firebaseMessaging.js";
import { Toaster } from "sonner";

const queryClient = new QueryClient();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/firebase-messaging-sw.js");
}
requestNotificationPermission();

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    {/**
     * Sonner Toaster — the single toast renderer for the whole app.
     * All `toast()` calls from any file (even those importing 'react-toastify')
     * resolve here via the vite alias → src/lib/toast-shim.js → sonner.
     */}
    <Toaster
      position="bottom-right"
      richColors
      expand={false}
      duration={3500}
      closeButton
      toastOptions={{
        style: {
          fontFamily: "inherit",
          fontSize: "14px",
          fontWeight: "500",
          borderRadius: "14px",
          padding: "14px 16px",
          gap: "10px",
          boxShadow:
            "0 4px 12px rgba(0,0,0,0.15), 0 20px 40px rgba(0,0,0,0.1)",
          border: "1px solid rgba(0,0,0,0.06)",
        },
        classNames: {
          toast: "kudu-sonner-toast",
          title: "kudu-sonner-title",
          description: "kudu-sonner-desc",
          closeButton: "kudu-sonner-close",
          actionButton: "kudu-sonner-action",
        },
      }}
    />

    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <IPInfo>
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_LOGIN}>
            <App />
          </GoogleOAuthProvider>
        </IPInfo>
      </SocketProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </Provider>,
);
