import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routes } from "./routes";
import { ModalProvider } from "./hooks/modal";
import ReusableModal from "./components/ReusableModal";
import { accessType, isTokenValid } from "./helpers/tokenValidator";
import { useDispatch } from "react-redux";
import { setIPInfo, setKuduUser } from "./reducers/userSlice";
import { IPInfoContext } from "ip-info-react";
import { useContext, useEffect } from "react";
import { onMessage } from "firebase/messaging";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { messaging } from "./config/firebaseConfig";

// 👇 optional helper if you want to use it elsewhere too
export function handleIncomingMessage(payload) {
  console.log("📨 Message received:", payload);

  const title = payload?.notification?.title ?? "📢 New Notification";
  const body = payload?.notification?.body ?? "You have a new message!";
  const extra = payload?.data?.custom ?? "";

  toast.info(
    <div>
      <strong>{title}</strong>
      <div>{body}</div>
      {extra && <small>{extra}</small>}
    </div>,
    {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "dark",
    },
  );
}

function App() {
  const router = createBrowserRouter(routes);
  const tokenValid = isTokenValid();
  const userData = accessType();
  const dispatch = useDispatch();
  const ipInfo = useContext(IPInfoContext);

  useEffect(() => {
    dispatch(setIPInfo(ipInfo));
  }, [ipInfo]);

  // useEffect(() => {
  //   // 👇 listen for foreground messages
  //   const unsubscribe = onMessage(messaging, (payload) => {
  //     handleIncomingMessage(payload);
  //   });

  //   return () => unsubscribe();
  // }, []);

  // // 👇 simple auth handling
  useEffect(() => {
    if (!tokenValid) {
      localStorage.removeItem("kuduUserToken");
      dispatch(setKuduUser(null));
    }
  }, []);

  return (
    <ModalProvider>
      <ReusableModal />
      <RouterProvider router={router} />
      {/* 👇 Needed to render all toasts */}
      <ToastContainer />
    </ModalProvider>
  );
}

export default App;
