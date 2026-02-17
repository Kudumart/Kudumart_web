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
      <dialog ref={modalRef} className="modal modal-middle sm:modal-middle">
        <Toaster theme="dark" richColors />
        <div className="modal-box p-0 relative isolate bg-base-100  max-w-2xl min-h-32 flex flex-col max-h-[90vh]  rounded-lg shadow-xl ">
          <div className="flex border-b sticky top-0 h-14 z-20 bg-base-100 p-4 left-0 right-0 border-current/20">
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
          <div className=" p-4 overflow-scroll">
            {children && <div className="">{children}</div>}
          </div>

          {actions && (
            <div className="sticky bottom-0 right-0">
              <div className="ml-auto p-4 border-t flex item-center bg-base-100 border-current/20">
                {actions}
              </div>
            </div>
          )}
        </div>
      </dialog>
    );
  },
);

Modal.displayName = "Modal";

export default Modal;
