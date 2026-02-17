import { useState } from 'react';
import { useForm } from 'react-hook-form';
import PulseLoader from "react-spinners/PulseLoader";
import { useUpdateKycMutation } from "../../../reducers/storeSlice";
import { toast } from "react-toastify";
import { useEffect } from 'react';
import useApiMutation from '../../../api/hooks/useApiMutation';
import Loader from '../../../components/Loader';
import useAppState from '../../../hooks/appState';

export default function UpdatedKYC() {
  const [isLoading, setIsLoading] = useState(false);
  const [loader, setLoader] = useState(true);
  const [kycData, setKYCData] = useState({});
  const { user } = useAppState();

  const { mutate } = useApiMutation();

  // Check if user is a vendor - KYC is only for vendors
  const isVendor = user?.accountType !== 'Customer';

  const [updatedKYC] = useUpdateKycMutation();

  const cardOptions = [
    {
      id: 'NIN',
      name: 'NIN'
    },
    {
      id: 'International Passport',
      name: 'International Passport'
    },
    {
      id: "Voter's Card",
      name: "Voter's Card"
    },
    {
      id: "Drivers Licence",
      name: "Drivers Licence"
    }
  ]

  const {
    register,
    handleSubmit,
    setValue
  } = useForm();

  const onSubmit = (data) => {
    // Only allow submission if user is a vendor
    if (!isVendor) {
      toast.error("KYC submission is only available for vendor accounts.");
      return;
    }

    setIsLoading(true)

    const { name, number, ...rest } = data;

    const payload = {
      ...rest,
      idVerification: {
        name,
        number,
      }
    };

    updatedKYC(payload)
      .then((res) => {
        if (res.status !== 200) throw res

        toast.success(res.data.message);
        setIsLoading(false)
      }).catch((error) => {
        toast.error(error.error.data.message);
        setIsLoading(false)
      })
  };


  const getKYC = () => {
    // Only fetch KYC data if user is a vendor
    if (!isVendor) {
      setLoader(false);
      return;
    }

    mutate({
      url: `/vendor/kyc`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        const userKYC = response.data.data;
        setKYCData(userKYC);
        setLoader(false)
      },
      onError: () => {
        setLoader(false)
      }
    });
  }


  useEffect(() => {
    getKYC();
  }, []);


  useEffect(() => {
    if (!kycData || Object.keys(kycData || {}).length === 0) return;

    setValue("businessName", kycData.businessName);
    setValue("contactEmail", kycData.contactEmail);
    setValue("contactPhoneNumber", kycData.contactPhoneNumber);
    setValue("businessDescription", kycData.businessDescription);
    setValue("businessLink", kycData.businessLink);
    setValue("businessAddress", kycData.businessAddress);
    setValue("businessRegistrationNumber", kycData.businessRegistrationNumber);
    setValue("name", kycData.idVerification.name);
    setValue("number", kycData.idVerification.number);
    setLoader(false)
  }, [kycData, setValue]);


  if (loader) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  // Show message if user is not a vendor
  if (!isVendor) {
    return (
      <div className="bg-white rounded-lg w-full p-6">
        <h2 className="text-lg font-bold mb-2">KYC Verification</h2>
        <div className='w-full h-[5px] mb-4 border' />
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">KYC verification is only available for vendor accounts.</p>
          <p className="text-sm text-gray-500">
            To access KYC verification, please switch to a vendor account or upgrade your account type.
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="bg-white rounded-lg w-full p-6">
      <h2 className="text-lg font-bold mb-2">KYC</h2>
      <div className='w-full h-[5px] mb-4 border' />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-8">
          <h3 className="font-semibold text-black-500 mb-4">Business Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">

            <div>
              <label className="block text-sm font-medium mb-3">Business Name</label>
              <input
                type="text"
                name="businessName"
                className="border rounded-sm p-2 w-full"
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
                className="border rounded-sm p-2 w-full"
                style={{ outline: "none", }}
                {...register("contactEmail", { required: "Contact email is required" })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Contact Phone Number</label>
              <input
                type="text"
                name="contactPhoneNumber"
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
                className="border rounded-sm p-2 w-full"
                style={{ outline: "none", }}
                {...register("businessDescription", { required: "Business Description is required" })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Business Link (Optional)</label>
              <input
                type="text"
                name="businessLink"
                style={{ outline: "none", }}
                className="border rounded-sm p-2 w-full"
                {...register("businessLink")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Business Address</label>
              <input
                type="text"
                name="businessAddress"
                style={{ outline: "none", }}
                className="border rounded-sm p-2 w-full"
                {...register("businessAddress", { required: "Business address is required" })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Business Registration Number (Optional)</label>
              <input
                type="text"
                name="businessRegistrationNumber"
                style={{ outline: "none", }}
                className="border rounded-sm p-2 w-full"
                {...register("businessRegistrationNumber")}
              />
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold text-black-500 mb-4">ID Verification</h3>

            <div className='flex justify-between'>
              <div className='w-[49%]'>
                <label className="block text-sm font-medium mb-3">Card Name</label>
                <select
                  {...register("name", { required: "Card Name is required" })}
                  className="w-full px-4 py-3 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                  style={{ outline: "none" }}
                  required
                >
                  <option value={null} disabled selected>Select Card</option>
                  {cardOptions.map((card) => (
                    <option value={card.id} key={card.id}>{card.name}</option>

                  ))}
                </select>
              </div>

              <div className='w-[49%]'>
                <label className="block text-sm font-medium mb-3">Card Number</label>
                <input
                  type="text"
                  name="number"
                  style={{ outline: "none", }}
                  className="border rounded-sm p-2 w-full"
                  {...register("number", { required: "Number is required" })}
                  required
                />
              </div>
            </div>

            <div className='flex justify-between'>
              <div className='w-[49%]'>
                <label className="block text-sm font-medium mb-3">Card Expiration Date</label>
                <input
                  type="date"
                  name="expiryDate"
                  style={{ outline: "none", }}
                  className="border rounded-sm p-2 w-full"
                  {...register("expiryDate", { required: "Card Expiry Date is required" })}
                  required
                />
              </div>
            </div>

          </div>
        </div>

        {Object.keys(kycData || {}).length === 0 ?
          <button className="bg-kudu-orange text-white py-2 px-6 rounded-lg md:w-[15%] w-full">{isLoading ? <PulseLoader color="#ffffff" size={5} /> :
            user.isVerified ? "Update" : "Submit"}</button>
          :
          <></>
        }
      </form>
    </div>
  );
}