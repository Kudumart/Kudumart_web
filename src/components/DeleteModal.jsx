import useApiMutation from '../api/hooks/useApiMutation';
import { useModal } from '../hooks/modal';
import Button from './Button';

const DeleteModal = ({redirect, title, api}) => {
    const { closeModal } = useModal();

    const { mutate } = useApiMutation();

    const deleteAction = () => {
        mutate({
            url: `${api}`,
            method: "DELETE",
            data: null, // Explicitly set data to null
            headers: true,
            onSuccess: (response) => {
                redirect();
                closeModal();
            },
            onError: () => {
                closeModal();
            }
        });
    }


    return (
        <>
            <div className="w-full flex h-auto flex-col px-3 py-6 gap-3 -mt-3">
                <div className="flex gap-5 justify-center w-full">
                    <p className="font-semibold text-center text-lg">
                        {title}
                    </p>
                </div>
                <div className="flex justify-center mt-5 gap-4">
                    <Button
                        onClick={deleteAction}
                        variant="danger"
                    >
                        Delete
                    </Button>
                    <Button
                        onClick={closeModal}
                        variant="secondary"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </>
    )
}

export default DeleteModal;