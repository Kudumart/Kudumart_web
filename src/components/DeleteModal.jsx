import useApiMutation from '../api/hooks/useApiMutation';
import { Button } from '@material-tailwind/react';
import { useModal } from '../hooks/modal';

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
                        className="bg-red-500 text-white outline-hidden px-4 py-2 rounded-lg"
                    >
                        Delete
                    </Button>
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
}

export default DeleteModal;