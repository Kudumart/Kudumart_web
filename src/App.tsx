import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routes } from "./routes";
import { ModalProvider } from "./hooks/modal";
import ReusableModal from "./components/ReusableModal";
import { accessType, isTokenValid } from "./helpers/tokenValidator";
import { useDispatch } from "react-redux";
import { setIPInfo, setKuduUser } from "./reducers/userSlice";
import { IPInfoContext } from "ip-info-react";
import { useContext, useEffect } from "react";
// react-toastify removed — toast is now handled by Sonner via vite alias shim
import { toast } from "./lib/toast-shim.js";
import { messaging } from "./config/firebaseConfig";

// 👇 optional helper if you want to use it elsewhere too
export function handleIncomingMessage(payload) {
  console.log("📨 Message received:", payload);

  const title = payload?.notification?.title ?? "📢 New Notification";
  const body = payload?.notification?.body ?? "You have a new message!";
  const extra = payload?.data?.custom ?? "";

  toast.info(
    `${title}\n${body}${extra ? `\n${extra}` : ""}`,
    { duration: 5000 },
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
      {/* ToastContainer removed — Sonner <Toaster> is in main.jsx */}
    </ModalProvider>
  );
}

export default App;
