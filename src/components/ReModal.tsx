import { X } from "lucide-react";
import { useRef, forwardRef, useImperativeHandle } from "react";
import { ToastContainer } from "react-toastify";

const ReModal = forwardRef(
  (
    { children, onClose }: { children: React.ReactNode; onClose?: () => void },
    ref,
  ) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useImperativeHandle(ref, () => ({
      open: () => dialogRef.current?.showModal(),
      close: () => dialogRef.current?.close(),
    }));

    const handleCloseOnClickOutside = (
      event: React.MouseEvent<HTMLDialogElement>,
    ) => {
      if (dialogRef.current && event.target === dialogRef.current) {
        dialogRef.current.close();
      }
    };

    return (
      <dialog
        ref={dialogRef}
        onClick={handleCloseOnClickOutside}
        className="modal"
      >
        <div className="modal-box bg-base-100">
          {/*<ToastContainer />*/}

          <div className="flex justify-end">
            <button
              className="btn btn-sm btn-circle  top-2 right-2"
              onClick={(e) => {
                e.preventDefault();
                dialogRef.current?.close();
              }}
            >
              <X />
            </button>
          </div>
          {children}
        </div>
      </dialog>
    );
  },
);

export default ReModal;
