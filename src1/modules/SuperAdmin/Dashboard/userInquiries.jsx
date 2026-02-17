import { useEffect, useState } from "react";
import useApiMutation from "../../../api/hooks/useApiMutation";
import Loader from "../../../components/Loader";
import UserInquiriesTable from "../../../components/UserInquiriesTable";

const UserInquiries = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [loader, setLoader] = useState(true);

    const { mutate } = useApiMutation();

    useEffect(() => {
        getCustomerEnquiries();
    }, []);

    const getCustomerEnquiries = () => {
        setLoader(true);
        setEnquiries([]);
        mutate({
            url: `/admin/contact/us/forms`,
            method: "GET",
            headers: true,
            hideToast: true,
            onSuccess: (response) => {
                setEnquiries(response.data.data);
                setLoader(false)
            },
            onError: () => {
                setEnquiries([]);
                setLoader(false)
            }
        });
    }

    if (loader) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <Loader />
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <UserInquiriesTable 
                data={enquiries}
                loading={loader}
                refetch={getCustomerEnquiries}
            />
        </div>
    );
};

export default UserInquiries;