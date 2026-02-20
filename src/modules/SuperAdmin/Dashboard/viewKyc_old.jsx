import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import PulseLoader from "react-spinners/PulseLoader";
import useApiMutation from '../../../api/hooks/useApiMutation';
import Loader from '../../../components/Loader';
import { useModal } from '../../../hooks/modal';

export default function ViewKYC() {
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadApp, setIsApp] = useState(false);
    const [isLoadRej, setIsRej] = useState(false);
    const [kycData, setKYCData] = useState({});
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams();

    const { openModal } = useModal();

    // Check if id exists and is valid
    useEffect(() => {
        console.log('🚀 ViewKYC Component initialized with ID:', id, '(type:', typeof id, ')');
        if (!id || isNaN(parseInt(id, 10))) {
            console.log('❌ Invalid vendor ID provided:', id);
            setError('Invalid vendor ID provided');
            setIsLoading(false);
            return;
        }
    }, [id]);

    const {
        register,
        handleSubmit,
        setValue,
    } = useForm();

    const { mutate } = useApiMutation()

    const submitKyc = (id, formData, state) => {
        // Set loading state depending on the action
        state === 'approve' ? setIsApp(true) : setIsRej(true);

        // Build payload; include the admin note for rejections.
        const payload = {
            kycId: id,
            isVerified: state === 'approve',
            // For approve, isVerified is true; for reject, it could be false.
            ...(state === 'reject' && { note: formData.note }), // This is the value captured from the input.
        };

        mutate({
            url: "/admin/kyc/approve-reject",
            method: "POST",
            data: payload,
            headers: true,
            onSuccess: (response) => {
                state === 'approve' ? setIsApp(false) : setIsRej(false);
            },
            onError: () => {
                state === 'approve' ? setIsApp(false) : setIsRej(false);
            },
        });
    };

    const rejectKYC = (id) => {
        openModal({
            size: "sm",
            content: <>
                <form onSubmit={handleSubmit((data) => submitKyc(id, data, 'reject'))}>
                    <div className="w-full flex flex-col h-auto px-3 py-6 gap-3 -mt-3">
                        <div className="flex justify-center gap-5 w-full">
                            <p className="font-semibold text-center text-lg">
                                Admin Note
                            </p>
                        </div>
                        <div>
                            <input
                                type="text"
                                name="note"
                                className="border rounded-sm p-2 w-full"
                                style={{ outline: "none" }}
                                // Remove "disabled" so the admin can type their note
                                {...register("note", { required: "Admin Note is required" })}
                                required
                            />
                        </div>
                        <div className="flex gap-4 justify-center w-full">
                            <button
                                type="submit"
                                className="bg-kudu-orange text-white py-2 px-6 rounded-lg w-1/2"
                            >
                                {isLoadRej ? <PulseLoader color="#ffffff" size={5} /> : "Submit"}
                            </button>
                        </div>
                    </div>
                </form>            </>
        })
    }


    const getKYC = () => {
        if (!id || isNaN(parseInt(id, 10))) {
            console.log('❌ Invalid vendor ID:', id);
            setError('Invalid vendor ID provided');
            setIsLoading(false);
            return;
        }

        console.log('🔍 Fetching KYC data for vendor ID:', id);

        mutate({
            url: `/admin/kyc`,
            method: "GET",
            headers: true,
            hideToast: true,
            onSuccess: (response) => {
                try {
                    console.log('✅ Raw KYC API Response:', response);
                    console.log('📊 KYC Data Array:', response.data.data);
                    
                    // Convert id to number for comparison since URL params are strings
                    const vendorId = parseInt(id, 10);
                    console.log('🔢 Looking for vendor ID:', vendorId, '(type:', typeof vendorId, ')');
                    
                    // Log all vendor IDs in the data for comparison
                    const allVendorIds = response.data.data.map(item => ({
                        vendorId: item.vendorId,
                        type: typeof item.vendorId,
                        id: item.id
                    }));
                    console.log('🆔 All vendor IDs in KYC data:', allVendorIds);
                    
                    const userKYC = response.data.data.find((item) => item.vendorId === vendorId);
                    console.log('🎯 Found KYC data for vendor:', userKYC);
                    
                    if (!userKYC) {
                        console.log('❌ No KYC data found for vendor ID:', vendorId);
                        setError('No KYC data found for this vendor');
                        setIsLoading(false);
                        return;
                    }
                    
                    console.log('✅ Setting KYC data:', userKYC);
                    setKYCData(userKYC);
                    setIsLoading(false);
                } catch (err) {
                    console.error('❌ Error processing KYC data:', err);
                    setError('Error processing KYC data');
                    setIsLoading(false);
                }
            },
            onError: (error) => {
                console.error('❌ Error fetching KYC data:', error);
                setError('Failed to fetch KYC data');
                setIsLoading(false);
            }
        });
    }


    useEffect(() => {
        if (id && !isNaN(parseInt(id, 10))) {
            getKYC();
        }
    }, [id]);


    useEffect(() => {
        if (!kycData || Object.keys(kycData || {}).length === 0) return;

        try {
            setValue("businessName", kycData.businessName || "");
            setValue("contactEmail", kycData.contactEmail || "");
            setValue("contactPhoneNumber", kycData.contactPhoneNumber || "");
            setValue("businessDescription", kycData.businessDescription || "");
            setValue("businessLink", kycData.businessLink || "");
            setValue("businessAddress", kycData.businessAddress || "");
            setValue("businessRegistrationNumber", kycData.businessRegistrationNumber || "");
            
            // Safely parse ID verification data
            if (kycData.idVerification) {
                try {
                    const idVerification = JSON.parse(kycData.idVerification);
                    setValue("name", idVerification.name || "");
                    setValue("number", idVerification.number || "");
                } catch (parseError) {
                    console.error("Error parsing idVerification:", parseError);
                    setValue("name", "");
                    setValue("number", "");
                }
            } else {
                setValue("name", "");
                setValue("number", "");
            }
            
            setIsLoading(false);
        } catch (error) {
            console.error("Error setting form values:", error);
            setIsLoading(false);
        }
    }, [kycData, setValue]);




    if (error) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading KYC Data</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button 
                        onClick={() => navigate('/admin/all-vendors')}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                        Back to Vendors
                    </button>
                </div>
            </div>
        )
    };

    if (isLoading) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <Loader />
            </div>
        )
    };

    // Check if no KYC data was found for this vendor
    if (!kycData || Object.keys(kycData).length === 0) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">No KYC Data Found</h2>
                    <p className="text-gray-600 mb-4">This vendor has not completed their KYC process.</p>
                    <button 
                        onClick={() => navigate('/admin/all-vendors')}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                        Back to Vendors
                    </button>
                </div>
            </div>
        )
    };


    return (
        <div className="bg-white rounded-lg w-full p-6">
            <h2 className="text-lg font-bold mb-2">Updated KYC</h2>
            <div className='w-full h-[5px] mb-4 border' />
            <div className="mb-8">
                <h3 className="font-semibold text-black-500 mb-4">Business Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">

                    <div>
                        <label className="block text-sm font-medium mb-3">Business Name</label>
                        <input
                            type="text"
                            name="businessName"
                            className="border rounded-sm p-2 w-full"
                            disabled
                            style={{ outline: "none", }}
                            {...register("businessName", { required: "Business name is required" })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-3">Contact Email</label>
                        <input
                            type="email"
                            name="contactEmail"
                            disabled
                            className="border rounded-sm p-2 w-full"
                            style={{ outline: "none", }}
                            {...register("contactEmail", { required: "Contact email is required" })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-3">Contact Phone Number</label>
                        <input
                            type="number"
                            name="contactPhoneNumber"
                            disabled
                            className="border rounded-sm p-2 w-full"
                            style={{ outline: "none", }}
                            {...register("contactPhoneNumber", { required: "Contact Phone Number is required" })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-3">Business Description</label>
                        <input
                            type="text"
                            name="businessDescription"
                            disabled
                            className="border rounded-sm p-2 w-full"
                            style={{ outline: "none", }}
                            {...register("businessDescription", { required: "Business Description is required" })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-3">Business Link</label>
                        <input
                            type="text"
                            name="businessLink"
                            disabled
                            style={{ outline: "none", }}
                            className="border rounded-sm p-2 w-full"
                            {...register("businessLink", { required: "Business link is required" })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-3">Business Address</label>
                        <input
                            type="text"
                            name="businessAddress"
                            disabled
                            style={{ outline: "none", }}
                            className="border rounded-sm p-2 w-full"
                            {...register("businessAddress", { required: "Business address is required" })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-3">Business Registration Number</label>
                        <input
                            type="text"
                            name="businessRegistrationNumber"
                            disabled
                            style={{ outline: "none", }}
                            className="border rounded-sm p-2 w-full"
                            {...register("businessRegistrationNumber", { required: "Business Registration Number is required" })}
                            required
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <h3 className="font-semibold text-black-500 mb-4">ID Verification</h3>

                    <div className='flex justify-between'>
                        <div className='w-[49%]'>
                            <label className="block text-sm font-medium mb-3">Card Name</label>
                            <input
                                type="text"
                                name="name"
                                disabled
                                style={{ outline: "none", }}
                                className="border rounded-sm p-2 w-full"
                                {...register("name", { required: "Name is required" })}
                                required
                            />
                        </div>

                        <div className='w-[49%]'>
                            <label className="block text-sm font-medium mb-3">Card Number</label>
                            <input
                                type="number"
                                name="number"
                                disabled
                                style={{ outline: "none", }}
                                className="border rounded-sm p-2 w-full"
                                {...register("number", { required: "Number is required" })}
                                required
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className='flex w-full justify-end gap-4'>
                <button 
                    onClick={() => kycData.id && submitKyc(kycData.id, null, 'approve')} 
                    disabled={!kycData.id}
                    className="bg-kudu-orange text-white py-2 px-6 rounded-lg w-[15%] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoadApp ? <PulseLoader color="#ffffff" size={5} /> : "Approve"}
                </button>
                <button 
                    onClick={() => kycData.id && rejectKYC(kycData.id)} 
                    disabled={!kycData.id}
                    className="bg-white border py-2 px-6 rounded-lg w-[15%] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Reject
                </button>
            </div>
        </div>
    );
}