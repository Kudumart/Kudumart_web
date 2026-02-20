import useApiMutation from '../api/hooks/useApiMutation';
import { useDispatch } from 'react-redux';
import { Button } from '@material-tailwind/react';
import { setCurrencyData, setIPInfo, setKuduUser } from '../reducers/userSlice';
import { useModal } from '../hooks/modal';

const LogOutModal = ({redirect, mode}) => {
    const dispatch = useDispatch();
    const { closeModal } = useModal();

    const { mutate } = useApiMutation();

    const logOutUser = () => {
        mutate({
            url: mode === 'admin' ? "/admin/logout" : "/user/logout",
            method: mode === 'admin' ? "GET" : "POST",
            data: null, // Explicitly set data to null
            headers: true,
            onSuccess: (response) => {
                dispatch(setKuduUser(null));
                dispatch(setCurrencyData(null));
                localStorage.clear();
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
                        Are you sure you want to log out?
                    </p>
                </div>
                <div className="flex justify-center mt-5 gap-4">
                    <Button
                        onClick={logOutUser}
                        className="bg-red-500 text-white outline-hidden px-4 py-2 rounded-lg"
                    >
                        Yes, Log Out
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

export default LogOutModal;