import { useRef } from "react";
import { ModalHandle } from "./DialogModal";

export const useNewModal = () => {
  const ref = useRef<ModalHandle>(null);

  const showModal = () => {
    ref.current?.open(); // ✅ call exposed method
  };

  const closeModal = () => {
    ref.current?.close(); // ✅ call exposed method
  };

  return { ref, showModal, closeModal };
};
