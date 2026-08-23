import useApiMutation from '../api/hooks/useApiMutation';
import { useDispatch } from 'react-redux';
import Button from './Button';
import { setCurrencyData, setIPInfo, setKuduUser } from '../reducers/userSlice';
import { useModal } from '../hooks/modal';
import { usePermissions } from '../store/clientStore';

const LogOutModal = ({redirect, mode}) => {
    const dispatch = useDispatch();
    const { closeModal } = useModal();
    const { setPerms } = usePermissions();

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
                setPerms(null);
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
                    <Button onClick={logOutUser} variant="danger">
                        Yes, Log Out
                    </Button>
                    <Button onClick={closeModal} variant="secondary">
                        Cancel
                    </Button>
                </div>
            </div>
        </>
    );
}

export default LogOutModal;