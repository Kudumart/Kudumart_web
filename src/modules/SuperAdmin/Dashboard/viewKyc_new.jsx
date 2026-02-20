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
            setValue("name", kycData.idVerification?.name || "");
            setValue("number", kycData.idVerification?.number || "");
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
        <div className="bg-gray-50 min-h-screen p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">KYC Verification Details</h1>
                            <p className="text-gray-600 mt-1">
                                Vendor: {kycData.user?.firstName} {kycData.user?.lastName}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                kycData.isVerified 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {kycData.isVerified ? 'Verified' : 'Pending Verification'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Business Information */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m-2 0H5m2 0v-9a2 2 0 012-2h2a2 2 0 012 2v9"/>
                        </svg>
                        Business Information
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                            <div className="p-3 bg-gray-50 border rounded-lg">
                                {kycData.businessName || 'N/A'}
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                            <div className="p-3 bg-gray-50 border rounded-lg">
                                {kycData.contactEmail || 'N/A'}
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                            <div className="p-3 bg-gray-50 border rounded-lg">
                                {kycData.contactPhoneNumber || 'N/A'}
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Business Registration Number</label>
                            <div className="p-3 bg-gray-50 border rounded-lg">
                                {kycData.businessRegistrationNumber || 'N/A'}
                            </div>
                        </div>
                        
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Business Description</label>
                            <div className="p-3 bg-gray-50 border rounded-lg min-h-[80px]">
                                {kycData.businessDescription || 'N/A'}
                            </div>
                        </div>
                        
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
                            <div className="p-3 bg-gray-50 border rounded-lg">
                                {kycData.businessAddress || 'N/A'}
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Business Link</label>
                            <div className="p-3 bg-gray-50 border rounded-lg">
                                {kycData.businessLink ? (
                                    <a 
                                        href={kycData.businessLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        {kycData.businessLink}
                                    </a>
                                ) : 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ID Verification */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"/>
                        </svg>
                        ID Verification
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Card Name</label>
                            <div className="p-3 bg-gray-50 border rounded-lg">
                                {kycData.idVerification?.name || 'N/A'}
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                            <div className="p-3 bg-gray-50 border rounded-lg">
                                {kycData.idVerification?.number || 'N/A'}
                            </div>
                        </div>
                    </div>

                    {/* Document Images */}
                    {kycData.idVerification && kycData.idVerification.prototypes && kycData.idVerification.prototypes.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded Documents</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {kycData.idVerification.prototypes.map((doc, index) => (
                                    <div key={index} className="border rounded-lg p-4">
                                        <p className="text-sm font-medium text-gray-700 mb-2">
                                            Document {index + 1}
                                        </p>
                                        <img 
                                            src={doc} 
                                            alt={`ID Document ${index + 1}`}
                                            className="w-full h-48 object-cover rounded-sm border"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'block';
                                            }}
                                        />
                                        <div className="hidden bg-gray-100 h-48 flex items-center justify-center rounded-sm border">
                                            <span className="text-gray-500">Unable to load image</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Vendor Information */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        Vendor Information
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <div className="p-3 bg-gray-50 border rounded-lg">
                                {kycData.user?.firstName} {kycData.user?.lastName}
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <div className="p-3 bg-gray-50 border rounded-lg">
                                {kycData.user?.email || 'N/A'}
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <div className="p-3 bg-gray-50 border rounded-lg">
                                {kycData.user?.phoneNumber || 'N/A'}
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                            <div className="p-3 bg-gray-50 border rounded-lg capitalize">
                                {kycData.user?.accountType || 'N/A'}
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Verification Status</label>
                            <div className="p-3 bg-gray-50 border rounded-lg">
                                <span className={`px-2 py-1 rounded text-sm ${
                                    kycData.user?.isVerified 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {kycData.user?.isVerified ? 'Verified' : 'Not Verified'}
                                </span>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
                            <div className="p-3 bg-gray-50 border rounded-lg">
                                <span className={`px-2 py-1 rounded text-sm capitalize ${
                                    kycData.user?.status === 'active' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {kycData.user?.status || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timestamps */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Timeline
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">KYC Submitted</label>
                            <div className="p-3 bg-gray-50 border rounded-lg">
                                {kycData.createdAt ? new Date(kycData.createdAt).toLocaleString() : 'N/A'}
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                            <div className="p-3 bg-gray-50 border rounded-lg">
                                {kycData.updatedAt ? new Date(kycData.updatedAt).toLocaleString() : 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-center">
                        <button 
                            onClick={() => navigate('/admin/all-vendors')}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Back to Vendors
                        </button>
                        
                        <div className="flex space-x-4">
                            <button 
                                onClick={() => kycData.id && submitKyc(kycData.id, null, 'approve')} 
                                disabled={!kycData.id || kycData.isVerified}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {isLoadApp ? <PulseLoader color="#ffffff" size={5} /> : (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                                        </svg>
                                        {kycData.isVerified ? 'Already Approved' : 'Approve KYC'}
                                    </>
                                )}
                            </button>
                            
                            <button 
                                onClick={() => kycData.id && rejectKYC(kycData.id)} 
                                disabled={!kycData.id}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                                Reject KYC
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
