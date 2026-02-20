import useApiMutation from "../api/hooks/useApiMutation";
import { Button } from "@material-tailwind/react";
import { useModal } from "../hooks/modal";

const Modal = ({
  redirect,
  title,
  api,
  method,
  body,
  text,
  submitButton = true,
}) => {
  const { closeModal } = useModal();

  const { mutate } = useApiMutation();

  const deleteAction = () => {
    mutate({
      url: `${api}`,
      method: `${method}`,
      data: body ? body : null,
      headers: true,
      onSuccess: (response) => {
        redirect();
        closeModal();
      },
      onError: () => {
        closeModal();
      },
    });
  };

  return (
    <>
      <div className="w-full flex h-auto flex-col px-3 py-6 gap-3 -mt-3">
        <div className="text-center w-full">
          <p className="font-semibold text-center text-lg">{title}</p>
          {text && <p className="text-black text-sm">{text}</p>}
        </div>
        <div className="flex justify-center mt-5 gap-4">
          {submitButton && (
            <Button
              onClick={deleteAction}
              className="bg-red-500 text-white outline-hidden px-4 py-2 rounded-lg"
            >
              Yes
            </Button>
          )}
          <button
            onClick={closeModal}
            className="bg-gray-300 text-black px-4 py-2 font-medium rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default Modal;
