/**
 * react-toastify shim → Sonner
 *
 * Every file already does:
 *   import { toast } from 'react-toastify'
 *
 * By adding this alias in vite.config, those imports resolve HERE instead.
 * We re-export Sonner's toast so no file needs to change, but all toasts
 * now render through Sonner's clean, professional UI.
 */
export { toast } from "sonner";
export { Toaster as ToastContainer } from "sonner"; // satisfies any named ToastContainer imports
