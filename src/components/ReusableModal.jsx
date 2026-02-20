import { DialogBody } from "@material-tailwind/react";
import React from "react";
import ReactDOM from "react-dom";
import { useModal } from "../hooks/modal";

const ReusableModal = () => {
  const { isOpen, modalOptions, closeModal } = useModal();
  const { size, content } = modalOptions;

  if (!isOpen) {
    return null;
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-[1000] backdrop-blur-md bg-black/30 flex items-start justify-center overflow-auto pt-32"
      onClick={closeModal}
    >
      <div
        className={`relative w-full max-w-${size || "md"} p-4`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative rounded-lg bg-white shadow-xl">
          <div className="p-4">
            <DialogBody className="montserrat">{content || <></>}</DialogBody>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ReusableModal;
