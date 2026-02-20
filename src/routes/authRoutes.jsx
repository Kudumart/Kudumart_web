import Login from "../modules/Auth/login";
import SignUp from "../modules/Auth/signUp";
import Forget from "../modules/Auth/forget";
import VerifyEmail from "../modules/Auth/verifyEmail";
import AdminLogin from "../modules/SuperAdmin";
import VerifyEmailNew from "../modules/Auth/VerifiyEmailNew";
import AliConnect from "../modules/Auth/Reconnect";

export const authRoutes = [
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/sign-up",
    element: <SignUp />,
  },
  {
    path: "/forget",
    element: <Forget />,
  },
  // {
  //   path: "/verify-account",
  //   element: <VerifyEmail />,
  // },
  {
    path: "/verify-email",
    element: <VerifyEmailNew />,
  },
  {
    path: "auth/admin/login",
    element: <AdminLogin />,
  },

  {
    path: "auth/admin/ali-connect",
    element: <AliConnect />,
  },
];
