import { useState } from 'react';
import { useForm } from 'react-hook-form';
import PulseLoader from "react-spinners/PulseLoader";
import { useUpdateKycMutation } from "../../../reducers/storeSlice";
import { toast } from "react-toastify";
import { useEffect } from 'react';
import useApiMutation from '../../../api/hooks/useApiMutation';
import Loader from '../../../components/Loader';
import useAppState from '../../../hooks/appState';
import { useDispatch } from 'react-redux';
import { setKuduUser } from '../../../reducers/userSlice';
import { useModal } from '../../../hooks/modal';
import { Clock3 } from 'lucide-react';

const isApprovedKycValue = (value) => value === true || value === 1 || value === "1";

export default function UpdatedKYC() {
  const [isLoading, setIsLoading] = useState(false);
  const [loader, setLoader] = useState(true);
  const [kycData, setKYCData] = useState({});
  const { user } = useAppState();
  const dispatch = useDispatch();
  const { openModal, closeModal } = useModal();

  const { mutate } = useApiMutation();

  // Check if user is a vendor - KYC is only for vendors
  const isVendor = user?.accountType !== 'Customer';

  const [updatedKYC] = useUpdateKycMutation();
  const isKycVerified = isApprovedKycValue(kycData.isVerified);
  const reviewStatus = kycData.reviewStatus || (isKycVerified ? "approved" : kycData.adminNote ? "changes_requested" : kycData.id ? "pending" : "not_submitted");
  const fieldReview = (field) => kycData.fieldReviews?.[field];
  const canEditField = (field, businessField = false) => {
    if (!kycData.id) return true;
    if (reviewStatus === "changes_requested") return fieldReview(field)?.status === "rejected";
    if (reviewStatus === "approved") return businessField;
    return false;
  };
  const correctionReason = (field) => fieldReview(field)?.status === "rejected" ? fieldReview(field)?.reason : "";
  const Reason = ({ field }) => correctionReason(field) ? <p className="mt-1 text-xs text-red-600">{correctionReason(field)}</p> : null;

  const showReviewModal = () => {
    openModal({
      size: "sm",
      content: (
        <div className="px-3 py-4 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-primary">
            <Clock3 size={28} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">KYC submitted for review</h3>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Thank you for submitting your details. Our team will review them and notify you when a decision has been made.
          </p>
          <button
            type="button"
            onClick={closeModal}
            className="mt-6 w-full rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white"
          >
            Got it
          </button>
        </div>
      ),
    });
  };

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

    const { name, number, expiryDate, ...rest } = data;

    const payload = {
      ...rest,
      idVerification: {
        name: name ?? kycData.idVerification?.name,
        number: number ?? kycData.idVerification?.number,
        expiryDate: expiryDate ?? kycData.idVerification?.expiryDate,
      }
    };

    updatedKYC(payload)
      .unwrap()
      .then((response) => {
        const savedKYC = response.data || { ...kycData, ...payload };
        const isApproved = isApprovedKycValue(savedKYC.isVerified);
        setKYCData(savedKYC);
        dispatch(setKuduUser({
          ...user,
          phoneNumber: savedKYC.phoneNumber || savedKYC.contactPhoneNumber || user.phoneNumber,
          isVerified: isApproved,
          kycStatus: savedKYC.reviewStatus === "changes_requested" ? "rejected" : isApproved ? "approved" : "pending",
        }));
        if (isApproved) {
          toast.success(response.message || "KYC updated successfully");
        } else {
          showReviewModal();
        }
      }).catch((error) => {
        toast.error(error?.data?.message || "Unable to update KYC. Please try again.");
      }).finally(() => {
        setIsLoading(false);
      });
  };

  const onInvalid = (errors) => {
    const firstError = Object.values(errors)[0];
    toast.error(firstError?.message || "Please complete the required fields before updating KYC.");
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
        const userKYC = response.data.data || {};
        const isApproved = isApprovedKycValue(userKYC.isVerified);
        setKYCData(userKYC);
        dispatch(setKuduUser({
          ...user,
          isVerified: isApproved,
          kycStatus: userKYC.id
            ? (isApproved ? "approved" : (userKYC.reviewStatus === "changes_requested" ? "rejected" : "pending"))
            : "not_submitted",
        }));
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

    setValue("businessName", kycData.businessName || "");
    setValue("contactEmail", kycData.contactEmail || "");
    setValue("contactPhoneNumber", kycData.contactPhoneNumber || "");
    setValue("businessDescription", kycData.businessDescription || "");
    setValue("businessLink", kycData.businessLink || "");
    setValue("businessAddress", kycData.businessAddress || "");
    setValue("businessRegistrationNumber", kycData.businessRegistrationNumber || "");
    setValue("name", kycData.idVerification?.name || "");
    setValue("number", kycData.idVerification?.number || "");
    setValue("expiryDate", kycData.idVerification?.expiryDate || "");
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

      {reviewStatus === "pending" && <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><strong>KYC under review.</strong> We will notify you when the review is complete.</div>}
      {reviewStatus === "changes_requested" && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"><strong>Changes requested.</strong> Update the highlighted details below and resubmit them for review.</div>}

      <form noValidate onSubmit={handleSubmit(onSubmit, onInvalid)}>
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
                disabled={!canEditField("businessName", true)}
                required
              />
              <Reason field="businessName" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Contact Email</label>
              <input
                type="email"
                name="contactEmail"
                className="border rounded-sm p-2 w-full"
                style={{ outline: "none", }}
                {...register("contactEmail", { required: "Contact email is required" })}
                disabled={!canEditField("contactEmail", true)}
                required
              />
              <Reason field="contactEmail" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Contact Phone Number</label>
              <input
                type="text"
                name="contactPhoneNumber"
                className="border rounded-sm p-2 w-full"
                style={{ outline: "none", }}
                {...register("contactPhoneNumber", { required: "Contact Phone Number is required" })}
                disabled={!canEditField("contactPhoneNumber", true)}
                required
              />
              <Reason field="contactPhoneNumber" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Business Description</label>
              <input
                type="text"
                name="businessDescription"
                className="border rounded-sm p-2 w-full"
                style={{ outline: "none", }}
                {...register("businessDescription", { required: "Business Description is required" })}
                disabled={!canEditField("businessDescription", true)}
                required
              />
              <Reason field="businessDescription" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Business Link (Optional)</label>
              <input
                type="text"
                name="businessLink"
                style={{ outline: "none", }}
                className="border rounded-sm p-2 w-full"
                {...register("businessLink")}
                disabled={!canEditField("businessLink", true)}
              />
              <Reason field="businessLink" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Business Address</label>
              <input
                type="text"
                name="businessAddress"
                style={{ outline: "none", }}
                className="border rounded-sm p-2 w-full"
                {...register("businessAddress", { required: "Business address is required" })}
                disabled={!canEditField("businessAddress", true)}
                required
              />
              <Reason field="businessAddress" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Business Registration Number (Optional)</label>
              <input
                type="text"
                name="businessRegistrationNumber"
                style={{ outline: "none", }}
                className="border rounded-sm p-2 w-full"
                {...register("businessRegistrationNumber")}
                disabled={!canEditField("businessRegistrationNumber")}
              />
              <Reason field="businessRegistrationNumber" />
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold text-black-500 mb-4">ID Verification</h3>

            <div className='flex justify-between'>
              <div className='w-[49%]'>
                <label className="block text-sm font-medium mb-3">Card Name</label>
                <select
                  {...register("name", { required: isKycVerified ? false : "Card Name is required" })}
                  className="w-full px-4 py-3 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                  style={{ outline: "none" }}
                  required={!isKycVerified}
                  disabled={!canEditField("idVerification.name")}
                >
                  <option value="" disabled>Select Card</option>
                  {cardOptions.map((card) => (
                    <option value={card.id} key={card.id}>{card.name}</option>

                  ))}
                </select>
                <Reason field="idVerification.name" />
              </div>

              <div className='w-[49%]'>
                <label className="block text-sm font-medium mb-3">Card Number</label>
                <input
                  type="text"
                  name="number"
                  style={{ outline: "none", }}
                  className="border rounded-sm p-2 w-full"
                  {...register("number", { required: isKycVerified ? false : "Card number is required" })}
                  required={!isKycVerified}
                  disabled={!canEditField("idVerification.number")}
                />
                <Reason field="idVerification.number" />
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
                  {...register("expiryDate", { required: isKycVerified ? false : "Card expiration date is required" })}
                  required={!isKycVerified}
                  disabled={!canEditField("idVerification.expiryDate")}
                />
                <Reason field="idVerification.expiryDate" />
              </div>
            </div>

          </div>
          {isKycVerified && (
            <p className="mt-3 text-sm text-gray-500">
              Your registration and identity details are locked after verification. You can still update your business and contact information.
            </p>
          )}
        </div>

        <button type="submit" disabled={isLoading || reviewStatus === "pending"} className="bg-kudu-orange disabled:opacity-60 text-white py-2 px-6 rounded-lg md:min-w-[160px] w-full">
          {isLoading ? <PulseLoader color="#ffffff" size={5} /> : reviewStatus === "pending" ? "Awaiting review" : reviewStatus === "changes_requested" ? "Resubmit corrections" : Object.keys(kycData || {}).length ? "Update KYC" : "Submit KYC"}
        </button>
      </form>
    </div>
  );
}
