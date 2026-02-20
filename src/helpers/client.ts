import { useRef } from "react";
import { ModalHandle } from "../components/dialogs-modals/SimpleModal";

export const useModal = () => {
  const ref = useRef<ModalHandle>(null);

  const showModal = () => {
    ref.current?.open(); // ✅ call exposed method
  };

  const closeModal = () => {
    ref.current?.close(); // ✅ call exposed method
  };

  return { ref, showModal, closeModal };
};
