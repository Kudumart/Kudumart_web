import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  type PropsWithChildren,
} from "react";
import { Toaster } from "sonner";
import { X } from "lucide-react"; // Import the X icon

interface ModalProps extends PropsWithChildren {
  actions?: any;
  actionName?: string;
  title?: string; // Added title prop for better UI
}

export interface ModalHandle {
  open: () => void;
  close: () => void;
}

const Modal = forwardRef<ModalHandle, ModalProps>(
  ({ children, actions, actionName, title }, ref) => {
    const modalRef = useRef<HTMLDialogElement>(null);

    useImperativeHandle(ref, () => ({
      open: () => {
        modalRef.current?.showModal();
      },
      close: () => {
        modalRef.current?.close();
      },
    }));

    return (
      <dialog
        ref={modalRef}
        className="modal modal-middle sm:modal-middle"
        data-theme="kudu"
      >
        <Toaster theme="dark" richColors />
        <div className="modal-box max-w-2xl flex flex-col max-h-[90vh] p-6 rounded-lg shadow-xl relative">
          <div className="flex">
            {title && <h3 className="font-bold text-lg ">{title}</h3>}
            <form method="dialog" className="ml-auto">
              <button
                className="btn btn-sm btn-circle btn-ghost text-gray-500 hover:text-gray-700"
                onClick={() => modalRef.current?.close()}
              >
                <X size={20} />
              </button>
            </form>
          </div>
          {children && <div className="my-3">{children}</div>}
          {actions && <div className="ml-auto">{actions}</div>}
        </div>
      </dialog>
    );
  },
);

Modal.displayName = "Modal";

export default Modal;
