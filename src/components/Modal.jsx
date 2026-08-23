import useApiMutation from "../api/hooks/useApiMutation";
import Button from "./Button";
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
            <Button onClick={deleteAction} variant="danger">
              Yes
            </Button>
          )}
          <Button onClick={closeModal} variant="secondary">
            Cancel
          </Button>
        </div>
      </div>
    </>
  );
};

export default Modal;
